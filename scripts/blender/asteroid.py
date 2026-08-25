"""
Asteroid + rider — procedural generator and renderer.

Run headless:
    /Applications/Blender.app/Contents/MacOS/Blender --background \
        --python scripts/blender/asteroid.py -- --mode still

Everything here is generated from code, so the asset is reproducible: change a
constant, re-run, get a new render. Nothing is hand-modelled, and no .blend file
needs to be kept in the repo.

Art direction comes from sashreek_portfolio_theme.md — warm near-black, violet
primary, amber accent. Deliberately NOT chrome/Silver-Surfer: a cold specular
figure fights the warm charcoal the rest of the site sits on. Instead the rock
is warm basalt, the key light is amber (matching the gas giant's crescent in
SpaceField.tsx), and the rim is violet-pale (matching the nebulae and .bh-orbit).

The figure stands directly on the asteroid rather than on a separate board —
that is the literal "standing on it and flying" idea, and it reads as a more
distinctive silhouette than a surfboard would.

Output is RGBA with a real alpha channel. That matters: the browser side draws
this with canvas drawImage, where alpha is native. It avoids both the
mix-blend-mode cost and the Safari HEVC-alpha-video problem that forced the
black hole into its screen-blend-on-pure-black trick.
"""

import bpy
import bmesh
import math
import os
import random
import sys
from mathutils import Quaternion, Vector

# ── palette (sRGB hex from src/app/globals.css) ──────────────────────
AMBER_BRIGHT = "EF9F27"
VIOLET_PALE = "CECBF6"
VIOLET_SOFT = "7F77DD"
VIOLET_DIM = "3C3489"
CLOAK_FABRIC = "2A2550"
# NOTE: these are albedo, not the colour you want to SEE. sRGB #1E1D1C is
# ~1.4% reflectance in linear space — near-black, and no amount of light
# rescues it. Real rock sits around 0.05-0.15. The rendered result still
# reads dark because the lighting is directional; opacity on the web side
# does the final dimming.
RIDER_H = 0.92   # figure height, in asteroid-radius units

ROCK_DARK = "34322F"
ROCK_LIGHT = "6E6B66"


def srgb_to_linear(c):
    """Blender works in linear; CSS hex is sRGB. Converting matters — skipping
    it washes the amber out to a pale yellow that no longer matches the site."""
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def hex_rgb(h):
    h = h.lstrip("#")
    return tuple(srgb_to_linear(int(h[i:i + 2], 16) / 255.0) for i in (0, 2, 4))


def hex_rgba(h, a=1.0):
    return hex_rgb(h) + (a,)


# ── scene teardown ───────────────────────────────────────────────────
def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    for block in (bpy.data.meshes, bpy.data.materials, bpy.data.textures,
                  bpy.data.images, bpy.data.lights, bpy.data.cameras):
        for item in list(block):
            block.remove(item)


def set_input(node, names, value):
    """Principled BSDF socket names moved around in 4.x (Emission →
    Emission Color, Specular → Specular IOR Level). Try each in turn so this
    keeps working across versions instead of throwing KeyError."""
    if isinstance(names, str):
        names = [names]
    for n in names:
        if n in node.inputs:
            node.inputs[n].default_value = value
            return True
    return False


# ── asteroid ─────────────────────────────────────────────────────────
def displace_stack(obj, rng):
    """Three octaves of displacement: continent-scale lumps, then ridges, then
    surface grain. Applied as modifiers and baked down so the crater pass can
    work on real geometry."""
    spec = [
        ("CLOUDS", 1.45, 0.165),
        ("VORONOI", 0.55, 0.110),
        ("DISTORTED_NOISE", 0.28, 0.062),
        ("VORONOI", 0.13, 0.030),
        ("DISTORTED_NOISE", 0.07, 0.014),
        ("VORONOI", 0.035, 0.007),
    ]
    for i, (ttype, scale, strength) in enumerate(spec):
        tex = bpy.data.textures.new(f"ast_disp_{i}", type=ttype)
        for attr, val in (("noise_scale", scale), ("noise_depth", 3),
                          ("distortion", 1.6), ("nabla", 0.03)):
            if hasattr(tex, attr):
                try:
                    setattr(tex, attr, val)
                except Exception:
                    pass
        m = obj.modifiers.new(f"disp_{i}", "DISPLACE")
        m.texture = tex
        m.strength = strength
        m.mid_level = 0.5
        m.texture_coords = "LOCAL"

    bpy.context.view_layer.objects.active = obj
    for m in list(obj.modifiers):
        bpy.ops.object.modifier_apply(modifier=m.name)


def carve_craters(obj, rng, count=18):
    """Craters by direct vertex displacement rather than boolean difference.
    Booleans on a heavily displaced mesh are slow and can leave non-manifold
    junk; this is robust and gives control over the profile — a bowl plus a
    raised rim, which is the part that actually makes a crater read as one."""
    me = obj.data
    bm = bmesh.new()
    bm.from_mesh(me)

    craters = []
    for _ in range(count):
        d = Vector((rng.gauss(0, 1), rng.gauss(0, 1), rng.gauss(0, 1)))
        if d.length < 1e-6:
            continue
        d.normalize()
        ang_r = rng.uniform(0.09, 0.30)
        craters.append((d, ang_r, ang_r * rng.uniform(0.30, 0.52)))

    for v in bm.verts:
        n = v.co.normalized()
        offset = 0.0
        for d, ang_r, depth in craters:
            ang = n.angle(d)
            if ang >= ang_r:
                continue
            t = ang / ang_r                      # 0 at centre → 1 at edge
            bowl = -depth * (1.0 - t * t)        # smooth bowl, zero at rim
            rim = depth * 0.42 * math.exp(-(((t - 0.88) / 0.13) ** 2))
            offset += bowl + rim
        # Overlapping rims used to stack into spikes at the poles; clamping
        # the summed offset keeps the surface reading as rock.
        offset = max(-0.22, min(0.09, offset))
        if offset:
            v.co += n * offset

    bm.to_mesh(me)
    bm.free()
    me.update()


def rock_material():
    """Layered PBR rock.

    The single-noise version read as a toy: one flat colour, one roughness, no
    sense of depth in the surface. Three things fix that, and they are the same
    three any production rock shader uses.

      pointiness — Cycles' per-vertex convexity. Crevices go dark and dusty,
                   exposed edges go light and polished. This is the single
                   biggest realism win available and it costs nothing.
      AO         — contact darkening inside craters, so they read as holes
                   rather than as painted circles.
      roughness  — varied, never constant. A uniform roughness is the clearest
                   tell that a surface is CG.
    """
    mat = bpy.data.materials.new("Asteroid")
    mat.use_nodes = True
    nt = mat.node_tree
    nt.nodes.clear()

    out = nt.nodes.new("ShaderNodeOutputMaterial")
    bsdf = nt.nodes.new("ShaderNodeBsdfPrincipled")
    coord = nt.nodes.new("ShaderNodeTexCoord")
    geom = nt.nodes.new("ShaderNodeNewGeometry")

    # ── broad colour variation: two rock types blended by a large noise
    macro = nt.nodes.new("ShaderNodeTexNoise")
    macro.inputs["Scale"].default_value = 2.6
    macro.inputs["Detail"].default_value = 12.0
    macro.inputs["Roughness"].default_value = 0.62
    macro_ramp = nt.nodes.new("ShaderNodeValToRGB")
    macro_ramp.color_ramp.elements[0].position = 0.36
    macro_ramp.color_ramp.elements[0].color = hex_rgba(ROCK_DARK)
    macro_ramp.color_ramp.elements[1].position = 0.66
    macro_ramp.color_ramp.elements[1].color = hex_rgba(ROCK_LIGHT)

    # ── pointiness: dust settles in the crevices, edges get scoured clean
    point_ramp = nt.nodes.new("ShaderNodeValToRGB")
    point_ramp.color_ramp.interpolation = "EASE"
    point_ramp.color_ramp.elements[0].position = 0.42
    point_ramp.color_ramp.elements[0].color = (0.30, 0.30, 0.30, 1.0)
    point_ramp.color_ramp.elements[1].position = 0.58
    point_ramp.color_ramp.elements[1].color = (1.45, 1.45, 1.45, 1.0)
    point_mix = nt.nodes.new("ShaderNodeMix")
    point_mix.data_type = "RGBA"
    point_mix.blend_type = "MULTIPLY"
    point_mix.inputs["Factor"].default_value = 0.85

    # ── ambient occlusion: contact shade inside the craters
    ao = nt.nodes.new("ShaderNodeAmbientOcclusion")
    ao.samples = 12
    ao.inputs["Distance"].default_value = 0.22
    ao_mix = nt.nodes.new("ShaderNodeMix")
    ao_mix.data_type = "RGBA"
    ao_mix.blend_type = "MULTIPLY"
    ao_mix.inputs["Factor"].default_value = 0.55

    # ── roughness variation — constant roughness is the CG giveaway
    rough_n = nt.nodes.new("ShaderNodeTexNoise")
    rough_n.inputs["Scale"].default_value = 14.0
    rough_n.inputs["Detail"].default_value = 8.0
    rough_ramp = nt.nodes.new("ShaderNodeValToRGB")
    rough_ramp.color_ramp.elements[0].position = 0.30
    rough_ramp.color_ramp.elements[0].color = (0.62, 0.62, 0.62, 1.0)
    rough_ramp.color_ramp.elements[1].position = 0.75
    rough_ramp.color_ramp.elements[1].color = (0.97, 0.97, 0.97, 1.0)

    # ── two bump octaves: coarse grit over fine dust
    grit = nt.nodes.new("ShaderNodeTexNoise")
    grit.inputs["Scale"].default_value = 26.0
    grit.inputs["Detail"].default_value = 10.0
    bump1 = nt.nodes.new("ShaderNodeBump")
    bump1.inputs["Strength"].default_value = 0.42

    dust = nt.nodes.new("ShaderNodeTexNoise")
    dust.inputs["Scale"].default_value = 120.0
    dust.inputs["Detail"].default_value = 8.0
    bump2 = nt.nodes.new("ShaderNodeBump")
    bump2.inputs["Strength"].default_value = 0.18

    L = nt.links.new
    L(coord.outputs["Object"], macro.inputs["Vector"])
    L(coord.outputs["Object"], rough_n.inputs["Vector"])
    L(coord.outputs["Object"], grit.inputs["Vector"])
    L(coord.outputs["Object"], dust.inputs["Vector"])

    L(macro.outputs["Fac"], macro_ramp.inputs["Fac"])
    L(geom.outputs["Pointiness"], point_ramp.inputs["Fac"])
    L(macro_ramp.outputs["Color"], point_mix.inputs["A"])
    L(point_ramp.outputs["Color"], point_mix.inputs["B"])
    L(point_mix.outputs["Result"], ao_mix.inputs["A"])
    L(ao.outputs["Color"], ao_mix.inputs["B"])
    L(ao_mix.outputs["Result"], bsdf.inputs["Base Color"])

    L(rough_n.outputs["Fac"], rough_ramp.inputs["Fac"])
    L(rough_ramp.outputs["Color"], bsdf.inputs["Roughness"])

    L(grit.outputs["Fac"], bump1.inputs["Height"])
    L(dust.outputs["Fac"], bump2.inputs["Height"])
    L(bump1.outputs["Normal"], bump2.inputs["Normal"])   # chain: coarse → fine
    L(bump2.outputs["Normal"], bsdf.inputs["Normal"])

    L(bsdf.outputs["BSDF"], out.inputs["Surface"])
    set_input(bsdf, "Metallic", 0.0)
    set_input(bsdf, ["Specular IOR Level", "Specular"], 0.32)
    return mat


def build_asteroid(rng):
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=7, radius=1.0)
    ast = bpy.context.active_object
    ast.name = "Asteroid"

    # Irregular before displacement — a displaced sphere still reads as a
    # sphere, and asteroids this size are not round.
    ast.scale = (1.0, rng.uniform(0.78, 0.9), rng.uniform(0.68, 0.82))
    bpy.ops.object.transform_apply(scale=True)

    displace_stack(ast, rng)
    carve_craters(ast, rng)

    ast.data.materials.append(rock_material())
    bpy.ops.object.shade_smooth()
    return ast


# ── rider ────────────────────────────────────────────────────────────
def rider_material():
    mat = bpy.data.materials.new("Rider")
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    set_input(bsdf, "Base Color", hex_rgba("A9A2E4"))
    # Not full chrome: at 0.95 metallic the figure went black against an empty
    # world, and a mirror finish fights the warm charcoal the site sits on.
    # Part-metal keeps a silvery read while still responding to the key light.
    set_input(bsdf, "Metallic", 0.45)
    set_input(bsdf, "Roughness", 0.34)
    # A low emission floor guarantees the silhouette stays legible even where
    # neither light reaches. At ambient scale on a #0E0E0C page the figure
    # would otherwise dissolve into the rock on the shadow side.
    set_input(bsdf, ["Emission Color", "Emission"], hex_rgba(VIOLET_PALE))
    set_input(bsdf, "Emission Strength", 0.22)
    return mat


def cloak_material():
    mat = bpy.data.materials.new("Cloak")
    mat.use_nodes = True
    nt = mat.node_tree
    bsdf = nt.nodes["Principled BSDF"]
    set_input(bsdf, "Base Color", hex_rgba(CLOAK_FABRIC))
    set_input(bsdf, "Metallic", 0.0)
    set_input(bsdf, "Roughness", 0.68)
    # Sheen is what makes cloth read as cloth rather than painted plastic — it
    # lifts the grazing angles where folds turn away from camera.
    set_input(bsdf, ["Sheen Weight", "Sheen"], 0.7)
    set_input(bsdf, "Sheen Tint", hex_rgba(VIOLET_PALE))

    # Fine weave bump. At ambient scale this is invisible; in the close-up it
    # is the difference between fabric and vinyl.
    coord = nt.nodes.new("ShaderNodeTexCoord")
    weave = nt.nodes.new("ShaderNodeTexNoise")
    weave.inputs["Scale"].default_value = 140.0
    weave.inputs["Detail"].default_value = 4.0
    bump = nt.nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.14
    nt.links.new(coord.outputs["Object"], weave.inputs["Vector"])
    nt.links.new(weave.outputs["Fac"], bump.inputs["Height"])
    nt.links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])
    return mat


def _mesh_from_rings(name, rings, mat, closed, cap_last=False, thickness=0.0):
    """Skin a list of vertex rings into a surface.

    `closed` wraps the last column back to the first (a tube); leaving it open
    gives a sheet, which is what a cape is. `cap_last` fills the final ring with
    an n-gon so a tube is not hollow when seen from below.
    """
    bm = bmesh.new()
    vs = [[bm.verts.new(p) for p in ring] for ring in rings]
    ncol = len(rings[0])
    for i in range(len(rings) - 1):
        span = ncol if closed else ncol - 1
        for j in range(span):
            k = (j + 1) % ncol
            bm.faces.new([vs[i][j], vs[i][k], vs[i + 1][k], vs[i + 1][j]])
    if cap_last:
        bm.faces.new(vs[-1][::-1])
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(ob)
    bpy.context.view_layer.objects.active = ob
    ob.select_set(True)
    if thickness:
        sd = ob.modifiers.new("Solidify", "SOLIDIFY")
        sd.thickness = thickness
    sub = ob.modifiers.new("Subsurf", "SUBSURF")
    sub.levels = sub.render_levels = 1
    ob.data.materials.append(mat)
    bpy.ops.object.shade_smooth()
    return ob


def build_cape(mat, H):
    """A cape streaming off the shoulders — an open sheet, not a tube.

    Three earlier attempts failed differently and all three lessons are here.
    The cloth solver either exploded into shreds (gravity off, wind unopposed)
    or, stiffened enough to survive, collapsed into a rigid shard — and it was
    non-deterministic, which is wrong for an asset that must re-render
    identically. Then a closed tube of cloth looked like a cocoon and the camera
    stared straight up its hollow hem.

    So: a partial arc wrapping the back and sides, open at the front, swept
    along a centreline that bends past horizontal fast — the cape is streaming
    back within the first third of its length, which is what reads as speed.
    Folds are two summed harmonics growing toward the hem.
    """
    RAD, VSEG = 34, 30
    TH0, TH1 = -0.18 * math.pi, 1.18 * math.pi   # open at the front
    z_top, length = 0.80 * H, 1.30 * H

    centre, cy, cz = [], 0.0, z_top
    for i in range(VSEG + 1):
        t = i / VSEG
        centre.append((t, cy, cz))
        # exponent below 1 bends it back EARLY; at t**1.15 the cape mostly hung
        # straight down and read as a long dress.
        ang = (math.pi * 0.60) * (t ** 0.55)
        step = length / VSEG
        cy -= math.sin(ang) * step
        cz -= math.cos(ang) * step

    rings = []
    for t, ccy, ccz in centre:
        ang = (math.pi * 0.60) * (t ** 0.55)
        py, pz = -math.cos(ang), math.sin(ang)
        base_r = H * (0.165 + 0.190 * t ** 1.35)
        ring = []
        for j in range(RAD):
            th = TH0 + (TH1 - TH0) * j / (RAD - 1)
            folds = (math.sin(th * 7 + t * 2.4) * H * 0.026 * t ** 1.05
                     + math.sin(th * 15 - t * 3.6) * H * 0.011 * t ** 1.35)
            r = base_r + folds
            c, sn = math.cos(th), math.sin(th)
            hem = math.sin(th * 5 + 1.1) * H * 0.045 * t ** 2.4
            ring.append((c * r,
                         ccy + sn * r * py - hem * 0.35,
                         ccz + sn * r * pz + hem))
        rings.append(ring)

    return _mesh_from_rings("Cape", rings, mat, closed=False, thickness=H * 0.008)


def build_tunic(mat, H, lean_fn):
    """Short closed robe over the torso and hips, ending mid-thigh.

    This is the part that answers "where are the clothes" — the cape reads from
    behind, but from the front the figure needs something on it. Capped at the
    hem so the low camera does not look up into a hollow shell.
    """
    RAD, VSEG = 32, 16
    rings = []
    for i in range(VSEG + 1):
        t = i / VSEG
        z = 0.79 - (0.79 - 0.30) * t                    # shoulders → mid-thigh
        # chest → nipped waist → flare over the hips
        r = 0.118 - 0.026 * math.sin(math.pi * min(t / 0.45, 1.0)) + 0.052 * t ** 1.8
        ring = []
        for j in range(RAD):
            th = 2 * math.pi * j / RAD
            fold = math.sin(th * 11 + t * 1.6) * 0.008 * (0.35 + t)
            rr = r + fold
            x, y = math.cos(th) * rr, math.sin(th) * rr * 0.70
            ring.append(lean_fn(x, y, z))
        rings.append(ring)
    return _mesh_from_rings("Tunic", rings, mat, closed=True, cap_last=True,
                            thickness=H * 0.007)


def build_hood(mat, H, L):
    """Cowl over the head. At ambient scale a hood tells you more about who
    this is than any amount of facial geometry could."""
    bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=16,
                                         radius=H * 0.105, location=L(0, 0.03, 0.945))
    hood = bpy.context.active_object
    hood.name = "Hood"
    hood.scale = (1.08, 1.42, 1.20)
    hood.data.materials.append(mat)
    bpy.ops.object.shade_smooth()
    return hood


def _limb(name, start, end, r0, r1, mat):
    """One tapered cone between two points — the building block for arms and
    legs. Segments share endpoints so the voxel remesh can union them."""
    start, end = Vector(start), Vector(end)
    vec = end - start
    bpy.ops.mesh.primitive_cone_add(
        vertices=16, radius1=r0, radius2=r1, depth=vec.length,
        location=(start + end) / 2.0,
    )
    ob = bpy.context.active_object
    ob.name = name
    ob.rotation_mode = "QUATERNION"
    ob.rotation_quaternion = vec.to_track_quat("Z", "Y")
    ob.data.materials.append(mat)
    bpy.ops.object.shade_smooth()
    return ob


def build_rider(mat, cloak_mat, height=RIDER_H):
    """Figure on human proportions — ~7.5 heads tall, shoulders at 0.80H, hips
    at 0.47H — with a robe over the top.

    Two earlier passes failed here and both lessons are baked in. A sphere
    torso with a head a third its height read as an insect, so the proportions
    are now real. And Catmull-Clark subdivision shrank each disconnected
    primitive toward its own centre, detaching the limbs into floating pills —
    so the parts are unioned with a voxel remesh instead.

    Legs stay planted and only the upper body leans; a whole-body lean lifted
    the feet off the rock.
    """
    H = height
    lean = math.radians(15)
    cl, sl = math.cos(lean), math.sin(lean)
    HIP_Z = 0.46

    def P(x, y, z):
        """Planted — legs and feet, no lean."""
        return (x * H, y * H, z * H)

    def L(x, y, z):
        """Leaned forward about the hip pivot — torso, head, arms."""
        x, y, z = x * H, y * H, z * H
        dz = z - HIP_Z * H
        return (x, y * cl - dz * sl, HIP_Z * H + y * sl + dz * cl)

    parts = []

    # ── legs: hip → knee → foot, wide stance, front leg forward
    parts.append(_limb("thigh_f", P(0.085, 0.02, 0.46), P(0.14, 0.20, 0.25), H*0.062, H*0.048, mat))
    parts.append(_limb("shin_f",  P(0.14, 0.20, 0.25), P(0.18, 0.32, 0.03), H*0.048, H*0.030, mat))
    parts.append(_limb("thigh_b", P(-0.085, -0.02, 0.46), P(-0.15, -0.16, 0.24), H*0.062, H*0.048, mat))
    parts.append(_limb("shin_b",  P(-0.15, -0.16, 0.24), P(-0.19, -0.26, 0.03), H*0.048, H*0.030, mat))

    # boots — stops the legs ending in points
    for nm, pos, rot in (("boot_f", P(0.18, 0.33, 0.022), 0.35),
                         ("boot_b", P(-0.19, -0.27, 0.022), -0.28)):
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=pos)
        ft = bpy.context.active_object
        ft.name = nm
        ft.scale = (H * 0.058, H * 0.092, H * 0.026)
        ft.rotation_euler = (0, 0, rot)
        ft.data.materials.append(mat)
        parts.append(ft)

    # ── torso, widening to the shoulders, flattened front-to-back
    torso = _limb("torso", L(0, 0, 0.46), L(0, 0.05, 0.80), H * 0.095, H * 0.112, mat)
    torso.scale = (1.0, 0.66, 1.0)
    parts.append(torso)
    parts.append(_limb("neck", L(0, 0.055, 0.78), L(0, 0.075, 0.88), H*0.036, H*0.033, mat))

    bpy.ops.mesh.primitive_uv_sphere_add(segments=20, ring_count=14, radius=H * 0.068,
                                         location=L(0, 0.085, 0.935))
    head = bpy.context.active_object
    head.name = "head"
    head.scale = (0.92, 1.0, 1.12)
    head.data.materials.append(mat)
    bpy.ops.object.shade_smooth()
    parts.append(head)

    # ── arms: one thrown forward, one trailing. Asymmetry reads as motion.
    parts.append(_limb("uarm_f", L(0.085, 0.05, 0.78), L(0.26, 0.19, 0.73), H*0.048, H*0.036, mat))
    parts.append(_limb("farm_f", L(0.26, 0.19, 0.73), L(0.35, 0.33, 0.80), H*0.036, H*0.025, mat))
    parts.append(_limb("uarm_b", L(-0.085, 0.04, 0.78), L(-0.25, -0.09, 0.71), H*0.048, H*0.036, mat))
    parts.append(_limb("farm_b", L(-0.25, -0.09, 0.71), L(-0.31, -0.20, 0.63), H*0.036, H*0.025, mat))

    for p in parts:
        p.select_set(True)
    bpy.context.view_layer.objects.active = parts[0]
    bpy.ops.object.join()
    rider = bpy.context.active_object
    rider.name = "Body"

    rm = rider.modifiers.new("Remesh", "REMESH")
    rm.mode = "VOXEL"
    rm.voxel_size = H * 0.011
    rm.use_smooth_shade = True
    bpy.ops.object.modifier_apply(modifier="Remesh")
    sm = rider.modifiers.new("Smooth", "SMOOTH")
    sm.factor = 0.5
    sm.iterations = 8
    bpy.ops.object.modifier_apply(modifier="Smooth")
    bpy.ops.object.shade_smooth()

    # clothing goes on last, over the top
    cape = build_cape(cloak_mat, H)
    tunic = build_tunic(cloak_mat, H, L)
    hood = build_hood(cloak_mat, H, L)
    for ob in (rider, cape, tunic, hood):
        ob.select_set(True)
    bpy.context.view_layer.objects.active = rider
    bpy.ops.object.join()
    rider = bpy.context.active_object
    rider.name = "Rider"

    # Turn to face the camera. Everything above is built travelling toward +Y,
    # but both cameras sit at -Y, so without this every render is of the
    # figure's back — looking straight up the open hem of the robe.
    rider.rotation_euler = (0, 0, math.pi)
    bpy.ops.object.transform_apply(rotation=True)

    print(f"[asteroid] rider verts = {len(rider.data.vertices)}")
    return rider


def place_rider(rider, asteroid, rng, spin_deg=-38.0):
    """Stand the rider on the rock's apparent top, upright.

    Deliberately NOT using the surface normal from the raycast: on a cratered
    mesh the local face normal points wherever that particular crater wall
    happens to face, which tipped the figure flat onto its back. The radial
    direction is smooth and always sensible, so the figure reads as standing on
    the asteroid as a whole rather than on one lump of it.
    """
    d = Vector((0.05, -0.32, 0.95)).normalized()
    hit, loc, _nor, _idx = asteroid.ray_cast(d * 3.0, -d)
    if not hit:
        loc = d.copy()

    rider.rotation_mode = "QUATERNION"
    # spin about the up axis so we get a three-quarter view rather than a
    # dead-on back or front
    rider.rotation_quaternion = (
        Quaternion(d, math.radians(spin_deg)) @ d.to_track_quat("Z", "Y")
    )
    rider.location = loc - d * (0.04 * RIDER_H)   # settle the boots into the rock
    return rider


def add_light(name, kind, loc, color, energy, size=3.0):
    bpy.ops.object.light_add(type=kind, location=loc)
    ob = bpy.context.active_object
    ob.name = name
    ob.data.color = color
    ob.data.energy = energy
    if hasattr(ob.data, "size"):
        ob.data.size = size
    # aim at the origin
    ob.rotation_mode = "QUATERNION"
    ob.rotation_quaternion = (Vector((0, 0, 0)) - Vector(loc)).to_track_quat("-Z", "Y")
    return ob


def setup_world():
    """A metallic surface with nothing to reflect renders BLACK. The scene was
    factory-reset to empty, so there was no world at all — which is why the
    figure came out as a dark lump no matter how it was lit. film_transparent
    keeps this out of the alpha channel; it still lights and reflects."""
    world = bpy.data.worlds.new("Space")
    bpy.context.scene.world = world
    world.use_nodes = True
    bg = world.node_tree.nodes["Background"]
    bg.inputs[0].default_value = hex_rgba("262340")
    bg.inputs[1].default_value = 0.42


def setup_lighting():
    """Camera sits at -Y looking toward the origin, so "behind" is +Y. A light
    placed straight behind lights only the face we cannot see — the rim has to
    be behind AND off to the side so it grazes the limb that is actually
    visible. Getting that wrong is why the first pass had no violet in it."""
    # Key: amber, low and to the lower-right — the same direction SpaceField's
    # gas giant is lit from, so the two objects agree about where the star is.
    # Kept deliberately dim: at 900 it flooded the rock and the whole thing
    # read as an orange blob rather than dark stone catching warm light.
    add_light("key", "AREA", (4.6, -2.6, -1.2), hex_rgb(AMBER_BRIGHT), 185, size=5.5)
    # Rim: violet-pale, hard, behind and to the LEFT so it grazes the upper-left
    # limb — the same limb the rider stands on. This is the light doing the real
    # work; it draws the edge that separates rock from sky.
    add_light("rim", "AREA", (-5.2, 3.2, 3.0), hex_rgb(VIOLET_PALE), 4400, size=1.4)
    # Second, tighter violet kicker aimed at the rider so the figure separates
    # from the rock behind it instead of merging into the same value.
    add_light("kick", "AREA", (-3.0, -1.4, 3.4), hex_rgb(VIOLET_PALE), 560, size=1.1)
    # Fill: very dim, keeps the shadow side from going to a dead hole.
    add_light("fill", "AREA", (-2.0, -3.4, 0.6), hex_rgb(VIOLET_SOFT), 55, size=8.0)


def setup_camera():
    # Slightly below the rock looking up — a level camera made the figure read
    # as standing on a lump; looking up gives it something to stand against.
    bpy.ops.object.camera_add(location=(0.55, -7.1, 0.10))
    cam = bpy.context.active_object
    cam.data.lens = 72
    cam.rotation_mode = "QUATERNION"
    cam.rotation_quaternion = (
        Vector((0, 0, 0.78)) - Vector(cam.location)
    ).to_track_quat("-Z", "Y")
    bpy.context.scene.camera = cam
    return cam


def frame_object(cam, objs, margin=1.3):
    """Point the camera at an object and back off far enough to fit it.
    Hand-placed preview cameras kept cropping the subject; deriving the
    distance from the bounding box removes the guesswork."""
    if not isinstance(objs, (list, tuple)):
        objs = [objs]
    bb = [o.matrix_world @ Vector(c) for o in objs for c in o.bound_box]
    ctr = Vector((sum(v[i] for v in bb) / len(bb) for i in range(3)))
    extent = max((max(v[i] for v in bb) - min(v[i] for v in bb)) for i in range(3))
    fov = 2.0 * math.atan(18.0 / cam.data.lens)
    dist = (extent * margin) / (2.0 * math.tan(fov / 2.0))
    direction = Vector((0.40, -1.0, 0.20)).normalized()
    cam.location = ctr + direction * dist
    cam.rotation_mode = "QUATERNION"
    cam.rotation_quaternion = (ctr - cam.location).to_track_quat("-Z", "Y")

    # Real optical depth of field. Everything rendering equally sharp from the
    # near limb to the far one is a strong "this is CG" cue; a shallow-ish
    # stop puts the far side of the rock slightly out of focus and immediately
    # reads as photographed rather than generated.
    cam.data.dof.use_dof = True
    cam.data.dof.focus_distance = dist * 0.94
    cam.data.dof.aperture_fstop = 3.4
    return cam


def setup_render(res, samples):
    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    sc.cycles.samples = samples
    sc.cycles.use_denoising = True
    sc.cycles.adaptive_threshold = 0.005
    sc.cycles.use_adaptive_sampling = True
    # More light bounces so crevices fill in instead of going flat black.
    sc.cycles.max_bounces = 12
    sc.cycles.diffuse_bounces = 6
    sc.cycles.glossy_bounces = 6
    sc.render.resolution_x = res
    sc.render.resolution_y = res
    sc.render.resolution_percentage = 100
    sc.render.film_transparent = True          # real alpha for canvas drawImage
    sc.render.image_settings.file_format = "PNG"
    sc.render.image_settings.color_mode = "RGBA"
    sc.render.image_settings.compression = 90

    # Filmic/AgX would desaturate the amber and violet away from the CSS
    # values. Standard keeps the rendered colour close to the palette.
    try:
        sc.view_settings.view_transform = "Standard"
    except Exception:
        pass

    # Prefer Metal GPU when it is available; fall back to CPU silently.
    try:
        prefs = bpy.context.preferences.addons["cycles"].preferences
        prefs.compute_device_type = "METAL"
        prefs.get_devices()
        for d in prefs.devices:
            d.use = True
        sc.cycles.device = "GPU"
    except Exception:
        sc.cycles.device = "CPU"
    print(f"[asteroid] cycles device = {sc.cycles.device}")


def setup_compositor():
    """Soft bloom over the bright rim — lens scatter, and the clearest single
    cue separating a finished render from a viewport grab.

    Blender 5.x replaced `scene.node_tree` with `scene.compositing_node_group`,
    dropped `CompositorNodeComposite` in favour of a group output, and turned
    the Glare node's settings from properties into input sockets. All of that
    is version-fragile, so the whole thing is best-effort: if any of it fails
    the render still goes ahead, just without the bloom.
    """
    sc = bpy.context.scene
    try:
        ng = bpy.data.node_groups.new("AsteroidComp", "CompositorNodeTree")
        ng.interface.new_socket("Image", in_out="OUTPUT",
                                socket_type="NodeSocketColor")
        rl = ng.nodes.new("CompositorNodeRLayers")
        rl.scene = sc
        glare = ng.nodes.new("CompositorNodeGlare")
        gout = ng.nodes.new("NodeGroupOutput")

        for sock, val in (("Type", "BLOOM"), ("Quality", "HIGH"),
                          ("Threshold", 0.72), ("Strength", 0.28),
                          ("Size", 0.55), ("Smoothness", 0.4)):
            if sock in glare.inputs:
                try:
                    glare.inputs[sock].default_value = val
                except (TypeError, ValueError):
                    pass

        ng.links.new(rl.outputs["Image"], glare.inputs["Image"])
        ng.links.new(glare.outputs["Image"], gout.inputs[0])
        sc.compositing_node_group = ng
        sc.use_nodes = True
        print("[asteroid] compositor: bloom enabled")
    except Exception as exc:
        print(f"[asteroid] compositor skipped ({exc})")


def render_to(path):
    bpy.context.scene.render.filepath = path
    bpy.ops.render.render(write_still=True)
    print(f"[asteroid] wrote {path}")


# ── entry ────────────────────────────────────────────────────────────
def parse_args():
    argv = sys.argv
    argv = argv[argv.index("--") + 1:] if "--" in argv else []
    opts = {"mode": "still", "res": 900, "samples": 420, "frames": 48,
            "seed": 7, "rh": RIDER_H, "out": "asteroid-still"}
    for i in range(0, len(argv) - 1, 2):
        k = argv[i].lstrip("-")
        if k not in opts:
            continue
        if k in ("mode", "out"):
            opts[k] = argv[i + 1]
        elif k == "rh":
            opts[k] = float(argv[i + 1])
        else:
            opts[k] = int(argv[i + 1])
    return opts


def main():
    opts = parse_args()
    rng = random.Random(opts["seed"])

    reset_scene()
    setup_world()
    setup_lighting()
    setup_render(opts["res"], opts["samples"])
    setup_compositor()

    rider = build_rider(rider_material(), cloak_material(), height=opts["rh"])
    print(f"[asteroid] rider dims = {tuple(round(v, 3) for v in rider.dimensions)}")

    out = os.path.join(os.getcwd(), "public", "asteroid")
    os.makedirs(out, exist_ok=True)

    cam = setup_camera()

    if opts["mode"] == "rider":
        # Figure alone, upright, camera fitted to it. Building the asteroid at
        # all here just gave the preview something to crop against.
        frame_object(cam, rider)
        render_to(os.path.join(out, "_rider-preview.png"))
        return

    ast = build_asteroid(rng)
    place_rider(rider, ast, rng)
    print(f"[asteroid] rock dims = {tuple(round(v, 3) for v in ast.dimensions)}")

    if opts["mode"] == "still":
        frame_object(cam, [ast, rider], margin=1.55)
        render_to(os.path.join(out, opts["out"] + ".png"))
    elif opts["mode"] == "sprite":
        # Rotate the pair together so the rider stays planted while the rock
        # turns under the camera.
        frames_dir = os.path.join(out, "_frames")
        os.makedirs(frames_dir, exist_ok=True)
        n = opts["frames"]
        pivot = bpy.data.objects.new("pivot", None)
        bpy.context.collection.objects.link(pivot)
        ast.parent = pivot
        rider.parent = pivot
        for i in range(n):
            pivot.rotation_euler = (0, 0, 2 * math.pi * i / n)
            render_to(os.path.join(frames_dir, f"f{i:03d}.png"))
    else:
        raise SystemExit(f"unknown mode {opts['mode']}")


if __name__ == "__main__":
    main()

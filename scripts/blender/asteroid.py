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
CLOAK_FABRIC = "1B1733"
# NOTE: these are albedo, not the colour you want to SEE. sRGB #1E1D1C is
# ~1.4% reflectance in linear space — near-black, and no amount of light
# rescues it. Real rock sits around 0.05-0.15. The rendered result still
# reads dark because the lighting is directional; opacity on the web side
# does the final dimming.
RIDER_H = 1.45   # figure height, in asteroid-radius units (rock is ~1.0)

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
    set_input(bsdf, ["Sheen Weight", "Sheen"], 0.35)
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
    z_top, length = 0.815 * H, 1.24 * H

    centre, cy, cz = [], 0.0, z_top
    for i in range(VSEG + 1):
        t = i / VSEG
        centre.append((t, cy, cz))
        # exponent below 1 bends it back EARLY; at t**1.15 the cape mostly hung
        # straight down and read as a long dress.
        ang = (math.pi * 0.62) * (t ** 0.82)
        step = length / VSEG
        cy += math.sin(ang) * step   # trails behind (+Y); the body faces -Y
        cz -= math.cos(ang) * step

    rings = []
    for t, ccy, ccz in centre:
        ang = (math.pi * 0.62) * (t ** 0.82)
        py, pz = math.cos(ang), math.sin(ang)
        base_r = H * (0.104 + 0.225 * t ** 1.25)
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


def build_coat(mat, H):
    """Long coat, open down the front, hanging straight from the shoulders.

    The previous garment was a closed tube from the waist, flaring to below the
    knee — which is a skirt, and on this figure it read as a frock. Two things
    make a coat instead: it is OPEN at the front, so the trousers and boots
    show through the gap and the eye reads legs rather than a hem; and it drops
    nearly straight instead of flaring, so the silhouette is a column, not a
    bell. The flare is reserved for the last fifth, at the hem.
    """
    RAD, VSEG = 42, 28
    TH0, TH1 = -0.30 * math.pi, 1.30 * math.pi     # opening centred on -Y

    rings = []
    for i in range(VSEG + 1):
        t = i / VSEG
        z = 0.80 - (0.80 - 0.30) * t               # shoulders → below the knee
        r = 0.190 + 0.052 * t ** 2.4               # column, not a bell
        ring = []
        for j in range(RAD):
            th = TH0 + (TH1 - TH0) * j / (RAD - 1)
            fold = (math.sin(th * 7 + t * 1.4) * 0.014 * (0.30 + t)
                    + math.sin(th * 13 - t * 2.3) * 0.006 * (0.25 + t))
            rr = r + fold
            hem = math.sin(th * 4 + 0.6) * 0.018 * t ** 3
            ring.append((math.cos(th) * rr * H,
                         math.sin(th) * rr * 0.80 * H,
                         (z + hem) * H))
        rings.append(ring)

    return _mesh_from_rings("Coat", rings, mat, closed=False, thickness=H * 0.007)


def build_hood(mat, H):
    """Open cowl around the back and sides of the head.

    The first version was a closed sphere scaled over the skull, which simply
    deleted the face — the whole point of using a sculpted head. This is a
    partial arc with the opening centred on -Y, which is the direction the base
    mesh faces, so the face stays visible and the hood frames it.
    """
    RAD, VSEG = 34, 20
    TH0, TH1 = -0.24 * math.pi, 1.24 * math.pi     # opening faces -Y

    rings = []
    for i in range(VSEG + 1):
        t = i / VSEG
        z = 1.005 - (1.005 - 0.882) * t             # crown → jawline
        # tight at the crown, out to head width, then flaring onto the shoulders
        r = (0.024
             + 0.064 * math.sin(math.pi * 0.5 * min(t / 0.45, 1.0))
             + 0.090 * max(0.0, (t - 0.45) / 0.55) ** 1.5)
        ring = []
        for j in range(RAD):
            th = TH0 + (TH1 - TH0) * j / (RAD - 1)
            fold = math.sin(th * 6 + t * 2.0) * 0.006 * (0.3 + t)
            rr = r + fold
            # a hood sits back off the brow rather than centred on the skull
            ring.append((math.cos(th) * rr * H,
                         (math.sin(th) * rr + 0.030) * H,
                         z * H))
        rings.append(ring)

    return _mesh_from_rings("Hood", rings, mat, closed=False, thickness=H * 0.007)


# ── real human figure ────────────────────────────────────────────────
# Blender Studio's Human Base Meshes bundle (CC0). Primitives fused with a
# voxel remesh got the silhouette right but never stopped reading as a toy —
# no anatomy, no hands, a featureless ball for a head.
#
# Fetch it with scripts/blender/fetch-human-base.sh (gitignored, ~48MB).
HUMAN_BLEND = os.path.join(os.getcwd(), "assets", "vendor",
                           "human_base_meshes_bundle.blend")
HUMAN_OBJECT = "GEO-body_male_realistic"
HUMAN_EYES = ("GEO-body_male_realistic.eye.L", "GEO-body_male_realistic.eye.R")
HUMAN_REST_H = 1.684        # measured height of the rest mesh, in metres
SKIN = "8A6247"          # warm mid-brown, from the supplied reference
HAIR = "140F0C"          # near-black, with a warm cast in the highlights

# Joint positions measured off the rest mesh: arms hang at the sides with the
# hands at z≈0.76, shoulders at z≈1.36. Rest-mesh metres, scaled at build time.
BONES = [
    # name,         head,                 tail,                  parent,        connect
    ("hips",        (0, 0, 0.90),         (0, 0, 1.02),          None,          False),
    ("spine",       (0, 0, 1.02),         (0, 0, 1.18),          "hips",        True),
    ("chest",       (0, 0, 1.18),         (0, 0, 1.36),          "spine",       True),
    ("neck",        (0, 0, 1.38),         (0, 0, 1.50),          "chest",       False),
    ("head",        (0, 0, 1.50),         (0, 0, 1.70),          "neck",        True),
    ("shoulder.L",  (0.02, 0, 1.36),      (0.16, 0, 1.36),       "chest",       False),
    ("upper_arm.L", (0.16, 0, 1.36),      (0.30, -0.02, 1.10),   "shoulder.L",  True),
    ("forearm.L",   (0.30, -0.02, 1.10),  (0.40, -0.05, 0.88),   "upper_arm.L", True),
    ("hand.L",      (0.40, -0.05, 0.88),  (0.44, -0.09, 0.78),   "forearm.L",   True),
    ("shoulder.R",  (-0.02, 0, 1.36),     (-0.16, 0, 1.36),      "chest",       False),
    ("upper_arm.R", (-0.16, 0, 1.36),     (-0.30, -0.02, 1.10),  "shoulder.R",  True),
    ("forearm.R",   (-0.30, -0.02, 1.10), (-0.40, -0.05, 0.88),  "upper_arm.R", True),
    ("hand.R",      (-0.40, -0.05, 0.88), (-0.44, -0.09, 0.78),  "forearm.R",   True),
    ("thigh.L",     (0.10, 0, 0.90),      (0.11, 0, 0.50),       "hips",        False),
    ("shin.L",      (0.11, 0, 0.50),      (0.12, 0, 0.09),       "thigh.L",     True),
    ("foot.L",      (0.12, 0, 0.09),      (0.13, -0.15, 0.01),   "shin.L",      True),
    ("thigh.R",     (-0.10, 0, 0.90),     (-0.11, 0, 0.50),      "hips",        False),
    ("shin.R",      (-0.11, 0, 0.50),     (-0.12, 0, 0.09),      "thigh.R",     True),
    ("foot.R",      (-0.12, 0, 0.09),     (-0.13, -0.15, 0.01),  "shin.R",      True),
]

# Standing tall, braced into the wind of travel. The cape supplies the motion,
# so the body does not need a violent pose to read as flying. Degrees, XYZ.
POSE = {
    "spine":       (-7, 0, 0),
    "chest":       (-5, 0, 0),
    "neck":        (5, 0, 0),
    "head":        (7, 0, -8),
    "shoulder.L":  (0, 0, -9),
    "shoulder.R":  (0, 0, 9),
    "upper_arm.L": (-16, 0, -34),
    "forearm.L":   (-26, 0, 0),
    "upper_arm.R": (-10, 0, 28),
    "forearm.R":   (-18, 0, 0),
    "thigh.L":     (-17, 0, 0),
    "shin.L":      (24, 0, 0),
    "thigh.R":     (13, 0, 0),
    "shin.R":      (9, 0, 0),
}


def skin_material():
    """Skin with subsurface scattering and pore-scale bump.

    Subsurface is the whole game on skin: without it flesh renders like painted
    plastic, because light stops travelling through it. The radius is weighted
    to red — that is why ears and nostrils glow warm when backlit.
    """
    mat = bpy.data.materials.new("Skin")
    mat.use_nodes = True
    nt = mat.node_tree
    bsdf = nt.nodes["Principled BSDF"]
    set_input(bsdf, "Base Color", hex_rgba(SKIN))
    set_input(bsdf, "Metallic", 0.0)
    set_input(bsdf, "Roughness", 0.48)
    set_input(bsdf, ["Subsurface Weight", "Subsurface"], 0.16)
    set_input(bsdf, "Subsurface Radius", (0.012, 0.0042, 0.0028))
    set_input(bsdf, "Subsurface Scale", 0.010)

    coord = nt.nodes.new("ShaderNodeTexCoord")
    pores = nt.nodes.new("ShaderNodeTexNoise")
    pores.inputs["Scale"].default_value = 320.0
    pores.inputs["Detail"].default_value = 6.0
    micro = nt.nodes.new("ShaderNodeBump")
    micro.inputs["Strength"].default_value = 0.09
    nt.links.new(coord.outputs["Object"], pores.inputs["Vector"])
    nt.links.new(pores.outputs["Fac"], micro.inputs["Height"])
    nt.links.new(micro.outputs["Normal"], bsdf.inputs["Normal"])
    return mat


def eye_material():
    """Sclera, iris and pupil from the eyeball's own object coordinates.

    The bundle ships each eye as a plain 546-vert sphere with no iris geometry
    and no UVs, so the eye is drawn in shader space: radial distance from the
    forward axis, through a ramp. A uniform dark ball reads as a doll.
    """
    mat = bpy.data.materials.new("Eye")
    mat.use_nodes = True
    nt = mat.node_tree
    bsdf = nt.nodes["Principled BSDF"]
    set_input(bsdf, "Roughness", 0.09)
    set_input(bsdf, ["Specular IOR Level", "Specular"], 0.7)
    set_input(bsdf, "IOR", 1.38)

    coord = nt.nodes.new("ShaderNodeTexCoord")
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    comb = nt.nodes.new("ShaderNodeCombineXYZ")   # drop Y: the eye looks along it
    length = nt.nodes.new("ShaderNodeVectorMath")
    length.operation = "LENGTH"
    norm = nt.nodes.new("ShaderNodeMath")
    norm.operation = "DIVIDE"
    norm.inputs[1].default_value = 0.014          # eyeball radius, local units

    ramp = nt.nodes.new("ShaderNodeValToRGB")
    cr = ramp.color_ramp
    cr.elements[0].position = 0.00
    cr.elements[0].color = (0.008, 0.008, 0.010, 1.0)          # pupil
    cr.elements[1].position = 0.30
    cr.elements[1].color = (0.008, 0.008, 0.010, 1.0)
    for pos, col in ((0.42, hex_rgba("2A1C12")),               # iris — dark brown
                     (0.62, hex_rgba("3E2A1A")),
                     (0.70, (0.05, 0.045, 0.04, 1.0)),         # limbal ring
                     (0.78, hex_rgba("D8D2C8")),               # sclera
                     (1.00, hex_rgba("CFC8BC"))):
        cr.elements.new(pos).color = col

    nt.links.new(coord.outputs["Object"], sep.inputs["Vector"])
    nt.links.new(sep.outputs["X"], comb.inputs["X"])
    nt.links.new(sep.outputs["Z"], comb.inputs["Z"])
    nt.links.new(comb.outputs["Vector"], length.inputs[0])
    nt.links.new(length.outputs["Value"], norm.inputs[0])
    nt.links.new(norm.outputs["Value"], ramp.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"], bsdf.inputs["Base Color"])
    return mat


def _shrink_to(ob, target, offset):
    """Conform a shell to the body surface at a fixed offset.

    Placing hair and eyebrows from measured fractions kept leaving them
    hovering off the face — the skull is not a sphere and the brow ridge is
    not where arithmetic says it is. Shrinkwrap asks the mesh instead.
    """
    bpy.ops.object.select_all(action="DESELECT")
    ob.select_set(True)
    bpy.context.view_layer.objects.active = ob
    m = ob.modifiers.new("Shrinkwrap", "SHRINKWRAP")
    m.target = target
    m.wrap_method = "NEAREST_SURFACEPOINT"
    m.offset = offset
    bpy.ops.object.modifier_apply(modifier=m.name)
    return ob


def head_sphere(body, H):
    """Measure the posed skull: centre and radius, from the mesh itself.

    Hair and hood were being placed from hand-guessed fractions of the figure
    height, which put the hair shell in the wrong spot entirely. The pose moves
    the head, so the only reliable source is the geometry after posing.
    """
    top = max((body.matrix_world @ v.co).z for v in body.data.vertices)
    head = [body.matrix_world @ v.co for v in body.data.vertices
            if (body.matrix_world @ v.co).z > top - 0.085 * H]
    n = len(head)
    ctr = Vector((sum(v.x for v in head) / n,
                  sum(v.y for v in head) / n,
                  sum(v.z for v in head) / n))
    # 70th percentile, not max: the jaw and ears are outliers that were
    # inflating the "skull radius" to nearly twice its real size.
    dists = sorted((v - ctr).length for v in head)
    radius = dists[int(len(dists) * 0.70)]
    print(f"[asteroid] skull centre {tuple(round(c, 3) for c in ctr)} r={radius:.3f}")
    return ctr, radius


def build_hair(H, body, ctr, radius):
    """Thick dark hair over the scalp.

    A bald head under a hood was the last thing making the figure read as a
    mannequin. The hairline is azimuth-dependent — high across the forehead,
    dropping down the back and sides — because a uniform cap looks like a
    swim hat. Surface noise breaks the shell into something with bulk.
    """
    mat = bpy.data.materials.new("Hair")
    mat.use_nodes = True
    nt = mat.node_tree
    bsdf = nt.nodes["Principled BSDF"]
    set_input(bsdf, "Base Color", hex_rgba(HAIR))
    set_input(bsdf, "Roughness", 0.58)
    set_input(bsdf, ["Sheen Weight", "Sheen"], 0.10)
    set_input(bsdf, ["Specular IOR Level", "Specular"], 0.22)
    coord = nt.nodes.new("ShaderNodeTexCoord")
    strand = nt.nodes.new("ShaderNodeTexNoise")
    strand.inputs["Scale"].default_value = 210.0
    strand.inputs["Detail"].default_value = 8.0
    bump = nt.nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.35
    nt.links.new(coord.outputs["Object"], strand.inputs["Vector"])
    nt.links.new(strand.outputs["Fac"], bump.inputs["Height"])
    nt.links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])

    RAD, VSEG = 40, 20
    cx, cy, cz = ctr.x, ctr.y, ctr.z
    base_r = radius * 1.02                     # shrinkwrap pulls it back in
    P_FRONT, P_BACK = 0.86, 1.24               # polar reach, forehead vs nape

    rings = []
    for i in range(VSEG, -1, -1):
        u = 0.07 + 0.93 * (i / VSEG)     # never reaches the degenerate pole
        ring = []
        for j in range(RAD):
            th = 2 * math.pi * j / RAD
            # -sin(th) is +1 toward the face, -1 toward the back of the head
            front = 0.5 + 0.5 * (-math.sin(th))
            # a hairline that is a perfect band reads as a swim cap; break it
            ragged = 0.055 * math.sin(th * 6 + 0.8) + 0.030 * math.sin(th * 13)
            p = u * (P_BACK - (P_BACK - P_FRONT) * front + ragged)
            bulk = (0.0060 * math.sin(th * 5 + p * 3.1)
                    + 0.0040 * math.sin(th * 11 - p * 4.7)
                    + 0.0028 * math.sin(th * 19 + p * 6.2)
                    + 0.0026 * math.sin(p * 7.0 + 1.3))
            r = base_r + bulk * H
            sp, cp = math.sin(p), math.cos(p)
            ring.append((cx + math.cos(th) * r * sp,
                         cy + math.sin(th) * r * sp,
                         cz + cp * r))
        rings.append(ring)

    hair = _mesh_from_rings("Hair", rings, mat, closed=True, cap_last=True,
                            thickness=H * 0.004)
    _shrink_to(hair, body, H * 0.006)

    # bulk goes on AFTER conforming, otherwise shrinkwrap flattens it away
    tex = bpy.data.textures.new("hair_bulk", type="CLOUDS")
    tex.noise_scale = 0.035
    d = hair.modifiers.new("Bulk", "DISPLACE")
    d.texture = tex
    d.strength = H * 0.007
    d.mid_level = 0.4
    bpy.context.view_layer.objects.active = hair
    bpy.ops.object.modifier_apply(modifier="Bulk")
    return hair


def fabric_material(name, colour, roughness=0.66, sheen=0.35, weave=150.0):
    """One fabric shader, parameterised. Sheen is what stops cloth reading as
    painted vinyl; the weave bump carries the rest at close range."""
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nt = mat.node_tree
    bsdf = nt.nodes["Principled BSDF"]
    set_input(bsdf, "Base Color", hex_rgba(colour))
    set_input(bsdf, "Metallic", 0.0)
    set_input(bsdf, "Roughness", roughness)
    set_input(bsdf, ["Sheen Weight", "Sheen"], sheen)
    set_input(bsdf, "Sheen Tint", hex_rgba(VIOLET_PALE))
    set_input(bsdf, ["Specular IOR Level", "Specular"], 0.32)

    coord = nt.nodes.new("ShaderNodeTexCoord")
    tex = nt.nodes.new("ShaderNodeTexNoise")
    tex.inputs["Scale"].default_value = weave
    tex.inputs["Detail"].default_value = 5.0
    bump = nt.nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.16
    nt.links.new(coord.outputs["Object"], tex.inputs["Vector"])
    nt.links.new(tex.outputs["Fac"], bump.inputs["Height"])
    nt.links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])
    return mat


def garment_from_groups(name, body, groups, H, swell, mat,
                        thickness=0.004, min_weight=0.30, relax=14, remesh=0.0):
    """Cut a garment out of a copy of the body's own geometry.

    Modelling clothing separately means guessing where the posed limbs ended
    up, and every guess so far has left something hovering off the body. The
    armature's automatic weights leave a vertex group per bone, and those
    survive the pose bake — so "the sleeve" is literally "the arm, kept, and
    pushed out along its normals". It fits by construction, in any pose.
    """
    bpy.ops.object.select_all(action="DESELECT")
    body.select_set(True)
    bpy.context.view_layer.objects.active = body
    bpy.ops.object.duplicate()
    g = bpy.context.active_object
    g.name = name

    idx = {g.vertex_groups[n].index for n in groups if n in g.vertex_groups}
    keep = set()
    for v in g.data.vertices:
        for ge in v.groups:
            if ge.group in idx and ge.weight >= min_weight:
                keep.add(v.index)
                break

    bm = bmesh.new()
    bm.from_mesh(g.data)
    bm.verts.ensure_lookup_table()
    doomed = [v for v in bm.verts if v.index not in keep]
    bmesh.ops.delete(bm, geom=doomed, context="VERTS")
    bm.to_mesh(g.data)
    bm.free()

    if not g.data.vertices:
        bpy.data.objects.remove(g, do_unlink=True)
        print(f"[asteroid] {name}: no vertices matched {groups}")
        return None

    # A textureless Displace offsets every vertex along its own normal —
    # "same shape, worn over the top".
    d = g.modifiers.new("Swell", "DISPLACE")
    d.mid_level = 0.0
    d.strength = H * swell
    bpy.context.view_layer.objects.active = g
    bpy.ops.object.modifier_apply(modifier="Swell")

    # Offsetting along normals alone copies the anatomy exactly — every ab and
    # pec came through and it read as a painted bodysuit. Smoothing alone did
    # not fix it: a relax pass preserves the surface it started from, so the
    # muscle definition survived 40 iterations. A voxel remesh resamples the
    # volume outright and simply cannot represent detail below its voxel size,
    # which is what finally turns anatomy into a garment.
    # Solidify FIRST when remeshing. A voxel remesh samples a volume, and the
    # garment at this point is an open shell far thinner than one voxel — the
    # first attempt voxelised it down to 20 vertices. Give it real thickness
    # (greater than the voxel size) and there is something left to resample.
    sd = g.modifiers.new("Solidify", "SOLIDIFY")
    sd.thickness = H * thickness
    bpy.ops.object.modifier_apply(modifier="Solidify")

    if remesh:
        rm = g.modifiers.new("Remesh", "REMESH")
        rm.mode = "VOXEL"
        rm.voxel_size = H * remesh
        rm.use_smooth_shade = True
        bpy.ops.object.modifier_apply(modifier="Remesh")

    if relax:
        sm = g.modifiers.new("Relax", "SMOOTH")
        sm.factor = 0.85
        sm.iterations = relax
        bpy.ops.object.modifier_apply(modifier="Relax")

    g.data.materials.clear()
    g.data.materials.append(mat)
    bpy.ops.object.shade_smooth()
    print(f"[asteroid] {name}: {len(g.data.vertices)} verts")
    return g


def build_belt(H, mat):
    """A waist band — the one piece that reads as tailoring rather than drape,
    and it breaks the torso/skirt boundary that otherwise looks like a seam."""
    RAD, VSEG = 40, 4
    rings = []
    for i in range(VSEG + 1):
        t = i / VSEG
        z = (0.575 - 0.042 * t) * H
        ring = []
        for j in range(RAD):
            th = 2 * math.pi * j / RAD
            r = (0.139 + 0.004 * math.sin(th * 9)) * H
            ring.append((math.cos(th) * r, math.sin(th) * r * 0.64, z))
        rings.append(ring)
    return _mesh_from_rings("Belt", rings, mat, closed=True, thickness=H * 0.005)


def build_brows(H, body, eye_locs):
    """Eyebrows, placed off the solved eye positions.

    A bare brow ridge is one of the loudest "this is a 3D model" tells — the
    face reads as a mannequin without them. Cheap geometry, large payoff.
    """
    mat = bpy.data.materials.new("Brow")
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    set_input(bsdf, "Base Color", hex_rgba(HAIR))
    set_input(bsdf, "Roughness", 0.74)

    brows = []
    for i, loc in enumerate(eye_locs):
        bpy.ops.mesh.primitive_uv_sphere_add(segments=18, ring_count=10, radius=1.0)
        b = bpy.context.active_object
        b.name = f"brow_{i}"
        b.scale = (H * 0.019, H * 0.0062, H * 0.0040)
        # up from the eye and a touch forward, angled out toward the temple
        b.location = (loc.x * 1.04, loc.y - H * 0.0035, loc.z + H * 0.0125)
        b.rotation_euler = (math.radians(6), 0, math.radians(-11 if loc.x > 0 else 11))
        b.data.materials.append(mat)
        bpy.ops.object.shade_smooth()
        _shrink_to(b, body, H * 0.0016)
        brows.append(b)
    return brows


def import_human(height):
    """Load the CC0 body plus its eyeballs, at full sculpted detail."""
    if not os.path.exists(HUMAN_BLEND):
        raise SystemExit(
            f"[asteroid] missing {HUMAN_BLEND}\n"
            "  run scripts/blender/fetch-human-base.sh first"
        )
    want = (HUMAN_OBJECT,) + HUMAN_EYES
    with bpy.data.libraries.load(HUMAN_BLEND, link=False) as (src, dst):
        missing = [n for n in want if n not in src.objects]
        if missing:
            raise SystemExit(f"[asteroid] not in bundle: {missing}")
        dst.objects = list(want)

    body, eyes = None, []
    for o in dst.objects:
        bpy.context.collection.objects.link(o)
        if o.name == HUMAN_OBJECT:
            body = o
        else:
            eyes.append(o)

    # The bundle's multires carries the sculpt. Rendering it at level 1 — which
    # earlier passes did — throws away most of the face.
    for m in body.modifiers:
        if m.type == "MULTIRES":
            top = getattr(m, "total_levels", 0)
            m.levels = m.sculpt_levels = top
            m.render_levels = top
            print(f"[asteroid] multires level {top}")

    body.data.materials.clear()
    body.data.materials.append(skin_material())

    # Bake each eye's parent-relative placement, then fold them into the body so
    # one mesh rigs, poses and joins as a unit.
    emat = eye_material()
    # view_layer.update() on both sides is load-bearing: matrix_world is lazily
    # evaluated, so reading it before the depsgraph has run returns a stale
    # identity and both eyes end up at the origin.
    bpy.context.view_layer.update()
    for e in eyes:
        e.data.materials.clear()
        e.data.materials.append(emat)
        mw = e.matrix_world.copy()
        e.parent = None
        e.matrix_world = mw
    bpy.context.view_layer.update()

    # The bundle parks the body at x=-2.2643. Moving it to the origin without
    # carrying the eyes with it strands them ~2.3 units away from the head, so
    # every eye offset is taken relative to the body's original position.
    k = height / HUMAN_REST_H
    off = body.location.copy()
    for e in eyes:
        e.location = (e.location - off) * k
        e.scale = (k, k, k)
        bpy.ops.object.select_all(action="DESELECT")
        e.select_set(True)
        bpy.context.view_layer.objects.active = e
        # Scale applied, location NOT: each eyeball keeps its own origin so its
        # object space stays centred on the eye, which is what draws the iris.
        bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)

    body.location = (0, 0, 0)
    body.scale = (k, k, k)
    bpy.ops.object.select_all(action="DESELECT")
    body.select_set(True)
    bpy.context.view_layer.objects.active = body
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

    for e in eyes:
        print(f"[asteroid] {e.name} at {tuple(round(v, 3) for v in e.location)}")
    return body, eyes


def rig_and_pose(body, eyes, height):
    """Build an armature, bind with automatic weights, pose it, then bake the
    result into the mesh so downstream code sees a plain posed object."""
    k = height / HUMAN_REST_H
    bpy.ops.object.armature_add(enter_editmode=False, location=(0, 0, 0))
    arm = bpy.context.active_object
    arm.name = "RiderRig"

    bpy.context.view_layer.objects.active = arm
    bpy.ops.object.mode_set(mode="EDIT")
    ebs = arm.data.edit_bones
    for b in list(ebs):
        ebs.remove(b)
    for name, head, tail, parent, connect in BONES:
        b = ebs.new(name)
        b.head = Vector(head) * k
        b.tail = Vector(tail) * k
        if parent:
            b.parent = ebs[parent]
            b.use_connect = connect
    bpy.ops.object.mode_set(mode="OBJECT")

    bpy.ops.object.select_all(action="DESELECT")
    body.select_set(True)
    for e in eyes:
        e.select_set(True)
    arm.select_set(True)
    bpy.context.view_layer.objects.active = arm
    bpy.ops.object.parent_set(type="ARMATURE_AUTO")

    bpy.context.view_layer.objects.active = arm
    bpy.ops.object.mode_set(mode="POSE")
    for name, (rx, ry, rz) in POSE.items():
        pb = arm.pose.bones.get(name)
        if not pb:
            continue
        pb.rotation_mode = "XYZ"
        pb.rotation_euler = (math.radians(rx), math.radians(ry), math.radians(rz))
    bpy.ops.object.mode_set(mode="OBJECT")

    # Bake the pose down and drop the rig — a plain mesh survives joining and
    # re-parenting without surprises.
    for o in [body] + eyes:
        bpy.ops.object.select_all(action="DESELECT")
        o.select_set(True)
        bpy.context.view_layer.objects.active = o
        for m in list(o.modifiers):
            try:
                bpy.ops.object.modifier_apply(modifier=m.name)
            except RuntimeError as exc:
                print(f"[asteroid] could not apply {m.name}: {exc}")
        o.parent = None
        bpy.ops.object.shade_smooth()
    bpy.data.objects.remove(arm, do_unlink=True)
    print(f"[asteroid] human verts = {len(body.data.vertices)}")
    return body


def build_rider(mat, cloak_mat, height=RIDER_H):
    """The figure: a sculpted CC0 human body, rigged, posed, and dressed.

    Everything before this was primitives — cones and spheres unioned with a
    voxel remesh. It got the silhouette right and never stopped looking like a
    toy, because a featureless ball has no face and a tapered cone has no hand.
    No amount of tuning fixes that; only real topology does.

    The clothing stays procedural. Swept geometry gives predictable, repeatable
    folds, which a cloth solver did not — and it sits over real anatomy now, so
    it drapes on something with shoulders.
    """
    H = height
    body, eyes = import_human(H)
    rig_and_pose(body, eyes, H)

    # The pose lifts the feet off local z=0, so the exact sole height has to be
    # measured from the BODY (not the joined object — the cape hem hangs lower
    # and would push the figure up off the rock).
    bpy.context.view_layer.update()
    foot_z = min((body.matrix_world @ v.co).z for v in body.data.vertices)

    brows = build_brows(H, body, [e.location.copy() for e in eyes])
    hair = build_hair(H, body, *head_sphere(body, H))

    # Garments cut from the body's own geometry, so they fit the pose exactly.
    cloth = fabric_material("Jacket", "23203A", roughness=0.70, sheen=0.35)
    leather = fabric_material("Leather", "15121C", roughness=0.46, sheen=0.10,
                              weave=90.0)
    worn = [
        garment_from_groups("Jacket", body,
                            ("chest", "spine", "hips", "shoulder.L", "shoulder.R"),
                            H, 0.015, cloth, thickness=0.020,
                            relax=6, remesh=0.012),
        garment_from_groups("Sleeves", body,
                            ("upper_arm.L", "upper_arm.R",
                             "forearm.L", "forearm.R"),
                            H, 0.008, cloth, relax=6),
        garment_from_groups("Trousers", body,
                            ("thigh.L", "thigh.R", "shin.L", "shin.R"),
                            H, 0.008, cloth, relax=6),
        garment_from_groups("Boots", body,
                            ("shin.L", "shin.R", "foot.L", "foot.R"),
                            H, 0.013, leather, thickness=0.022,
                            relax=6, remesh=0.011),
        build_belt(H, leather),
    ]
    worn = [w for w in worn if w]
    cape = build_cape(cloak_mat, H)

    bpy.ops.object.select_all(action="DESELECT")
    for ob in [body, cape, hair] + worn + brows:
        ob.select_set(True)
    bpy.context.view_layer.objects.active = body
    bpy.ops.object.join()
    rider = bpy.context.active_object
    rider.name = "Rider"

    # Eyes stay separate objects (see import_human) but must travel with the
    # figure, so parent them at the object level.
    for e in eyes:
        e.parent = rider
        e.matrix_parent_inverse = rider.matrix_world.inverted()

    print(f"[asteroid] vertex groups = {sorted(g.name for g in body.vertex_groups)}")
    rider["foot_z"] = foot_z
    print(f"[asteroid] rider verts = {len(rider.data.vertices)}  soles at z={foot_z:.4f}")
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
    # Plant the soles on the surface: a local point at z=foot_z maps to
    # location + d*foot_z once local Z is aligned to d.
    foot_z = rider.get("foot_z", 0.0)
    rider.location = loc - d * foot_z - d * (0.010 * RIDER_H)   # bite in slightly
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
    add_light("kick", "AREA", (-3.0, -1.4, 3.4), hex_rgb(VIOLET_PALE), 300, size=1.1)
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

        # The Type socket is a menu whose values are not enumerable from the
        # API here, so try the bloom-ish ones in order and report what stuck.
        # The default is a streak/ghost glare, which fired diffraction spikes
        # across the render.
        for cand in ("Bloom", "Fog Glow", "BLOOM", "FOG_GLOW"):
            try:
                glare.inputs["Type"].default_value = cand
                break
            except (TypeError, ValueError):
                continue
        for sock, val in (("Quality", "HIGH"), ("Threshold", 0.80),
                          ("Strength", 0.16), ("Size", 0.45),
                          ("Smoothness", 0.4)):
            if sock in glare.inputs:
                try:
                    glare.inputs[sock].default_value = val
                except (TypeError, ValueError):
                    pass

        # Glare returns opaque RGB, so routing it straight to the output threw
        # the alpha away and the asset came back on solid black — useless for
        # compositing onto the page. Put the render's own alpha back.
        setalpha = ng.nodes.new("CompositorNodeSetAlpha")
        ng.links.new(rl.outputs["Image"], glare.inputs["Image"])
        ng.links.new(glare.outputs["Image"], setalpha.inputs["Image"])
        ng.links.new(rl.outputs["Alpha"], setalpha.inputs["Alpha"])
        ng.links.new(setalpha.outputs["Image"], gout.inputs[0])
        print(f"[asteroid] glare type = {glare.inputs['Type'].default_value}")
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

    if opts["mode"] == "face":
        cam = bpy.context.scene.camera
        top = max((rider.matrix_world @ Vector(c)).z for c in rider.bound_box)
        head = Vector((0, 0, top - 0.075 * opts["rh"]))
        cam.location = head + Vector((0.34, -0.92, 0.10)).normalized() * (0.40 * opts["rh"])
        cam.rotation_mode = "QUATERNION"
        cam.rotation_quaternion = (head - cam.location).to_track_quat("-Z", "Y")
        cam.data.lens = 85
        cam.data.dof.focus_distance = (head - cam.location).length
        cam.data.dof.aperture_fstop = 2.2
        render_to(os.path.join(out, "_face-preview.png"))
        return

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

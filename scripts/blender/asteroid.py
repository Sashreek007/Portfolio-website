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

    # Apply them here. join() keeps only the active object's modifiers and
    # drops the rest without a word, so anything left unapplied vanishes the
    # moment this mesh is joined into the figure.
    bpy.context.view_layer.objects.active = ob
    for m in list(ob.modifiers):
        bpy.ops.object.modifier_apply(modifier=m.name)
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

# Optional face photo, front-projected onto the head for likeness. Drop a file
# here and it is picked up automatically; absent, the figure keeps the base
# mesh's own face and the render still works.
# Photo projection, OFF by default.
#
# It works — the projection lands square on the face and the eye sockets are
# masked out of it correctly. It still looks worse than not doing it. A single
# phone photo carries its own shading, its own noise and its own proportions,
# and painting that onto a skull it does not match produces artefacts rather
# than a likeness: the mouth fights the geometry underneath it and the whole
# face reads as printed-on. The sculpted face with his complexion matched to
# the reference is simply better.
#
# Kept because it is correct and someone may want it with a better source —
# flat even light, front-on, no shadow. Set FACE_PROJECT = True to enable.
FACE_PROJECT = False
FACE_PHOTO = os.path.join(os.getcwd(), "assets", "vendor", "face-reference.png")
FACE_W = 0.098          # projected width, in figure heights
# Where the eyes sit inside the cropped photo. CROP in prep-face.py runs
# 0.225..0.780 down the source and his eyes are at 0.44, so they land 38.7%
# down the crop — v = 0.613 counting up from the bottom. Anchoring on the eyes
# rather than the skull centroid is what keeps the mouth off the chin: eyes are
# a landmark the model and the photo genuinely share.
PHOTO_EYE_V = 0.613
FEATHER = 0.15          # fraction of the projection faded at its edges
EYE_HOLE = (0.085, 0.155)   # UV radius: fully cut, fully restored
# Facial-hair regions in projection UV: (centre_u, centre_v, radius_u,
# radius_v, density).
#
# Derived anatomically rather than from the photo. Thresholding the photo's
# luminance kept producing a thick horseshoe, because on a dark phone photo
# skin and hair values overlap badly once the lighting has been divided out —
# moustache 0.154 against cheek 0.272, with lips at 0.180 sitting between
# them, and saturation separating none of it. Explicit regions are boring and
# they work.
BEARD_REGIONS = (
    (0.500, 0.318, 0.112, 0.028, 0.85),   # moustache
    (0.500, 0.098, 0.072, 0.040, 0.45),   # chin patch
    (0.305, 0.160, 0.100, 0.062, 0.22),   # left jaw stubble
    (0.695, 0.160, 0.100, 0.062, 0.22),   # right jaw stubble
)
BEARD_TOP_V = 0.40      # nothing above this in the photo is facial hair
# Measured off the prepared texture rather than guessed: moustache 0.129,
# jaw 0.120, cheek 0.273, forehead 0.337. The first range (0.10, 0.42) sat
# above the skin values, so the whole lower face grew a beard. The texture
# averages 0.201 overall, which is why an "obviously dark" threshold was not.
BEARD_LUM = (0.06, 0.22)   # luminance mapped to full / no strand density
# Lips are as dark as the moustache (0.180 vs 0.154) and saturation does not
# separate them either — the flattened photo is uniformly warm, every region
# landing between 0.55 and 0.67. So the mouth is excluded by position: an
# ellipse in projection UV, centred on the lips.
LIP_UV = (0.50, 0.215)
LIP_R = (0.21, 0.052)
FACE_OFF_X = 0.0        # nudge the projection across the face
FACE_OFF_Z = 0.0        # ...and up or down it
FACE_H_ADJ = 0.85       # the head is shorter than the photo crop implies
FACE_MIX = 0.97         # how strongly the photo overrides the base skin
FACE_GAIN = 1.12        # the source is a low-light photo; lift it

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
    set_input(bsdf, ["Subsurface Weight", "Subsurface"], 0.155)
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
    # Generated coordinates run 0..1 across the object's own bounding box, so
    # the centre is 0.5 and the equator is 1.0 REGARDLESS of how the eyeball
    # was scaled. Dividing by a hardcoded radius (0.014) broke the moment the
    # figure was rescaled: the iris drifted off the visible aperture and the
    # eye read as all pupil or all sclera.
    centre = nt.nodes.new("ShaderNodeVectorMath")
    centre.operation = "SUBTRACT"
    centre.inputs[1].default_value = (0.5, 0.5, 0.5)
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    comb = nt.nodes.new("ShaderNodeCombineXYZ")   # drop Y: the eye looks along it
    length = nt.nodes.new("ShaderNodeVectorMath")
    length.operation = "LENGTH"
    norm = nt.nodes.new("ShaderNodeMath")
    norm.operation = "MULTIPLY"
    norm.inputs[1].default_value = 2.0            # 0 at centre, 1 at the equator

    ramp = nt.nodes.new("ShaderNodeValToRGB")
    cr = ramp.color_ramp
    cr.elements[0].position = 0.00
    cr.elements[0].color = (0.006, 0.006, 0.008, 1.0)          # pupil
    cr.elements[1].position = 0.15
    cr.elements[1].color = (0.006, 0.006, 0.008, 1.0)
    for pos, col in ((0.21, hex_rgba("2A1C12")),               # iris — dark brown
                     (0.40, hex_rgba("46301C")),
                     (0.49, hex_rgba("2E2014")),
                     (0.53, (0.030, 0.026, 0.024, 1.0)),       # limbal ring
                     (0.58, hex_rgba("D8D2C8")),               # sclera
                     (1.00, hex_rgba("C9C2B6"))):
        cr.elements.new(pos).color = col

    nt.links.new(coord.outputs["Generated"], centre.inputs[0])
    nt.links.new(centre.outputs["Vector"], sep.inputs["Vector"])
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


def _beard_weight(uu, vv, lum, iw, ih):
    """Density for one point: an anatomical region, darkened by the photo.

    Regions decide WHERE hair grows; the photo only modulates how thick it is
    within them, so a patch of shadow can no longer sprout a beard.
    """
    best = 0.0
    for cu, cv, ru, rv, dens in BEARD_REGIONS:
        du = (uu - cu) / ru
        dv = (vv - cv) / rv
        d2 = du * du + dv * dv
        if d2 < 1.0:
            best = max(best, dens * (1.0 - d2) ** 0.6)
    if best <= 0.0:
        return 0.0
    px = min(iw - 1, max(0, int(uu * iw)))
    py = min(ih - 1, max(0, int(vv * ih)))
    shade = (BEARD_LUM[1] - float(lum[py, px])) / (BEARD_LUM[1] - BEARD_LUM[0])
    shade = min(1.0, max(0.35, shade))     # floor, so regions never go bald
    return min(1.0, best * shade)


def build_facial_hair(body, H, proj, face_w, face_h, img):
    """Moustache and beard as real strands, grown where his actually are.

    Painting facial hair from the photo alone never worked: at render scale the
    photo's beard is a soft dark patch, so it read as a smudge rather than
    hair. The scalp got particle strands and looked right; the face got paint
    and did not. This closes that gap.

    Density comes from the photo itself. Each vertex of a shell cut from the
    lower face is projected into the photo, its luminance sampled, and the
    darkness written to a vertex group — so strands grow along his actual
    beard line instead of a shape I guessed at.
    """
    import numpy as np

    iw, ih = img.size
    buf = np.empty(iw * ih * 4, dtype=np.float32)
    img.pixels.foreach_get(buf)
    # Blender images are bottom-up, which matches v already
    pix = buf.reshape(ih, iw, 4)
    lum = pix[:, :, 0] * 0.299 + pix[:, :, 1] * 0.587 + pix[:, :, 2] * 0.114

    bpy.ops.object.select_all(action="DESELECT")
    body.select_set(True)
    bpy.context.view_layer.objects.active = body
    bpy.ops.object.duplicate()
    beard = bpy.context.active_object
    beard.name = "FacialHair"

    inv = proj.matrix_world.inverted()
    face_dir = Vector((proj.matrix_world.to_3x3() @ Vector((0, -1, 0)))).normalized()

    keep, weights = set(), {}
    for vert in beard.data.vertices:
        wp = beard.matrix_world @ vert.co
        nrm = (beard.matrix_world.to_3x3() @ vert.normal).normalized()
        if nrm.dot(face_dir) < 0.25:          # only the front of the face
            continue
        lp = inv @ wp
        uu = lp.x / face_w + 0.5 + FACE_OFF_X
        vv = lp.z / face_h + 0.5 + FACE_OFF_Z
        if not (0.12 < uu < 0.88 and 0.02 < vv < BEARD_TOP_V):
            continue
        lx = (uu - LIP_UV[0]) / LIP_R[0]
        ly = (vv - LIP_UV[1]) / LIP_R[1]
        if lx * lx + ly * ly < 1.0:        # inside the mouth
            continue
        w = _beard_weight(uu, vv, lum, iw, ih)
        if w > 0.02:
            keep.add(vert.index)
            weights[vert.index] = w

    if len(keep) < 40:
        print(f"[asteroid] facial hair: only {len(keep)} verts matched — skipped")
        bpy.data.objects.remove(beard, do_unlink=True)
        return None

    bm = bmesh.new()
    bm.from_mesh(beard.data)
    bm.verts.ensure_lookup_table()
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.index not in keep],
                     context="VERTS")
    bm.to_mesh(beard.data)
    bm.free()

    # the index map is rebuilt by the delete, so re-derive weights by position
    vg = beard.vertex_groups.new(name="beard_density")
    for vert in beard.data.vertices:
        wp = beard.matrix_world @ vert.co
        lp = inv @ wp
        uu = lp.x / face_w + 0.5 + FACE_OFF_X
        vv = lp.z / face_h + 0.5 + FACE_OFF_Z
        vg.add([vert.index], _beard_weight(uu, vv, lum, iw, ih), "REPLACE")

    mat = bpy.data.materials.new("BeardStrand")
    mat.use_nodes = True
    bnt = mat.node_tree
    bnt.nodes.clear()
    bout = bnt.nodes.new("ShaderNodeOutputMaterial")
    try:
        bb = bnt.nodes.new("ShaderNodeBsdfHairPrincipled")
        for nm, val in (("Melanin", 0.97), ("Melanin Redness", 0.22),
                        ("Roughness", 0.42), ("Radial Roughness", 0.34)):
            set_input(bb, nm, val)
    except RuntimeError:
        bb = bnt.nodes.new("ShaderNodeBsdfPrincipled")
        set_input(bb, "Base Color", hex_rgba(HAIR))
    bnt.links.new(bb.outputs[0], bout.inputs["Surface"])
    beard.data.materials.clear()
    beard.data.materials.append(mat)

    beard.modifiers.new("Stubble", "PARTICLE_SYSTEM")
    st = beard.particle_systems[-1].settings
    st.type = "HAIR"
    st.use_advanced_hair = True
    st.count = 6000
    st.hair_length = H * 0.0022          # stubble, not a beard you could braid
    st.hair_step = 3
    st.child_type = "INTERPOLATED"
    st.child_percent = 30
    st.rendered_child_count = 16
    st.child_length = 0.85
    st.clump_factor = 0.18
    st.roughness_1 = 0.006
    st.roughness_endpoint = 0.004
    st.use_hair_bspline = True
    st.radius_scale = 0.00055
    st.root_radius = 1.0
    st.tip_radius = 0.02
    beard.particle_systems[-1].vertex_group_density = "beard_density"
    print(f"[asteroid] facial hair: {len(beard.data.vertices)} emitter verts")
    return beard


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
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")

    # Principled Hair is a strand shader — it models the cuticle and the
    # medulla, so light travels along the fibre instead of bouncing off a
    # surface. A surface shader on hair geometry looks like moulded plastic.
    try:
        bsdf = nt.nodes.new("ShaderNodeBsdfHairPrincipled")
        for name, val in (("Melanin", 0.985), ("Melanin Redness", 0.10),
                          ("Roughness", 0.46), ("Radial Roughness", 0.38),
                          ("Random Color", 0.03), ("Random Roughness", 0.10)):
            set_input(bsdf, name, val)
    except RuntimeError:
        bsdf = nt.nodes.new("ShaderNodeBsdfPrincipled")
        set_input(bsdf, "Base Color", hex_rgba(HAIR))
        set_input(bsdf, "Roughness", 0.42)
    nt.links.new(bsdf.outputs[0], out.inputs["Surface"])

    RAD, VSEG = 44, 22
    cx, cy, cz = ctr.x, ctr.y, ctr.z
    # front azimuth, corrected for the yaw the pose applies to the head
    yaw = math.radians(POSE.get("head", (0, 0, 0))[2] + POSE.get("neck", (0, 0, 0))[2])
    phi = -math.pi / 2 + yaw
    base_r = radius * 1.38                     # must start OUTSIDE the skull
    P_FRONT, P_BACK = 0.70, 1.80               # polar reach, forehead vs nape

    rings = []
    for i in range(VSEG, -1, -1):
        u = 0.07 + 0.93 * (i / VSEG)     # never reaches the degenerate pole
        ring = []
        for j in range(RAD):
            th = 2 * math.pi * j / RAD
            # +1 toward the face, -1 toward the back of the head
            front = 0.5 + 0.5 * math.cos(th - phi)
            # a hairline that is a perfect band reads as a swim cap; break it
            ragged = 0.055 * math.sin(th * 6 + 0.8) + 0.030 * math.sin(th * 13)
            p = u * (P_BACK - (P_BACK - P_FRONT) * front ** 2.2 + ragged)
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
    _shrink_to(hair, body, H * 0.005)

    # bulk goes on AFTER conforming, otherwise shrinkwrap flattens it away
    tex = bpy.data.textures.new("hair_bulk", type="CLOUDS")
    tex.noise_scale = 0.035
    d = hair.modifiers.new("Bulk", "DISPLACE")
    d.texture = tex
    d.strength = H * 0.004
    d.mid_level = 0.4
    bpy.context.view_layer.objects.active = hair
    bpy.ops.object.modifier_apply(modifier="Bulk")

    # The shell alone is a helmet: noise on a surface is not hair, at any
    # amplitude. It stays as the undercoat so the scalp is not bald between
    # strands, and a particle system grows actual geometry off it — which is
    # the only thing that reads as hair under a hard rim light.
    # Two slots: the shell is a surface and needs a surface shader, while the
    # strands need the hair BSDF. Sharing one slot rendered the scalp with a
    # fibre shader, which is why gaps read as bare skin rather than dark hair.
    under = bpy.data.materials.new("HairUnder")
    under.use_nodes = True
    unt = under.node_tree
    ub = unt.nodes["Principled BSDF"]
    set_input(ub, "Base Color", hex_rgba("0F0A08"))
    set_input(ub, "Roughness", 0.52)
    set_input(ub, ["Specular IOR Level", "Specular"], 0.14)

    ucoord = unt.nodes.new("ShaderNodeTexCoord")
    umap = unt.nodes.new("ShaderNodeMapping")
    # squash the noise hard along one axis so it streaks: isotropic noise reads
    # as a moulded cap, streaked noise reads as strand direction
    umap.inputs["Scale"].default_value = (1.0, 1.0, 16.0)
    unoise = unt.nodes.new("ShaderNodeTexNoise")
    unoise.inputs["Scale"].default_value = 42.0
    unoise.inputs["Detail"].default_value = 9.0
    unoise.inputs["Roughness"].default_value = 0.75
    ubump = unt.nodes.new("ShaderNodeBump")
    ubump.inputs["Strength"].default_value = 0.62
    unt.links.new(ucoord.outputs["Object"], umap.inputs["Vector"])
    unt.links.new(umap.outputs["Vector"], unoise.inputs["Vector"])
    unt.links.new(unoise.outputs["Fac"], ubump.inputs["Height"])
    unt.links.new(ubump.outputs["Normal"], ub.inputs["Normal"])
    hair.data.materials.clear()
    hair.data.materials.append(under)
    hair.data.materials.append(mat)

    hair.modifiers.new("Strands", "PARTICLE_SYSTEM")
    st = hair.particle_systems[-1].settings
    st.type = "HAIR"
    st.use_advanced_hair = True
    st.count = 7200
    st.hair_length = H * 0.022
    st.hair_step = 5
    st.child_type = "INTERPOLATED"
    st.child_percent = 60
    st.rendered_child_count = 86
    st.child_length = 0.92
    st.child_length_threshold = 0.15
    st.clump_factor = 0.72          # strands gather into locks
    st.clump_shape = 0.42
    st.roughness_1 = 0.004          # per-strand kink
    st.roughness_1_size = 0.006
    st.roughness_endpoint = 0.003
    st.roughness_end_shape = 1.4
    st.use_hair_bspline = True
    # Straight radial strands read as a hedgehog. A shallow curl makes them
    # lie in locks against the scalp and matches the reference texture.
    st.kink = "CURL"
    st.kink_amplitude = H * 0.0016
    st.kink_frequency = 11.0
    st.kink_shape = 0.25
    st.radius_scale = 0.004
    st.root_radius = 0.9
    st.tip_radius = 0.05
    st.material = 2          # 1-based: slot 2 is the hair BSDF
    print(f"[asteroid] hair strands = {st.count} x {st.rendered_child_count} children")
    return hair


def _seam_mask(nt, coord, z_scale, x_scale, width=0.045):
    """Thin dark lines where panels meet, from two crossed wave textures.

    Panel seams are what separate a garment from a shrink-wrapped shell. They
    cost nothing in geometry: a wave texture gives evenly spaced bands, and a
    tight colour ramp turns the band edges into lines a few pixels wide.
    """
    outs = []
    for scale, direction in ((z_scale, "Z"), (x_scale, "X")):
        w = nt.nodes.new("ShaderNodeTexWave")
        w.wave_type = "BANDS"
        try:
            w.bands_direction = direction
        except (TypeError, ValueError):
            pass
        w.inputs["Scale"].default_value = scale
        w.inputs["Distortion"].default_value = 0.35
        w.inputs["Detail"].default_value = 2.0
        nt.links.new(coord.outputs["Object"], w.inputs["Vector"])

        ramp = nt.nodes.new("ShaderNodeValToRGB")
        cr = ramp.color_ramp
        cr.interpolation = "B_SPLINE"
        cr.elements[0].position = 0.5 - width
        cr.elements[0].color = (1, 1, 1, 1)
        cr.elements[1].position = 0.5
        cr.elements[1].color = (0, 0, 0, 1)
        e = cr.elements.new(0.5 + width)
        e.color = (1, 1, 1, 1)
        nt.links.new(w.outputs["Fac"], ramp.inputs["Fac"])
        outs.append(ramp)

    combine = nt.nodes.new("ShaderNodeMath")
    combine.operation = "MINIMUM"        # dark wherever EITHER set has a seam
    nt.links.new(outs[0].outputs["Color"], combine.inputs[0])
    nt.links.new(outs[1].outputs["Color"], combine.inputs[1])
    return combine


def fabric_material(name, colour, roughness=0.66, sheen=0.35, weave=150.0,
                    seams=(0.0, 0.0), trim=None, bump=0.16):
    """One fabric shader, parameterised.

    Sheen stops cloth reading as painted vinyl; the weave bump carries close
    range; the seams are what make it a garment rather than a body-shaped
    surface. `trim` tints the seam grooves — piping in the accent colour.
    """
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nt = mat.node_tree
    bsdf = nt.nodes["Principled BSDF"]
    set_input(bsdf, "Metallic", 0.0)
    set_input(bsdf, ["Sheen Weight", "Sheen"], sheen)
    set_input(bsdf, "Sheen Tint", hex_rgba(VIOLET_PALE))
    set_input(bsdf, ["Specular IOR Level", "Specular"], 0.32)

    coord = nt.nodes.new("ShaderNodeTexCoord")
    weave_tex = nt.nodes.new("ShaderNodeTexNoise")
    weave_tex.inputs["Scale"].default_value = weave
    weave_tex.inputs["Detail"].default_value = 5.0
    bump_node = nt.nodes.new("ShaderNodeBump")
    bump_node.inputs["Strength"].default_value = bump
    nt.links.new(coord.outputs["Object"], weave_tex.inputs["Vector"])
    nt.links.new(weave_tex.outputs["Fac"], bump_node.inputs["Height"])

    if any(seams):
        seam = _seam_mask(nt, coord, seams[0], seams[1])

        # ShaderNodeMix carries a full set of sockets for EVERY data type and
        # only enables the active one, so inputs["A"] resolves to the disabled
        # float socket, not the colour. Indices are the only reliable handle:
        # 0=Factor, 6=A(RGBA), 7=B(RGBA), output 2=Result(RGBA). Getting this
        # wrong is silent — the seams simply never appeared.
        base = nt.nodes.new("ShaderNodeMix")
        base.data_type = "RGBA"
        base.inputs[6].default_value = hex_rgba(trim or "0B0913")
        base.inputs[7].default_value = hex_rgba(colour)
        nt.links.new(seam.outputs["Value"], base.inputs[0])
        nt.links.new(base.outputs[2], bsdf.inputs["Base Color"])

        # the groove is a physical dent, not just a darker stripe
        groove = nt.nodes.new("ShaderNodeBump")
        groove.inputs["Strength"].default_value = 0.85
        groove.inputs["Distance"].default_value = 0.004
        nt.links.new(seam.outputs["Value"], groove.inputs["Height"])
        nt.links.new(bump_node.outputs["Normal"], groove.inputs["Normal"])
        nt.links.new(groove.outputs["Normal"], bsdf.inputs["Normal"])

        rough = nt.nodes.new("ShaderNodeMix")
        rough.data_type = "FLOAT"
        rough.inputs[2].default_value = min(roughness + 0.18, 1.0)
        rough.inputs[3].default_value = roughness
        nt.links.new(seam.outputs["Value"], rough.inputs[0])
        nt.links.new(rough.outputs[0], bsdf.inputs["Roughness"])
    else:
        set_input(bsdf, "Base Color", hex_rgba(colour))
        set_input(bsdf, "Roughness", roughness)
        nt.links.new(bump_node.outputs["Normal"], bsdf.inputs["Normal"])
    return mat


def build_collar(H, mat):
    """Standing collar at the neck — the detail that reads as tailoring from
    any distance, and it closes the gap between the jacket and the jaw."""
    RAD, VSEG = 36, 5
    rings = []
    for i in range(VSEG + 1):
        t = i / VSEG
        z = (0.800 + 0.046 * t) * H
        r = (0.074 + 0.016 * t) * H
        ring = []
        for j in range(RAD):
            th = 2 * math.pi * j / RAD
            rr = r + math.sin(th * 7) * 0.002 * H
            ring.append((math.cos(th) * rr, math.sin(th) * rr * 0.82 + 0.004 * H, z))
        rings.append(ring)
    return _mesh_from_rings("Collar", rings, mat, closed=True, thickness=H * 0.005)


def transfer_weights(src, dst):
    """Copy src's vertex groups onto dst by nearest vertex, so a mesh that was
    never cut from the body (or lost its groups to a remesh) can still follow
    the body's armature."""
    bpy.ops.object.select_all(action="DESELECT")
    dst.select_set(True)
    src.select_set(True)
    bpy.context.view_layer.objects.active = src
    bpy.ops.object.data_transfer(data_type="VGROUP_WEIGHTS",
                                 vert_mapping="NEAREST",
                                 layers_select_src="ALL",
                                 layers_select_dst="NAME")


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
    # The copy inherits whatever modifiers the body carries — in an animated
    # scene that includes a live Armature, and the garment gets its own
    # binding later. Keeping the inherited one deforms the cloth twice.
    g.modifiers.clear()

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
        # The remesh rebuilds topology and drops the vertex groups with it,
        # and a garment without weights ignores its armature — it stays
        # stranded in rest pose. Copy the weights back from the body.
        transfer_weights(body, g)
        bpy.ops.object.select_all(action="DESELECT")
        g.select_set(True)
        bpy.context.view_layer.objects.active = g

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
    RAD, VSEG = 44, 7
    rings = []
    for i in range(VSEG + 1):
        t = i / VSEG
        z = (0.575 - 0.042 * t) * H
        ring = []
        for j in range(RAD):
            th = 2 * math.pi * j / RAD
            r = (0.131 + 0.003 * math.sin(th * 9)) * H
            ring.append((math.cos(th) * r, math.sin(th) * r * 0.74, z))
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


def apply_face_projection(body, H, ctr, eye_ctr, eye_worlds):
    """Front-project the prepared photo onto the face.

    The projector empty sits AT the measured skull centre. The first version
    parented it to the body and left it at the origin — which is between the
    feet — so the projection frustum was nowhere near the head.

    A single photo cannot wrap a head; it smears past roughly 45 degrees
    off-axis. So it is masked twice: the image texture is CLIP, which returns
    zero alpha outside its own rectangle, and a dot product against the face
    direction fades it out as the surface turns away. Everything outside keeps
    the base mesh's own skin.

    Honest limit: this changes the face's colour and its features-as-painted,
    not its shape. The skull underneath is still the CC0 base mesh.
    """
    if not FACE_PROJECT:
        print("[asteroid] face projection off — sculpted face")
        return None
    if not os.path.exists(FACE_PHOTO):
        print(f"[asteroid] no face photo at {FACE_PHOTO} — using the base face")
        return None
    if not body.data.materials:
        return None

    img = bpy.data.images.load(FACE_PHOTO, check_existing=True)
    iw, ih = img.size
    mat = body.data.materials[0]
    nt = mat.node_tree
    bsdf = nt.nodes["Principled BSDF"]

    yaw = math.radians(POSE.get("head", (0, 0, 0))[2] + POSE.get("neck", (0, 0, 0))[2])
    face_w = FACE_W * H
    # Aspect from the photo, then squashed: mapped at the crop's own aspect the
    # features drifted progressively lower down the face and the mouth landed
    # on the chin. The model's head is shorter than the crop implies.
    face_h = face_w * (ih / iw) * FACE_H_ADJ

    # Put the projector where the photo's eyes will land on the model's eyes.
    # Centring it on the skull centroid instead left the mouth painted onto the
    # chin, because the centroid is not a facial landmark.
    proj = bpy.data.objects.new("FaceProjector", None)
    bpy.context.collection.objects.link(proj)
    # Anchor y on the eyes as well as x and z. Sitting at the skull's y while
    # the eyes sit forward of it meant the head's yaw rotated that depth
    # offset into a sideways shift, and the projection landed 9% off centre.
    proj.location = Vector((eye_ctr.x, eye_ctr.y,
                            eye_ctr.z - (PHOTO_EYE_V - 0.5) * face_h))
    proj.rotation_euler = (0.0, 0.0, yaw)
    # matrix_world is lazily evaluated. Reading it before the depsgraph runs
    # returns identity, which put the eye-hole centres at v=8.2 — off the
    # texture entirely. Same trap as the eyeballs earlier.
    bpy.context.view_layer.update()

    coord = nt.nodes.new("ShaderNodeTexCoord")
    coord.object = proj
    print(f"[asteroid] texcoord.object = {coord.object.name if coord.object else None}")
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")

    # ShaderNodeTexImage reads U and V from the vector's X and Y, so the
    # projector's X and Z have to be moved into those slots by hand — a
    # Mapping rotation would work too but is far harder to read.
    u = nt.nodes.new("ShaderNodeMath"); u.operation = "MULTIPLY_ADD"
    u.inputs[1].default_value = 1.0 / face_w
    u.inputs[2].default_value = 0.5 + FACE_OFF_X
    v = nt.nodes.new("ShaderNodeMath"); v.operation = "MULTIPLY_ADD"
    v.inputs[1].default_value = 1.0 / face_h
    v.inputs[2].default_value = 0.5 + FACE_OFF_Z
    uv = nt.nodes.new("ShaderNodeCombineXYZ")

    tex = nt.nodes.new("ShaderNodeTexImage")
    tex.image = img
    tex.extension = "CLIP"

    gain = nt.nodes.new("ShaderNodeMix")
    gain.data_type = "RGBA"
    gain.blend_type = "MULTIPLY"
    gain.inputs[0].default_value = 1.0
    gain.inputs[7].default_value = (FACE_GAIN, FACE_GAIN, FACE_GAIN, 1.0)

    geom = nt.nodes.new("ShaderNodeNewGeometry")
    face_dir = nt.nodes.new("ShaderNodeCombineXYZ")
    face_dir.inputs["X"].default_value = -math.sin(yaw)
    face_dir.inputs["Y"].default_value = -math.cos(yaw)
    face_dir.inputs["Z"].default_value = 0.0
    dot = nt.nodes.new("ShaderNodeVectorMath")
    dot.operation = "DOT_PRODUCT"
    facing = nt.nodes.new("ShaderNodeMapRange")
    facing.inputs["From Min"].default_value = 0.25
    facing.inputs["From Max"].default_value = 0.70
    facing.clamp = True

    # CLIP alone gives a binary edge, and that rectangle was plainly visible
    # running down the temple and across the forehead. Fade the projection out
    # over its outer FEATHER so it dissolves into the base skin instead.
    def _edge_fade(src):
        centred = nt.nodes.new("ShaderNodeMath")
        centred.operation = "MULTIPLY_ADD"
        centred.inputs[1].default_value = 2.0
        centred.inputs[2].default_value = -1.0
        absn = nt.nodes.new("ShaderNodeMath"); absn.operation = "ABSOLUTE"
        inv = nt.nodes.new("ShaderNodeMath"); inv.operation = "SUBTRACT"
        inv.inputs[0].default_value = 1.0
        ramp = nt.nodes.new("ShaderNodeMapRange")
        ramp.inputs["From Min"].default_value = 0.0
        ramp.inputs["From Max"].default_value = FEATHER
        ramp.clamp = True
        nt.links.new(src, centred.inputs[0])
        nt.links.new(centred.outputs["Value"], absn.inputs[0])
        nt.links.new(absn.outputs["Value"], inv.inputs[1])
        nt.links.new(inv.outputs["Value"], ramp.inputs["Value"])
        return ramp

    def _eye_hole(eye_world):
        """Cut a soft hole in the projection around one eye.

        The photo has eyes painted in it and the model has actual eyeballs, so
        projecting over the sockets renders both — a second, offset pair of
        eyes on the lids. Geometry should own the eyes; the photo should only
        ever touch skin.
        """
        local = proj.matrix_world.inverted() @ eye_world
        eu = local.x / face_w + 0.5 + FACE_OFF_X
        ev = local.z / face_h + 0.5 + FACE_OFF_Z
        du = nt.nodes.new("ShaderNodeMath"); du.operation = "SUBTRACT"
        du.inputs[1].default_value = eu
        dv = nt.nodes.new("ShaderNodeMath"); dv.operation = "SUBTRACT"
        dv.inputs[1].default_value = ev
        vec = nt.nodes.new("ShaderNodeCombineXYZ")
        dist = nt.nodes.new("ShaderNodeVectorMath"); dist.operation = "LENGTH"
        hole = nt.nodes.new("ShaderNodeMapRange")
        hole.inputs["From Min"].default_value = EYE_HOLE[0]
        hole.inputs["From Max"].default_value = EYE_HOLE[1]
        hole.clamp = True
        nt.links.new(u.outputs["Value"], du.inputs[0])
        nt.links.new(v.outputs["Value"], dv.inputs[0])
        nt.links.new(du.outputs["Value"], vec.inputs["X"])
        nt.links.new(dv.outputs["Value"], vec.inputs["Y"])
        nt.links.new(vec.outputs["Vector"], dist.inputs[0])
        nt.links.new(dist.outputs["Value"], hole.inputs["Value"])
        print(f"[asteroid]   eye hole at uv=({eu:.3f},{ev:.3f})")
        return hole

    fu = _edge_fade(u.outputs["Value"])
    fv = _edge_fade(v.outputs["Value"])
    fade = nt.nodes.new("ShaderNodeMath"); fade.operation = "MULTIPLY"
    nt.links.new(fu.outputs["Result"], fade.inputs[0])
    nt.links.new(fv.outputs["Result"], fade.inputs[1])

    for ew in eye_worlds:
        h = _eye_hole(ew)
        nxt = nt.nodes.new("ShaderNodeMath"); nxt.operation = "MULTIPLY"
        nt.links.new(fade.outputs["Value"], nxt.inputs[0])
        nt.links.new(h.outputs["Result"], nxt.inputs[1])
        fade = nxt

    edged = nt.nodes.new("ShaderNodeMath"); edged.operation = "MULTIPLY"
    both = nt.nodes.new("ShaderNodeMath"); both.operation = "MULTIPLY"
    amt = nt.nodes.new("ShaderNodeMath"); amt.operation = "MULTIPLY"
    amt.inputs[1].default_value = FACE_MIX

    blend = nt.nodes.new("ShaderNodeMix")
    blend.data_type = "RGBA"
    # indices, not names — ShaderNodeMix keeps a socket set per data type and
    # enables only the active one, so inputs["A"] is a disabled float socket
    blend.inputs[6].default_value = hex_rgba(SKIN)

    L = nt.links.new
    L(coord.outputs["Object"], sep.inputs["Vector"])
    L(sep.outputs["X"], u.inputs[0])
    L(sep.outputs["Z"], v.inputs[0])
    L(u.outputs["Value"], uv.inputs["X"])
    L(v.outputs["Value"], uv.inputs["Y"])
    L(uv.outputs["Vector"], tex.inputs["Vector"])
    L(tex.outputs["Color"], gain.inputs[6])
    L(geom.outputs["Normal"], dot.inputs[0])
    L(face_dir.outputs["Vector"], dot.inputs[1])
    L(dot.outputs["Value"], facing.inputs["Value"])
    L(facing.outputs["Result"], both.inputs[0])
    L(tex.outputs["Alpha"], edged.inputs[0])
    L(fade.outputs["Value"], edged.inputs[1])
    L(edged.outputs["Value"], both.inputs[1])
    L(both.outputs["Value"], amt.inputs[0])
    L(amt.outputs["Value"], blend.inputs[0])
    L(gain.outputs[2], blend.inputs[7])
    L(blend.outputs[2], bsdf.inputs["Base Color"])

    # Colour alone leaves the features painted on a blank head. Driving a bump
    # from the photo's luminance gives the brow, nose and lips actual relief,
    # so they still read when the key light rakes across them. Chained after
    # the pore bump rather than replacing it.
    lum = nt.nodes.new("ShaderNodeRGBToBW")
    fbump = nt.nodes.new("ShaderNodeBump")
    fbump.inputs["Strength"].default_value = 0.30
    fbump.inputs["Distance"].default_value = 0.004
    prior = None
    for link in list(nt.links):
        if link.to_node == bsdf and link.to_socket.name == "Normal":
            prior = link.from_node
            nt.links.remove(link)
            break
    L(tex.outputs["Color"], lum.inputs["Color"])
    L(lum.outputs["Val"], fbump.inputs["Height"])
    if prior:
        L(prior.outputs["Normal"], fbump.inputs["Normal"])
    L(fbump.outputs["Normal"], bsdf.inputs["Normal"])

    # Hair scatters where skin reflects. Driving roughness off the photo's
    # luminance makes the beard read as a different MATERIAL, not just a
    # darker paint — which survives strong light far better than albedo does.
    rough = nt.nodes.new("ShaderNodeMapRange")
    rough.inputs["From Min"].default_value = 0.10
    rough.inputs["From Max"].default_value = 0.70
    rough.inputs["To Min"].default_value = 0.88
    rough.inputs["To Max"].default_value = 0.52
    rough.clamp = True
    rmix = nt.nodes.new("ShaderNodeMix")
    rmix.data_type = "FLOAT"
    rmix.inputs[2].default_value = 0.62
    L(lum.outputs["Val"], rough.inputs["Value"])
    L(rough.outputs["Result"], rmix.inputs[3])
    L(amt.outputs["Value"], rmix.inputs[0])
    L(rmix.outputs[0], bsdf.inputs["Roughness"])
    if os.environ.get("FACE_DUMP"):
        print("[dump] --- skin material links ---")
        for lk in nt.links:
            print(f"[dump] {lk.from_node.bl_idname}.{lk.from_socket.name}"
                  f"  ->  {lk.to_node.bl_idname}.{lk.to_socket.name}")
        print(f"[dump] tex.image={tex.image.name if tex.image else None} "
              f"size={tuple(tex.image.size) if tex.image else None} "
              f"has_data={tex.image.has_data if tex.image else None} "
              f"filepath={tex.image.filepath if tex.image else None}")
        print(f"[dump] tex.extension={tex.extension} interp={tex.interpolation}")
        print(f"[dump] material on body: {[m.name for m in body.data.materials]}")

    dbg = os.environ.get("FACE_DEBUG")
    if dbg == "uv":
        L(uv.outputs["Vector"], bsdf.inputs["Base Color"])
        print("[asteroid] FACE_DEBUG: uv -> base color")
    elif dbg == "tex":
        L(tex.outputs["Color"], bsdf.inputs["Base Color"])
        print("[asteroid] FACE_DEBUG: raw texture -> base color")
    elif dbg == "emit":
        # take lighting out of the question entirely
        em = nt.nodes.new("ShaderNodeEmission")
        em.inputs["Strength"].default_value = 1.0
        out_node = next(n for n in nt.nodes
                        if n.bl_idname == "ShaderNodeOutputMaterial")
        for lk in list(nt.links):
            if lk.to_node == out_node:
                nt.links.remove(lk)
        L(tex.outputs["Color"], em.inputs["Color"])
        L(em.outputs["Emission"], out_node.inputs["Surface"])
        print("[asteroid] FACE_DEBUG: texture -> emission")
    if os.environ.get("FACE_DEBUG"):
        bpy.context.view_layer.update()
        inv = proj.matrix_world.inverted()
        top = max((body.matrix_world @ v.co).z for v in body.data.vertices)
        probes = {
            "skull centre": ctr,
            "crown": Vector((ctr.x, ctr.y, top)),
            "chin-ish": Vector((ctr.x, ctr.y, ctr.z - 0.09 * H)),
            "left cheek": Vector((ctr.x - 0.05 * H, ctr.y, ctr.z)),
        }
        for name, wp in probes.items():
            lp = inv @ Vector(wp)
            uu = lp.x / face_w + 0.5 + FACE_OFF_X
            vv = lp.z / face_h + 0.5 + FACE_OFF_Z
            inside = 0.0 <= uu <= 1.0 and 0.0 <= vv <= 1.0
            print(f"[probe] {name:14s} local={tuple(round(c,3) for c in lp)} "
                  f"uv=({uu:.3f},{vv:.3f}) {'IN' if inside else 'OUT'}")

    print(f"[asteroid] face projected: photo {iw}x{ih}, "
          f"{face_w:.3f}x{face_h:.3f} at {tuple(round(c, 3) for c in ctr)}")
    return proj, img, face_w, face_h


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


def rig_and_pose(body, eyes, height, pose=None, keep_rig=False):
    """Build an armature, bind with automatic weights, pose it, then bake the
    result into the mesh so downstream code sees a plain posed object.

    `pose` overrides the module POSE, so other scenes can reuse this rig with a
    different one. `keep_rig` leaves the armature bound and unbaked, which is
    what an animated scene needs — baking is only right when the pose is fixed
    for every frame.
    """
    pose = POSE if pose is None else pose
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
    for name, (rx, ry, rz) in pose.items():
        pb = arm.pose.bones.get(name)
        if not pb:
            continue
        pb.rotation_mode = "XYZ"
        pb.rotation_euler = (math.radians(rx), math.radians(ry), math.radians(rz))
    bpy.ops.object.mode_set(mode="OBJECT")

    if keep_rig:
        # An animated scene re-poses every frame, so the deform has to stay
        # live. Baking here would freeze frame one into the mesh.
        print(f"[asteroid] rig kept live ({len(arm.pose.bones)} bones)")
        return arm

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
    skull_ctr, skull_r = head_sphere(body, H)
    bpy.context.view_layer.update()
    eye_ctr = sum((e.location for e in eyes), Vector()) / max(len(eyes), 1)
    projected = apply_face_projection(body, H, skull_ctr, eye_ctr,
                                      [e.location.copy() for e in eyes])
    face_proj = beard = None
    if projected:
        face_proj, face_img, fw, fh = projected
        beard = build_facial_hair(body, H, face_proj, fw, fh, face_img)
    hair = build_hair(H, body, skull_ctr, skull_r)

    # Garments cut from the body's own geometry, so they fit the pose exactly.
    cloth = fabric_material("Suit", "393454", roughness=0.70, sheen=0.35,
                            seams=(8.5, 5.5), trim="5A50B4")
    limb = fabric_material("SuitLimb", "2E2A46", roughness=0.72, sheen=0.30,
                           seams=(11.0, 7.0), trim="4A4195")
    leather = fabric_material("Leather", "15121C", roughness=0.46, sheen=0.10,
                              weave=90.0)
    accent = fabric_material("Accent", "3C3489", roughness=0.40, sheen=0.5,
                             weave=110.0)
    worn = [
        garment_from_groups("Jacket", body,
                            ("chest", "spine", "hips", "shoulder.L", "shoulder.R"),
                            H, 0.015, cloth, thickness=0.020,
                            relax=6, remesh=0.012),
        garment_from_groups("Sleeves", body,
                            ("upper_arm.L", "upper_arm.R",
                             "forearm.L", "forearm.R"),
                            H, 0.008, limb, relax=6),
        garment_from_groups("Pauldrons", body,
                            ("shoulder.L", "shoulder.R"),
                            H, 0.020, accent, thickness=0.012,
                            relax=5, remesh=0.010),
        garment_from_groups("Trousers", body,
                            ("thigh.L", "thigh.R", "shin.L", "shin.R"),
                            H, 0.008, limb, relax=6),
        garment_from_groups("Boots", body,
                            ("shin.L", "shin.R", "foot.L", "foot.R"),
                            H, 0.013, leather, thickness=0.022,
                            relax=6, remesh=0.011),
        build_belt(H, leather),
        build_collar(H, accent),
    ]
    worn = [w for w in worn if w]
    cape = build_cape(cloak_mat, H)
    # Tag the cape's vertices so the ripple modifier can be limited to them
    # once everything is one mesh.
    vg = cape.vertex_groups.new(name="cape_ripple")
    vg.add([v.index for v in cape.data.vertices], 1.0, "REPLACE")

    bpy.ops.object.select_all(action="DESELECT")
    for ob in [body, cape] + worn + brows:
        ob.select_set(True)
    bpy.context.view_layer.objects.active = body
    bpy.ops.object.join()
    rider = bpy.context.active_object
    rider.name = "Rider"

    # Eyes stay separate objects (see import_human) and the hair carries a
    # particle system that bpy.ops.object.join() would discard, so both ride
    # along as children instead.
    for e in [o for o in (list(eyes) + [hair, face_proj, beard]) if o]:
        e.parent = rider
        e.matrix_parent_inverse = rider.matrix_world.inverted()

    print(f"[asteroid] vertex groups = {sorted(g.name for g in body.vertex_groups)}")
    # Ripple driven by an empty used as texture coordinates: rotating that
    # empty a full turn over the loop sweeps the noise across the cape and
    # lands exactly back where it started, so the animation is seamless by
    # construction rather than by tuning a wave speed.
    ctl = bpy.data.objects.new("CapeRipple", None)
    bpy.context.collection.objects.link(ctl)
    ctl.parent = rider
    tex = bpy.data.textures.new("cape_ripple", type="CLOUDS")
    tex.noise_scale = 0.55
    rip = rider.modifiers.new("CapeRipple", "DISPLACE")
    rip.texture = tex
    rip.texture_coords = "OBJECT"
    rip.texture_coords_object = ctl
    rip.vertex_group = "cape_ripple"
    rip.mid_level = 0.5
    rip.strength = H * 0.055

    # A soft fill parented to the figure, in front of the face.
    #
    # The scene key is amber from below-right and the rim is behind-left, which
    # is right for the rock but leaves the camera-facing side of the face in
    # shadow — and a projected face that cannot be seen is worth nothing. This
    # rides along with the rider so it stays on the face in every frame of the
    # rotation, and it is small and dim enough not to disturb the asteroid.
    bpy.ops.object.light_add(type="AREA", location=(0, 0, 0))
    fill = bpy.context.active_object
    fill.name = "FaceFill"
    fill.data.color = hex_rgb("FFF3E2")
    fill.data.energy = 21.0 * (H / 1.45) ** 2
    fill.data.size = 0.55 * H
    fill.parent = rider
    fill.location = (-0.22 * H, -0.62 * H, 1.02 * H)
    fill.rotation_mode = "QUATERNION"
    fill.rotation_quaternion = (
        Vector((0, 0, 0.94 * H)) - Vector(fill.location)
    ).to_track_quat("-Z", "Y")

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


def frame_object(cam, objs, margin=1.3, direction=(0.40, -1.0, 0.20)):
    """Point the camera at an object and back off far enough to fit it.
    Hand-placed preview cameras kept cropping the subject; deriving the
    distance from the bounding box removes the guesswork. `direction` is
    where the camera sits relative to the subject — the default is the
    rider's low hero angle; the desk scene passes a higher one."""
    if not isinstance(objs, (list, tuple)):
        objs = [objs]
    bb = [o.matrix_world @ Vector(c) for o in objs for c in o.bound_box]
    ctr = Vector((sum(v[i] for v in bb) / len(bb) for i in range(3)))
    extent = max((max(v[i] for v in bb) - min(v[i] for v in bb)) for i in range(3))
    fov = 2.0 * math.atan(18.0 / cam.data.lens)
    dist = (extent * margin) / (2.0 * math.tan(fov / 2.0))
    direction = Vector(direction).normalized()
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
        frame_object(cam, [ast, rider], margin=1.66)
        render_to(os.path.join(out, opts["out"] + ".png"))
    elif opts["mode"] == "sprite":
        # A seamless loop: the pair tumbles a full turn while the cape's
        # ripple control makes a full turn of its own, so frame N lands
        # exactly on frame 0 without any easing or tuning.
        frames_dir = os.path.join(out, "_frames")
        os.makedirs(frames_dir, exist_ok=True)
        for stale in os.listdir(frames_dir):
            if stale.endswith(".png"):
                os.remove(os.path.join(frames_dir, stale))

        n = opts["frames"]
        # Frame once, with margin for the widest point of the rotation — the
        # cape sweeps a long way off-axis, so framing per-frame would make the
        # subject pulse in scale across the loop.
        frame_object(cam, [ast, rider], margin=1.72)

        pivot = bpy.data.objects.new("pivot", None)
        bpy.context.collection.objects.link(pivot)
        bpy.context.view_layer.update()
        for ob in (ast, rider):
            mw = ob.matrix_world.copy()
            ob.parent = pivot
            ob.matrix_parent_inverse = pivot.matrix_world.inverted()
            ob.matrix_world = mw

        ripple = bpy.data.objects.get("CapeRipple")
        for i in range(n):
            t = i / n
            pivot.rotation_euler = (0, 0, 2 * math.pi * t)
            if ripple:
                ripple.rotation_euler = (0.35 * math.sin(2 * math.pi * t),
                                         0, 2 * math.pi * t)
            bpy.context.view_layer.update()
            render_to(os.path.join(frames_dir, f"f{i:03d}.png"))
        print(f"[asteroid] {n} frames in {frames_dir}")
    else:
        raise SystemExit(f"unknown mode {opts['mode']}")


if __name__ == "__main__":
    main()

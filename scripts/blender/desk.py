"""
A man works at a desk on an asteroid: types on a laptop, screen glow on his
face, mug at his right hand. Renders the sprite sheet for #experience.

    /Applications/Blender.app/Contents/MacOS/Blender --background \
        --python scripts/blender/desk.py -- --mode still

Everything here is a pre-existing asset except the mug and the assembly:
the figure is a Mixamo character ("Lewis") carrying Mixamo's own seated
"Typing" animation — real tailored clothes, finger articulation, and motion
capture, none of which the procedural pipeline could reach (see git history
for that attempt; asteroid.py remains the rider's revert path). The desk,
chair and laptop are CC0 Poly Haven models. The rock, lighting, camera and
compositor come from asteroid.py.

The furniture is fitted to the ANIMATION, not the other way round: the desk
top goes under wherever his hands actually type, the chair seat under
wherever his hips actually sit. Measured from the bones at runtime, so a
different clip or character re-fits itself.

Vendored inputs (assets/vendor/ is gitignored):
    scripts/blender/fetch-props.sh          # Poly Haven furniture
    assets/vendor/mixamo/Typing.fbx         # manual: mixamo.com, FBX binary,
    assets/vendor/mixamo/Sitting *.fbx      # with skin, 30fps, no reduction
"""

import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import bpy                                    # noqa: E402
from mathutils import Matrix, Vector          # noqa: E402

import asteroid as A                          # noqa: E402

H = 1.45                    # scene height unit, same as the rider scene
FRAMES = 48                 # sprite cells per loop (9.6s at 200ms steps)

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
VENDOR = os.path.join(ROOT, "assets", "vendor", "polyhaven")
MIXAMO = os.path.join(ROOT, "assets", "vendor", "mixamo")

# The loop is a splice of two Mixamo clips (both 30fps):
#   typing → crossfade → seated drink (from "Sitting Drinking", whose first
#   ~120 frames are a WALK to the chair and are skipped) → crossfade →
#   typing, whose tail crossfades onto its own start so the last cell steps
#   seamlessly to cell 0.
# CLIP_START/CLIP_LEN also define the typing window the furniture is fitted
# against.
CLIP_START, CLIP_LEN = 60, 216
T_STEP = 6                  # typing clip-frames per sprite cell
# Drink cells map to EXPLICIT source frames, not a linear window: the clip
# lifts to the mouth (~frame 262), then tips the cup back ABOVE the mouth
# for a long hold (270–330, hand at eye height — the cup ended up at his
# EYES, user catch), then lowers from ~331. The map plays lift → sip at the
# mouth → skips the tip-back → rejoins at the lowering; frames 270 and 331
# are near-identical poses, so the skip is invisible.
# The wrist passes MOUTH height (~z 1.00 in clip units) around frame 240 —
# by 262 it is at EYE height, into the tip-back (the cup rendered at his
# eyes twice before this sank in; user caught it both times). So the sip
# holds at 240±1, and the lowering REVERSE-PLAYS the rise: same path down,
# landing exactly on the pre-lift pose.
# Drink-clip frames used for the HEAD AND TORSO only — the arm is driven by
# IK to the authored cup path, so these supply the lean and the head dip and
# nothing else. Sampled around the clip's own sip so the dip lands with the
# cup.
D_SIP = [228, 232, 236, 239, 240, 240, 240, 239, 236, 232, 228]
DRINK_PEAK = 240
XW = 3                      # junction crossfade cells
WRAP = 4                    # end-of-loop wrap crossfade cells


def _ease(x):
    x = min(1.0, max(0.0, x))
    return x * x * (3 - 2 * x)


def schedule(n):
    """Per-cell plan: (pose, blend, ik_influence, journey, held).

    `journey` is where the CUP is: 0 on the desk, 1 at his lips. The cup is
    authored along that path and the hand is driven to it by IK — the
    reverse of every earlier attempt, all of which derived the cup from
    wherever the hand happened to be and so put it in mid-air, then at his
    eyes, then against his forehead.

    Pose source is the typing clip except through the sip: the drink clip
    supplies the head dip and the lean back, but its shoulder sits too high
    and too far back to reach the desk, so the grab and the put-down are
    posed from the typing clip, which is already leaning over the desk.
    """
    n1 = (3 * n) // 8                        # 18: he stops typing
    GRAB, SIP0, SIP1, BACK, OFF = n1 + 4, n1 + 9, n1 + 12, n1 + 17, n1 + 20
    cells = []
    for i in range(n):
        blend = None
        if GRAB < i <= SIP1 + 1:             # drink clip: head + torso
            k = min(i - GRAB - 1, len(D_SIP) - 1)
            cur = ("D", D_SIP[k])
            if i - GRAB <= XW:
                blend = (("T", CLIP_START + T_STEP * GRAB),
                         (XW - (i - GRAB - 1)) / (XW + 1))
        else:
            cur = ("T", CLIP_START + T_STEP * (i if i <= GRAB else i - 0))
            if 0 < i - (SIP1 + 1) <= XW:     # drink fades back out
                blend = (("D", D_SIP[-1]),
                         (XW - (i - SIP1 - 1)) / (XW + 1))
            if i >= n - WRAP:                # loop seam
                blend = (("T", CLIP_START - T_STEP * (n - i)),
                         (i - (n - WRAP - 1)) / WRAP)

        # cup journey: desk → lips → desk
        if i < GRAB or i > BACK:
            journey, held = 0.0, False
        else:
            held = True
            if i <= SIP0:
                journey = _ease((i - GRAB) / (SIP0 - GRAB))
            elif i <= SIP1:
                journey = 1.0
            else:
                journey = _ease((BACK - i) / (BACK - SIP1))

        # IK: reach in, hold through the action, release after
        if i < n1 or i > OFF:
            ik = 0.0
        elif i < GRAB:
            ik = _ease((i - n1 + 1) / (GRAB - n1 + 1))
        elif i <= BACK:
            ik = 1.0
        else:
            ik = _ease((OFF - i) / (OFF - BACK))
        cells.append((cur, blend, ik, journey, held))
    return cells


# ── figure ───────────────────────────────────────────────────────────
def import_figure():
    """Lewis, seated and typing. Returns (armature, meshes, bone prefix).

    The bone prefix ("mixamorig4" here) changes between Mixamo exports, so
    it is detected, never hardcoded.
    """
    path = os.path.join(MIXAMO, "Typing.fbx")
    if not os.path.exists(path):
        raise SystemExit(f"[desk] missing {path}\n"
                         "  download from mixamo.com — see module docstring")
    before = set(bpy.data.objects)
    bpy.ops.import_scene.fbx(filepath=path)
    new = [o for o in bpy.data.objects if o not in before]
    arm = next(o for o in new if o.type == "ARMATURE")
    meshes = [o for o in new if o.type == "MESH"]
    hips = next(b for b in arm.pose.bones if b.name.endswith(":Hips"))
    prefix = hips.name.split(":")[0]
    sc = bpy.context.scene
    sc.frame_start, sc.frame_end = 1, 494
    print(f"[desk] figure: {len(arm.pose.bones)} bones, prefix {prefix}")
    return arm, meshes, prefix


def bone_w(arm, prefix, name):
    return arm.matrix_world @ arm.pose.bones[f"{prefix}:{name}"].head


def face_mouth_local(arm, prefix):
    """Find his mouth on the FACE MESH, returned in head-bone space.

    Offsets guessed off the head bone put the cup at his eyes and then
    against his forehead, because the head bone sits at the base of the
    skull and he tilts it to drink. Measured anatomy does not drift: the
    nose is the front-most head-weighted vertex, the chin the lowest, and
    the lips sit between them. Head-bone space keeps it glued to the skull
    however he moves.
    """
    body = next(o for o in bpy.data.objects
                if o.type == "MESH" and o.vertex_groups.get(f"{prefix}:Head"))
    gi = body.vertex_groups[f"{prefix}:Head"].index
    keep = {v.index for v in body.data.vertices
            for g in v.groups if g.group == gi and g.weight > 0.8}
    hm = arm.matrix_world @ arm.pose.bones[f"{prefix}:Head"].matrix
    inv = Matrix.LocRotScale(hm.translation, hm.to_quaternion(),
                             Vector((1, 1, 1))).inverted()
    dg = bpy.context.evaluated_depsgraph_get()
    ev = body.evaluated_get(dg)
    me = ev.to_mesh()
    pts = [inv @ (ev.matrix_world @ me.vertices[i].co)
           for i in keep if i < len(me.vertices)]
    nose = max(pts, key=lambda p: p.z)          # +z is the face
    chin = min(pts, key=lambda p: p.y)          # bone +y runs up the skull
    ev.to_mesh_clear()
    # Lips sit a little over a third of the way from chin to nose, and are
    # less proud than the nose tip.
    mouth = chin + (nose - chin) * 0.38
    mouth.z = chin.z + (nose.z - chin.z) * 0.62
    print(f"[desk] mouth (head-space) {tuple(round(v / H, 4) for v in mouth)}H "
          f"nose {tuple(round(v / H, 4) for v in nose)}H "
          f"chin {tuple(round(v / H, 4) for v in chin)}H")
    return mouth


def fit_figure(arm, prefix):
    """Scale him to the scene, face him down −y, feet on the ground."""
    bpy.context.scene.frame_set(CLIP_START)
    bpy.context.view_layer.update()

    head = bone_w(arm, prefix, "Head")
    lfoot = bone_w(arm, prefix, "LeftFoot")
    rfoot = bone_w(arm, prefix, "RightFoot")
    ltoe = bone_w(arm, prefix, "LeftToeBase")
    feet_z = min(lfoot.z, rfoot.z, ltoe.z)

    # Seated head-to-heel is ~0.70 of a standing figure this size.
    s = 0.70 * H / (head.z - feet_z)
    arm.scale = Vector(arm.scale) * s
    bpy.context.view_layer.update()

    # Face −y: the toes point the way he faces.
    ltoe = bone_w(arm, prefix, "LeftToeBase")
    lfoot = bone_w(arm, prefix, "LeftFoot")
    fwd = ltoe - lfoot
    fwd.z = 0
    ang = math.atan2(fwd.y, fwd.x)
    arm.matrix_world = (Matrix.Rotation(-math.pi / 2 - ang, 4, "Z")
                        @ arm.matrix_world)
    bpy.context.view_layer.update()

    # Hips over (0, 0.18H), feet on z=0. Everything else is measured off
    # him afterwards, so this anchor is aesthetic, not load-bearing.
    hips = bone_w(arm, prefix, "Hips")
    lfoot = bone_w(arm, prefix, "LeftFoot")
    rfoot = bone_w(arm, prefix, "RightFoot")
    delta = Vector((0 - hips.x, 0.18 * H - hips.y,
                    -min(lfoot.z, rfoot.z) + 0.005 * H))
    arm.matrix_world = Matrix.Translation(delta) @ arm.matrix_world
    bpy.context.view_layer.update()


def recolor_skin(target=(0.42, 0.55, 0.44, 0.36)):
    """Shift the skin toward whitish brown (user direction).

    Skin and clothes share one 4k diffuse, so this is a texel mask, not a
    material swap: warm texels (R>G>B by a margin) are skin, lips, ears —
    the teal shirt and near-neutral slacks never match it. Per-channel
    affine (scale k then offset) keeps every pore and shading gradient,
    just relit onto a lighter base.
    """
    import numpy as np
    k, ro, go, bo = target
    for mat in bpy.data.materials:
        if "body" not in mat.name.lower() or not mat.use_nodes:
            continue
        for node in mat.node_tree.nodes:
            if node.type != "TEX_IMAGE" or node.image is None:
                continue
            out = node.outputs["Color"]
            feeds_base = any(l.to_socket.name == "Base Color"
                             for l in out.links)
            if not feeds_base:
                continue
            img = node.image
            n = len(img.pixels)
            px = np.empty(n, dtype=np.float32)
            img.pixels.foreach_get(px)
            px = px.reshape(-1, 4)
            r, g, b = px[:, 0], px[:, 1], px[:, 2]
            skin = (r > g) & (g > b) & ((r - b) > 0.05)
            px[skin, 0] = np.clip(r[skin] * k + ro, 0.0, 1.0)
            px[skin, 1] = np.clip(g[skin] * k + go, 0.0, 1.0)
            px[skin, 2] = np.clip(b[skin] * k + bo, 0.0, 1.0)
            # Shirt → purple, to match the site theme (user direction).
            # The shirt is the teal region: blue/green above red, which
            # nothing else in the texture matches — skin was just moved
            # further warm, slacks are neutral-dark, the belt is brown.
            # Keeping blue as the luminance anchor preserves every fold.
            shirt = (b > r + 0.02) & (g > r)
            px[shirt, 0] = np.clip(b[shirt] * 0.82, 0.0, 1.0)
            px[shirt, 1] = np.clip(g[shirt] * 0.52, 0.0, 1.0)
            px[shirt, 2] = np.clip(b[shirt] * 0.98, 0.0, 1.0)
            img.pixels.foreach_set(px.ravel())
            img.update()
            print(f"[desk] recolour: {int(skin.sum())} skin, "
                  f"{int(shirt.sum())} shirt texels in {img.name}")


# ── pose sampling ────────────────────────────────────────────────────
def _snapshot(arm):
    out = {}
    for b in arm.pose.bones:
        loc, rot, sca = b.matrix_basis.decompose()
        out[b.name] = (loc, rot, sca)
    return out


class PoseRig:
    """Samples poses from either clip and holds blended ones on the rig.

    The drink clip opens with a WALK to the chair, so its hips carry a
    ~2.3 m translation (and whatever facing the mocap stage had) baked into
    the bone basis. `hips_corr` — measured once as typing-hips ∘ drink-hips⁻¹
    at the junction frames — re-seats every drink sample onto the typing
    clip's chair. Without it he teleports across the rock mid-loop.
    """

    def __init__(self, arm, act_typing, act_drink, prefix):
        self.arm, self.prefix = arm, prefix
        self.acts = {"T": act_typing, "D": act_drink}
        self.hips = f"{prefix}:Hips"
        t = self._raw("T", CLIP_START + T_STEP * 18)
        d = self._raw("D", D_SIP[0])
        self.corr = (Matrix.LocRotScale(*t[self.hips])
                     @ Matrix.LocRotScale(*d[self.hips]).inverted())

    def _raw(self, seg, frame):
        self.arm.animation_data.action = self.acts[seg]
        bpy.context.scene.frame_set(int(round(frame)))
        bpy.context.view_layer.update()
        return _snapshot(self.arm)

    def sample(self, seg, frame):
        snap = self._raw(seg, frame)
        if seg == "D":
            m = self.corr @ Matrix.LocRotScale(*snap[self.hips])
            snap[self.hips] = m.decompose()
        return snap

    def apply(self, cur, blend=None):
        a = self.sample(*cur)
        if blend is not None:
            (seg, frame), w = blend
            if w > 0.0:
                bb = self.sample(seg, frame)
                for name, (la, ra, sa) in a.items():
                    lb, rb, sb = bb[name]
                    a[name] = (la.lerp(lb, w), ra.slerp(rb, w),
                               sa.lerp(sb, w))
        self.arm.animation_data.action = None
        for b in self.arm.pose.bones:
            loc, rot, sca = a[b.name]
            b.matrix_basis = Matrix.LocRotScale(loc, rot, sca)
        bpy.context.view_layer.update()


def load_drink_action(prefix):
    """Steal the action out of the Sitting Drinking export, then delete its
    objects — the animation is all we came for. Bone prefixes can differ
    between exports, so fcurve paths are remapped onto ours if needed."""
    path = os.path.join(MIXAMO, "Sitting Drinking.fbx")
    if not os.path.exists(path):
        raise SystemExit(f"[desk] missing {path}\n"
                         "  download from mixamo.com — see module docstring")
    before = set(bpy.data.objects)
    bpy.ops.import_scene.fbx(filepath=path)
    new = [o for o in bpy.data.objects if o not in before]
    darm = next(o for o in new if o.type == "ARMATURE")
    act = darm.animation_data.action
    act.name = "DrinkClip"
    act.use_fake_user = True
    dhips = next(b for b in darm.pose.bones if b.name.endswith(":Hips"))
    dpre = dhips.name.split(":")[0]
    if dpre != prefix:
        for fc in act.fcurves:
            fc.data_path = fc.data_path.replace(f'["{dpre}:', f'["{prefix}:')
    for o in new:
        bpy.data.objects.remove(o, do_unlink=True)
    bpy.data.orphans_purge(do_recursive=True)
    return act


# ── vendored props ───────────────────────────────────────────────────
def _import_vendor(asset):
    path = os.path.join(VENDOR, asset, f"{asset}_2k.blend")
    if not os.path.exists(path):
        raise SystemExit(f"[desk] missing {path}\n"
                         "  run scripts/blender/fetch-props.sh first")
    with bpy.data.libraries.load(path, link=False) as (src, dst):
        dst.objects = list(src.objects)
    obs = [o for o in dst.objects if o]
    for o in obs:
        bpy.context.collection.objects.link(o)
    return obs


def _place(obs, scale, rot_z, loc):
    """Move a multi-part asset rigidly about its COMMON origin. Not every
    part sits at (0,0,0) — the laptop's screen keeps its origin at the
    hinge — so each part's stored location is treated as an offset from the
    asset origin and scaled/rotated along."""
    rot = Matrix.Rotation(rot_z, 4, "Z")
    if not isinstance(scale, (tuple, list)):
        scale = (scale, scale, scale)
    for o in obs:
        off = rot @ Vector((o.location.x * scale[0],
                            o.location.y * scale[1],
                            o.location.z * scale[2]))
        o.scale = scale
        o.rotation_euler = (0, 0, rot_z)
        o.location = Vector(loc) + off


def build_desk(top_z, center_y, center_x=0.0):
    """Metal office desk, its top exactly at `top_z` — which is measured
    from where his hands type, so the fit is by construction. Width and
    depth scaled down independently: a two-metre executive desk at true
    proportion walled the figure off. Drawers face the sitter (+y)."""
    obs = _import_vendor("metal_office_desk")
    k = top_z / 0.788
    # 0.62 wide left the mug overhanging the edge, 0.72 still crowded the
    # mug into the mouse (user catches, both).
    _place(obs, (0.80 * k, 0.70 * k, k), math.pi, (center_x, center_y, 0))

    # The pale worn metal renders brighter than the figure under the key
    # light and steals the frame. Multiply the diffuse toward a calmer
    # grey — texture survives, glare goes. Mix sockets by INDEX.
    mat = bpy.data.materials.get("metal_office_desk")
    if mat and mat.use_nodes:
        nt = mat.node_tree
        bsdf = next((n for n in nt.nodes if n.type == "BSDF_PRINCIPLED"), None)
        sock = bsdf.inputs["Base Color"] if bsdf else None
        if sock and sock.links:
            src = sock.links[0].from_socket
            mix = nt.nodes.new("ShaderNodeMix")
            mix.data_type = "RGBA"
            mix.blend_type = "MULTIPLY"
            mix.inputs[0].default_value = 1.0
            mix.inputs[7].default_value = (0.52, 0.51, 0.58, 1.0)
            nt.links.new(src, mix.inputs[6])
            nt.links.new(mix.outputs[2], sock)
    return obs


def build_chair(seat_z, center_y):
    """Dining chair, seat pan under his hips. The pan sits at ~0.455 of the
    asset's 0.973 m height. The backrest lives at the asset's LOCAL +y
    (measured from the mesh), which is already behind a sitter facing −y —
    no rotation. A half-turn put the backrest in his lap."""
    obs = _import_vendor("dining_chair_02")
    k = seat_z / (0.973 * 0.455)
    _place(obs, k, 0.0, (0, center_y, 0))
    return obs


def _plain_material(name, rgb, metallic=0.0, roughness=0.5):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    A.set_input(bsdf, "Base Color", (*rgb, 1.0))
    A.set_input(bsdf, "Metallic", metallic)
    A.set_input(bsdf, "Roughness", roughness)
    return mat


def _slab(name, size, loc, mat, rot=(0, 0, 0), bevel=0.0):
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=loc)
    ob = bpy.context.active_object
    ob.name = name
    ob.scale = size
    ob.rotation_euler = rot
    if bevel:
        bpy.ops.object.transform_apply(scale=True)
        b = ob.modifiers.new("Bevel", "BEVEL")
        b.width = bevel
        b.segments = 3
        bpy.ops.object.modifier_apply(modifier="Bevel")
        bpy.ops.object.shade_smooth()
    ob.data.materials.append(mat)
    return ob


def build_laptop(loc):
    """A MacBook-style machine (user request). Modelled here because no
    quality CC0 MacBook exists to vendor — and a unibody is three beveled
    slabs with an emissive panel; it was the RETRO laptop that needed a
    scan. Display faces HIM (+y): the viewer gets the plain aluminium lid
    back, and the panel exists as the glow on his face and hands. Keyboard
    at the hinge half of the deck, trackpad at the front, like the real
    thing."""
    # Dark anodized, genuinely matte. The lid back sits at near-mirror
    # geometry between the face key and the camera — at 0.55 roughness it
    # bounced the key light straight into the lens as a pale lavender
    # sheet (its colour matched the key exactly; that was the tell).
    alu = _plain_material("MacAlu", (0.14, 0.14, 0.18), metallic=0.7,
                          roughness=0.68)
    well = _plain_material("MacKeys", (0.030, 0.030, 0.038), roughness=0.62)
    pad = _plain_material("MacPad", (0.45, 0.46, 0.52), metallic=0.8,
                          roughness=0.46)

    W, D, T = 0.21 * H, 0.145 * H, 0.005 * H
    LID_H, TILT = 0.115 * H, math.radians(20)
    x, y, z = loc
    parts = [_slab("laptop_base", (W, D, T), (x, y, z + T / 2), alu,
                   bevel=0.002 * H)]
    parts.append(_slab("laptop_keys", (0.165 * H, 0.068 * H, 0.0012 * H),
                       (x, y - 0.026 * H, z + T + 0.0006 * H), well))
    parts.append(_slab("laptop_pad", (0.056 * H, 0.038 * H, 0.0008 * H),
                       (x, y + 0.044 * H, z + T + 0.0004 * H), pad))

    hinge = Vector((x, y - D / 2 + 0.002 * H, z + T))
    up = Vector((0, -math.sin(TILT), math.cos(TILT)))
    face = Vector((0, math.cos(TILT), math.sin(TILT)))   # toward him
    parts.append(_slab("laptop_lid", (W - 0.006 * H, 0.004 * H, LID_H),
                       hinge + up * (LID_H / 2), alu, rot=(TILT, 0, 0),
                       bevel=0.0015 * H))
    parts.append(_slab("laptop_screen",
                       (W - 0.022 * H, 0.001 * H, LID_H - 0.018 * H),
                       hinge + up * (LID_H / 2) + face * 0.0028 * H,
                       _screen_material(), rot=(TILT, 0, 0)))
    return parts


def build_mug(loc):
    """The coffee vessel: a scanned insulated thermos-mug (Poly Haven,
    user asked for a better prop than the primitive cylinder). Reads as
    the big work mug it is — and a thermos is what coffee would actually
    travel in out here. Handle (asset local −x) turned out toward the
    viewer's side; base settled onto the desktop by measured bbox."""
    obs = _import_vendor("plastic_thermos")
    t = obs[0]
    t.name = "Mug"
    # Chunkier than the asset's true proportions — at scale it read as a
    # slim bottle; wider and shorter it reads as the big work mug. Handle
    # (local −x) turned toward the camera so the mug-ness shows.
    s = 0.105 * H / 0.32
    _place([t], s, math.radians(60), loc)
    t.scale = (s * 1.25, s * 1.25, s * 0.80)
    bpy.context.view_layer.update()
    zmin = min((t.matrix_world @ Vector(c)).z for c in t.bound_box)
    t.location.z += loc[2] - zmin
    return t


def build_mouse(loc):
    """A desk with a laptop and no mouse reads as staged. A squashed
    sphere, nose tipped down like a real shell, with a dark seam notch
    where the scroll wheel would be — at render size the silhouette and
    the notch are the whole vocabulary of 'mouse'."""
    mat = _plain_material("MouseShell", (0.13, 0.12, 0.17), roughness=0.30)
    bpy.ops.mesh.primitive_uv_sphere_add(
        segments=24, ring_count=16, radius=1.0,
        location=(loc[0], loc[1], loc[2] + 0.0055 * H))
    m = bpy.context.active_object
    m.name = "Mouse"
    m.scale = (0.023 * H, 0.035 * H, 0.013 * H)
    m.rotation_euler = (math.radians(-7), 0, 0)   # nose (camera side) down
    bpy.ops.object.shade_smooth()
    m.data.materials.append(mat)
    notch = _slab("mouse_notch", (0.004 * H, 0.011 * H, 0.003 * H),
                  (loc[0], loc[1] - 0.014 * H, loc[2] + 0.0145 * H),
                  _plain_material("MouseNotch", (0.02, 0.02, 0.03),
                                  roughness=0.5),
                  rot=(math.radians(-14), 0, 0))
    notch.parent = m
    notch.matrix_parent_inverse = m.matrix_world.inverted()
    return m


def _screen_material():
    """The one light source that belongs to the scene rather than the rig —
    it puts the cold edge on his hands and under his chin. 5.5 vanished in
    Cycles; the screen is the story's light, it gets to be loud."""
    mat = bpy.data.materials.new("Screen")
    mat.use_nodes = True
    nt = mat.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    em = nt.nodes.new("ShaderNodeEmission")
    em.inputs["Color"].default_value = A.hex_rgba("BFC8FF")
    em.inputs["Strength"].default_value = 11.0
    nt.links.new(em.outputs["Emission"], out.inputs["Surface"])
    return mat


# ── assembly ─────────────────────────────────────────────────────────
def build_scene(rng_seed=7):
    # The rock stays procedural (asteroid.py's) — a scanned moon rock was
    # tried and read as a boulder ledge, not a tiny planet. The carved
    # craters and pointiness shader are the asteroid's identity.
    import random
    rng = random.Random(rng_seed)

    # Scene FIRST: reset_scene() reloads factory settings and silently
    # discards any render config made before it (that cost a day of
    # accidentally-EEVEE renders).
    A.reset_scene()
    A.setup_world()
    A.setup_lighting()

    arm, meshes, prefix = import_figure()
    fit_figure(arm, prefix)
    recolor_skin()

    # Fit the furniture to the animation — to the WHOLE window of it, not
    # one frame. The desk was first set from a single mid-clip sample, and
    # every deeper keystroke drove the fingers through the laptop deck. The
    # wrists' minimum over the loop is what the desk must clear: fingertips
    # reach ~0.06H below the wrist bone, and the laptop deck stands 0.031H
    # proud of the desk.
    # Fit to the FINGERTIPS, not the wrists. The wrist version assumed the
    # fingers hang ~0.066H below the wrist, but this clip types with flat
    # hands — tips sit level with the wrist — so the desk landed 6.5cm too
    # low and his hands floated over the keys for the whole loop (the lid
    # hid the gap from camera; the numbers did not).
    tip_bones = [f"{side}Hand{f}3" for side in ("Left", "Right")
                 for f in ("Index", "Middle", "Ring", "Pinky")]
    rtips = [f"RightHand{f}3" for f in ("Index", "Middle", "Ring", "Pinky")]
    min_tip = 1e9
    rest_spot, rest_x = None, 1e9
    for f in range(CLIP_START, CLIP_START + CLIP_LEN + 1, 3):
        bpy.context.scene.frame_set(f)
        bpy.context.view_layer.update()
        for bn in tip_bones:
            pb = arm.pose.bones.get(f"{prefix}:{bn}")
            if pb:
                min_tip = min(min_tip, (arm.matrix_world @ pb.tail).z)
        # Where his right hand parks when it leaves the keyboard — that is
        # where a mouse belongs. Put it anywhere else and the clip's
        # side-rest gesture is a hand hovering over bare desk while an
        # untouched mouse sits nearby.
        #
        # Anchor it under the PALM, not the fingertips: this clip stretches
        # the fingers ~0.11H forward of the wrist, so a mouse at the
        # fingertip centroid sits out past his hand instead of under it.
        pts = [(arm.matrix_world @ arm.pose.bones[f"{prefix}:{b}"].tail)
               for b in rtips if arm.pose.bones.get(f"{prefix}:{b}")]
        if pts:
            tips_c = sum(pts, Vector()) / len(pts)
            wrist = arm.matrix_world @ arm.pose.bones[f"{prefix}:RightHand"].head
            c = wrist + (tips_c - wrist) * 0.35     # under the palm
            if c.x < rest_x:
                rest_x, rest_spot = c.x, c.copy()

    bpy.context.scene.frame_set(CLIP_START + CLIP_LEN // 2)
    bpy.context.view_layer.update()
    lh = bone_w(arm, prefix, "LeftHand")
    rh = bone_w(arm, prefix, "RightHand")
    hips = bone_w(arm, prefix, "Hips")
    hands = (lh + rh) / 2
    print(f"[desk] hands at {tuple(round(v / H, 3) for v in hands)}H, "
          f"min fingertip {round(min_tip / H, 3)}H, "
          f"hips at {tuple(round(v / H, 3) for v in hips)}H")

    # The laptop deck stands 0.0056H proud of the desk, so this puts the
    # key surface a hair under the lowest fingertip of the whole loop —
    # keystrokes bottom out on the keys, and the hand lifts between them.
    desk_top = min_tip - 0.0076 * H
    # Desk shifted toward his mug side so the cup sits well inside the top
    # rather than teetering on the corner (user catch).
    desk_cx = rh.x - 0.075 * H
    props = build_desk(desk_top, hands.y - 0.085 * H, desk_cx)
    props += build_chair(hips.z - 0.030 * H, hips.y + 0.015 * H)
    # The laptop sits a hand's reach BEYOND the wrists: fingertips extend
    # ~0.06H past the wrist bone, and with the machine any closer they
    # pierce the lid at the hinge.
    props += build_laptop((hands.x, hands.y - 0.075 * H, desk_top))
    # Desktop layout, laptop outward: mouse close by the machine, mug
    # fully OUTBOARD of the typing clip's side-rest gesture — that hand
    # hovers at cap height around 0.20H out, and every closer placement
    # put fingertips through the ceramic or the cap (user catches, three
    # of them). The IK reach targets the mug wherever it sits, so pushing
    # it out costs nothing. Sunk a touch for a firm contact line.
    # Placement solved, not guessed. Two hard constraints fight here: far
    # enough out that the typing clip's side-rest fingers clear the cup
    # (they were piercing the cap), near enough that his arm can actually
    # REACH it — at 0.245H out, shoulder-to-mug was 0.489H against a
    # 0.379H reach, so the IK stretched and stopped short and he "held" the
    # cup in mid-air. A grid search over the desk top against the finger
    # envelope and the laptop put the best compromise here, at 0.91 of
    # full reach with ~1.5cm of finger clearance.
    # Mouse under his parked hand; mug outboard of it, clear of both the
    # mouse and the hand that rests on it.
    mouse = build_mouse((rest_spot.x, rest_spot.y, desk_top))
    props.append(mouse)
    mug = build_mug((rest_spot.x - 0.080 * H, rest_spot.y - 0.055 * H,
                     desk_top - 0.002 * H))
    print(f"[desk] mouse at {tuple(round(v / H, 3) for v in rest_spot)}H, "
          f"mug at {tuple(round(v / H, 3) for v in mug.location)}H")

    ast = A.build_asteroid(rng)

    # Everything hangs off one empty so the drop onto the rock is a single
    # transform. Sunk 0.055H: the rock falls away from its summit and
    # slightly buried feet read as grounded; floating furniture reads as a
    # bug.
    root = bpy.data.objects.new("DeskRoot", None)
    bpy.context.collection.objects.link(root)
    bpy.context.view_layer.update()
    hit, loc, _n, _i = ast.ray_cast(Vector((0, 0.10 * H, 3.0)),
                                    Vector((0, 0, -1)))
    top = loc.z if hit else 1.0
    for ob in [arm] + props + [mug]:
        ob.parent = root
        ob.matrix_parent_inverse = root.matrix_world.inverted()
    # Centre the ASSEMBLY over the rock's summit, not the figure: the desk
    # is shifted toward his mug side, and with a fixed nudge the desk's
    # left legs hung off the rock into space (user catch). Splitting the
    # difference between desk centre and figure centre puts the visual
    # mass over the stone.
    root.location = (-desk_cx / 2, 0, top - 0.055 * H)
    bpy.context.view_layer.update()

    # His own key light: the rig's lights all track the origin — the rock's
    # belly, a full unit below his face. Soft, cool, from over the screen,
    # the direction the story says the light comes from.
    head = bone_w(arm, prefix, "Head")
    face_key = bpy.data.lights.new("face_key", "AREA")
    face_key.color = A.hex_rgb("CBD2FF")
    face_key.energy = 85
    face_key.size = 0.9
    fk = bpy.data.objects.new("face_key", face_key)
    bpy.context.collection.objects.link(fk)
    fk.location = head + Vector((-0.40 * H, -1.05 * H, 0.42 * H))
    fk.rotation_mode = "QUATERNION"
    fk.rotation_quaternion = (head - fk.location).to_track_quat("-Z", "Y")

    return {"arm": arm, "prefix": prefix, "ast": ast, "mug": mug,
            "root": root, "props": props, "mouse": mouse,
            "desk_top": desk_top}


def parse_args():
    argv = sys.argv
    argv = argv[argv.index("--") + 1:] if "--" in argv else []
    opts = {"mode": "still", "res": 700, "samples": 120, "frames": FRAMES}
    for i in range(0, len(argv) - 1, 2):
        k = argv[i].lstrip("-")
        if k in opts:
            opts[k] = argv[i + 1] if k == "mode" else int(argv[i + 1])
    return opts


def main():
    opts = parse_args()
    scene = build_scene()
    A.setup_render(opts["res"], opts["samples"])
    A.setup_compositor()

    arm, prefix, ast = scene["arm"], scene["prefix"], scene["ast"]
    mug = scene["mug"]
    rig = PoseRig(arm, arm.animation_data.action,
                  load_drink_action(prefix), prefix)

    out = os.path.join(os.getcwd(), "public", "asteroid")
    os.makedirs(out, exist_ok=True)

    cam = A.setup_camera()
    rig.apply(("T", CLIP_START))
    # Higher angle than the rider's hero shot: it foreshortens the desk,
    # shows the desktop instead of a metal wall, and — with the shortened
    # lid — keeps the typing hands visible over the laptop.
    A.frame_object(cam, [ast, arm] + scene["props"], margin=1.30,
                   direction=(0.40, -1.0, 0.60))
    head_w = bone_w(arm, prefix, "Head")
    cam.data.dof.focus_distance = (Vector(cam.location) - head_w).length
    cam.data.dof.aperture_fstop = 2.8

    # ── the pickup ───────────────────────────────────────────────────
    # THE CUP IS AUTHORED; THE HAND IS DRIVEN TO IT.
    #
    # Everything before this derived the cup from the hand, and the hand
    # was never where the cup needed to be: welding it to the wrist left it
    # floating beside the fingers, pinning it to the palm put it at his
    # EYES, and tilting it toward the head pressed it against his FOREHEAD.
    # The cup has exactly two places it belongs — its spot on the desk, and
    # rim-to-lips — so those are authored directly and IK moves the arm to
    # follow. Nothing about the cup depends on the solver's accuracy.
    rest_matrix = mug.matrix_world.copy()
    _, rot_up, mug_scale = rest_matrix.decompose()
    hand_pb = arm.pose.bones[f"{prefix}:RightHand"]

    def _joint(name):
        pb = arm.pose.bones.get(f"{prefix}:{name}")
        return (arm.matrix_world @ pb.matrix).translation if pb else None

    # Where his mouth actually is, measured off the FACE MESH once and kept
    # in head-bone space so it tracks the head through the dip. Guessing an
    # offset off the head bone is what put the cup at eye level twice.
    mouth_local = face_mouth_local(arm, prefix)

    # The thermos's origin sits at its BASE (measured: 0% of its height),
    # so "put the cup at the palm" put his hand under the cup with the body
    # standing up above his fist. Both the rim and the grip band are taken
    # from the mesh's own local extent instead of assuming a centred origin.
    _bb = [Vector(c) for c in mug.bound_box]
    z_lo, z_hi = min(v.z for v in _bb), max(v.z for v in _bb)
    z_grip = z_lo + 0.45 * (z_hi - z_lo)        # where a hand actually holds
    rim_off = z_hi * mug_scale.z                # origin → rim, world units

    def head_frame():
        m = arm.matrix_world @ arm.pose.bones[f"{prefix}:Head"].matrix
        return Matrix.LocRotScale(m.translation, m.to_quaternion(),
                                  Vector((1, 1, 1)))

    def sip_matrix():
        """Cup tipped to drink, rim at the lips, tracking his head."""
        hf = head_frame()
        mouth = hf @ mouth_local
        face = (hf.to_3x3() @ Vector((0, 0, 1))).normalized()   # +z is front
        # From the cup's centre the rim goes up and back toward his face;
        # the body hangs forward and down, which is how a cup sits when you
        # actually drink from it.
        axis = (Vector((0, 0, 1)) * math.cos(math.radians(34))
                - face * math.sin(math.radians(34))).normalized()
        centre = mouth - axis * rim_off + face * 0.004 * H
        return (Matrix.Translation(centre)
                @ axis.to_track_quat("Z", "Y").to_matrix().to_4x4()
                @ Matrix.Diagonal((*mug_scale, 1.0)))

    ik_tgt = bpy.data.objects.new("mug_ik_target", None)
    bpy.context.collection.objects.link(ik_tgt)
    ik = hand_pb.constraints.new("IK")
    ik.target = ik_tgt
    ik.chain_count = 4              # include the clavicle: a 3-bone chain
    ik.use_rotation = False         # could not reach without shrugging
    ik.influence = 0.0

    def palm_now():
        m2 = _joint("RightHandMiddle2") or _joint("RightHandMiddle1")
        t2 = _joint("RightHandThumb3") or _joint("RightHandThumb2")
        return ((m2 + t2) / 2 if m2 and t2
                else (arm.matrix_world @ hand_pb.matrix).translation)

    def aim_palm_at(point, iters=6):
        """Put the PALM on `point`, not the wrist and not the bone tail.

        Blender's IK drives the constrained bone's TAIL to the target, and
        the palm is further along still, so a target placed at the mug left
        the arm a hand-length short every time. Rather than deriving that
        offset analytically (it changes with every pose), solve, measure
        where the palm actually landed, and walk the target by the error.
        Converges in two or three passes.
        """
        was = ik.influence
        ik.influence = 1.0
        ik_tgt.location = point
        for _ in range(iters):
            bpy.context.view_layer.update()
            err = point - palm_now()
            if err.length < 1e-4:
                break
            ik_tgt.location = ik_tgt.location + err
        ik.influence = was

    # ── the mouse moves with his hand ────────────────────────────────
    # A fixed mouse with a hand sliding back and forth over it reads as a
    # hand swiping at a stationary lump — the hand is on it for one cell
    # and past it for the next. A real mouse travels under the palm.
    #
    # Driven as a pure function of the pose (no carried state) so the loop
    # seam stays exact: near-and-low hand pulls the mouse under the palm,
    # a lifted or keyboard-bound hand lets it sit at its home spot.
    # WORLD space throughout. The props are parented to the scene root, so
    # `mouse.location` is in the pre-root frame while the bones report
    # world — comparing the two made the gating distance enormous and the
    # mouse never budged (travel range measured exactly 0.0000H).
    mouse = scene["mouse"]
    bpy.context.view_layer.update()
    mouse_rest_mw = mouse.matrix_world.copy()
    mouse_home = mouse_rest_mw.translation.copy()
    desk_z = mouse_home.z
    MOUSE_NEAR, MOUSE_FAR, MOUSE_TRAVEL = 0.055 * H, 0.130 * H, 0.022 * H

    def palm_ground():
        """Point under his right palm, on the desk plane."""
        wrist = arm.matrix_world @ hand_pb.head
        tips = [(arm.matrix_world @ arm.pose.bones[f"{prefix}:RightHand{f}3"].tail)
                for f in ("Index", "Middle", "Ring", "Pinky")
                if arm.pose.bones.get(f"{prefix}:RightHand{f}3")]
        c = wrist + ((sum(tips, Vector()) / len(tips)) - wrist) * 0.35
        return c, (c.z - desk_z)

    def mouse_offset():
        c, height = palm_ground()
        flat = Vector((c.x, c.y, mouse_home.z))
        d = flat - mouse_home
        near = 1.0 - _ease((d.length - MOUSE_NEAR) / (MOUSE_FAR - MOUSE_NEAR))
        low = 1.0 - _ease((height - 0.050 * H) / (0.050 * H))
        off = d * (near * low)
        return (off.normalized() * MOUSE_TRAVEL
                if off.length > MOUSE_TRAVEL else off)

    n = opts["frames"]
    cells = schedule(n)

    # Raw per-cell offsets darted up to 7cm in a single 200ms step when his
    # hand swung back from the drink. Smoothing them CIRCULARLY damps that
    # to a hand-sized nudge and, because the kernel wraps, keeps cell 47
    # continuous with cell 0.
    _raw = []
    for c in cells:
        rig.apply(*c[:2])
        bpy.context.view_layer.update()
        _raw.append(mouse_offset())
    _K = (1, 4, 6, 4, 1)
    mouse_track = []
    for i in range(n):
        acc, tot = Vector((0, 0, 0)), 0
        for k, w in enumerate(_K):
            acc += _raw[(i + k - 2) % n] * w
            tot += w
        mouse_track.append(acc / tot)
    _moves = [(mouse_track[i] - mouse_track[i - 1]).length / H for i in range(n)]
    print(f"[desk] mouse travel max step {max(_moves):.4f}H "
          f"range {max(v.length for v in mouse_track) / H:.4f}H")

    def set_cell(cur, blend, ikv, journey, held, idx=-1):
        rig.apply(cur, blend)
        mouse.matrix_world = (
            Matrix.Translation(mouse_track[idx % n] if idx >= 0
                               else mouse_track[0]) @ mouse_rest_mw)

        # Where the cup belongs this frame — authored, never inferred.
        if journey <= 0.0:
            cup = rest_matrix
        else:
            sip = sip_matrix()
            rl, rr, _ = rest_matrix.decompose()
            sl, sr, _ = sip.decompose()
            cup = (Matrix.Translation(rl.lerp(sl, journey))
                   @ rr.slerp(sr, journey).to_matrix().to_4x4()
                   @ Matrix.Diagonal((*mug_scale, 1.0)))

        # The palm goes to the cup's GRIP BAND, not its origin — the origin
        # is the base, and aiming there had him carrying the cup by the
        # bottom with the body above his fist.
        grip_w = cup @ Vector((0.0, 0.0, z_grip))
        if ikv > 0.0:
            # Solve at full influence so the empty ends up where the palm
            # meets the cup, then dial the influence back — during the
            # reach that gives a hand travelling toward the cup, not
            # snapped onto it.
            aim_palm_at(grip_w)
        ik.influence = ikv
        bpy.context.view_layer.update()
        mug.matrix_world = cup
        bpy.context.view_layer.update()

        if held and idx >= 0:
            # Three invariants, measured rather than eyeballed — each one
            # is a bug that got past me by looking at pictures. The cup
            # must be in his hand, it must be at his MOUTH during the sip
            # (it ended up at his eyes, then his forehead), and it must be
            # on its desk spot at the grab and the put-down.
            m2 = _joint("RightHandMiddle2") or _joint("RightHandMiddle1")
            t2 = _joint("RightHandThumb3") or _joint("RightHandThumb2")
            gap = ((m2 + t2) / 2 - grip_w).length if m2 and t2 else 0.0
            rim = cup @ Vector((0.0, 0.0, z_hi))
            mouth_w = head_frame() @ mouth_local
            to_mouth = (rim - mouth_w).length
            drift = (cup.translation - rest_matrix.translation).length
            bad = []
            if gap / H > 0.025:
                bad.append("NOT IN HAND")
            if journey > 0.99 and to_mouth / H > 0.03:
                bad.append("RIM NOT AT MOUTH")
            if journey < 0.01 and drift / H > 0.02:
                bad.append("OFF ITS SPOT")
            print(f"[desk] cell {idx:02d} j{journey:.2f} hand{gap / H:.3f} "
                  f"rim->mouth {to_mouth / H:.3f} desk {drift / H:.3f}"
                  + ("  <-- " + ", ".join(bad) if bad else ""))

    if opts["mode"] == "still":
        set_cell(*cells[0])
        A.render_to(os.path.join(out, "_desk-still.png"))
        return

    if opts["mode"] == "check":
        # Landmarks: typing, mid-reach, grab, sip, put-down, wrap blend.
        n1 = (3 * n) // 8
        for i in (2, n1 + 2, n1 + 4, n1 + 9, n1 + 13, n - 3):
            set_cell(*cells[i], idx=i)
            A.render_to(os.path.join(out, f"_desk-check-{i:03d}.png"))
        return

    frames_dir = os.path.join(out, "_deskframes")
    os.makedirs(frames_dir, exist_ok=True)
    for stale in os.listdir(frames_dir):
        if stale.endswith(".png"):
            os.remove(os.path.join(frames_dir, stale))

    for i, cell in enumerate(cells):
        set_cell(*cell, idx=i)
        A.render_to(os.path.join(frames_dir, f"f{i:03d}.png"))
    print(f"[desk] {n} frames in {frames_dir}")


if __name__ == "__main__":
    main()

"""
The same figure and the same rock, sitting at a desk in space.

    /Applications/Blender.app/Contents/MacOS/Blender --background \
        --python scripts/blender/desk.py -- --mode still

Reuses asteroid.py wholesale — the CC0 body, the rig, the garment cutter, the
hair, the rock, the lighting and the render setup all come from there. What is
new here is a seated pose, four props, a suit instead of a cape, and an
animation loop where he types and stops to drink.

The props are procedural for the same reason the figure is not: a desk really
is a box on legs and a laptop really is two hinged boxes, so modelling them
exactly to fit this figure costs less than sourcing, licensing, rescaling and
reorienting someone else's. Anatomy was the opposite trade, which is why the
body is a sculpted download.

The rock does not rotate here. A man working at a desk implies a frame of
reference; spinning it underneath him would fight that.
"""

import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import bpy                                    # noqa: E402
from mathutils import Vector                  # noqa: E402

import asteroid as A                          # noqa: E402

H = 1.45                    # figure height, same units as the rider scene
FRAMES = 48

# ── seated pose ──────────────────────────────────────────────────────
# Sign conventions taken from the standing pose in asteroid.py: negative X on a
# thigh swings it forward, positive X on a shin bends the knee back.
SEATED = {
    "spine":       (-5, 0, 0),
    "chest":       (-7, 0, 0),
    "neck":        (12, 0, 0),      # looking down at the screen
    "head":        (9, 0, -4),
    "thigh.L":     (-84, 0, 4),
    "shin.L":      (79, 0, 0),
    "foot.L":      (10, 0, 0),
    "thigh.R":     (-84, 0, -4),
    "shin.R":      (79, 0, 0),
    "foot.R":      (10, 0, 0),
    "shoulder.L":  (0, 0, -6),
    "shoulder.R":  (0, 0, 6),
    "upper_arm.L": (-34, 0, -16),
    "forearm.L":   (-62, 0, 0),
    "hand.L":      (-10, 0, 0),
    "upper_arm.R": (-34, 0, 16),
    "forearm.R":   (-62, 0, 0),
    "hand.R":      (-10, 0, 0),
}

# Prop geometry, all in figure heights. Chair seat at 0.26H and desk top at
# 0.42H are the real-world ratios for a person this tall (about 45cm and 72cm
# at 1.7m), which is what stops the scene reading as doll furniture.
SEAT_Z = 0.262
DESK_Z = 0.415
DESK_W, DESK_D, DESK_T = 0.62, 0.30, 0.012
MUG_X = -0.185              # character's right, which is the viewer's left


def box(name, size, loc, mat, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=loc)
    ob = bpy.context.active_object
    ob.name = name
    ob.scale = size
    ob.rotation_euler = rot
    ob.data.materials.append(mat)
    return ob


def build_desk(mats):
    top = box("desk_top", (DESK_W * H, DESK_D * H, DESK_T * H),
              (0, 0.02 * H, DESK_Z * H), mats["wood"])
    legs = []
    for sx in (-1, 1):
        for sy in (-1, 1):
            legs.append(box(
                f"desk_leg_{sx}_{sy}",
                (0.016 * H, 0.016 * H, DESK_Z * H),
                (sx * (DESK_W / 2 - 0.03) * H,
                 0.02 * H + sy * (DESK_D / 2 - 0.03) * H,
                 DESK_Z * H / 2),
                mats["metal"]))
    return [top] + legs


def build_chair(mats):
    seat = box("chair_seat", (0.24 * H, 0.24 * H, 0.014 * H),
               (0, 0.26 * H, SEAT_Z * H), mats["fabric"])
    back = box("chair_back", (0.23 * H, 0.014 * H, 0.20 * H),
               (0, 0.375 * H, (SEAT_Z + 0.18) * H), mats["fabric"],
               rot=(math.radians(-8), 0, 0))
    post = box("chair_post", (0.020 * H, 0.020 * H, SEAT_Z * H),
               (0, 0.26 * H, SEAT_Z * H / 2), mats["metal"])
    feet = []
    for a in range(4):
        th = math.pi / 4 + a * math.pi / 2
        feet.append(box(f"chair_foot_{a}",
                        (0.11 * H, 0.014 * H, 0.010 * H),
                        (math.cos(th) * 0.07 * H,
                         0.26 * H + math.sin(th) * 0.07 * H, 0.012 * H),
                        mats["metal"], rot=(0, 0, th)))
    return [seat, back, post] + feet


def build_laptop(mats):
    """Two hinged boxes. The screen leans back past vertical, which is how
    people actually set them, and it catches the key light that way."""
    base = box("laptop_base", (0.17 * H, 0.12 * H, 0.006 * H),
               (0, -0.03 * H, (DESK_Z + DESK_T / 2 + 0.003) * H), mats["shell"])
    keys = box("laptop_keys", (0.150 * H, 0.085 * H, 0.001 * H),
               (0, -0.045 * H, (DESK_Z + DESK_T / 2 + 0.007) * H), mats["dark"])
    lid = box("laptop_lid", (0.17 * H, 0.005 * H, 0.115 * H),
              (0, 0.045 * H, (DESK_Z + DESK_T / 2 + 0.055) * H), mats["shell"],
              rot=(math.radians(-14), 0, 0))
    screen = box("laptop_screen", (0.155 * H, 0.002 * H, 0.100 * H),
                 (0, 0.041 * H, (DESK_Z + DESK_T / 2 + 0.055) * H),
                 mats["screen"], rot=(math.radians(-14), 0, 0))
    return [base, keys, lid, screen]


def build_mug(mats):
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=28, radius=0.030 * H, depth=0.055 * H,
        location=(MUG_X * H, -0.01 * H, (DESK_Z + DESK_T / 2 + 0.028) * H))
    body = bpy.context.active_object
    body.name = "mug"
    body.data.materials.append(mats["mug"])
    bpy.ops.object.shade_smooth()

    bpy.ops.mesh.primitive_torus_add(
        major_radius=0.020 * H, minor_radius=0.005 * H,
        location=(body.location.x - 0.032 * H, body.location.y, body.location.z),
        rotation=(math.radians(90), 0, 0))
    handle = bpy.context.active_object
    handle.name = "mug_handle"
    handle.data.materials.append(mats["mug"])
    bpy.ops.object.shade_smooth()

    bpy.ops.object.select_all(action="DESELECT")
    body.select_set(True)
    handle.select_set(True)
    bpy.context.view_layer.objects.active = body
    bpy.ops.object.join()
    mug = bpy.context.active_object
    mug.name = "Mug"
    return mug


def prop_materials():
    return {
        "wood":   A.fabric_material("DeskTop", "2A2430", roughness=0.42, sheen=0.0),
        "metal":  A.fabric_material("PropMetal", "17151E", roughness=0.34, sheen=0.0),
        "fabric": A.fabric_material("ChairFabric", "22203A", roughness=0.78, sheen=0.3),
        "shell":  A.fabric_material("LaptopShell", "3A3648", roughness=0.28, sheen=0.0),
        "dark":   A.fabric_material("Keys", "0D0C12", roughness=0.55, sheen=0.0),
        "screen": _screen_material(),
        "mug":    A.fabric_material("Mug", "6E6A86", roughness=0.30, sheen=0.0),
    }


def _screen_material():
    """The screen is the only light source in the scene that belongs to the
    scene rather than to the lighting rig, and it is what sells the shot — it
    puts a cold edge on his hands and under his chin."""
    mat = bpy.data.materials.new("Screen")
    mat.use_nodes = True
    nt = mat.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    em = nt.nodes.new("ShaderNodeEmission")
    em.inputs["Color"].default_value = A.hex_rgba("BFC8FF")
    em.inputs["Strength"].default_value = 5.5
    nt.links.new(em.outputs["Emission"], out.inputs["Surface"])
    return mat




# ── animation ────────────────────────────────────────────────────────
# One loop: he types, reaches for the mug, drinks, puts it back, resumes.
# Phase boundaries as fractions of the loop. Frame N-1 has to land back where
# frame 0 starts, so the sip is fully contained and the typing brackets it.
PH_REACH = (0.52, 0.60)     # keyboard → mug
PH_LIFT  = (0.60, 0.68)     # mug → mouth
PH_HOLD  = (0.68, 0.76)     # drinking
PH_LOWER = (0.76, 0.85)     # mouth → desk
PH_BACK  = (0.85, 0.95)     # mug released, hand → keyboard


def _seg(t, span):
    """Progress 0→1 through a phase, eased. Outside the phase it clamps, so
    each phase can be written independently and simply summed."""
    a, b = span
    if t <= a:
        return 0.0
    if t >= b:
        return 1.0
    x = (t - a) / (b - a)
    return x * x * (3 - 2 * x)          # smoothstep: no velocity jump at joins


def pose_for_frame(i, n):
    """Seated pose plus this frame's motion.

    Typing is a small out-of-phase oscillation on the forearms and wrists
    rather than finger animation — the base mesh has no finger bones, and at
    the size this renders the wrist bob is what reads as typing anyway.
    """
    t = i / n
    pose = dict(SEATED)

    # He types with both hands until the right one goes for the mug, then
    # one-handed until it comes back.
    #
    # This gate used to apply to BOTH hands, which broke the loop: the left
    # hand was typing at frame 0 and idle at frame N, so the two ends did not
    # meet. Only the hand actually holding something should stop.
    busy_r = _seg(t, PH_REACH) - _seg(t, PH_BACK)
    typing_l = 1.0
    typing_r = 1.0 - busy_r
    # Integer cycles per loop, or the keystroke rhythm jumps at the seam.
    beat = 2 * math.pi * t * 9.0

    def add(bone, d):
        rx, ry, rz = pose[bone]
        pose[bone] = (rx + d[0], ry + d[1], rz + d[2])

    add("forearm.L", (math.sin(beat) * 2.6 * typing_l, 0, 0))
    add("hand.L", (math.sin(beat + 0.7) * 7.0 * typing_l, 0, 0))
    add("forearm.R", (math.sin(beat + math.pi * 0.6) * 2.6 * typing_r, 0, 0))
    add("hand.R", (math.sin(beat + math.pi * 0.6 + 0.7) * 7.0 * typing_r, 0, 0))
    add("chest", (math.sin(2 * math.pi * t) * 1.2, 0, 0))   # breathing

    # Reach: the arm swings out toward the mug and the elbow opens.
    reach = _seg(t, PH_REACH) - _seg(t, PH_BACK)
    add("upper_arm.R", (14 * reach, 0, 26 * reach))
    add("forearm.R", (18 * reach, 0, 0))

    # Lift and lower share one curve, so the mug rises and falls on one path.
    lift = _seg(t, PH_LIFT) - _seg(t, PH_LOWER)
    add("upper_arm.R", (-40 * lift, 0, -18 * lift))
    add("forearm.R", (-72 * lift, 0, 0))
    add("hand.R", (-14 * lift, 0, 0))
    # He meets the mug halfway rather than keeping his head rigid.
    add("neck", (-9 * lift, 0, 0))
    add("head", (-7 * lift, 0, 4 * lift))

    return pose, lift


def apply_pose(arm, pose):
    for name, (rx, ry, rz) in pose.items():
        pb = arm.pose.bones.get(name)
        if not pb:
            continue
        pb.rotation_mode = "XYZ"
        pb.rotation_euler = (math.radians(rx), math.radians(ry), math.radians(rz))


def place_mug(mug, arm, rest_matrix, lift, grip_offset):
    """Mug on the desk, or in his hand once he has hold of it.

    Blended by the same `lift` curve that drives the arm, so the hand and the
    mug are never out of step — no constraint to switch on and off, and the
    handoff at either end is exact because lift is 0 there.
    """
    if lift <= 0.001:
        mug.matrix_world = rest_matrix
        return
    hand = arm.pose.bones.get("hand.R")
    if not hand:
        return
    held = arm.matrix_world @ hand.matrix @ grip_offset
    mug.matrix_world = rest_matrix.lerp(held, min(1.0, lift * 1.6))


# ── the suit ─────────────────────────────────────────────────────────
PURPLE = "463A6B"           # deep aubergine, reads as tailoring not costume
PURPLE_DK = "2C2445"        # trousers and tie, a shade down
SHIRT = "D6D2E4"

def _carve_v(jacket, H):
    """Cut a V out of the jacket front so the shirt and tie show through.

    Without it the jacket is a closed shell over the chest and the whole thing
    reads as a bodysuit again — an unbroken torso is most of what made the
    first outfit look like a costume. The V is what says lapels.
    """
    import bmesh
    bm = bmesh.new()
    bm.from_mesh(jacket.data)
    bm.verts.ensure_lookup_table()
    doomed = []
    for v in bm.verts:
        wp = jacket.matrix_world @ v.co
        nrm = (jacket.matrix_world.to_3x3() @ v.normal).normalized()
        if nrm.y > -0.35:                      # front-facing only
            continue
        z = wp.z / H
        if not (0.575 < z < 0.815):
            continue
        # widens toward the collar, closes to a point at the fastening
        half = 0.012 + 0.085 * (z - 0.575) / 0.24
        if abs(wp.x / H) < half:
            doomed.append(v)
    if doomed:
        bmesh.ops.delete(bm, geom=doomed, context="VERTS")
    bm.to_mesh(jacket.data)
    bm.free()
    print(f"[desk] v-neck: removed {len(doomed)} jacket verts")


def build_suit(body):
    """Trousers, shirt, jacket, tie — cut from the body, no panel seams.

    Deliberately no seam mask. The procedural panelling is what made the last
    outfit read as a super-suit; real tailoring has a lapel and a shoulder
    line, not a grid.
    """
    cloth = A.fabric_material("SuitPurple", PURPLE, roughness=0.74, sheen=0.22)
    dark = A.fabric_material("SuitDark", PURPLE_DK, roughness=0.76, sheen=0.18)
    shirt_m = A.fabric_material("Shirt", SHIRT, roughness=0.62, sheen=0.35,
                                weave=210.0)

    worn = []
    # shirt first and tight, so the jacket sits over it
    worn.append(A.garment_from_groups(
        "Shirt", body, ("chest", "spine", "neck"), H, 0.008, shirt_m,
        thickness=0.004, relax=6))
    worn.append(A.garment_from_groups(
        "Trousers", body, ("thigh.L", "thigh.R", "shin.L", "shin.R"),
        H, 0.011, dark, relax=8))
    worn.append(A.garment_from_groups(
        "Shoes", body, ("foot.L", "foot.R"), H, 0.013, dark,
        thickness=0.018, relax=4, remesh=0.010))

    jacket = A.garment_from_groups(
        "Jacket", body,
        ("chest", "spine", "hips", "shoulder.L", "shoulder.R",
         "upper_arm.L", "upper_arm.R", "forearm.L", "forearm.R"),
        H, 0.020, cloth, thickness=0.014, relax=10, remesh=0.013)
    if jacket:
        _carve_v(jacket, H)
        worn.append(jacket)

    # tie: a narrow tapered strip down the shirt, inside the V
    rings = []
    for i in range(13):
        t = i / 12
        z = 0.795 - 0.20 * t
        w = 0.012 + 0.016 * t ** 1.4
        ring = []
        for j in range(9):
            a = -0.5 + j / 8
            ring.append((a * 2 * w * H,
                         -(0.070 + 0.012 * t) * H - abs(a) * 0.012 * H,
                         z * H))
        rings.append(ring)
    worn.append(A._mesh_from_rings("Tie", rings, dark, closed=False,
                                   thickness=H * 0.004))
    return [w for w in worn if w]


def build_rig(height):
    """The armature, at rest. Nothing is bound yet."""
    k = height / A.HUMAN_REST_H
    bpy.ops.object.armature_add(enter_editmode=False, location=(0, 0, 0))
    arm = bpy.context.active_object
    arm.name = "DeskRig"
    bpy.context.view_layer.objects.active = arm
    bpy.ops.object.mode_set(mode="EDIT")
    ebs = arm.data.edit_bones
    for b in list(ebs):
        ebs.remove(b)
    for name, head, tail, parent, connect in A.BONES:
        b = ebs.new(name)
        b.head = Vector(head) * k
        b.tail = Vector(tail) * k
        if parent:
            b.parent = ebs[parent]
            b.use_connect = connect
    bpy.ops.object.mode_set(mode="OBJECT")
    return arm


def bind_auto(arm, objects):
    """Bind with automatic weights — for meshes that have no groups yet."""
    objects = [o for o in objects if o]
    if not objects:
        return
    bpy.ops.object.select_all(action="DESELECT")
    for ob in objects:
        ob.select_set(True)
    arm.select_set(True)
    bpy.context.view_layer.objects.active = arm
    bpy.ops.object.parent_set(type="ARMATURE_AUTO")


def bind_existing(arm, objects):
    """Attach meshes that ALREADY carry the body's vertex groups.

    Garments are duplicates of the body, so they inherit its groups verbatim.
    Re-deriving weights for them would be wasted work and would risk a
    different result than the skin underneath, which shows up as cloth
    swimming over the body mid-animation.
    """
    for ob in objects:
        if not ob:
            continue
        ob.parent = arm
        ob.matrix_parent_inverse = arm.matrix_world.inverted()
        m = ob.modifiers.new("Armature", "ARMATURE")
        m.object = arm


def build_scene(rng_seed=7):
    import random
    rng = random.Random(rng_seed)

    A.reset_scene()
    A.setup_world()
    A.setup_lighting()

    body, eyes = A.import_human(H)

    # Bake multires into the mesh before anything duplicates the body.
    # garment_from_groups deletes vertices from its copy, and a multires
    # modifier cannot be applied to a mesh whose topology has changed under it
    # — "Multires modifier returned error, skipping apply". In the rider scene
    # the pose bake happened to flatten it first; here the rig stays live, so
    # it has to be done deliberately.
    bpy.ops.object.select_all(action="DESELECT")
    body.select_set(True)
    bpy.context.view_layer.objects.active = body
    for m in list(body.modifiers):
        if m.type == "MULTIRES":
            bpy.ops.object.modifier_apply(modifier=m.name)
            print(f"[desk] baked multires -> {len(body.data.vertices)} verts")

    # Rig BEFORE cutting the suit. garment_from_groups selects by vertex group,
    # and those groups only exist once automatic weights have run — cutting
    # first returned "no vertices matched" for every garment.
    arm = build_rig(H)
    bind_auto(arm, [body] + list(eyes))

    worn = build_suit(body)
    bind_existing(arm, worn)

    skull_ctr, skull_r = A.head_sphere(body, H)
    hair = A.build_hair(H, body, skull_ctr, skull_r)
    brows = A.build_brows(H, body, [e.location.copy() for e in eyes])
    bind_auto(arm, [hair] + brows)

    mats = prop_materials()
    props = build_desk(mats) + build_chair(mats) + build_laptop(mats)
    mug = build_mug(mats)

    ast = A.build_asteroid(rng)

    # Sit the whole arrangement on the rock. Everything hangs off one empty so
    # the drop is a single transform rather than a per-object offset.
    root = bpy.data.objects.new("DeskRoot", None)
    bpy.context.collection.objects.link(root)
    bpy.context.view_layer.update()
    hit, loc, _n, _i = ast.ray_cast(Vector((0, 0.10 * H, 3.0)), Vector((0, 0, -1)))
    top = loc.z if hit else 1.0
    for ob in [arm] + props + [mug]:
        ob.parent = root
        ob.matrix_parent_inverse = root.matrix_world.inverted()
    root.location = (0, 0, top - 0.01 * H)
    bpy.context.view_layer.update()

    return {"arm": arm, "ast": ast, "mug": mug, "root": root,
            "props": props, "body": body}


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
    A.setup_render(opts["res"], opts["samples"])
    A.setup_compositor()

    scene = build_scene()
    arm, mug, ast = scene["arm"], scene["mug"], scene["ast"]

    out = os.path.join(os.getcwd(), "public", "asteroid")
    os.makedirs(out, exist_ok=True)

    cam = A.setup_camera()
    apply_pose(arm, SEATED)
    bpy.context.view_layer.update()
    A.frame_object(cam, [ast, arm] + scene["props"], margin=1.45)

    rest_matrix = mug.matrix_world.copy()
    # Where the mug sits relative to the hand once he has hold of it. Derived
    # from the rest positions rather than guessed, so the grip lands on the
    # handle instead of through it.
    hand = arm.pose.bones.get("hand.R")
    grip = (arm.matrix_world @ hand.matrix).inverted() @ rest_matrix

    if opts["mode"] == "still":
        A.render_to(os.path.join(out, "_desk-still.png"))
        return

    frames_dir = os.path.join(out, "_deskframes")
    os.makedirs(frames_dir, exist_ok=True)
    for stale in os.listdir(frames_dir):
        if stale.endswith(".png"):
            os.remove(os.path.join(frames_dir, stale))

    n = opts["frames"]
    for i in range(n):
        pose, lift = pose_for_frame(i, n)
        apply_pose(arm, pose)
        bpy.context.view_layer.update()
        place_mug(mug, arm, rest_matrix, lift, grip)
        bpy.context.view_layer.update()
        A.render_to(os.path.join(frames_dir, f"f{i:03d}.png"))
    print(f"[desk] {n} frames in {frames_dir}")


if __name__ == "__main__":
    main()

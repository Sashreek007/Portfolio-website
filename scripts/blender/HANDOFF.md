# Blender assets — state and handoff

## Shipped and live

`main` @ `cd59eca`, deployed, verified on https://sashreek-addanki.vercel.app

- **`asteroid.py`** — generates the whole rider asset from code. Procedural
  rock (6 displacement octaves, profile-carved craters, pointiness+AO shader),
  a sculpted CC0 human (Blender Studio Human Base Meshes) rigged to a scripted
  19-bone armature, garments cut from the body's own vertex groups, particle
  hair, Cycles render with DOF + bloom, alpha preserved.
- **`make-sprite-sheet.py`** — tiles frames into `public/asteroid/asteroid-sprite.webp`
  and writes `src/components/site/asteroidSprite.ts`.
- **`AsteroidRider.tsx`** — steps the sheet, mounted in `#experience`.
  24 frames, 680KB, no blend mode, no video decoder. **Due to be repointed at
  the desk scene** — see below.
- **`prep-face.py`** — photo → face texture. Works, but the projection is
  **off** (`FACE_PROJECT = False` in asteroid.py) because it looked worse than
  the sculpted face. See "photo projection" below.

Regenerate:
```bash
/Applications/Blender.app/Contents/MacOS/Blender --background \
  --python scripts/blender/asteroid.py -- --mode sprite --frames 24 --res 900 --samples 170
python3 scripts/blender/make-sprite-sheet.py
```
Modes: `still`, `sprite`, `rider` (figure alone), `face` (head close-up).

`assets/vendor/` is gitignored. Run `scripts/blender/fetch-human-base.sh` on a
fresh checkout (48MB CC0 bundle).

## In progress — `desk.py` v2: vendored figure + props (final sprite rendering)

**This REPLACES the rider.** The swap: render `desk.py --mode sprite`, run
`make-sprite-sheet.py _deskframes`, done — `AsteroidRider.tsx` only reads
the grid metadata. Keep asteroid.py; it is the rider's revert path.

**The procedural figure/garment pipeline is GONE** (git history has it, and
its hard-won fixes are in the gotchas below). After a day of fighting
procedural tailoring the user called it: use pre-existing assets. Current
architecture (2026-08-25):

- **Figure**: Mixamo "Lewis" carrying Mixamo's seated "Typing" clip
  (`assets/vendor/mixamo/Typing.fbx`, manual download — needs an Adobe
  login; module docstring has the settings). Real clothes, fingers, mocap.
  Bone prefix (`mixamorig4:`) varies per export — detected, never
  hardcoded. `Sitting Idle.fbx` and `Sitting Drinking.fbx` are also
  vendored for a future idle/sip splice — NOTE (user observation): the
  Sitting Drinking clip STARTS STANDING; only the seated later portion is
  usable, so trim before splicing.
- **Skin recolour** (user direction: "whitish brown"): numpy over the
  packed 4k diffuse. Skin and clothes share ONE texture, so it is a texel
  mask — warm texels (R>G>B by margin) are skin; the teal shirt and
  neutral slacks never match. Per-channel affine keeps the pore detail.
- **Props**: Poly Haven CC0 (`fetch-props.sh`): metal_office_desk (drawers
  toward the sitter; diffuse multiplied toward calm grey or it out-shines
  the figure), dining_chair_02 (backrest is at the asset's LOCAL +y —
  rot 0, a half-turn puts it in his lap), plastic_thermos as the coffee
  mug (chunkier non-uniform scale or it reads as a bottle). The LAPTOP is
  procedural: a MacBook-style unibody (user request; no quality CC0
  MacBook exists) — beveled slabs, dark key well, trackpad, emissive
  display facing him. Its lid sits at near-mirror geometry between the
  face key and the camera: matte anodized (rough 0.68, metallic 0.7) or
  it bounces the key light into the lens as a lavender sheet. Mouse is a
  tipped squashed sphere with a scroll notch. The earlier classic_laptop
  vendor asset is unused now.
- **Assembly centring**: the desk is shifted toward the mug side, so the
  root offset is COMPUTED (−desk_cx/2), splitting desk and figure centres
  over the rock summit — a fixed nudge left desk legs hanging over space.
- **Furniture is fitted to the ANIMATION**: desk top under the wrists'
  MINIMUM over the whole loop (one mid-frame sample let deep keystrokes
  pierce the laptop), chair seat under the measured hips, laptop a
  fingertip-reach (~0.06H) beyond the wrists or fingers pierce the lid at
  the hinge. Desk 0.80×-wide scale and mug/mouse spaced apart — every
  tighter layout interpenetrated something (user caught each one; verify
  CONTACT POINTS AT 4x ZOOM after every change, not full-frame).
- **Rock stays procedural** (A.build_asteroid). A scanned Poly Haven moon
  rock was tried and rejected — reads as a boulder ledge, not a tiny
  planet.
- Retro lid z-squashed ×0.72 and camera raised to direction
  (0.40, -1.0, 0.60), or the lid curtains off the typing hands entirely.
- **Loop** (48 cells, 9.6s at the component's 200ms step): a SPLICE —
  typing → 3-cell crossfade → the seated slice of "Sitting Drinking"
  (frames 222–366; the first ~120 frames are a WALK to the chair, skip
  them) → crossfade → typing, whose tail crossfades onto its own start.
  `schedule()` builds the per-cell plan; `PoseRig` samples either action
  and blends. CRITICAL: the drink clip's hips carry the walk's ~2.3m
  translation in the bone basis — `PoseRig.corr` (typing-hips ∘
  drink-hips⁻¹ at the junctions) re-seats every drink sample, else he
  teleports off the chair mid-loop.
- **Mug pickup — THE CUP IS AUTHORED, THE HAND IS DRIVEN TO IT.** The
  source clip drinks from an invisible cup at the LAP, so there is no desk
  pickup to borrow. Every version that derived the cup's position from
  wherever the hand ended up failed, and each failure was invisible at
  normal zoom and obvious to the user:
    * welded to the wrist → cup floating beside the fingers;
    * pinned to the palm → cup at his EYES (the palm rides higher than the
      wrist when the arm is raised);
    * tilted toward the head → cup pressed against his FOREHEAD;
    * cup moved to a hand that never reached → pure telekinesis.
  Now the cup has exactly two authored places — its desk spot, and
  rim-to-lips — and `aim_palm_at()` walks an IK target until his PALM
  lands on the cup. Nothing about the cup depends on solver accuracy.
- **Three gotchas inside that**, each cost a full round trip:
    * Blender IK drives the bone's TAIL to the target, not its head, and
      the palm is further along still — so solve, measure where the palm
      actually landed, and walk the target by the error (2-3 passes).
    * The thermos's origin is at its BASE (0% of its height), so "put the
      cup at the palm" had him carrying it by the bottom with the body
      above his fist. Grip band is 45% up the mesh's own local extent.
    * The mug must be REACHABLE: at 0.245H outboard, shoulder-to-mug was
      0.489H against a 0.379H arm, so the IK stretched and stopped short.
      A grid search over the desk top (`place*.py` pattern in scratch)
      against the finger envelope found the working spot.
- **His mouth is measured off the FACE MESH** (`face_mouth_local`), kept in
  head-bone space so it tracks the head dip. Nose = front-most
  head-weighted vertex, chin = lowest, lips at 0.38 between. Guessing an
  offset off the head bone is what put the cup at eye level twice.
- **Desk height fits the FINGERTIPS, not the wrists.** The wrist version
  assumed fingers hang ~0.066H below the wrist; this clip types with flat
  hands, so the desk sat 6.5cm low and his hands floated over the keys for
  the entire loop — hidden from camera by the laptop lid, caught only by
  measuring.
- **The mouse moves with his hand.** A static mouse under a hand that
  slides several cm reads as swiping at a lump. `mouse_offset()` pulls it
  under the palm when the hand is near and low, releases it otherwise;
  offsets are precomputed per cell and smoothed with a CIRCULAR kernel so
  the loop seam stays exact. Anchor it under the PALM, not the fingertips
  (this clip stretches fingers ~0.11H forward of the wrist).
- **Verification is numeric, not visual.** `--mode check` and the sprite
  run assert per frame: cup in hand, rim at mouth during the sip, cup on
  its desk spot at grab/put-down, and mouse step size. Several bugs
  survived rounds of looking at renders; one check even agreed with a bug
  because it measured against the same wrong point the code used (the
  cup's origin), so it read a perfect 0.000 while the hand held the base.
- **Watch for coordinate-frame mixing:** props are parented to the scene
  root, so `ob.location` is pre-root while bones report world. Comparing
  the two made the mouse's gating distance enormous and it never moved
  (measured travel: exactly 0.0000H). Use `matrix_world` on both sides.
- Face key light on the head bone (rig lights all aim at the rock's
  belly); DOF focused on the head; camera at a higher angle than the
  rider's (`frame_object(..., direction=(0.40, -1.0, 0.60))`) so the
  desktop shows instead of the desk's back panel.
- Shirt recoloured purple to match the site theme, in the same texel pass
  as the skin: the shirt is the teal region (blue/green above red), the
  only thing in the texture matching that test. Blue stays the luminance
  anchor so every fold survives.

Commands:
```bash
/Applications/Blender.app/Contents/MacOS/Blender --background \
  --python scripts/blender/desk.py -- --mode still --res 480 --samples 24
... -- --mode check --res 480 --samples 24     # 5 loop landmarks
... -- --mode sprite --frames 36 --res 900 --samples 170
python3 scripts/blender/make-sprite-sheet.py _deskframes
```

## Gotchas that cost real time

**Blender / bpy**
- `reset_scene()` calls `read_factory_settings` — it WIPES all render config
  made before it. desk.py originally did setup_render → build_scene(reset…)
  and every render was factory EEVEE at 1920×1080: opaque alpha, no bloom,
  --res and --samples silently ignored. Scene first, then render setup.
- `ARMATURE_AUTO` bone heat fails silently on a 677k-vert mesh — no error,
  no groups. Bind while the multires modifier is live (10.5k cage); weights
  survive the bake.
- Voxel remesh rebuilds topology and DROPS vertex groups. Any remeshed mesh
  that must deform needs a weight transfer afterwards.
- `bpy.ops.object.duplicate()` copies the modifier stack; a garment cut from
  a rigged body inherits the live Armature and deforms twice once it gets
  its own.
- Shrinkwrapping a solidified mesh lands BOTH faces on the same offset
  surface — flattens it. Shrinkwrap the open strip, then solidify.
- `matrix_world` is lazily evaluated. Read it before the depsgraph runs and you
  get identity. Cost hours twice — stranded eyeballs at the origin, then eye
  holes at v=8.2. Call `bpy.context.view_layer.update()` first, always.
- `bpy.ops.object.join()` keeps only the **active** object's modifiers and
  silently drops everyone else's. Apply modifiers before joining, and note that
  particle systems die this way too (hair is parented, not joined).
- `ShaderNodeMix` carries a full socket set per data type and enables only the
  active one, so `inputs["A"]` resolves to the *disabled float* socket. Use
  indices: 0=Factor, 6=A(RGBA), 7=B(RGBA), output 2. Silent when wrong.
- Menu sockets take the display label, not the identifier: Glare type is
  `"Bloom"`, not `"BLOOM"`. Wrong value fails silently and keeps the default.
- Blender 5.x compositor is `scene.compositing_node_group`, not
  `scene.node_tree`; `CompositorNodeComposite` is gone — use `NodeGroupOutput`.
- Glare outputs **opaque** RGB. Route it straight to output and the alpha
  channel is gone. `SetAlpha` with the render's own alpha fixes it.
- Catmull-Clark shrinks each *disconnected* island toward its own centre. Use a
  voxel remesh to union overlapping primitives instead — and solidify first, or
  a shell thinner than one voxel is erased (a jacket went to 20 vertices).
- Multires cannot be applied after topology changes. Bake it before anything
  duplicates and edits the mesh.
- Colours in materials are **albedo**, not what you want to see. sRGB #1E1D1C
  is ~1.4% reflectance — no light rescues it. Rock wants 0.05–0.15.

**Art direction learned the hard way**
- Photo projection onto a generic skull produces artefacts, not a likeness.
  Colour transfers from a photo; geometry does not. A phone scan is the real
  lever if a likeness is ever wanted.
- Cloth solvers were wrong for a cape: unstable without gravity, and once
  stiffened enough to survive they collapsed into a rigid shard. Swept geometry
  is deterministic and re-renders identically.
- Swept geometry is equally wrong for tailoring — closed and flared it is a
  skirt, open and narrow it is two flat planks. Cut garments from the body's
  own vertex groups instead.
- Facial hair from luminance thresholds does not work on a dark phone photo:
  moustache 0.154 vs cheek 0.272 with lips at 0.180 *between* them, and
  saturation separates none of it. Use anatomical regions.
- Noise on a surface is not hair at any amplitude. Particle strands for the
  silhouette, a shaded shell for the mass.

**Web**
- The sprite loop writes `backgroundPosition` imperatively, which **survives
  Fast Refresh**. Declare frame 0 in JSX so React can reset it, or a stale
  value from an old grid straddles two cells.
- Tailwind variant ordering: at 1920 both `2xl:` and `min-[1800px]:` match and
  the *named* variant wins, so the large tier silently never applies. Derive
  from the viewport in CSS instead of stepping.
- `absolute inset-0` covers the **padding box**, not the content box. An
  overlay rail needs the section's own `px-[6vw]` or it is wider than the text
  column.
- Verify served CSS with a cache-busted request. A stale response had me
  convinced a rule was being dropped when it had shipped all along.
- Pushes with binary assets need `git config http.postBuffer 524288000`
  (default 1MB → `RPC failed; HTTP 400`).

## Still outstanding

- No measured perf comparison. Option A (drawing into `SpaceField`'s canvas)
  was never built; there are no frame-time numbers for either approach.
- Nobody has watched the sprite animate in a browser. The Browser pane in that
  session kept backgrounding itself, which pauses rAF and freezes both Lenis
  and the stepping loop. All verification was DOM measurement.

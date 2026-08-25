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

## In progress — `desk.py` (NOT working yet)

**This REPLACES the rider.** The caped-figure-on-a-tumbling-rock currently in
`#experience` is being swapped out for this, not joined by it. Once the desk
scene renders, the swap is: re-render the sheet from `desk.py`, regenerate
`asteroidSprite.ts`, and point `AsteroidRider.tsx` at the new sheet — the
component itself needs no change beyond that, since it only reads the grid
metadata. Keep the rider script; it is the revert path.

Same figure and rock, seated at a desk in space: types on a laptop, pauses to
drink coffee, purple suit, rock does not rotate.

Done and verified:
- Seated pose (`SEATED`), props (desk/chair/laptop/mug, procedural boxes),
  purple suit with a carved V-neck so shirt and tie show, emissive laptop
  screen as a practical light.
- Animation curves (`pose_for_frame`) — typing as out-of-phase wrist
  oscillation, plus a reach/lift/hold/lower/return sip cycle. **Loop verified
  seamless**: frame N ≡ frame 0 on every bone.
- Mug follows the hand via the same `lift` curve that drives the arm, so no
  constraint to toggle and the handoff is exact at both ends.

**Where it stops:** every garment returns `no vertices matched`.
`garment_from_groups` selects by vertex group, and those only exist after
`parent_set(ARMATURE_AUTO)`. Order in `build_scene` is now
import → bake multires → rig → cut → bind, which *should* be right, but the
groups are still missing at cut time.

Next thing to check: whether `bind_auto` actually succeeded on a 677k-vert
body. Print `[g.name for g in body.vertex_groups]` immediately after it. If
empty, ARMATURE_AUTO is failing silently at that density — bind BEFORE baking
multires (bind at 10.5k verts, then bake), since weights survive the bake.

```bash
/Applications/Blender.app/Contents/MacOS/Blender --background \
  --python scripts/blender/desk.py -- --mode still --res 560 --samples 60
```

## Gotchas that cost real time

**Blender / bpy**
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

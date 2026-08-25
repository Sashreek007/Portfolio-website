"""
Turn a phone selfie into a face texture the renderer can project.

    python3 scripts/blender/prep-face.py assets/vendor/face-src/IMG_9657.jpg

Three things have to happen, and the middle one is the one that matters.

1. Stand it upright. Phone photos of someone lying down arrive on their side.

2. Divide out the lighting. A photo carries the light it was shot under baked
   into it — a bright cheek and a shadowed jaw are painted on. Projected onto a
   model that has its own key and rim lights, that reads as dirt, because the
   render then lights the shadow a second time. Dividing the image by a heavily
   blurred copy of itself removes the low-frequency gradient while keeping pores
   and stubble, which is roughly what an albedo map is.

3. Crop to crown-and-chin, so the projection has a known vertical extent to
   line up against the model's head.
"""

import os
import sys

import numpy as np
from PIL import Image, ImageEnhance, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, "assets", "vendor", "face-reference.png")

ROTATE = -90          # clockwise quarter turn
CROP = (0.17, 0.10, 0.83, 0.79)   # l, t, r, b — crown to chin
# Radius matters more than it looks. At 0.18 the blur was close enough to
# the scale of the features themselves that dividing by it flattened the nose
# and brow along with the lighting, and the projected face came out as an even
# brown mask. Keep the radius well above feature scale: remove the lighting
# gradient, leave the face.
BLUR_FRAC = 0.42      # gaussian radius as a fraction of face width
LIFT = 1.18           # gentle exposure lift after flattening
CONTRAST = 1.30       # put back the local contrast the division costs


def main():
    src = sys.argv[1] if len(sys.argv) > 1 else None
    if not src or not os.path.exists(src):
        sys.exit("usage: prep-face.py <photo>")

    im = Image.open(src).convert("RGB")
    if ROTATE:
        im = im.rotate(ROTATE, expand=True)

    w, h = im.size
    im = im.crop((int(CROP[0] * w), int(CROP[1] * h),
                  int(CROP[2] * w), int(CROP[3] * h)))

    arr = np.asarray(im).astype(np.float32)
    radius = max(8, int(im.size[0] * BLUR_FRAC))
    blur = np.asarray(im.filter(ImageFilter.GaussianBlur(radius))).astype(np.float32)

    # Flatten: img / blur restores the detail the blur removed, and multiplying
    # by the mean puts it back at a sane exposure. Clamped so a near-black
    # shadow cannot divide its way to a blown highlight.
    mean = blur.reshape(-1, 3).mean(axis=0)
    flat = arr / np.maximum(blur, 6.0) * mean * LIFT
    flat = np.clip(flat, 0, 255).astype(np.uint8)

    out = Image.fromarray(flat)
    out = ImageEnhance.Contrast(out).enhance(CONTRAST)
    # A light median knocks back sensor noise in the shadows without taking the
    # pores with it — this photo was shot in low light.
    out = out.filter(ImageFilter.MedianFilter(3))
    out.save(OUT)

    print(f"[face] source {os.path.basename(src)}")
    print(f"[face] cropped to {out.size}, aspect {out.size[0] / out.size[1]:.3f}")
    print(f"[face] blur radius {radius}px, wrote {OUT}")


if __name__ == "__main__":
    main()

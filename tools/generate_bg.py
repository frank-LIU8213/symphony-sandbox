"""
Background image generator for the Pomodoro timer.

Generates a blurred iOS-style gradient background and saves it as 
assets/backgrounds/bg1.jpg.

This script is designed to be run after the generated image has been
produced by nano banana 2 (via .symphony-image-request).  It can
optionally fall back to a simple PIL-generated gradient if the
nano banana 2 output is not present.
"""

import subprocess
import sys
from pathlib import Path

ASSETS_DIR = Path(__file__).resolve().parent.parent / "assets" / "backgrounds"
OUTPUT = ASSETS_DIR / "bg1.jpg"


def ensure_assets_dir():
    ASSETS_DIR.mkdir(parents=True, exist_ok=True)


def generate_with_pillow():
    """Fallback: generate a linear gradient using Pillow (requires PIL)."""
    try:
        from PIL import Image, ImageDraw
    except ImportError:
        print("pillow not installed.  Place bg1.jpg manually or install pillow.", file=sys.stderr)
        return False

    width, height = 1920, 1080
    img = Image.new("RGB", (width, height))
    draw = ImageDraw.Draw(img)

    # Fade from peach (#FFDAB9) to lavender (#E6E6FA)
    for y in range(height):
        r1, g1, b1 = 0xFF, 0xDA, 0xB9
        r2, g2, b2 = 0xE6, 0xE6, 0xFA
        frac = y / height
        r = int(r1 + (r2 - r1) * frac)
        g = int(g1 + (g2 - g1) * frac)
        b = int(b1 + (b2 - b1) * frac)
        draw.line([(0, y), (width, y)], fill=(r, g, b))

    img.save(OUTPUT, "JPEG", quality=85)
    print(f"Generated {OUTPUT}")
    return True


def main():
    ensure_assets_dir()

    if OUTPUT.exists():
        print(f"Background already exists at {OUTPUT}")
        return

    # Try to read the nano banana 2 output (assumed to be generated at a known path)
    # The orchestrator will place the real image into generated-images/.
    generated_dir = Path(__file__).resolve().parent.parent / "generated-images"
    expected_pattern = sorted(generated_dir.glob("bg*.jpg"))
    if expected_pattern:
        import shutil
        shutil.copy(expected_pattern[0], OUTPUT)
        print(f"Copied nano banana 2 output to {OUTPUT}")
        return

    # Fallback to Pillow
    success = generate_with_pillow()
    if not success:
        print("Could not generate background.  Place bg1.jpg manually.", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()

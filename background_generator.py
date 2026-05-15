"""Generate background image using nano banana2 API or a warm gradient fallback."""
import sys
import os
import shutil


def generate_background(output_path: str, width: int = 1024, height: int = 768) -> None:
    """Generate a background image for the game.

    Prefers the nano‑banana‑2 generated image located at
    `generated-images/generated.jpg`.  Falls back to a soft warm gradient.
    """
    if os.path.exists(output_path):
        print(f"File {output_path} already exists, skipping generation")
        return

    # Try to copy the pre‑generated image from nano banana 2
    script_dir = os.path.dirname(os.path.abspath(__file__))
    generated_path = os.path.join(script_dir, 'generated-images', 'generated.jpg')
    if os.path.exists(generated_path):
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        shutil.copy(generated_path, output_path)
        print(f"Copied nano‑banana‑2 generated image to {output_path}")
        return

    # Fallback: produce a warm linear gradient (Airbnb‑inspired palette)
    try:
        from PIL import Image, ImageDraw
    except ImportError:
        print("PIL not available; creating an empty placeholder file.")
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        open(output_path, 'wb').close()
        return

    img = Image.new('RGB', (width, height))
    draw = ImageDraw.Draw(img)

    # Warm gradient from seashell to muted tan
    top = (255, 245, 238)     # seashell
    bottom = (214, 190, 170)  # muted tan

    for y in range(height):
        if height <= 1:
            r, g, b = top
        else:
            t = y / (height - 1)
            r = int(top[0] + (bottom[0] - top[0]) * t)
            g = int(top[1] + (bottom[1] - top[1]) * t)
            b = int(top[2] + (bottom[2] - top[2]) * t)
        draw.line([(0, y), (width - 1, y)], fill=(r, g, b))

    # Add a soft warm circle (sun) at the top centre for extra character
    sun_radius = width // 8
    sun_center = (width // 2, height // 3)
    sun_color = (253, 174, 120)   # warm peach
    draw.ellipse(
        [
            sun_center[0] - sun_radius,
            sun_center[1] - sun_radius,
            sun_center[0] + sun_radius,
            sun_center[1] + sun_radius,
        ],
        fill=sun_color,
    )

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    img.save(output_path, 'JPEG')
    print(f"Generated background at {output_path} (warm gradient with sun)")


if __name__ == '__main__':
    output = 'static/bg.jpg'
    if len(sys.argv) > 1:
        output = sys.argv[1]
    generate_background(output)

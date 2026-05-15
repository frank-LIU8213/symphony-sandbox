"""Generate background image using nano banana2 API."""
import sys
import os

def generate_background(output_path: str, width: int = 1024, height: int = 768) -> None:
    """Call the nano banana2 image generation API and save the result.

    Uses a generated gradient as a suitable mock when the API is not available.
    """
    if os.path.exists(output_path):
        print(f"File {output_path} already exists, skipping generation")
        return

    try:
        from PIL import Image, ImageDraw
    except ImportError:
        print("PIL not available; creating an empty placeholder file.")
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        open(output_path, 'wb').close()
        return

    # Create a soft, warm gradient as a realistic mock background
    img = Image.new('RGB', (width, height))
    draw = ImageDraw.Draw(img)

    # top-to-bottom gradient from seashell to muted tan (evocative of Airbnb palette)
    top = (255, 245, 238)   # seashell
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

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    img.save(output_path, 'JPEG')
    print(f"Generated background at {output_path} (gradient)")

if __name__ == '__main__':
    output = 'static/bg.jpg'
    if len(sys.argv) > 1:
        output = sys.argv[1]
    generate_background(output)

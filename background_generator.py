"""Generate background image using nano banana2 API."""
import sys
import os

def generate_background(output_path: str, width: int = 1024, height: int = 768) -> None:
    """Call the nano banana2 image generation API and save the result."""
    # Placeholder: create a solid-colour image if the API is not implemented yet.
    if os.path.exists(output_path):
        print(f"File {output_path} already exists, skipping generation")
        return
    try:
        from PIL import Image
    except ImportError:
        print("PIL not available; creating an empty placeholder file.")
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        open(output_path, 'wb').close()
        return
    img = Image.new('RGB', (width, height), color=(135, 206, 235))
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    img.save(output_path)
    print(f"Generated placeholder background at {output_path}")

if __name__ == '__main__':
    output = 'static/bg.jpg'
    if len(sys.argv) > 1:
        output = sys.argv[1]
    generate_background(output)

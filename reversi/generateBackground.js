export async function loadBackgroundImage() {
  // Check if pre‑generated image exists
  try {
    const response = await fetch('generated-images/reversi-bg.png', { method: 'HEAD' });
    if (response.ok) {
      return "url('generated-images/reversi-bg.png')";
    }
  } catch {
    // network error – fall through
  }

  // Fallback: subtle inline SVG pattern with Airbnb coral
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
  <defs>
    <pattern id="dot" width="40" height="40" patternUnits="userSpaceOnUse">
      <circle cx="20" cy="20" r="2" fill="#FF5A5F" opacity="0.08"/>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="#F5F5F5"/>
  <rect width="100%" height="100%" fill="url(#dot)"/>
</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

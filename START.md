# NEX-27 连连看 · Airbnb Edition

## Quick Start

1. **Generate the background image** (requires Python 3 with Pillow; falls back to an empty file if absent):

   ```bash
   python background_generator.py
   ```

2. **Start a local HTTP server** so the browser can load ES modules (the app won't work when opened via `file://`):

   ```bash
   cd path/to/this/project
   python3 -m http.server 8765
   ```

3. **Open the game** in your browser:

   ```
   http://localhost:8765/
   ```

4. **Play!** Click matching tile pairs to clear the board. A congratulatory message appears when the board is empty.

---

*Why the HTTP server?* Modern browsers block ES module imports from `file://` URLs for security reasons. The server‑based approach lets all modules load correctly.

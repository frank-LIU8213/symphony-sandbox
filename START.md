# How to run

The site uses ES modules (`<script type="module">`), which won't work when opened directly via `file://` in Chrome/Edge due to CORS restrictions. Run it with:

```bash
cd mars-site && python3 -m http.server 8765
```

Then open http://localhost:8765/ in your browser.

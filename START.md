# NEX-30: Nuclear Mass & Light Speed — Interactive Physics Demo

## How to run

```bash
cd $(dirname "$0") && python3 -m http.server 8765 && open http://localhost:8765/
```

This project uses ES modules (`<script type="module">`), which browsers block from loading via `file://` due to CORS. You must serve the files through a local HTTP server.

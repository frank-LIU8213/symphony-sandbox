# How to run

ES modules (`<script type="module">`) are blocked from loading via `file://` in Chrome/Edge due to CORS. Start a local server instead:

```bash
cd $(dirname "$0") && python3 -m http.server 8765 && open http://localhost:8765/
```

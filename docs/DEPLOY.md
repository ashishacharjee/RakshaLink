# Deploy

**Live deployment:** [https://rakshalink-theta.vercel.app/](https://rakshalink-theta.vercel.app/)

## Vercel
The repository includes `vercel.json` and `api/index.js` for instant deployment on Vercel.

## Render
One web service, no database, no keys.

1. Push the repository to GitHub.
2. On Render choose New, then Blueprint, and select the repository. `render.yaml` sets the build (`npm install`), start (`npm start`), health check (`/health`) and the three environment variables.
3. Open the service URL. `/` is the live demo hub.

Notes
- Free services sleep when idle. Open the URL two minutes before a demo.
- Data is in memory and resets when the service restarts.
- Keep `DEMO_MODE=true`. Dispatch is simulated, so no real message is ever sent. Do not put real phone numbers or keys in this project.
- Leaflet and the fonts are bundled. Map tiles (OpenStreetMap) and Three.js for the 3D simulation (cdnjs) need the browser to have internet. Without tiles the console shows a drawn map.

# Whisp Quest

Whisp Quest is a small experimental experience where words summon spirits. The front‑end is built with React, Three.js and Vite, while an Express server talks to OpenAI to analyze text and drive the spirit dialog.

## Server setup

1. `cd whisp-server`
2. `npm install`
3. Create a `.env` file and define `OPENAI_API_KEY` with your API key. You can also set `PORT` (defaults to `4000`).
4. Run `node index.js` to start the server.

## Client setup

1. In the repository root run `npm install`.
2. Start the dev server with `npm run dev`.
3. Open `http://localhost:5173` in the browser.

## OpenAI configuration

The server reads the key from `OPENAI_API_KEY`. Either create `whisp-server/.env` or export the variable before launching the server.

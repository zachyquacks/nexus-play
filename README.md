# NEXUS PLAY

A cinematic browser-game launcher built with Vite, TypeScript and vanilla DOM APIs.

## Features

- Responsive dark gaming dashboard
- Discover page, category filters and live search
- Favourites and recently played stored locally
- Game detail modal and playable built-in Neon Drift-inspired arcade experience (Snake-style score attack)
- Keyboard controls (arrows / WASD), score and local best score
- Vercel-ready single-page routing

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Deploy

Import this repository into Vercel. Framework preset: **Vite**. Build command: `npm run build`. Output directory: `dist`.

## Notes

The catalogue currently contains original demo entries. A title is only genuinely playable when its game implementation or a properly licensed/embeddable game source is added. User favourites and history are browser-local in this starter; accounts, cloud sync, public leaderboards and admin publishing need a backend such as Supabase and are not enabled yet.

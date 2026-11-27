# NEXUS PLAY

A cinematic browser-game launcher built with Vite, TypeScript and vanilla DOM APIs.

## Features

- Responsive dark gaming dashboard
- Discover page, category filters and live search
- Favourites and recently played stored locally
- Game detail modal with embedded hosted HTML5 games
- External game player with fullscreen/gamepad permissions where supported and open-in-new-tab fallback
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

The catalogue embeds selected games from [Saurabh Singh's Games Hub](https://github.com/sausi-7/games), an MIT-licensed open-source collection. The original game site remains the host; NEXUS PLAY does not claim ownership of those games. If a host blocks embedding, use the player's **Open in new tab** link. User favourites and history are browser-local; accounts, cloud sync, public leaderboards and admin publishing need a backend such as Supabase and are not enabled yet.

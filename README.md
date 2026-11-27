# NEXUS PLAY

A cinematic browser-game launcher built with Vite, TypeScript and vanilla DOM APIs.

## Features

- Responsive dark gaming dashboard
- Discover page, category filters and live search
- Favourites and recently played stored locally
- Game detail modal with embedded hosted HTML5 games
- External catalogue pages for GN-Math and Classroom 6x with new-tab fallbacks
- Cloud Gaming dashboard preview with session pipeline and connection status
- Settings page for local preferences and backend integration status
- Supabase email sign-up/sign-in, player profile editing and sign-out UI
- Supabase database schema with row-level security for profile, favourites and recent games
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

## Accounts and cloud sync

Account screens use Supabase Auth. To enable them, create a Supabase project, run `supabase/schema.sql` in its SQL Editor, then set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the Vercel project environment and redeploy. Only the public anon key belongs in browser environment variables; never expose the service-role key. Account sign-up/login and profile editing are enabled after configuration. Local favourites and recent games are merged into the signed-in account and synced through tables protected by row-level security. See `.env.example` for the required public settings.

## Cloud gaming

The Cloud Gaming page is a frontend preview, not a live VM service. Read [docs/CLOUD-GAMING.md](docs/CLOUD-GAMING.md) for the recommended provider architecture, security requirements and rollout plan. Actual VMs and WebRTC media streaming require separately hosted infrastructure; Vercel is the frontend and lightweight API layer only.

## Notes

The catalogue embeds selected games from [Saurabh Singh's Games Hub](https://github.com/sausi-7/games), an MIT-licensed open-source collection. The original game site remains the host; NEXUS PLAY does not claim ownership of those games. If a host blocks embedding, use the player's **Open in new tab** link. User favourites and history are browser-local; accounts, cloud sync, public leaderboards and admin publishing need a backend such as Supabase and are not enabled yet.

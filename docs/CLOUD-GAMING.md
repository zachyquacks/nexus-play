# NEXUS PLAY cloud gaming integration

## Current state

The Cloud Gaming page in the web app is a frontend preview. It does not create a VM, launch a game, or stream a desktop yet. Vercel hosts the website and can host lightweight API routes, but the actual gaming machine must run on separate infrastructure.

## Recommended architecture

- **Vercel frontend:** dashboard, game library, account UI and responsive player shell.
- **Authentication service:** verifies the player before any session request.
- **Session API:** checks entitlements and quotas, asks the provider to provision a session, and returns a short-lived connection ticket.
- **Game host:** isolated VM or container with a supported game runtime.
- **Streaming gateway:** WebRTC video/audio and input channel. Keep signalling and media credentials short-lived.
- **Cleanup worker:** expires idle sessions, stops machines, revokes tickets and records usage.

## Security requirements before enabling real sessions

1. Require authentication and server-side authorization for every session operation.
2. Never expose provider API keys, VM credentials, TURN secrets or signing keys in browser code or Vite environment variables prefixed with `VITE_`.
3. Use short-lived, single-session connection tickets; do not return provider credentials to the browser.
4. Apply per-user concurrency limits, session time limits and resource quotas.
5. Isolate player sessions from each other and from internal control-plane services.
6. Validate allowed game images and launch configurations server-side. Do not accept arbitrary shell commands or arbitrary URLs from the browser.
7. Add rate limits, audit logs, abuse reporting and reliable shutdown handling.
8. Use a provider's supported streaming stack and follow its terms. Do not use an open proxy to evade network controls or access restrictions.

## Provider integration contract

Implement a server-only adapter with operations equivalent to:

- `createSession(userId, gameId)`
- `getSession(sessionId, userId)`
- `stopSession(sessionId, userId)`

The adapter must validate ownership and return only a short-lived browser connection ticket and non-sensitive session metadata. The actual provider API varies, so this repository intentionally does not pretend a generic endpoint can provision a working GPU VM.

## Streaming

WebRTC is a suitable browser transport for interactive video and input. The host needs a compatible capture/encoder and signalling service; production deployments also need TURN relay capacity for networks where direct peer connectivity is unavailable. Vercel should not be used as the media relay or game host.

## Rollout plan

1. Pick a cloud provider and region, estimate per-session GPU/CPU/RAM costs and set a budget.
2. Build and test one isolated host image with one permitted game.
3. Add authentication, session API, quotas and automatic shutdown.
4. Add WebRTC signalling and browser controls.
5. Test latency, reconnects, mobile input, accessibility and cleanup.
6. Only then enable session creation for users.

## Catalogue sources

GN-Math and Classroom 6x are linked as external catalogues. Their game content remains on their respective sites. Individual titles should only be embedded or re-hosted when the original publisher permits it; preserve source attribution and provide an open-in-new-tab fallback.

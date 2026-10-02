# Standalone build (off Base44)

Run the app **without Base44** — on **Vercel** (frontend + `/api` functions) + **Supabase** (Postgres, Auth, Storage) + the **Vercel AI Gateway** (AI). No `@base44/sdk` or `@base44/vite-plugin`.

## Layout in this repo
- `standalone/base44Client.js` — drop-in replacement for `@/api/base44Client`. Same surface the pages already call (`base44.entities.*`, `base44.auth.*`, `base44.functions.invoke`, `base44.integrations.Core.*`, `base44.analytics`, `base44.users.inviteUser`), backed by Supabase + the Vercel AI Gateway.
- `src/standalone/schema.sql` — Supabase schema (tables + RLS) for every entity. Run it in the Supabase SQL editor.
- `src/standalone/api/*.js` — Vercel serverless ports of the Base44 backend functions. **Move these to `/api/` at the repo root for Vercel** (`mv src/standalone/api/*.js api/`).

## Switch the app over (in this repo, on Vercel)
1. In `vite.config.js`, alias `@/api/base44Client` → `./standalone/base44Client.js`. Remove `@base44/vite-plugin` from the vite config.
2. Remove `@base44/sdk` and `@base44/vite-plugin` from `package.json`.
3. `mv src/standalone/api/*.js api/` so Vercel serves them at `/api/<name>`.
4. Set the env vars (below) on Vercel + Supabase. Run `src/standalone/schema.sql` in Supabase.
5. Deploy on Vercel.

## Env vars
Frontend (Vercel, `VITE_`-prefixed):
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- `VITE_VERCEL_AI_GATEWAY_URL` → `https://ai-gateway.vercel.sh/v1`
- `VITE_VERCEL_AI_GATEWAY_KEY`
- `VITE_VERCEL_AI_GATEWAY_MODEL` (optional, default `openai/gpt-4o-mini`)

Server (Vercel, no prefix):
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- `VERCEL_AI_GATEWAY_URL`, `VERCEL_AI_GATEWAY_KEY`
- `IMAGE_MODEL` (optional, e.g. `openai/dall-e-3` for `generateLogo`)

## API routes (after the move)
- `api/vercelAI.js`, `api/generateViralPresets.js` — AI chat via the gateway.
- `api/generateLogo.js` — image generation via the gateway's `/images/generations` (set `IMAGE_MODEL`).
- `api/stackBridge.js` — Supabase / GitHub / Google Drive / Sheets via tokens in the `connections` table.
- `api/executeGenerator.js` — full DAG executor + validation mesh; AI nodes route through the gateway.

## Connectors
Base44 connector tokens don't transfer. Store each connection's access token in the Supabase `connections` table (created by `schema.sql`): `type`, `access_token`, `refresh_token`, `expires_at`, `enabled`. `api/stackBridge.js` reads them via `conn(type)`. Re-authorize each provider through your own OAuth flow on Vercel.

## Not yet covered (wire when needed)
- `GenerateImage` / `GenerateVideo` / `GenerateSpeech` / `TranscribeAudio` / `SendEmail` — pick providers (OpenAI images, fal.ai, Resend) in the relevant `/api` route.
- Realtime subscriptions (`base44.entities.X.subscribe`) — wire Supabase Realtime channels.
- `aggregate` advanced options (`dateBucket`, `having`, `countDistinct`) — extend the PostgREST mapping.
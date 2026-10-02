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
AI keys must never be VITE-prefixed or bundled in the browser. The browser invokes authenticated server operations.

Server (Vercel, no prefix):
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- `VERCEL_AI_GATEWAY_URL`, `VERCEL_AI_GATEWAY_KEY`
- `VERCEL_AI_GATEWAY_MODEL` (optional, default `openai/gpt-4o-mini`)
- `VERCEL_AI_GATEWAY_IMAGE_MODEL` (optional, default `google/gemini-3.1-flash-image-preview`)

## API routes (after the move)
- `api/vercelAI.js`, `api/generateViralPresets.js` — AI chat via the gateway.
- `api/generateLogo.js` — image generation via Vercel's multimodal chat completions; returns the generated image without a platform integration call.
- `api/agentChat.js` — the operator's bounded Vercel tool loop, with authenticated Supabase access.
- `api/stackBridge.js` — Supabase / GitHub / Google Drive / Sheets via tokens in the `connections` table.
- `api/executeGenerator.js` — full DAG executor + validation mesh; AI nodes route through the gateway.

## Connectors
Base44 connector tokens don't transfer. Store each connection's access token in the Supabase `connections` table (created by `schema.sql`): `type`, `access_token`, `refresh_token`, `expires_at`, `enabled`. `api/stackBridge.js` reads them via `conn(type)`. Re-authorize each provider through your own OAuth flow on Vercel.

## Not yet covered (wire when needed)
- Video, speech, and transcription are not active features in this app; add server-side Vercel Gateway operations when those features are requested. Email is not an AI operation and requires a mail provider.
- Realtime subscriptions (`base44.entities.X.subscribe`) — wire Supabase Realtime channels.
- `aggregate` advanced options (`dateBucket`, `having`, `countDistinct`) — extend the PostgREST mapping.
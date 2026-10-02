# Standalone build (off Base44)

This folder lets the app run **without Base44** — on **Vercel** (frontend + `/api` functions) + **Supabase** (Postgres, Auth, Storage) + the **Vercel AI Gateway** (AI). The Base44 SDK and vite plugin are not used.

## What's here
- `base44Client.js` — drop-in replacement for `@/api/base44Client`. Same surface the pages already call (`base44.entities.X.filter/get/create/...`, `base44.auth.*`, `base44.functions.invoke`, `base44.integrations.Core.*`, `base44.analytics`, `base44.users.inviteUser`), backed by Supabase + the Vercel AI Gateway.

## Switch the app over (in the synced GitHub repo)
1. In `vite.config.js`, alias `@/api/base44Client` → `./standalone/base44Client.js`.
2. Remove `@base44/sdk` and `@base44/vite-plugin` from `package.json` and the vite config.
3. Move each `base44/functions/<name>/entry.ts` to `api/<name>.js` (Vercel serverless). Replace `createClientFromRequest` + `base44:runtime` imports with the standalone client + `process.env`. Keep the same logic.
4. Set env vars (below) on Vercel + Supabase.
5. Deploy the repo on Vercel.

## Env vars
Frontend (Vercel, `VITE_`-prefixed):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_VERCEL_AI_GATEWAY_URL` → `https://ai-gateway.vercel.sh/v1`
- `VITE_VERCEL_AI_GATEWAY_KEY`
- `VITE_VERCEL_AI_GATEWAY_MODEL` (optional, default `openai/gpt-4o-mini`)

Server (Vercel, no prefix):
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (for `/api` functions + admin invites)
- `VERCEL_AI_GATEWAY_URL`, `VERCEL_AI_GATEWAY_KEY`

## Database
Each Base44 entity → one Supabase table named exactly like the entity (e.g. `GeneratorDefinition`, `GeneratorRun`). A SQL schema generator is the next step — it will read `base44/entities/*.jsonc` and emit `standalone/schema.sql` with matching tables + RLS. Built-in fields (`id`, `created_date`, `updated_date`, `created_by_id`) map to Supabase's `id uuid default gen_random_uuid()`, `created_at timestamptz default now()`, `updated_at timestamptz default now()`, `created_by uuid`.

## Connectors (Supabase / GitHub / Google)
The Base44 connector tokens don't transfer. For the standalone build, store each connection's access token in a Supabase `connections` table (type, access_token, refresh_token, expires_at) and implement `asServiceRole.connectors.getConnection(type)` in `base44Client.js` to read from it. Re-authorize each provider through your own OAuth flow on Vercel.

## Not yet covered (wire when needed)
- `GenerateImage` / `GenerateVideo` / `GenerateSpeech` / `TranscribeAudio` / `SendEmail` — pick providers (e.g. OpenAI images, fal.ai, Resend) and implement in the relevant `/api` route.
- Realtime subscriptions (`base44.entities.X.subscribe`) — wire Supabase Realtime channels.
- `aggregate` advanced options (`dateBucket`, `having`, `countDistinct`) — extend the PostgREST mapping.
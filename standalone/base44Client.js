// =============================================================================
// standalone/base44Client.js
// Standalone replacement for the Base44 SDK (`@base44/sdk`).
// Same public surface the app already calls (`base44.entities.*`, `base44.auth.*`,
// `base44.functions.invoke`, `base44.integrations.Core.*`, `base44.analytics`,
// `base44.users.inviteUser`) — but backed by Supabase (data + auth + storage)
// and the Vercel AI Gateway (AI). No `@base44/sdk` or `@base44/vite-plugin` needed.
//
// Deploy target: Vercel (frontend + /api functions) + Supabase (Postgres + Auth +
// Storage) + Railway (long-running workers). Set the env vars in README.
//
// To switch the app over: point the `@/api/base44Client` alias at this file
// (see standalone/README.md). Existing pages keep their `base44.entities.X.filter(...)`
// calls unchanged.
// =============================================================================

const ENV = (k, fallback = "") => import.meta.env?.[k] ?? fallback;
const SUPABASE_URL = ENV("VITE_SUPABASE_URL").replace(/\/+$/, "");
const SUPABASE_ANON_KEY = ENV("VITE_SUPABASE_ANON_KEY");
const AI_GATEWAY_URL = (ENV("VITE_VERCEL_AI_GATEWAY_URL") || "https://ai-gateway.vercel.sh/v1").replace("ai-gateway.vercel.app", "ai-gateway.vercel.sh").replace(/\/+$/, "");
const AI_GATEWAY_KEY = ENV("VITE_VERCEL_AI_GATEWAY_KEY");
const AI_MODEL = ENV("VITE_VERCEL_AI_GATEWAY_MODEL") || "openai/gpt-4o-mini";

// ---- token storage (Supabase GoTrue access/refresh tokens) ----
const TK = "sb_access_token", RK = "sb_refresh_token";
const getToken = () => localStorage.getItem(TK);
const setToken = (access, refresh) => { localStorage.setItem(TK, access); if (refresh) localStorage.setItem(RK, refresh); };
const clearToken = () => { localStorage.removeItem(TK); localStorage.removeItem(RK); };

// ---- small fetch helpers ----
const json = async (r) => { const t = await r.text(); try { return t ? JSON.parse(t) : null; } catch { return t; } };
async function sbFetch(path, { method = "GET", query, body, anon = false, prefer } = {}) {
  const url = new URL(`${SUPABASE_URL}${path}`);
  if (query) for (const [k, v] of Object.entries(query)) if (v != null) url.searchParams.set(k, v);
  const headers = { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY };
  const tok = anon ? null : getToken();
  headers.Authorization = tok ? "Bearer " + tok : "Bearer " + SUPABASE_ANON_KEY;
  if (prefer) headers.Prefer = prefer;
  const res = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined });
  if (!res.ok) throw new Error("Supabase " + res.status + ": " + ((await json(res)).message || res.statusText));
  return res;
}

// ---- MongoDB-style query → PostgREST query params ----
function enc(field, cond) {
  if (typeof cond !== "object" || cond === null || cond instanceof Date) return field + "=eq." + cond;
  const parts = [];
  for (const [opk, opv] of Object.entries(cond)) {
    switch (opk) {
      case "$eq": parts.push(field + "=eq." + opv); break;
      case "$ne": parts.push(field + "=neq." + opv); break;
      case "$gt": parts.push(field + "=gt." + opv); break;
      case "$gte": parts.push(field + "=gte." + opv); break;
      case "$lt": parts.push(field + "=lt." + opv); break;
      case "$lte": parts.push(field + "=lte." + opv); break;
      case "$in": parts.push(field + "=in.(" + (opv || []).join(",") + ")"); break;
      case "$nin": parts.push(field + "=not.in.(" + (opv || []).join(",") + ")"); break;
      case "$exists": parts.push(opv ? field + "=not.is.null" : field + "=is.null"); break;
      case "$regex": { const p = String(opv).replace(/^\^/, "").replace(/\$$/, ""); parts.push(field + "=ilike.%" + p + "%"); break; }
      default: break;
    }
  }
  return parts.join(",");
}
function buildFilters(query) {
  const params = {};
  const andParts = [];
  for (const [k, v] of Object.entries(query || {})) {
    if (k === "$or") {
      const parts = (v || []).map((c) => Object.entries(c).map(([f, cond]) => enc(f, cond)).join(","));
      params.or = "or=(" + parts.join("),(") + ")";
      continue;
    }
    andParts.push(enc(k, v));
  }
  if (andParts.length) params.and = andParts.join(",");
  return params;
}
function sortToOrder(sort) {
  if (!sort) return "";
  const s = String(sort);
  const desc = s.startsWith("-");
  const col = desc ? s.slice(1) : s;
  return col + "." + (desc ? "desc" : "asc");
}

// ---- entity factory ----
function makeEntity(name) {
  const table = name;
  return {
    async filter(query, opts) {
      const order = sortToOrder(opts && opts.sort);
      const limit = (opts && opts.limit) || 1000;
      const offset = opts && opts.cursor ? parseInt(opts.cursor, 10) || 0 : 0;
      let select = "*";
      if (opts && opts.fields && opts.fields.length) select = opts.fields.join(",");
      const params = { select, limit, ...(order ? { order } : {}), ...(offset ? { offset } : {}), ...buildFilters(query) };
      const res = await sbFetch("/rest/v1/" + table, { query: params });
      const items = (await json(res)) || [];
      const arr = Array.isArray(items) ? items : [];
      if (opts && (opts.sort || opts.limit || opts.cursor)) {
        const next = arr.length === limit ? String(offset + arr.length) : null;
        return { items: arr, next_cursor: next, has_more: !!next };
      }
      return arr;
    },
    async list(opts = {}) {
      if (opts.distinct) {
        const res = await sbFetch("/rest/v1/" + table, { query: { select: opts.distinct, limit: 1000 } });
        const items = (await json(res)) || [];
        const seen = new Set(); const out = [];
        for (const r of items) { const v = r[opts.distinct]; if (!seen.has(v)) { seen.add(v); out.push(v); } }
        return { items: out, next_cursor: null, has_more: false };
      }
      const order = sortToOrder(opts.sort);
      const res = await sbFetch("/rest/v1/" + table, { query: { select: "*", limit: opts.limit || 1000, ...(order ? { order } : {}) } });
      return { items: (await json(res)) || [], next_cursor: null, has_more: false };
    },
    async get(id) {
      const res = await sbFetch("/rest/v1/" + table, { query: { id: "eq." + id, limit: 1 } });
      const arr = (await json(res)) || [];
      if (!arr.length) throw new Error(name + " " + id + " not found");
      return arr[0];
    },
    async create(data) {
      const res = await sbFetch("/rest/v1/" + table, { method: "POST", body: data, prefer: "return=representation" });
      return (await json(res))[0];
    },
    async bulkCreate(rows) {
      const res = await sbFetch("/rest/v1/" + table, { method: "POST", body: rows, prefer: "return=representation" });
      return (await json(res)) || [];
    },
    async update(id, data) {
      const res = await sbFetch("/rest/v1/" + table, { method: "PATCH", query: { id: "eq." + id }, body: data, prefer: "return=representation" });
      return (await json(res))[0];
    },
    async bulkUpdate(rows) {
      const res = await sbFetch("/rest/v1/" + table, { method: "POST", body: rows, prefer: "return=representation,resolution=merge-duplicates" });
      return (await json(res)) || [];
    },
    async updateMany(query, setOp) {
      const patch = setOp.$set || setOp;
      const res = await sbFetch("/rest/v1/" + table, { method: "PATCH", query: buildFilters(query), body: patch, prefer: "return=representation" });
      return (await json(res)) || [];
    },
    async delete(id) {
      await sbFetch("/rest/v1/" + table, { method: "DELETE", query: { id: "eq." + id } });
      return true;
    },
    async deleteMany(query) {
      await sbFetch("/rest/v1/" + table, { method: "DELETE", query: buildFilters(query) });
      return true;
    },
    async count(query) {
      const res = await sbFetch("/rest/v1/" + table, { query: { select: "id", limit: 0, ...buildFilters(query) } });
      const range = res.headers.get("content-range");
      if (range) { const n = range.split("/")[1]; if (n && n !== "*") return parseInt(n, 10); }
      const arr = await json(res); return Array.isArray(arr) ? arr.length : 0;
    },
    async aggregate({ query, groupBy, sum, avg, min, max, sort, limit = 1000 } = {}) {
      const selectParts = [];
      if (groupBy) selectParts.push(groupBy);
      if (sum) for (const s of [].concat(sum)) selectParts.push(s + "::sum");
      if (avg) for (const a of [].concat(avg)) selectParts.push(a + "::avg");
      if (min) for (const m of [].concat(min)) selectParts.push(m + "::min");
      if (max) for (const m of [].concat(max)) selectParts.push(m + "::max");
      const params = { select: selectParts.join(","), limit, ...buildFilters(query) };
      const order = sortToOrder(sort); if (order) params.order = order;
      const res = await sbFetch("/rest/v1/" + table, { query: params });
      const rows = (await json(res)) || [];
      return { rows: rows.map((r) => ({ ...r, count: r.count || 1 })), truncated: false };
    },
    async upsert(records, { key = "id" } = {}) {
      const res = await sbFetch("/rest/v1/" + table, { method: "POST", body: records, prefer: "return=representation,resolution=merge-duplicates,onconflict=" + key });
      return { created: 0, updated: 0, records: (await json(res)) || [] };
    },
    subscribe() { return () => {}; },
  };
}

// ---- auth (Supabase GoTrue) ----
const auth = {
  async me() {
    const tok = getToken(); if (!tok) throw new Error("Not authenticated");
    const res = await fetch(SUPABASE_URL + "/auth/v1/user", { headers: { apikey: SUPABASE_ANON_KEY, Authorization: "Bearer " + tok } });
    if (!res.ok) throw new Error("Not authenticated");
    return json(res);
  },
  async isAuthenticated() { try { await auth.me(); return true; } catch { return false; } },
  async loginViaEmailPassword(email, password) {
    const res = await fetch(SUPABASE_URL + "/auth/v1/token?grant_type=password", { method: "POST", headers: { apikey: SUPABASE_ANON_KEY, "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
    if (!res.ok) throw new Error((await json(res)).error_description || "Login failed");
    const data = await json(res); setToken(data.access_token, data.refresh_token);
    window.location.href = new URLSearchParams(location.search).get("returnTo") || "/";
  },
  async register({ email, password }) {
    const res = await fetch(SUPABASE_URL + "/auth/v1/signup", { method: "POST", headers: { apikey: SUPABASE_ANON_KEY, "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
    if (!res.ok) throw new Error((await json(res)).msg || "Registration failed");
    return json(res);
  },
  async verifyOtp({ email, otpCode }) {
    const res = await fetch(SUPABASE_URL + "/auth/v1/verify", { method: "POST", headers: { apikey: SUPABASE_ANON_KEY, "Content-Type": "application/json" }, body: JSON.stringify({ email, token: otpCode, type: "email" }) });
    if (!res.ok) throw new Error("Invalid code");
    const data = await json(res); setToken(data.access_token, data.refresh_token);
    window.location.href = new URLSearchParams(location.search).get("returnTo") || "/";
  },
  async resendOtp(email) {
    await fetch(SUPABASE_URL + "/auth/v1/resend", { method: "POST", headers: { apikey: SUPABASE_ANON_KEY, "Content-Type": "application/json" }, body: JSON.stringify({ email, type: "signup" }) });
  },
  async resetPasswordRequest(email) {
    await fetch(SUPABASE_URL + "/auth/v1/recover", { method: "POST", headers: { apikey: SUPABASE_ANON_KEY, "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
  },
  async resetPassword({ resetToken, newPassword }) {
    const res = await fetch(SUPABASE_URL + "/auth/v1/user", { method: "PUT", headers: { apikey: SUPABASE_ANON_KEY, Authorization: "Bearer " + resetToken, "Content-Type": "application/json" }, body: JSON.stringify({ password: newPassword }) });
    if (!res.ok) throw new Error("Reset failed");
    window.location.href = "/login";
  },
  async updateMe(data) {
    const res = await fetch(SUPABASE_URL + "/auth/v1/user", { method: "PUT", headers: { apikey: SUPABASE_ANON_KEY, Authorization: "Bearer " + getToken(), "Content-Type": "application/json" }, body: JSON.stringify(data) });
    return json(res);
  },
  async logout() { clearToken(); window.location.href = "/login"; },
  redirectToLogin(nextUrl) { window.location.href = "/login" + (nextUrl ? "?returnTo=" + encodeURIComponent(nextUrl) : ""); },
  async loginWithProvider(provider, fromUrl) {
    const redirect = location.origin + "/?returnTo=" + encodeURIComponent(fromUrl || "/");
    window.location.href = SUPABASE_URL + "/auth/v1/authorize?provider=" + provider + "&redirect_to=" + encodeURIComponent(redirect);
  },
};

// ---- functions.invoke → Vercel /api routes ----
const functions = {
  async invoke(name, payload) {
    const headers = { "Content-Type": "application/json" };
    const tok = getToken();
    if (tok) headers.Authorization = "Bearer " + tok;
    const res = await fetch("/api/" + name, { method: "POST", headers, body: JSON.stringify(payload || {}) });
    const data = await json(res);
    if (!res.ok) throw new Error(data && data.error || name + " failed (" + res.status + ")");
    return data;
  },
};

// ---- integrations.Core (subset the app uses) ----
async function aiChat({ prompt, model, messages, response_json_schema }) {
  const msgs = messages || [{ role: "user", content: prompt }];
  const res = await fetch(AI_GATEWAY_URL + "/chat/completions", { method: "POST", headers: { Authorization: "Bearer " + AI_GATEWAY_KEY, "Content-Type": "application/json" }, body: JSON.stringify({ model: model || AI_MODEL, messages: msgs, ...(response_json_schema ? { response_format: { type: "json_schema", json_schema: response_json_schema } } : {}) }) });
  if (!res.ok) throw new Error("AI Gateway " + res.status + ": " + (await res.text()).slice(0, 300));
  const data = await res.json();
  return (data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || "";
}

async function uploadToStorage(file, bucket, isPublic) {
  const path = crypto.randomUUID() + "-" + file.name;
  const res = await fetch(SUPABASE_URL + "/storage/v1/object/" + bucket + "/" + path, { method: "POST", headers: { apikey: SUPABASE_ANON_KEY, Authorization: "Bearer " + (getToken() || SUPABASE_ANON_KEY), "Content-Type": file.type || "application/octet-stream" }, body: file });
  if (!res.ok) throw new Error("Storage upload failed: " + res.status);
  const key = isPublic ? "file_url" : "file_uri";
  const url = isPublic ? (SUPABASE_URL + "/storage/v1/object/public/" + bucket + "/" + path) : ("storage://" + bucket + "/" + path);
  return { [key]: url };
}

const integrations = {
  Core: {
    async InvokeLLM({ prompt, model, response_json_schema }) {
      return aiChat({ prompt, model, response_json_schema });
    },
    async UploadPrivateFile({ file }) { return uploadToStorage(file, "private", false); },
    async UploadPublicFile({ file }) { return uploadToStorage(file, "public", true); },
    async CreateFileSignedUrl({ file_uri, expires_in = 300 }) {
      const m = String(file_uri).replace(/^storage:\/\/\//, "").split("/");
      const bucket = m.shift(); const path = m.join("/");
      const res = await fetch(SUPABASE_URL + "/storage/v1/object/sign/" + bucket + "/" + path, { method: "POST", headers: { apikey: SUPABASE_ANON_KEY, Authorization: "Bearer " + (getToken() || SUPABASE_ANON_KEY), "Content-Type": "application/json" }, body: JSON.stringify({ expiresIn: expires_in }) });
      const data = await json(res);
      return { signed_url: SUPABASE_URL + data.signedURL };
    },
    GenerateImage: async () => { throw new Error("GenerateImage: wire an image provider in the standalone build."); },
    SendEmail: async () => { throw new Error("SendEmail: wire Resend in the Vercel /api function."); },
    TranscribeAudio: async () => { throw new Error("TranscribeAudio: wire a provider in /api."); },
    GenerateSpeech: async () => { throw new Error("GenerateSpeech: wire a TTS provider in /api."); },
    GenerateVideo: async () => { throw new Error("GenerateVideo: wire a video provider in /api."); },
    async ExtractDataFromUploadedFile({ file_url, json_schema }) {
      const txt = await (await fetch(file_url)).text();
      return aiChat({ prompt: "Extract structured data from this file. Return JSON matching this schema: " + JSON.stringify(json_schema) + ".\n\nFile:\n" + txt.slice(0, 12000) });
    },
  },
};

// ---- analytics + users ----
const analytics = { track() {} };
const users = {
  async inviteUser(email, role) {
    return functions.invoke("adminInvite", { email, role });
  },
};

// ---- asServiceRole (server-only, used inside /api functions) ----
const asServiceRole = {
  connectors: {
    async getConnection() {
      throw new Error("asServiceRole.connectors.getConnection — wire a connections table in Supabase for the standalone build.");
    },
  },
  integrations: integrations,
};

// ---- entity registry: build on demand ----
const _entities = new Proxy({}, { get: (_, name) => _entities[name] || (_entities[name] = makeEntity(name)) });

export const base44 = {
  entities: _entities,
  auth,
  functions,
  integrations,
  analytics,
  users,
  asServiceRole,
};

export default base44;
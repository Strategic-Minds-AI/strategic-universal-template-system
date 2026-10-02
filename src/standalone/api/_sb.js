/* global process */
// standalone/api/_sb.js — server-side Supabase client (service role) for Vercel /api routes.
// Mirrors the subset of base44.asServiceRole.entities the backend functions use.
const URL = (process.env.SUPABASE_URL || "").replace(/\/+$/, "");
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const H = { apikey: KEY, Authorization: "Bearer " + KEY, "Content-Type": "application/json" };
const j = async (r) => {
  const t = await r.text();
  if (!r.ok) throw new Error(`Supabase ${r.status}: ${t.slice(0, 300)}`);
  try { return t ? JSON.parse(t) : null; } catch { return t; }
};

function enc(field, cond) {
  if (typeof cond !== "object" || cond === null) return field + "=eq." + cond;
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
      case "$exists": parts.push(opv ? field + "=not.is.null" : field + "=is.null"); break;
      default: break;
    }
  }
  return parts.join(",");
}
function buildFilters(query) {
  const params = new URLSearchParams();
  const clauses = [];
  const expression = (field, condition) => enc(field, condition).split(",").map((s) => s.replace("=", ".")).join(",");
  for (const [k, v] of Object.entries(query || {})) {
    if (k === "$or") { params.set("or", "(" + v.map((c) => Object.entries(c).map(([f, condition]) => expression(f, condition)).join(",")).join(",") + ")"); continue; }
    clauses.push(expression(k, v));
  }
  if (clauses.length) params.set("and", "(" + clauses.join(",") + ")");
  return params;
}
function sortToOrder(s) { if (!s) return ""; const d = String(s).startsWith("-"); const c = d ? s.slice(1) : s; return c + "." + (d ? "desc" : "asc"); }

function entity(name, headers = H) {
  const base = URL + "/rest/v1/" + encodeURIComponent(name);
  return {
    async filter(query, opts = {}) {
      const p = buildFilters(query);
      p.set("select", (opts.fields && opts.fields.join(",")) || "*");
      p.set("limit", opts.limit || 1000);
      const o = sortToOrder(opts.sort); if (o) p.set("order", o);
      const r = await fetch(base + "?" + p.toString(), { headers });
      const items = await j(r);
      return { items: Array.isArray(items) ? items : [], next_cursor: null, has_more: false };
    },
    async count(query = {}) {
      const p = buildFilters(query); p.set("select", "id"); p.set("limit", "0");
      const r = await fetch(base + "?" + p, { headers: { ...headers, Prefer: "count=exact" } });
      if (!r.ok) throw new Error("Record count failed");
      return Number(r.headers.get("content-range")?.split("/")[1] || 0);
    },
    async get(id) { const r = await fetch(base + "?id=eq." + id + "&limit=1", { headers }); const a = await j(r); return a && a[0]; },
    async create(data) { const r = await fetch(base, { method: "POST", headers: { ...headers, Prefer: "return=representation" }, body: JSON.stringify(data) }); const a = await j(r); return a && a[0]; },
    async update(id, data) { const r = await fetch(base + "?id=eq." + id, { method: "PATCH", headers: { ...headers, Prefer: "return=representation" }, body: JSON.stringify(data) }); const a = await j(r); return a && a[0]; },
    async delete(id) { await fetch(base + "?id=eq." + id, { method: "DELETE", headers }); return true; },
  };
}

export const sb = { entities: new Proxy({}, { get: (_, n) => entity(n) }) };
export function sbForUser(req) {
  const headers = { ...H, Authorization: "Bearer " + requireUser(req) };
  return { entities: new Proxy({}, { get: (_, n) => entity(n, headers) }) };
}
export async function verifyUser(req) {
  const token = requireUser(req);
  if (!token) return null;
  const res = await fetch(URL + "/auth/v1/user", { headers: { apikey: KEY, Authorization: "Bearer " + token } });
  return res.ok ? res.json() : null;
}

export function requireUser(req) {
  const a = req.headers.get("authorization") || req.headers.get("Authorization");
  if (!a || !a.startsWith("Bearer ")) return null;
  return a.slice(7); // the Supabase JWT; service-role ops use sb regardless
}

export const ai = {
  async message({ messages, model, tools, tool_choice, response_json_schema, image = false }) {
    const key = process.env.VERCEL_AI_GATEWAY_KEY;
    if (!key) throw new Error("VERCEL_AI_GATEWAY_KEY is not configured");
    const base = (process.env.VERCEL_AI_GATEWAY_URL || "https://ai-gateway.vercel.sh/v1").replace("ai-gateway.vercel.app", "ai-gateway.vercel.sh").replace(/\/+$/, "");
    const endpoint = new globalThis.URL(base);
    if (endpoint.protocol !== "https:" || endpoint.hostname !== "ai-gateway.vercel.sh") throw new Error("Use the official Vercel AI Gateway URL");
    const body = { model: model || (image ? process.env.VERCEL_AI_GATEWAY_IMAGE_MODEL || "google/gemini-3.1-flash-image-preview" : process.env.VERCEL_AI_GATEWAY_MODEL || "openai/gpt-4o-mini"), messages, stream: false, ...(image ? { modalities: ["text", "image"] } : { max_tokens: 4096 }) };
    if (tools?.length) { body.tools = tools; body.tool_choice = tool_choice || "auto"; }
    if (response_json_schema) body.response_format = { type: "json_schema", json_schema: { name: "factory_result", schema: response_json_schema } };
    const r = await fetch(`${base}/chat/completions`, { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: JSON.stringify(body), signal: AbortSignal.timeout(image ? 90000 : 60000) });
    if (!r.ok) throw new Error(`Vercel AI Gateway ${r.status}: ${(await r.text()).slice(0, 400)}`);
    const d = await r.json();
    if (!d?.choices?.[0]?.message) throw new Error("Vercel AI Gateway returned no assistant message");
    return d.choices[0].message;
  },
  async chat(messages, model, response_json_schema) {
    const m = await this.message({ messages, model, response_json_schema });
    if (!m.content?.trim()) throw new Error("Vercel AI Gateway returned an empty response");
    return m.content;
  },
  async image(prompt) {
    const m = await this.message({ messages: [{ role: "user", content: prompt }], image: true });
    if (!m.images?.[0]?.image_url?.url) throw new Error("Vercel AI Gateway returned no image");
    return m.images[0].image_url.url;
  },
};
/* global process */
// standalone/api/_sb.js — server-side Supabase client (service role) for Vercel /api routes.
// Mirrors the subset of base44.asServiceRole.entities the backend functions use.
const URL = (process.env.SUPABASE_URL || "").replace(/\/+$/, "");
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const H = { apikey: KEY, Authorization: "Bearer " + KEY, "Content-Type": "application/json" };
const j = async (r) => { const t = await r.text(); try { return t ? JSON.parse(t) : null; } catch { return t; } };

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
  for (const [k, v] of Object.entries(query || {})) {
    if (k === "$or") { const parts = (v || []).map((c) => Object.entries(c).map(([f, cond]) => enc(f, cond)).join(",")); params.set("or", "or=(" + parts.join("),(") + ")"); continue; }
    const e = enc(k, v); if (e) params.set("and", (params.get("and") ? params.get("and") + "," : "") + e);
  }
  return params;
}
function sortToOrder(s) { if (!s) return ""; const d = String(s).startsWith("-"); const c = d ? s.slice(1) : s; return c + "." + (d ? "desc" : "asc"); }

function entity(name) {
  const base = URL + "/rest/v1/" + encodeURIComponent(name);
  return {
    async filter(query, opts = {}) {
      const p = buildFilters(query);
      p.set("select", (opts.fields && opts.fields.join(",")) || "*");
      p.set("limit", opts.limit || 1000);
      const o = sortToOrder(opts.sort); if (o) p.set("order", o);
      const r = await fetch(base + "?" + p.toString(), { headers: H });
      const items = await j(r);
      return { items: Array.isArray(items) ? items : [], next_cursor: null, has_more: false };
    },
    async get(id) { const r = await fetch(base + "?id=eq." + id + "&limit=1", { headers: H }); const a = await j(r); return a && a[0]; },
    async create(data) { const r = await fetch(base, { method: "POST", headers: { ...H, Prefer: "return=representation" }, body: JSON.stringify(data) }); const a = await j(r); return a && a[0]; },
    async update(id, data) { const r = await fetch(base + "?id=eq." + id, { method: "PATCH", headers: { ...H, Prefer: "return=representation" }, body: JSON.stringify(data) }); const a = await j(r); return a && a[0]; },
    async delete(id) { await fetch(base + "?id=eq." + id, { method: "DELETE", headers: H }); return true; },
  };
}

export const sb = { entities: new Proxy({}, { get: (_, n) => entity(n) }) };

export function requireUser(req) {
  const a = req.headers.get("authorization") || req.headers.get("Authorization");
  if (!a || !a.startsWith("Bearer ")) return null;
  return a.slice(7); // the Supabase JWT; service-role ops use sb regardless
}

export const ai = {
  url: (process.env.VERCEL_AI_GATEWAY_URL || "https://ai-gateway.vercel.sh/v1").replace("ai-gateway.vercel.app", "ai-gateway.vercel.sh").replace(/\/+$/, ""),
  key: process.env.VERCEL_AI_GATEWAY_KEY,
  model: process.env.VERCEL_AI_GATEWAY_MODEL || "openai/gpt-4o-mini",
  async chat(messages, model) {
    const r = await fetch(this.url + "/chat/completions", { method: "POST", headers: { Authorization: "Bearer " + this.key, "Content-Type": "application/json" }, body: JSON.stringify({ model: model || this.model, messages }) });
    if (!r.ok) throw new Error("AI " + r.status + ": " + (await r.text()).slice(0, 300));
    const d = await r.json();
    return (d && d.choices && d.choices[0] && d.choices[0].message && d.choices[0].message.content) || "";
  },
};
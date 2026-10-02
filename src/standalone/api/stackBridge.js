// standalone/api/stackBridge.js — Vercel route. POST {op, ...}.
// Drives Supabase / GitHub / Google Drive / Google Sheets via tokens stored in
// the standalone `connections` table (admin-managed). Re-authorize each provider
// through your own OAuth flow on Vercel and store its access_token there.
import { sb, requireUser } from "./_sb.js";

async function conn(type) {
  const r = await sb.entities.connections.filter({ type, enabled: true }, { limit: 1 });
  const c = r.items[0];
  if (!c) throw new Error("connection '" + type + "' not configured (add a row in the connections table)");
  return { accessToken: c.access_token };
}
const j = async (r) => r.json().catch(() => null);

export default async function (req) {
  try {
    if (!requireUser(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const b = await req.json();
    const op = String(b.op || "");

    if (op === "supabase.projects") {
      const { accessToken } = await conn("supabase");
      const r = await fetch("https://api.supabase.com/v1/projects", { headers: { Authorization: "Bearer " + accessToken } });
      const data = await j(r);
      return Response.json({ projects: (data || []).map((p) => ({ id: p.id, name: p.name, region: p.region, status: p.status })) });
    }
    if (op === "supabase.sql") {
      const ref = String(b.ref || ""), query = String(b.query || ""), write = !!b.write;
      if (!ref || !query) return Response.json({ error: "ref and query required" }, { status: 400 });
      const { accessToken } = await conn("supabase");
      const path = write ? "query" : "query/read-only";
      const r = await fetch("https://api.supabase.com/v1/projects/" + ref + "/database/" + path, { method: "POST", headers: { Authorization: "Bearer " + accessToken, "Content-Type": "application/json" }, body: JSON.stringify({ query }) });
      return Response.json({ ok: r.ok, status: r.status, data: await j(r) });
    }
    if (op === "github.repos") {
      const { accessToken } = await conn("github");
      const r = await fetch("https://api.github.com/user/repos?per_page=50&sort=updated", { headers: { Authorization: "Bearer " + accessToken, Accept: "application/vnd.github+json" } });
      const data = await j(r);
      return Response.json({ repos: (data || []).map((x) => ({ id: x.id, name: x.full_name, private: x.private, url: x.html_url })) });
    }
    if (op === "github.createRepo") {
      const name = String(b.name || "").trim();
      if (!name) return Response.json({ error: "name required" }, { status: 400 });
      const { accessToken } = await conn("github");
      const r = await fetch("https://api.github.com/user/repos", { method: "POST", headers: { Authorization: "Bearer " + accessToken, Accept: "application/vnd.github+json", "Content-Type": "application/json" }, body: JSON.stringify({ name, private: b.private !== false, description: String(b.description || ""), auto_init: true }) });
      const data = await j(r);
      return Response.json({ ok: r.ok, status: r.status, repo: data.full_name, url: data.html_url });
    }
    if (op === "drive.createFolder") {
      const name = String(b.name || "").trim();
      if (!name) return Response.json({ error: "name required" }, { status: 400 });
      const { accessToken } = await conn("googledrive");
      const r = await fetch("https://www.googleapis.com/drive/v3/files", { method: "POST", headers: { Authorization: "Bearer " + accessToken, "Content-Type": "application/json" }, body: JSON.stringify({ name, mimeType: "application/vnd.google-apps.folder" }) });
      const data = await j(r);
      return Response.json({ ok: r.ok, status: r.status, id: data.id, name: data.name });
    }
    if (op === "sheets.append") {
      const spreadsheetId = String(b.spreadsheetId || ""), sheet = String(b.sheet || "Sheet1"), values = b.values;
      if (!spreadsheetId || !Array.isArray(values)) return Response.json({ error: "spreadsheetId and values[] required" }, { status: 400 });
      const { accessToken } = await conn("googlesheets");
      const url = "https://sheets.googleapis.com/v4/spreadsheets/" + spreadsheetId + "/values/" + encodeURIComponent(sheet + "!A1") + ":append?valueInputOption=RAW&insertDataOption=INSERT_ROWS";
      const r = await fetch(url, { method: "POST", headers: { Authorization: "Bearer " + accessToken, "Content-Type": "application/json" }, body: JSON.stringify({ values }) });
      return Response.json({ ok: r.ok, status: r.status, data: await j(r) });
    }
    return Response.json({ error: "unknown op: " + op, ops: ["supabase.projects", "supabase.sql", "github.repos", "github.createRepo", "drive.createFolder", "sheets.append"] }, { status: 400 });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
// Stack Bridge — drives the operator's connected accounts end-to-end:
// Supabase (backend), GitHub (code), Google Drive + Sheets (workspace).
// Each op is a narrow, validated operation the agent / provisioning page can call.
import { createClientFromRequest } from "npm:@base44/sdk@0.8.52";

const conn = (base44, type) => base44.asServiceRole.connectors.getConnection(type);

// Prefer the Supabase PAT the admin pasted into the Universal Provisioning
// page (stored in AdapterDefinition.config_status.secrets.SUPABASE_ACCESS_TOKEN);
// fall back to the OAuth connector token if no PAT is stored.
async function getSupabaseToken(base44) {
  try {
    const page = await base44.asServiceRole.entities.AdapterDefinition.filter({ adapter_key: "supabase" }, { limit: 1 });
    const rec = (page.items || [])[0];
    const pat = rec?.config_status?.secrets?.SUPABASE_ACCESS_TOKEN;
    if (pat && String(pat).trim()) return String(pat).trim();
  } catch { /* fall through to connector */ }
  const { accessToken } = await base44.asServiceRole.connectors.getConnection("supabase");
  return accessToken;
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const op = String(body.op || "");
    const j = (r) => r.json().catch(() => null);

    // ---------- Supabase ----------
    if (op === "supabase.projects") {
      const accessToken = await getSupabaseToken(base44);
      const r = await fetch("https://api.supabase.com/v1/projects", { headers: { Authorization: `Bearer ${accessToken}` } });
      const data = await j(r);
      return Response.json({ projects: (data || []).map((p) => ({ id: p.id, name: p.name, region: p.region, status: p.status })) });
    }
    if (op === "supabase.sql") {
      const ref = String(body.ref || "");
      const query = String(body.query || "");
      const write = !!body.write;
      if (!ref || !query) return Response.json({ error: "ref and query required" }, { status: 400 });
      const accessToken = await getSupabaseToken(base44);
      const path = write ? "query" : "query/read-only";
      const r = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/${path}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      return Response.json({ ok: r.ok, status: r.status, data: await j(r) });
    }

    // ---------- GitHub ----------
    if (op === "github.repos") {
      const { accessToken } = await conn(base44, "github");
      const r = await fetch("https://api.github.com/user/repos?per_page=50&sort=updated", {
        headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/vnd.github+json" },
      });
      const data = await j(r);
      return Response.json({ repos: (data || []).map((x) => ({ id: x.id, name: x.full_name, private: x.private, url: x.html_url })) });
    }
    if (op === "github.createRepo") {
      const name = String(body.name || "").trim();
      if (!name) return Response.json({ error: "name required" }, { status: 400 });
      const { accessToken } = await conn(base44, "github");
      const r = await fetch("https://api.github.com/user/repos", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/vnd.github+json", "Content-Type": "application/json" },
        body: JSON.stringify({ name, private: body.private !== false, description: String(body.description || ""), auto_init: true }),
      });
      const data = await j(r);
      return Response.json({ ok: r.ok, status: r.status, repo: data.full_name, url: data.html_url });
    }

    // ---------- Google Drive ----------
    if (op === "drive.createFolder") {
      const name = String(body.name || "").trim();
      if (!name) return Response.json({ error: "name required" }, { status: 400 });
      const { accessToken } = await conn(base44, "googledrive");
      const r = await fetch("https://www.googleapis.com/drive/v3/files", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ name, mimeType: "application/vnd.google-apps.folder" }),
      });
      const data = await j(r);
      return Response.json({ ok: r.ok, status: r.status, id: data.id, name: data.name });
    }

    // ---------- Google Sheets ----------
    if (op === "sheets.append") {
      const spreadsheetId = String(body.spreadsheetId || "");
      const sheet = String(body.sheet || "Sheet1");
      const values = body.values;
      if (!spreadsheetId || !Array.isArray(values)) return Response.json({ error: "spreadsheetId and values[] required" }, { status: 400 });
      const { accessToken } = await conn(base44, "googlesheets");
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheet + "!A1")}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`;
      const r = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ values }),
      });
      return Response.json({ ok: r.ok, status: r.status, data: await j(r) });
    }

    return Response.json({
      error: `unknown op: ${op}`,
      ops: ["supabase.projects", "supabase.sql", "github.repos", "github.createRepo", "drive.createFolder", "sheets.append"],
    }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
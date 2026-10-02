import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { FileCode2, Plus, Search, RefreshCw, Loader2 } from "lucide-react";
import { buildAllTemplatePacks } from "@/lib/factory/generator/seedTemplatePacks.js";
import { PREVIEW_STYLES } from "@/lib/gallery/previewStyles.js";
import { loadConfig, themeToCssVars } from "@/lib/gallery/studioConfig.js";
import VisualizerCard from "@/components/visualizer/VisualizerCard.jsx";

const MODE_BADGE = { text: "text", file_tree: "files", code: "code", prompt: "prompt", document: "doc", config: "config", sql: "sql", ui_recipe: "recipe", workflow_recipe: "flow", provisioning_recipe: "prov", compound: "mix" };

export default function TemplateLibrary() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [query, setQuery] = useState("");
  const [live, setLive] = useState(false);
  const config = loadConfig();
  const themeVars = useMemo(() => themeToCssVars(config), []);

  const reload = async () => {
    setLoading(true); setErr("");
    try {
      const page = await base44.entities.TemplatePack.filter({}, { sort: "-created_date", limit: 100 });
      setItems(page.items || []);
    } catch (e) { setErr(e?.message || "load failed"); }
    finally { setLoading(false); }
  };
  useEffect(() => { reload(); }, []);

  // Real-time subscription
  useEffect(() => {
    let unsub;
    try { unsub = base44.entities.TemplatePack?.subscribe?.(() => { setLive(true); reload(); }); } catch { /* */ }
    return () => { try { unsub?.(); } catch {} };
  }, []);

  const filtered = useMemo(() => {
    if (!query) return items;
    const q = query.toLowerCase();
    return items.filter((r) => (r.name || "").toLowerCase().includes(q) || (r.template_key || "").toLowerCase().includes(q) || (r.mode || "").toLowerCase().includes(q));
  }, [items, query]);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <style>{PREVIEW_STYLES}</style>
      <div className="flex items-center justify-between mb-5 gap-4 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <div className="xa-icon-chip shrink-0"><FileCode2 className="w-5 h-5" /></div>
          <div className="min-w-0">
            <h1 className="text-xl font-black font-heading flex items-center gap-2">Template Library
              <span className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${live ? "bg-green-500 animate-pulse" : "bg-gray-300"}`} />
                <span className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground">{live ? "Live" : "Snapshot"}</span>
              </span>
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">Versioned template packs — text, file-tree, code, prompt, document, config, recipes.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={async () => { try { await base44.entities.TemplatePack.bulkCreate(buildAllTemplatePacks()); await reload(); } catch (e) { alert("Seed failed: " + (e?.message || "unknown")); } }} className="xa-btn-primary text-xs" style={{ padding: "8px 12px" }}><Plus className="w-3.5 h-3.5" /> Seed templates</button>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter…" className="pl-8 pr-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring w-44" />
          </div>
          <button onClick={reload} className="p-2 rounded-lg border border-input hover:bg-muted" title="Reload"><RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /></button>
        </div>
      </div>

      {loading ? (
        <div className="xa-card p-6 text-center text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Loading…</div>
      ) : err ? (
        <div className="xa-card p-6 text-center text-sm text-red-600">{err}</div>
      ) : filtered.length === 0 ? (
        <div className="xa-card xa-card-subtle p-12 text-center"><div className="text-sm font-semibold">No template packs yet</div><div className="text-xs text-muted-foreground mt-1">Click Seed templates to populate all 124 packs from the registry.</div></div>
      ) : (
        <div style={themeVars} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((r) => (
            <VisualizerCard key={r.id} title={r.name} keyField={r.template_key} badge={MODE_BADGE[r.mode] || r.mode} status={r.status} version={r.version} record={r} entityName="TemplatePack" subtitle={`${(r.dependencies || []).length} dependencies`} />
          ))}
        </div>
      )}
    </div>
  );
}
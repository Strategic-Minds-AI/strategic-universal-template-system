import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Boxes, Plus, Search, RefreshCw, Loader2 } from "lucide-react";
import { buildAllDefinitions } from "@/lib/factory/generator/seedDefinitions.js";
import { PREVIEW_STYLES } from "@/lib/gallery/previewStyles.js";
import { loadConfig, themeToCssVars } from "@/lib/gallery/studioConfig.js";
import VisualizerCard from "@/components/visualizer/VisualizerCard.jsx";
import { StatusPill } from "@/components/factory/EntityListPage.jsx";

export default function GeneratorLibrary() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [query, setQuery] = useState("");
  const config = loadConfig();
  const themeVars = useMemo(() => themeToCssVars(config), []);

  const reload = async () => {
    setLoading(true); setErr("");
    try {
      const page = await base44.entities.GeneratorDefinition.filter({}, { sort: "-created_date", limit: 100 });
      setItems(page.items || []);
    } catch (e) { setErr(e?.message || "load failed"); }
    finally { setLoading(false); }
  };
  useEffect(() => { reload(); }, []);

  const filtered = useMemo(() => {
    if (!query) return items;
    const q = query.toLowerCase();
    return items.filter((r) => (r.name || "").toLowerCase().includes(q) || (r.generator_key || "").toLowerCase().includes(q) || (r.category || "").toLowerCase().includes(q));
  }, [items, query]);

  const byCat = {};
  filtered.forEach((r) => { (byCat[r.category || "business"] = byCat[r.category || "business"] || []).push(r); });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <style>{PREVIEW_STYLES}</style>
      <div className="flex items-center justify-between mb-5 gap-4 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <div className="xa-icon-chip shrink-0"><Boxes className="w-5 h-5" /></div>
          <div className="min-w-0">
            <h1 className="text-xl font-black font-heading flex items-center gap-2">Generator Library <span className="xa-pill-badge" style={{ fontSize: 10 }}>registry</span></h1>
            <p className="text-sm text-muted-foreground mt-0.5">Versioned generator definitions — DAG-compiled, validation-gated, reproducible.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={async () => { try { await base44.entities.GeneratorDefinition.bulkCreate(buildAllDefinitions()); await reload(); } catch (e) { alert("Seed failed: " + (e?.message || "unknown")); } }} className="xa-btn-primary text-xs" style={{ padding: "8px 12px" }}><Plus className="w-3.5 h-3.5" /> Seed registry</button>
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
        <div className="xa-card xa-card-subtle p-12 text-center"><div className="text-sm font-semibold">No generators yet</div><div className="text-xs text-muted-foreground mt-1">Seed the canonical registry to populate all generator definitions.</div></div>
      ) : (
        <div style={themeVars} className="flex flex-col gap-6">
          {Object.entries(byCat).map(([cat, recs]) => (
            <div key={cat}>
              <div className="flex items-center gap-2 mb-3"><span className="w-3 h-3 rounded-full bg-[#0059ff]" /><h2 className="text-sm font-bold capitalize">{cat}</h2><span className="text-xs text-muted-foreground">{recs.length}</span></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {recs.map((r) => (
                  <div key={r.id} onClick={() => (window.location.href = `/studio?id=${r.id}`)} className="cursor-pointer">
                    <VisualizerCard title={r.name} keyField={r.generator_key} badge={cat} status={r.status} version={r.version} record={r} entityName="GeneratorDefinition" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
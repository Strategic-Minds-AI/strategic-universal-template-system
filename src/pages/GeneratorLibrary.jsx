import React, { useState, useEffect, useMemo, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Boxes, Plus, Search, RefreshCw, Loader2, Zap, Video, Brain } from "lucide-react";
import { buildAllDefinitions } from "@/lib/factory/generator/seedDefinitions.js";
import { PREVIEW_STYLES } from "@/lib/gallery/previewStyles.js";
import { loadConfig, themeToCssVars } from "@/lib/gallery/studioConfig.js";
import VisualizerCard from "@/components/visualizer/VisualizerCard.jsx";
import SectionPreviewBanner from "@/components/sectionRenders/SectionPreviewBanner.jsx";
import GeneratorsRender from "@/components/sectionRenders/GeneratorsRender.jsx";

export default function GeneratorLibrary() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [runCounts, setRunCounts] = useState({});
  const [live, setLive] = useState(false);
  const mountedRef = useRef(true);
  const config = loadConfig();
  const themeVars = useMemo(() => themeToCssVars(config), []);

  const reload = async () => {
    setLoading(true); setErr("");
    try {
      const page = await base44.entities.GeneratorDefinition.filter({}, { sort: "-created_date", limit: 100 });
      if (!mountedRef.current) return;
      setItems(page.items || []);
    } catch (e) { setErr(e?.message || "load failed"); }
    finally { if (mountedRef.current) setLoading(false); }
  };

  const loadRunCounts = async () => {
    try {
      const res = await base44.entities.GeneratorRun.aggregate({ groupBy: "generator_id", limit: 200 });
      if (!mountedRef.current) return;
      const map = {};
      (res.rows || []).forEach((row) => { if (row.generator_id) map[row.generator_id] = row.count || 0; });
      setRunCounts(map);
    } catch { /* best-effort */ }
  };

  useEffect(() => {
    mountedRef.current = true;
    reload();
    loadRunCounts();
    return () => { mountedRef.current = false; };
  }, []);

  // Real-time subscription
  useEffect(() => {
    if (loading) return;
    let unsub;
    try {
      unsub = base44.entities.GeneratorDefinition.subscribe(() => { setLive(true); reload(); });
    } catch { /* best-effort */ }
    return () => unsub?.();
  }, [loading]);

  const categories = useMemo(() => ["All", ...new Set(items.map((r) => r.category || "business").sort())], [items]);

  const filtered = useMemo(() => {
    let list = items;
    if (category !== "All") list = list.filter((r) => (r.category || "business") === category);
    if (query) {
      const q = query.toLowerCase();
      list = list.filter((r) => (r.name || "").toLowerCase().includes(q) || (r.generator_key || "").toLowerCase().includes(q) || (r.category || "").toLowerCase().includes(q));
    }
    return list;
  }, [items, query, category]);

  const byCat = {};
  filtered.forEach((r) => { (byCat[r.category || "business"] = byCat[r.category || "business"] || []).push(r); });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <style>{PREVIEW_STYLES}</style>
      <SectionPreviewBanner render={GeneratorsRender} label="Generators" />
      <div className="flex items-center justify-between mb-5 gap-4 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <div className="xa-icon-chip shrink-0"><Boxes className="w-5 h-5" /></div>
          <div className="min-w-0">
            <h1 className="text-xl font-black font-heading flex items-center gap-2">Generator Library <span className="xa-pill-badge" style={{ fontSize: 10 }}>registry</span>
              <span className="flex items-center gap-1 ml-1">
                <span className={`w-2 h-2 rounded-full ${live ? "bg-green-500 animate-pulse" : "bg-gray-300"}`} />
                <span className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground">{live ? "Live" : "Snapshot"}</span>
              </span>
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">Versioned generator definitions — DAG-compiled, validation-gated, reproducible. Includes video & AI visual render generators.</p>
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

      {/* Category tabs */}
      {!loading && !err && items.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-5">
          {categories.map((c) => (
            <button key={c} onClick={() => setCategory(c)} className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${category === c ? "bg-foreground text-background" : "text-muted-foreground bg-muted hover:bg-muted/70"}`}>{c}</button>
          ))}
        </div>
      )}

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
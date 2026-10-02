import React, { useState, useEffect } from "react";
import { Eye, RefreshCw, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import generatorTypes from "@/lib/factory/generator/registry/generator_types.json";
import { StatusPill } from "@/components/factory/EntityListPage.jsx";

const CATEGORY_COLORS = {
  code: "#0d2f96", ai: "#7c3aed", business: "#0d9488", consulting: "#f59e0b",
  marketing: "#e11d48", data: "#0891b2", infra: "#475569", design: "#db2777",
};

const REGISTRY_ENTITIES = [
  "GeneratorDefinition", "PolicyDefinition", "QualityProfile", "ValidationProfile",
  "WorkflowDefinition", "TemplatePack", "AdapterDefinition",
];

const tabCls = (on) =>
  `inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${on ? "bg-[#0059ff] text-white" : "border border-input text-muted-foreground hover:text-foreground hover:bg-muted"}`;

function keyOf(r) {
  return r.generator_key || r.profile_key || r.policy_key || r.workflow_key || r.template_key || r.adapter_key || r.id;
}

export default function Visualizer() {
  const [tab, setTab] = useState("types");
  const [entity, setEntity] = useState("GeneratorDefinition");
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const loadEntity = async (key) => {
    setLoading(true);
    setErr("");
    try {
      const page = await base44.entities[key].filter({}, { sort: "-created_date", limit: 60 });
      setRecords(page.items || []);
    } catch (e) {
      setErr(e?.message || "load failed");
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab === "records") loadEntity(entity);
  }, [tab, entity]);

  const types = generatorTypes.generator_types || [];
  const byCat = {};
  types.forEach((t) => { (byCat[t.category] = byCat[t.category] || []).push(t); });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-1">
        <div className="xa-icon-chip"><Eye className="w-5 h-5" /></div>
        <div>
          <h1 className="text-xl font-black font-heading">Visualizer</h1>
          <p className="text-sm text-muted-foreground">Visual cards for every generator type, registry, and definition in the factory.</p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 mt-5 mb-5">
        <button onClick={() => setTab("types")} className={tabCls(tab === "types")}>Generator Types</button>
        <button onClick={() => setTab("records")} className={tabCls(tab === "records")}>Registry Records</button>
      </div>

      {tab === "types" ? (
        <div className="flex flex-col gap-6">
          {Object.entries(byCat).map(([cat, items]) => (
            <div key={cat}>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-3 h-3 rounded-full" style={{ background: CATEGORY_COLORS[cat] || "#475569" }} />
                <h2 className="text-sm font-bold capitalize">{cat}</h2>
                <span className="text-xs text-muted-foreground">{items.length}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {items.map((t) => (
                  <div key={t.id} className="xa-card p-3 flex flex-col gap-2">
                    <div className="h-12 rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${CATEGORY_COLORS[cat] || "#475569"}22, ${(CATEGORY_COLORS[cat] || "#475569")}55)` }}>
                      <span className="font-mono text-xs font-bold" style={{ color: CATEGORY_COLORS[cat] || "#475569" }}>{t.type}</span>
                    </div>
                    <div className="text-xs font-mono text-muted-foreground truncate">{t.id}</div>
                    <div className="flex items-center justify-between">
                      <StatusPill status={t.status} />
                      <span className="text-[10px] font-mono">v{t.version}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-1.5 mb-4 flex-wrap">
            {REGISTRY_ENTITIES.map((r) => (
              <button key={r} onClick={() => setEntity(r)} className={tabCls(entity === r)}>{r.replace(/([A-Z])/g, " $1").trim()}</button>
            ))}
            <button onClick={() => loadEntity(entity)} className="p-2 rounded-lg border border-input hover:bg-muted" title="Reload"><RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /></button>
          </div>
          {loading ? (
            <div className="xa-card p-6 text-center text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Loading…</div>
          ) : err ? (
            <div className="xa-card p-6 text-center text-sm text-red-600">{err}</div>
          ) : records.length === 0 ? (
            <div className="xa-card xa-card-subtle p-12 text-center text-sm">No records in {entity} yet.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {records.map((r) => (
                <div key={r.id} className="xa-card p-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold truncate">{r.name || keyOf(r) || "Untitled"}</span>
                    <StatusPill status={r.status} />
                  </div>
                  <div className="text-xs font-mono text-muted-foreground truncate">{keyOf(r)}</div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {r.category && <span className="xa-pill-badge" style={{ fontSize: 9 }}>{r.category}</span>}
                    {r.version && <span className="text-[10px] font-mono text-muted-foreground">v{r.version}</span>}
                  </div>
                  {r.description && <p className="text-xs text-muted-foreground line-clamp-2">{r.description}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
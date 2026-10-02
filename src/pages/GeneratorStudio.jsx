import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Wrench, ArrowLeft, Play } from "lucide-react";
import { StatusPill } from "@/components/factory/EntityListPage.jsx";

const CATEGORIES = ["code", "ai", "business", "consulting", "marketing", "data", "infra", "design", "compound"];

function standardDag() {
  return {
    nodes: [
      { id: "validate_input", type: "validate_schema", config: { schema_ref: "input_schema" } },
      { id: "render", type: "template", config: { mode: "text", output: "body" } },
      { id: "validate_output", type: "validate_content", config: { required: ["body"] } },
      { id: "checksum", type: "checksum", config: {} },
      { id: "export", type: "export", config: {} },
    ],
    edges: [
      { from: "validate_input", to: "render" },
      { from: "render", to: "validate_output" },
      { from: "validate_output", to: "checksum" },
      { from: "checksum", to: "export" },
    ],
  };
}

export default function GeneratorStudio() {
  const [params, setParams] = useSearchParams();
  const id = params.get("id");
  const [def, setDef] = useState(null);
  const [loading, setLoading] = useState(!!id);
  const [form, setForm] = useState({ name: "", generator_key: "", category: "business", description: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try { setDef(await base44.entities.GeneratorDefinition.get(id)); }
      catch (e) { setDef(null); }
      setLoading(false);
    })();
  }, [id]);

  const create = async () => {
    if (!form.name.trim() || !form.generator_key.trim()) return;
    setSaving(true);
    try {
      const key = form.generator_key.trim().toLowerCase().replace(/\s+/g, "-");
      const rec = await base44.entities.GeneratorDefinition.create({
        generator_key: key,
        name: form.name.trim(),
        category: form.category,
        generator_type: key,
        version: "1.0.0",
        description: form.description.trim(),
        definition: {
          id: key, name: form.name.trim(), version: "1.0.0",
          input_schema: { type: "object", properties: { name: { type: "string", minLength: 1 }, context: { type: "object" } }, required: ["name"] },
          output_contract: { type: "object", required: ["body"] },
          capabilities: ["text_generation"],
          workflow_dag: standardDag(),
          templates: [], adapters: [],
          model_policy: { provider: "ai-gateway", required: false, fallback: "NOT_CONFIGURED" },
          validation_policy: { mandatory: ["schema", "completeness", "secret_scan", "artifact_integrity"] },
          repair_policy: { max_rounds: 3, target_only: true },
          security_policy: { secret_scan: true },
          approval_policy: { required: false },
          limits: { max_steps: 50, timeout_seconds: 120 },
          observability: { step_logs: true, receipts: true },
          export_policy: { formats: ["json"], immutable: true },
        },
        status: "draft",
        capabilities: ["text_generation"],
      });
      setParams({ id: rec.id });
    } catch (e) { alert("Failed: " + (e?.message || "unknown")); }
    setSaving(false);
  };

  if (id) {
    if (loading) return <div className="p-8 text-sm text-muted-foreground">Loading…</div>;
    if (!def) return <div className="p-8 text-sm text-muted-foreground">Generator not found.</div>;
    const dag = def.definition?.workflow_dag || { nodes: [], edges: [] };
    return (
      <div className="p-6 md:p-8 max-w-5xl mx-auto">
        <button onClick={() => setParams({})} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4"><ArrowLeft className="w-4 h-4" /> Back to library</button>
        <div className="flex items-center gap-3 mb-4">
          <div className="xa-icon-chip"><Wrench className="w-5 h-5" /></div>
          <div className="min-w-0">
            <h1 className="text-xl font-black font-heading">{def.name}</h1>
            <p className="text-xs text-muted-foreground font-mono">{def.generator_key} · v{def.version} · {def.category}</p>
          </div>
          <div className="ml-auto"><StatusPill status={def.status} /></div>
        </div>
        {def.description && <p className="text-sm text-muted-foreground mb-4">{def.description}</p>}

        <div className="xa-card p-5 mb-4">
          <div className="font-bold text-sm mb-3">Workflow DAG ({dag.nodes?.length || 0} nodes)</div>
          <div className="space-y-2">
            {(dag.nodes || []).map((n) => (
              <div key={n.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/40">
                <span className="w-2 h-2 rounded-full bg-[#0d2f96]" />
                <span className="font-mono text-xs font-semibold">{n.id}</span>
                <span className="text-xs text-muted-foreground">· {n.type}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="xa-card p-5">
            <div className="font-bold text-sm mb-2">Capabilities</div>
            <div className="flex flex-wrap gap-1">
              {(def.capabilities || def.definition?.capabilities || []).map((c) => <span key={c} className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{c}</span>)}
            </div>
          </div>
          <div className="xa-card p-5">
            <div className="font-bold text-sm mb-2">Validation Policy</div>
            <div className="flex flex-wrap gap-1">
              {(def.definition?.validation_policy?.mandatory || []).map((m) => <span key={m} className="text-[10px] font-mono text-[#0d2f96] bg-[#e6f0ff] px-1.5 py-0.5 rounded">{m}</span>)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <div className="xa-icon-chip"><Wrench className="w-5 h-5" /></div>
        <div>
          <h1 className="text-xl font-black font-heading">Generator Studio</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Create a new versioned generator definition with a standard DAG.</p>
        </div>
      </div>
      <div className="xa-card p-6 space-y-4">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Name</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Report Generator" className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Generator Key</label>
          <input value={form.generator_key} onChange={(e) => setForm({ ...form, generator_key: e.target.value })} placeholder="report-generator" className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring font-mono" />
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Category</label>
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring">
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Description</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What this generator produces..." rows={3} className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <button onClick={create} disabled={saving || !form.name.trim() || !form.generator_key.trim()} className="xa-btn-primary text-sm"><Play className="w-4 h-4" />{saving ? "Creating…" : "Create generator"}</button>
      </div>
    </div>
  );
}
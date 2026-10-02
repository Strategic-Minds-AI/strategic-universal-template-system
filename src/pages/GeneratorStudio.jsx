import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Wrench, ArrowLeft, Play, Brain, Loader2, Sparkles, Video } from "lucide-react";
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
  const [aiMode, setAiMode] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

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

  const createWithAI = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true); setAiError("");
    try {
      // AI generates a full generator definition from the description.
      const aiRes = await base44.functions.invoke("vercelAI", {
        prompt: `You are a generator architect for a factory platform. Based on this description, design a generator definition as JSON. Description: "${aiPrompt}". Return ONLY valid JSON with this exact shape: { "name": string, "generator_key": string (kebab-case), "category": string (one of: ${CATEGORIES.join(", ")}), "description": string, "capabilities": string[], "workflow_dag": { "nodes": [{ "id": string, "type": string (one of: transform, template, ai_generate, ai_evaluate, code_execute, test, validate_schema, validate_content, validate_security, validate_visual, adapter_read, adapter_write, approval, branch, fanout, reduce, package, checksum, export), "config": object }], "edges": [{ "from": string, "to": string }] }, "validation_policy": { "mandatory": string[] }, "model_policy": { "provider": "ai-gateway", "required": boolean } }. Design a sensible DAG with 4-8 nodes. No markdown, just the JSON object.`,
        response_json_schema: {
          type: "object",
          properties: {
            name: { type: "string" },
            generator_key: { type: "string" },
            category: { type: "string" },
            description: { type: "string" },
            capabilities: { type: "array", items: { type: "string" } },
            workflow_dag: {
              type: "object",
              properties: {
                nodes: { type: "array", items: { type: "object", properties: { id: { type: "string" }, type: { type: "string" }, config: { type: "object" } } } },
                edges: { type: "array", items: { type: "object", properties: { from: { type: "string" }, to: { type: "string" } } } },
              },
            },
            validation_policy: { type: "object", properties: { mandatory: { type: "array", items: { type: "string" } } } },
            model_policy: { type: "object", properties: { provider: { type: "string" }, required: { type: "boolean" } } },
          },
          required: ["name", "generator_key", "category", "workflow_dag"],
        },
      });
      const config = typeof aiRes?.data === "string" ? JSON.parse(aiRes.data) : aiRes?.data || aiRes;
      const key = (config.generator_key || "ai-generator").toLowerCase().replace(/\s+/g, "-");

      const rec = await base44.entities.GeneratorDefinition.create({
        generator_key: key,
        name: config.name || "AI Generated Generator",
        category: config.category || "business",
        generator_type: key,
        version: "1.0.0",
        description: config.description || aiPrompt.slice(0, 200),
        definition: {
          id: key, name: config.name || "AI Generator", version: "1.0.0",
          input_schema: { type: "object", properties: { name: { type: "string", minLength: 1 }, context: { type: "object" } }, required: ["name"] },
          output_contract: { type: "object", required: ["body"] },
          capabilities: config.capabilities || ["text_generation"],
          workflow_dag: config.workflow_dag || standardDag(),
          templates: [], adapters: [],
          model_policy: config.model_policy || { provider: "ai-gateway", required: false, fallback: "NOT_CONFIGURED" },
          validation_policy: config.validation_policy || { mandatory: ["schema", "completeness", "secret_scan", "artifact_integrity"] },
          repair_policy: { max_rounds: 3, target_only: true },
          security_policy: { secret_scan: true },
          approval_policy: { required: false },
          limits: { max_steps: 50, timeout_seconds: 120 },
          observability: { step_logs: true, receipts: true },
          export_policy: { formats: ["json"], immutable: true },
        },
        status: "draft",
        capabilities: config.capabilities || ["text_generation"],
      });
      setParams({ id: rec.id });
    } catch (e) { setAiError(e?.message || "AI generation failed"); }
    finally { setAiLoading(false); }
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
          <p className="text-sm text-muted-foreground mt-0.5">Create a new versioned generator definition — manually or with AI.</p>
        </div>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => setAiMode(false)} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${!aiMode ? "bg-foreground text-background" : "text-muted-foreground border border-border hover:bg-muted"}`}>
          <Wrench className="w-4 h-4" /> Manual
        </button>
        <button onClick={() => setAiMode(true)} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${aiMode ? "bg-foreground text-background" : "text-muted-foreground border border-border hover:bg-muted"}`}>
          <Brain className="w-4 h-4" /> AI-Powered
        </button>
      </div>

      {aiMode ? (
        <div className="xa-card p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-[#0d2f96]" />
            <span className="text-sm font-bold">Describe your generator — AI will design the full DAG</span>
          </div>
          <textarea value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} rows={4} placeholder="e.g. A generator that creates a landing page from a business description — it should research the industry, generate hero copy, create feature sections, validate accessibility, and export a complete HTML file." className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
          {aiError && <div className="text-xs text-red-600 bg-red-50 rounded-lg p-2">{aiError}</div>}
          <button onClick={createWithAI} disabled={aiLoading || !aiPrompt.trim()} className="xa-btn-primary text-sm w-full">
            {aiLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> AI designing DAG…</> : <><Brain className="w-4 h-4" /> Generate Generator with AI</>}
          </button>
        </div>
      ) : (
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
        )}
        </div>
        );
        }
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Check, Save, Loader2, KeyRound, AlertTriangle, Eye, EyeOff, Plus, X } from "lucide-react";
import { StatusPill } from "@/components/factory/EntityListPage.jsx";

// A single provider credential card — the "box" for the API.
// Non-secret config (refs, team IDs, owners) is saved to the AdapterDefinition entity.
// Secret token VALUES are entered in the boxes below and stored in config_status.secrets
// (admin-only read RLS on AdapterDefinition protects them).
export default function ProviderCredentialCard({ provider, existing, onSaved }) {
  const [config, setConfig] = useState(() => {
    const init = {};
    provider.config_fields.forEach((f) => { init[f.key] = existing?.config_status?.[f.key] ?? (f.type === "projects" ? [] : ""); });
    return init;
  });
  const [secretValues, setSecretValues] = useState(() => {
    const m = existing?.config_status?.secrets || {};
    const o = {};
    provider.secret_references.forEach((s) => { const name = typeof s === "string" ? s : s.name; o[name] = m[name] || ""; });
    return o;
  });
  const [showSecret, setShowSecret] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState(null);

  const setField = (k, v) => setConfig((c) => ({ ...c, [k]: v }));
  const setSecretValue = (s, v) => setSecretValues((m) => ({ ...m, [s]: v }));
  const toggleShow = (s) => setShowSecret((m) => ({ ...m, [s]: !m[s] }));

  const allConfigFilled = provider.config_fields.every((f) => f.required ? (config[f.key] || "").trim() : true);
  const allSecretsSet = provider.secret_references.every((s) => { const name = typeof s === "string" ? s : s.name; return (secretValues[name] || "").trim().length > 0; });
  const ready = allConfigFilled && allSecretsSet;
  const health = ready ? "healthy" : (existing ? existing.health_state : "not_configured");

  const save = async () => {
    setSaving(true); setErr(null); setSaved(false);
    try {
      const projField = provider.config_fields.find((f) => f.type === "projects");
      const cleanConfig = { ...config };
      if (projField) cleanConfig[projField.key] = (config[projField.key] || []).filter((p) => (p.ref || "").trim() || (p.name || "").trim());
      const payload = {
        adapter_key: provider.adapter_key,
        name: provider.name,
        version: provider.version || "1.0.0",
        manifest: { capabilities: provider.capabilities, config_schema: { type: "object", properties: {} } },
        enabled: ready,
        health_state: health,
        secret_references: provider.secret_references.map((s) => (typeof s === "string" ? s : s.name)),
        config_status: { ...cleanConfig, secrets: secretValues, secrets_provided: Object.fromEntries(provider.secret_references.map((s) => { const name = typeof s === "string" ? s : s.name; return [name, !!(secretValues[name] || "").trim()]; })), configured_at: new Date().toISOString() },
      };
      if (existing?.id) {
        await base44.entities.AdapterDefinition.update(existing.id, payload);
      } else {
        await base44.entities.AdapterDefinition.create(payload);
      }
      setSaved(true);
      onSaved?.(provider.adapter_key, payload);
    } catch (e) {
      setErr(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="xa-card p-4 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="xa-icon-chip shrink-0" style={{ width: 38, height: 38 }}>
            <provider.Icon className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="font-heading font-bold text-sm truncate">{provider.name}</div>
            <div className="font-mono text-[10px] text-muted-foreground truncate">{provider.adapter_key}</div>
          </div>
        </div>
        <StatusPill status={health} />
      </div>

      <p className="text-[11px] text-muted-foreground leading-snug mb-3">{provider.help}</p>

      {/* Non-secret config boxes */}
      {provider.config_fields.length > 0 && (
        <div className="space-y-2 mb-3">
          {provider.config_fields.map((f) => f.type === "projects" ? (
            <div key={f.key}>
              <label className="text-[11px] font-semibold flex items-center gap-1">{f.label}</label>
              <div className="space-y-1.5 mt-1">
                {(config[f.key] || []).map((p, i) => (
                  <div key={i} className="flex gap-1.5">
                    <input type="text" value={p.name || ""} onChange={(e) => { const arr = [...(config[f.key] || [])]; arr[i] = { ...arr[i], name: e.target.value }; setField(f.key, arr); }} placeholder="Project name" className="flex-1 h-9 px-2.5 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
                    <input type="text" value={p.ref || ""} onChange={(e) => { const arr = [...(config[f.key] || [])]; arr[i] = { ...arr[i], ref: e.target.value }; setField(f.key, arr); }} placeholder="Project ref" className="flex-1 h-9 px-2.5 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring font-mono" />
                    <button type="button" onClick={() => { const arr = (config[f.key] || []).filter((_, j) => j !== i); setField(f.key, arr); }} className="h-9 px-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted"><X className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
                <button type="button" onClick={() => setField(f.key, [...(config[f.key] || []), { name: "", ref: "" }])} className="text-[11px] font-semibold text-[#CCBB00] inline-flex items-center gap-1 hover:underline"><Plus className="w-3 h-3" /> Add project</button>
              </div>
            </div>
          ) : (
            <div key={f.key}>
              <label className="text-[11px] font-semibold flex items-center gap-1">
                {f.label}{f.required && <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                value={config[f.key]}
                onChange={(e) => setField(f.key, e.target.value)}
                placeholder={f.placeholder}
                className="w-full mt-1 h-9 px-3 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          ))}
        </div>
      )}

      {/* Secret token boxes — values stored in config_status.secrets (admin-only read) */}
      <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-2.5 mb-3">
        <div className="flex items-center gap-1.5 mb-1.5">
          <KeyRound className="w-3 h-3 text-amber-600" />
          <span className="text-[10px] font-bold uppercase tracking-wide text-amber-700">API tokens · stored in app DB (admin-only)</span>
        </div>
        <div className="space-y-2">
          {provider.secret_references.map((s) => {
            const name = typeof s === "string" ? s : s.name;
            const multiline = typeof s === "object" && s.multiline;
            const val = secretValues[name] || "";
            if (multiline) {
              return (
                <div key={name}>
                  <label className="text-[10px] font-mono text-muted-foreground">{s.label || name}</label>
                  <textarea
                    value={val}
                    onChange={(e) => setSecretValue(name, e.target.value)}
                    placeholder={`Paste ${s.label || name} (PEM)…`}
                    rows={5}
                    autoComplete="off"
                    className="w-full mt-0.5 p-2 text-[11px] rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring font-mono resize-y"
                  />
                </div>
              );
            }
            return (
              <div key={name}>
                <label className="text-[10px] font-mono text-muted-foreground">{name}</label>
                <div className="relative">
                  <input
                    type={showSecret[name] ? "text" : "password"}
                    value={val}
                    onChange={(e) => setSecretValue(name, e.target.value)}
                    placeholder={`Paste ${name}…`}
                    autoComplete="off"
                    className="w-full mt-0.5 h-9 pl-3 pr-9 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring font-mono"
                  />
                  <button type="button" onClick={() => toggleShow(name)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showSecret[name] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {err && <div className="text-[11px] text-red-600 mb-2">{err}</div>}

      <button onClick={save} disabled={saving} className="xa-btn-primary text-xs w-full" style={{ padding: "9px 12px" }}>
        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : (saved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />)}
        {saving ? "Saving…" : saved ? "Saved" : "Save configuration"}
      </button>

      {!ready && !saving && (
        <div className="flex items-start gap-1.5 mt-2 text-[10px] text-muted-foreground leading-snug">
          <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
          <span>{!allConfigFilled ? "Fill required config. " : ""}{!allSecretsSet ? "Paste each API token into its box. " : ""}Adapter stays NOT_CONFIGURED until ready.</span>
        </div>
      )}
    </div>
  );
}
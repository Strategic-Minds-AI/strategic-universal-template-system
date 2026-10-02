import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Check, Save, Loader2, ExternalLink, KeyRound, AlertTriangle } from "lucide-react";
import { StatusPill } from "@/components/factory/EntityListPage.jsx";

// A single provider credential card — the "box" for the API.
// Non-secret config (refs, team IDs, owners) is saved to the AdapterDefinition entity.
// Secret VALUES are declared via set_secrets and entered in the dashboard Secrets page.
export default function ProviderCredentialCard({ provider, existing, onSaved }) {
  const [config, setConfig] = useState(() => {
    const init = {};
    provider.config_fields.forEach((f) => { init[f.key] = existing?.config_status?.[f.key] ?? ""; });
    return init;
  });
  const [secretSet, setSecretSet] = useState(() => {
    const m = existing?.config_status?.secrets_provided || {};
    const o = {};
    provider.secret_references.forEach((s) => { o[s] = !!m[s]; });
    return o;
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState(null);

  const setField = (k, v) => setConfig((c) => ({ ...c, [k]: v }));
  const toggleSecret = (s) => setSecretSet((m) => ({ ...m, [s]: !m[s] }));

  const allConfigFilled = provider.config_fields.every((f) => f.required ? (config[f.key] || "").trim() : true);
  const allSecretsSet = provider.secret_references.every((s) => secretSet[s]);
  const ready = allConfigFilled && allSecretsSet;
  const health = ready ? "healthy" : (existing ? existing.health_state : "not_configured");

  const save = async () => {
    setSaving(true); setErr(null); setSaved(false);
    try {
      const payload = {
        adapter_key: provider.adapter_key,
        name: provider.name,
        version: provider.version || "1.0.0",
        manifest: { capabilities: provider.capabilities, config_schema: { type: "object", properties: {} } },
        enabled: ready,
        health_state: health,
        secret_references: provider.secret_references,
        config_status: { ...config, secrets_provided: secretSet, configured_at: new Date().toISOString() },
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
          {provider.config_fields.map((f) => (
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

      {/* Secret references — values set in dashboard */}
      <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-2.5 mb-3">
        <div className="flex items-center gap-1.5 mb-1.5">
          <KeyRound className="w-3 h-3 text-amber-600" />
          <span className="text-[10px] font-bold uppercase tracking-wide text-amber-700">Required secrets</span>
        </div>
        {provider.secret_references.map((s) => (
          <label key={s} className="flex items-center gap-2 py-1 cursor-pointer">
            <input type="checkbox" checked={!!secretSet[s]} onChange={() => toggleSecret(s)} className="w-3.5 h-3.5 rounded border-input accent-[#CCBB00]" />
            <span className="font-mono text-[11px] text-foreground flex-1">{s}</span>
            <a href="#" onClick={(e) => { e.preventDefault(); window.open("/dashboard/secrets", "_blank"); }} className="text-[10px] text-[#CCBB00] font-semibold inline-flex items-center gap-0.5 hover:underline">
              Set <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </label>
        ))}
      </div>

      {err && <div className="text-[11px] text-red-600 mb-2">{err}</div>}

      <button onClick={save} disabled={saving} className="xa-btn-primary text-xs w-full" style={{ padding: "9px 12px" }}>
        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : (saved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />)}
        {saving ? "Saving…" : saved ? "Saved" : "Save configuration"}
      </button>

      {!ready && !saving && (
        <div className="flex items-start gap-1.5 mt-2 text-[10px] text-muted-foreground leading-snug">
          <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
          <span>{!allConfigFilled ? "Fill required config. " : ""}{!allSecretsSet ? "Mark secrets as set after entering them in the Secrets dashboard. " : ""}Adapter stays NOT_CONFIGURED until ready.</span>
        </div>
      )}
    </div>
  );
}
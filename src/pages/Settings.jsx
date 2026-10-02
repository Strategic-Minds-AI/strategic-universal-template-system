import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Settings as SettingsIcon, Plus } from "lucide-react";
import { StatusPill } from "@/components/factory/EntityListPage.jsx";
import { REGISTRY_VERSION, TOTAL_ENTRIES } from "@/lib/factory/registry/index.js";
import { counts } from "@/lib/factory/generator/registry";

export default function Settings() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const page = await base44.entities.Tenant.filter({}, { sort: "-created_date", limit: 50 });
      setTenants(page.items || []);
    } catch (e) { /* empty */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // Real-time: reload tenants on change.
  useEffect(() => {
    let unsub;
    try { unsub = base44.entities.Tenant?.subscribe?.(() => load()); } catch { /* */ }
    return () => { try { unsub?.(); } catch {} };
  }, []);

  const createTenant = async () => {
    if (!name.trim()) return;
    try {
      await base44.entities.Tenant.create({ name: name.trim(), slug: name.trim().toLowerCase().replace(/\s+/g, "-"), plan: "sandbox", status: "active" });
      setName("");
      await load();
    } catch (e) { alert("Failed: " + (e?.message || "unknown")); }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <div className="xa-icon-chip"><SettingsIcon className="w-5 h-5" /></div>
        <div>
          <h1 className="text-xl font-black font-heading">Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Factory runtime configuration, registry version, and tenant management.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        <div className="xa-card p-5">
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Registry Version</div>
          <div className="text-2xl font-black font-heading mt-1">v{REGISTRY_VERSION}</div>
          <div className="text-xs text-muted-foreground mt-1">{TOTAL_ENTRIES} pattern entries</div>
        </div>
        <div className="xa-card p-5">
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Generator Definitions</div>
          <div className="text-2xl font-black font-heading mt-1">{counts.generator_types + counts.ai_consulting_templates + counts.provisioning_templates}</div>
          <div className="text-xs text-muted-foreground mt-1">{counts.generator_types} generators · {counts.ai_consulting_templates} consulting · {counts.provisioning_templates} provisioning</div>
        </div>
        <div className="xa-card p-5">
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Runtime Mode</div>
          <div className="text-2xl font-black font-heading mt-1">Sandbox</div>
          <div className="text-xs text-muted-foreground mt-1">Protected actions require operator approval</div>
        </div>
      </div>

      <div className="xa-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="font-bold text-sm">Tenants</div>
          <div className="flex gap-2">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="New tenant name..." className="px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring w-48" />
            <button onClick={createTenant} className="xa-btn-primary text-xs" style={{ padding: "8px 12px" }}><Plus className="w-3.5 h-3.5" />Create</button>
          </div>
        </div>
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : tenants.length === 0 ? (
          <div className="text-sm text-muted-foreground py-6 text-center">No tenants yet. Create one to scope projects and entitlements.</div>
        ) : (
          <div className="space-y-2">
            {tenants.map((t) => (
              <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/40">
                <div>
                  <div className="text-sm font-semibold">{t.name}</div>
                  <div className="text-xs text-muted-foreground font-mono">{t.slug}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-muted capitalize">{t.plan}</span>
                  <StatusPill status={t.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
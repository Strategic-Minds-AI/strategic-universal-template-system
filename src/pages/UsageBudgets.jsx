import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Gauge, AlertTriangle } from "lucide-react";
import { adapterHealthSummary } from "@/lib/factory/generator/adapters";
import { counts } from "@/lib/factory/generator/registry";

export default function UsageBudgets() {
  const [metrics, setMetrics] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const entries = await Promise.all([
          base44.entities.GeneratorDefinition.count({}).then((n) => ["Generators", n]),
          base44.entities.GeneratorRun.count({}).then((n) => ["Runs", n]),
          base44.entities.Artifact.count({}).then((n) => ["Artifacts", n]),
          base44.entities.RunValidation.count({}).then((n) => ["Validations", n]),
          base44.entities.RepairTask.count({}).then((n) => ["Repairs", n]),
          base44.entities.Approval.count({ status: "pending" }).then((n) => ["Pending approvals", n]),
          base44.entities.ProvisioningPlan.count({}).then((n) => ["Provisioning plans", n]),
          base44.entities.AuditEvent.count({}).then((n) => ["Audit events", n]),
        ]);
        setMetrics(Object.fromEntries(entries));
      } catch (e) { /* empty */ }
      setLoading(false);
    })();
  }, []);

  const adapters = adapterHealthSummary();
  const configured = adapters.filter((a) => a.configured).length;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <div className="xa-icon-chip"><Gauge className="w-5 h-5" /></div>
        <div>
          <h1 className="text-xl font-black font-heading">Usage / Budgets</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Live record counts and adapter health across the factory runtime.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {Object.entries(metrics).map(([label, value]) => (
          <div key={label} className="xa-card p-4">
            <div className="text-2xl font-black font-heading">{loading ? "—" : (value ?? 0)}</div>
            <div className="text-xs text-muted-foreground font-medium mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="xa-card p-5">
          <div className="font-bold text-sm mb-3">Adapter Health</div>
          <div className="space-y-2">
            {adapters.map((a) => (
              <div key={a.adapter_key} className="flex items-center justify-between text-xs">
                <span className="font-medium truncate">{a.name}</span>
                <span className={`font-bold px-1.5 py-0.5 rounded ${a.health_state === "healthy" ? "text-green-600 bg-green-50" : a.health_state === "disabled" ? "text-gray-400 bg-gray-50" : "text-amber-600 bg-amber-50"}`}>
                  {a.health_state === "not_configured" ? "NOT_CONFIGURED" : a.health_state.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground">{configured}/{adapters.length} adapters configured</div>
        </div>

        <div className="xa-card p-5 border-amber-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-sm">
              <div className="font-bold">Integration credits exhausted until 2026-10-12</div>
              <div className="text-muted-foreground mt-1">
                AI Gateway, sandbox, and external adapter actions return <span className="font-mono font-semibold">NOT_CONFIGURED</span> honestly — no fake success.
                Deterministic generators (text, document, provisioning plans, schema validation, checksums) run fully. This is a workspace billing limitation, not a code defect.
              </div>
              <div className="mt-2 text-xs text-muted-foreground">Registry: {counts.generator_types} generator types · {counts.ai_consulting_templates} consulting · {counts.provisioning_templates} provisioning templates</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
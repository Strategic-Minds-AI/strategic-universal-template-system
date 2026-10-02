import React from "react";
import { Plug } from "lucide-react";
import { ADAPTERS } from "@/lib/factory/generator/adapters";
import { StatusPill } from "@/components/factory/EntityListPage.jsx";

export default function AdapterLibrary() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <div className="xa-icon-chip"><Plug className="w-5 h-5" /></div>
        <div>
          <h1 className="text-xl font-black font-heading">Adapter Library</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Integration adapters with explicit health and required configuration. Unconfigured adapters return NOT_CONFIGURED — never fake success.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {ADAPTERS.map((a) => (
          <div key={a.adapter_key} className="xa-card p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="font-heading font-bold text-sm">{a.name}</div>
              <StatusPill status={a.health_state} />
            </div>
            <div className="font-mono text-xs text-muted-foreground mb-2">{a.adapter_key}</div>
            <div className="flex flex-wrap gap-1 mb-2">
              {a.capabilities.map((c) => (
                <span key={c} className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{c}</span>
              ))}
            </div>
            <div className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{a.actions.length}</span> actions · <span className="font-semibold text-amber-600">{a.actions.filter((x) => x.risk_class === "PROTECTED").length}</span> protected
            </div>
            {a.secret_references.length > 0 && (
              <div className="mt-2 pt-2 border-t border-border">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Required secrets</div>
                <div className="flex flex-wrap gap-1">
                  {a.secret_references.map((s) => (
                    <span key={s} className="text-[10px] font-mono text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
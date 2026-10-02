import React from "react";
import { CheckCircle2, XCircle, AlertTriangle, ShieldAlert, ChevronUp, ChevronDown } from "lucide-react";

export default function ValidationDrawer({ validation, open, setOpen }) {
  if (!validation) {
    return (
      <div className={`shrink-0 border-t border-border bg-background transition-all ${open ? "h-48" : "h-10"}`}>
        <button onClick={() => setOpen(!open)} className="w-full h-10 flex items-center justify-between px-4">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Validation</span>
          {open ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
        {open && (
          <div className="p-4 text-xs text-muted-foreground">Run validation to see results. No PASS without evidence.</div>
        )}
      </div>
    );
  }

  const gates = validation.hard_gates || {};
  const gateEntries = Object.entries(gates);
  const passCount = gateEntries.filter(([, g]) => g.result === "PASS").length;
  const failCount = gateEntries.filter(([, g]) => g.result === "FAIL").length;
  const deltas = validation.deltas || [];

  return (
    <div className={`shrink-0 border-t border-border bg-background transition-all ${open ? "h-56" : "h-10"}`}>
      <button onClick={() => setOpen(!open)} className="w-full h-10 flex items-center justify-between px-4 hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-2">
          {validation.result === "PASS" ? (
            <CheckCircle2 className="w-4 h-4 text-[#0d2f96]" />
          ) : validation.result === "BLOCKED" ? (
            <ShieldAlert className="w-4 h-4 text-red-600" />
          ) : (
            <XCircle className="w-4 h-4 text-red-600" />
          )}
          <span className="text-xs font-bold uppercase tracking-wider text-foreground">
            Validation · {validation.result}
          </span>
          <span className="text-[10px] font-semibold text-muted-foreground">
            {passCount} pass · {failCount} fail · round {validation.repair_round}
          </span>
        </div>
        {open ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
      </button>

      {open && (
        <div className="h-[calc(100%-2.5rem)] overflow-y-auto xa-scroll px-4 pb-4 grid grid-cols-3 gap-4">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Hard Gates</div>
            <div className="space-y-1.5">
              {gateEntries.map(([name, g]) => (
                <div key={name} className="flex items-start gap-1.5 text-xs">
                  {g.result === "PASS" ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0d2f96] mt-0.5 shrink-0" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-red-600 mt-0.5 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <div className="font-mono font-semibold text-foreground truncate">{name}</div>
                    <div className="text-[10px] text-muted-foreground">{g.evidence}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Repair Deltas</div>
            {deltas.length === 0 ? (
              <div className="text-xs text-muted-foreground">No deltas — all gates passed.</div>
            ) : (
              <div className="space-y-1.5">
                {deltas.map((d, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-xs">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <span className="font-mono font-semibold text-foreground">{d.gate}</span>
                      {d.screen && <span className="text-muted-foreground"> · {d.screen}</span>}
                      <div className="text-[10px] text-muted-foreground">{d.fix}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Evidence</div>
            <div className="space-y-1">
              {(validation.evidence || []).map((e, i) => (
                <div key={i} className="text-[10px] font-mono text-muted-foreground bg-muted/50 rounded px-2 py-1">{e}</div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
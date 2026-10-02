import React from "react";
import RenderFrame from "./RenderFrame";
import { ShieldCheck, Wrench, CheckCircle2, XCircle, AlertTriangle, ArrowRight } from "lucide-react";

/**
 * Visual mockup of the Quality section — validation receipts + repair tasks.
 * Shows what a user sees: validation layers with pass/fail and a repair queue.
 */
export default function QualityRender({ height = 320 }) {
  const layers = [
    { name: "schema", s: "PASS" },
    { name: "completeness", s: "PASS" },
    { name: "lint", s: "PASS" },
    { name: "typecheck", s: "FAIL" },
    { name: "security", s: "PASS" },
    { name: "artifact_integrity", s: "BLOCKED" },
  ];
  const repairs = [
    { step: "render", layer: "typecheck", attempt: 1, status: "in_progress" },
    { step: "ai_generate", layer: "lint", attempt: 2, status: "open" },
  ];
  const sCls = (s) => s === "PASS" ? "text-green-600 bg-green-50" : s === "FAIL" ? "text-red-600 bg-red-50" : "text-amber-600 bg-amber-50";
  const sIcon = (s) => s === "PASS" ? <CheckCircle2 className="w-3 h-3 text-green-500" /> : s === "FAIL" ? <XCircle className="w-3 h-3 text-red-500" /> : <AlertTriangle className="w-3 h-3 text-amber-500" />;
  return (
    <RenderFrame label="factory / quality" height={height}>
      <div className="flex h-full">
        {/* Validation center */}
        <div className="w-1/2 p-3 border-r border-border overflow-hidden">
          <div className="flex items-center gap-1.5 mb-2">
            <ShieldCheck className="w-3 h-3 text-[#0d2f96]" />
            <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Validation Receipts</span>
            <span className="ml-auto text-[8px] font-mono text-muted-foreground">4/6 pass</span>
          </div>
          <div className="space-y-1">
            {layers.map((l) => (
              <div key={l.name} className="flex items-center gap-1.5 rounded-md bg-muted/40 px-1.5 py-1">
                {sIcon(l.s)}
                <span className="text-[9px] font-mono font-semibold flex-1">{l.name}</span>
                <span className={`text-[8px] font-bold px-1 py-0.5 rounded ${sCls(l.s)}`}>{l.s}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Repair center */}
        <div className="w-1/2 p-3 overflow-hidden">
          <div className="flex items-center gap-1.5 mb-2">
            <Wrench className="w-3 h-3 text-[#0d2f96]" />
            <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Repair Queue</span>
            <span className="ml-auto text-[8px] font-bold px-1.5 py-0.5 rounded-full text-amber-600 bg-amber-50">2 OPEN</span>
          </div>
          <div className="space-y-1.5">
            {repairs.map((r) => (
              <div key={r.step + r.layer} className="rounded-md border border-amber-200 bg-amber-50/40 p-1.5">
                <div className="flex items-center gap-1 mb-0.5">
                  <span className="text-[9px] font-mono font-bold">{r.step}</span>
                  <ArrowRight className="w-2 h-2 text-muted-foreground" />
                  <span className="text-[9px] font-mono text-red-600">{r.layer}</span>
                  <span className="ml-auto text-[8px] text-muted-foreground">attempt {r.attempt}/3</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className={`text-[8px] font-bold px-1 py-0.5 rounded ${r.status === "in_progress" ? "text-[#0059ff] bg-blue-50" : "text-amber-600 bg-amber-50"}`}>{r.status}</span>
                  <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-[#0059ff]" style={{ width: `${r.attempt * 33}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2 text-[8px] text-muted-foreground italic">Auto-repair targets failing layer only · max 3 rounds</div>
        </div>
      </div>
    </RenderFrame>
  );
}
import React from "react";
import RenderFrame from "./RenderFrame";
import { Server, CheckSquare, Activity, Gauge, Settings, ArrowRight, CheckCircle2, Clock } from "lucide-react";

/**
 * Visual mockup of the Operations section — provisioning, approvals, audit, usage.
 * Shows what a user sees: a provisioning plan with approval gates and audit trail.
 */
export default function OperationsRender({ height = 320 }) {
  const planSteps = [
    { label: "Dry-run diff", s: "done" },
    { label: "Awaiting approval", s: "current" },
    { label: "Execute actions", s: "pending" },
    { label: "Verify & rollback-ready", s: "pending" },
  ];
  const audit = [
    { evt: "plan.created", sev: "info" },
    { evt: "approval.requested", sev: "warn" },
    { evt: "adapter.healthy", sev: "info" },
  ];
  const sIcon = (s) => s === "done" ? <CheckCircle2 className="w-3 h-3 text-green-500" /> : s === "current" ? <Clock className="w-3 h-3 text-[#0059ff] animate-pulse" /> : <div className="w-3 h-3 rounded-full border-2 border-muted" />;
  return (
    <RenderFrame label="factory / operations" height={height}>
      <div className="flex h-full">
        {/* Provisioning plan */}
        <div className="w-2/5 p-3 border-r border-border overflow-hidden">
          <div className="flex items-center gap-1.5 mb-2">
            <Server className="w-3 h-3 text-[#0d2f96]" />
            <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Provisioning Plan</span>
          </div>
          <div className="space-y-1.5">
            {planSteps.map((s, i) => (
              <div key={s.label} className="flex items-center gap-1.5">
                {sIcon(s.s)}
                <span className={`text-[9px] font-semibold ${s.s === "current" ? "text-[#0059ff]" : s.s === "done" ? "text-green-600" : "text-muted-foreground"}`}>{s.label}</span>
                {i < planSteps.length - 1 && <ArrowRight className="w-2 h-2 text-muted-foreground/40 ml-auto" />}
              </div>
            ))}
          </div>
          <div className="mt-2 rounded-md bg-muted/40 p-1.5">
            <div className="text-[8px] font-mono text-muted-foreground">rollback: ready</div>
            <div className="text-[8px] font-mono text-muted-foreground">dry_run: true</div>
          </div>
        </div>
        {/* Approvals */}
        <div className="w-1/3 p-3 border-r border-border overflow-hidden">
          <div className="flex items-center gap-1.5 mb-2">
            <CheckSquare className="w-3 h-3 text-[#0d2f96]" />
            <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Approvals</span>
          </div>
          <div className="space-y-1">
            <div className="rounded-md border border-amber-200 bg-amber-50/40 p-1.5">
              <div className="text-[9px] font-bold">BRANCH_WRITE</div>
              <div className="text-[8px] text-muted-foreground">deploy to prod</div>
              <div className="mt-1 flex gap-1">
                <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-green-500 text-white">✓</span>
                <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-red-500 text-white">✗</span>
              </div>
            </div>
            <div className="rounded-md border border-border bg-muted/30 p-1.5">
              <div className="text-[9px] font-bold">READ</div>
              <div className="text-[8px] text-muted-foreground">auto-approved</div>
            </div>
          </div>
        </div>
        {/* Audit + usage */}
        <div className="w-1/4 p-3 overflow-hidden flex flex-col">
          <div className="flex items-center gap-1.5 mb-2">
            <Activity className="w-3 h-3 text-[#0d2f96]" />
            <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Audit</span>
          </div>
          <div className="space-y-0.5 flex-1">
            {audit.map((a) => (
              <div key={a.evt} className="flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${a.sev === "warn" ? "bg-amber-500" : "bg-green-500"}`} />
                <span className="text-[8px] font-mono truncate">{a.evt}</span>
              </div>
            ))}
          </div>
          <div className="mt-1.5 flex items-center gap-1 pt-1.5 border-t border-border">
            <Gauge className="w-2.5 h-2.5 text-[#0d2f96]" />
            <span className="text-[8px] font-mono text-muted-foreground">credits: 1.2k</span>
          </div>
        </div>
      </div>
    </RenderFrame>
  );
}
import React from "react";
import { ShieldCheck } from "lucide-react";

// Ceiling composite health score: 0-100 combining adapter health, run success
// rate, and validation pass rate into a single at-a-glance system health metric.
export default function SystemHealthScore({ adapters, throughput, validationTrend }) {
  const configured = adapters.filter((a) => a.configured).length;
  const adapterScore = Math.round((configured / Math.max(adapters.length, 1)) * 100);

  const totalRuns = throughput.reduce((s, t) => s + t.total, 0);
  const passedRuns = throughput.reduce((s, t) => s + t.passed, 0);
  const runScore = totalRuns > 0 ? Math.round((passedRuns / totalRuns) * 100) : 100;

  const totalVals = validationTrend.reduce((s, v) => s + v.pass + v.fail + v.blocked, 0);
  const passedVals = validationTrend.reduce((s, v) => s + v.pass, 0);
  const valScore = totalVals > 0 ? Math.round((passedVals / Math.max(totalVals, 1)) * 100) : 100;

  const composite = Math.round((adapterScore * 0.3 + runScore * 0.35 + valScore * 0.35));
  const color = composite >= 80 ? "#16a34a" : composite >= 50 ? "#f59e0b" : "#dc2626";
  const label = composite >= 80 ? "Healthy" : composite >= 50 ? "Degraded" : "Critical";

  return (
    <div className="xa-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <ShieldCheck className="w-4 h-4 text-[#0d2f96]" />
        <h2 className="text-sm font-bold uppercase tracking-wide">System Health</h2>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative w-20 h-20 shrink-0">
          <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="34" fill="none" stroke="#e2e8f0" strokeWidth="6" />
            <circle cx="40" cy="40" r="34" fill="none" stroke={color} strokeWidth="6"
              strokeDasharray={`${(composite / 100) * 213.6} 213.6`} strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-black font-heading" style={{ color }}>{composite}</span>
          </div>
        </div>
        <div className="flex-1 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Adapters</span>
            <span className="font-bold" style={{ color: adapterScore >= 50 ? "#16a34a" : "#f59e0b" }}>{adapterScore}%</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Run Success</span>
            <span className="font-bold" style={{ color: runScore >= 50 ? "#16a34a" : "#f59e0b" }}>{runScore}%</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Validation</span>
            <span className="font-bold" style={{ color: valScore >= 50 ? "#16a34a" : "#f59e0b" }}>{valScore}%</span>
          </div>
          <div className="flex items-center justify-between text-xs pt-1 border-t border-border">
            <span className="font-bold">{label}</span>
            <span className="text-[10px] text-muted-foreground">composite</span>
          </div>
        </div>
      </div>
    </div>
  );
}
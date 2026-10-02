import React from "react";
import RenderFrame from "./RenderFrame";
import { Terminal, Package, Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";

/**
 * Visual mockup of the Execution section — run console timeline + artifact explorer.
 * Shows what a user sees: a live run with step statuses and generated artifacts.
 */
export default function ExecutionRender({ height = 320 }) {
  const steps = [
    { id: "validate_input", s: "passed", t: "0.2s" },
    { id: "render", s: "passed", t: "1.1s" },
    { id: "ai_generate", s: "running", t: "…" },
    { id: "validate_output", s: "pending", t: "—" },
    { id: "checksum", s: "pending", t: "—" },
  ];
  const artifacts = [
    { name: "index.html", size: "12.4 KB", valid: true },
    { name: "styles.css", size: "3.2 KB", valid: true },
    { name: "meta.json", size: "0.8 KB", valid: true },
  ];
  const icon = (s) => s === "passed" ? <CheckCircle2 className="w-3 h-3 text-green-500" /> : s === "running" ? <Loader2 className="w-3 h-3 text-[#0059ff] animate-spin" /> : s === "pending" ? <Clock className="w-3 h-3 text-muted-foreground/40" /> : <XCircle className="w-3 h-3 text-red-500" />;
  return (
    <RenderFrame label="factory / execution" height={height}>
      <div className="flex h-full">
        {/* Run console */}
        <div className="w-1/2 p-3 border-r border-border overflow-hidden">
          <div className="flex items-center gap-1.5 mb-2">
            <Terminal className="w-3 h-3 text-[#0d2f96]" />
            <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Run · seo-report v2.0</span>
            <span className="ml-auto text-[8px] font-bold px-1.5 py-0.5 rounded-full text-[#0059ff] bg-blue-50">RUNNING</span>
          </div>
          <div className="space-y-1">
            {steps.map((s) => (
              <div key={s.id} className="flex items-center gap-1.5 rounded-md bg-muted/40 px-1.5 py-1">
                {icon(s.s)}
                <span className="text-[9px] font-mono font-semibold flex-1">{s.id}</span>
                <span className="text-[8px] text-muted-foreground font-mono">{s.t}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Artifact explorer */}
        <div className="w-1/2 p-3 overflow-hidden">
          <div className="flex items-center gap-1.5 mb-2">
            <Package className="w-3 h-3 text-[#0d2f96]" />
            <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Artifacts</span>
            <span className="ml-auto text-[8px] font-mono text-muted-foreground">3 files</span>
          </div>
          <div className="space-y-1">
            {artifacts.map((a) => (
              <div key={a.name} className="flex items-center gap-1.5 rounded-md border border-border px-1.5 py-1">
                <div className="w-5 h-6 rounded-sm bg-gradient-to-br from-muted to-muted/50 border border-border flex items-center justify-center">
                  <span className="text-[7px] font-bold text-muted-foreground">{a.name.split(".").pop()}</span>
                </div>
                <span className="text-[9px] font-mono font-semibold flex-1 truncate">{a.name}</span>
                <span className="text-[8px] text-muted-foreground">{a.size}</span>
                <CheckCircle2 className="w-2.5 h-2.5 text-green-500" />
              </div>
            ))}
          </div>
          <div className="mt-2 rounded-md bg-muted/30 p-1.5">
            <div className="text-[8px] font-mono text-muted-foreground">sha256: a3f2…b91e</div>
            <div className="text-[8px] font-mono text-muted-foreground">packet: ready</div>
          </div>
        </div>
      </div>
    </RenderFrame>
  );
}
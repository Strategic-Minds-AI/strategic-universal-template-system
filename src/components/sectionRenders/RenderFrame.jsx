import React from "react";

/**
 * Shared frame wrapper — renders children inside a stylized app window
 * with a title bar, used to present section visual mockups.
 */
export default function RenderFrame({ label, accent = "#0d2f96", children, height = 320 }) {
  return (
    <div className="rounded-xl border border-border overflow-hidden shadow-sm bg-white">
      <div className="flex items-center gap-1.5 px-3 py-2 bg-muted/60 border-b border-border">
        <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
        <span className="ml-2 text-[10px] font-mono font-semibold text-muted-foreground truncate">{label}</span>
        <span className="ml-auto w-2 h-2 rounded-full" style={{ background: accent }} />
      </div>
      <div style={{ height }} className="overflow-hidden bg-gradient-to-br from-white to-muted/30">
        {children}
      </div>
    </div>
  );
}
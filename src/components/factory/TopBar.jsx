import React from "react";
import { Sparkles, Eye, CheckCircle2, Download, Undo2, Redo2, ChevronDown } from "lucide-react";
import BrandLogo from "./BrandLogo.jsx";

const VIEWPORTS = [
  { id: "mobile-sm", label: "390", width: 390 },
  { id: "mobile-lg", label: "428", width: 428 },
  { id: "tablet", label: "768", width: 768 },
  { id: "laptop", label: "1280", width: 1280 },
  { id: "desktop", label: "1440", width: 1440 },
  { id: "wide", label: "1920", width: 1920 },
];

export default function TopBar({ project, viewport, setViewport, theme, setTheme, onValidate, onExport, validation }) {
  return (
    <header className="h-14 shrink-0 border-b border-border bg-background flex items-center justify-between px-4 gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <BrandLogo size={28} />
        <div className="hidden md:flex items-center gap-1.5 pl-3 border-l border-border">
          <span className="text-xs font-medium text-muted-foreground">Project</span>
          <button className="flex items-center gap-1 text-sm font-semibold text-foreground hover:text-[#CCBB00] transition-colors">
            <span className="truncate max-w-[160px]">{project?.name || "Untitled"}</span>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          <span className="xa-pill-badge ml-2" style={{ fontSize: 9, padding: "2px 8px" }}>
            {project?.mode || "guided"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        {VIEWPORTS.map((v) => (
          <button
            key={v.id}
            onClick={() => setViewport(v)}
            className={`px-2.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              viewport?.id === v.id
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-1.5">
        <div className="hidden lg:flex items-center gap-1 mr-1">
          {["light", "dark", "hc-light", "hc-dark"].map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`px-2 py-1 rounded-full text-[10px] font-semibold uppercase transition-all ${
                theme === t ? "bg-[#FFEA00] text-black" : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {t.replace("hc-", "HC ")}
            </button>
          ))}
        </div>
        <button className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" title="Undo">
          <Undo2 className="w-4 h-4" />
        </button>
        <button className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" title="Redo">
          <Redo2 className="w-4 h-4" />
        </button>
        <button
          onClick={onValidate}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-border hover:border-[#FFEA00] hover:shadow-[0_0_14px_-3px_rgba(255,234,0,0.5)] transition-all"
        >
          {validation?.result === "PASS" ? (
            <CheckCircle2 className="w-4 h-4 text-[#CCBB00]" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
          Validate
        </button>
        <button onClick={onExport} className="xa-btn-primary text-xs" style={{ padding: "8px 14px" }}>
          <Download className="w-3.5 h-3.5" />
          Export
        </button>
      </div>
    </header>
  );
}
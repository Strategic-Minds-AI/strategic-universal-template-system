import React from "react";
import { Palette, RotateCcw, Sun, Moon } from "lucide-react";
import { PRESETS } from "@/lib/gallery/studioConfig.js";

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

const inputCls = "h-9 px-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring";

export default function StudioPanel({ config, onChange, onReset }) {
  const set = (patch) => onChange({ ...config, ...patch });
  return (
    <div className="xa-card p-4 mb-5">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="xa-icon-chip" style={{ width: 32, height: 32 }}><Palette className="w-4 h-4" /></div>
          <div>
            <div className="text-sm font-bold font-heading flex items-center gap-2">Template Studio <span className="xa-pill-badge" style={{ fontSize: 9 }}>Universal</span></div>
            <div className="text-[11px] text-muted-foreground">Recolor, rebrand, and recontent every template — live.</div>
          </div>
        </div>
        <button onClick={onReset} className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground">
          <RotateCcw className="w-3.5 h-3.5" />Reset to brand
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Field label="Primary color">
          <input type="color" value={config.primaryColor} onChange={(e) => set({ primaryColor: e.target.value })} className="w-full h-9 rounded-lg border border-input cursor-pointer bg-background" />
        </Field>
        <Field label="Accent color">
          <input type="color" value={config.secondaryColor} onChange={(e) => set({ secondaryColor: e.target.value })} className="w-full h-9 rounded-lg border border-input cursor-pointer bg-background" />
        </Field>
        <Field label="Logo text"><input value={config.logoText} onChange={(e) => set({ logoText: e.target.value })} className={inputCls} /></Field>
        <Field label="Heading"><input value={config.heading} onChange={(e) => set({ heading: e.target.value })} className={inputCls} /></Field>
        <Field label="Subtitle"><input value={config.subtitle} onChange={(e) => set({ subtitle: e.target.value })} className={inputCls} /></Field>
        <Field label="Sample brand"><input value={config.brandName} onChange={(e) => set({ brandName: e.target.value })} className={inputCls} /></Field>
      </div>

      <div className="flex items-center gap-2 mt-3 flex-wrap">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mr-1">Presets</span>
        {PRESETS.map((p) => (
          <button
            key={p.name}
            onClick={() => set({ primaryColor: p.primary, secondaryColor: p.secondary })}
            className="inline-flex items-center gap-1.5 pl-2 pr-2.5 py-1.5 rounded-lg border border-input hover:border-[#0059ff] text-xs font-semibold transition-colors"
            title={p.name}
          >
            <span className="flex">
              <span className="w-3.5 h-3.5 rounded-full" style={{ background: p.primary }} />
              <span className="w-2.5 h-2.5 rounded-full -ml-1.5 mt-0.5" style={{ background: p.secondary }} />
            </span>
            {p.name}
          </button>
        ))}
        <div className="flex items-center gap-1 ml-auto">
          <button onClick={() => set({ themeMode: "light" })} className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold ${config.themeMode === "light" ? "bg-[#0059ff] text-white" : "border border-input text-muted-foreground hover:text-foreground"}`}><Sun className="w-3.5 h-3.5" />Light</button>
          <button onClick={() => set({ themeMode: "dark" })} className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold ${config.themeMode === "dark" ? "bg-[#0059ff] text-white" : "border border-input text-muted-foreground hover:text-foreground"}`}><Moon className="w-3.5 h-3.5" />Dark</button>
        </div>
      </div>
    </div>
  );
}
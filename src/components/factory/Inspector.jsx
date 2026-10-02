import React from "react";
import { Lock, Palette, Type, ToggleRight, Monitor, Accessibility, FileCode2 } from "lucide-react";

const TABS = [
  { id: "properties", label: "Properties", icon: FileCode2 },
  { id: "tokens", label: "Tokens", icon: Palette },
  { id: "states", label: "States", icon: ToggleRight },
  { id: "responsive", label: "Responsive", icon: Monitor },
  { id: "a11y", label: "Accessibility", icon: Accessibility },
  { id: "type", label: "Type", icon: Type },
];

export default function Inspector({ selection, family, tokens, setTab, tab }) {
  const pattern = selection?.[family];
  const [localTab, setLocalTab] = React.useState(tab || "properties");
  const activeTab = tab || localTab;

  return (
    <aside className="w-full h-full flex flex-col">
      <div className="border-b border-border">
        <div className="flex overflow-x-auto xa-scroll">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => { setLocalTab(t.id); setTab?.(t.id); }}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
                  activeTab === t.id
                    ? "border-[#0059ff] text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto xa-scroll p-4">
        {!pattern ? (
          <div className="text-center text-xs text-muted-foreground py-10">
            Select a pattern from the library to inspect it.
          </div>
        ) : activeTab === "properties" ? (
          <PropertiesTab pattern={pattern} family={family} />
        ) : activeTab === "tokens" ? (
          <TokensTab tokens={tokens} />
        ) : activeTab === "states" ? (
          <StatesTab pattern={pattern} />
        ) : activeTab === "responsive" ? (
          <ResponsiveTab pattern={pattern} />
        ) : activeTab === "a11y" ? (
          <A11yTab pattern={pattern} />
        ) : (
          <TypeTab pattern={pattern} />
        )}
      </div>
    </aside>
  );
}

function PropertiesTab({ pattern, family }) {
  const keys = Object.keys(pattern).filter((k) => k !== "family" && k !== "familyLabel" && k !== "_seed" && k !== "score");
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono font-bold text-[#0d2f96]">{pattern.id}</span>
        {pattern.frozen && <Lock className="w-3.5 h-3.5 text-[#0d2f96]" />}
      </div>
      <h3 className="font-heading font-bold text-base text-foreground">{pattern.name}</h3>
      <div className="xa-card xa-card-subtle p-3 space-y-1.5">
        {keys.map((k) => {
          const v = pattern[k];
          return (
            <div key={k} className="text-xs">
              <span className="font-semibold text-muted-foreground">{k}:</span>{" "}
              <span className="text-foreground">
                {Array.isArray(v) ? v.join(", ") : typeof v === "object" ? JSON.stringify(v) : String(v)}
              </span>
            </div>
          );
        })}
      </div>
      <div className="text-[10px] text-muted-foreground font-mono">Family: {family}</div>
    </div>
  );
}

function TokensTab({ tokens }) {
  if (!tokens) return <div className="text-xs text-muted-foreground">Run token synthesis to generate tokens.</div>;
  return (
    <div className="space-y-3">
      <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Primitive Layer</div>
      <div className="xa-card xa-card-subtle p-3 space-y-1">
        {Object.entries(tokens.primitive || {}).map(([k, v]) => (
          <div key={k} className="flex items-center justify-between text-xs">
            <span className="font-mono text-muted-foreground">{k}</span>
            <span className="font-mono font-semibold text-foreground">{String(v)}</span>
          </div>
        ))}
      </div>
      <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Semantic Roles (light)</div>
      <div className="xa-card xa-card-subtle p-3 grid grid-cols-2 gap-1.5">
        {Object.entries(tokens.semantic?.light || {}).map(([role, hex]) => (
          <div key={role} className="flex items-center gap-1.5 text-[10px]">
            <span className="w-4 h-4 rounded border border-border" style={{ background: hex }} />
            <span className="font-mono text-muted-foreground truncate">{role}</span>
          </div>
        ))}
      </div>
      <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Contrast Checks</div>
      <div className="space-y-1">
        {Object.entries(tokens.contrast_checks || {}).map(([pair, ratio]) => (
          <div key={pair} className="flex items-center justify-between text-xs">
            <span className="font-mono text-muted-foreground">{pair}</span>
            <span className={`font-bold ${ratio >= 4.5 ? "text-[#0d2f96]" : "text-red-600"}`}>{ratio.toFixed(2)}:1</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatesTab({ pattern }) {
  const states = pattern.required_state_matrix ? ["default", "loading", "empty", "error", "disabled", "success"] : ["default"];
  return (
    <div className="space-y-2">
      <div className="text-xs font-semibold text-muted-foreground mb-2">Required state matrix</div>
      {states.map((s) => (
        <div key={s} className="flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full bg-[#0d2f96]" />
          <span className="font-mono text-foreground">{s}</span>
        </div>
      ))}
    </div>
  );
}

function ResponsiveTab({ pattern }) {
  return (
    <div className="space-y-2 text-xs">
      <div className="text-xs font-semibold text-muted-foreground mb-1">Responsive transformation</div>
      <div className="xa-card xa-card-subtle p-3 font-mono text-[11px] text-muted-foreground">
        {pattern.responsive_transform === false
          ? "No defined transform — BLOCKED for multi-platform."
          : pattern.mobile_transform || pattern.desktop_transform || pattern.responsive_transform || "Uses default responsive transform."}
      </div>
    </div>
  );
}

function A11yTab({ pattern }) {
  return (
    <div className="space-y-2 text-xs">
      <div className="xa-card xa-card-subtle p-3">
        <div className="font-semibold text-foreground mb-1">Accessibility</div>
        <div className="text-muted-foreground">
          {pattern.hover_only ? "⚠ Hover-only — forbidden." : "No hover-only interactions."}
        </div>
        <div className="text-muted-foreground mt-1">
          {pattern.reduced_motion === false ? "⚠ No reduced-motion fallback." : "Reduced-motion compliant."}
        </div>
      </div>
    </div>
  );
}

function TypeTab({ pattern }) {
  return (
    <div className="space-y-2 text-xs">
      <div className="text-xs font-semibold text-muted-foreground mb-1">Typography roles</div>
      <div className="space-y-1">
        {["display", "heading", "body", "caption", "mono"].map((r) => (
          <div key={r} className="flex items-center justify-between xa-card xa-card-subtle px-3 py-2">
            <span className="font-mono text-muted-foreground">{r}</span>
            <span className="text-foreground">{r === "display" ? "900 / 48px" : r === "heading" ? "700 / 24px" : r === "body" ? "400 / 16px" : r === "caption" ? "500 / 12px" : "400 / 14px"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
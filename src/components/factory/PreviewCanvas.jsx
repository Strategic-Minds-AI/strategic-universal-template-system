import React from "react";
import { Smartphone, Tablet, Monitor } from "lucide-react";

export default function PreviewCanvas({ viewport, theme, selection, project }) {
  const width = viewport?.width || 1280;
  const isMobile = width < 600;
  const isTablet = width >= 600 && width < 1024;

  const DeviceIcon = isMobile ? Smartphone : isTablet ? Tablet : Monitor;

  // Render a lightweight composed preview from the selection.
  const sel = selection || {};
  const recipe = sel.experience_recipes;
  const nav = sel.navigation_patterns;
  const color = sel.color_systems;
  const mobile = sel.mobile_patterns;
  const desktop = sel.desktop_patterns;

  return (
    <div className="flex-1 flex flex-col bg-[#F9FAFB] overflow-hidden">
      <div className="h-10 shrink-0 border-b border-border bg-background flex items-center justify-between px-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <DeviceIcon className="w-3.5 h-3.5" />
          {viewport?.label || "1280"}px
          <span className="text-muted-foreground/50">·</span>
          <span className="capitalize">{theme}</span>
        </div>
        <div className="text-[10px] font-mono text-muted-foreground">
          {recipe ? `${recipe.id} · ${recipe.name}` : "No recipe selected"}
        </div>
      </div>

      <div className="flex-1 overflow-auto xa-scroll flex items-start justify-center p-6">
        <div
          className="bg-white border border-border rounded-2xl shadow-lg transition-all duration-300 overflow-hidden"
          style={{ width: Math.min(width, 1600), maxWidth: "100%" }}
        >
          {/* Preview surface */}
          <PreviewContent
            isMobile={isMobile}
            isTablet={isTablet}
            selection={sel}
            project={project}
            color={color}
            nav={nav}
            mobile={mobile}
            desktop={desktop}
          />
        </div>
      </div>
    </div>
  );
}

function PreviewContent({ isMobile, isTablet, selection, project, color, nav, mobile, desktop }) {
  const recipeName = selection.experience_recipes?.name || "Experience Recipe";
  const flow = selection.experience_recipes?.canonical_flow || "home > detail > action > confirmation";

  return (
    <div className="flex flex-col" style={{ minHeight: 480 }}>
      {/* Top nav bar */}
      <div className="h-12 border-b border-border flex items-center justify-between px-4 bg-white">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#FFF7B3] to-[#CCBB00]" />
          <span className="text-xs font-bold">[BRAND_NAME]</span>
        </div>
        {!isMobile && (
          <div className="flex items-center gap-4 text-[11px] font-medium text-muted-foreground">
            <span>Home</span><span>Features</span><span>Pricing</span><span>About</span>
          </div>
        )}
        <button className="xa-btn-primary text-[10px]" style={{ padding: "6px 12px" }}>[PRIMARY_CTA]</button>
      </div>

      {/* Hero */}
      <div className="px-6 py-10 text-center bg-gradient-to-b from-[#FFFBCC]/40 to-white">
        <span className="xa-pill-badge mb-3" style={{ fontSize: 9 }}>{selection.domain_packs?.name || "Domain Pack"}</span>
        <h1 className="font-heading font-black text-2xl md:text-3xl text-foreground leading-tight">
          [HEADLINE_VALUE_PROPOSITION]
        </h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
          [SUBHEADLINE_SUPPORTING_COPY]
        </p>
        <div className="flex items-center justify-center gap-2 mt-4">
          <button className="xa-btn-primary text-xs">[PRIMARY_CTA]</button>
          <button className="xa-btn-outline text-xs">[SECONDARY_CTA]</button>
        </div>
      </div>

      {/* Recipe flow strip */}
      <div className="px-4 py-3 border-y border-border bg-[#FAFAFA]">
        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Experience Recipe · {recipeName}</div>
        <div className="flex items-center flex-wrap gap-1.5 text-[10px] font-mono text-muted-foreground">
          {flow.split(">").map((step, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span className="text-[#CCBB00]">›</span>}
              <span className="px-1.5 py-0.5 rounded bg-white border border-border">{step.trim()}</span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Feature grid (responsive transform) */}
      <div className={`p-5 grid gap-3 ${isMobile ? "grid-cols-1" : isTablet ? "grid-cols-2" : "grid-cols-3"}`}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="xa-card xa-card-subtle p-4">
            <div className="xa-icon-chip mb-3" style={{ width: 36, height: 36 }}>
              <span className="text-xs font-bold text-[#CCBB00]">0{i}</span>
            </div>
            <div className="text-sm font-bold text-foreground">[FEATURE_{i}_TITLE]</div>
            <div className="text-xs text-muted-foreground mt-1">[FEATURE_{i}_DESCRIPTION]</div>
          </div>
        ))}
      </div>

      {/* State matrix hint */}
      <div className="px-5 py-3 border-t border-border bg-white">
        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Required States</div>
        <div className="flex flex-wrap gap-1.5">
          {["default", "loading", "empty", "error", "disabled", "success"].map((s) => (
            <span key={s} className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-border text-muted-foreground">{s}</span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-border bg-[#FAFAFA] flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">[FOOTER_COPY]</span>
        <span className="text-[10px] font-mono text-muted-foreground">UI_ONLY · BACKEND_REQUIRED</span>
      </div>
    </div>
  );
}
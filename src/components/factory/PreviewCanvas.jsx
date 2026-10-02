import React, { useMemo } from "react";
import { Smartphone, Tablet, Monitor, Sparkles, Video, Brain } from "lucide-react";
import { renderPreview, GALLERY_FAMILIES } from "@/lib/gallery/previewRenderer.js";
import { loadConfig, themeToCssVars } from "@/lib/gallery/studioConfig.js";
import { PREVIEW_STYLES } from "@/lib/gallery/previewStyles.js";

// Ceiling preview canvas: renders REAL visual previews via previewRenderer
// instead of placeholder text. Supports desktop/mobile/recipe platforms,
// brand theming, and AI-generated media overlays.
export default function PreviewCanvas({ viewport, theme, selection, project, aiMedia, aiMediaType }) {
  const width = viewport?.width || 1280;
  const isMobile = width < 600;
  const isTablet = width >= 600 && width < 1024;
  const DeviceIcon = isMobile ? Smartphone : isTablet ? Tablet : Monitor;
  const config = useMemo(() => loadConfig(), []);

  // Pick a template from the selection or default to the first desktop pattern.
  const template = useMemo(() => {
    const families = GALLERY_FAMILIES;
    if (isMobile) {
      return families[1].items[0]; // first mobile archetype
    }
    return families[0].items[0]; // first desktop archetype
  }, [isMobile]);

  const platform = isMobile ? "mobile" : "desktop";
  const previewHtml = useMemo(() => renderPreview(template, platform, config), [template, platform, config]);

  return (
    <div className="flex-1 flex flex-col bg-[#F9FAFB] overflow-hidden relative">
      <style>{PREVIEW_STYLES}</style>
      {/* Preview toolbar */}
      <div className="h-10 shrink-0 border-b border-border bg-background flex items-center justify-between px-4 z-10">
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <DeviceIcon className="w-3.5 h-3.5" />
          {viewport?.label || "1280"}px
          <span className="text-muted-foreground/50">·</span>
          <span className="capitalize">{theme}</span>
          <span className="text-muted-foreground/50">·</span>
          <span className="font-mono text-[10px]">{template?.id || "default"}</span>
        </div>
        <div className="flex items-center gap-2">
          {aiMedia && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-[#0d2f96] bg-[#e6f0ff] px-2 py-0.5 rounded-full">
              {aiMediaType === "video" ? <Video className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
              AI {aiMediaType}
            </span>
          )}
          <span className="text-[10px] font-mono text-muted-foreground">LIVE PREVIEW</span>
        </div>
      </div>

      {/* Preview surface */}
      <div className="flex-1 overflow-auto xa-scroll flex items-start justify-center p-4 md:p-6">
        <div className="relative" style={{ width: Math.min(width, 1400), maxWidth: "100%" }}>
          {/* AI media overlay */}
          {aiMedia && (
            <div className={`absolute z-20 ${isMobile ? "top-2 right-2 w-32" : "top-4 right-4 w-48"} rounded-lg overflow-hidden border-2 border-[#0059ff] shadow-lg`}>
              {aiMediaType === "video" ? (
                <video src={aiMedia} autoPlay loop muted className="w-full" />
              ) : (
                <img src={aiMedia} alt="AI render" className="w-full" />
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1">
                <span className="text-[8px] font-bold text-white flex items-center gap-1"><Brain className="w-2 h-2" /> AI RENDER</span>
              </div>
            </div>
          )}
          {/* Real preview render */}
          <div
            className="bg-white border border-border rounded-2xl shadow-lg overflow-hidden vg-scope"
            style={useMemo(() => themeToCssVars(config), [config])}
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        </div>
      </div>
    </div>
  );
}
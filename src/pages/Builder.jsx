import React, { useState, useEffect } from "react";
import TopBar from "@/components/factory/TopBar.jsx";
import LeftRail from "@/components/factory/LeftRail.jsx";
import LibraryPanel from "@/components/factory/LibraryPanel.jsx";
import PreviewCanvas from "@/components/factory/PreviewCanvas.jsx";
import Inspector from "@/components/factory/Inspector.jsx";
import ValidationDrawer from "@/components/factory/ValidationDrawer.jsx";
import VideoTemplatePanel from "@/components/factory/builder/VideoTemplatePanel.jsx";
import AIRenderPanel from "@/components/factory/builder/AIRenderPanel.jsx";
import { composeSelection } from "@/lib/factory/compatibility.js";
import { validateBuildSpec } from "@/lib/factory/validation.js";
import { generateTokens } from "@/lib/factory/tokens.js";
import { REGISTRY_VERSION } from "@/lib/factory/registry/index.js";
import { base44 } from "@/api/base44Client";
import { VIDEO_TEMPLATES } from "@/lib/factory/videoTemplates";
import { PanelRightOpen, X } from "lucide-react";

const DEFAULT_PROJECT = {
  name: "Untitled Project",
  mode: "guided",
  platforms: ["mobile-web", "desktop-web"],
  primary_goal: "lead_generation",
  primary_conversion: "lead",
  seed: "uff-seed-001",
  registry_version: REGISTRY_VERSION,
  quality_profile: "ceiling",
  intake: { information_density: "medium", brand_tone: "modern", accessibility_needs: "standard" },
};

// Nav items that show the LibraryPanel (pattern families).
const LIBRARY_NAVS = ["components", "sections", "screens", "brand", "colors", "type", "media", "motion", "states", "data", "project", "export"];

export default function Builder() {
  const [project, setProject] = useState(DEFAULT_PROJECT);
  const [activeNav, setActiveNav] = useState("components");
  const [family, setFamily] = useState("component_patterns");
  const [frozen, setFrozen] = useState({});
  const [selection, setSelection] = useState({});
  const [viewport, setViewport] = useState({ id: "desktop", label: "1440", width: 1440 });
  const [theme, setTheme] = useState("light");
  const [inspectorTab, setInspectorTab] = useState("properties");
  const [validation, setValidation] = useState(null);
  const [valOpen, setValOpen] = useState(true);
  const [tokens, setTokens] = useState(null);
  const [inspectorOpen, setInspectorOpen] = useState(false);

  // Video + AI render state
  const [videoTemplate, setVideoTemplate] = useState(null);
  const [videoGenerating, setVideoGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [aiMedia, setAiMedia] = useState(null);
  const [aiMediaType, setAiMediaType] = useState(null);

  // Compose selection deterministically whenever project/frozen changes.
  useEffect(() => {
    const sel = composeSelection(project, frozen);
    setSelection(sel);
  }, [project, frozen]);

  const handleSelect = (fam, pattern) => {
    setFrozen((prev) => ({ ...prev, [fam]: pattern.id }));
  };

  const handleFreeze = (fam, id) => {
    setFrozen((prev) => ({ ...prev, [fam]: id }));
  };

  const handleValidate = () => {
    const buildSpec = {
      project_id: project.name,
      selected_patterns: selection,
      tokens: tokens || generateTokens("#0059ff"),
      screens: [{ route: "/", title: "Home", responsive_rules: [{ width: 390 }, { width: 768 }, { width: 1280 }, { width: 1440 }, { width: 1920 }] }],
      state_matrix: { button: ["default", "loading", "empty", "error", "disabled"], card: ["default", "loading", "empty", "error"] },
      repair_round: 0,
    };
    const result = validateBuildSpec(buildSpec, project);
    setValidation(result);
    setValOpen(true);
  };

  const handleExport = () => {
    const t = tokens || generateTokens("#0059ff");
    setTokens(t);
    const packet = {
      build_spec: { project_id: project.name, seed: project.seed, platforms: project.platforms, selected_patterns: Object.fromEntries(Object.entries(selection).map(([k, v]) => [k, v.id])), registry_version: REGISTRY_VERSION },
      tokens: t,
      validation,
      ai_media: aiMedia ? { url: aiMedia, type: aiMediaType } : null,
      approval_gate: { approved: false, required: true, note: "No production deploy without operator approval." },
    };
    const blob = new Blob([JSON.stringify(packet, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.name.replace(/\s+/g, "-").toLowerCase()}-build-packet.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleGenerateVideo = async () => {
    if (!videoTemplate) return;
    setVideoGenerating(true);
    try {
      const res = await base44.functions.invoke("generateMedia", {
        kind: "video",
        prompt: videoTemplate.prompt,
        duration: videoTemplate.duration,
        aspect_ratio: videoTemplate.aspect_ratio,
        generate_audio: videoTemplate.generate_audio,
      });
      const data = res?.data || res;
      if (data?.url) {
        setVideoUrl(data.url);
        setAiMedia(data.url);
        setAiMediaType("video");
      }
    } catch { /* best-effort */ }
    finally { setVideoGenerating(false); }
  };

  const handleUseInPreview = (url, kind) => {
    setAiMedia(url);
    setAiMediaType(kind);
  };

  // Determine which slide-in panel to show.
  const showLibrary = LIBRARY_NAVS.includes(activeNav);
  const showVideoPanel = activeNav === "video";
  const showAIRenderPanel = activeNav === "ai-render";
  const anyPanelOpen = showLibrary || showVideoPanel || showAIRenderPanel;

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <TopBar
        project={project}
        viewport={viewport}
        setViewport={setViewport}
        theme={theme}
        setTheme={setTheme}
        onValidate={handleValidate}
        onExport={handleExport}
        validation={validation}
      />
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left icon rail — always visible, narrow */}
        <LeftRail active={activeNav} setActive={setActiveNav} collapsed={false} setCollapsed={() => {}} />

        {/* Main preview area — full bleed */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <PreviewCanvas
            viewport={viewport}
            theme={theme}
            selection={selection}
            project={project}
            aiMedia={aiMedia}
            aiMediaType={aiMediaType}
          />
          <ValidationDrawer validation={validation} open={valOpen} setOpen={setValOpen} />
        </div>

        {/* Slide-in left panel (Library / Video / AI Render) — overlay, not fixed */}
        {anyPanelOpen && (
          <div className="absolute left-14 top-0 bottom-0 w-80 bg-background border-r border-border shadow-2xl z-30 flex flex-col">
            <div className="h-10 shrink-0 border-b border-border flex items-center justify-between px-3">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {showVideoPanel ? "Video Templates" : showAIRenderPanel ? "AI Visual Render" : "Pattern Library"}
              </span>
              <button onClick={() => setActiveNav("components")} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              {showVideoPanel && (
                <VideoTemplatePanel
                  onGenerate={handleGenerateVideo}
                  generating={videoGenerating}
                  generatedUrl={videoUrl}
                  activeTemplate={videoTemplate}
                  setActiveTemplate={setVideoTemplate}
                />
              )}
              {showAIRenderPanel && (
                <AIRenderPanel onUseInPreview={handleUseInPreview} />
              )}
              {showLibrary && (
                <LibraryPanel family={family} setFamily={setFamily} selection={selection} onSelect={handleSelect} onFreeze={handleFreeze} />
              )}
            </div>
          </div>
        )}

        {/* Slide-in right panel (Inspector) — overlay */}
        {inspectorOpen && (
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-background border-l border-border shadow-2xl z-30 flex flex-col">
            <div className="h-10 shrink-0 border-b border-border flex items-center justify-between px-3">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Inspector</span>
              <button onClick={() => setInspectorOpen(false)} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <Inspector selection={selection} family={family} tokens={tokens || generateTokens("#0059ff")} tab={inspectorTab} setTab={setInspectorTab} />
            </div>
          </div>
        )}

        {/* Inspector toggle button — floating, right edge */}
        {!inspectorOpen && (
          <button
            onClick={() => setInspectorOpen(true)}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-background border border-border border-r-0 rounded-l-lg p-2 shadow-md hover:bg-muted transition-colors"
            title="Open Inspector"
          >
            <PanelRightOpen className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>
    </div>
  );
}
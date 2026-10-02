import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import TopBar from "@/components/factory/TopBar.jsx";
import LeftRail from "@/components/factory/LeftRail.jsx";
import LibraryPanel from "@/components/factory/LibraryPanel.jsx";
import PreviewCanvas from "@/components/factory/PreviewCanvas.jsx";
import Inspector from "@/components/factory/Inspector.jsx";
import ValidationDrawer from "@/components/factory/ValidationDrawer.jsx";
import { composeSelection } from "@/lib/factory/compatibility.js";
import { validateBuildSpec } from "@/lib/factory/validation.js";
import { generateTokens } from "@/lib/factory/tokens.js";
import { REGISTRY_VERSION } from "@/lib/factory/registry/index.js";

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

export default function Builder() {
  const navigate = useNavigate();
  const [project, setProject] = useState(DEFAULT_PROJECT);
  const [activeNav, setActiveNav] = useState("components");
  const [railCollapsed, setRailCollapsed] = useState(false);
  const [family, setFamily] = useState("component_patterns");
  const [frozen, setFrozen] = useState({});
  const [selection, setSelection] = useState({});
  const [viewport, setViewport] = useState({ id: "desktop", label: "1440", width: 1440 });
  const [theme, setTheme] = useState("light");
  const [inspectorTab, setInspectorTab] = useState("properties");
  const [validation, setValidation] = useState(null);
  const [valOpen, setValOpen] = useState(true);
  const [tokens, setTokens] = useState(null);

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
      tokens: tokens || generateTokens("#FFEA00"),
      screens: [{ route: "/", title: "Home", responsive_rules: [{ width: 390 }, { width: 768 }, { width: 1280 }, { width: 1440 }, { width: 1920 }] }],
      state_matrix: { button: ["default", "loading", "empty", "error", "disabled"], card: ["default", "loading", "empty", "error"] },
      repair_round: 0,
    };
    const result = validateBuildSpec(buildSpec, project);
    setValidation(result);
    setValOpen(true);
  };

  const handleExport = () => {
    const t = tokens || generateTokens("#FFEA00");
    setTokens(t);
    const packet = {
      build_spec: { project_id: project.name, seed: project.seed, platforms: project.platforms, selected_patterns: Object.fromEntries(Object.entries(selection).map(([k, v]) => [k, v.id])), registry_version: REGISTRY_VERSION },
      tokens: t,
      validation,
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
      <div className="flex-1 flex overflow-hidden">
        <LeftRail active={activeNav} setActive={setActiveNav} collapsed={railCollapsed} setCollapsed={setRailCollapsed} />
        <LibraryPanel family={family} setFamily={setFamily} selection={selection} onSelect={handleSelect} onFreeze={handleFreeze} />
        <PreviewCanvas viewport={viewport} theme={theme} selection={selection} project={project} />
        <Inspector selection={selection} family={family} tokens={tokens || generateTokens("#FFEA00")} tab={inspectorTab} setTab={setInspectorTab} />
      </div>
      <ValidationDrawer validation={validation} open={valOpen} setOpen={setValOpen} />
    </div>
  );
}
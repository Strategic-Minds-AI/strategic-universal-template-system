import React, { useMemo } from "react";
import { Plug } from "lucide-react";
import { ADAPTERS } from "@/lib/factory/generator/adapters";
import { StatusPill } from "@/components/factory/EntityListPage.jsx";
import { PREVIEW_STYLES } from "@/lib/gallery/previewStyles.js";
import { loadConfig, themeToCssVars } from "@/lib/gallery/studioConfig.js";
import VisualizerCard from "@/components/visualizer/VisualizerCard.jsx";

export default function AdapterLibrary() {
  const config = loadConfig();
  const themeVars = useMemo(() => themeToCssVars(config), []);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <style>{PREVIEW_STYLES}</style>
      <div className="flex items-center gap-3 mb-5">
        <div className="xa-icon-chip"><Plug className="w-5 h-5" /></div>
        <div>
          <h1 className="text-xl font-black font-heading">Adapter Library</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Integration adapters with explicit health and required configuration. Unconfigured adapters return NOT_CONFIGURED — never fake success.</p>
        </div>
      </div>
      <div style={themeVars} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {ADAPTERS.map((a) => (
          <VisualizerCard
            key={a.adapter_key}
            title={a.name}
            keyField={a.adapter_key}
            status={a.health_state}
            adapter={a}
            footer={
              <div className="flex flex-wrap gap-1">
                {a.capabilities.map((c) => (<span key={c} className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{c}</span>))}
              </div>
            }
          />
        ))}
      </div>
    </div>
  );
}
import React from "react";
import VisualizerPreview from "./VisualizerPreview.jsx";
import { StatusPill } from "@/components/factory/EntityListPage.jsx";
import { PREVIEW_STYLES } from "@/lib/gallery/previewStyles.js";
import { loadConfig, themeToCssVars } from "@/lib/gallery/studioConfig.js";

const config = loadConfig();

export default function VisualizerCard({ title, subtitle, badge, status, version, keyField, onClick, type, record, entityName, agent, adapter, footer }) {
  const themeVars = themeToCssVars(config);
  return (
    <div className="xa-card overflow-hidden flex flex-col" style={themeVars}>
      <style>{PREVIEW_STYLES}</style>
      <div className="flex items-center justify-center bg-muted/40 py-5 overflow-hidden">
        <div className="origin-top">
          <VisualizerPreview type={type} record={record} entityName={entityName} agent={agent} adapter={adapter} config={config} />
        </div>
      </div>
      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-bold font-heading truncate">{title}</h3>
          {badge && <span className="xa-pill-badge shrink-0" style={{ fontSize: 9 }}>{badge}</span>}
        </div>
        {keyField && <div className="text-[11px] font-mono text-muted-foreground mt-1 truncate">{keyField}</div>}
        {subtitle && <div className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{subtitle}</div>}
        <div className="flex items-center justify-between mt-2">
          {status && <StatusPill status={status} />}
          {version && <span className="text-[10px] font-mono">v{version}</span>}
        </div>
        {footer && <div className="mt-2">{footer}</div>}
      </div>
    </div>
  );
}
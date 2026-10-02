import React from "react";
import {
  Layers, FileCode2, Blocks, Palette, Type, Image,
  Move, ToggleRight, Database, Download, Settings, FolderTree, Boxes, Sparkles,
} from "lucide-react";

const NAV = [
  { id: "project", label: "Project", icon: FolderTree },
  { id: "screens", label: "Screens", icon: FileCode2 },
  { id: "sections", label: "Sections", icon: Layers },
  { id: "components", label: "Components", icon: Blocks },
  { id: "brand", label: "Brand", icon: Sparkles },
  { id: "colors", label: "Colors", icon: Palette },
  { id: "type", label: "Type", icon: Type },
  { id: "media", label: "Media", icon: Image },
  { id: "motion", label: "Motion", icon: Move },
  { id: "states", label: "States", icon: ToggleRight },
  { id: "data", label: "Data", icon: Database },
  { id: "export", label: "Export", icon: Download },
];

export default function LeftRail({ active, setActive, collapsed, setCollapsed }) {
  return (
    <nav className={`shrink-0 border-r border-border bg-background flex flex-col transition-all duration-200 ${collapsed ? "w-16" : "w-56"}`}>
      <div className="flex-1 overflow-y-auto xa-scroll py-3">
        {NAV.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors group ${
                isActive
                  ? "text-foreground bg-muted border-r-2 border-[#FFEA00]"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
              title={item.label}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-[#CCBB00]" : ""}`} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </div>
      <div className="border-t border-border p-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <Settings className="w-3.5 h-3.5" />
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </nav>
  );
}
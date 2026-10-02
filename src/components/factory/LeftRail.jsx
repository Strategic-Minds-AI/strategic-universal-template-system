import React from "react";
import {
  FolderTree, FileCode2, Layers, Blocks, Sparkles, Palette, Type,
  Image, Move, ToggleRight, Database, Download, Video, Brain,
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
  { id: "video", label: "Video", icon: Video },
  { id: "ai-render", label: "AI Render", icon: Brain },
  { id: "motion", label: "Motion", icon: Move },
  { id: "states", label: "States", icon: ToggleRight },
  { id: "data", label: "Data", icon: Database },
  { id: "export", label: "Export", icon: Download },
];

export default function LeftRail({ active, setActive, collapsed, setCollapsed }) {
  return (
    <nav className="w-14 shrink-0 border-r border-border bg-background flex flex-col">
      <div className="flex-1 overflow-y-auto xa-scroll py-2">
        {NAV.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              className={`w-full flex flex-col items-center gap-1 py-2.5 text-[9px] font-semibold transition-colors group relative ${
                isActive
                  ? "text-[#0d2f96] bg-[#e6f0ff]"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
              title={item.label}
            >
              {isActive && <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#0059ff]" />}
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate max-w-[48px] leading-tight text-center">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
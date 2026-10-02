import React from "react";
import RenderFrame from "./RenderFrame";
import { Boxes, Wrench, Play, GitBranch, CheckCircle2 } from "lucide-react";

/**
 * Visual mockup of the Generators section — library grid + studio DAG editor.
 * Shows what a user sees: browsing generators, inspecting a DAG, creating one.
 */
export default function GeneratorsRender({ height = 320 }) {
  const cards = [
    { name: "Landing Page", cat: "code", nodes: 6, status: "validated" },
    { name: "SEO Report", cat: "business", nodes: 5, status: "approved" },
    { name: "Logo Pack", cat: "design", nodes: 4, status: "draft" },
    { name: "Data Pipeline", cat: "data", nodes: 8, status: "frozen" },
  ];
  const dagNodes = [
    { id: "validate_input", t: "validate_schema" },
    { id: "render", t: "template" },
    { id: "ai_generate", t: "ai_generate" },
    { id: "validate_output", t: "validate_content" },
    { id: "checksum", t: "checksum" },
  ];
  return (
    <RenderFrame label="factory / generators" height={height}>
      <div className="flex h-full">
        {/* Library grid */}
        <div className="w-1/2 p-3 border-r border-border overflow-hidden">
          <div className="flex items-center gap-1.5 mb-2">
            <Boxes className="w-3 h-3 text-[#0d2f96]" />
            <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Generator Library</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {cards.map((c, i) => (
              <div key={c.name} className={`rounded-lg border p-2 ${i === 0 ? "border-[#0059ff] bg-[#e6f0ff]/40" : "border-border bg-white"}`}>
                <div className="flex items-center gap-1 mb-1">
                  <div className={`w-4 h-4 rounded ${i === 0 ? "bg-[#0059ff]" : "bg-muted"}`} />
                  <span className="text-[9px] font-bold truncate">{c.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[8px] font-mono text-muted-foreground">{c.cat}</span>
                  <span className={`text-[8px] font-bold px-1 rounded ${c.status === "validated" ? "text-[#0d2f96] bg-[#e6f0ff]" : c.status === "approved" ? "text-green-600 bg-green-50" : c.status === "frozen" ? "text-purple-600 bg-purple-50" : "text-gray-500 bg-gray-50"}`}>{c.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Studio DAG */}
        <div className="w-1/2 p-3 overflow-hidden">
          <div className="flex items-center gap-1.5 mb-2">
            <Wrench className="w-3 h-3 text-[#0d2f96]" />
            <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Studio · Workflow DAG</span>
          </div>
          <div className="space-y-1">
            {dagNodes.map((n, i) => (
              <div key={n.id} className="flex items-center gap-1.5">
                <div className="flex flex-col items-center">
                  {i > 0 && <div className="w-px h-2 bg-border" />}
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center ${i < 3 ? "bg-[#0059ff]" : i === 3 ? "bg-green-500" : "bg-muted"}`}>
                    {i < 3 ? <CheckCircle2 className="w-2.5 h-2.5 text-white" /> : i === 3 ? <CheckCircle2 className="w-2.5 h-2.5 text-white" /> : <Play className="w-2 h-2 text-muted-foreground" />}
                  </div>
                </div>
                <div className="flex-1 rounded-md bg-muted/50 px-1.5 py-1">
                  <span className="text-[9px] font-mono font-semibold">{n.id}</span>
                  <span className="text-[8px] text-muted-foreground ml-1">· {n.t}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2 flex items-center gap-1 text-[9px] text-muted-foreground">
            <GitBranch className="w-2.5 h-2.5" /> 5 nodes · 4 edges · v1.0.0
          </div>
        </div>
      </div>
    </RenderFrame>
  );
}
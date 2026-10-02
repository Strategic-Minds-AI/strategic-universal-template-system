import React, { useState } from "react";
import { Video, Play, Loader2, Film, Sparkles, Download } from "lucide-react";
import { VIDEO_TEMPLATES, VIDEO_CATEGORIES } from "@/lib/factory/videoTemplates";
import { base44 } from "@/api/base44Client";

// Video template browser + AI video generation panel.
// Slide-in overlay in the Builder — browse templates, generate AI videos.
export default function VideoTemplatePanel({ onGenerate, generating, generatedUrl, activeTemplate, setActiveTemplate }) {
  const [category, setCategory] = useState("All");

  const filtered = category === "All" ? VIDEO_TEMPLATES : VIDEO_TEMPLATES.filter((t) => t.category === category);

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-border">
        <div className="flex items-center gap-2 mb-2">
          <Video className="w-4 h-4 text-[#0d2f96]" />
          <h2 className="text-xs font-bold uppercase tracking-wider">Video Templates</h2>
        </div>
        <p className="text-[10px] text-muted-foreground">AI-generated video renders via Vercel AI Gateway + Veo 3</p>
      </div>

      <div className="flex gap-1 px-3 py-2 border-b border-border overflow-x-auto xa-scroll">
        {VIDEO_CATEGORIES.map((c) => (
          <button key={c} onClick={() => setCategory(c)}
            className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap transition-all ${
              category === c ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted"
            }`}>{c}</button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto xa-scroll p-2.5 space-y-2">
        {filtered.map((t) => (
          <button key={t.id} onClick={() => setActiveTemplate(t)}
            className={`w-full text-left rounded-xl border p-3 transition-all ${
              activeTemplate?.id === t.id
                ? "border-[#0059ff] bg-[#0059ff]/5 shadow-[0_0_14px_-6px_rgba(0,89,255,0.5)]"
                : "border-border hover:border-foreground/20 hover:bg-muted/50"
            }`}>
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-[#0d2f96]" />
                <span className="text-sm font-semibold text-foreground">{t.name}</span>
              </div>
              <span className="text-[9px] font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{t.duration}s</span>
            </div>
            <div className="text-[10px] text-muted-foreground mb-1">{t.aspect_ratio} · {t.category}</div>
            <p className="text-[11px] text-muted-foreground line-clamp-2">{t.description}</p>
          </button>
        ))}
      </div>

      {activeTemplate && (
        <div className="border-t border-border p-3 space-y-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Selected: {activeTemplate.name}</div>
          <div className="xa-card xa-card-subtle p-2 text-[10px] text-muted-foreground font-mono line-clamp-3 max-h-16 overflow-y-auto xa-scroll">
            {activeTemplate.prompt}
          </div>
          <button onClick={onGenerate} disabled={generating}
            className="xa-btn-primary w-full text-xs" style={{ padding: "10px 14px" }}>
            {generating ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating...</> : <><Sparkles className="w-3.5 h-3.5" /> Generate Video</>}
          </button>
          {generatedUrl && !generating && (
            <div className="space-y-2">
              <video src={generatedUrl} controls className="w-full rounded-lg border border-border" />
              <a href={generatedUrl} download className="flex items-center justify-center gap-1.5 text-xs font-semibold text-[#0d2f96] hover:underline">
                <Download className="w-3 h-3" /> Download
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
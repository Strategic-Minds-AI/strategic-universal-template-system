import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Plus, Folder, Search, Boxes, Brain, Video, Grid3x3, List, Zap, Activity, CheckCircle, Clock, AlertCircle, Sparkles } from "lucide-react";
import { TOTAL_ENTRIES, REGISTRY_VERSION } from "@/lib/factory/registry/index.js";
import { useProjectsData } from "@/components/projects/useProjectsData";
import AICreateModal from "@/components/projects/AICreateModal";
import { VIDEO_TEMPLATES } from "@/lib/factory/videoTemplates";

const STATUS_CONFIG = {
  draft: { icon: Clock, color: "text-gray-500 bg-gray-50", label: "Draft" },
  composing: { icon: Activity, color: "text-blue-600 bg-blue-50", label: "Composing" },
  validating: { icon: Activity, color: "text-blue-600 bg-blue-50", label: "Validating" },
  validated: { icon: CheckCircle, color: "text-[#0d2f96] bg-[#e6f0ff]", label: "Validated" },
  approved: { icon: CheckCircle, color: "text-green-600 bg-green-50", label: "Approved" },
  exported: { icon: CheckCircle, color: "text-green-600 bg-green-50", label: "Exported" },
  blocked: { icon: AlertCircle, color: "text-red-600 bg-red-50", label: "Blocked" },
};

export default function Projects() {
  const navigate = useNavigate();
  const { projects, loading, live, stats, reload } = useProjectsData();
  const [query, setQuery] = useState("");
  const [view, setView] = useState("grid");
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  // Server-side search would be ideal, but for a small project list client-side is fine.
  const filtered = useMemo(() => {
    if (!query) return projects;
    const q = query.toLowerCase();
    return projects.filter((p) =>
      (p.name || "").toLowerCase().includes(q) ||
      (p.industry || "").toLowerCase().includes(q) ||
      (p.company || "").toLowerCase().includes(q)
    );
  }, [projects, query]);

  const createProject = async () => {
    try {
      const rec = await base44.entities.Project.create({
        name: "New Factory Project",
        mode: "guided",
        platforms: ["mobile-web", "desktop-web"],
        primary_goal: "lead_generation",
        primary_conversion: "lead",
        seed: "uff-" + Date.now(),
        registry_version: REGISTRY_VERSION,
        quality_profile: "ceiling",
        status: "draft",
      });
      navigate(`/builder?project=${rec.id}`);
    } catch {
      navigate("/builder");
    }
  };

  const createFromVideoTemplate = async (template) => {
    try {
      const rec = await base44.entities.Project.create({
        name: `${template.name} Project`,
        mode: "auto-compose",
        platforms: template.aspect_ratio === "9:16" ? ["mobile-web"] : ["mobile-web", "desktop-web"],
        primary_goal: "brand_awareness",
        primary_conversion: "lead",
        seed: "uff-" + Date.now(),
        registry_version: REGISTRY_VERSION,
        quality_profile: "ceiling",
        status: "draft",
        summary: template.description,
        intake: { video_template: template.id, video_prompt: template.prompt },
      });
      navigate(`/builder?project=${rec.id}`);
    } catch {
      navigate("/builder");
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="xa-pill-badge">Factory Projects</span>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${live ? "bg-green-500 animate-pulse" : "bg-gray-300"}`} />
              <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{live ? "Live" : "Snapshot"}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5 border border-border rounded-lg p-0.5">
              <button onClick={() => setView("grid")} className={`p-1.5 rounded ${view === "grid" ? "bg-foreground text-background" : "text-muted-foreground"}`}><Grid3x3 className="w-3.5 h-3.5" /></button>
              <button onClick={() => setView("list")} className={`p-1.5 rounded ${view === "list" ? "bg-foreground text-background" : "text-muted-foreground"}`}><List className="w-3.5 h-3.5" /></button>
            </div>
            <button onClick={() => setVideoModalOpen(true)} className="xa-btn-outline text-xs" style={{ padding: "8px 14px" }}>
              <Video className="w-3.5 h-3.5" /> From Video Template
            </button>
            <button onClick={() => setAiModalOpen(true)} className="xa-btn-outline text-xs" style={{ padding: "8px 14px" }}>
              <Brain className="w-3.5 h-3.5" /> AI Create
            </button>
            <button onClick={createProject} className="xa-btn-primary text-xs" style={{ padding: "8px 14px" }}>
              <Plus className="w-3.5 h-3.5" /> New Project
            </button>
          </div>
        </div>
        <h1 className="font-heading font-black text-2xl text-foreground">Projects</h1>
        <p className="text-muted-foreground mt-1 text-sm max-w-2xl">
          Compose production-grade systems from compatible pattern families. {TOTAL_ENTRIES} registry entries · v{REGISTRY_VERSION} · 12 quality passes.
        </p>
      </div>

      {/* Search */}
      <div className="flex items-center justify-between mb-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects..."
            className="pl-8 pr-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring w-64"
          />
        </div>
        <div className="text-xs text-muted-foreground">{filtered.length} project{filtered.length !== 1 ? "s" : ""}</div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="xa-card p-6 text-center text-sm text-muted-foreground">Loading projects...</div>
      ) : filtered.length === 0 ? (
        <div className="xa-card xa-card-subtle p-12 text-center">
          <Folder className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <div className="text-sm font-semibold text-foreground">No projects yet</div>
          <div className="text-xs text-muted-foreground mt-1 mb-4">Create your first factory project — manually, with AI, or from a video template.</div>
          <div className="flex items-center justify-center gap-2">
            <button onClick={createProject} className="xa-btn-primary text-xs"><Plus className="w-3.5 h-3.5" /> New Project</button>
            <button onClick={() => setAiModalOpen(true)} className="xa-btn-outline text-xs"><Brain className="w-3.5 h-3.5" /> AI Create</button>
          </div>
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => {
            const sc = STATUS_CONFIG[p.status] || STATUS_CONFIG.draft;
            const StatusIcon = sc.icon;
            const runCount = stats[p.id] || 0;
            return (
              <button
                key={p.id}
                onClick={() => navigate(`/builder?project=${p.id}`)}
                className="xa-card p-4 text-left hover:border-[#0059ff] hover:shadow-[0_0_14px_-6px_rgba(0,89,255,0.5)] transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${sc.color}`}>
                    <StatusIcon className="w-2.5 h-2.5" /> {sc.label}
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">{p.mode || "guided"}</span>
                </div>
                <div className="font-heading font-bold text-sm text-foreground truncate group-hover:text-[#0d2f96] transition-colors">{p.name}</div>
                <div className="text-xs text-muted-foreground mt-1 truncate">{p.industry || p.product_archetype || p.company || "—"}</div>
                {p.summary && <div className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{p.summary}</div>}
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-border">
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-0.5"><Zap className="w-2.5 h-2.5" /> {runCount} runs</span>
                    <span>·</span>
                    <span>{(p.platforms || []).length} platforms</span>
                  </div>
                  {p.intake?.ai_generated && <span className="flex items-center gap-0.5 text-[9px] font-bold text-[#0d2f96]"><Sparkles className="w-2.5 h-2.5" /> AI</span>}
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="xa-card overflow-hidden">
          <div className="overflow-x-auto xa-scroll">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-muted-foreground">
                <tr>
                  <th className="text-left font-semibold text-xs uppercase tracking-wider px-4 py-2.5">Name</th>
                  <th className="text-left font-semibold text-xs uppercase tracking-wider px-4 py-2.5">Status</th>
                  <th className="text-left font-semibold text-xs uppercase tracking-wider px-4 py-2.5">Industry</th>
                  <th className="text-left font-semibold text-xs uppercase tracking-wider px-4 py-2.5">Mode</th>
                  <th className="text-left font-semibold text-xs uppercase tracking-wider px-4 py-2.5">Runs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((p) => {
                  const sc = STATUS_CONFIG[p.status] || STATUS_CONFIG.draft;
                  const StatusIcon = sc.icon;
                  return (
                    <tr key={p.id} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => navigate(`/builder?project=${p.id}`)}>
                      <td className="px-4 py-2.5">
                        <div className="font-semibold text-foreground">{p.name}</div>
                        {p.summary && <div className="text-[10px] text-muted-foreground truncate max-w-xs">{p.summary}</div>}
                      </td>
                      <td className="px-4 py-2.5"><span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${sc.color} w-fit`}><StatusIcon className="w-2.5 h-2.5" /> {sc.label}</span></td>
                      <td className="px-4 py-2.5 text-muted-foreground">{p.industry || "—"}</td>
                      <td className="px-4 py-2.5 text-muted-foreground font-mono text-xs">{p.mode || "guided"}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{stats[p.id] || 0}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* AI Create Modal */}
      <AICreateModal open={aiModalOpen} onClose={() => setAiModalOpen(false)} onCreated={(rec) => navigate(`/builder?project=${rec.id}`)} />

      {/* Video Template Modal */}
      {videoModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setVideoModalOpen(false)}>
          <div className="xa-card max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto xa-scroll" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-[#0d2f96]" />
                <h2 className="text-lg font-bold font-heading">Create from Video Template</h2>
              </div>
              <button onClick={() => setVideoModalOpen(false)} className="p-1 rounded hover:bg-muted"><span className="text-xl">×</span></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {VIDEO_TEMPLATES.map((t) => (
                <button key={t.id} onClick={() => createFromVideoTemplate(t)} className="text-left rounded-xl border border-border p-3 hover:border-[#0059ff] hover:bg-muted/50 transition-all">
                  <div className="text-sm font-semibold text-foreground">{t.name}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{t.category} · {t.duration}s · {t.aspect_ratio}</div>
                  <div className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{t.description}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
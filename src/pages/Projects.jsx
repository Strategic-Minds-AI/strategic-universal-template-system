import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Plus, Folder, Search, Boxes } from "lucide-react";
import BrandLogo from "@/components/factory/BrandLogo.jsx";
import { TOTAL_ENTRIES, REGISTRY_VERSION } from "@/lib/factory/registry/index.js";

export default function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { items } = await base44.entities.Project.filter({}, { sort: "-created_date", limit: 50 });
        setProjects(items);
      } catch (e) {
        // empty state
      }
      setLoading(false);
    })();
  }, []);

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
    } catch (e) {
      navigate("/builder");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <BrandLogo size={32} />
          <div className="flex items-center gap-2">
            <button onClick={() => navigate("/library/component_patterns")} className="xa-btn-outline text-xs" style={{ padding: "8px 14px" }}>
              <Boxes className="w-3.5 h-3.5" /> Library
            </button>
            <button onClick={() => navigate("/consulting")} className="xa-btn-outline text-xs" style={{ padding: "8px 14px" }}>
              Consulting
            </button>
            <button onClick={createProject} className="xa-btn-primary text-xs" style={{ padding: "8px 14px" }}>
              <Plus className="w-3.5 h-3.5" /> New Project
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <span className="xa-pill-badge mb-3">Universal Frontend + AI Business Factory</span>
          <h1 className="font-heading font-black text-3xl text-foreground">Factory Dashboard</h1>
          <p className="text-muted-foreground mt-2 text-sm max-w-xl">
            A deterministic, governed application factory. Compose production-grade apps from compatible pattern families,
            validate against hard gates, and export a build packet — all version-pinned and approval-gated.
          </p>
          <div className="flex gap-4 mt-4 text-xs">
            <Stat label="Registry entries" value={TOTAL_ENTRIES} />
            <Stat label="Registry version" value={`v${REGISTRY_VERSION}`} />
            <Stat label="Pattern families" value="33" />
            <Stat label="Quality passes" value="12" />
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-bold text-lg">Projects</h2>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search projects..."
              className="pl-8 pr-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring w-64"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-sm text-muted-foreground">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="xa-card xa-card-subtle p-12 text-center">
            <Folder className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <div className="text-sm font-semibold text-foreground">No projects yet</div>
            <div className="text-xs text-muted-foreground mt-1 mb-4">Create your first factory project to begin composing.</div>
            <button onClick={createProject} className="xa-btn-primary text-xs">
              <Plus className="w-3.5 h-3.5" /> Create project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((p) => (
              <button
                key={p.id}
                onClick={() => navigate(`/builder?project=${p.id}`)}
                className="xa-card p-4 text-left hover:border-[#0059ff] hover:shadow-[0_0_14px_-6px_rgba(0,89,255,0.5)] transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="xa-pill-badge" style={{ fontSize: 9, padding: "2px 8px" }}>{p.mode || "guided"}</span>
                  <span className="text-[10px] font-mono text-muted-foreground">{p.status || "draft"}</span>
                </div>
                <div className="font-heading font-bold text-sm text-foreground truncate">{p.name}</div>
                <div className="text-xs text-muted-foreground mt-1 truncate">{p.industry || p.product_archetype || "—"}</div>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="xa-card xa-card-subtle px-3 py-2">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-heading font-black text-lg text-foreground">{value}</div>
    </div>
  );
}
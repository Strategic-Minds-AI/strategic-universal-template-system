import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Search, ArrowLeft } from "lucide-react";
import BrandLogo from "@/components/factory/BrandLogo.jsx";
import { REGISTRY, TOTAL_ENTRIES, REGISTRY_VERSION } from "@/lib/factory/registry/index.js";

export default function Library() {
  const { family: paramFamily } = useParams();
  const navigate = useNavigate();
  const [family, setFamily] = useState(paramFamily || "component_patterns");
  const [query, setQuery] = useState("");

  const families = Object.keys(REGISTRY);
  const fam = REGISTRY[family];
  const items = useMemo(() => {
    if (!fam) return [];
    let list = fam.items || [];
    if (query) {
      const q = query.toLowerCase();
      list = list.filter((p) =>
        String(p.name || "").toLowerCase().includes(q) ||
        String(p.id || "").toLowerCase().includes(q) ||
        (p.tags || []).some((t) => t.toLowerCase().includes(q))
      );
    }
    return list;
  }, [fam, query]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/")} className="p-2 rounded-lg hover:bg-muted transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <BrandLogo size={28} />
          </div>
          <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-2 py-1 rounded-full">
            v{REGISTRY_VERSION} · {TOTAL_ENTRIES} entries
          </span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="font-heading font-black text-2xl mb-1">Pattern Registry</h1>
        <p className="text-sm text-muted-foreground mb-6">Versioned, data-driven pattern families. Browse, search, and inspect every entry.</p>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {families.map((f) => (
            <button
              key={f}
              onClick={() => setFamily(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                family === f ? "bg-foreground text-background" : "text-muted-foreground bg-muted hover:bg-muted/70"
              }`}
            >
              {REGISTRY[f].label} <span className="opacity-60">({(REGISTRY[f].items || []).length})</span>
            </button>
          ))}
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${fam?.label || ""}...`}
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((p) => (
            <div key={p.id} className="xa-card p-4 hover:border-foreground/20 transition-colors">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono font-bold text-[#0d2f96]">{p.id}</span>
              </div>
              <div className="font-heading font-bold text-sm text-foreground">{p.name}</div>
              {p.tags && p.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {p.tags.slice(0, 4).map((t) => (
                    <span key={t} className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{t}</span>
                  ))}
                </div>
              )}
              {p.purpose && <div className="text-xs text-muted-foreground mt-2 line-clamp-2">{p.purpose}</div>}
            </div>
          ))}
        </div>
        {items.length === 0 && <div className="text-center text-sm text-muted-foreground py-12">No patterns match.</div>}
      </main>
    </div>
  );
}
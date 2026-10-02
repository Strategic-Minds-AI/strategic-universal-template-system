import React, { useMemo, useState } from "react";
import { Globe, Search } from "lucide-react";
import { REGISTRY } from "@/lib/factory/registry/index.js";

export default function IndustryPacks() {
  const packs = useMemo(() => REGISTRY.domain_packs?.items || [], []);
  const [query, setQuery] = useState("");
  const filtered = query
    ? packs.filter((p) => String(p.id || p.name || "").toLowerCase().includes(query.toLowerCase()) || (p.tags || []).some((t) => t.toLowerCase().includes(query.toLowerCase())))
    : packs;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <div className="xa-icon-chip"><Globe className="w-5 h-5" /></div>
        <div>
          <h1 className="text-xl font-black font-heading">Industry Packs</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Vertical-tuned pattern bundles — {packs.length} domain packs from the registry.</p>
        </div>
      </div>

      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search industry packs..." className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((p) => (
          <div key={p.id} className="xa-card p-4">
            <div className="text-xs font-mono font-bold text-[#CCBB00] mb-1">{p.id}</div>
            <div className="font-heading font-bold text-sm">{p.name}</div>
            {p.purpose && <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.purpose}</div>}
            {p.tags && p.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {p.tags.slice(0, 5).map((t) => <span key={t} className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{t}</span>)}
              </div>
            )}
          </div>
        ))}
      </div>
      {filtered.length === 0 && <div className="text-center text-sm text-muted-foreground py-12">No industry packs match.</div>}
    </div>
  );
}
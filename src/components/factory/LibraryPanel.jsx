import React, { useMemo, useState } from "react";
import { Search, Lock, Star } from "lucide-react";
import { REGISTRY, TOTAL_ENTRIES, REGISTRY_VERSION } from "@/lib/factory/registry/index.js";

export default function LibraryPanel({ family, setFamily, selection, onSelect, onFreeze }) {
  const [query, setQuery] = useState("");
  const [compatOnly, setCompatOnly] = useState(false);

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

  const selectedId = selection?.[family]?.id;

  return (
    <aside className="w-[340px] shrink-0 border-r border-border bg-background flex flex-col">
      <div className="p-3 border-b border-border space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Pattern Library</h2>
          <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            v{REGISTRY_VERSION} · {TOTAL_ENTRIES}
          </span>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search patterns..."
            className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={compatOnly}
            onChange={(e) => setCompatOnly(e.target.checked)}
            className="accent-[#0059ff]"
          />
          Compatible only (score ≥ 75)
        </label>
      </div>

      <div className="flex gap-1 px-3 py-2 border-b border-border overflow-x-auto xa-scroll">
        {families.map((f) => (
          <button
            key={f}
            onClick={() => setFamily(f)}
            className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all ${
              family === f
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            {REGISTRY[f].label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto xa-scroll p-2.5 space-y-2">
        {items.length === 0 && (
          <div className="text-center text-xs text-muted-foreground py-8">No patterns match.</div>
        )}
        {items.map((p) => {
          const isSel = p.id === selectedId;
          const frozen = isSel && selection?.[family]?.frozen;
          const score = p.score ?? (isSel ? selection?.[family]?.score : null);
          const eligible = score == null || score >= 75;
          if (compatOnly && !eligible && !isSel) return null;
          return (
            <button
              key={p.id}
              onClick={() => onSelect(family, p)}
              className={`w-full text-left rounded-xl border p-3 transition-all ${
                isSel
                  ? "border-[#0059ff] bg-[#0059ff]/5 shadow-[0_0_14px_-6px_rgba(0,89,255,0.5)]"
                  : "border-border hover:border-foreground/20 hover:bg-muted/50"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-mono font-semibold text-muted-foreground">{p.id}</span>
                    {frozen && <Lock className="w-3 h-3 text-[#0d2f96]" />}
                  </div>
                  <div className="text-sm font-semibold text-foreground truncate mt-0.5">{p.name}</div>
                </div>
                {score != null && (
                  <span className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    eligible ? "bg-[#e6f0ff] text-[#0d2f96]" : "bg-red-50 text-red-600"
                  }`}>
                    {score}
                  </span>
                )}
              </div>
              {p.tags && p.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {p.tags.slice(0, 3).map((t) => (
                    <span key={t} className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{t}</span>
                  ))}
                </div>
              )}
              {isSel && (
                <button
                  onClick={(e) => { e.stopPropagation(); onFreeze(family, p.id); }}
                  className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-[#0d2f96] hover:text-[#0059ff]"
                >
                  <Star className="w-3 h-3" />
                  {frozen ? "Frozen" : "Freeze selection"}
                </button>
              )}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
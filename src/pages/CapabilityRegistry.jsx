import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Boxes, FileCode2, Plug, Layers } from "lucide-react";
import { PROFILE_FAMILIES } from "./ProfileRegistry.jsx";

const STATIC_FAMILIES = [
  { entity: "GeneratorDefinition", label: "Generator Definitions", icon: Boxes, to: "/generators" },
  { entity: "TemplatePack", label: "Template Packs", icon: FileCode2, to: "/templates" },
  { entity: "AdapterDefinition", label: "Adapter Definitions", icon: Plug, to: "/adapters" },
];

export default function CapabilityRegistry() {
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const entries = [];
      for (const f of STATIC_FAMILIES) {
        try { entries.push([f.entity, await base44.entities[f.entity].count({})]); }
        catch { entries.push([f.entity, null]); }
      }
      for (const entity of Object.keys(PROFILE_FAMILIES)) {
        try { entries.push([entity, await base44.entities[entity].count({})]); }
        catch { entries.push([entity, null]); }
      }
      setCounts(Object.fromEntries(entries));
      setLoading(false);
    })();
  }, []);

  const all = [
    ...STATIC_FAMILIES.map((f) => ({ ...f, count: counts[f.entity] })),
    ...Object.entries(PROFILE_FAMILIES).map(([entity, fam]) => ({
      entity, label: fam.label, icon: fam.icon, to: `/registry/${entity}`, count: counts[entity],
    })),
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <div className="xa-icon-chip"><Layers className="w-5 h-5" /></div>
        <div>
          <h1 className="text-xl font-black font-heading">Universal Capability Registry</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Every definition family — versioned, first-class, composable. {all.length} families.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {all.map((f) => {
          const Icon = f.icon;
          return (
            <Link key={f.entity} to={f.to} className="xa-card p-4 hover:border-[#FFEA00] hover:shadow-[0_0_14px_-6px_rgba(255,234,0,0.5)] transition-all">
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4 text-[#CCBB00]" />
                <div className="font-heading font-bold text-sm">{f.label}</div>
              </div>
              <div className="text-2xl font-black font-heading">{loading ? "—" : (f.count ?? 0)}</div>
              <div className="text-xs text-muted-foreground">definitions</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
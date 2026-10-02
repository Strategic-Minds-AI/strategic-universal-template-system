import React from "react";
import { base44 } from "@/api/base44Client";
import { Boxes, Plus } from "lucide-react";
import EntityListPage, { StatusPill } from "@/components/factory/EntityListPage.jsx";
import { buildAllDefinitions } from "@/lib/factory/generator/seedDefinitions.js";

export default function GeneratorLibrary() {
  return (
    <EntityListPage
      title="Generator Library"
      subtitle="Versioned generator definitions — DAG-compiled, validation-gated, reproducible."
      icon={Boxes}
      badge="registry"
      load={() => base44.entities.GeneratorDefinition.filter({}, { sort: "-created_date", limit: 100 })}
      columns={[
        { label: "Name", render: (r) => <span className="font-semibold">{r.name}</span> },
        { label: "Key", field: "generator_key", render: (r) => <span className="font-mono text-xs text-muted-foreground">{r.generator_key}</span> },
        { label: "Category", field: "category", render: (r) => <span className="text-xs capitalize">{r.category}</span> },
        { label: "Version", field: "version", render: (r) => <span className="font-mono text-xs">v{r.version}</span> },
        { label: "Status", render: (r) => <StatusPill status={r.status} /> },
      ]}
      rowTo={(r) => `/studio?id=${r.id}`}
      emptyTitle="No generators yet"
      emptyHint="Seed the canonical registry to populate all generator definitions."
      actions={(reload) => (
        <button
          onClick={async () => {
            try {
              await base44.entities.GeneratorDefinition.bulkCreate(buildAllDefinitions());
              await reload();
            } catch (e) { alert("Seed failed: " + (e?.message || "unknown")); }
          }}
          className="xa-btn-primary text-xs"
          style={{ padding: "8px 12px" }}
        >
          <Plus className="w-3.5 h-3.5" /> Seed registry
        </button>
      )}
    />
  );
}
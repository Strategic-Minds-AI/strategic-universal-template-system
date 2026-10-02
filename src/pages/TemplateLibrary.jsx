import React from "react";
import { base44 } from "@/api/base44Client";
import { FileCode2, Plus } from "lucide-react";
import EntityListPage, { StatusPill } from "@/components/factory/EntityListPage.jsx";
import { buildAllTemplatePacks } from "@/lib/factory/generator/seedTemplatePacks.js";

export default function TemplateLibrary() {
  return (
    <EntityListPage
      title="Template Library"
      subtitle="Versioned template packs — text, file-tree, code, prompt, document, config, recipes."
      icon={FileCode2}
      load={() => base44.entities.TemplatePack.filter({}, { sort: "-created_date", limit: 100 })}
      columns={[
        { label: "Name", render: (r) => <span className="font-semibold">{r.name}</span> },
        { label: "Key", field: "template_key", render: (r) => <span className="font-mono text-xs text-muted-foreground">{r.template_key}</span> },
        { label: "Mode", field: "mode", render: (r) => <span className="text-xs capitalize">{r.mode}</span> },
        { label: "Version", field: "version", render: (r) => <span className="font-mono text-xs">v{r.version}</span> },
        { label: "Status", render: (r) => <StatusPill status={r.status} /> },
        { label: "Dependencies", render: (r) => <span className="text-xs text-muted-foreground">{(r.dependencies || []).length}</span> },
      ]}
      actions={(reload) => (
        <button
          onClick={async () => {
            try {
              await base44.entities.TemplatePack.bulkCreate(buildAllTemplatePacks());
              await reload();
            } catch (e) { alert("Seed failed: " + (e?.message || "unknown")); }
          }}
          className="xa-btn-primary text-xs"
          style={{ padding: "8px 12px" }}
        >
          <Plus className="w-3.5 h-3.5" /> Seed templates
        </button>
      )}
      emptyTitle="No template packs yet"
      emptyHint="Click Seed templates to populate all 124 packs from the registry."
    />
  );
}
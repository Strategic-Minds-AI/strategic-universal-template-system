import React from "react";
import { base44 } from "@/api/base44Client";
import { FileCode2 } from "lucide-react";
import EntityListPage, { StatusPill } from "@/components/factory/EntityListPage.jsx";

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
      emptyTitle="No template packs yet"
      emptyHint="Template packs are created in the studio or imported from the registry."
    />
  );
}
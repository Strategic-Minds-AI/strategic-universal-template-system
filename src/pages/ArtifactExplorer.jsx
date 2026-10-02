import React from "react";
import { base44 } from "@/api/base44Client";
import { Package } from "lucide-react";
import EntityListPage, { StatusPill } from "@/components/factory/EntityListPage.jsx";

export default function ArtifactExplorer() {
  return (
    <EntityListPage
      title="Artifact Explorer"
      subtitle="Generated artifact lineage — SHA-256 verified, dependency-tracked."
      icon={Package}
      load={() => base44.entities.Artifact.filter({}, { sort: "-created_date", limit: 100 })}
      columns={[
        { label: "Name", render: (r) => <span className="font-semibold">{r.name}</span> },
        { label: "Media Type", render: (r) => <span className="font-mono text-xs text-muted-foreground">{r.media_type}</span> },
        { label: "Step", field: "step_key", render: (r) => <span className="font-mono text-xs text-muted-foreground">{r.step_key || "—"}</span> },
        { label: "Size", render: (r) => r.size_bytes ? `${(r.size_bytes / 1024).toFixed(1)} KB` : "—" },
        { label: "Validation", render: (r) => <StatusPill status={r.validation_state} /> },
        { label: "SHA-256", render: (r) => <span className="font-mono text-xs text-muted-foreground">{r.sha256 ? `${r.sha256.slice(0, 12)}…` : "—"}</span> },
      ]}
      emptyTitle="No artifacts yet"
      emptyHint="Artifacts are produced when generators run."
    />
  );
}
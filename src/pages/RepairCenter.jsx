import React from "react";
import { base44 } from "@/api/base44Client";
import { Hammer } from "lucide-react";
import EntityListPage, { StatusPill } from "@/components/factory/EntityListPage.jsx";

export default function RepairCenter() {
  return (
    <EntityListPage
      title="Repair Center"
      subtitle="Targeted repair tasks — regenerate the smallest responsible step, preserve the rest."
      icon={Hammer}
      load={() => base44.entities.RepairTask.filter({}, { sort: "-created_date", limit: 100 })}
      columns={[
        { label: "Step", field: "target_step_key", render: (r) => <span className="font-mono text-xs font-semibold">{r.target_step_key}</span> },
        { label: "Failing Layer", field: "failing_layer", render: (r) => <span className="text-xs capitalize">{(r.failing_layer || "—").replace(/_/g, " ")}</span> },
        { label: "Status", render: (r) => <StatusPill status={r.status} /> },
        { label: "Attempt", render: (r) => <span className="text-xs text-muted-foreground">{r.attempt || 0}</span> },
        { label: "Run", render: (r) => <span className="font-mono text-xs text-muted-foreground">{r.run_id ? r.run_id.slice(0, 10) : "—"}</span> },
      ]}
      emptyTitle="No repair tasks"
      emptyHint="Repair tasks are created when validation fails and a responsible step is identified."
      subscribeEntity="RepairTask"
    />
  );
}
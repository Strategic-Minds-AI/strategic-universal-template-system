import React from "react";
import { base44 } from "@/api/base44Client";
import { ScrollText } from "lucide-react";
import EntityListPage, { StatusPill } from "@/components/factory/EntityListPage.jsx";

export default function AuditReceipts() {
  return (
    <EntityListPage
      title="Audit / Receipts"
      subtitle="Immutable audit trail of every actor, entity, and protected action."
      icon={ScrollText}
      load={() => base44.entities.AuditEvent.filter({}, { sort: "-created_date", limit: 100 })}
      columns={[
        { label: "Event", field: "event_type", render: (r) => <span className="font-mono text-xs font-semibold">{r.event_type}</span> },
        { label: "Entity", field: "entity_type", render: (r) => <span className="text-xs">{r.entity_type}</span> },
        { label: "Severity", render: (r) => <StatusPill status={r.severity} /> },
        { label: "Entity ID", render: (r) => <span className="font-mono text-xs text-muted-foreground">{r.entity_id ? r.entity_id.slice(0, 12) : "—"}</span> },
        { label: "Actor", render: (r) => <span className="font-mono text-xs text-muted-foreground">{r.actor_id ? r.actor_id.slice(0, 10) : "system"}</span> },
      ]}
      emptyTitle="No audit events"
      emptyHint="Every create, update, approval, and protected action is recorded here."
    />
  );
}
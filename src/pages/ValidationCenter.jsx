import React from "react";
import { base44 } from "@/api/base44Client";
import { ShieldCheck } from "lucide-react";
import EntityListPage, { StatusPill } from "@/components/factory/EntityListPage.jsx";

export default function ValidationCenter() {
  return (
    <EntityListPage
      title="Validation Center"
      subtitle="Independent validation receipts — PASS / FAIL / BLOCKED with evidence only."
      icon={ShieldCheck}
      load={() => base44.entities.RunValidation.filter({}, { sort: "-created_date", limit: 100 })}
      columns={[
        { label: "Layer", field: "validator_layer", render: (r) => <span className="font-semibold capitalize">{(r.validator_layer || "").replace(/_/g, " ")}</span> },
        { label: "Validator", field: "validator_id", render: (r) => <span className="font-mono text-xs text-muted-foreground">{r.validator_id}</span> },
        { label: "Result", render: (r) => <StatusPill status={r.status} /> },
        { label: "Mandatory", render: (r) => (r.mandatory ? <span className="text-xs font-bold text-foreground">Yes</span> : <span className="text-xs text-muted-foreground">No</span>) },
        { label: "Evidence", render: (r) => <span className="text-xs text-muted-foreground">{(r.evidence || []).length}</span> },
        { label: "Failures", render: (r) => <span className={`text-xs ${(r.failures || []).length ? "text-red-600 font-bold" : "text-muted-foreground"}`}>{(r.failures || []).length}</span> },
        { label: "Subject", render: (r) => <span className="font-mono text-xs text-muted-foreground">{r.subject_hash ? `${r.subject_hash.slice(0, 10)}…` : "—"}</span> },
      ]}
      emptyTitle="No validation receipts yet"
      emptyHint="Receipts are written when a generator run is validated."
      subscribeEntity="RunValidation"
    />
  );
}
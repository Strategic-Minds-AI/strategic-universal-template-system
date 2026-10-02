import React from "react";
import { base44 } from "@/api/base44Client";
import { Server } from "lucide-react";
import EntityListPage, { StatusPill } from "@/components/factory/EntityListPage.jsx";
import SectionPreviewBanner from "@/components/sectionRenders/SectionPreviewBanner.jsx";
import OperationsRender from "@/components/sectionRenders/OperationsRender.jsx";

export default function ProvisioningCenter() {
  return (
    <div>
      <div className="px-6 md:px-8 pt-6 md:pt-8 max-w-7xl mx-auto">
        <SectionPreviewBanner render={OperationsRender} label="Operations" />
      </div>
      <EntityListPage
        title="Provisioning Center"
        subtitle="Plan-first, approval-gated provisioning — no live mutation without operator approval."
        icon={Server}
        load={() => base44.entities.ProvisioningPlan.filter({}, { sort: "-created_date", limit: 100 })}
        columns={[
          { label: "Template", field: "template_id", render: (r) => <span className="font-mono text-xs font-semibold">{r.template_id}</span> },
          { label: "Status", render: (r) => <StatusPill status={r.status} /> },
          { label: "Dry Run", render: (r) => (r.dry_run ? <span className="text-xs font-bold text-amber-600">Yes</span> : <span className="text-xs text-muted-foreground">No</span>) },
          { label: "Actions", render: (r) => <span className="text-xs text-muted-foreground">{(r.actions || []).length}</span> },
          { label: "Risks", render: (r) => <span className={`text-xs ${(r.diff || []).length ? "text-amber-600 font-bold" : "text-muted-foreground"}`}>{(r.diff || []).length} diffs</span> },
          { label: "Project", render: (r) => <span className="font-mono text-xs text-muted-foreground">{r.project_id ? r.project_id.slice(0, 10) : "—"}</span> },
        ]}
        emptyTitle="No provisioning plans"
        emptyHint="Plans are produced by provisioning generators (dry-run by default)."
        subscribeEntity="ProvisioningPlan"
      />
    </div>
  );
}
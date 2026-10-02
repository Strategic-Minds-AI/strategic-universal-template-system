import { createClientFromRequest } from "npm:@base44/sdk@0.8.52";
import { vercelChat } from "../../shared/vercelAI.ts";

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();

    const eventType = String(body.event_type || "workflow_event").slice(0, 100);
    const entityType = String(body.entity_type || "Workflow").slice(0, 100);
    const entityId = String(body.entity_id || "system").slice(0, 100);
    const severity = ["info", "warn", "error", "critical"].includes(body.severity) ? body.severity : "info";

    let summary = "";
    if (body.draft_summary) {
      try {
        summary = await vercelChat({
          messages: [{ role: "user", content: String(body.draft_summary).slice(0, 4000) }],
        });
      } catch { /* AI summary is optional */ }
    }

    const payload = { ...(body.payload || {}), workflow_name: body.workflow_name, summary: summary.slice(0, 2000) };

    const event = await base44.entities.AuditEvent.create({
      event_type: eventType,
      entity_type: entityType,
      entity_id: entityId,
      severity,
      payload,
    });

    return Response.json({ id: event.id, event_type: eventType, summary: summary.slice(0, 500) });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
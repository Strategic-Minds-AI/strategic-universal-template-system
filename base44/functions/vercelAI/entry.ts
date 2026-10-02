// Vercel AI Gateway proxy — exposes the operator's Vercel AI Gateway as a
// backend function so the agent and frontend can route AI through it.
import { createClientFromRequest } from "npm:@base44/sdk@0.8.52";
import { vercelChat } from "../../shared/vercelAI.ts";

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const prompt = String(body.prompt || "");
    const messages = body.messages || [{ role: "user", content: prompt }];
    if (!Array.isArray(messages) || !messages.length || messages.length > 16 || messages.some((m) => !["user", "assistant"].includes(m.role) || typeof m.content !== "string" || m.content.length > 12000) || JSON.stringify(messages).length > 48000) return Response.json({ error: "Invalid or oversized AI request" }, { status: 400 });
    const content = await vercelChat({ messages, model: body.model, response_json_schema: body.response_json_schema });
    return Response.json({ content, via: "vercel-ai-gateway" });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
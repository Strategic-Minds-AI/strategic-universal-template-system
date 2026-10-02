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
    const prompt = String(body.prompt || "").slice(0, 8000);
    if (!prompt) return Response.json({ error: "prompt required" }, { status: 400 });

    const content = await vercelChat({
      messages: [{ role: "user", content: prompt }],
      model: body.model,
    });
    return Response.json({ content, via: "vercel-ai-gateway" });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
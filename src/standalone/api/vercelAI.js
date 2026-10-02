// standalone/api/vercelAI.js — Vercel serverless route. POST {prompt} or {messages}.
import { ai, verifyUser } from "./_sb.js";

export default async function (req) {
  try {
    if (!await verifyUser(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const b = await req.json();
    const messages = b.messages || [{ role: "user", content: b.prompt }];
    if (!Array.isArray(messages) || !messages.length || messages.length > 16 || messages.some((m) => !["user", "assistant"].includes(m.role) || typeof m.content !== "string" || m.content.length > 12000) || JSON.stringify(messages).length > 48000) return Response.json({ error: "Invalid or oversized AI request" }, { status: 400 });
    const content = await ai.chat(messages, b.model, b.response_json_schema);
    return Response.json({ content, via: "vercel-ai-gateway" });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
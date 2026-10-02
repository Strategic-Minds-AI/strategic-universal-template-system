// standalone/api/vercelAI.js — Vercel serverless route. POST {prompt} or {messages}.
import { ai, requireUser } from "./_sb.js";

export default async function (req) {
  try {
    if (!requireUser(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const b = await req.json();
    const messages = b.messages || [{ role: "user", content: b.prompt }];
    const content = await ai.chat(messages, b.model);
    return Response.json({ content, via: "vercel-ai-gateway" });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
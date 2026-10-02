import { createClientFromRequest } from "npm:@base44/sdk@0.8.52";
import { vercelChatAdvanced } from "../../shared/vercelAI.ts";
import { runOperator } from "../../shared/operatorRuntime.ts";

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    if (JSON.stringify(body).length > 110000) return Response.json({ error: "Conversation too large" }, { status: 400 });
    const result = await runOperator({
      messages: body.messages, context: body.context,
      entities: base44.entities, chat: vercelChatAdvanced,
      invoke: async (name, payload) => (await base44.functions.invoke(name, payload)).data,
    });
    return Response.json(result);
  } catch (e) { return Response.json({ error: e.message }, { status: 500 }); }
}
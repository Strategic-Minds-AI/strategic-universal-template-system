// Sole AI transport for this app. Never falls back to platform AI.
import { secrets } from "base44:runtime";

export async function vercelChatAdvanced({ messages, model, tools, tool_choice, response_json_schema, image = false }) {
  const key = secrets.get("VERCEL_AI_GATEWAY_KEY");
  if (!key) throw new Error("VERCEL_AI_GATEWAY_KEY is not configured");
  const base = (secrets.get("VERCEL_AI_GATEWAY_URL") || "https://ai-gateway.vercel.sh/v1").replace("ai-gateway.vercel.app", "ai-gateway.vercel.sh").replace(/\/+$/, "");
  const endpoint = new URL(base);
  if (endpoint.protocol !== "https:" || endpoint.hostname !== "ai-gateway.vercel.sh") throw new Error("Use the official Vercel AI Gateway URL");
  const body = {
    model: (model && model !== "automatic" ? model : null) || secrets.get(image ? "VERCEL_AI_GATEWAY_IMAGE_MODEL" : "VERCEL_AI_GATEWAY_MODEL") || (image ? "google/gemini-3.1-flash-image-preview" : "openai/gpt-4o-mini"),
    messages, stream: false,
    ...(image ? { modalities: ["text", "image"] } : { max_tokens: 4096 }),
  };
  if (tools?.length) { body.tools = tools; body.tool_choice = tool_choice || "auto"; }
  if (response_json_schema) body.response_format = { type: "json_schema", json_schema: { name: "factory_result", schema: response_json_schema } };
  const res = await fetch(`${base}/chat/completions`, {
    method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify(body), signal: AbortSignal.timeout(image ? 90000 : 60000),
  });
  if (!res.ok) throw new Error(`Vercel AI Gateway ${res.status}: ${(await res.text()).slice(0, 400)}`);
  const data = await res.json();
  const message = data?.choices?.[0]?.message;
  if (!message) throw new Error("Vercel AI Gateway returned no assistant message");
  return message;
}

export async function vercelChat(options) {
  const message = await vercelChatAdvanced(options);
  if (typeof message.content !== "string" || !message.content.trim()) throw new Error("Vercel AI Gateway returned an empty response");
  return message.content;
}

export async function vercelImage(prompt) {
  const message = await vercelChatAdvanced({ messages: [{ role: "user", content: prompt }], image: true });
  const url = message.images?.[0]?.image_url?.url;
  if (!url) throw new Error("Vercel AI Gateway returned no image");
  return url;
}
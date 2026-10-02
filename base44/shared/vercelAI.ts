// Shared Vercel AI Gateway client — OpenAI-compatible chat completions.
// Used by backend functions so all AI routes through the operator's Vercel AI
// Gateway instead of the platform AI (which is credit-limited this month).
import { secrets } from "base44:runtime";

export async function vercelChat({ messages, model }) {
  const key = secrets.get("VERCEL_AI_GATEWAY_KEY");
  if (!key) throw new Error("VERCEL_AI_GATEWAY_KEY secret is not set");
  const base = (secrets.get("VERCEL_AI_GATEWAY_URL") || "https://ai-gateway.vercel.app/v1").replace(/\/+$/, "");
  const mdl = model || secrets.get("VERCEL_AI_GATEWAY_MODEL") || "openai/gpt-4o-mini";

  const res = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: mdl, messages }),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Vercel AI Gateway ${res.status}: ${txt.slice(0, 400)}`);
  }
  const data = await res.json();
  return data?.choices?.[0]?.message?.content || "";
}
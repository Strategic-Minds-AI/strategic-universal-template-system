/* global process */
// standalone/api/generateLogo.js — Vercel route. POST {brandName, primaryColor, secondaryColor, style}.
// Uses the Vercel AI Gateway's image endpoint if available; otherwise returns a clear error
// so you can wire a dedicated image provider (fal.ai / OpenAI images).
import { requireUser } from "./_sb.js";

const IMG_URL = (process.env.VERCEL_AI_GATEWAY_URL || "https://ai-gateway.vercel.sh/v1").replace("ai-gateway.vercel.app", "ai-gateway.vercel.sh").replace(/\/+$/, "");
const IMG_KEY = process.env.VERCEL_AI_GATEWAY_KEY;
const IMG_MODEL = process.env.IMAGE_MODEL || "openai/dall-e-3";

export default async function (req) {
  try {
    if (!requireUser(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const b = await req.json();
    const brandName = String(b.brandName || "Strategic Minds").slice(0, 60);
    const primary = String(b.primaryColor || "#0059ff");
    const secondary = String(b.secondaryColor || "#0d2f96");
    const style = String(b.style || "modern minimalist geometric mark").slice(0, 140);
    const prompt = `A professional logo mark for the brand "${brandName}". Style: ${style}. Primary color ${primary}, accent ${secondary}. Clean vector-style emblem, centered on plain white, no photos, modern tech identity, high contrast.`;
    const r = await fetch(IMG_URL + "/images/generations", { method: "POST", headers: { Authorization: "Bearer " + IMG_KEY, "Content-Type": "application/json" }, body: JSON.stringify({ model: IMG_MODEL, prompt, n: 1, size: "1024x1024" }) });
    if (!r.ok) return Response.json({ error: "Image provider " + r.status + ": " + (await r.text()).slice(0, 300) + " — set IMAGE_MODEL / wire an image provider." }, { status: 502 });
    const d = await r.json();
    const url = d?.data?.[0]?.url || d?.url;
    if (!url) return Response.json({ error: "No image returned" }, { status: 502 });
    return Response.json({ url });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
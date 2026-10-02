// Viral Preset Generator — now routed through the operator's Vercel AI Gateway
// (shared/vercelAI.ts) instead of the platform Core AI.
import { createClientFromRequest } from "npm:@base44/sdk@0.8.52";
import { vercelChat } from "../../shared/vercelAI.ts";

const HEX = /^#[0-9a-fA-F]{6}$/;

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const count = Math.min(Math.max(parseInt(body.count || 6, 10) || 6, 1), 10);

    const prompt =
      `You are a viral brand color expert. Identify the most popular, trending, high-converting ` +
      `brand color palettes used by successful online brands right now. Return ${count} distinct viral color presets. ` +
      `Each preset must have a short catchy "name" (2-3 words), a "primary" hex color, and a "secondary" hex color. ` +
      `Prefer bold, modern, high-contrast pairs that perform well on landing pages and social media. ` +
      `Return ONLY a JSON object with this exact shape: {"presets":[{"name":"...","primary":"#rrggbb","secondary":"#rrggbb"}]}.`;

    const content = await vercelChat({
      messages: [{ role: "user", content: prompt }],
      model: body.model,
    });

    let presets = [];
    try {
      const parsed = JSON.parse(content);
      presets = (parsed && parsed.presets) || [];
    } catch {
      presets = [];
    }

    const clean = presets.slice(0, count).map((p) => ({
      name: String((p && p.name) || "Viral").slice(0, 40),
      primary: HEX.test(String(p && p.primary)) ? String(p.primary) : "#0059ff",
      secondary: HEX.test(String(p && p.secondary)) ? String(p.secondary) : "#0d2f96",
    }));

    return Response.json({ presets: clean, via: "vercel-ai-gateway" });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
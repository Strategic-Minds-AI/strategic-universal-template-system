// Viral Preset Generator — uses InvokeLLM with web context (add_context_from_internet)
// through the server-side AI gateway to fetch trending, high-converting brand
// color palettes online and return them as usable presets.
import { createClientFromRequest } from "npm:@base44/sdk@0.8.52";

const HEX = /^#[0-9a-fA-F]{6}$/;

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const count = Math.min(Math.max(parseInt(body.count || 6, 10) || 6, 1), 10);

    const prompt =
      `You are a viral brand color expert. Search the web for the most popular, trending, ` +
      `high-converting brand color palettes used by successful online brands right now (2026). ` +
      `Return ${count} distinct viral color presets. Each preset must have a short catchy "name" (2-3 words), ` +
      `a "primary" hex color, and a "secondary" hex color. Prefer bold, modern, high-contrast pairs that ` +
      `perform well on landing pages and social media. Return only JSON matching the schema.`;

    const res = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          presets: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                primary: { type: "string" },
                secondary: { type: "string" },
              },
              required: ["name", "primary", "secondary"],
            },
          },
        },
        required: ["presets"],
      },
    });

    let presets = [];
    if (res && Array.isArray(res.presets)) presets = res.presets;
    else if (typeof res === "string") {
      try {
        const parsed = JSON.parse(res);
        presets = (parsed && parsed.presets) || [];
      } catch {
        presets = [];
      }
    }

    const clean = presets.slice(0, count).map((p) => ({
      name: String((p && p.name) || "Viral").slice(0, 40),
      primary: HEX.test(String(p && p.primary)) ? String(p.primary) : "#0059ff",
      secondary: HEX.test(String(p && p.secondary)) ? String(p.secondary) : "#0d2f96",
    }));

    return Response.json({ presets: clean });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
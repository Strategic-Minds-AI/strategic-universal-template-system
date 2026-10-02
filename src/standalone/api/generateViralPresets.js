// standalone/api/generateViralPresets.js — Vercel route. POST {count}.
import { ai, requireUser } from "./_sb.js";

export default async function (req) {
  try {
    if (!requireUser(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const b = await req.json();
    const count = Math.min(Math.max(parseInt(b.count, 10) || 5, 1), 10);
    const prompt = `Generate ${count} viral brand color presets. Return ONLY JSON: {"presets":[{"name":string,"primary":hex,"secondary":hex}]}. Bold, high-contrast, modern.`;
    const content = await ai.chat([{ role: "user", content: prompt }]);
    let presets = [];
    try {
      let s = (content || "").trim();
      const f = s.match(/```(?:json)?\s*([\s\S]*?)```/i); if (f) s = f[1].trim();
      const a = s.indexOf("{"), z = s.lastIndexOf("}"); if (a >= 0 && z > a) s = s.slice(a, z + 1);
      presets = (JSON.parse(s).presets) || [];
    } catch { presets = []; }
    return Response.json({ presets, via: "vercel-ai-gateway" });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
// Logo generation through the same server-side Vercel AI Gateway.
import { verifyUser, ai } from "./_sb.js";

export default async function (req) {
  try {
    if (!await verifyUser(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const b = await req.json();
    const brandName = String(b.brandName || "Strategic Minds").slice(0, 60);
    const primary = String(b.primaryColor || "#0059ff");
    const secondary = String(b.secondaryColor || "#0d2f96");
    const style = String(b.style || "modern minimalist geometric mark").slice(0, 140);
    const prompt = `A professional logo mark for the brand "${brandName}". Style: ${style}. Primary color ${primary}, accent ${secondary}. Clean vector-style emblem, centered on plain white, no photos, modern tech identity, high contrast.`;
    const url = await ai.image(prompt);
    return Response.json({ url, via: "vercel-ai-gateway" });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
// AI Logo Generator — runs GenerateImage through the server-side AI gateway
// (base44.asServiceRole.integrations.Core) so credentials stay server-side and
// the call is governed. Returns a public image URL.
import { createClientFromRequest } from "npm:@base44/sdk@0.8.52";

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const brandName = String(body.brandName || "Strategic Minds").slice(0, 60);
    const primary = String(body.primaryColor || "#0059ff");
    const secondary = String(body.secondaryColor || "#0d2f96");
    const style = String(body.style || "modern minimalist geometric mark").slice(0, 140);

    const prompt =
      `A professional logo mark for the brand "${brandName}". Style: ${style}. ` +
      `Use a primary color of ${primary} and an accent of ${secondary}. ` +
      `Clean, scalable vector-style emblem, centered on a plain white background, ` +
      `no photographic elements, modern tech brand identity, high contrast.`;

    const res = await base44.asServiceRole.integrations.Core.GenerateImage({ prompt });
    return Response.json({ url: res.url });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
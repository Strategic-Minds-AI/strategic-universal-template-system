// AI media generation — images via Vercel AI Gateway, videos via Core GenerateVideo.
// Both are server-side only (Core routing rule + Vercel AI Gateway transport).
import { createClientFromRequest } from "npm:@base44/sdk@0.8.52";
import { vercelImage } from "../../shared/vercelAI.ts";

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const kind = String(body.kind || "image"); // "image" | "video"

    if (kind === "image") {
      const prompt = String(body.prompt || "").slice(0, 1000);
      if (!prompt) return Response.json({ error: "prompt required" }, { status: 400 });
      const url = await vercelImage(prompt);
      return Response.json({ kind: "image", via: "vercel-ai-gateway", url });
    }

    if (kind === "video") {
      const prompt = String(body.prompt || "").slice(0, 1000);
      if (!prompt) return Response.json({ error: "prompt required" }, { status: 400 });
      const duration = [4, 6, 8].includes(body.duration) ? body.duration : 6;
      const aspectRatio = body.aspect_ratio === "9:16" ? "9:16" : "16:9";
      const genAudio = body.generate_audio === true;

      const result = await base44.asServiceRole.integrations.Core.GenerateVideo({
        prompt,
        duration,
        aspect_ratio: aspectRatio,
        generate_audio: genAudio,
      });
      const url = result?.url;
      if (!url) return Response.json({ error: "Video generation returned no URL" }, { status: 500 });
      return Response.json({ kind: "video", via: "core-generate-video", url, duration, aspect_ratio: aspectRatio });
    }

    return Response.json({ error: "kind must be 'image' or 'video'" }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
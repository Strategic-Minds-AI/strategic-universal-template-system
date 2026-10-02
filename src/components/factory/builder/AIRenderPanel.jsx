import React, { useState } from "react";
import { Brain, Image, Video, Loader2, Sparkles, Download, Wand2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

// AI visual render panel — generate images and videos via the generateMedia
// backend function (Vercel AI Gateway for images, Core GenerateVideo for videos).
export default function AIRenderPanel({ onUseInPreview }) {
  const [kind, setKind] = useState("image"); // "image" | "video"
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [duration, setDuration] = useState(6);
  const [genAudio, setGenAudio] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const presets = [
    { label: "Hero Background", prompt: "A wide cinematic hero background image for a modern tech website, abstract blue gradient with flowing geometric shapes, premium and clean, high resolution" },
    { label: "Product Shot", prompt: "A professional product photography shot of a sleek modern tech device on a minimalist white pedestal, studio lighting, blue accent reflections, premium brand aesthetic" },
    { label: "Team Photo", prompt: "A professional diverse team working in a bright modern office, candid collaboration, natural lighting, corporate photography style" },
    { label: "Abstract Pattern", prompt: "An abstract geometric pattern with flowing blue and white shapes, modern minimalist design, suitable for a website background, seamless and elegant" },
  ];

  const videoPresets = [
    { label: "Product Reveal", prompt: "A cinematic product reveal video, sleek modern tech product on a pedestal, dramatic studio lighting, slow camera rotation, premium luxury aesthetic" },
    { label: "App Demo", prompt: "A mobile app demo video, clean modern interface on a smartphone, smooth animated transitions, blue accent colors, professional product demo" },
    { label: "Brand Story", prompt: "A cinematic brand story film, modern city skyline at dawn transitioning to professionals collaborating, warm golden hour lighting, inspiring tone" },
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await base44.functions.invoke("generateMedia", {
        kind,
        prompt: prompt.trim(),
        aspect_ratio: aspectRatio,
        duration,
        generate_audio: genAudio,
      });
      const data = res?.data || res;
      if (data?.error) throw new Error(data.error);
      setResult(data);
      if (onUseInPreview && data?.url) onUseInPreview(data.url, kind);
    } catch (e) {
      setError(e?.message || "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-border">
        <div className="flex items-center gap-2 mb-2">
          <Brain className="w-4 h-4 text-[#0d2f96]" />
          <h2 className="text-xs font-bold uppercase tracking-wider">AI Visual Render</h2>
        </div>
        <p className="text-[10px] text-muted-foreground">Generate images & videos via Vercel AI Gateway + Veo 3</p>
      </div>

      <div className="flex gap-1 p-2 border-b border-border">
        <button onClick={() => setKind("image")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
            kind === "image" ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted"
          }`}><Image className="w-3.5 h-3.5" /> Image</button>
        <button onClick={() => setKind("video")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
            kind === "video" ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted"
          }`}><Video className="w-3.5 h-3.5" /> Video</button>
      </div>

      <div className="flex-1 overflow-y-auto xa-scroll p-3 space-y-3">
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">Prompt</label>
          <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={4}
            placeholder={kind === "image" ? "Describe the image to generate..." : "Describe the video to generate..."}
            className="w-full text-xs rounded-lg border border-input bg-background p-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">Quick Presets</label>
          <div className="flex flex-wrap gap-1.5">
            {(kind === "image" ? presets : videoPresets).map((p) => (
              <button key={p.label} onClick={() => setPrompt(p.prompt)}
                className="text-[10px] font-semibold px-2 py-1 rounded-full border border-border text-muted-foreground hover:border-[#0059ff] hover:text-[#0d2f96] transition-colors">
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {kind === "video" && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground w-16">Aspect</label>
              <div className="flex gap-1">
                {["16:9", "9:16"].map((ar) => (
                  <button key={ar} onClick={() => setAspectRatio(ar)}
                    className={`px-2 py-1 rounded text-[10px] font-semibold ${aspectRatio === ar ? "bg-[#0059ff] text-black" : "text-muted-foreground border border-border"}`}>{ar}</button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground w-16">Duration</label>
              <div className="flex gap-1">
                {[4, 6, 8].map((d) => (
                  <button key={d} onClick={() => setDuration(d)}
                    className={`px-2 py-1 rounded text-[10px] font-semibold ${duration === d ? "bg-[#0059ff] text-black" : "text-muted-foreground border border-border"}`}>{d}s</button>
                ))}
              </div>
            </div>
            <label className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground cursor-pointer">
              <input type="checkbox" checked={genAudio} onChange={(e) => setGenAudio(e.target.checked)} className="accent-[#0059ff]" />
              Generate audio
            </label>
          </div>
        )}

        <button onClick={handleGenerate} disabled={loading || !prompt.trim()}
          className="xa-btn-primary w-full text-xs" style={{ padding: "10px 14px" }}>
          {loading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating {kind}...</> : <><Wand2 className="w-3.5 h-3.5" /> Generate {kind === "image" ? "Image" : "Video"}</>}
        </button>

        {error && <div className="text-xs text-red-600 bg-red-50 rounded-lg p-2">{error}</div>}

        {result?.url && !loading && (
          <div className="space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Result</div>
            {kind === "image" ? (
              <img src={result.url} alt="AI generated" className="w-full rounded-lg border border-border" />
            ) : (
              <video src={result.url} controls className="w-full rounded-lg border border-border" />
            )}
            <a href={result.url} download className="flex items-center justify-center gap-1.5 text-xs font-semibold text-[#0d2f96] hover:underline">
              <Download className="w-3 h-3" /> Download {kind}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
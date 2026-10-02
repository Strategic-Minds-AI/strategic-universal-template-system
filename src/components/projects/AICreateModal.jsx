import React, { useState } from "react";
import { Brain, Loader2, Sparkles, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { REGISTRY_VERSION } from "@/lib/factory/registry/index.js";

// AI-powered project creation: user describes their vision, AI generates
// a structured project config via the Vercel AI Gateway.
export default function AICreateModal({ open, onClose, onCreated }) {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    if (!description.trim()) return;
    setLoading(true); setError("");
    try {
      // Step 1: AI generates project config from description.
      const aiRes = await base44.functions.invoke("vercelAI", {
        prompt: `You are a product strategist. Based on this description, generate a project configuration as JSON. Description: "${description}". Return ONLY valid JSON with fields: name (string), company (string), industry (string), product_archetype (string), platforms (array of strings from ["mobile-web","desktop-web","mobile-native"]), primary_goal (string from ["lead_generation","sales","engagement","brand_awareness","content_delivery","automation"]), primary_conversion (string from ["lead","signup","purchase","subscribe","download","contact"]), summary (string, 1-2 sentences). No markdown, no explanation, just the JSON object.`,
        response_json_schema: {
          type: "object",
          properties: {
            name: { type: "string" },
            company: { type: "string" },
            industry: { type: "string" },
            product_archetype: { type: "string" },
            platforms: { type: "array", items: { type: "string" } },
            primary_goal: { type: "string" },
            primary_conversion: { type: "string" },
            summary: { type: "string" },
          },
          required: ["name", "industry", "platforms", "primary_goal", "primary_conversion"],
        },
      });
      const config = typeof aiRes?.data === "string" ? JSON.parse(aiRes.data) : aiRes?.data || aiRes;

      // Step 2: Create the project with AI-generated config.
      const rec = await base44.entities.Project.create({
        name: config.name || "AI Generated Project",
        company: config.company || "",
        industry: config.industry || "",
        product_archetype: config.product_archetype || "",
        platforms: config.platforms || ["mobile-web", "desktop-web"],
        primary_goal: config.primary_goal || "lead_generation",
        primary_conversion: config.primary_conversion || "lead",
        seed: "uff-" + Date.now(),
        registry_version: REGISTRY_VERSION,
        quality_profile: "ceiling",
        status: "draft",
        mode: "auto-compose",
        summary: config.summary || "",
        intake: { ai_generated: true, description: description.slice(0, 500) },
      });
      onCreated(rec);
      setDescription("");
      onClose();
    } catch (e) {
      setError(e?.message || "AI generation failed");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="xa-card max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-[#0d2f96]" />
            <h2 className="text-lg font-bold font-heading">AI Project Creation</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-muted"><X className="w-4 h-4" /></button>
        </div>
        <p className="text-sm text-muted-foreground mb-4">Describe your project vision. AI will generate a structured config — name, industry, platforms, goals, and summary.</p>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="e.g. A mobile-first fitness tracking app for gyms, with workout logging, progress charts, and social challenges..."
          className="w-full text-sm rounded-lg border border-input bg-background p-3 resize-none focus:outline-none focus:ring-2 focus:ring-ring mb-4"
        />
        {error && <div className="text-xs text-red-600 bg-red-50 rounded-lg p-2 mb-3">{error}</div>}
        <div className="flex gap-2">
          <button onClick={onClose} className="xa-btn-outline text-xs flex-1" style={{ padding: "10px 14px" }}>Cancel</button>
          <button onClick={handleCreate} disabled={loading || !description.trim()} className="xa-btn-primary text-xs flex-1" style={{ padding: "10px 14px" }}>
            {loading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating...</> : <><Sparkles className="w-3.5 h-3.5" /> Generate & Create</>}
          </button>
        </div>
      </div>
    </div>
  );
}
import React from "react";
import { Brain, RefreshCw } from "lucide-react";

// Ceiling AI insights: calls the Vercel AI Gateway via the existing vercelAI
// backend function to produce a natural-language system health summary,
// anomaly detection, and predictive recommendations.
export default function AIInsightsPanel({ insights, loading, onRefresh }) {
  return (
    <div className="xa-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-[#0d2f96]" />
          <h2 className="text-sm font-bold uppercase tracking-wide">AI Insights</h2>
        </div>
        <button onClick={onRefresh} disabled={loading} className="p-1.5 rounded-lg border border-input hover:bg-muted transition-colors disabled:opacity-50" title="Refresh insights">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>
      {loading && !insights ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <div key={i} className="h-3 bg-muted rounded animate-pulse" style={{ width: `${90 - i * 15}%` }} />)}
        </div>
      ) : insights ? (
        <div className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">{insights}</div>
      ) : (
        <button onClick={onRefresh} className="text-xs text-[#0d2f96] font-semibold underline">Generate AI insights</button>
      )}
    </div>
  );
}
import React from "react";
import { Activity, Zap, AlertTriangle, CheckCircle, XCircle, FileText } from "lucide-react";

// Ceiling live activity stream: merges runs + audit events, sorted by time.
// Updates in real-time via the parent hook's entity subscriptions.
export default function LiveActivityStream({ feed, live }) {
  const iconFor = (item) => {
    if (item.type === "run") {
      if (item.status === "PASSED") return <CheckCircle className="w-3.5 h-3.5 text-green-600" />;
      if (item.status === "FAILED") return <XCircle className="w-3.5 h-3.5 text-red-600" />;
      return <Activity className="w-3.5 h-3.5 text-blue-600" />;
    }
    if (item.type === "audit") {
      if (item.severity === "error" || item.severity === "critical") return <AlertTriangle className="w-3.5 h-3.5 text-red-600" />;
      if (item.severity === "warn") return <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />;
      return <FileText className="w-3.5 h-3.5 text-gray-400" />;
    }
    return <Zap className="w-3.5 h-3.5 text-[#0d2f96]" />;
  };

  const labelFor = (item) => {
    if (item.type === "run") return `${item.generator_key || "run"} v${item.generator_version || "?"}`;
    if (item.type === "audit") return `${item.event_type || "event"} · ${item.entity_type || ""}`;
    return "activity";
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="xa-card p-5 lg:col-span-2">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#0d2f96]" />
          <h2 className="text-sm font-bold uppercase tracking-wide">Live Activity</h2>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${live ? "bg-green-500 animate-pulse" : "bg-gray-300"}`} />
          <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{live ? "Live" : "Snapshot"}</span>
        </div>
      </div>
      {feed.length === 0 ? (
        <div className="text-sm text-muted-foreground py-8 text-center">No activity yet.</div>
      ) : (
        <div className="space-y-1.5 max-h-72 overflow-y-auto xa-scroll">
          {feed.map((item, i) => (
            <div key={i} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-muted transition-colors">
              {iconFor(item)}
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold truncate">{labelFor(item)}</div>
                <div className="text-[10px] text-muted-foreground font-mono">{item.id?.slice(0, 12) || ""}</div>
              </div>
              {item.status && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  item.status === "PASSED" ? "text-green-600 bg-green-50" :
                  item.status === "FAILED" ? "text-red-600 bg-red-50" :
                  "text-gray-500 bg-gray-50"
                }`}>{item.status}</span>
              )}
              <span className="text-[10px] text-muted-foreground whitespace-nowrap">{timeAgo(item.created_date)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
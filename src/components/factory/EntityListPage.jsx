import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, RefreshCw, Inbox } from "lucide-react";
import { base44 } from "@/api/base44Client";

export function StatusPill({ status }) {
  const map = {
    PASSED: "text-[#0d2f96] bg-[#e6f0ff]", PASS: "text-[#0d2f96] bg-[#e6f0ff]",
    FAILED: "text-red-600 bg-red-50", FAIL: "text-red-600 bg-red-50",
    BLOCKED: "text-amber-600 bg-amber-50",
    RUNNING: "text-blue-600 bg-blue-50",
    pending: "text-amber-600 bg-amber-50",
    approved: "text-[#0d2f96] bg-[#e6f0ff]",
    rejected: "text-red-600 bg-red-50",
    open: "text-amber-600 bg-amber-50",
    in_progress: "text-blue-600 bg-blue-50",
    applied: "text-blue-600 bg-blue-50",
    verified: "text-[#0d2f96] bg-[#e6f0ff]",
    healthy: "text-green-600 bg-green-50",
    not_configured: "text-amber-600 bg-amber-50",
    degraded: "text-amber-600 bg-amber-50",
    unhealthy: "text-red-600 bg-red-50",
    disabled: "text-gray-500 bg-gray-50",
    draft: "text-gray-500 bg-gray-50",
    validated: "text-blue-600 bg-blue-50",
    executing: "text-blue-600 bg-blue-50",
    complete: "text-green-600 bg-green-50",
    unvalidated: "text-gray-500 bg-gray-50",
    valid: "text-[#0d2f96] bg-[#e6f0ff]",
    invalid: "text-red-600 bg-red-50",
    info: "text-gray-500 bg-gray-50",
    warn: "text-amber-600 bg-amber-50",
    error: "text-red-600 bg-red-50",
    critical: "text-red-600 bg-red-50",
  };
  const cls = map[status] || "text-gray-500 bg-gray-50";
  return <span className={`text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${cls}`}>{String(status || "—").replace(/_/g, " ")}</span>;
}

export default function EntityListPage({ title, subtitle, icon: Icon, badge, load, columns, getRowId, rowTo, onRowClick, emptyTitle, emptyHint, actions, footer, subscribeEntity }) {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [live, setLive] = useState(false);
  const reloadRef = useRef(null);

  const reload = async () => {
    setLoading(true); setError(null);
    try {
      const res = await load();
      setItems(Array.isArray(res) ? res : (res.items || []));
    } catch (e) {
      setError(e?.message || "Load failed");
    } finally { setLoading(false); }
  };
  reloadRef.current = reload;

  useEffect(() => { reload(); /* mount only */ }, []);

  // Real-time subscription — ceiling: live updates, not polling.
  useEffect(() => {
    if (!subscribeEntity) return;
    let unsub;
    try {
      unsub = base44.entities[subscribeEntity]?.subscribe?.(() => {
        setLive(true);
        reloadRef.current?.();
      });
    } catch { /* best-effort */ }
    return () => { try { unsub?.(); } catch {} };
  }, [subscribeEntity]);

  const filtered = query
    ? items.filter((r) => columns.some((c) => {
        const v = c.value ? c.value(r) : r[c.field];
        return String(v ?? "").toLowerCase().includes(query.toLowerCase());
      }))
    : items;

  const actionsNode = typeof actions === "function" ? actions(reload) : actions;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-5 gap-4 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          {Icon && <div className="xa-icon-chip shrink-0"><Icon className="w-5 h-5" /></div>}
          <div className="min-w-0">
            <h1 className="text-xl font-black font-heading flex items-center gap-2">{title}{badge && <span className="xa-pill-badge" style={{ fontSize: 10 }}>{badge}</span>}</h1>
            {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {actionsNode}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter..." className="pl-8 pr-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring w-44" />
          </div>
          {subscribeEntity && (
            <div className="flex items-center gap-1 mr-1">
              <span className={`w-2 h-2 rounded-full ${live ? "bg-green-500 animate-pulse" : "bg-gray-300"}`} />
              <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{live ? "Live" : "Snap"}</span>
            </div>
          )}
          <button onClick={reload} className="p-2 rounded-lg border border-input hover:bg-muted transition-colors" title="Reload"><RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /></button>
        </div>
      </div>

      {error ? (
        <div className="xa-card p-6 text-center text-sm text-red-600">{error}</div>
      ) : loading ? (
        <div className="xa-card p-6 text-center text-sm text-muted-foreground">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="xa-card xa-card-subtle p-12 text-center">
          <Inbox className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
          <div className="text-sm font-semibold">{emptyTitle || "Nothing here yet"}</div>
          {emptyHint && <div className="text-xs text-muted-foreground mt-1">{emptyHint}</div>}
        </div>
      ) : (
        <div className="xa-card overflow-hidden">
          <div className="overflow-x-auto xa-scroll">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-muted-foreground">
                <tr>
                  {columns.map((c) => <th key={c.key || c.label} className="text-left font-semibold text-xs uppercase tracking-wider px-4 py-2.5 whitespace-nowrap">{c.label}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((r) => {
                  const id = getRowId ? getRowId(r) : r.id;
                  const clickable = rowTo || onRowClick;
                  const handle = rowTo ? () => navigate(rowTo(r)) : onRowClick;
                  return (
                    <tr key={id} className={clickable ? "cursor-pointer hover:bg-muted/50 transition-colors" : ""} onClick={clickable ? handle : undefined}>
                      {columns.map((c) => (
                        <td key={c.key || c.label} className="px-4 py-2.5 align-top">
                          {c.render ? c.render(r) : <span className={c.mono ? "font-mono text-xs text-muted-foreground" : "text-foreground"}>{c.value ? c.value(r) : (r[c.field] ?? "—")}</span>}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {footer && <div className="mt-4">{footer}</div>}
    </div>
  );
}
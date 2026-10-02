import React, { useEffect, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { CheckSquare, Check, X } from "lucide-react";
import { StatusPill } from "@/components/factory/EntityListPage.jsx";

export default function Approvals() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const page = await base44.entities.Approval.filter({}, { sort: "-created_date", limit: 100 });
      setItems(page.items || []);
    } catch (e) { /* empty */ }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Real-time: reload on approval changes.
  useEffect(() => {
    let unsub;
    try { unsub = base44.entities.Approval?.subscribe?.(() => load()); } catch { /* */ }
    return () => { try { unsub?.(); } catch {} };
  }, [load]);

  const resolve = async (id, status) => {
    setBusy(id);
    try {
      await base44.entities.Approval.update(id, { status, resolved_at: new Date().toISOString() });
      await load();
    } catch (e) {
      alert("Failed to resolve: " + (e?.message || "unknown error"));
    }
    setBusy(null);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <div className="xa-icon-chip"><CheckSquare className="w-5 h-5" /></div>
        <div>
          <h1 className="text-xl font-black font-heading">Approvals</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Protected-action gate. No production mutation without operator resolution.</p>
        </div>
      </div>
      {loading ? (
        <div className="xa-card p-6 text-center text-sm text-muted-foreground">Loading…</div>
      ) : items.length === 0 ? (
        <div className="xa-card xa-card-subtle p-12 text-center">
          <div className="text-sm font-semibold">No approval requests</div>
          <div className="text-xs text-muted-foreground mt-1">Protected actions (deploy, DNS, schema migration, spend) create requests here.</div>
        </div>
      ) : (
        <div className="xa-card overflow-hidden">
          <div className="overflow-x-auto xa-scroll">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-muted-foreground">
                <tr>
                  <th className="text-left font-semibold text-xs uppercase px-4 py-2.5">Action</th>
                  <th className="text-left font-semibold text-xs uppercase px-4 py-2.5">Risk</th>
                  <th className="text-left font-semibold text-xs uppercase px-4 py-2.5">Status</th>
                  <th className="text-left font-semibold text-xs uppercase px-4 py-2.5">Resolved</th>
                  <th className="text-right font-semibold text-xs uppercase px-4 py-2.5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((a) => (
                  <tr key={a.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-2.5 font-mono text-xs">{a.action_key}</td>
                    <td className="px-4 py-2.5"><span className="text-xs font-bold px-2 py-0.5 rounded-full bg-muted">{a.risk_class}</span></td>
                    <td className="px-4 py-2.5"><StatusPill status={a.status} /></td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground whitespace-nowrap">{a.resolved_at ? new Date(a.resolved_at).toLocaleString() : "—"}</td>
                    <td className="px-4 py-2.5 text-right">
                      {a.status === "pending" ? (
                        <div className="flex gap-1.5 justify-end">
                          <button disabled={busy === a.id} onClick={() => resolve(a.id, "approved")} className="xa-btn-primary text-xs" style={{ padding: "6px 10px" }}><Check className="w-3.5 h-3.5" />Approve</button>
                          <button disabled={busy === a.id} onClick={() => resolve(a.id, "rejected")} className="xa-btn-outline text-xs" style={{ padding: "6px 10px" }}><X className="w-3.5 h-3.5" />Reject</button>
                        </div>
                      ) : <span className="text-xs text-muted-foreground">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
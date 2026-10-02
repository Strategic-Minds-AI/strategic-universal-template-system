import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { BarChart, Bar } from "recharts";

// Ceiling time-series: server-side aggregate({dateBucket}) fed into Recharts.
// Two charts — run throughput (area) and validation trend (stacked bar).
export function ThroughputChart({ data }) {
  const chartData = data.map((d) => ({
    date: d.date?.split("T")[0]?.slice(5) || d.date,
    Passed: d.passed,
    Failed: d.failed,
    Other: d.other,
  }));
  return (
    <div className="xa-card p-5">
      <h2 className="text-sm font-bold uppercase tracking-wide mb-4">Run Throughput (7d)</h2>
      {chartData.length === 0 ? (
        <div className="text-sm text-muted-foreground py-8 text-center">No run data yet.</div>
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
            <defs>
              <linearGradient id="gradPass" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradFail" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Area type="monotone" dataKey="Passed" stroke="#16a34a" fill="url(#gradPass)" strokeWidth={2} />
            <Area type="monotone" dataKey="Failed" stroke="#dc2626" fill="url(#gradFail)" strokeWidth={2} />
            <Area type="monotone" dataKey="Other" stroke="#0059ff" fill="#0059ff20" strokeWidth={1.5} />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export function ValidationTrendChart({ data }) {
  const chartData = data.map((d) => ({
    date: d.date?.split("T")[0]?.slice(5) || d.date,
    Pass: d.pass,
    Fail: d.fail,
    Blocked: d.blocked,
  }));
  return (
    <div className="xa-card p-5">
      <h2 className="text-sm font-bold uppercase tracking-wide mb-4">Validation Trend (7d)</h2>
      {chartData.length === 0 ? (
        <div className="text-sm text-muted-foreground py-8 text-center">No validation data yet.</div>
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Bar dataKey="Pass" stackId="a" fill="#16a34a" />
            <Bar dataKey="Fail" stackId="a" fill="#dc2626" />
            <Bar dataKey="Blocked" stackId="a" fill="#f59e0b" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
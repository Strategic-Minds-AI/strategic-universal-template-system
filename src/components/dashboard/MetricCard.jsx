import React from "react";
import { Link } from "react-router-dom";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

// Ceiling metric card: value + inline SVG sparkline trend + delta indicator.
// No extra package — sparkline is a pure SVG polyline.
export default function MetricCard({ label, value, icon: Icon, to, hint, sparkline, loading }) {
  const trend = sparkline && sparkline.length >= 2 ? sparkline[sparkline.length - 1] - sparkline[0] : 0;
  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
  const trendColor = trend > 0 ? "text-green-600" : trend < 0 ? "text-red-600" : "text-gray-400";

  // Build inline SVG sparkline polyline from sparkline data.
  const sparkPath = React.useMemo(() => {
    if (!sparkline || sparkline.length < 2) return null;
    const max = Math.max(...sparkline, 1);
    const min = Math.min(...sparkline, 0);
    const range = max - min || 1;
    const w = 80, h = 24, pad = 2;
    const stepX = (w - pad * 2) / (sparkline.length - 1);
    return sparkline.map((v, i) => {
      const x = pad + i * stepX;
      const y = h - pad - ((v - min) / range) * (h - pad * 2);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(" ");
  }, [sparkline]);

  return (
    <Link to={to} className="xa-card p-4 hover:shadow-md transition-shadow group">
      <div className="flex items-start justify-between mb-1">
        <Icon className="w-5 h-5 text-[#0d2f96]" />
        {sparkline && sparkline.length >= 2 && (
          <div className={`flex items-center gap-0.5 text-[10px] font-bold ${trendColor}`}>
            <TrendIcon className="w-3 h-3" />
            {trend !== 0 && <span>{Math.abs(trend)}</span>}
          </div>
        )}
      </div>
      <div className="text-2xl font-black font-heading">{loading ? "—" : (value ?? 0)}</div>
      <div className="text-xs text-muted-foreground font-medium">{label}</div>
      {sparkPath && (
        <div className="mt-1.5">
          <svg width="80" height="24" viewBox="0 0 80 24" className="overflow-visible">
            <path d={sparkPath} fill="none" stroke="#0059ff" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
          </svg>
        </div>
      )}
      {hint && !sparkline && <div className="text-[10px] text-muted-foreground mt-0.5">{hint}</div>}
    </Link>
  );
}
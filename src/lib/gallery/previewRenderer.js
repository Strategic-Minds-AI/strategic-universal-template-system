// Maps each factory template to a live HTML screen rendered from the brand
// mini-UI kit. All visible copy is driven by the studio config (ctx) so the
// Template Studio can rebrand/recontent every preview live.
import desktopPatterns from "@/lib/factory/registry/patterns/desktop_patterns.json";
import mobilePatterns from "@/lib/factory/registry/patterns/mobile_patterns.json";
import experienceRecipes from "@/lib/factory/registry/patterns/experience_recipes.json";
import { DEFAULT_CONFIG } from "./studioConfig.js";

export const GALLERY_FAMILIES = [
  { key: "desktop", label: "Desktop Archetypes", platform: "desktop", items: desktopPatterns },
  { key: "mobile", label: "Mobile Archetypes", platform: "mobile", items: mobilePatterns },
  { key: "recipes", label: "Experience Recipes", platform: "recipe", items: experienceRecipes },
];

const PHONE = { w: 300, h: 600 };
const BROWSER = { w: 760, h: 460 };

const ctxd = (config) => ({ ...DEFAULT_CONFIG, ...config });

const logo = (ctx) => {
  const parts = String(ctx.logoText || "Strategic Minds").trim().split(/\s+/);
  if (parts.length < 2) return `<span class="logo">${parts[0] || ""}</span>`;
  const last = parts.pop();
  return `<span class="logo">${parts.join(" ")} <b>${last}</b></span>`;
};

const nav = (ctx, active, tabs = ["Dashboard", "Projects", "Reports"]) =>
  `<div class="vg-nav">${logo(ctx)}${tabs
    .map((t) => `<span class="vg-tab ${t === active ? "on" : ""}">${t}</span>`)
    .join("")}<div style="flex:1"></div><span class="vg-avatar"></span></div>`;

const phoneNav = (ctx) =>
  `<div class="vg-nav" style="justify-content:space-between">${logo(ctx)}<span class="vg-avatar"></span></div>`;

const tabbar = (tabs, active = 0) =>
  `<div class="vg-tabbar">${tabs
    .map((t, i) => `<div class="t ${i === active ? "on" : ""}"><div class="d"></div><span>${t}</span></div>`)
    .join("")}</div>`;

const feedItem = (ttl, meta, w = 80) =>
  `<div class="item"><div class="thumb"></div><div class="body"><div class="ttl">${ttl}</div><div class="meta">${meta}</div><div class="ln" style="width:${w}%"></div></div></div>`;

/* ---------- DESKTOP layouts ---------- */
function sidebarWorkspace(ctx) {
  return (
    nav(ctx, "Dashboard") +
    `<div style="flex:1;display:flex;min-height:0">
      <div class="vg-side"><div class="i on">▦</div><div class="i">▤</div><div class="i">◍</div><div class="i">◷</div><div class="i">⚙</div></div>
      <div class="vg-scroll" style="flex:1;padding:12px;overflow:auto">
        <div class="vg-row vg-between" style="margin-bottom:10px"><div class="vg-col"><div style="font-size:14px;font-weight:900">${ctx.heading}</div><div class="vg-muted" style="font-size:9px">${ctx.subtitle}</div></div><button class="vg-btn pri">+ New</button></div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:10px">
          <div class="vg-kpi"><div class="v">1,284</div><div class="l">Active</div></div>
          <div class="vg-kpi"><div class="v">$48.2k</div><div class="l">Revenue</div></div>
          <div class="vg-kpi"><div class="v">96%</div><div class="l">Uptime</div></div>
        </div>
        <div class="vg-card"><div style="font-size:10px;font-weight:700;margin-bottom:6px">Recent activity</div><div class="vg-feed">${feedItem(ctx.brandName + " updated", "2h ago · Sarah")}${feedItem("New lead captured", "5h ago · Auto", 60)}</div></div>
      </div>
    </div>`
  );
}

function topnavWorkspace(ctx) {
  const cards = [
    ["Sprint 14", "12 tasks · 3 done", 40],
    ["Onboarding", "8 tasks · 6 done", 75],
    ["Q4 Campaign", "5 tasks · 1 done", 20],
    [ctx.brandName, "6 tasks · 4 done", 66],
  ];
  return (
    nav(ctx, "Overview", ["Overview", "Objects", "Reports", "Settings"]) +
    `<div class="vg-scroll" style="flex:1;padding:12px;overflow:auto">
      <div class="vg-row vg-between" style="margin-bottom:10px"><div class="vg-col"><div style="font-size:14px;font-weight:900">${ctx.heading}</div><div class="vg-muted" style="font-size:9px">${ctx.subtitle}</div></div><button class="vg-btn pri">+ Create</button></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        ${cards.map((c) => `<div class="vg-card"><div style="font-size:10px;font-weight:700">${c[0]}</div><div class="vg-muted" style="font-size:9px;margin-top:3px">${c[1]}</div><div class="vg-bar" style="margin-top:9px"><i style="width:${c[2]}%"></i></div></div>`).join("")}
      </div>
    </div>`
  );
}

function dataTable(ctx) {
  const rows = [
    [ctx.brandName, "Sarah K.", "Active", "$12,400"],
    ["Northwind Co.", "Daniel R.", "Pending", "$3,200"],
    ["Blue Ocean LLC", "Maya P.", "Active", "$8,750"],
    ["Vertex Labs", "Sarah K.", "Won", "$21,000"],
    ["Harbor Group", "Daniel R.", "Pending", "$5,600"],
    ["Lumen Studio", "Maya P.", "Active", "$9,300"],
  ];
  const pill = (s) => {
    const cls = s === "Won" || s === "Active" ? "" : "soft";
    return `<span class="pill ${cls}">${s}</span>`;
  };
  return (
    nav(ctx, "Records", ["Records", "People", "Settings"]) +
    `<div style="flex:1;display:flex;flex-direction:column;min-height:0">
      <div class="vg-row vg-gap2" style="padding:8px 12px;border-bottom:1px solid var(--brand-border);flex:none">
        <span class="vg-chip">Filter: Active</span><span class="vg-chip soft">Type</span><div style="flex:1"></div><button class="vg-btn out">Export</button>
      </div>
      <div class="vg-table vg-scroll" style="flex:1;overflow:auto">
        <div class="h"><span>Name</span><span>Owner</span><span>Status</span><span>Value</span></div>
        ${rows.map((r) => `<div class="r"><span>${r[0]}</span><span class="vg-muted">${r[1]}</span><span>${pill(r[2])}</span><span>${r[3]}</span></div>`).join("")}
      </div>
    </div>`
  );
}

function analytics(ctx) {
  const bars = [38, 52, 44, 61, 55, 72, 68, 80, 74, 88, 82, 95].map((h) => `<i style="height:${h}%"></i>`).join("");
  return (
    nav(ctx, "Analytics", ["Overview", "Drilldown", "Export"]) +
    `<div class="vg-scroll" style="flex:1;padding:12px;overflow:auto">
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:8px;margin-bottom:12px">
        <div class="vg-kpi"><div class="v">$48.2k</div><div class="l">Revenue</div></div>
        <div class="vg-kpi"><div class="v">1,284</div><div class="l">Visitors</div></div>
        <div class="vg-kpi"><div class="v">3.9%</div><div class="l">Convert</div></div>
        <div class="vg-kpi"><div class="v">62</div><div class="l">Leads</div></div>
      </div>
      <div class="vg-card"><div style="font-size:10px;font-weight:700;margin-bottom:8px">${ctx.heading}</div><div class="vg-chart">${bars}</div></div>
    </div>`
  );
}

function kanban(ctx) {
  const cols = [
    ["Backlog", 5, ["Design review", "API spec", "Q4 plan"]],
    ["In Progress", 3, ["Auth flow", "Dashboard"]],
    ["Review", 2, ["Onboarding"]],
    ["Done", 8, ["Launch", "SEO audit"]],
  ];
  return (
    nav(ctx, "Board", ["Board", "List", "Reports"]) +
    `<div style="flex:1;min-height:0"><div class="vg-kanban">${cols
      .map((c) => `<div class="col"><div class="head"><span>${c[0]}</span><span>${c[1]}</span></div>${c[2].map((t) => `<div class="card"><div class="t">${t}</div><div class="m">Due Fri</div><span class="tag">P1</span></div>`).join("")}</div>`)
      .join("")}</div></div>`
  );
}

function renderDesktop(t, config) {
  const ctx = ctxd(config);
  let inner;
  if (t.id === "D01") inner = sidebarWorkspace(ctx);
  else if (t.id === "D02") inner = topnavWorkspace(ctx);
  else if (t.id === "D03") inner = dataTable(ctx);
  else if (t.id === "D04") inner = analytics(ctx);
  else if (t.id === "D05" || t.id === "D06") inner = kanban(ctx);
  else inner = sidebarWorkspace(ctx);
  return { frame: "browser", designW: BROWSER.w, designH: BROWSER.h, html: `<div class="vg-screen">${inner}</div>` };
}

/* ---------- MOBILE layouts ---------- */
function feed(ctx) {
  return (
    phoneNav(ctx) +
    `<div class="vg-scroll" style="flex:1;overflow:auto"><div class="vg-feed">${feedItem(ctx.brandName + " live", "Sarah · 2h", 90)}${feedItem("New lead from website", "Auto · 5h", 60)}${feedItem("Quarterly report ready", "Daniel · 1d", 75)}</div></div><div class="vg-fab">+</div>` +
    tabbar(["Home", "Search", "Inbox", "Me"], 0)
  );
}

function swipe(ctx) {
  return (
    `<div class="vg-media">
      <div class="progress"><i></i></div>
      <div style="flex:1"></div>
      <div class="overlay">
        <div class="vg-col" style="gap:4px"><div style="font-weight:900;font-size:13px">@${(ctx.logoText || "").toLowerCase().replace(/\s+/g, "")}</div><div style="font-size:9px;opacity:.85;max-width:180px">${ctx.subtitle}</div></div>
        <div class="actions"><div class="a">♥</div><div class="a">💬</div><div class="a">↗</div></div>
      </div>
    </div>` + tabbar(["For You", "Following", "Live"], 0)
  );
}

function tiles(ctx) {
  return (
    phoneNav(ctx) +
    `<div class="vg-scroll" style="flex:1;overflow:auto">
      <div style="padding:12px 12px 10px"><div style="font-size:15px;font-weight:900">${ctx.heading}</div><div class="vg-muted" style="font-size:9px">${ctx.subtitle}</div></div>
      <div class="vg-tiles">
        <div class="tile"><div class="ic">$</div><div class="v">$48.2k</div><div class="l">Revenue</div></div>
        <div class="tile"><div class="ic">↑</div><div class="v">62</div><div class="l">Leads</div></div>
        <div class="tile"><div class="ic">◷</div><div class="v">12</div><div class="l">Tasks</div></div>
        <div class="tile"><div class="ic">★</div><div class="v">4.9</div><div class="l">Rating</div></div>
      </div>
      <div style="padding:0 12px 10px"><div class="vg-card"><div style="font-size:10px;font-weight:700;margin-bottom:6px">Recent</div><div class="vg-feed">${feedItem(ctx.brandName + " booked", "Today", 70)}</div></div></div>
    </div>` +
    tabbar(["Home", "Activity", "Inbox", "Me"], 0)
  );
}

function search(ctx) {
  return (
    `<div class="vg-search">
      <div class="f"><span style="font-size:11px">🔍</span><span style="font-size:10px;color:var(--brand-muted-foreground)">Search places…</span><div style="flex:1"></div><span class="vg-chip">Nearby</span></div>
      <div class="vg-row vg-gap2" style="margin-top:8px"><span class="vg-chip">Cafés</span><span class="vg-chip soft">Shops</span><span class="vg-chip soft">Services</span></div>
    </div>
    <div class="vg-scroll" style="flex:1;overflow:auto">
      <div class="vg-feed">
        <div class="item"><div class="thumb"></div><div class="body"><div class="ttl">${ctx.brandName}</div><div class="meta">★ 4.8 · 0.4 mi · Café</div><div class="ln" style="width:70%"></div></div></div>
        <div class="item"><div class="thumb"></div><div class="body"><div class="ttl">Atlas Studio</div><div class="meta">★ 4.9 · 0.8 mi · Design</div><div class="ln" style="width:55%"></div></div></div>
        <div class="item"><div class="thumb"></div><div class="body"><div class="ttl">Northwind Bakery</div><div class="meta">★ 4.7 · 1.2 mi · Bakery</div><div class="ln" style="width:65%"></div></div></div>
      </div>
    </div>` +
    tabbar(["Explore", "Saved", "Profile"], 0)
  );
}

function genericMobile(ctx) {
  return (
    phoneNav(ctx) +
    `<div class="vg-scroll" style="flex:1;overflow:auto">
      <div style="padding:12px"><div style="font-size:14px;font-weight:900">Inbox</div><div class="vg-muted" style="font-size:9px;margin-bottom:8px">3 new messages</div></div>
      <div class="vg-feed">${feedItem("Sarah K. — " + ctx.brandName, "2h ago", 85)}${feedItem("Daniel R. — Quote ready", "5h ago", 60)}${feedItem("System — Weekly digest", "1d ago", 70)}</div>
    </div>` +
    tabbar(["Home", "Inbox", "Me"], 0)
  );
}

function renderMobile(t, config) {
  const ctx = ctxd(config);
  let inner;
  if (t.id === "M01") inner = feed(ctx);
  else if (t.id === "M02") inner = swipe(ctx);
  else if (t.id === "M03") inner = tiles(ctx);
  else if (t.id === "M04") inner = search(ctx);
  else inner = genericMobile(ctx);
  return { frame: "phone", designW: PHONE.w, designH: PHONE.h, html: `<div class="vg-screen">${inner}</div>` };
}

/* ---------- RECIPE layouts ---------- */
function renderRecipe(r, config) {
  const ctx = ctxd(config);
  const steps = String(r.canonical_flow || "").split(">").map((s) => s.trim()).filter(Boolean);
  const flow = steps.map((s, i) => `<div class="step ${i === 0 ? "on" : ""}"><div class="n">${i + 1}</div><div class="t">${s}</div></div>`).join("");
  const contract = r.composition_contract || {};
  const chips = Object.entries(contract).filter(([, v]) => v).map(([k]) => k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())).map((c) => `<span class="vg-chip">${c}</span>`).join("");
  return {
    frame: "browser",
    designW: BROWSER.w,
    designH: BROWSER.h,
    html:
      `<div class="vg-screen">${nav(ctx, "Flow", ["Flow", "Steps"])}` +
      `<div class="vg-scroll" style="flex:1;padding:14px;overflow:auto">
        <div style="font-size:15px;font-weight:900">${r.name}</div>
        <div class="vg-muted" style="font-size:10px;margin-top:2px">${r.domain || ""}</div>
        <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--brand-muted-foreground);margin:16px 0 8px">Canonical flow</div>
        <div class="vg-flow">${flow}</div>
        <div class="vg-card" style="margin-top:14px"><div style="font-size:10px;font-weight:700;margin-bottom:7px">Composition contract</div><div class="vg-row vg-gap2" style="flex-wrap:wrap">${chips}</div></div>
      </div></div>`,
  };
}

export function renderPreview(template, platform, config) {
  if (platform === "mobile") return renderMobile(template, config);
  if (platform === "recipe") return renderRecipe(template, config);
  return renderDesktop(template, config);
}

export function familyFor(item) {
  if (item.family === "mobile") return "mobile";
  if (item.canonical_flow) return "recipe";
  return "desktop";
}
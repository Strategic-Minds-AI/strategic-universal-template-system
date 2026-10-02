// Lead Scraper System — universalized registry module.
// Ingested from XTREME-SCRAPER-main.zip (Next.js 15 lead-gen scraper, v2.0.0) on
// 2026-10-02 and promoted to a versioned compound generator + template pack.
// The scraper is a compound system: search (6 sources) → company intel → CRM
// pipeline → outreach → analytics. Bootstrapped deterministically from a
// questionnaire; live scraping/AI/email steps are NOT_CONFIGURED until the
// external adapters (Google Maps, Apollo, Firecrawl, Resend, AI Gateway) are
// connected. No fake success.

export const REGISTRY_VERSION = "1.0.0";
export const SOURCE_VERSION = "2.0.0"; // from the zip's package.json
export const SOURCE_REPO = "github.com/XTREME-SYSTEMS/XTREME-SCRAPER";

export const SEARCH_SOURCES = [
  { id: "google_maps", label: "Google Maps", desc: "Local listings + ratings", adapter: "google_maps", credential: "GOOGLE_MAPS_API_KEY" },
  { id: "bbb", label: "BBB", desc: "Better Business Bureau", adapter: "web_scrape", credential: null },
  { id: "apollo", label: "Apollo", desc: "B2B company intelligence", adapter: "apollo", credential: "APOLLO_API_KEY_2" },
  { id: "firecrawl", label: "Firecrawl", desc: "Deep web crawl", adapter: "firecrawl", credential: "FIRECRAWL_API_KEY" },
  { id: "yellowpages", label: "Yellow Pages", desc: "Traditional directory", adapter: "web_scrape", credential: null },
  { id: "yelp", label: "Yelp", desc: "Consumer reviews", adapter: "web_scrape", credential: null },
];

export const SEARCH_MODES = [
  { id: "quick", label: "Quick", desc: "~3s · 40 results", color: "#16A34A" },
  { id: "deep", label: "Deep", desc: "~15s · 150 results", color: "#2563EB" },
  { id: "max", label: "Max", desc: "~60s · 250+ results", color: "#9333EA" },
  { id: "level5", label: "Level 5", desc: "Full intelligence", color: "#FFBE00" },
];

export const LIMIT_OPTIONS = [
  { id: "50", label: "50" },
  { id: "100", label: "100" },
  { id: "200", label: "200" },
  { id: "500", label: "500" },
  { id: "all", label: "All" },
];

export const REGIONS = {
  US: ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"],
  CA: ["AB","BC","MB","NB","NL","NS","NT","NU","ON","PE","QC","SK","YT"],
};

export const CRM_STATUSES = ["New", "Contacted", "Interested", "Proposal Sent", "Won", "Lost", "Nurture"];

export const OUTREACH_TEMPLATES = [
  {
    name: "Cold Intro Pitch",
    subject: "Quick question about {company_name}",
    body: "Hi Team at {company_name},\n\nI noticed your business online in {city} and wanted to reach out. We specialize in helping local service providers expand their reach and acquire high-intent leads.\n\nWould you be open to a brief 5-minute chat this week?\n\nBest regards,\n{sender_name}",
  },
  {
    name: "Partnership Proposal",
    subject: "Partnership opportunity for {company_name}",
    body: "Hello {company_name},\n\nWe are reaching out to top-rated local providers in {city}. We have incoming client requests in your service vertical and are looking for a reliable partner to handle overflows.\n\nLet us know if you have bandwidth for new clients.\n\nBest,\n{sender_name}",
  },
  {
    name: "Follow-Up Offer",
    subject: "Exclusive offer for {company_name}",
    body: "Hi {company_name},\n\nFollowing up on our service offerings for businesses in {city}. We can deliver qualified local customer inquiries directly to your team.\n\nReply to this email if you'd like a quick preview of available leads in your area.\n\nWarm regards,\n{sender_name}",
  },
];

// External services the live system needs. Each maps to a factory adapter +
// the env var from the zip's .env.example. Honest NOT_CONFIGURED until wired.
export const ADAPTER_REQUIREMENTS = [
  { adapter_key: "google_maps", name: "Google Maps / Places", credential: "GOOGLE_MAPS_API_KEY", required: true, purpose: "Local business search + ratings" },
  { adapter_key: "apollo", name: "Apollo.io", credential: "APOLLO_API_KEY_2", required: false, purpose: "B2B company intelligence enrichment" },
  { adapter_key: "firecrawl", name: "Firecrawl", credential: "FIRECRAWL_API_KEY", required: false, purpose: "Deep web crawl" },
  { adapter_key: "browserbase", name: "Browserbase", credential: "BROWSERBASE_API_KEY", required: false, purpose: "Headless browser scraping" },
  { adapter_key: "scrapingbee", name: "ScrapingBee", credential: "SCRAPINGBEE_API_KEY", required: false, purpose: "Proxy scraping" },
  { adapter_key: "ai_gateway", name: "Vercel AI Gateway", credential: "VERCEL_AI_GATEWAY_KEY", required: false, purpose: "AI keyword suggestions + intel summary" },
  { adapter_key: "resend", name: "Resend (email)", credential: "RESEND_API_KEY", required: false, purpose: "Outreach email delivery" },
  { adapter_key: "supabase", name: "Supabase (persistence)", credential: "SUPABASE_URL", required: false, purpose: "CRM + saved leads storage" },
];

export const LEAD_SCRAPER_SYSTEM = {
  key: "lead_scraper_system",
  name: "Lead Scraper System",
  icon: "🔍",
  category: "compound",
  tier: 5,
  version: REGISTRY_VERSION,
  source_version: SOURCE_VERSION,
  source_repo: SOURCE_REPO,
  description: "Level 5 intelligence search — any industry, any city (US + Canada). Compound system: multi-source search → company intel → CRM pipeline → outreach → analytics. Bootstrapped from a questionnaire; live scraping/AI/email steps are NOT_CONFIGURED until external adapters are connected.",
  capabilities: ["multi_source_search", "company_intel", "crm_pipeline", "outreach_email", "analytics", "ai_keyword_suggest"],
  // Compound generator definition (DSL) — mirrors the factory's generator shape.
  generator: {
    generator_key: "compound.lead_scraper_system",
    name: "Lead Scraper System",
    category: "compound",
    generator_type: "lead_scraper",
    version: REGISTRY_VERSION,
    input_schema: {
      type: "object",
      properties: {
        brand_name: { type: "string", minLength: 1 },
        accent_color: { type: "string" },
        default_query: { type: "string" },
        default_region: { type: "string", enum: ["US", "CA", "US_CA"] },
        sources: { type: "array", items: { type: "string" } },
        default_mode: { type: "string", enum: ["quick", "deep", "max", "level5"] },
        default_limit: { type: "string" },
        crm_statuses: { type: "array", items: { type: "string" } },
      },
      required: ["brand_name"],
    },
    output_contract: { type: "object", required: ["files"] },
    workflow_dag: {
      nodes: [
        { id: "validate_input", type: "validate_schema", config: { schema_ref: "input_schema" } },
        { id: "scaffold", type: "template", config: { mode: "file_tree", output: "files" } },
        { id: "validate_output", type: "validate_content", config: { required: ["files"] } },
        { id: "search_proxy", type: "adapter_read", config: { adapter: "google_maps", action: "search", fallback: "NOT_CONFIGURED" } },
        { id: "company_intel", type: "adapter_read", config: { adapter: "web_scrape", action: "scrape_company", fallback: "NOT_CONFIGURED" } },
        { id: "ai_enhance", type: "ai_generate", config: { adapter: "ai_gateway", action: "keyword_suggest", fallback: "NOT_CONFIGURED" } },
        { id: "outreach_send", type: "adapter_write", config: { adapter: "resend", action: "send_email", fallback: "NOT_CONFIGURED", risk_class: "PROTECTED" } },
        { id: "checksum", type: "checksum", config: {} },
        { id: "package", type: "package", config: {} },
        { id: "export", type: "export", config: {} },
      ],
      edges: [
        { from: "validate_input", to: "scaffold" },
        { from: "scaffold", to: "validate_output" },
        { from: "validate_output", to: "search_proxy" },
        { from: "search_proxy", to: "company_intel" },
        { from: "company_intel", to: "ai_enhance" },
        { from: "ai_enhance", to: "outreach_send" },
        { from: "outreach_send", to: "checksum" },
        { from: "checksum", to: "package" },
        { from: "package", to: "export" },
      ],
    },
    adapters: ADAPTER_REQUIREMENTS.map((a) => ({ adapter: a.adapter_key, action: a.purpose, required: a.required })),
    model_policy: { provider: "ai-gateway", required: false, fallback: "NOT_CONFIGURED" },
    validation_policy: { mandatory: ["schema", "completeness", "secret_scan", "artifact_integrity"] },
    approval_policy: { required: true, risk_class: "PROTECTED", reason: "outreach sends email to real businesses" },
    security_policy: { secret_scan: true, sandbox_execution: false },
    export_policy: { formats: ["json", "zip"], immutable: true },
  },
  // Template pack — the bootstrappable file tree.
  template: {
    mode: "file_tree",
    label: "Lead Scraper Scaffold",
    variables_schema: [
      { key: "brand_name", label: "Brand Name", type: "text", required: true, default: "Strategic Minds Lead Search", help: "App display name." },
      { key: "accent_color", label: "Accent Color", type: "color", required: true, default: "#FFBE00", help: "Primary accent (hex). The zip uses #FFBE00." },
      { key: "default_query", label: "Default Search Query", type: "text", required: false, default: "Plumbers", help: "Pre-filled industry query." },
      { key: "default_region", label: "Default Region", type: "select", required: true, default: "US_CA",
        options: ["US", "CA", "US_CA"], help: "Geographic coverage." },
      { key: "sources", label: "Enabled Sources", type: "text", required: false, default: "google_maps,bbb,apollo,firecrawl,yellowpages,yelp", help: "Comma-separated source ids." },
      { key: "default_mode", label: "Default Mode", type: "select", required: true, default: "deep",
        options: ["quick", "deep", "max", "level5"], help: "Initial search depth." },
      { key: "default_limit", label: "Default Limit", type: "select", required: true, default: "100",
        options: ["50", "100", "200", "500", "all"], help: "Max results per search." },
      { key: "sender_name", label: "Outreach Sender Name", type: "text", required: true, default: "Strategic Minds AI", help: "Sign-off name in outreach templates." },
      { key: "backend_search_url", label: "Backend Search URL", type: "text", required: false, help: "Proxy target for /api/search. Leave blank to use the default backend." },
      { key: "backend_scrape_url", label: "Backend Scrape URL", type: "text", required: false, help: "Proxy target for /api/scrape." },
    ],
    files: [
      { path: "README.md", content: `# {{brand_name}}\n\nLevel 5 intelligence search — any industry, any city. **US & Canada.**\n\n## Features\n- **Source Selector** — toggle {{sources}}\n- **US + Canada** — all 50 US states + 13 Canadian provinces & territories\n- Mode selector: Quick / Deep / Max / Level 5 (default: {{default_mode}})\n- Limit selector: 50 / 100 / 200 / 500 / All (default: {{default_limit}})\n- AI intelligence summary per search\n- Source breakdown pills on results\n\n## Stack\n- Next.js 15 / React 19 / TypeScript\n- Zero external UI dependencies (inline styles)\n\n## Deploy to Vercel\n1. Fork or push to GitHub\n2. Import in Vercel — auto-detected as Next.js\n3. Add environment variables (see .env.example)\n4. Deploy\n\n## Env Vars\nSee .env.example for required keys. Point BACKEND_SEARCH_URL / BACKEND_SCRAPE_URL to your own scrapers.\n\n## Bootstrap\nGenerated by the Strategic Minds AI Factory — Lead Scraper System v${REGISTRY_VERSION} (source v${SOURCE_VERSION}).\nAccent: {{accent_color}} · Sender: {{sender_name}}` },
      { path: ".env.example", content: `# Required for search sources\nGOOGLE_MAPS_API_KEY=\nGOOGLE_PLACES_API_KEY=\nVERCEL_AI_GATEWAY_KEY=\nVERCEL_AI_GATEWAY_URL=https://ai-gateway.vercel.sh/v1\nVERCEL_AI_GATEWAY_MODEL=openai/gpt-4o-mini\nFIRECRAWL_API_KEY=\nBROWSERBASE_API_KEY=\nBROWSERBASE_PROJECT_ID=\nBROWSER_WORKER_URL=\nBROWSER_WORKER_TOKEN=\nSCRAPINGBEE_API_KEY=\nAPOLLO_API_KEY_2=\nRESEND_API_KEY=\n\n# App\nNEXT_PUBLIC_APP_NAME={{brand_name}}\nNEXT_PUBLIC_APP_URL=https://example.com\n\n# Backend proxies\nBACKEND_SEARCH_URL={{backend_search_url}}\nBACKEND_SCRAPE_URL={{backend_scrape_url}}` },
      { path: "package.json", content: `{\n  "name": "{{brand_name}}".toLowerCase().replace(/\\s+/g,'-'),\n  "version": "${SOURCE_VERSION}",\n  "private": true,\n  "scripts": { "dev": "next dev", "build": "next build", "start": "next start" },\n  "dependencies": {\n    "@supabase/supabase-js": "^2.109.0",\n    "next": "16.3.0",\n    "react": "^19",\n    "react-dom": "^19",\n    "resend": "^6.19.0"\n  },\n  "devDependencies": {\n    "@types/node": "^22",\n    "@types/react": "^19",\n    "autoprefixer": "^10",\n    "postcss": "8.4.49",\n    "tailwindcss": "3.4.17",\n    "typescript": "^5"\n  },\n  "engines": { "node": ">=20" }\n}` },
      { path: "app/page.tsx", content: `"use client";\nimport { useState, useEffect } from "react";\nimport Link from "next/link";\n\nconst PLACEHOLDERS = [\n  "Plumbers in Dallas...",\n  "Roofing contractors in Denver...",\n  "Wedding photographers in Austin...",\n  "Epoxy flooring in Phoenix...",\n  "Concrete contractors in Toronto...",\n  "HVAC companies in Calgary...",\n  "Accountants in Vancouver...",\n  "Restaurants in Montreal...",\n];\n\nexport default function Home() {\n  const [ph, setPh] = useState(0);\n  useEffect(() => {\n    const t = setInterval(() => setPh(i => (i + 1) % PLACEHOLDERS.length), 2500);\n    return () => clearInterval(t);\n  }, []);\n  return (\n    <main style={{ minHeight: "100vh", background: "#fff", color: "#111" }}>\n      <header style={{ borderBottom: "1px solid #f0f0f0", padding: "24px 48px", display: "flex", justifyContent: "space-between" }}>\n        <span style={{ fontWeight: 900, fontSize: 22 }}>{{brand_name}}</span>\n        <Link href="/dashboard" style={{ fontWeight: 700, color: "{{accent_color}}" }}>Go to Dashboard →</Link>\n      </header>\n      <section style={{ maxWidth: 900, margin: "0 auto", padding: "80px 48px", textAlign: "center" }}>\n        <h1 style={{ fontSize: "clamp(42px,7vw,76px)", fontWeight: 900, textTransform: "uppercase" }}>Find Any Business.<br />Any Industry. Any City.</h1>\n        <p style={{ fontSize: 18, color: "#555", maxWidth: 640, margin: "0 auto 48px" }}>Type what you're looking for and get a focused list of real businesses with phone numbers and addresses. Instantly.</p>\n      </section>\n    </main>\n  );\n}` },
      { path: "app/api/search/route.ts", content: `import { NextRequest, NextResponse } from "next/server";\nconst BACKEND_URL = process.env.BACKEND_SEARCH_URL ?? "{{backend_search_url}}";\nconst JUNK_WEBSITES = ["facebook.com","twitter.com","instagram.com","linkedin.com","youtube.com","tiktok.com"];\nfunction isJunk(r: Record<string,string>): boolean {\n  const name = (r.company_name||"").toLowerCase().trim();\n  const website = (r.website||"").toLowerCase();\n  if (!name || /^\\d+$/.test(name)) return true;\n  return JUNK_WEBSITES.some(d => website.includes(d));\n}\nexport async function POST(req: NextRequest) {\n  const body = await req.json();\n  const res = await fetch(BACKEND_URL, { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(body) });\n  const data = await res.json();\n  if (Array.isArray(data.results)) {\n    const seen = new Set<string>();\n    data.results = data.results.filter((r: Record<string,string>) => {\n      if (isJunk(r)) return false;\n      const phone = (r.phone||"").replace(/\\D/g,"");\n      if (phone && phone.length >= 7) { if (seen.has(phone)) return false; seen.add(phone); }\n      return true;\n    });\n  }\n  return NextResponse.json(data);\n}` },
      { path: "app/api/scrape/route.ts", content: `import { NextRequest, NextResponse } from "next/server";\nconst BACKEND_URL = process.env.BACKEND_SCRAPE_URL ?? "{{backend_scrape_url}}";\nexport async function POST(req: NextRequest) {\n  const body = await req.json();\n  const res = await fetch(BACKEND_URL, { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(body) });\n  return NextResponse.json(await res.json());\n}` },
      { path: "app/api/scrape-company/route.ts", content: `// Company intel: fetch homepage, extract title/description, derive highlights.\n// Falls back to hostname-derived intel on fetch failure (honest, not faked).\nimport { NextRequest, NextResponse } from 'next/server';\nexport async function POST(req: NextRequest) {\n  const { url } = await req.json();\n  if (!url) return NextResponse.json({ error: 'URL required' }, { status: 400 });\n  const cleanUrl = url.startsWith('http') ? url : 'https://' + url;\n  try {\n    const res = await fetch(cleanUrl, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1)' } });\n    const html = await res.text();\n    const titleMatch = html.match(/<title[^>]*>([^<]+)<\\/title>/i);\n    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);\n    const companyName = titleMatch?.[1]?.split(/[|\\-–]/)[0]?.trim() || new URL(cleanUrl).hostname.replace('www.','');\n    return NextResponse.json({ ok: true, intel: { companyName, description: descMatch?.[1] || '', url: cleanUrl } });\n  } catch {\n    const hostname = new URL(cleanUrl).hostname.replace('www.','');\n    return NextResponse.json({ ok: true, intel: { companyName: hostname, url: cleanUrl, fallback: true } });\n  }\n}` },
      { path: "app/api/ai-enhance/route.ts", content: `// Server-only Vercel AI Gateway; no other AI provider fallback.\nimport { NextRequest, NextResponse } from 'next/server';\nexport async function POST(req: NextRequest) {\n  const key = process.env.VERCEL_AI_GATEWAY_KEY;\n  if (!key) return NextResponse.json({ error: 'VERCEL_AI_GATEWAY_KEY required' }, { status: 503 });\n  try {\n    const b = await req.json();\n    const query = String(b.query || '').slice(0, 200);\n    if (!query) return NextResponse.json({ error: 'query required' }, { status: 400 });\n    const r = await fetch('https://ai-gateway.vercel.sh/v1/chat/completions', { method: 'POST', headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: process.env.VERCEL_AI_GATEWAY_MODEL || 'openai/gpt-4o-mini', messages: [{ role: 'system', content: 'Suggest up to eight related business search keywords. Return JSON with a suggestions array of strings.' }, { role: 'user', content: query }], response_format: { type: 'json_object' }, max_tokens: 600 }), signal: AbortSignal.timeout(30000) });\n    if (!r.ok) throw new Error('Vercel AI Gateway ' + r.status);\n    const d = await r.json();\n    const result = JSON.parse(d.choices[0].message.content);\n    if (!Array.isArray(result.suggestions)) throw new Error('Invalid suggestions');\n    return NextResponse.json({ suggestions: result.suggestions.filter((s: unknown) => typeof s === 'string').slice(0, 8), via: 'vercel-ai-gateway' });\n  } catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : 'AI request failed' }, { status: 502 }); }\n}` },
      { path: "app/api/send-email/route.ts", content: `// Outreach email via Resend. NOT_CONFIGURED without RESEND_API_KEY.\nimport { NextRequest, NextResponse } from 'next/server';\nconst KEY = process.env.RESEND_API_KEY;\nexport async function POST(req: NextRequest) {\n  if (!KEY) return NextResponse.json({ ok: false, status: 'NOT_CONFIGURED', reason: 'Resend not connected' });\n  return NextResponse.json({ ok: false, status: 'NOT_CONFIGURED' });\n}` },
      { path: "app/api/stats/route.ts", content: `import { NextResponse } from 'next/server';\nexport async function GET() {\n  return NextResponse.json({ searches: 0, saved: 0, sent: 0, status: 'NOT_CONFIGURED' });\n}` },
      { path: "lib/crm.ts", content: `// CRM contact type + localStorage persistence (mirrors the zip's lib/crm.ts).\nexport type CRMContact = {\n  id: string; name: string; phone?: string; email?: string; address?: string;\n  status: ${JSON.stringify(CRM_STATUSES)}[number]; priority?: 'low'|'med'|'high';\n  tags?: string[]; notes?: string; source?: string; stars?: number; createdAt: string;\n};\nexport function getStoredCRMContacts(): CRMContact[] {\n  if (typeof window === 'undefined') return [];\n  try { return JSON.parse(localStorage.getItem('xts_crm_contacts') || '[]'); } catch { return []; }\n}\nexport function saveStoredCRMContacts(c: CRMContact[]) {\n  if (typeof window === 'undefined') return;\n  localStorage.setItem('xts_crm_contacts', JSON.stringify(c));\n}\nexport function exportContactsToCSV(c: CRMContact[]): string {\n  const header = 'name,phone,email,address,status,priority,source,stars,createdAt';\n  const rows = c.map(r => [r.name,r.phone||'',r.email||'',r.address||'',r.status,r.priority||'',r.source||'',r.stars||'',r.createdAt].join(','));\n  return [header, ...rows].join('\\n');\n}` },
      { path: "app/components/Navbar.tsx", content: `"use client";\nimport Link from "next/link";\nexport default function Navbar() {\n  return (\n    <nav style={{ borderBottom: "1px solid #f0f0f0", padding: "16px 32px", display: "flex", gap: 24 }}>\n      <Link href="/dashboard" style={{ fontWeight: 700, color: "{{accent_color}}" }}>Search</Link>\n      <Link href="/crm">CRM</Link>\n      <Link href="/outreach">Outreach</Link>\n      <Link href="/company-intel">Intel</Link>\n      <Link href="/analytics">Analytics</Link>\n    </nav>\n  );\n}` },
      { path: "config/brand.json", content: `{ "brand_name": "{{brand_name}}", "accent": "{{accent_color}}", "default_query": "{{default_query}}", "default_region": "{{default_region}}", "sources": [{{sources}}], "default_mode": "{{default_mode}}", "default_limit": "{{default_limit}}", "sender_name": "{{sender_name}}", "crm_statuses": ${JSON.stringify(CRM_STATUSES)} }` },
    ],
  },
};

// Deterministic variable substitution (shared shape with superAgents.js).
export function renderTemplate(content, answers) {
  return content.replace(/\{\{(\w+)\}\}/g, (m, k) => {
    const v = answers[k];
    if (v === undefined || v === null || v === "") return `{{${k}:UNSET}}`;
    return String(v);
  });
}

export function validateAnswers(schema, answers) {
  const missing = [];
  const errors = [];
  for (const v of schema) {
    const val = answers[v.key];
    if (v.required && (val === undefined || val === null || val === "")) missing.push(v.key);
    if (v.type === "color" && val && !/^#[0-9a-fA-F]{3,8}$/.test(val)) errors.push(`${v.key} must be a hex color`);
  }
  return { missing, errors };
}

// Deterministic bootstrap: render the file tree with answers + SHA-256 per file.
// AI/scraping/email steps are NOT_CONFIGURED (honest).
export async function bootstrapScraper(answers) {
  const sys = LEAD_SCRAPER_SYSTEM;
  const schema = sys.template.variables_schema;
  const { missing, errors } = validateAnswers(schema, answers);
  const files = sys.template.files.map((f) => ({
    path: f.path,
    content: renderTemplate(f.content, answers),
  }));
  const hashed = await Promise.all(files.map(async (f) => {
    const buf = new TextEncoder().encode(f.content);
    const digest = await crypto.subtle.digest("SHA-256", buf);
    const sha256 = Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
    return { ...f, sha256 };
  }));
  return {
    system_key: sys.key,
    system_name: sys.name,
    template_label: sys.template.label,
    template_version: sys.version,
    source_version: sys.source_version,
    source_repo: sys.source_repo,
    generated_at: new Date().toISOString(),
    variables: answers,
    validation: { missing_required: missing, errors, ready: missing.length === 0 && errors.length === 0 },
    files: hashed,
    adapter_requirements: ADAPTER_REQUIREMENTS,
    ai_enrichment: { status: "NOT_RUN", provider: "vercel-ai-gateway", reason: "Deterministic scaffold rendered without AI. Its keyword-suggestion route uses Vercel AI Gateway; deployed scrapers and email require their own credentials." },
  };
}
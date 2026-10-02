// Digital Dominance System — universalized compound generator.
// Ingested from three source archives (DIGITALDOMINANCE, digital-dominance-2-0,
// strategic-digital-dominance-v2-cleanroom) on 2026-10-02 and normalized into the
// factory registry as a versioned compound generator + template pack.
//
// CORE IDEA: bulk-generate city/niche-specific websites programmatically, each one
// built to Google's 100% requirements (benchmark "distance-to-100" engine), with
// strategic per-site content variation so no two deployed sites are identical.
//
// Live build/deploy/index steps are NOT_CONFIGURED until the external adapters
// (Vercel, GitHub, Supabase, Google Search Console, GA4, AI Gateway) are connected
// for execution. All AI routes use Vercel AI Gateway; bootstrap remains deterministic.

export const SYSTEM_VERSION = "1.0.0";
export const SOURCE_VERSION = "2.0.0"; // highest source archive version
export const FLEET_SOURCE = "digital-dominance-fleet";

// ── The 4-stage factory pipeline (operator view) ──────────────────────────────
export const FACTORY_STAGES = [
  { id: "discover", label: "Discover", desc: "Research demand, normalize markets, cluster intent, score opportunities.", gate: "No jobs queued" },
  { id: "build", label: "Build", desc: "Generator Creator routes qualified work to the best build engine; render city-specific site.", gate: "No jobs queued" },
  { id: "validate", label: "Validate", desc: "Visual, functional, performance, accessibility, security + Google 100% gates.", gate: "No jobs queued" },
  { id: "grow", label: "Grow", desc: "Measure outcomes, learn from winners, repair or retire losers.", gate: "No jobs queued" },
];

// ── Google 100% benchmark layers (distance-to-100) ────────────────────────────
// Each layer is a BenchmarkDefinition. A site reaches 100 when every layer passes.
export const GOOGLE_BENCHMARK_LAYERS = [
  { id: "index_coverage", label: "Index Coverage", weight: "P0", desc: "Pages INDEXED, not DISCOVERED/CRAWLED-NOINDEX/BLOCKED/404." },
  { id: "core_web_vitals", label: "Core Web Vitals", weight: "P0", desc: "LCP < 2.5s, INP < 200ms, CLS < 0.1 on mobile + desktop." },
  { id: "mobile_usability", label: "Mobile Usability", weight: "P0", desc: "Viewport, tap targets, font size, no blocked JS/CSS." },
  { id: "schema_markup", label: "Schema / Rich Results", weight: "P1", desc: "LocalBusiness, Service, FAQ, Breadcrumb, Review valid JSON-LD." },
  { id: "canonical hygiene", label: "Canonical & URL hygiene", weight: "P1", desc: "Canonical tags, trailing-slash policy, no redirect chains." },
  { id: "sitemap_robots", label: "Sitemap & Robots", weight: "P1", desc: "sitemap.xml valid + submitted, robots.txt allows indexing, IndexNow ping." },
  { id: "search_console", label: "Search Console verified", weight: "P1", desc: "sc-domain property verified, no manual actions, no coverage errors." },
  { id: "ga4", label: "GA4 measurement", weight: "P2", desc: "GA4 stream + GTM container, key events firing." },
  { id: "content_unique", label: "Content uniqueness", weight: "P0", desc: "No duplicate/thin content; strategic per-city variation; no AI-spam patterns." },
  { id: "eeat", label: "E-E-A-T signals", weight: "P1", desc: "Experience, Expertise, Authoritativeness, Trust on every page." },
  { id: "accessibility", label: "Accessibility (WCAG)", weight: "P2", desc: "Contrast, keyboard, ARIA, focus management." },
  { id: "security", label: "Security", weight: "P1", desc: "HTTPS, HSTS, no mixed content, secret scan clean." },
  { id: "local_relevance", label: "Local relevance", weight: "P1", desc: "City in title/H1, local proof, service area, NAP consistency." },
  { id: "ai_citability", label: "AI citability (AEO)", weight: "P2", desc: "Structured, sourced, citable answers for AI search referrals." },
];

// ── Strategic content-variation axes ──────────────────────────────────────────
// Each generated site varies along these axes so no two deployed sites are identical.
export const VARIATION_AXES = [
  { id: "company_name", label: "Company name", desc: "Unique DBA per city/market." },
  { id: "phone", label: "Local phone", desc: "City-local or tracked phone number." },
  { id: "service_area", label: "Service-area text", desc: "Unique prose naming the city + radius." },
  { id: "primary_city_state", label: "City + State", desc: "Canonical city/state targeting." },
  { id: "hero_image", label: "Hero imagery", desc: "Distinct hero photo per site." },
  { id: "color_scheme", label: "Color scheme", desc: "Brand accent variation." },
  { id: "pricing_tier", label: "Pricing tier", desc: "economy / standard / premium per market." },
  { id: "faq_local", label: "Local FAQ", desc: "City-specific Q&A (weather, codes, timing)." },
  { id: "local_proof", label: "Local proof", desc: "City reviews, landmarks, neighborhoods." },
  { id: "meta_unique", label: "Unique meta", desc: "Title/description never duplicated across sites." },
];

// ── Deployment patterns ───────────────────────────────────────────────────────
export const DEPLOY_PATTERNS = [
  { id: "subdomain", label: "Subdomain fleet", pattern: "cityslug.brandnearme.com", desc: "One subdomain per city (mass scale, shared root)." },
  { id: "path", label: "Path-based locations", pattern: "/{state}/{city}", desc: "Single root domain, location pages as paths." },
  { id: "standalone", label: "Standalone domains", pattern: "citybrand.com", desc: "Unique domain per market (maximum isolation)." },
];

// ── Execution modes (shadow vs execute) ───────────────────────────────────────
export const EXECUTION_MODES = [
  { id: "shadow", label: "Shadow (dry-run)", color: "#4B5563", desc: "Compile + validate only. No publish, no outreach, no deploy, no spend." },
  { id: "execute", label: "Execute (promote)", color: "#0d2f96", desc: "Promote validated SwarmTasks to production. Requires approval gate." },
];

// ── Fleet agents (universalized from source) ─────────────────────────────────
export const FLEET_AGENTS = [
  { key: "alpha_prime", name: "Alpha Prime", icon: "🧠", role: "CEO orchestrator — persistent audit, advise, plan, execute with approval gates.", tier: 5 },
  { key: "site_factory_manager", name: "Site Factory Manager", icon: "🏭", role: "Mass-produce city-specific templates, rebrand, deploy, bulk-publish.", tier: 5 },
  { key: "seo_manager", name: "SEO Manager", icon: "🔍", role: "Location SEO pages, CWV, content gaps, index submission, competitor scan.", tier: 5 },
  { key: "swarm_orchestrator", name: "Swarm Orchestrator", icon: "🐝", role: "Parallel multi-agent coordination across the site fleet.", tier: 5 },
  { key: "reputation_manager", name: "Reputation Manager", icon: "⭐", role: "Reviews, ratings, local trust signals.", tier: 4 },
  { key: "comms_manager", name: "Comms Manager", icon: "✉️", role: "Outbound email/voice, follow-up sequences (gated).", tier: 4 },
  { key: "lead_orchestrator", name: "Lead Orchestrator", icon: "🎯", role: "Lead capture, qualification, CRM routing.", tier: 4 },
  { key: "system_operator", name: "System Operator", icon: "🛠️", role: "System health, connector sync, runtime integrity.", tier: 4 },
];

// ── External adapters required for live execution ─────────────────────────────
export const ADAPTER_REQUIREMENTS = [
  { adapter_key: "vercel", name: "Vercel", purpose: "Deploy generated sites to production", credential: "VERCEL_TOKEN", required: true },
  { adapter_key: "github", name: "GitHub", purpose: "Repo sync + generated code storage", credential: "GitHub connector", required: true },
  { adapter_key: "supabase", name: "Supabase", purpose: "Per-site data backend provisioning", credential: "Supabase connector", required: true },
  { adapter_key: "google_search_console", name: "Google Search Console", purpose: "Verify ownership, index coverage, sitemap submission", credential: "GSC connector", required: true },
  { adapter_key: "google_analytics", name: "Google Analytics (GA4)", purpose: "Behavioral measurement + CWV", credential: "GA4 connector", required: false },
  { adapter_key: "googlesheets", name: "Google Sheets", purpose: "Canonical source-of-truth workbooks (concepts, workflows)", credential: "Sheets connector", required: true },
  { adapter_key: "ai_gateway", name: "AI Gateway", purpose: "Content generation + strategic variation", credential: "Integration credits", required: true },
  { adapter_key: "indexnow", name: "IndexNow", purpose: "Instant index ping on publish", credential: "API key", required: false },
];

// ── Priority-score formula (distance-to-100 repair ranking) ───────────────────
// (SEVERITY × IMPACT × CONFIDENCE) / (TIME × COST × RISK)
export const PRIORITY_WEIGHTS = {
  severity: { P0: 100, P1: 50, P2: 20, P3: 5 },
  impact: { critical: 4, high: 3, medium: 2, low: 1 },
  effort: { low: 1, medium: 2, high: 4 },
  cost: { low: 1, medium: 2, high: 4 },
  risk: { low: 1, medium: 2, high: 4 },
};

export function calcPriorityScore({ severity, impact, confidence, effort, cost, risk }) {
  const sev = PRIORITY_WEIGHTS.severity[severity] || 20;
  const imp = PRIORITY_WEIGHTS.impact[impact] || 2;
  const conf = Math.max(confidence || 0.1, 0.1);
  const time = Math.max(PRIORITY_WEIGHTS.effort[effort] || 2, 1);
  const cst = Math.max(PRIORITY_WEIGHTS.cost[cost] || 1, 1);
  const rsk = Math.max(PRIORITY_WEIGHTS.risk[risk] || 1, 1);
  return Math.round((sev * imp * conf) / (time * cst * rsk));
}

// ── Canonical registries (source-of-truth) ────────────────────────────────────
export const CANONICAL_REGISTRIES = [
  { key: "CanonicalSiteRegistry", desc: "The single authoritative production domain, URL grammar, GSC property, sitemap, deploy targets." },
  { key: "CanonicalLocationRegistry", desc: "Approved location list: city/state slugs, canonical paths/URLs, service radius, serviceability." },
  { key: "WebsiteTemplate", desc: "Per-site config: company name, phone, domain, service area, city/state, color, pricing tier, status." },
  { key: "LaunchCampaign", desc: "Regional rollout tracking: sites deployed, leads, revenue per campaign." },
  { key: "BenchmarkDefinition", desc: "Google 100% benchmark layer definitions (one per layer above)." },
  { key: "BenchmarkResult", desc: "Per-site, per-benchmark measurement results." },
  { key: "OptimizationGap", desc: "Open gap to 100 with deterministic repair_priority_score." },
  { key: "SwarmTask", desc: "Promotable execution tasks (shadow → execute with approval gate)." },
];

// ── Top-level system descriptor ───────────────────────────────────────────────
export const DIGITAL_DOMINANCE_SYSTEM = {
  key: "digital_dominance",
  name: "Digital Dominance",
  version: SYSTEM_VERSION,
  source_version: SOURCE_VERSION,
  fleet_source: FLEET_SOURCE,
  category: "compound",
  generator_type: "bulk_website_factory",
  description:
    "Bulk website generation factory. Mass-produces city/niche-specific sites programmatically, each built to Google's 100% requirements via a distance-to-100 benchmark engine, with strategic per-site content variation so no two deployed sites are identical. 4-stage pipeline: Discover → Build → Validate → Grow. Shadow (dry-run) by default; execute mode requires approval.",
  template: {
    mode: "file_tree",
    label: "Digital Dominance Blueprint",
    variables_schema: [
      { key: "brand_name", label: "Brand Name", type: "text", required: true, help: "The root brand (e.g. EpoxyQuoteNearMe)." },
      { key: "root_domain", label: "Root Domain", type: "text", required: true, help: "Canonical production domain." },
      { key: "niche", label: "Niche / Industry", type: "text", required: true, help: "e.g. epoxy garage floors, HVAC, dental." },
      { key: "accent_color", label: "Accent Color", type: "color", required: true, default: "#0059ff", help: "Brand accent (hex)." },
      { key: "deploy_pattern", label: "Deploy Pattern", type: "select", required: true, default: "subdomain",
        options: ["subdomain", "path", "standalone"], help: "How generated sites are organized." },
      { key: "target_city", label: "Seed City", type: "text", required: true, help: "First city to build (e.g. Miami)." },
      { key: "target_state", label: "Seed State", type: "text", required: true, help: "Full state name (e.g. Florida)." },
      { key: "service_radius_miles", label: "Service Radius (mi)", type: "number", required: false, default: 75, help: "Radius for auto city generation." },
      { key: "site_count", label: "Target Site Count", type: "number", required: false, default: 10, help: "How many sites to provision in this batch." },
      { key: "execution_mode", label: "Execution Mode", type: "select", required: true, default: "shadow",
        options: ["shadow", "execute"], help: "Shadow = dry-run; Execute = promote to production (approval-gated)." },
      { key: "contact_email", label: "Operator Email", type: "text", required: true, help: "Who receives the mission brief." },
    ],
    files: [
      {
        path: "dominance/MISSION.md",
        content: `# Digital Dominance — {{brand_name}}\n\n**Niche:** {{niche}}\n**Root domain:** {{root_domain}}\n**Deploy pattern:** {{deploy_pattern}}\n**Seed market:** {{target_city}}, {{target_state}}\n**Service radius:** {{service_radius_miles}} mi\n**Target sites this batch:** {{site_count}}\n**Execution mode:** {{execution_mode}}\nOperator: {{contact_email}}\n\n## The Vision\nDominate demand, not dashboards. Discover the highest-value {{niche}} demand, create the best digital asset for each opportunity, convert demand into customers, and continuously improve results.\n\n## 4-Stage Factory\n1. **Discover** — Research demand, normalize markets, cluster intent, score opportunities.\n2. **Build** — Generate the right asset per market with strategic content variation.\n3. **Validate** — Visual, functional, performance, accessibility, security + Google 100% gates.\n4. **Grow** — Measure outcomes, learn from winners, repair or retire losers.\n\n## Google 100% Benchmark (Distance-to-100)\nA site reaches 100 when every benchmark layer passes. Open gaps become OptimizationGap records ranked by:\n\`priority = (SEVERITY × IMPACT × CONFIDENCE) / (TIME × COST × RISK)\`\n\nLayers: index_coverage · core_web_vitals · mobile_usability · schema_markup · canonical_hygiene · sitemap_robots · search_console · ga4 · content_unique · eeat · accessibility · security · local_relevance · ai_citability\n\n## Strategic Content Variation (no two sites identical)\ncompany_name · phone · service_area · city/state · hero_image · color_scheme · pricing_tier · faq_local · local_proof · meta_unique\n\n## Execution Gate\n- **shadow** → compile + validate only. No publish, no deploy, no spend.\n- **execute** → promote validated SwarmTasks to production. Requires approval on every PROTECTED action.\n\n> Generated by Digital Dominance template v${SYSTEM_VERSION}. AI steps use Vercel AI Gateway. Live build/deploy/index steps require configured external adapters and approvals.`,
      },
      {
        path: "dominance/site.config.json",
        content: `{\n  "brand": "{{brand_name}}",\n  "root_domain": "{{root_domain}}",\n  "niche": "{{niche}}",\n  "accent": "{{accent_color}}",\n  "deploy_pattern": "{{deploy_pattern}}",\n  "seed": { "city": "{{target_city}}", "state": "{{target_state}}", "radius_miles": {{service_radius_miles}} },\n  "batch": { "site_count": {{site_count}}, "execution_mode": "{{execution_mode}}" },\n  "operator": "{{contact_email}}"\n}`,
      },
      {
        path: "dominance/benchmark.layers.json",
        content: JSON.stringify(GOOGLE_BENCHMARK_LAYERS.map((l) => ({ id: l.id, label: l.label, weight: l.weight, desc: l.desc })), null, 2),
      },
      {
        path: "dominance/variation.axes.json",
        content: JSON.stringify(VARIATION_AXES.map((v) => ({ id: v.id, label: v.label, desc: v.desc })), null, 2),
      },
      {
        path: "dominance/fleet.json",
        content: JSON.stringify(FLEET_AGENTS.map((a) => ({ key: a.key, name: a.name, role: a.role, tier: a.tier })), null, 2),
      },
    ],
  },
};

// ── Deterministic bootstrap (same contract as the lead scraper) ───────────────
function renderTemplate(content, answers) {
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
    if (v.type === "number" && val !== "" && val !== undefined && isNaN(Number(val))) errors.push(`${v.key} must be a number`);
  }
  return { missing, errors };
}

export async function bootstrapDominance(answers) {
  const sys = DIGITAL_DOMINANCE_SYSTEM;
  const schema = sys.template.variables_schema;
  const { missing, errors } = validateAnswers(schema, answers);
  const files = sys.template.files.map((f) => {
    const rendered = f.content.includes("JSON.stringify") ? f.content : renderTemplate(f.content, answers);
    return { path: f.path, content: rendered };
  });
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
    fleet_source: sys.fleet_source,
    generated_at: new Date().toISOString(),
    variables: answers,
    validation: { missing_required: missing, errors, ready: missing.length === 0 && errors.length === 0 },
    files: hashed,
    ai_enrichment: {
      status: "NOT_RUN",
      provider: "vercel-ai-gateway",
      reason: "Deterministic blueprint rendered without invoking AI. AI generator steps use Vercel AI Gateway; live build/deploy/index steps need configured external adapters and approval.",
    },
  };
}
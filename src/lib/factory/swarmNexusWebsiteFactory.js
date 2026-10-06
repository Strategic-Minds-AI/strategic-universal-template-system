// Swarm Nexus Website Factory integration
// Donor: refined-swarm-nexus-core
// Purpose: convert Swarm Nexus triage/checkpoint/parallelism into the existing Strategic Minds Website Factory.
// Apex / Agent Zero remains commander. BatchOperation + AgentTask remain the canonical durable queue.

export const SWARM_NEXUS_FACTORY_VERSION = "1.0.0";
export const SWARM_NEXUS_DONOR = "refined-swarm-nexus-core";

export const FACTORY_SWARM_STAGES = [
  { id: "source_truth", label: "Source Truth", owner: "apex", gate: "required", parallel: false },
  { id: "research", label: "Research", owner: "research_scout", gate: "verified_facts", parallel: true },
  { id: "creative", label: "Creative Directions", owner: "brand_guardian", gate: "selection_required", parallel: true },
  { id: "mockup_lock", label: "Mockup Lock", owner: "visual_lead", gate: "approved_reference", parallel: false },
  { id: "build", label: "Build", owner: "site_factory_manager", gate: "branch_preview_only", parallel: true },
  { id: "validate", label: "Independent Validation", owner: "fault_line", gate: "pass_required", parallel: true },
  { id: "repair", label: "Bounded Repair", owner: "site_factory_manager", gate: "max_5_rounds", parallel: true },
  { id: "grow", label: "SEO / AEO / GEO", owner: "growth_operator", gate: "evidence_required", parallel: true },
  { id: "receipt", label: "Receipt", owner: "apex", gate: "terminal_truth", parallel: false },
];

export const FACTORY_SWARM_ROLES = [
  { key: "apex", name: "Apex / Agent Zero", role: "Permanent commander, source truth, approvals, receipts." },
  { key: "research_scout", name: "Research Scout", role: "Lawful public-business research and competitive context." },
  { key: "brand_guardian", name: "Brand Guardian", role: "Logo, brand and website direction generation." },
  { key: "visual_lead", name: "Visual Systems Lead", role: "Mockup lock, responsive rules and visual source truth." },
  { key: "site_factory_manager", name: "Site Factory Manager", role: "Template composition and branch-safe site build." },
  { key: "frontend_principal", name: "Frontend Principal", role: "Production frontend implementation and states." },
  { key: "backend_principal", name: "Backend Principal", role: "Forms, auth, APIs, CRM and data wiring." },
  { key: "growth_operator", name: "Growth Operator", role: "SEO/AEO/GEO, Search Console and site growth." },
  { key: "fault_line", name: "Xtreme Fault Line", role: "Independent release validation." },
  { key: "repair_agent", name: "Repair Agent", role: "Smallest-delta repair after validator failure." },
];

export const TRIAGE_BANDS = [
  { id: "single", min: 1, max: 1, default_concurrency: 1, default_wave_size: 1 },
  { id: "small", min: 2, max: 25, default_concurrency: 3, default_wave_size: 10 },
  { id: "fleet", min: 26, max: 250, default_concurrency: 5, default_wave_size: 25 },
  { id: "mass", min: 251, max: 2500, default_concurrency: 8, default_wave_size: 50 },
  { id: "mega", min: 2501, max: 10000, default_concurrency: 12, default_wave_size: 100 },
];

export const FACTORY_SWARM_POLICY = {
  execution_mode_default: "shadow",
  execution_modes: ["shadow", "execute"],
  persistent_queue: "BatchOperation + AgentTask",
  checkpoint_after_every_wave: true,
  max_repair_rounds: 5,
  operator_selection_required_for_new_brand_direction: true,
  protected_actions: [
    "production_deploy",
    "protected_branch_merge",
    "production_db_or_rls",
    "dns_domain",
    "secrets",
    "spend_payment",
    "permission_escalation",
    "destructive_action",
    "public_customer_communications",
  ],
  terminal_states: ["PASS", "FAIL", "BLOCKED", "UNKNOWN"],
};

export function resolveTriage(siteCount = 1) {
  const n = Math.max(1, Number(siteCount) || 1);
  return TRIAGE_BANDS.find((band) => n >= band.min && n <= band.max) || TRIAGE_BANDS[TRIAGE_BANDS.length - 1];
}

export function compileFactorySwarmConfig(input = {}) {
  const triage = resolveTriage(input.site_count || input.batch_size || 1);
  return {
    version: SWARM_NEXUS_FACTORY_VERSION,
    donor: SWARM_NEXUS_DONOR,
    triage: triage.id,
    site_count: Math.max(1, Number(input.site_count || input.batch_size || 1)),
    execution_mode: input.execution_mode === "execute" ? "execute" : "shadow",
    concurrency: Math.max(1, Math.min(20, Number(input.concurrency || triage.default_concurrency))),
    wave_size: Math.max(1, Math.min(250, Number(input.wave_size || triage.default_wave_size))),
    source_truth_version: input.source_truth_version || "Strategic_Minds_Universal_Client_Packet_v1.0",
    stages: FACTORY_SWARM_STAGES,
    roles: FACTORY_SWARM_ROLES,
    policy: FACTORY_SWARM_POLICY,
  };
}

// AI Consulting Factory — template registry for prospect -> assessment ->
// strategy -> proposal -> build -> validation -> managed service.

export const DISCOVERY_TEMPLATES = [
  { id: "disc-executive", name: "Executive Discovery", fields: ["vision", "revenue_goals", "growth_targets", "constraints"] },
  { id: "disc-company", name: "Company Discovery", fields: ["size", "structure", "locations", "stage"] },
  { id: "disc-department", name: "Department Discovery", fields: ["departments", "headcount", "functions"] },
  { id: "disc-technology", name: "Technology Discovery", fields: ["stack", "integrations", "tech_debt"] },
  { id: "disc-process", name: "Process Discovery", fields: ["workflows", "bottlenecks", "manual_tasks"] },
  { id: "disc-data", name: "Data Discovery", fields: ["sources", "quality", "governance"] },
  { id: "disc-marketing", name: "Marketing Discovery", fields: ["channels", "funnel", "content"] },
  { id: "disc-sales", name: "Sales Discovery", fields: ["pipeline", "crm", "cycle"] },
  { id: "disc-operations", name: "Operations Discovery", fields: ["supply", "logistics", "ops_tools"] },
  { id: "disc-cs", name: "Customer-service Discovery", fields: ["channels", "volume", "csat"] },
  { id: "disc-ai-readiness", name: "AI-readiness Discovery", fields: ["current_ai_use", "data_maturity", "team_readiness"] },
];

export const READINESS_DIMENSIONS = [
  "business_goals", "existing_software", "data_maturity", "process_maturity",
  "automation_maturity", "ai_maturity", "security", "governance",
  "workforce_readiness", "integration_readiness", "operational_constraints",
];

export const OPPORTUNITY_TYPES = [
  "repetitive_manual_work", "high_cost_workflows", "slow_workflows", "error_prone_workflows",
  "revenue_leakage", "lead_generation", "conversion", "customer_service",
  "knowledge_management", "analytics", "ai_agent", "content", "seo_aeo", "sales",
];

export const PRIORITIZATION_CRITERIA = [
  "business_impact", "implementation_complexity", "data_readiness",
  "integration_complexity", "operational_risk", "time_to_value",
  "reusability", "recurring_revenue_potential",
];

export const STRATEGY_SECTIONS = [
  "current_state", "target_state", "ai_opportunities", "recommended_architecture",
  "data_strategy", "agent_strategy", "automation_strategy", "integration_strategy",
  "governance_model", "security_considerations", "measurement_model", "implementation_roadmap",
];

export const GOVERNANCE_SECTIONS = [
  "ai_usage_policy", "model_governance", "data_handling", "human_approval",
  "audit_trails", "agent_permissions", "tool_permissions", "customer_data_boundaries",
  "model_output_validation", "incident_response", "rollback", "escalation",
];

export const AGENT_ARCHITECTURE = [
  "orchestrator", "specialist_agents", "validators", "message_bus", "queues",
  "memory", "tool_routing", "permissions", "receipts", "escalation", "failure_recovery",
];

export const RAG_SECTIONS = [
  "document_inventory", "data_ingestion", "chunking_strategy", "metadata",
  "source_provenance", "embeddings", "retrieval", "reranking", "citations",
  "freshness", "permissions", "invalidation", "evaluation",
];

export const AUTOMATION_AUDIT_STEPS = [
  "trigger", "input", "decision", "ai_action", "human_approval",
  "system_action", "validation", "receipt", "next_action",
];

export const CONSULTING_SERVICES = [
  { id: "svc-strategy", name: "AI Strategy", includes: ["readiness", "roadmap", "governance", "opportunity_analysis"] },
  { id: "svc-fractional-caio", name: "Fractional CAIO", includes: ["executive_roadmap", "portfolio_management", "vendor_evaluation", "governance", "monthly_reporting", "adoption_plan"] },
  { id: "svc-automation", name: "AI Automation", includes: ["workflow_analysis", "automation_blueprint", "implementation", "monitoring"] },
  { id: "svc-agents", name: "AI Agents", includes: ["single_agent", "multi_agent", "supervised_swarm", "customer_service", "sales", "operations"] },
  { id: "svc-knowledge", name: "AI Knowledge", includes: ["rag", "enterprise_search", "company_knowledge", "document_intelligence"] },
  { id: "svc-data-intel", name: "AI Data Intelligence", includes: ["analytics", "dashboards", "anomaly_monitoring", "predictive", "executive_intelligence"] },
  { id: "svc-marketing", name: "AI Marketing", includes: ["content_automation", "campaign_automation", "personalization", "marketing_intelligence"] },
  { id: "svc-seo-aeo-geo", name: "SEO / AEO / GEO", includes: ["technical_seo", "keyword_intelligence", "content_architecture", "schema", "search_console", "analytics", "ai_search_optimization", "citation_readiness"] },
  { id: "svc-crm", name: "AI CRM", includes: ["lead_capture", "qualification", "nurturing", "follow_up", "sales_intelligence"] },
  { id: "svc-comms", name: "AI Communications", includes: ["email", "sms", "voice", "chat", "support"] },
  { id: "svc-custom", name: "Custom AI Software", includes: ["web_app", "saas", "dashboard", "internal_app", "pwa", "agent_platform"] },
];

export const CONSULTING_PACKAGES = [
  { id: "pkg-strategy", name: "Strategy", includes: ["assessment", "roadmap", "architecture"], pricing: "configurable" },
  { id: "pkg-build", name: "Build", includes: ["implementation_of_approved_system"], pricing: "configurable" },
  { id: "pkg-scale", name: "Scale", includes: ["optimization", "analytics", "automation", "managed_operations"], pricing: "configurable" },
  { id: "pkg-enterprise", name: "Enterprise", includes: ["governance", "multi_system_integration", "security", "data", "agents", "managed_operations"], pricing: "configurable" },
];

export const CONSULTING_DOCUMENTS = [
  "discovery_questionnaire", "meeting_agenda", "meeting_notes", "executive_brief",
  "ai_readiness_report", "opportunity_report", "technical_audit", "automation_audit",
  "data_audit", "security_governance_audit", "architecture_document", "solution_blueprint",
  "build_specification", "proposal", "scope_of_work", "statement_of_work",
  "implementation_roadmap", "project_plan", "change_order", "acceptance_criteria",
  "validation_report", "training_guide", "sop", "client_handoff",
  "monthly_performance_report", "quarterly_business_review", "renewal_proposal",
  "expansion_proposal", "offboarding_package",
];

export const CUSTOMER_JOURNEY = [
  "lead", "discovery", "qualification", "assessment", "strategy", "proposal",
  "approval", "provisioning", "build", "validation", "deployment", "training",
  "managed_service", "reporting", "optimization", "renewal", "expansion",
];

export const INDUSTRY_PACKS = [
  { id: "ind-professional", name: "Professional Services", sub: ["ai_consulting", "consulting", "agency", "legal", "accounting", "advisory"] },
  { id: "ind-saas", name: "SaaS / Technology", sub: ["saas", "ai_software", "developer_tools", "api_products", "automation_platforms"] },
  { id: "ind-local", name: "Local Services", sub: ["contractor", "concrete", "flooring", "roofing", "hvac", "plumbing", "electrical", "landscaping", "cleaning", "restoration"] },
  { id: "ind-construction", name: "Construction", sub: ["estimating", "project_management", "field_service", "scheduling", "inventory", "bid_generation", "documentation"] },
  { id: "ind-ecommerce", name: "Ecommerce", sub: ["catalog", "search", "product", "cart", "checkout", "account", "subscriptions"] },
  { id: "ind-marketplace", name: "Marketplace", sub: ["buyer", "seller", "listings", "discovery", "transactions", "reviews"] },
  { id: "ind-realestate", name: "Real Estate", sub: ["listings", "property_intelligence", "investor_dashboard", "lead_gen", "deal_analysis"] },
  { id: "ind-education", name: "Education / Training", sub: ["courses", "certification", "progress", "community", "lms"] },
  { id: "ind-crm", name: "CRM / Sales", sub: ["leads", "pipeline", "accounts", "opportunities", "activity", "automation"] },
  { id: "ind-data", name: "Data / BI", sub: ["executive_dashboard", "operational_dashboard", "analytics", "reporting", "alerts"] },
  { id: "ind-social", name: "Social / Community", sub: ["feed", "profiles", "messaging", "creator_pages", "video", "community", "discovery"] },
  { id: "ind-directory", name: "Directory / Near-Me", sub: ["location_discovery", "map", "profile", "reviews", "offers", "contact", "booking", "favorites"] },
  { id: "ind-booking", name: "Booking", sub: ["availability", "scheduling", "service_selection", "reminders", "account"] },
  { id: "ind-enterprise", name: "Enterprise Internal Apps", sub: ["operations", "approvals", "admin", "workflows", "reporting", "knowledge"] },
];

// Score readiness from discovery answers (deterministic, no fabrication).
export function scoreReadiness(answers = {}) {
  const scores = {};
  READINESS_DIMENSIONS.forEach((dim) => {
    const v = answers[dim];
    if (typeof v === "number") scores[dim] = Math.min(5, Math.max(0, v));
    else if (v === "high") scores[dim] = 5;
    else if (v === "medium") scores[dim] = 3;
    else if (v === "low") scores[dim] = 1;
    else scores[dim] = 0;
  });
  const overall = Object.values(scores).reduce((a, b) => a + b, 0) / READINESS_DIMENSIONS.length;
  return { dimensions: scores, overall: Number(overall.toFixed(1)) };
}
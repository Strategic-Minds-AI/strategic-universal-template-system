-- =============================================================================
-- standalone/schema.sql — Supabase schema for the standalone (off-Base44) build.
-- Mirrors every Base44 entity in base44/entities/*.jsonc to a Postgres table.
-- Table names are PascalCase (quoted) so the standalone client's
-- `/rest/v1/<EntityName>` calls resolve exactly. Column names are snake_case to
-- match the entity field names the app already queries (incl. created_by_id,
-- created_date, updated_date). Enums are text (validated at the app layer).
-- Run this in the Supabase SQL editor for your project.
-- =============================================================================

create extension if not exists "pgcrypto";

-- role helper: app role stored in the JWT claim "role" (set via Supabase auth)
create or replace function is_admin() returns boolean language sql stable as $$
  select coalesce((auth.jwt() ->> 'role') = 'admin', false);
$$;

-- auto-update updated_date
create or replace function set_updated_date() returns trigger language plpgsql as $$
begin new.updated_date = now(); return new; end;
$$;

-- standard RLS appliers
create or replace function apply_owner_admin_rls(tbl text, create_admin boolean default false) returns void language plpgsql as $$
begin
  execute format('alter table %I enable row level security', tbl);
  execute format('create policy %I on %I for select using (auth.uid() = created_by_id or is_admin())', tbl||'_read', tbl);
  if create_admin then
    execute format('create policy %I on %I for insert with check (is_admin())', tbl||'_ins', tbl);
  else
    execute format('create policy %I on %I for insert with check (true)', tbl||'_ins', tbl);
  end if;
  execute format('create policy %I on %I for update using (auth.uid() = created_by_id or is_admin()) with check (auth.uid() = created_by_id or is_admin())', tbl||'_upd', tbl);
  execute format('create policy %I on %I for delete using (is_admin())', tbl||'_del', tbl);
  execute format('create trigger %I before update on %I for each row execute function set_updated_date()', tbl||'_upd_trg', tbl);
end;
$$;

create or replace function apply_default_rls(tbl text) returns void language plpgsql as $$
begin
  execute format('alter table %I enable row level security', tbl);
  execute format('create policy %I on %I for select using (true)', tbl||'_read', tbl);
  execute format('create policy %I on %I for insert with check (true)', tbl||'_ins', tbl);
  execute format('create policy %I on %I for update using (auth.uid() = created_by_id or is_admin()) with check (auth.uid() = created_by_id or is_admin())', tbl||'_upd', tbl);
  execute format('create policy %I on %I for delete using (is_admin())', tbl||'_del', tbl);
  execute format('create trigger %I before update on %I for each row execute function set_updated_date()', tbl||'_upd_trg', tbl);
end;
$$;

create or replace function apply_admin_rls(tbl text) returns void language plpgsql as $$
begin
  execute format('alter table %I enable row level security', tbl);
  execute format('create policy %I on %I for select using (is_admin())', tbl||'_read', tbl);
  execute format('create policy %I on %I for insert with check (is_admin())', tbl||'_ins', tbl);
  execute format('create policy %I on %I for update using (is_admin()) with check (is_admin())', tbl||'_upd', tbl);
  execute format('create policy %I on %I for delete using (is_admin())', tbl||'_del', tbl);
  execute format('create trigger %I before update on %I for each row execute function set_updated_date()', tbl||'_upd_trg', tbl);
end;
$$;

-- built-in columns repeated per table: id uuid pk, created_date, updated_date, created_by_id
create table "AdapterDefinition" (id uuid primary key default gen_random_uuid(), created_date timestamptz default now(), updated_date timestamptz default now(), created_by_id uuid, adapter_key text not null, name text not null, version text, manifest jsonb not null, enabled boolean default false, health_state text default 'not_configured', config_status jsonb, secret_references jsonb, tenant_id text);
create table "GeneratorDefinition" (id uuid primary key default gen_random_uuid(), created_date timestamptz default now(), updated_date timestamptz default now(), created_by_id uuid, generator_key text not null, name text not null, category text, generator_type text, version text not null, definition jsonb not null, definition_sha256 text, status text default 'draft', parent_version text, description text, capabilities jsonb, tenant_id text);
create table "ReleaseProfile" (id uuid primary key default gen_random_uuid(), created_date timestamptz default now(), updated_date timestamptz default now(), created_by_id uuid, profile_key text not null, name text not null, version text not null, status text default 'draft', definition jsonb not null, description text);
create table "ProvisioningProfile" (id uuid primary key default gen_random_uuid(), created_date timestamptz default now(), updated_date timestamptz default now(), created_by_id uuid, profile_key text not null, name text not null, version text not null, status text default 'draft', definition jsonb not null, description text);
create table "WorkflowDefinition" (id uuid primary key default gen_random_uuid(), created_date timestamptz default now(), updated_date timestamptz default now(), created_by_id uuid, workflow_key text not null, name text not null, version text not null, category text, status text default 'draft', definition jsonb not null, description text);
create table "QualityProfile" (id uuid primary key default gen_random_uuid(), created_date timestamptz default now(), updated_date timestamptz default now(), created_by_id uuid, profile_key text not null, name text not null, version text not null, status text default 'draft', definition jsonb not null, description text);
create table "ValidationProfile" (id uuid primary key default gen_random_uuid(), created_date timestamptz default now(), updated_date timestamptz default now(), created_by_id uuid, profile_key text not null, name text not null, version text not null, status text default 'draft', definition jsonb not null, description text);
create table "MonetizationProfile" (id uuid primary key default gen_random_uuid(), created_date timestamptz default now(), updated_date timestamptz default now(), created_by_id uuid, profile_key text not null, name text not null, version text not null, status text default 'draft', definition jsonb not null, description text);
create table "RuntimeProfile" (id uuid primary key default gen_random_uuid(), created_date timestamptz default now(), updated_date timestamptz default now(), created_by_id uuid, profile_key text not null, name text not null, version text not null, status text default 'draft', definition jsonb not null, description text);
create table "PolicyDefinition" (id uuid primary key default gen_random_uuid(), created_date timestamptz default now(), updated_date timestamptz default now(), created_by_id uuid, policy_key text not null, name text not null, version text not null, category text, status text default 'draft', definition jsonb not null, description text);
create table "RepairTask" (id uuid primary key default gen_random_uuid(), created_date timestamptz default now(), updated_date timestamptz default now(), created_by_id uuid, tenant_id text, run_id text not null, validation_id text, target_step_key text not null, failing_layer text, status text default 'open', repair_spec jsonb not null, attempt numeric default 0, result jsonb);
create table "Tenant" (id uuid primary key default gen_random_uuid(), created_date timestamptz default now(), updated_date timestamptz default now(), created_by_id uuid, name text not null, slug text, plan text default 'sandbox', status text default 'active', settings jsonb);
create table "RunValidation" (id uuid primary key default gen_random_uuid(), created_date timestamptz default now(), updated_date timestamptz default now(), created_by_id uuid, tenant_id text, run_id text not null, validator_id text not null, validator_layer text, subject_hash text not null, status text not null, evidence jsonb, failures jsonb, mandatory boolean default true);
create table "ProvisioningPlan" (id uuid primary key default gen_random_uuid(), created_date timestamptz default now(), updated_date timestamptz default now(), created_by_id uuid, tenant_id text, project_id text not null, template_id text not null, plan jsonb not null, current_state jsonb, desired_state jsonb, diff jsonb, actions jsonb, risk_summary jsonb, credential_requirements jsonb, rollback jsonb, status text default 'draft', dry_run boolean default true);
create table "Artifact" (id uuid primary key default gen_random_uuid(), created_date timestamptz default now(), updated_date timestamptz default now(), created_by_id uuid, tenant_id text, run_id text not null, step_key text, name text not null, media_type text not null, path text, storage_ref text, content text, sha256 text not null, size_bytes numeric, metadata jsonb, validation_state text default 'unvalidated', dependencies jsonb);
create table "Approval" (id uuid primary key default gen_random_uuid(), created_date timestamptz default now(), updated_date timestamptz default now(), created_by_id uuid, tenant_id text, run_id text not null, action_key text not null, risk_class text, status text default 'pending', request jsonb not null, resolved_by_id text, resolved_at timestamptz, reason text);
create table "AuditEvent" (id uuid primary key default gen_random_uuid(), created_date timestamptz default now(), updated_date timestamptz default now(), created_by_id uuid, tenant_id text, actor_id text, event_type text not null, entity_type text not null, entity_id text not null, payload jsonb not null, severity text default 'info');
create table "RunStep" (id uuid primary key default gen_random_uuid(), created_date timestamptz default now(), updated_date timestamptz default now(), created_by_id uuid, run_id text not null, step_key text not null, step_type text, status text default 'pending', attempt_count numeric default 0, node_config jsonb, input jsonb, output jsonb, error jsonb, idempotency_key text, started_at timestamptz, completed_at timestamptz, child_run_id text);
create table "TemplatePack" (id uuid primary key default gen_random_uuid(), created_date timestamptz default now(), updated_date timestamptz default now(), created_by_id uuid, tenant_id text, template_key text, name text, version text, mode text, manifest jsonb, sha256 text, status text default 'draft', dependencies jsonb);
create table "GeneratorRun" (id uuid primary key default gen_random_uuid(), created_date timestamptz default now(), updated_date timestamptz default now(), created_by_id uuid, tenant_id text, project_id text, generator_id text, generator_key text, generator_version text, status text default 'DRAFT', input jsonb, input_hash text not null, seed text, run_manifest jsonb, parent_run_id text, root_run_id text, depth numeric default 0, result jsonb, error jsonb, started_at timestamptz, completed_at timestamptz);
create table "ConsultingEngagement" (id uuid primary key default gen_random_uuid(), created_date timestamptz default now(), updated_date timestamptz default now(), created_by_id uuid, client_name text not null, contact_email text, stage text default 'lead', discovery_data jsonb, readiness_score jsonb, opportunities jsonb, strategy jsonb, governance jsonb, proposal jsonb, package text);
create table "ProjectSelection" (id uuid primary key default gen_random_uuid(), created_date timestamptz default now(), updated_date timestamptz default now(), created_by_id uuid, project_id text not null, family text not null, pattern_id text not null, pattern_name text, score numeric, frozen boolean default false, source text default 'operator', rationale text);
create table "ScreenSpec" (id uuid primary key default gen_random_uuid(), created_date timestamptz default now(), updated_date timestamptz default now(), created_by_id uuid, project_id text not null, route text not null, title text not null, "order" numeric, sections jsonb, components jsonb, states jsonb, responsive_rules jsonb, backend_dependencies jsonb, analytics_events jsonb, placeholder_content jsonb);
create table "ValidationReceipt" (id uuid primary key default gen_random_uuid(), created_date timestamptz default now(), updated_date timestamptz default now(), created_by_id uuid, project_id text not null, build_spec_hash text, registry_version text, validator_id text default 'uff-validator-v1', hard_gates jsonb, scores jsonb, deltas jsonb, repair_round numeric default 0, result text not null, evidence jsonb);
create table "VersionSnapshot" (id uuid primary key default gen_random_uuid(), created_date timestamptz default now(), updated_date timestamptz default now(), created_by_id uuid, project_id text not null, label text not null, snapshot jsonb);
create table "GeneratedBuildSpec" (id uuid primary key default gen_random_uuid(), created_date timestamptz default now(), updated_date timestamptz default now(), created_by_id uuid, project_id text not null, build_spec jsonb, token_json jsonb, export_packet jsonb, registry_hash text, build_spec_hash text, approved boolean default false);
create table "Project" (id uuid primary key default gen_random_uuid(), created_date timestamptz default now(), updated_date timestamptz default now(), created_by_id uuid, name text not null, company text, industry text, product_archetype text, platforms jsonb, primary_goal text, primary_conversion text, seed text, mode text, status text default 'draft', registry_version text, quality_profile text default 'ceiling', intake jsonb, summary text);
create table "ProvisioningManifest" (id uuid primary key default gen_random_uuid(), created_date timestamptz default now(), updated_date timestamptz default now(), created_by_id uuid, project_id text not null, template_id text not null, template_type text not null, dry_run boolean default true, items jsonb, rollback_plan jsonb, status text default 'draft');
create table "VarianceRequest" (id uuid primary key default gen_random_uuid(), created_date timestamptz default now(), updated_date timestamptz default now(), created_by_id uuid, project_id text not null, locked_field text not null, requested_change text not null, reason text, status text default 'open');
create table "TemplateRecord" (id uuid primary key default gen_random_uuid(), created_date timestamptz default now(), updated_date timestamptz default now(), created_by_id uuid, type text not null, name text not null, template_id text not null, version text default '1.0.0', category text, payload jsonb, status text default 'draft', tags jsonb);
-- connector token store for the standalone build (admin-managed)
create table "connections" (id uuid primary key default gen_random_uuid(), created_date timestamptz default now(), updated_date timestamptz default now(), created_by_id uuid, type text not null, provider text, access_token text not null, refresh_token text, expires_at timestamptz, enabled boolean default true, metadata jsonb);

-- RLS
select apply_owner_admin_rls('AdapterDefinition', true);
select apply_owner_admin_rls('GeneratorDefinition', false);
select apply_owner_admin_rls('ReleaseProfile', false);
select apply_owner_admin_rls('ProvisioningProfile', false);
select apply_owner_admin_rls('WorkflowDefinition', false);
select apply_owner_admin_rls('QualityProfile', false);
select apply_owner_admin_rls('ValidationProfile', false);
select apply_owner_admin_rls('MonetizationProfile', false);
select apply_owner_admin_rls('RuntimeProfile', false);
select apply_owner_admin_rls('PolicyDefinition', false);
select apply_owner_admin_rls('RepairTask', false);
select apply_admin_rls('Tenant');
select apply_owner_admin_rls('RunValidation', false);
select apply_owner_admin_rls('ProvisioningPlan', false);
select apply_owner_admin_rls('Artifact', false);
select apply_owner_admin_rls('Approval', true);
select apply_owner_admin_rls('AuditEvent', true);
select apply_owner_admin_rls('RunStep', false);
select apply_owner_admin_rls('TemplatePack', false);
select apply_owner_admin_rls('GeneratorRun', false);
select apply_default_rls('ConsultingEngagement');
select apply_default_rls('ProjectSelection');
select apply_default_rls('ScreenSpec');
select apply_default_rls('ValidationReceipt');
select apply_default_rls('VersionSnapshot');
select apply_default_rls('GeneratedBuildSpec');
select apply_default_rls('Project');
select apply_default_rls('ProvisioningManifest');
select apply_default_rls('VarianceRequest');
select apply_default_rls('TemplateRecord');
select apply_admin_rls('connections');

-- storage buckets (create in Supabase Storage UI or via storage schema)
insert into storage.buckets (id, name, public) values ('private','private',false) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('public','public',true) on conflict do nothing;
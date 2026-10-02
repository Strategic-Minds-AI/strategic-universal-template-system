// GeneratorDefinition DSL compiler.
// Pure, deterministic, frontend-importable. Validates a definition against the
// structural contract and compiles its workflow_dag into an ordered execution plan.
import { NODE_TYPES } from "./registry.js";

const SEMVER_RE = /^[0-9]+\.[0-9]+\.[0-9]+$/;
const KEY_RE = /^[a-z0-9][a-z0-9._-]+$/;

// Validate a GeneratorDefinition structurally. Returns { valid, errors[] }.
export function validateDefinition(def) {
  const errors = [];
  if (!def || typeof def !== "object") return { valid: false, errors: ["definition is not an object"] };

  if (!def.id || typeof def.id !== "string") errors.push("id is required (string)");
  else if (!KEY_RE.test(def.id)) errors.push(`id "${def.id}" must match ${KEY_RE}`);

  if (!def.name || typeof def.name !== "string") errors.push("name is required (non-empty string)");
  if (!def.version || typeof def.version !== "string") errors.push("version is required (string)");
  else if (!SEMVER_RE.test(def.version)) errors.push(`version "${def.version}" must be semver x.y.z`);

  if (!def.input_schema || typeof def.input_schema !== "object") errors.push("input_schema is required (object)");
  if (!def.output_contract || typeof def.output_contract !== "object") errors.push("output_contract is required (object)");

  if (!def.workflow_dag || typeof def.workflow_dag !== "object") {
    errors.push("workflow_dag is required (object)");
  } else {
    const dagErrs = validateDag(def.workflow_dag);
    errors.push(...dagErrs);
  }

  if (!def.validation_policy || typeof def.validation_policy !== "object") errors.push("validation_policy is required (object)");
  if (!def.security_policy || typeof def.security_policy !== "object") errors.push("security_policy is required (object)");

  return { valid: errors.length === 0, errors };
}

export function validateDag(dag) {
  const errors = [];
  if (!Array.isArray(dag.nodes)) return ["workflow_dag.nodes must be an array"];
  if (!Array.isArray(dag.edges)) return ["workflow_dag.edges must be an array"];
  if (dag.nodes.length === 0) errors.push("workflow_dag.nodes is empty");

  const ids = new Set();
  const nodeById = {};
  for (const n of dag.nodes) {
    if (!n.id || typeof n.id !== "string") { errors.push("node missing id"); continue; }
    if (ids.has(n.id)) errors.push(`duplicate node id "${n.id}"`);
    ids.add(n.id);
    if (!NODE_TYPES.includes(n.type)) errors.push(`node "${n.id}" has invalid type "${n.type}"`);
    nodeById[n.id] = n;
  }

  for (const e of dag.edges) {
    if (!e.from || !e.to) { errors.push("edge missing from/to"); continue; }
    if (!nodeById[e.from]) errors.push(`edge from unknown node "${e.from}"`);
    if (!nodeById[e.to]) errors.push(`edge to unknown node "${e.to}"`);
  }

  const cycle = detectCycle(dag);
  if (cycle) errors.push(`cycle detected: ${cycle.join(" -> ")}`);

  // Every node must be reachable unless it's a root
  const roots = rootsOf(dag);
  if (roots.length === 0 && dag.nodes.length > 0) errors.push("dag has no root node (all nodes have inbound edges)");

  return errors;
}

export function detectCycle(dag) {
  const adj = {};
  for (const n of dag.nodes) adj[n.id] = [];
  for (const e of dag.edges) { if (adj[e.from]) adj[e.from].push(e.to); }
  const WHITE = 0, GRAY = 1, BLACK = 2;
  const color = {};
  for (const n of dag.nodes) color[n.id] = WHITE;
  let cyclePath = null;
  function dfs(u, path) {
    color[u] = GRAY;
    path.push(u);
    for (const v of adj[u] || []) {
      if (color[v] === GRAY) { cyclePath = [...path, v]; return true; }
      if (color[v] === WHITE && dfs(v, path)) return true;
    }
    path.pop();
    color[u] = BLACK;
    return false;
  }
  for (const n of dag.nodes) if (color[n.id] === WHITE && dfs(n.id, [])) break;
  return cyclePath;
}

export function rootsOf(dag) {
  const hasInbound = new Set();
  for (const e of dag.edges) hasInbound.add(e.to);
  return dag.nodes.filter((n) => !hasInbound.has(n.id));
}

// Topological sort (Kahn's algorithm). Returns ordered node ids.
export function topoSort(dag) {
  const adj = {}, indeg = {};
  for (const n of dag.nodes) { adj[n.id] = []; indeg[n.id] = 0; }
  for (const e of dag.edges) { if (adj[e.from] && indeg[e.to] !== undefined) { adj[e.from].push(e.to); indeg[e.to]++; } }
  const queue = dag.nodes.filter((n) => indeg[n.id] === 0).map((n) => n.id).sort();
  const order = [];
  while (queue.length) {
    const u = queue.shift();
    order.push(u);
    for (const v of (adj[u] || []).sort()) { indeg[v]--; if (indeg[v] === 0) queue.push(v); }
  }
  return order;
}

// Compile a definition into an execution plan: ordered nodes with resolved config.
export function compileDefinition(def) {
  const v = validateDefinition(def);
  if (!v.valid) return { ok: false, errors: v.errors };
  const order = topoSort(def.workflow_dag);
  const nodeById = {};
  for (const n of def.workflow_dag.nodes) nodeById[n.id] = n;
  const plan = order.map((id) => nodeById[id]);
  return { ok: true, plan, order, nodeById };
}

// Compute a deterministic definition hash (structural, not cryptographic — used for identity).
export function definitionFingerprint(def) {
  const stable = JSON.stringify({
    id: def.id, version: def.version, input_schema: def.input_schema,
    output_contract: def.output_contract, workflow_dag: def.workflow_dag,
    templates: def.templates, adapters: def.adapters, model_policy: def.model_policy,
    validation_policy: def.validation_policy, repair_policy: def.repair_policy,
    security_policy: def.security_policy, approval_policy: def.approval_policy,
    limits: def.limits, export_policy: def.export_policy,
  }, Object.keys(def).sort());
  return stable;
}
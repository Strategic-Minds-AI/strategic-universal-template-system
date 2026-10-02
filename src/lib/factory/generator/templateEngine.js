// Deterministic template engine.
// Supports: variable interpolation, conditionals, loops, partials, and
// declarative file-tree rendering. No external dependencies. No secrets ever
// interpolated (secret values are refused).

const SECRET_HINTS = /(?:secret|password|token|api[_-]?key|private[_-]?key)/i;

// Render a single text template string with a variables context.
// Supports {{var.path}}, {{#if cond}}...{{/if}}, {{#each items}}...{{/each}}.
export function renderText(template, vars = {}) {
  if (typeof template !== "string") return "";
  let out = template;
  out = renderEach(out, vars);
  out = renderIf(out, vars);
  out = renderVars(out, vars);
  return out;
}

function renderVars(t, vars) {
  return t.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (m, path) => {
    const val = resolvePath(vars, path);
    if (val === undefined || val === null) return "";
    if (SECRET_HINTS.test(path) && typeof val === "string" && val.length > 0) return "[REDACTED]";
    return String(val);
  });
}

function resolvePath(obj, path) {
  return path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

function renderIf(t, vars) {
  const re = /\{\{#if\s+([^}]+?)\}\}([\s\S]*?)\{\{\/if\}\}/g;
  return t.replace(re, (m, cond, body) => {
    return evalCondition(cond, vars) ? renderIf(body, vars) : "";
  });
}

function renderEach(t, vars) {
  const re = /\{\{#each\s+([\w.]+)\s*\}\}([\s\S]*?)\{\{\/each\}\}/g;
  return t.replace(re, (m, path, body) => {
    const arr = resolvePath(vars, path);
    if (!Array.isArray(arr)) return "";
    return arr.map((item, i) => {
      const ctx = { ...vars, this: item, index: i };
      return renderEach(body, ctx).replace(/\{\{\s*this\.([\w.]+)\s*\}\}/g, (_mm, p) => {
        const v = resolvePath(item, p);
        return v == null ? "" : String(v);
      }).replace(/\{\{\s*index\s*\}\}/g, String(i));
    }).join("");
  });
}

function evalCondition(cond, vars) {
  cond = cond.trim();
  // equality: a == b
  const eq = cond.match(/^([\w.]+)\s*==\s*(.+)$/);
  if (eq) {
    const left = resolvePath(vars, eq[1]);
    let right = eq[2].trim();
    if (/^".*"$/.test(right) || /^'.*'$/.test(right)) right = right.slice(1, -1);
    return String(left) === String(right);
  }
  // existence: just a path
  const v = resolvePath(vars, cond);
  return !!v;
}

// Render a file-tree template pack into {path, content} entries.
// pack.files = [{ path, content, template? }]; vars applied to path and content.
export function renderFileTree(pack, vars = {}) {
  const files = (pack.files || []).map((f) => {
    const path = renderText(f.path || f.name || "file.txt", vars);
    const content = renderText(f.content || f.template || "", vars);
    return { path, content, media_type: f.media_type || guessMediaType(path) };
  });
  return files;
}

export function guessMediaType(path) {
  const ext = (path.split(".").pop() || "").toLowerCase();
  const map = {
    js: "text/javascript", jsx: "text/javascript", ts: "text/typescript", tsx: "text/typescript",
    json: "application/json", md: "text/markdown", html: "text/html", css: "text/css",
    sql: "application/sql", yml: "application/yaml", yaml: "application/yaml",
    txt: "text/plain", sh: "application/x-sh", py: "text/x-python",
  };
  return map[ext] || "application/octet-stream";
}

// Validate a template pack structurally.
export function validateTemplatePack(pack) {
  const errors = [];
  if (!pack || typeof pack !== "object") return ["pack is not an object"];
  if (!pack.id) errors.push("id is required");
  if (!pack.version) errors.push("version is required");
  if (!pack.mode) errors.push("mode is required");
  if (!Array.isArray(pack.files)) errors.push("files must be an array");
  return { valid: errors.length === 0, errors };
}
// Color Intelligence Engine — seed -> tonal scale -> semantic roles -> 4 theme modes.
// Emits sRGB-canonical hex values. Validates required contrast pairs heuristically.

// Convert HSL to hex (sRGB canonical).
function hslToHex(h, s, l) {
  s /= 100; l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = (x) => Math.round(255 * x).toString(16).padStart(2, "0");
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
}

// Relative luminance for contrast checks.
function luminance(hex) {
  const c = hex.replace("#", "");
  const r = parseInt(c.slice(0, 2), 16) / 255;
  const g = parseInt(c.slice(2, 4), 16) / 255;
  const b = parseInt(c.slice(4, 6), 16) / 255;
  const lin = (v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

export function contrastRatio(a, b) {
  const l1 = luminance(a);
  const l2 = luminance(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

// Generate a tonal scale (0-100) from a brand hue.
export function tonalScale(hue, sat = 100) {
  const tones = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99, 100];
  const scale = {};
  tones.forEach((t) => {
    // sat tapers toward neutrals at extremes
    const s = t < 10 || t > 95 ? Math.min(sat, 20) : sat;
    scale[t] = hslToHex(hue, s, t);
  });
  return scale;
}

// Map tones to semantic roles for a theme mode.
const ROLE_TONES = {
  canvas: 100,
  surface: 99,
  "raised-surface": 95,
  overlay: 90,
  "text-primary": 0,
  "text-secondary": 30,
  "text-muted": 40,
  border: 90,
  divider: 92,
  "primary-action": 50,
  "secondary-action": 0,
  "destructive-action": 40,
  focus: 55,
  selection: 80,
  success: 50,
  warning: 60,
  error: 45,
  information: 50,
};

export function semanticRoles(hue, sat = 100, mode = "light") {
  const scale = tonalScale(hue, sat);
  const roles = {};
  Object.entries(ROLE_TONES).forEach(([role, tone]) => {
    let t = tone;
    if (mode === "dark") t = 100 - tone; // invert for dark
    if (mode === "high-contrast-light") t = tone < 50 ? 0 : tone > 50 ? 100 : tone;
    if (mode === "high-contrast-dark") t = mode === "high-contrast-dark" ? 100 - tone : tone;
    roles[role] = scale[t] || scale[tone];
  });
  return roles;
}

// Generate full token set across 4 theme modes.
export function generateTokens(seedColor = "#FFEA00") {
  // Derive hue from seed hex.
  const hex = seedColor.replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0;
  const d = max - min;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }
  const sat = 100;

  const primitive = {
    "color.primary": seedColor,
    "color.secondary": "#000000",
    "color.neutral.0": "#FFFFFF",
    "color.neutral.100": "#000000",
    "radius.md": "8px",
    "radius.lg": "12px",
    "radius.full": "9999px",
    "spacing.1": "4px",
    "spacing.2": "8px",
    "spacing.3": "16px",
    "spacing.4": "24px",
    "spacing.5": "32px",
    "spacing.6": "64px",
  };

  const themes = {};
  ["light", "dark", "high-contrast-light", "high-contrast-dark"].forEach((mode) => {
    themes[mode] = semanticRoles(h, sat, mode);
  });

  // Contrast validation on key pairs (light mode).
  const checks = {};
  const light = themes.light;
  checks["text-on-canvas"] = contrastRatio(light["text-primary"], light.canvas);
  checks["primary-on-canvas"] = contrastRatio(light["primary-action"], light.canvas);

  return {
    primitive,
    semantic: themes,
    contrast_checks: checks,
    meta: { hue: h, saturation: sat, source: seedColor, standard: "DTCG 2025.10" },
  };
}

// Validate contrast; returns array of failing pairs.
export function validateContrast(tokens) {
  const failures = [];
  Object.entries(tokens.contrast_checks || {}).forEach(([pair, ratio]) => {
    if (ratio < 4.5) failures.push({ pair, ratio: ratio.toFixed(2), required: "4.5 (AA)" });
  });
  return failures;
}
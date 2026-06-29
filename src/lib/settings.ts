/** Per-browser personalization for the dashboard (board title, theme, etc). */

export type ThemeMode = "light" | "dark";

export type Settings = {
  boardTitle: string;
  theme: ThemeMode;
  /** Primary/accent colour as a hex string; drives every highlight. */
  primary: string;
  /** Background image path under /public, or "" for a plain backdrop. */
  background: string;
  /** Hide done tasks completed more than N days ago; 0 = never hide. */
  archiveDays: number;
};

export const DEFAULT_SETTINGS: Settings = {
  boardTitle: "Personal Tracker",
  theme: "light",
  primary: "#f43f5e",
  background: "/bg-2.jpg",
  archiveDays: 90,
};

/** Choices for the auto-hide threshold (Settings). */
export const ARCHIVE_DAY_OPTIONS = [
  { label: "30 days", value: 30 },
  { label: "90 days", value: 90 },
  { label: "180 days", value: 180 },
  { label: "1 year", value: 365 },
  { label: "Never", value: 0 },
];

/** Choices for the manual "purge old done tasks" action (Settings). */
export const PURGE_DAY_OPTIONS = [
  { label: "30 days", value: 30 },
  { label: "90 days", value: 90 },
  { label: "180 days", value: 180 },
  { label: "1 year", value: 365 },
];

export const PRIMARY_COLORS = [
  { name: "Emerald", value: "#10b981" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Violet", value: "#8b5cf6" },
  { name: "Rose", value: "#f43f5e" },
  { name: "Amber", value: "#f59e0b" },
  { name: "Slate", value: "#64748b" },
];

export const BACKGROUNDS = [
  { name: "Autumn leaves", value: "/bg.jpg" },
  { name: "Green leaves", value: "/bg-2.jpg" },
  { name: "Hot air balloon", value: "/bg-3.jpg" },
  { name: "Icy shore", value: "/bg-4.jpg" },
  { name: "Sand dunes at night", value: "/bg-5.jpg" },
  { name: "Snowy pass", value: "/bg-6.jpg" },
  { name: "Desert", value: "/bg-7.jpg" },
  { name: "Pine forest", value: "/bg-8.jpg" },
  { name: "Plain", value: "" },
];

/**
 * Darken an accent only as much as needed so white text clears ~4.5:1
 * contrast on a solid fill. Already-dark colours pass through unchanged;
 * bright ones (amber, emerald) deepen just enough to stay legible.
 */
function strongAccent(hex: string): string {
  const c = hex.replace("#", "");
  if (c.length < 6) return hex;
  const r0 = parseInt(c.slice(0, 2), 16);
  const g0 = parseInt(c.slice(2, 4), 16);
  const b0 = parseInt(c.slice(4, 6), 16);
  const toLin = (v: number) => {
    const n = v / 255;
    return n <= 0.03928 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4);
  };
  const lumAt = (k: number) =>
    0.2126 * toLin(r0 * k) + 0.7152 * toLin(g0 * k) + 0.0722 * toLin(b0 * k);
  const target = 0.183; // luminance where white text hits ~4.5:1
  let k = 1;
  if (lumAt(1) > target) {
    let lo = 0;
    let hi = 1;
    for (let i = 0; i < 24; i++) {
      const mid = (lo + hi) / 2;
      if (lumAt(mid) <= target) lo = mid;
      else hi = mid;
    }
    k = lo;
  }
  const hex2 = (n: number) =>
    Math.round(n * k)
      .toString(16)
      .padStart(2, "0");
  return `#${hex2(r0)}${hex2(g0)}${hex2(b0)}`;
}

/** Push the current settings into the DOM (theme class, accent var, bg image). */
export function applySettings(s: Settings) {
  const root = document.documentElement;
  const isDark = s.theme === "dark";
  root.classList.toggle("dark", isDark);
  root.style.setProperty("--color-accent", s.primary);
  root.style.setProperty("--color-accent-strong", strongAccent(s.primary));
  // Dark theme dims the photo so bright images don't fight the dark UI.
  const dim = isDark ? "linear-gradient(rgba(0,0,0,0.5),rgba(0,0,0,0.5))," : "";
  document.body.style.backgroundColor = isDark ? "#0c0c0e" : "#6b5566";
  document.body.style.backgroundImage = s.background
    ? `${dim}url("${s.background}")`
    : "none";
}

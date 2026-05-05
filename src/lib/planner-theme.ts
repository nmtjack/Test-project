export type ThemePreset = "fantasy" | "edgy" | "anime" | "cute" | "professional";

export type PlannerTheme = {
  label: string;
  bg: string;
  panel: string;
  text: string;
  muted: string;
  line: string;
  accent: string;
  accent2: string;
  inverse: string;
  soft: string;
};

export const plannerThemes: Record<ThemePreset, PlannerTheme> = {
  fantasy: {
    label: "Fantasy",
    bg: "#f4ecd8",
    panel: "#fffaf0",
    text: "#28190b",
    muted: "#7c674a",
    line: "#d8c49a",
    accent: "#b7791f",
    accent2: "#2f855a",
    inverse: "#241506",
    soft: "#eadbb6",
  },
  edgy: {
    label: "Edgy",
    bg: "#111113",
    panel: "#1c1c20",
    text: "#f7f7fb",
    muted: "#a3a3ad",
    line: "#33333a",
    accent: "#ef4444",
    accent2: "#a855f7",
    inverse: "#f7f7fb",
    soft: "#27272f",
  },
  anime: {
    label: "Anime",
    bg: "#edf2ff",
    panel: "#ffffff",
    text: "#172554",
    muted: "#64748b",
    line: "#c7d2fe",
    accent: "#7c3aed",
    accent2: "#06b6d4",
    inverse: "#172554",
    soft: "#e0e7ff",
  },
  cute: {
    label: "Cute",
    bg: "#fff1f8",
    panel: "#ffffff",
    text: "#4a1932",
    muted: "#9f5679",
    line: "#f9cfe2",
    accent: "#ec4899",
    accent2: "#f59e0b",
    inverse: "#831843",
    soft: "#ffe4f0",
  },
  professional: {
    label: "Professional",
    bg: "#f5f7f8",
    panel: "#ffffff",
    text: "#111827",
    muted: "#64748b",
    line: "#d8dee6",
    accent: "#2563eb",
    accent2: "#059669",
    inverse: "#111827",
    soft: "#e9eef5",
  },
};

export const plannerThemeStorageKey = "lifequest-planner-v3";

export function plannerStorageKey(accountId?: string | null) {
  return accountId ? `${plannerThemeStorageKey}:${accountId}` : plannerThemeStorageKey;
}

export function readPlannerTheme(accountId?: string | null) {
  if (typeof window === "undefined") return plannerThemes.fantasy;
  try {
    const saved = window.localStorage.getItem(plannerStorageKey(accountId));
    const parsed = saved ? (JSON.parse(saved) as { theme?: ThemePreset }) : {};
    return plannerThemes[parsed.theme ?? "fantasy"] ?? plannerThemes.fantasy;
  } catch {
    return plannerThemes.fantasy;
  }
}

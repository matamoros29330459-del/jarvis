import { CustomThemeColors, ThemeId, ThemePreset } from "../types";

export const THEME_PRESETS: Record<Exclude<ThemeId, "custom">, ThemePreset> = {
  classic: {
    id: "classic",
    name: "Clásico",
    subtitle: "Stark Arc Cyan",
    description: "El legendario esquema holográfico azul cian de Tony Stark con paneles translúcidos frosted glass.",
    badge: "ORIGINAL STARK",
    previewColors: {
      primary: "#00f0ff",
      secondary: "#38bdf8",
      background: "#020508",
      accent: "#67e8f9",
    },
    colors: {
      primary: "#00f0ff",
      secondary: "#38bdf8",
      background: "#020508",
      glassBg: "rgba(8, 47, 73, 0.25)",
      glassBorder: "rgba(34, 211, 238, 0.25)",
      textPrimary: "#ffffff",
      textAccent: "#67e8f9",
      glowIntensity: 80,
      blurIntensity: "high",
    },
  },
  modern: {
    id: "modern",
    name: "Moderno",
    subtitle: "Mark L Gold & Crimson",
    description: "Inspirado en la armadura de nanotecnología de Iron Man, con dorados cibernéticos y acentos carmesí.",
    badge: "NANOTECH MARK L",
    previewColors: {
      primary: "#fbbf24",
      secondary: "#ef4444",
      background: "#0d0706",
      accent: "#fde68a",
    },
    colors: {
      primary: "#fbbf24",
      secondary: "#ef4444",
      background: "#0d0706",
      glassBg: "rgba(69, 26, 12, 0.25)",
      glassBorder: "rgba(251, 191, 36, 0.25)",
      textPrimary: "#ffffff",
      textAccent: "#fde68a",
      glowIntensity: 85,
      blurIntensity: "high",
    },
  },
  minimalist: {
    id: "minimalist",
    name: "Minimalista",
    subtitle: "Titanium Stealth",
    description: "Estética monocromática refinada, titanio cepillado de bajo contraste, máxima concentración y cero distracciones.",
    badge: "STEALTH TACTICAL",
    previewColors: {
      primary: "#e2e8f0",
      secondary: "#94a3b8",
      background: "#07090e",
      accent: "#cbd5e1",
    },
    colors: {
      primary: "#e2e8f0",
      secondary: "#94a3b8",
      background: "#07090e",
      glassBg: "rgba(30, 41, 59, 0.2)",
      glassBorder: "rgba(148, 163, 184, 0.2)",
      textPrimary: "#ffffff",
      textAccent: "#cbd5e1",
      glowIntensity: 30,
      blurIntensity: "medium",
    },
  },
  emerald: {
    id: "emerald",
    name: "Esmeralda",
    subtitle: "Tesseract Matrix",
    description: "Energía cuántica en tonos esmeralda y menta ciberpunk para escaneos tácticos y radares de precisión.",
    badge: "QUANTUM MATRIX",
    previewColors: {
      primary: "#10b981",
      secondary: "#06b6d4",
      background: "#020a06",
      accent: "#6ee7b7",
    },
    colors: {
      primary: "#10b981",
      secondary: "#06b6d4",
      background: "#020a06",
      glassBg: "rgba(6, 44, 28, 0.25)",
      glassBorder: "rgba(16, 185, 129, 0.25)",
      textPrimary: "#ffffff",
      textAccent: "#6ee7b7",
      glowIntensity: 80,
      blurIntensity: "high",
    },
  },
  vibranium: {
    id: "vibranium",
    name: "Vibranio",
    subtitle: "Dark Matter Pulse",
    description: "Pulso electromagnético violeta y amatista de alta frecuencia para análisis de materia oscura.",
    badge: "DEEP SPACE PULSE",
    previewColors: {
      primary: "#a855f7",
      secondary: "#ec4899",
      background: "#090410",
      accent: "#d8b4fe",
    },
    colors: {
      primary: "#a855f7",
      secondary: "#ec4899",
      background: "#090410",
      glassBg: "rgba(45, 12, 68, 0.25)",
      glassBorder: "rgba(168, 85, 247, 0.25)",
      textPrimary: "#ffffff",
      textAccent: "#d8b4fe",
      glowIntensity: 85,
      blurIntensity: "high",
    },
  },
};

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let c = hex.replace("#", "").trim();
  if (c.length === 3) {
    c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
  }
  const num = parseInt(c, 16);
  if (isNaN(num)) return { r: 0, g: 240, b: 255 };
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export function hexToRgba(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function applyThemeToDocument(colors: CustomThemeColors) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  const pRgb = hexToRgb(colors.primary);
  const sRgb = hexToRgb(colors.secondary);
  const bgRgb = hexToRgb(colors.background);

  root.style.setProperty("--theme-primary", colors.primary);
  root.style.setProperty("--theme-primary-rgb", `${pRgb.r}, ${pRgb.g}, ${pRgb.b}`);
  root.style.setProperty("--theme-secondary", colors.secondary);
  root.style.setProperty("--theme-secondary-rgb", `${sRgb.r}, ${sRgb.g}, ${sRgb.b}`);
  root.style.setProperty("--theme-bg", colors.background);
  root.style.setProperty("--theme-bg-rgb", `${bgRgb.r}, ${bgRgb.g}, ${bgRgb.b}`);
  root.style.setProperty("--theme-glass-bg", colors.glassBg);
  root.style.setProperty("--theme-glass-border", colors.glassBorder);
  root.style.setProperty("--theme-text-primary", colors.textPrimary);
  root.style.setProperty("--theme-text-accent", colors.textAccent);
  root.style.setProperty("--theme-glow-intensity", `${colors.glowIntensity / 100}`);

  const blurMap = {
    low: "blur(6px)",
    medium: "blur(12px)",
    high: "blur(20px)",
  };
  root.style.setProperty("--theme-blur", blurMap[colors.blurIntensity] || "blur(16px)");
}

export const THEME_STORAGE_KEY = "jarvis_visual_theme_v1";

export function loadSavedTheme(): { themeId: ThemeId; colors: CustomThemeColors } {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.themeId && parsed.colors) {
        return parsed;
      }
    }
  } catch {}

  return {
    themeId: "classic",
    colors: THEME_PRESETS.classic.colors,
  };
}

export function saveTheme(themeId: ThemeId, colors: CustomThemeColors) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify({ themeId, colors }));
  } catch {}
}

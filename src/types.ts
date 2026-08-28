export type SecurityLevel = 0 | 1 | 2 | 3;

export interface SecurityStatus {
  level: SecurityLevel;
  title: string;
  codeName: string;
  biometricsVerified: boolean;
  sandboxIsolated: boolean;
  httpsEncrypted: boolean;
  cspActive: boolean;
  quarantineCount: number;
  lastAudit: string;
}

export type MemoryCategory = "directive" | "user_pref" | "entity" | "session_log" | "custom_protocol";

export interface MemoryItem {
  id: string;
  key: string;
  value: string;
  category: MemoryCategory;
  timestamp: string;
  pinned?: boolean;
  source: "user" | "jarvis" | "system";
}

export interface FileAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  dataUrl?: string;
  textContent?: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "jarvis" | "system";
  text: string;
  timestamp: string;
  actionsExtracted?: string[];
  isVoiceInput?: boolean;
  attachments?: FileAttachment[];
}

export interface GmailMessageSummary {
  id: string;
  threadId: string;
  snippet: string;
  subject: string;
  from: string;
  date: string;
  unread: boolean;
}

export interface CalendarEventSummary {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: string;
  end: string;
  htmlLink?: string;
}

export interface SatelliteInfo {
  id: string;
  name: string;
  catalogNumber: number;
  type: string;
  inclination: number;
  periodMinutes: number;
  altitudeKm: number;
  velocityKmh: number;
  launchYear: number;
  country: string;
  purpose: string;
  basePhase: number;
  // Computed dynamically
  lat?: number;
  lon?: number;
  azimuth?: number;
  elevation?: number;
}

export interface WeatherTelemetry {
  location: {
    lat: number;
    lon: number;
    name: string;
    country: string;
  };
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    is_day: number;
    precipitation: number;
    weather_code: number;
    surface_pressure: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    time?: string;
  };
  hourly?: {
    time: string[];
    temperature_2m: number[];
    precipitation_probability: number[];
    surface_pressure: number[];
  };
  daily?: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    uv_index_max: number[];
  };
  fallback?: boolean;
}

export interface SystemTelemetry {
  fps: number;
  cpuLoadEst: number;
  memoryUsedMB: number;
  memoryTotalMB: number;
  latencyMs: number;
  isOnline: boolean;
  isSecureContext: boolean;
  audioActive: boolean;
  batteryLevel: number | null;
  isCharging: boolean | null;
  coresCount: number;
  gpuRenderer: string;
  uptimeSeconds: number;
}

export type HUDTab = "core" | "voice" | "apps" | "satellites" | "weather" | "security" | "memory" | "diagnostics" | "comm" | "workspace";

export type AppCategory = "all" | "google" | "secondary" | "ai" | "streaming" | "messaging" | "dev" | "custom";

export interface AppLauncherItem {
  id: string;
  name: string;
  category: "google" | "secondary" | "ai" | "streaming" | "messaging" | "dev" | "custom";
  url: string;
  description: string;
  iconName: string;
  color: string;
  isPopular?: boolean;
  voiceAliases: string[];
}

export type ThemeId = "classic" | "modern" | "minimalist" | "emerald" | "vibranium" | "custom";

export interface CustomThemeColors {
  primary: string; // Accent color (borders, primary buttons, glow)
  secondary: string; // Secondary accent (reactor ring, badges, highlights)
  background: string; // App canvas background
  glassBg: string; // Frosted card background
  glassBorder: string; // Frosted card border
  textPrimary: string; // Main header and body text
  textAccent: string; // Muted label and telemetry text
  glowIntensity: number; // 0 to 100
  blurIntensity: "low" | "medium" | "high";
}

export interface ThemePreset {
  id: ThemeId;
  name: string;
  subtitle: string;
  description: string;
  badge: string;
  previewColors: {
    primary: string;
    secondary: string;
    background: string;
    accent: string;
  };
  colors: CustomThemeColors;
}

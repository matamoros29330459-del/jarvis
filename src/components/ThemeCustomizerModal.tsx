import React, { useState } from "react";
import {
  Palette,
  Check,
  RotateCcw,
  Sparkles,
  Sliders,
  Zap,
  Eye,
  Layers,
  X,
  Flame,
  Shield,
  Radio,
} from "lucide-react";
import { CustomThemeColors, ThemeId } from "../types";
import { THEME_PRESETS, hexToRgb, hexToRgba } from "../utils/themeEngine";
import { soundFX } from "../utils/audioSynthesizer";

interface ThemeCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentThemeId: ThemeId;
  currentColors: CustomThemeColors;
  onApplyTheme: (themeId: ThemeId, colors: CustomThemeColors) => void;
  onAddLog: (msg: string) => void;
}

const SWATCH_PRESETS = [
  "#00f0ff", // Stark Cyan
  "#38bdf8", // Sky Blue
  "#fbbf24", // Iron Gold
  "#ef4444", // Crimson Red
  "#10b981", // Emerald Matrix
  "#06b6d4", // Aqua
  "#a855f7", // Wakanda Purple
  "#ec4899", // Magenta Pulse
  "#e2e8f0", // Titanium Silver
  "#f97316", // Fusion Orange
  "#6366f1", // Indigo
  "#ffffff", // Pure Light
];

export const ThemeCustomizerModal: React.FC<ThemeCustomizerModalProps> = ({
  isOpen,
  onClose,
  currentThemeId,
  currentColors,
  onApplyTheme,
  onAddLog,
}) => {
  const [selectedThemeId, setSelectedThemeId] = useState<ThemeId>(currentThemeId);
  const [colors, setColors] = useState<CustomThemeColors>(currentColors);
  const [activeSubTab, setActiveSubTab] = useState<"presets" | "custom">("presets");

  if (!isOpen) return null;

  const handleSelectPreset = (id: Exclude<ThemeId, "custom">) => {
    soundFX.playClick(1400);
    const preset = THEME_PRESETS[id];
    setSelectedThemeId(id);
    setColors(preset.colors);
    onApplyTheme(id, preset.colors);
    onAddLog(`[TEMA] Esquema visual cambiado a: "${preset.name}" (${preset.subtitle}).`);
  };

  const handleColorChange = (key: keyof CustomThemeColors, value: any) => {
    const updated = { ...colors, [key]: value };
    // If we changed color manually, update glass backgrounds to match if primary/secondary changed
    if (key === "primary" && typeof value === "string") {
      const rgb = hexToRgb(value);
      updated.glassBorder = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`;
    }
    if (key === "background" && typeof value === "string") {
      const rgb = hexToRgb(value);
      updated.glassBg = `rgba(${Math.min(255, rgb.r + 15)}, ${Math.min(255, rgb.g + 25)}, ${Math.min(255, rgb.b + 40)}, 0.28)`;
    }
    setColors(updated);
    setSelectedThemeId("custom");
    onApplyTheme("custom", updated);
  };

  const handleResetToCurrentPreset = () => {
    soundFX.playClick(900);
    if (selectedThemeId !== "custom") {
      const preset = THEME_PRESETS[selectedThemeId];
      setColors(preset.colors);
      onApplyTheme(selectedThemeId, preset.colors);
    } else {
      const defaultClassic = THEME_PRESETS.classic;
      setSelectedThemeId("classic");
      setColors(defaultClassic.colors);
      onApplyTheme("classic", defaultClassic.colors);
    }
    onAddLog("[TEMA] Configuración de color restaurada.");
  };

  const pRgb = hexToRgb(colors.primary);

  return (
    <div
      id="theme-customizer-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn"
    >
      <div
        id="theme-customizer-container"
        className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border overflow-hidden shadow-2xl transition-all duration-300"
        style={{
          backgroundColor: "rgba(2, 6, 12, 0.88)",
          borderColor: `rgba(${pRgb.r}, ${pRgb.g}, ${pRgb.b}, 0.4)`,
          boxShadow: `0 0 40px rgba(${pRgb.r}, ${pRgb.g}, ${pRgb.b}, ${Math.max(0.15, colors.glowIntensity / 300)})`,
          backdropFilter: "blur(20px)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b backdrop-blur-md"
          style={{
            borderColor: `rgba(${pRgb.r}, ${pRgb.g}, ${pRgb.b}, 0.25)`,
            backgroundColor: `rgba(${pRgb.r}, ${pRgb.g}, ${pRgb.b}, 0.08)`,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-xl border"
              style={{
                backgroundColor: `rgba(${pRgb.r}, ${pRgb.g}, ${pRgb.b}, 0.15)`,
                borderColor: `rgba(${pRgb.r}, ${pRgb.g}, ${pRgb.b}, 0.5)`,
                color: colors.primary,
              }}
            >
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-mono font-bold text-white tracking-wider">
                  MOTOR DE PERSONALIZACIÓN VISUAL HUD
                </h2>
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-mono font-bold border"
                  style={{
                    backgroundColor: `rgba(${pRgb.r}, ${pRgb.g}, ${pRgb.b}, 0.15)`,
                    borderColor: `rgba(${pRgb.r}, ${pRgb.g}, ${pRgb.b}, 0.4)`,
                    color: colors.primary,
                  }}
                >
                  STARK THEME OS
                </span>
              </div>
              <p className="text-xs font-mono" style={{ color: colors.textAccent }}>
                Ajuste temas predefinidos o personalice paletas cromáticas y niveles de desenfoque
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundFX.playClick(800);
              onClose();
            }}
            className="p-2 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-tab Navigation */}
        <div
          className="flex items-center justify-between px-5 py-2.5 border-b text-xs font-mono"
          style={{ borderColor: `rgba(${pRgb.r}, ${pRgb.g}, ${pRgb.b}, 0.15)` }}
        >
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundFX.playClick(1200);
                setActiveSubTab("presets");
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border transition-all ${
                activeSubTab === "presets"
                  ? "bg-white/10 text-white font-bold shadow-md"
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
              style={{
                borderColor: activeSubTab === "presets" ? colors.primary : "transparent",
              }}
            >
              <Sparkles className="w-3.5 h-3.5" style={{ color: colors.primary }} />
              <span>Temas Predefinidos (5)</span>
            </button>

            <button
              onClick={() => {
                soundFX.playClick(1200);
                setActiveSubTab("custom");
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border transition-all ${
                activeSubTab === "custom"
                  ? "bg-white/10 text-white font-bold shadow-md"
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
              style={{
                borderColor: activeSubTab === "custom" ? colors.primary : "transparent",
              }}
            >
              <Sliders className="w-3.5 h-3.5" style={{ color: colors.primary }} />
              <span>Personalización de Colores Clave</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400">
            <span>Tema activo:</span>
            <strong className="text-white font-mono uppercase">
              {selectedThemeId === "custom"
                ? "Personalizado (Custom)"
                : THEME_PRESETS[selectedThemeId]?.name}
            </strong>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-thin">
          {/* TAB 1: PREDEFINED THEMES */}
          {activeSubTab === "presets" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-300 font-bold uppercase tracking-wider">
                  SELECCIONE UNA CONFIGURACIÓN ESTÉTICA DE JARVIS
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  Cambio dinámico instantáneo en todos los módulos
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {(Object.keys(THEME_PRESETS) as Array<Exclude<ThemeId, "custom">>).map((id) => {
                  const preset = THEME_PRESETS[id];
                  const isSelected = selectedThemeId === id;
                  const presRgb = hexToRgb(preset.colors.primary);

                  return (
                    <div
                      key={id}
                      onClick={() => handleSelectPreset(id)}
                      className={`relative p-4 rounded-xl border text-left cursor-pointer transition-all duration-200 group flex flex-col justify-between overflow-hidden ${
                        isSelected
                          ? "scale-[1.02] shadow-xl"
                          : "hover:scale-[1.01] hover:border-white/30 opacity-80 hover:opacity-100"
                      }`}
                      style={{
                        backgroundColor: isSelected
                          ? `rgba(${presRgb.r}, ${presRgb.g}, ${presRgb.b}, 0.12)`
                          : "rgba(10, 15, 25, 0.4)",
                        borderColor: isSelected
                          ? preset.colors.primary
                          : "rgba(255, 255, 255, 0.12)",
                        boxShadow: isSelected
                          ? `0 0 25px rgba(${presRgb.r}, ${presRgb.g}, ${presRgb.b}, 0.25)`
                          : "none",
                      }}
                    >
                      {/* Top Badges & Selector Indicator */}
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className="px-2 py-0.5 rounded text-[9px] font-mono font-bold tracking-wider"
                          style={{
                            backgroundColor: `rgba(${presRgb.r}, ${presRgb.g}, ${presRgb.b}, 0.2)`,
                            color: preset.colors.primary,
                            border: `1px solid rgba(${presRgb.r}, ${presRgb.g}, ${presRgb.b}, 0.4)`,
                          }}
                        >
                          {preset.badge}
                        </span>

                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                            isSelected ? "border-white bg-white text-black" : "border-white/20"
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 text-black stroke-[3]" />}
                        </div>
                      </div>

                      {/* Theme Title */}
                      <div className="mb-2">
                        <h3 className="text-sm font-bold text-white font-mono flex items-center gap-1.5">
                          {preset.name}
                          <span className="text-xs font-normal text-slate-400">· {preset.subtitle}</span>
                        </h3>
                        <p className="text-[11px] text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                          {preset.description}
                        </p>
                      </div>

                      {/* Swatch Previews */}
                      <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-4 h-4 rounded-full border border-black/40 shadow-sm"
                            style={{ backgroundColor: preset.previewColors.primary }}
                            title="Color Primario"
                          />
                          <span
                            className="w-4 h-4 rounded-full border border-black/40 shadow-sm"
                            style={{ backgroundColor: preset.previewColors.secondary }}
                            title="Color Secundario"
                          />
                          <span
                            className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                            style={{ backgroundColor: preset.previewColors.background }}
                            title="Fondo"
                          />
                          <span
                            className="w-4 h-4 rounded-full border border-black/40 shadow-sm"
                            style={{ backgroundColor: preset.previewColors.accent }}
                            title="Acentos"
                          />
                        </div>

                        <span
                          className="text-[10px] font-mono font-bold underline transition-colors"
                          style={{ color: isSelected ? preset.colors.primary : "#94a3b8" }}
                        >
                          {isSelected ? "Activo" : "Seleccionar"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: GRANULAR CUSTOM COLOR CUSTOMIZATION */}
          {activeSubTab === "custom" && (
            <div className="space-y-6">
              <div className="p-3.5 rounded-xl border bg-white/5 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                style={{ borderColor: `rgba(${pRgb.r}, ${pRgb.g}, ${pRgb.b}, 0.3)` }}
              >
                <div className="flex items-center gap-2.5">
                  <Sliders className="w-5 h-5" style={{ color: colors.primary }} />
                  <div>
                    <h4 className="text-xs font-mono font-bold text-white uppercase">
                      PERSONALIZACIÓN DE ELEMENTOS CLAVE
                    </h4>
                    <p className="text-[11px] text-slate-300">
                      Modifique los colores hex o seleccione swatches para aplicar cambios en tiempo real.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleResetToCurrentPreset}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/20 text-xs text-slate-300 hover:text-white hover:bg-white/10 transition-all font-mono"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restablecer</span>
                </button>
              </div>

              {/* Grid of Key Color Elements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Primary Accent Color */}
                <div
                  className="p-4 rounded-xl border backdrop-blur-md space-y-3"
                  style={{
                    backgroundColor: "rgba(10, 15, 25, 0.45)",
                    borderColor: `rgba(${pRgb.r}, ${pRgb.g}, ${pRgb.b}, 0.25)`,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-mono font-bold text-white uppercase flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5" style={{ color: colors.primary }} />
                        Color Primario (Acentos & Bordes)
                      </span>
                      <p className="text-[10px] text-slate-400">
                        Bordes de tarjetas, partículas del reactor, botones activos
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={colors.primary}
                        onChange={(e) => handleColorChange("primary", e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <span className="text-xs font-mono text-white font-bold">{colors.primary}</span>
                    </div>
                  </div>

                  {/* Swatches */}
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/10">
                    {SWATCH_PRESETS.map((sw) => (
                      <button
                        key={sw}
                        onClick={() => handleColorChange("primary", sw)}
                        className={`w-6 h-6 rounded-md border transition-transform hover:scale-110 ${
                          colors.primary.toLowerCase() === sw.toLowerCase()
                            ? "border-white scale-110 shadow-md ring-2 ring-white/40"
                            : "border-black/50"
                        }`}
                        style={{ backgroundColor: sw }}
                      />
                    ))}
                  </div>
                </div>

                {/* 2. Secondary Core Accent */}
                <div
                  className="p-4 rounded-xl border backdrop-blur-md space-y-3"
                  style={{
                    backgroundColor: "rgba(10, 15, 25, 0.45)",
                    borderColor: `rgba(${pRgb.r}, ${pRgb.g}, ${pRgb.b}, 0.25)`,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-mono font-bold text-white uppercase flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5" style={{ color: colors.secondary }} />
                        Color Secundario (Núcleo Arc & Radar)
                      </span>
                      <p className="text-[10px] text-slate-400">
                        Anillos giratorios interiores, satélites y frecuencias
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={colors.secondary}
                        onChange={(e) => handleColorChange("secondary", e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <span className="text-xs font-mono text-white font-bold">{colors.secondary}</span>
                    </div>
                  </div>

                  {/* Swatches */}
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/10">
                    {SWATCH_PRESETS.map((sw) => (
                      <button
                        key={sw}
                        onClick={() => handleColorChange("secondary", sw)}
                        className={`w-6 h-6 rounded-md border transition-transform hover:scale-110 ${
                          colors.secondary.toLowerCase() === sw.toLowerCase()
                            ? "border-white scale-110 shadow-md ring-2 ring-white/40"
                            : "border-black/50"
                        }`}
                        style={{ backgroundColor: sw }}
                      />
                    ))}
                  </div>
                </div>

                {/* 3. Deep Background Color */}
                <div
                  className="p-4 rounded-xl border backdrop-blur-md space-y-3"
                  style={{
                    backgroundColor: "rgba(10, 15, 25, 0.45)",
                    borderColor: `rgba(${pRgb.r}, ${pRgb.g}, ${pRgb.b}, 0.25)`,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-mono font-bold text-white uppercase flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5" style={{ color: colors.primary }} />
                        Color de Fondo (Canvas Base)
                      </span>
                      <p className="text-[10px] text-slate-400">
                        Tono oscuro base del chasis de la interfaz
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={colors.background}
                        onChange={(e) => handleColorChange("background", e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <span className="text-xs font-mono text-white font-bold">{colors.background}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10">
                    {["#020508", "#0d0706", "#07090e", "#020a06", "#090410", "#000000", "#111827"].map((bg) => (
                      <button
                        key={bg}
                        onClick={() => handleColorChange("background", bg)}
                        className="px-2.5 py-1 rounded border text-[10px] font-mono text-slate-300 hover:text-white"
                        style={{
                          backgroundColor: bg,
                          borderColor: colors.background === bg ? colors.primary : "rgba(255,255,255,0.2)",
                        }}
                      >
                        {bg}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Text & Telemetry Accent */}
                <div
                  className="p-4 rounded-xl border backdrop-blur-md space-y-3"
                  style={{
                    backgroundColor: "rgba(10, 15, 25, 0.45)",
                    borderColor: `rgba(${pRgb.r}, ${pRgb.g}, ${pRgb.b}, 0.25)`,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-mono font-bold text-white uppercase flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5" style={{ color: colors.textAccent }} />
                        Color de Texto & Etiquetas HUD
                      </span>
                      <p className="text-[10px] text-slate-400">
                        Indicadores de estado, telemetría y subtextos
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={colors.textAccent}
                        onChange={(e) => handleColorChange("textAccent", e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <span className="text-xs font-mono text-white font-bold">{colors.textAccent}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/10">
                    {["#67e8f9", "#fde68a", "#cbd5e1", "#6ee7b7", "#d8b4fe", "#ffffff", "#94a3b8"].map((tx) => (
                      <button
                        key={tx}
                        onClick={() => handleColorChange("textAccent", tx)}
                        className="w-6 h-6 rounded-md border border-black/40"
                        style={{
                          backgroundColor: tx,
                          outline: colors.textAccent === tx ? `2px solid ${colors.primary}` : "none",
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* 5. Glow & Glass Sliders */}
              <div
                className="p-4 rounded-xl border backdrop-blur-md grid grid-cols-1 sm:grid-cols-2 gap-5"
                style={{
                  backgroundColor: "rgba(10, 15, 25, 0.45)",
                  borderColor: `rgba(${pRgb.r}, ${pRgb.g}, ${pRgb.b}, 0.25)`,
                }}
              >
                {/* Glow Intensity Slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-white font-bold uppercase flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" style={{ color: colors.primary }} />
                      Intensidad de Resplandor Holográfico
                    </span>
                    <span className="font-bold" style={{ color: colors.primary }}>
                      {colors.glowIntensity}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={colors.glowIntensity}
                    onChange={(e) => handleColorChange("glowIntensity", Number(e.target.value))}
                    className="w-full h-2 rounded-lg bg-slate-800 accent-cyan-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>Mínimo (0%)</span>
                    <span>Medio (50%)</span>
                    <span>Máximo Neón (100%)</span>
                  </div>
                </div>

                {/* Blur / Frosted Level */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-white font-bold uppercase flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" style={{ color: colors.primary }} />
                      Nivel de Desenfoque Frosted Glass
                    </span>
                    <span className="font-bold uppercase" style={{ color: colors.primary }}>
                      {colors.blurIntensity}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-1">
                    {(["low", "medium", "high"] as Array<"low" | "medium" | "high">).map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => handleColorChange("blurIntensity", lvl)}
                        className={`py-1.5 rounded-lg border text-xs font-mono transition-all ${
                          colors.blurIntensity === lvl
                            ? "bg-white/20 text-white font-bold border-white"
                            : "border-white/10 text-slate-400 hover:text-white"
                        }`}
                      >
                        {lvl === "low" ? "Sutil" : lvl === "medium" ? "Medio" : "Intenso"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* LIVE THEME PREVIEW CARD */}
          <div
            className="p-4 rounded-xl border backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4"
            style={{
              backgroundColor: colors.glassBg,
              borderColor: colors.glassBorder,
              boxShadow: `0 0 25px rgba(${pRgb.r}, ${pRgb.g}, ${pRgb.b}, 0.15)`,
            }}
          >
            <div className="flex items-center gap-3">
              {/* Mini Arc Reactor Live Preview */}
              <div
                className="w-12 h-12 rounded-full border-2 flex items-center justify-center relative shadow-lg"
                style={{
                  borderColor: colors.primary,
                  backgroundColor: `rgba(${pRgb.r}, ${pRgb.g}, ${pRgb.b}, 0.15)`,
                  boxShadow: `0 0 20px rgba(${pRgb.r}, ${pRgb.g}, ${pRgb.b}, ${colors.glowIntensity / 100})`,
                }}
              >
                <Zap className="w-6 h-6 animate-pulse" style={{ color: colors.primary }} />
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                  VISTA PREVIA EN VIVO
                </span>
                <h4 className="text-sm font-bold text-white font-mono">
                  SISTEMA JARVIS OPERATIVO // NÚCLEO MARK-VIII
                </h4>
                <p className="text-xs font-mono mt-0.5" style={{ color: colors.textAccent }}>
                  Telemetría, voz y satélites calibrados a esta especificación visual.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className="px-2.5 py-1 rounded-lg border text-xs font-mono font-bold"
                style={{
                  borderColor: colors.primary,
                  color: colors.primary,
                  backgroundColor: `rgba(${pRgb.r}, ${pRgb.g}, ${pRgb.b}, 0.15)`,
                }}
              >
                RGB ({pRgb.r}, {pRgb.g}, {pRgb.b})
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          className="px-5 py-3.5 border-t flex items-center justify-between backdrop-blur-md"
          style={{
            borderColor: `rgba(${pRgb.r}, ${pRgb.g}, ${pRgb.b}, 0.25)`,
            backgroundColor: `rgba(${pRgb.r}, ${pRgb.g}, ${pRgb.b}, 0.05)`,
          }}
        >
          <div className="text-xs font-mono text-slate-400">
            Los cambios se guardan automáticamente en la memoria del navegador.
          </div>

          <button
            onClick={() => {
              soundFX.playArcReactorBoot();
              onClose();
            }}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-mono font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95"
            style={{
              backgroundColor: `rgba(${pRgb.r}, ${pRgb.g}, ${pRgb.b}, 0.35)`,
              border: `1px solid ${colors.primary}`,
              boxShadow: `0 0 20px rgba(${pRgb.r}, ${pRgb.g}, ${pRgb.b}, 0.4)`,
            }}
          >
            <Check className="w-4 h-4" />
            <span>Confirmar & Aplicar Tema</span>
          </button>
        </div>
      </div>
    </div>
  );
};

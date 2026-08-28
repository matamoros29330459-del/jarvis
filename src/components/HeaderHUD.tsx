import React, { useState, useEffect } from "react";
import { Zap, Volume2, VolumeX, Shield, Radio, Sparkles, Orbit, CloudRain, Cpu, Activity, Mic, Palette, Mail, Layers } from "lucide-react";
import { HUDTab, SecurityLevel, ThemeId } from "../types";
import { soundFX } from "../utils/audioSynthesizer";

interface HeaderHUDProps {
  activeTab: HUDTab;
  onSelectTab: (tab: HUDTab) => void;
  securityLevel: SecurityLevel;
  isSpeaking: boolean;
  isListening: boolean;
  onActivateVoice: () => void;
  weatherTemp?: number;
  weatherCity?: string;
  currentThemeId: ThemeId;
  currentThemeName: string;
  onOpenThemeCustomizer: () => void;
}

export const HeaderHUD: React.FC<HeaderHUDProps> = ({
  activeTab,
  onSelectTab,
  securityLevel,
  isSpeaking,
  isListening,
  onActivateVoice,
  weatherTemp,
  weatherCity = "MALIBU, CA",
  currentThemeId,
  currentThemeName,
  onOpenThemeCustomizer,
}) => {
  const [timeStr, setTimeStr] = useState("");
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const mins = String(now.getMinutes()).padStart(2, "0");
      const secs = String(now.getSeconds()).padStart(2, "0");
      setTimeStr(`${hours}:${mins}:${secs}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleMute = () => {
    soundFX.isMuted = !isMuted;
    setIsMuted(!isMuted);
    if (!isMuted) soundFX.playClick(800);
  };

  const tabs: Array<{ id: HUDTab; label: string; icon: any }> = [
    { id: "core", label: "Núcleo Arc", icon: Zap },
    { id: "voice", label: "Voz & Chat", icon: Mic },
    { id: "apps", label: "Apps & Launcher", icon: Layers },
    { id: "workspace", label: "Mail & Calendario", icon: Mail },
    { id: "satellites", label: "Satélites", icon: Orbit },
    { id: "weather", label: "Clima & Atm.", icon: CloudRain },
    { id: "security", label: "Seguridad", icon: Shield },
    { id: "memory", label: "Memoria v2", icon: Cpu },
    { id: "diagnostics", label: "Diagnóstico", icon: Activity },
    { id: "comm", label: "Comunicaciones", icon: Radio },
  ];

  return (
    <header id="jarvis-hud-header" className="w-full bg-[#020508]/85 bg-gradient-to-r from-cyan-950/40 via-cyan-900/20 to-cyan-950/40 border-b border-cyan-500/30 backdrop-blur-xl sticky top-0 z-50 shadow-[0_4px_30px_rgba(0,240,255,0.08)]">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Logo & System Identity - Frosted Glass Style */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div
            onClick={() => {
              soundFX.playArcReactorBoot();
              onSelectTab("core");
            }}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative p-2.5 rounded-xl bg-cyan-950/40 backdrop-blur-md border border-cyan-500/40 shadow-[0_0_20px_rgba(34,211,238,0.2)] group-hover:scale-105 group-hover:border-cyan-400 transition-all">
              <Zap className="w-5 h-5 text-cyan-300 animate-pulse" />
              {isSpeaking && <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-cyan-400 animate-ping" />}
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-cyan-400/70 tracking-widest uppercase font-mono">AI Protocol Alpha-7</span>
              <h1 className="text-xl sm:text-2xl font-black tracking-tighter text-white flex items-center gap-1.5 font-mono">
                J.A.R.V.I.S.<span className="text-cyan-400 animate-pulse font-mono">_</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 font-semibold tracking-wider">
                  MARK-VIII
                </span>
              </h1>
            </div>
          </div>

          {/* Quick Voice Trigger on Mobile */}
          <button
            onClick={onActivateVoice}
            className={`md:hidden p-2.5 rounded-xl border font-mono text-xs backdrop-blur-md ${
              isListening
                ? "bg-amber-500/20 border-amber-400 text-amber-300 animate-pulse shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                : "bg-cyan-950/40 border-cyan-500/30 text-cyan-300"
            }`}
          >
            <Mic className="w-4 h-4" />
          </button>
        </div>

        {/* HUD Navigation Tabs - Frosted Glass Deck */}
        <nav className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 no-scrollbar justify-start md:justify-center p-1 rounded-xl bg-cyan-950/25 border border-cyan-500/20 backdrop-blur-md">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                onClick={() => {
                  soundFX.playClick(1200);
                  onSelectTab(tab.id);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? "bg-cyan-500/20 border border-cyan-400/80 text-white shadow-[0_0_15px_rgba(34,211,238,0.25)] font-bold backdrop-blur-lg"
                    : "border border-transparent text-cyan-300/70 hover:text-white hover:bg-cyan-900/30 hover:border-cyan-500/30"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-cyan-300" : "text-cyan-500/80"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Status Cluster - Frosted Glass Telemetry Pod */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          {/* Header Mini Atmospheric & Clock Pod */}
          <div className="bg-cyan-950/40 backdrop-blur-md border border-cyan-500/30 px-3.5 py-1.5 rounded-xl flex items-center gap-4 shadow-[0_0_20px_rgba(34,211,238,0.1)]">
            <div className="text-right">
              <div className="text-xs sm:text-sm font-bold text-white font-mono">
                {weatherTemp !== undefined ? `${weatherTemp}°C` : "22.4°C"}
              </div>
              <div className="text-[9px] text-cyan-400/60 font-mono tracking-tight uppercase truncate max-w-[90px]">
                {weatherCity} // ATM
              </div>
            </div>

            <div className="h-6 w-[1px] bg-cyan-500/30" />

            <div className="text-left">
              <div className="text-xs sm:text-sm font-bold text-white font-mono uppercase tracking-wider">
                {timeStr || "14:55:02"}
              </div>
              <div className="text-[9px] text-cyan-400/60 font-mono tracking-tight">
                CLEARANCE NVL {securityLevel}
              </div>
            </div>
          </div>

          {/* Theme Selector Button */}
          <button
            id="theme-customizer-btn"
            onClick={() => {
              soundFX.playClick(1300);
              onOpenThemeCustomizer();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-cyan-500/40 bg-cyan-950/40 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.18)] hover:border-cyan-400 hover:text-white backdrop-blur-md transition-all group"
            title="Personalizar Tema Visual y Colores"
          >
            <Palette className="w-4 h-4 text-cyan-300 group-hover:rotate-12 transition-transform" />
            <span className="hidden lg:inline text-[10px] font-mono font-bold uppercase tracking-wider">
              {currentThemeName}
            </span>
          </button>

          {/* Mute Audio Button */}
          <button
            onClick={handleToggleMute}
            className={`p-2 rounded-xl border text-xs font-mono transition-all backdrop-blur-md ${
              isMuted
                ? "bg-slate-900/50 border-slate-700/50 text-slate-500"
                : "bg-cyan-950/40 border-cyan-500/40 text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.15)] hover:border-cyan-400 hover:text-white"
            }`}
            title={isMuted ? "Audio silenciado" : "Efectos de sonido activos"}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};

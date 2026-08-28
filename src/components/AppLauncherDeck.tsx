import React, { useState, useMemo } from "react";
import {
  Search,
  ExternalLink,
  Plus,
  Trash2,
  Sparkles,
  Youtube,
  Mail,
  HardDrive,
  Calendar,
  MapPin,
  Video,
  FileText,
  Table,
  Presentation,
  Image,
  Languages,
  CheckSquare,
  Globe,
  Newspaper,
  Cloud,
  Send,
  Film,
  Bot,
  MessageCircle,
  Music,
  Headphones,
  Code,
  Twitter,
  Share2,
  Tv,
  BookOpen,
  ShoppingBag,
  Layers,
  Radio,
  SlidersHorizontal,
  CheckCircle2,
} from "lucide-react";
import { AppCategory, AppLauncherItem } from "../types";
import { DEFAULT_APPLICATIONS } from "../utils/appLauncherData";
import { soundFX } from "../utils/audioSynthesizer";

interface AppLauncherDeckProps {
  onOpenApp: (app: AppLauncherItem) => void;
  onAddTacticalLog: (log: string) => void;
  onAskJarvis: (prompt: string) => void;
}

// Icon mapping helper
const ICON_MAP: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Search,
  Youtube,
  Mail,
  HardDrive,
  Calendar,
  MapPin,
  Video,
  FileText,
  Table,
  Presentation,
  Image,
  Languages,
  CheckSquare,
  Sparkles,
  Globe,
  Newspaper,
  Cloud,
  Send,
  Film,
  Bot,
  MessageCircle,
  Music,
  Headphones,
  Code,
  Twitter,
  Share2,
  Tv,
  BookOpen,
  ShoppingBag,
  Layers,
};

export const AppLauncherDeck: React.FC<AppLauncherDeckProps> = ({
  onOpenApp,
  onAddTacticalLog,
  onAskJarvis,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<AppCategory>("all");
  const [customApps, setCustomApps] = useState<AppLauncherItem[]>(() => {
    try {
      const saved = localStorage.getItem("jarvis_custom_apps_v1");
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newAppName, setNewAppName] = useState("");
  const [newAppUrl, setNewAppUrl] = useState("");
  const [newAppDesc, setNewAppDesc] = useState("");
  const [newAppCategory, setNewAppCategory] = useState<"google" | "secondary" | "ai" | "streaming" | "messaging" | "dev" | "custom">("secondary");
  const [newAppColor, setNewAppColor] = useState("#22d3ee");

  const [lastLaunchedApp, setLastLaunchedApp] = useState<string | null>(null);

  // Combine default apps and user custom apps
  const allApps = useMemo(() => {
    return [...DEFAULT_APPLICATIONS, ...customApps];
  }, [customApps]);

  // Filtered applications based on category and search
  const filteredApps = useMemo(() => {
    return allApps.filter((app) => {
      const matchesCategory =
        selectedCategory === "all" ||
        app.category === selectedCategory ||
        (selectedCategory === "google" && app.category === "google") ||
        (selectedCategory === "secondary" && (app.category === "secondary" || app.category === "streaming" || app.category === "messaging" || app.category === "ai" || app.category === "dev"));

      const query = searchQuery.toLowerCase().trim();
      if (!query) return matchesCategory;

      const matchesName = app.name.toLowerCase().includes(query);
      const matchesDesc = app.description.toLowerCase().includes(query);
      const matchesAlias = app.voiceAliases.some((a) => a.toLowerCase().includes(query));

      return matchesCategory && (matchesName || matchesDesc || matchesAlias);
    });
  }, [allApps, selectedCategory, searchQuery]);

  const handleLaunch = (app: AppLauncherItem) => {
    soundFX.playHologramOpen();
    setLastLaunchedApp(app.name);
    onOpenApp(app);
    onAddTacticalLog(`[LANZADOR TÁCTICO] Desplegando ${app.name} (${app.url})`);
  };

  const handleSaveCustomApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppName.trim() || !newAppUrl.trim()) return;

    let formattedUrl = newAppUrl.trim();
    if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
      formattedUrl = "https://" + formattedUrl;
    }

    const newApp: AppLauncherItem = {
      id: `custom_${Date.now()}`,
      name: newAppName.trim(),
      url: formattedUrl,
      description: newAppDesc.trim() || "Aplicación personalizada agregada por el usuario.",
      category: newAppCategory,
      iconName: "Globe",
      color: newAppColor,
      voiceAliases: [newAppName.toLowerCase().trim(), "abrir " + newAppName.toLowerCase().trim()],
    };

    const updated = [newApp, ...customApps];
    setCustomApps(updated);
    try {
      localStorage.setItem("jarvis_custom_apps_v1", JSON.stringify(updated));
    } catch {}

    soundFX.playSuccess();
    onAddTacticalLog(`[LANZADOR] Nueva aplicación personalizada añadida: "${newApp.name}".`);

    // Reset and close
    setNewAppName("");
    setNewAppUrl("");
    setNewAppDesc("");
    setIsAddModalOpen(false);
  };

  const handleDeleteCustomApp = (id: string, name: string) => {
    const updated = customApps.filter((a) => a.id !== id);
    setCustomApps(updated);
    try {
      localStorage.setItem("jarvis_custom_apps_v1", JSON.stringify(updated));
    } catch {}
    soundFX.playClick(1000);
    onAddTacticalLog(`[LANZADOR] Aplicación eliminada: "${name}".`);
  };

  const categories: Array<{ id: AppCategory; label: string; count: number }> = [
    { id: "all", label: "Todas las Apps", count: allApps.length },
    { id: "google", label: "Google Apps", count: allApps.filter((a) => a.category === "google").length },
    { id: "messaging", label: "Telegram & Mensajería", count: allApps.filter((a) => a.category === "messaging").length },
    { id: "streaming", label: "Netflix & Streaming", count: allApps.filter((a) => a.category === "streaming").length },
    { id: "ai", label: "ChatGPT & IA", count: allApps.filter((a) => a.category === "ai").length },
    { id: "dev", label: "Dev & GitHub", count: allApps.filter((a) => a.category === "dev").length },
    { id: "secondary", label: "Secundarias", count: allApps.filter((a) => a.category !== "google").length },
    { id: "custom", label: "Personalizadas", count: customApps.length },
  ];

  return (
    <div id="app-launcher-deck" className="h-full flex flex-col space-y-4">
      {/* Top Banner with Tactical Voice & Launch Command Prompt */}
      <div className="bg-cyan-950/40 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-4 sm:p-5 shadow-[0_0_30px_rgba(34,211,238,0.12)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.3)] shrink-0">
              <Layers className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-white font-bold tracking-wider text-base sm:text-lg">
                  LANZADOR HOLOGRÁFICO DE APLICACIONES
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
                  {allApps.length} APPS ONLINE
                </span>
              </div>
              <p className="text-xs text-cyan-300/80 font-mono mt-0.5">
                Despliegue directo de toda la suite Google, Telegram, Netflix, YouTube, ChatGPT y enlaces tácticos.
              </p>
            </div>
          </div>

          {/* Quick Voice Prompt helper badge */}
          <div className="flex items-center gap-2.5 bg-black/40 border border-cyan-500/30 rounded-xl px-3.5 py-2">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse shrink-0" />
            <div className="text-[11px] font-mono">
              <span className="text-slate-300">Comando por voz: </span>
              <span className="text-amber-300 font-bold">"JARVIS, abre Telegram"</span> o <span className="text-cyan-300 font-bold">"Abre Netflix"</span>
            </div>
          </div>
        </div>

        {/* Tactical Voice Action Shortcut Pills */}
        <div className="mt-3.5 pt-3 border-t border-cyan-500/20 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[10px] uppercase font-mono text-cyan-400/70 shrink-0 font-bold">Lanzamiento Rápido:</span>
          {[
            { name: "Telegram", prompt: "JARVIS, abre Telegram Web" },
            { name: "Netflix", prompt: "JARVIS, abre Netflix" },
            { name: "YouTube", prompt: "JARVIS, abre YouTube" },
            { name: "ChatGPT", prompt: "JARVIS, abre ChatGPT" },
            { name: "Google Drive", prompt: "JARVIS, abre Google Drive" },
            { name: "Gmail", prompt: "JARVIS, abre mi correo de Gmail" },
            { name: "WhatsApp", prompt: "JARVIS, abre WhatsApp Web" },
            { name: "Spotify", prompt: "JARVIS, abre Spotify" },
          ].map((sc, i) => (
            <button
              key={i}
              onClick={() => {
                soundFX.playClick(1300);
                onAskJarvis(sc.prompt);
              }}
              className="px-2.5 py-1 rounded-lg bg-cyan-900/30 hover:bg-cyan-800/50 border border-cyan-500/30 hover:border-cyan-400 text-[11px] font-mono text-cyan-200 hover:text-white transition-all shrink-0 flex items-center gap-1.5"
            >
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>{sc.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Control Bar: Search Input, Category Filter Pills & Add Custom Button */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, comando de voz o categoría (ej. Telegram, Drive, Netflix, ChatGPT)..."
            className="w-full bg-cyan-950/40 border border-cyan-500/30 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm font-mono text-white placeholder-cyan-500/50 outline-none focus:border-cyan-400 backdrop-blur-md transition-all shadow-[0_0_15px_rgba(34,211,238,0.06)]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-400/60 hover:text-cyan-300 text-xs font-mono px-1.5 py-0.5 rounded bg-cyan-900/40"
            >
              Limpiar
            </button>
          )}
        </div>

        {/* Add Custom Application Button */}
        <button
          onClick={() => {
            soundFX.playClick(1400);
            setIsAddModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/60 hover:border-cyan-300 text-xs font-mono font-bold text-white flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(34,211,238,0.2)] shrink-0"
        >
          <Plus className="w-4 h-4 text-cyan-300" />
          <span>Añadir App Personalizada</span>
        </button>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-cyan-900/50">
        <SlidersHorizontal className="w-4 h-4 text-cyan-400/60 shrink-0 ml-1 mr-0.5" />
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              soundFX.playClick(1200);
              setSelectedCategory(cat.id);
            }}
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono whitespace-nowrap transition-all flex items-center gap-1.5 ${
              selectedCategory === cat.id
                ? "bg-cyan-500/30 border-cyan-400 text-white font-bold shadow-[0_0_15px_rgba(34,211,238,0.25)]"
                : "bg-cyan-950/20 border-cyan-500/20 text-cyan-300/70 hover:bg-cyan-900/30 hover:border-cyan-500/40 hover:text-cyan-200"
            }`}
          >
            <span>{cat.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                selectedCategory === cat.id ? "bg-cyan-400 text-black font-black" : "bg-cyan-900/60 text-cyan-300/80"
              }`}
            >
              {cat.count}
            </span>
          </button>
        ))}
      </div>

      {/* Applications Grid */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-3 scrollbar-thin scrollbar-thumb-cyan-900/80">
        {filteredApps.length === 0 ? (
          <div className="p-12 text-center bg-cyan-950/20 border border-cyan-500/20 rounded-2xl">
            <Bot className="w-10 h-10 text-cyan-400/50 mx-auto mb-3" />
            <div className="text-white font-bold font-mono text-sm">No se encontraron aplicaciones coincidentes</div>
            <p className="text-xs text-cyan-300/70 font-mono mt-1 max-w-md mx-auto">
              Intente con otro término de búsqueda o agregue la aplicación mediante el botón "Añadir App Personalizada".
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredApps.map((app) => {
              const IconComponent = ICON_MAP[app.iconName] || Globe;
              const isCustom = app.id.startsWith("custom_");
              const isLastLaunched = lastLaunchedApp === app.name;

              return (
                <div
                  key={app.id}
                  className={`relative group p-4 rounded-2xl bg-cyan-950/30 backdrop-blur-xl border transition-all duration-300 flex flex-col justify-between hover:scale-[1.02] shadow-[0_0_20px_rgba(34,211,238,0.06)] hover:shadow-[0_0_25px_rgba(34,211,238,0.2)] ${
                    isLastLaunched
                      ? "border-emerald-400/80 bg-cyan-900/40"
                      : "border-cyan-500/25 hover:border-cyan-400/70 hover:bg-cyan-900/30"
                  }`}
                >
                  {/* Top section with Icon, Name, Category and Badges */}
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border border-white/10 shadow-lg group-hover:rotate-3 transition-transform"
                          style={{
                            backgroundColor: `${app.color}22`,
                            color: app.color,
                            boxShadow: `0 0 16px ${app.color}40`,
                          }}
                        >
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-white font-bold font-mono text-sm tracking-wide group-hover:text-cyan-200 transition-colors">
                              {app.name}
                            </span>
                            {app.isPopular && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                TOP
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400/70">
                            {app.category === "google"
                              ? "Google Suite"
                              : app.category === "messaging"
                              ? "Mensajería"
                              : app.category === "streaming"
                              ? "Streaming"
                              : app.category === "ai"
                              ? "Inteligencia Artificial"
                              : app.category === "dev"
                              ? "Desarrollo"
                              : "Secundaria"}
                          </span>
                        </div>
                      </div>

                      {/* Custom Delete Button if custom */}
                      {isCustom && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCustomApp(app.id, app.name);
                          }}
                          className="p-1.5 rounded-lg text-red-400/60 hover:text-red-300 hover:bg-red-950/40 transition-colors"
                          title="Eliminar aplicación"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-300/80 font-mono leading-relaxed line-clamp-2 mb-3">
                      {app.description}
                    </p>
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="pt-2.5 border-t border-cyan-500/20 flex items-center justify-between gap-2 mt-auto">
                    <div className="text-[10px] text-cyan-400/60 font-mono truncate max-w-[130px]" title={app.url}>
                      {app.url.replace(/^https?:\/\//, "")}
                    </div>

                    <a
                      href={app.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleLaunch(app)}
                      className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/40 border border-cyan-400/50 hover:border-cyan-300 text-xs font-mono font-bold text-white flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(34,211,238,0.15)] group-hover:scale-105"
                    >
                      <span>Abrir</span>
                      <ExternalLink className="w-3.5 h-3.5 text-cyan-300" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Custom Application Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg bg-[#07131e] border border-cyan-500/50 rounded-2xl p-6 shadow-[0_0_50px_rgba(34,211,238,0.25)] flex flex-col space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-cyan-500/30">
              <div className="flex items-center gap-2 text-white font-bold text-base font-mono">
                <Plus className="w-5 h-5 text-cyan-400" />
                <span>AÑADIR APLICACIÓN PERSONALIZADA</span>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-cyan-400/60 hover:text-white text-sm font-mono px-2 py-1 rounded bg-cyan-950/50"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCustomApp} className="space-y-3.5 font-mono text-xs">
              <div>
                <label className="block text-cyan-300 font-bold mb-1">Nombre de la Aplicación</label>
                <input
                  type="text"
                  required
                  value={newAppName}
                  onChange={(e) => setNewAppName(e.target.value)}
                  placeholder="ej. Stark Industries Portal, Twitter, Canva..."
                  className="w-full bg-cyan-950/40 border border-cyan-500/40 rounded-xl px-3.5 py-2 text-white placeholder-cyan-500/40 outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-cyan-300 font-bold mb-1">URL / Enlace Web</label>
                <input
                  type="text"
                  required
                  value={newAppUrl}
                  onChange={(e) => setNewAppUrl(e.target.value)}
                  placeholder="https://ejemplo.com"
                  className="w-full bg-cyan-950/40 border border-cyan-500/40 rounded-xl px-3.5 py-2 text-white placeholder-cyan-500/40 outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-cyan-300 font-bold mb-1">Descripción Breve</label>
                <input
                  type="text"
                  value={newAppDesc}
                  onChange={(e) => setNewAppDesc(e.target.value)}
                  placeholder="ej. Portal de gestión o herramienta de trabajo..."
                  className="w-full bg-cyan-950/40 border border-cyan-500/40 rounded-xl px-3.5 py-2 text-white placeholder-cyan-500/40 outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-cyan-300 font-bold mb-1">Categoría</label>
                  <select
                    value={newAppCategory}
                    onChange={(e) => setNewAppCategory(e.target.value as any)}
                    className="w-full bg-cyan-950/60 border border-cyan-500/40 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-400"
                  >
                    <option value="secondary">Secundaria</option>
                    <option value="google">Google Suite</option>
                    <option value="messaging">Mensajería</option>
                    <option value="streaming">Streaming</option>
                    <option value="ai">Inteligencia Artificial</option>
                    <option value="dev">Desarrollo</option>
                    <option value="custom">Personalizada</option>
                  </select>
                </div>

                <div>
                  <label className="block text-cyan-300 font-bold mb-1">Color Temático</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newAppColor}
                      onChange={(e) => setNewAppColor(e.target.value)}
                      className="w-10 h-8 rounded border border-cyan-500/40 bg-transparent cursor-pointer"
                    />
                    <span className="text-cyan-400/80 font-mono text-[11px]">{newAppColor}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-cyan-500/30 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500/30 hover:bg-cyan-500/50 border border-cyan-400 text-white font-bold shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                >
                  Guardar Aplicación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

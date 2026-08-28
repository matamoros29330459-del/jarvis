import React, { useState } from "react";
import { Cpu, Plus, Search, Trash2, Pin, Download, Upload, Check, Tag, Clock, Database, Sparkles } from "lucide-react";
import { MemoryCategory, MemoryItem } from "../types";
import { soundFX } from "../utils/audioSynthesizer";

interface MemoryEngineProps {
  memoryItems: MemoryItem[];
  onAddMemory: (key: string, value: string, category: MemoryCategory) => void;
  onDeleteMemory: (id: string) => void;
  onTogglePin: (id: string) => void;
  onClearAllMemories: () => void;
  onImportMemories: (items: MemoryItem[]) => void;
}

export const MemoryEngine: React.FC<MemoryEngineProps> = ({
  memoryItems,
  onAddMemory,
  onDeleteMemory,
  onTogglePin,
  onClearAllMemories,
  onImportMemories,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showAddForm, setShowAddForm] = useState(false);

  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newCategory, setNewCategory] = useState<MemoryCategory>("directive");

  const categories: Array<{ id: MemoryCategory | "all"; label: string; color: string }> = [
    { id: "all", label: "Todas las Memorias", color: "text-slate-300" },
    { id: "directive", label: "Directivas Primarias", color: "text-cyan-400" },
    { id: "user_pref", label: "Preferencias del Usuario", color: "text-emerald-400" },
    { id: "entity", label: "Entidades & Sistemas", color: "text-purple-400" },
    { id: "session_log", label: "Registros de Sesión", color: "text-amber-400" },
    { id: "custom_protocol", label: "Protocolos Personalizados", color: "text-red-400" },
  ];

  const handleCreateMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim() || !newValue.trim()) return;
    soundFX.playSuccess();
    onAddMemory(newKey.trim(), newValue.trim(), newCategory);
    setNewKey("");
    setNewValue("");
    setShowAddForm(false);
  };

  const handleExport = () => {
    soundFX.playClick(1000);
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(memoryItems, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `jarvis_memory_engine_v2_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          soundFX.playSuccess();
          onImportMemories(parsed);
        }
      } catch (err) {
        console.error("Failed to parse JSON memory file", err);
      }
    };
    reader.readAsText(file);
  };

  const filteredMemories = memoryItems.filter((item) => {
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesSearch =
      item.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.value.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div id="memory-engine-module" className="flex flex-col h-full bg-cyan-950/20 backdrop-blur-lg border border-cyan-500/20 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(34,211,238,0.08)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-cyan-950/40 backdrop-blur-md border-b border-cyan-500/20">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-900/40 border border-cyan-400/50 text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.2)]">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-mono font-bold text-white tracking-wider">MOTOR DE MEMORIA v2</h2>
            <p className="text-[10px] font-mono text-cyan-400/60">
              Almacenamiento en sesión + Inyección dinámica de contexto en Gemini
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundFX.playClick(1100);
              setShowAddForm(!showAddForm);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-400/30 border border-cyan-400/60 text-white font-mono text-xs font-bold transition-all shadow-[0_0_12px_rgba(34,211,238,0.2)] backdrop-blur-md"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-300" />
            <span>Añadir Registro</span>
          </button>
        </div>
      </div>

      {/* Memory Status Bar */}
      <div className="px-4 py-2.5 bg-cyan-950/30 backdrop-blur-md border-b border-cyan-500/15 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
        <div className="flex items-center gap-3 text-cyan-400/70">
          <span className="flex items-center gap-1">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <strong className="text-white">{memoryItems.length}</strong> registros indexados
          </span>
          <span className="text-cyan-500/30">|</span>
          <span className="flex items-center gap-1 text-emerald-300">
            <Sparkles className="w-3.5 h-3.5" />
            Sincronizado con IA
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            title="Exportar base de datos a JSON"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-950/40 border border-cyan-500/30 hover:border-cyan-400 text-[10px] text-cyan-300 hover:text-white backdrop-blur-md transition-all"
          >
            <Download className="w-3 h-3" />
            <span>Exportar</span>
          </button>

          <label className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-950/40 border border-cyan-500/30 hover:border-cyan-400 text-[10px] text-cyan-300 hover:text-white backdrop-blur-md cursor-pointer transition-all">
            <Upload className="w-3 h-3" />
            <span>Importar</span>
            <input type="file" accept=".json" onChange={handleFileImport} className="hidden" />
          </label>

          <button
            onClick={() => {
              if (confirm("¿Confirmar purga de toda la memoria local?")) {
                soundFX.playAlert();
                onClearAllMemories();
              }
            }}
            title="Purgar memoria"
            className="p-1.5 rounded-lg bg-cyan-950/40 border border-cyan-500/20 hover:border-red-400/60 text-cyan-500/50 hover:text-red-400 backdrop-blur-md transition-all"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs scrollbar-thin scrollbar-thumb-cyan-900">
        {/* Search & Category Filter */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-cyan-400/60 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar en el banco de memoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-cyan-950/40 backdrop-blur-md border border-cyan-500/30 text-xs text-white placeholder-cyan-400/40 outline-none focus:border-cyan-400 transition-all"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  soundFX.playClick(1300);
                  setSelectedCategory(cat.id);
                }}
                className={`px-3 py-1.5 rounded-lg border text-[11px] whitespace-nowrap transition-all backdrop-blur-md ${
                  selectedCategory === cat.id
                    ? "bg-cyan-500/20 border-cyan-400 text-white font-bold shadow-[0_0_12px_rgba(34,211,238,0.2)]"
                    : "bg-cyan-950/30 border-cyan-500/20 text-cyan-300/70 hover:text-white hover:border-cyan-500/40"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Add Memory Form Modal / Collapsible */}
        {showAddForm && (
          <form onSubmit={handleCreateMemory} className="p-4 rounded-xl bg-cyan-950/60 backdrop-blur-xl border border-cyan-400/50 space-y-3 shadow-[0_0_25px_rgba(34,211,238,0.15)]">
            <div className="flex items-center justify-between text-white font-bold font-mono">
              <span>NUEVO REGISTRO EN MOTOR DE MEMORIA v2</span>
              <button type="button" onClick={() => setShowAddForm(false)} className="text-cyan-400/60 hover:text-white">
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Clave / Título (ej: Nombre del Usuario, Protocolo Alpha)"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                required
                className="sm:col-span-2 px-3 py-2 rounded-lg bg-cyan-950/80 border border-cyan-500/30 text-white placeholder-cyan-400/40 text-xs outline-none focus:border-cyan-400"
              />

              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as MemoryCategory)}
                className="px-3 py-2 rounded-lg bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs outline-none focus:border-cyan-400"
              >
                <option value="directive">Directiva Primaria</option>
                <option value="user_pref">Preferencia Usuario</option>
                <option value="entity">Entidad / Sistema</option>
                <option value="session_log">Registro Sesión</option>
                <option value="custom_protocol">Protocolo Stark</option>
              </select>
            </div>

            <textarea
              placeholder="Contenido / Detalle a memorizar para que JARVIS lo recuerde permanentemente..."
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              required
              rows={2}
              className="w-full px-3 py-2 rounded-lg bg-cyan-950/80 border border-cyan-500/30 text-white placeholder-cyan-400/40 text-xs outline-none focus:border-cyan-400"
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3.5 py-1.5 rounded-lg bg-cyan-950/40 border border-cyan-500/30 hover:bg-cyan-900/40 text-cyan-300 text-xs"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-400/30 border border-cyan-400 text-white font-bold text-xs shadow-[0_0_12px_rgba(34,211,238,0.2)]"
              >
                Guardar en Memoria
              </button>
            </div>
          </form>
        )}

        {/* Memory Grid */}
        {filteredMemories.length === 0 ? (
          <div className="p-8 text-center text-cyan-400/50 rounded-xl border border-dashed border-cyan-500/20 backdrop-blur-md">
            No se encontraron registros de memoria con el filtro seleccionado.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredMemories.map((item) => (
              <div
                key={item.id}
                className={`p-3.5 rounded-xl border transition-all relative group backdrop-blur-md ${
                  item.pinned
                    ? "bg-cyan-950/35 border-cyan-400/60 shadow-[0_0_15px_rgba(34,211,238,0.12)]"
                    : "bg-cyan-950/20 border-cyan-500/20 hover:border-cyan-500/40 hover:bg-cyan-950/30"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                    <span className="font-bold text-white text-xs font-mono">{item.key}</span>
                  </div>

                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                    <button
                      onClick={() => {
                        soundFX.playClick(1200);
                        onTogglePin(item.id);
                      }}
                      title={item.pinned ? "Desfijar" : "Fijar al inicio"}
                      className={`p-1 rounded-md hover:bg-cyan-900/40 ${item.pinned ? "text-cyan-300" : "text-cyan-500/50"}`}
                    >
                      <Pin className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => {
                        soundFX.playClick(600);
                        onDeleteMemory(item.id);
                      }}
                      title="Eliminar memoria"
                      className="p-1 rounded-md hover:bg-cyan-900/40 text-cyan-500/50 hover:text-red-400"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-slate-200 leading-relaxed whitespace-pre-wrap">{item.value}</p>

                <div className="mt-2.5 pt-2 border-t border-cyan-500/15 flex items-center justify-between text-[10px] text-cyan-400/60 font-mono">
                  <span className="px-2 py-0.5 rounded-md bg-cyan-950/60 border border-cyan-500/30 text-cyan-300">
                    {item.category}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {item.timestamp}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

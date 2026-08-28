import React from "react";
import { Radio, ShieldAlert, Zap, Flame, RefreshCw, Terminal, Globe, Lock, Send } from "lucide-react";
import { soundFX } from "../utils/audioSynthesizer";

interface GlobalCommHubProps {
  logs: string[];
  onTriggerProtocol: (protocolName: string) => void;
  onSendEncryptedTransmission: (msg: string) => void;
}

export const GlobalCommHub: React.FC<GlobalCommHubProps> = ({
  logs,
  onTriggerProtocol,
  onSendEncryptedTransmission,
}) => {
  const protocols = [
    {
      id: "house_party",
      name: "PROTOCOLO FIESTA EN CASA",
      desc: "Despliegue de todas las unidades y subsistemas tácticos",
      icon: Flame,
      color: "border-amber-500/50 bg-amber-950/40 text-amber-300",
    },
    {
      id: "defense_shield",
      name: "ESCUDO DEFENSIVO WEB",
      desc: "Aislamiento criptográfico y blindaje contra intrusiones",
      icon: ShieldAlert,
      color: "border-cyan-500/50 bg-cyan-950/40 text-cyan-300",
    },
    {
      id: "arc_overcharge",
      name: "SOBRECARGA DEL REACTOR",
      desc: "Canalización de máxima potencia a los núcleos neuronales",
      icon: Zap,
      color: "border-emerald-500/50 bg-emerald-950/40 text-emerald-300",
    },
    {
      id: "clean_slate",
      name: "PROTOCOLO CLEAN SLATE",
      desc: "Reinicio táctico y desvanecimiento de frecuencias temporales",
      icon: RefreshCw,
      color: "border-red-500/50 bg-red-950/40 text-red-300",
    },
  ];

  const handleProtocolClick = (p: (typeof protocols)[0]) => {
    soundFX.playAlert();
    onTriggerProtocol(p.name);
  };

  return (
    <div id="global-comm-hub-module" className="flex flex-col h-full bg-cyan-950/20 backdrop-blur-lg border border-cyan-500/20 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(34,211,238,0.08)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-cyan-950/40 backdrop-blur-md border-b border-cyan-500/20">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-900/40 border border-cyan-400/50 text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.2)]">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-mono font-bold text-white tracking-wider">COMUNICACIÓN GLOBAL & PROTOCOLOS</h2>
            <p className="text-[10px] font-mono text-cyan-400/60">Canal conectado a la nube · Ejecución de protocolos de emergencia</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-mono text-cyan-300 bg-cyan-950/40 px-2.5 py-1 rounded-lg border border-cyan-500/20 backdrop-blur-md">
          <Globe className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
          <span>RED GLOBAL STARK: ACTIVA</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs scrollbar-thin scrollbar-thumb-cyan-900">
        {/* Emergency Protocols Deck */}
        <div className="p-4 rounded-xl bg-cyan-950/30 backdrop-blur-md border border-cyan-500/25 space-y-3 shadow-[0_0_20px_rgba(34,211,238,0.06)]">
          <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">PROTOCOLOS TÁCTICOS STARK DE EMERGENCIA</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {protocols.map((p) => {
              const Icon = p.icon;
              return (
                <button
                  key={p.id}
                  onClick={() => handleProtocolClick(p)}
                  className={`p-3.5 rounded-xl border text-left transition-all hover:scale-[1.01] active:scale-[0.99] flex items-start gap-3 backdrop-blur-md ${p.color}`}
                >
                  <div className="p-2 rounded-lg bg-cyan-950/80 border border-current">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-xs">{p.name}</div>
                    <div className="text-[10px] text-slate-300/80 mt-0.5">{p.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tactical Comm Logs */}
        <div className="p-4 rounded-xl bg-cyan-950/30 backdrop-blur-md border border-cyan-500/25 space-y-2 shadow-[0_0_20px_rgba(34,211,238,0.06)]">
          <h3 className="text-xs font-bold text-white flex items-center gap-2 font-mono uppercase tracking-wider">
            <Terminal className="w-4 h-4 text-cyan-400" />
            REGISTRO DE TRANSMISIONES Y EVENTOS TÁCTICOS
          </h3>

          <div className="p-3 rounded-lg bg-cyan-950/60 border border-cyan-500/20 max-h-48 overflow-y-auto space-y-1.5 font-mono text-[11px] text-slate-200 backdrop-blur-md">
            {logs.map((log, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">&gt;</span>
                <span className="text-slate-200">{log}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

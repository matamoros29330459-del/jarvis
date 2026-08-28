import React, { useState, useEffect } from "react";
import { Activity, Cpu, HardDrive, Wifi, Battery, Zap, CheckCircle2, AlertOctagon, Play } from "lucide-react";
import { SystemTelemetry } from "../types";
import { soundFX } from "../utils/audioSynthesizer";

interface SystemDiagnosticsProps {
  telemetry: SystemTelemetry;
  onRunBenchmark: () => void;
  isBenchmarking: boolean;
}

export const SystemDiagnostics: React.FC<SystemDiagnosticsProps> = ({
  telemetry,
  onRunBenchmark,
  isBenchmarking,
}) => {
  const [subsystems, setSubsystems] = useState([
    { name: "NÚCLEO REACTOR ARC", status: "ÓPTIMO", load: 24, ok: true },
    { name: "MOTOR DE MEMORIA v2", status: "SINCRONIZADO", load: 18, ok: true },
    { name: "ENLACE NEURONAL GEMINI", status: "CONECTADO", load: 45, ok: true },
    { name: "RECEPTOR DE VOZ & AUDIO", status: "ACTIVO", load: 12, ok: true },
    { name: "RASTREADOR ORBITAL WGS-84", status: "EN LÍNEA", load: 30, ok: true },
    { name: "MATRIZ DE SANDBOX & HTTPS", status: "BLINDADO", load: 8, ok: true },
  ]);

  const handleBenchmark = () => {
    soundFX.playAlert();
    onRunBenchmark();
  };

  return (
    <div id="system-diagnostics-module" className="flex flex-col h-full bg-cyan-950/20 backdrop-blur-lg border border-cyan-500/20 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(34,211,238,0.08)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-cyan-950/40 backdrop-blur-md border-b border-cyan-500/20">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-900/40 border border-cyan-400/50 text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.2)]">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-mono font-bold text-white tracking-wider">DIAGNÓSTICO DEL SISTEMA</h2>
            <p className="text-[10px] font-mono text-cyan-400/60">Indicadores de rendimiento en tiempo de ejecución</p>
          </div>
        </div>

        <button
          onClick={handleBenchmark}
          disabled={isBenchmarking}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-400/30 border border-cyan-400/60 disabled:opacity-50 text-white font-mono text-xs font-bold transition-all shadow-[0_0_12px_rgba(34,211,238,0.2)] backdrop-blur-md"
        >
          <Play className="w-3 h-3 text-cyan-300" />
          <span>{isBenchmarking ? "Ejecutando Test..." : "Test de Rendimiento"}</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs scrollbar-thin scrollbar-thumb-cyan-900">
        {/* Real-Time Telemetry Hero Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* FPS */}
          <div className="p-3.5 rounded-xl bg-cyan-950/30 backdrop-blur-md border border-cyan-500/25 shadow-[0_0_20px_rgba(34,211,238,0.06)]">
            <div className="flex items-center justify-between text-[10px] text-cyan-400/60 uppercase">
              <span>TASA DE REFRESCO</span>
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-2xl font-bold text-white mt-1">{telemetry.fps} FPS</div>
            <div className="text-[10px] text-emerald-400 mt-0.5">Renderizado 60Hz Estable</div>
          </div>

          {/* Memory Heap */}
          <div className="p-3.5 rounded-xl bg-cyan-950/30 backdrop-blur-md border border-cyan-500/25 shadow-[0_0_20px_rgba(34,211,238,0.06)]">
            <div className="flex items-center justify-between text-[10px] text-cyan-400/60 uppercase">
              <span>MEMORIA HEAP JS</span>
              <HardDrive className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-purple-300 mt-1">{telemetry.memoryUsedMB} MB</div>
            <div className="text-[10px] text-cyan-400/60 mt-0.5">Límite: ~{telemetry.memoryTotalMB} MB</div>
          </div>

          {/* Latency */}
          <div className="p-3.5 rounded-xl bg-cyan-950/30 backdrop-blur-md border border-cyan-500/25 shadow-[0_0_20px_rgba(34,211,238,0.06)]">
            <div className="flex items-center justify-between text-[10px] text-cyan-400/60 uppercase">
              <span>LATENCIA RTT</span>
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-300 mt-1">{telemetry.latencyMs} ms</div>
            <div className="text-[10px] text-emerald-400 mt-0.5">Canal HTTP/2 Seguro</div>
          </div>

          {/* CPU Cores & Thread */}
          <div className="p-3.5 rounded-xl bg-cyan-950/30 backdrop-blur-md border border-cyan-500/25 shadow-[0_0_20px_rgba(34,211,238,0.06)]">
            <div className="flex items-center justify-between text-[10px] text-cyan-400/60 uppercase">
              <span>NÚCLEOS LÓGICOS</span>
              <Cpu className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-amber-300 mt-1">{telemetry.coresCount} Cores</div>
            <div className="text-[10px] text-cyan-400/60 mt-0.5">Carga est: {telemetry.cpuLoadEst}%</div>
          </div>
        </div>

        {/* Subsystem Matrix Bars */}
        <div className="p-4 rounded-xl bg-cyan-950/30 backdrop-blur-md border border-cyan-500/25 space-y-3 shadow-[0_0_20px_rgba(34,211,238,0.06)]">
          <h3 className="text-xs font-bold text-white flex items-center justify-between font-mono uppercase tracking-wider">
            <span>ESTADO DE SUBSISTEMAS STARK OS</span>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> 100% OPERATIVO
            </span>
          </h3>

          <div className="space-y-2.5">
            {subsystems.map((sub, i) => (
              <div key={i} className="p-2.5 rounded-lg bg-cyan-950/40 backdrop-blur-md border border-cyan-500/20">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold text-white">{sub.name}</span>
                  <span className="text-[10px] text-cyan-300 font-mono">{sub.status}</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-cyan-950/80 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-300"
                    style={{ width: `${sub.load}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hardware & Runtime Environment Details */}
        <div className="p-4 rounded-xl bg-cyan-950/30 backdrop-blur-md border border-cyan-500/25 shadow-[0_0_20px_rgba(34,211,238,0.06)]">
          <h3 className="text-xs font-bold text-white mb-2 font-mono uppercase tracking-wider">ENTORNO DE EJECUCIÓN WEB</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            <div className="p-2.5 rounded-lg bg-cyan-950/40 backdrop-blur-md border border-cyan-500/20">
              <span className="text-cyan-400/60 uppercase text-[10px]">Acelerador Gráfico WebGL:</span>
              <div className="text-slate-200 truncate mt-0.5">{telemetry.gpuRenderer || "Hardware GPU Pipeline (Activo)"}</div>
            </div>
            <div className="p-2.5 rounded-lg bg-cyan-950/40 backdrop-blur-md border border-cyan-500/20">
              <span className="text-cyan-400/60 uppercase text-[10px]">Tiempo de Actividad (Uptime):</span>
              <div className="text-slate-200 mt-0.5">{Math.floor(telemetry.uptimeSeconds / 60)} min {telemetry.uptimeSeconds % 60} seg</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

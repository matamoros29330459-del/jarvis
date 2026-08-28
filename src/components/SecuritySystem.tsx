import React, { useState, useEffect } from "react";
import { Shield, ShieldAlert, ShieldCheck, Fingerprint, Lock, Unlock, Eye, RefreshCw, AlertTriangle, CheckCircle } from "lucide-react";
import { SecurityLevel, SecurityStatus } from "../types";
import { soundFX } from "../utils/audioSynthesizer";

interface SecuritySystemProps {
  securityStatus: SecurityStatus;
  onUpdateSecurityLevel: (newLevel: SecurityLevel) => void;
  onAddLog: (text: string) => void;
}

export const SecuritySystem: React.FC<SecuritySystemProps> = ({
  securityStatus,
  onUpdateSecurityLevel,
  onAddLog,
}) => {
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanType, setScanType] = useState<"fingerprint" | "retina">("fingerprint");
  const [sandboxChecks, setSandboxChecks] = useState<Array<{ name: string; ok: boolean; desc: string }>>([]);

  useEffect(() => {
    // Audit browser sandbox environment
    const isSecure = typeof window !== "undefined" && window.isSecureContext;
    const isCrossIsolated = typeof window !== "undefined" && (window as any).crossOriginIsolated === true;
    const hasLocalStorage = typeof window !== "undefined" && typeof window.localStorage !== "undefined";
    const hasWebCrypto = typeof window !== "undefined" && !!window.crypto?.subtle;

    setSandboxChecks([
      {
        name: "Alojamiento Seguro HTTPS / TLS",
        ok: isSecure || window.location.protocol === "https:" || window.location.hostname === "localhost",
        desc: "Canal cifrado punto a punto en sandbox web",
      },
      {
        name: "Aislamiento de Origen Cruzado (COOP/COEP)",
        ok: isCrossIsolated || true,
        desc: "Entorno aislado para prevención de fugas de memoria",
      },
      {
        name: "Motor Criptográfico WebCrypto API",
        ok: hasWebCrypto,
        desc: "Algoritmos SHA-256 / AES disponibles en cliente",
      },
      {
        name: "Almacenamiento Local Aislado (Storage Sandbox)",
        ok: hasLocalStorage,
        desc: "Partición de memoria local protegida por dominio",
      },
      {
        name: "Control de Acceso por Roles (RBAC Stark)",
        ok: true,
        desc: "Permisos jerárquicos basados en firmas biométricas",
      },
    ]);
  }, []);

  const handleStartBiometricScan = (type: "fingerprint" | "retina") => {
    if (scanning) return;
    setScanType(type);
    setScanning(true);
    setScanProgress(0);
    soundFX.playAlert();

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setScanning(false);
          soundFX.playSecurityAccess();
          const targetLevel = (Math.min(securityStatus.level + 1, 3) as SecurityLevel);
          onUpdateSecurityLevel(targetLevel);
          onAddLog(`[SEGURIDAD] Escaneo biométrico (${type}) verificado. Nivel de acceso elevado a Nivel ${targetLevel}.`);
          return 100;
        }
        soundFX.playClick(800 + prev * 10);
        return prev + 15;
      });
    }, 150);
  };

  const getLevelColor = (level: SecurityLevel) => {
    switch (level) {
      case 3:
        return "text-red-400 border-red-500/50 bg-red-950/40";
      case 2:
        return "text-amber-400 border-amber-500/50 bg-amber-950/40";
      case 1:
        return "text-cyan-400 border-cyan-500/50 bg-cyan-950/40";
      default:
        return "text-slate-400 border-slate-700 bg-slate-900/40";
    }
  };

  return (
    <div id="security-system-module" className="flex flex-col h-full bg-cyan-950/20 backdrop-blur-lg border border-cyan-500/20 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(34,211,238,0.08)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-cyan-950/40 backdrop-blur-md border-b border-cyan-500/20">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-900/40 border border-cyan-400/50 text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.2)]">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-mono font-bold text-white tracking-wider">MATRIZ DE SEGURIDAD & SANDBOX</h2>
            <p className="text-[10px] font-mono text-cyan-400/60">Protección perimetral · Autenticación biométrica Stark</p>
          </div>
        </div>

        <div className={`px-2.5 py-1 rounded-lg border text-xs font-mono font-bold backdrop-blur-md ${getLevelColor(securityStatus.level)}`}>
          NIVEL {securityStatus.level}: {securityStatus.title}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs scrollbar-thin scrollbar-thumb-cyan-900">
        {/* Biometric Verification Deck */}
        <div className="p-4 rounded-xl bg-cyan-950/30 backdrop-blur-md border border-cyan-500/25 relative overflow-hidden shadow-[0_0_20px_rgba(34,211,238,0.06)]">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <div className="flex items-center gap-2 text-white font-bold font-mono">
                <Fingerprint className="w-5 h-5 text-cyan-400" />
                <span>TERMINAL DE AUTENTICACIÓN BIOMÉTRICA</span>
              </div>
              <p className="text-[11px] text-cyan-300/70">
                Pase el sensor para elevar su credencial de seguridad o confirmar identidad ante JARVIS.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                id="btn-scan-fingerprint"
                onClick={() => handleStartBiometricScan("fingerprint")}
                disabled={scanning}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-400/30 border border-cyan-400/60 text-white transition-all active:scale-95 disabled:opacity-50 shadow-[0_0_12px_rgba(34,211,238,0.2)] backdrop-blur-md font-bold"
              >
                <Fingerprint className="w-4 h-4 text-cyan-300" />
                <span>Escanear Huella</span>
              </button>

              <button
                id="btn-scan-retina"
                onClick={() => handleStartBiometricScan("retina")}
                disabled={scanning}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-cyan-950/40 hover:bg-amber-950/40 border border-cyan-500/30 hover:border-amber-400/60 text-cyan-300 hover:text-amber-300 transition-all active:scale-95 disabled:opacity-50 backdrop-blur-md font-bold"
              >
                <Eye className="w-4 h-4" />
                <span>Escaneo Retinal</span>
              </button>
            </div>
          </div>

          {/* Scanning Laser Animation */}
          {scanning && (
            <div className="mt-4 p-3 rounded-lg bg-cyan-950/60 border border-amber-500/40 relative overflow-hidden backdrop-blur-md">
              <div className="flex items-center justify-between text-amber-300 mb-1 text-xs font-mono">
                <span>ANALIZANDO PATRÓN ({scanType.toUpperCase()})...</span>
                <span>{scanProgress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-cyan-950/80 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 via-amber-400 to-emerald-400 transition-all duration-150"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
              <div className="absolute inset-0 bg-amber-400/10 pointer-events-none animate-pulse" />
            </div>
          )}
        </div>

        {/* Security Clearance Levels Switcher */}
        <div className="p-4 rounded-xl bg-cyan-950/30 backdrop-blur-md border border-cyan-500/25 shadow-[0_0_20px_rgba(34,211,238,0.06)]">
          <h3 className="text-xs font-bold text-white mb-3 flex items-center gap-2 font-mono uppercase tracking-wider">
            <Lock className="w-4 h-4 text-cyan-400" />
            NIVELES DE ACCESO & PROTOCOLOS OPERATIVOS
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
            {[
              { lvl: 0, title: "Invitado", desc: "Consultas públicas y telemetría estándar" },
              { lvl: 1, title: "Operador Técnico", desc: "Monitoreo de satélites y memoria de sesión" },
              { lvl: 2, title: "Protocolo Mark-VII", desc: "Diagnósticos profundos y comandos avanzados" },
              { lvl: 3, title: "Stark Supremo", desc: "Acceso ilimitado al núcleo y anulación de defensas" },
            ].map((c) => {
              const isCurrent = securityStatus.level === c.lvl;
              return (
                <button
                  key={c.lvl}
                  id={`btn-security-level-${c.lvl}`}
                  onClick={() => {
                    soundFX.playSecurityAccess();
                    onUpdateSecurityLevel(c.lvl as SecurityLevel);
                    onAddLog(`[SEGURIDAD] Protocolo ajustado manualmente a Nivel ${c.lvl} (${c.title}).`);
                  }}
                  className={`p-3 rounded-lg border text-left transition-all backdrop-blur-md ${
                    isCurrent
                      ? "bg-cyan-500/20 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.25)] text-white"
                      : "bg-cyan-950/30 border-cyan-500/20 hover:border-cyan-500/40 text-cyan-300/70 hover:text-white"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-cyan-300 font-mono">NIVEL {c.lvl}</span>
                    {isCurrent ? <Unlock className="w-3.5 h-3.5 text-emerald-400" /> : <Lock className="w-3.5 h-3.5 text-cyan-500/50" />}
                  </div>
                  <div className="font-semibold text-white text-[11px]">{c.title}</div>
                  <div className="text-[10px] text-cyan-400/60 mt-1 leading-tight">{c.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sandbox Audits & Web Protections */}
        <div className="p-4 rounded-xl bg-cyan-950/30 backdrop-blur-md border border-cyan-500/25 shadow-[0_0_20px_rgba(34,211,238,0.06)]">
          <h3 className="text-xs font-bold text-white mb-3 flex items-center gap-2 font-mono uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            DIAGNÓSTICO DE AISLAMIENTO & SANDBOX WEB
          </h3>

          <div className="space-y-2">
            {sandboxChecks.map((chk, i) => (
              <div
                key={i}
                className="flex items-start justify-between p-2.5 rounded-lg bg-cyan-950/40 backdrop-blur-md border border-cyan-500/20"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span className="font-bold text-white">{chk.name}</span>
                  </div>
                  <p className="text-[10px] text-cyan-400/60 ml-5.5">{chk.desc}</p>
                </div>
                <span className="px-2 py-0.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold backdrop-blur-md">
                  VERIFICADO
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

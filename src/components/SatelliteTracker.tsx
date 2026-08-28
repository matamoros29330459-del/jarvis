import React, { useState, useEffect } from "react";
import { Orbit, Compass, Radio, Globe, Navigation, Target, Zap, Clock, ShieldCheck } from "lucide-react";
import { SatelliteInfo } from "../types";
import { calculateSatellitePosition, calculateNextPass } from "../utils/orbitalMath";
import { soundFX } from "../utils/audioSynthesizer";

interface SatelliteTrackerProps {
  satellites: SatelliteInfo[];
  onAskJarvis: (prompt: string) => void;
}

export const SatelliteTracker: React.FC<SatelliteTrackerProps> = ({ satellites, onAskJarvis }) => {
  const [selectedSatId, setSelectedSatId] = useState<string>("ISS_25544");
  const [timeOffset, setTimeOffset] = useState<number>(Date.now());

  // Update satellite positions every second
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeOffset(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute live positions
  const computedSatellites = satellites.map((sat) => {
    const pos = calculateSatellitePosition(sat, timeOffset);
    return {
      ...sat,
      lat: pos.lat,
      lon: pos.lon,
      groundTrack: pos.groundTrack,
    };
  });

  const activeSat = computedSatellites.find((s) => s.id === selectedSatId) || computedSatellites[0];
  const nextPass = activeSat ? calculateNextPass(activeSat) : null;

  // Convert lat/lon to 2D SVG canvas percentages (Equirectangular projection)
  const toMapCoords = (lat: number = 0, lon: number = 0) => {
    // lon: -180 .. 180 => 0 .. 100%
    // lat: 90 .. -90 => 0 .. 100%
    const x = ((lon + 180) / 360) * 100;
    const y = ((90 - lat) / 180) * 100;
    return { x, y };
  };

  const handleSelectSat = (id: string) => {
    soundFX.playClick(1300);
    setSelectedSatId(id);
  };

  const handleLockAndQuery = () => {
    if (!activeSat) return;
    soundFX.playSuccess();
    const prompt = `JARVIS, ejecuta un análisis táctico y orbital completo del satélite ${activeSat.name} (NORAD #${activeSat.catalogNumber}). Lat: ${activeSat.lat}°, Lon: ${activeSat.lon}°, Altura: ${activeSat.altitudeKm} km, Velocidad: ${activeSat.velocityKmh} km/h.`;
    onAskJarvis(prompt);
  };

  return (
    <div id="satellite-tracker-module" className="flex flex-col h-full bg-cyan-950/20 backdrop-blur-lg border border-cyan-500/20 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(34,211,238,0.08)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-cyan-950/40 backdrop-blur-md border-b border-cyan-500/20">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-900/40 border border-cyan-400/50 text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.2)]">
            <Orbit className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-mono font-bold text-white tracking-wider">RASTREO ORBITAL & SATÉLITES</h2>
            <p className="text-[10px] font-mono text-cyan-400/60">Conjunto de datos públicos · Trayectorias orbitales a tiempo real</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-[10px] font-mono text-emerald-300 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            TELEMETRÍA EN VIVO
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs scrollbar-thin scrollbar-thumb-cyan-900">
        {/* Satellite Selection Carousel */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {computedSatellites.map((s) => {
            const isSelected = s.id === selectedSatId;
            return (
              <button
                key={s.id}
                onClick={() => handleSelectSat(s.id)}
                className={`px-3 py-1.5 rounded-lg border text-xs whitespace-nowrap transition-all backdrop-blur-md ${
                  isSelected
                    ? "bg-cyan-500/20 border-cyan-400 text-white shadow-[0_0_15px_rgba(34,211,238,0.25)] font-bold"
                    : "bg-cyan-950/30 border-cyan-500/20 text-cyan-300/70 hover:text-white hover:bg-cyan-900/30 hover:border-cyan-500/40"
                }`}
              >
                <Radio className="w-3 h-3 inline mr-1.5 text-cyan-400" />
                {s.name.split(" ")[0]} ({s.catalogNumber})
              </button>
            );
          })}
        </div>

        {/* 2D Holographic Orbital Map */}
        <div className="relative w-full h-64 sm:h-72 rounded-xl bg-cyan-950/30 border border-cyan-500/30 overflow-hidden backdrop-blur-md shadow-[inset_0_0_30px_rgba(0,0,0,0.7)]">
          {/* Map Grid Background */}
          <div className="absolute inset-0 bg-[radial-gradient(#22d3ee_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />

          {/* Equirectangular Map SVG Graphic */}
          <svg className="w-full h-full" viewBox="0 0 1000 500" preserveAspectRatio="none">
            {/* Equator & Prime Meridian */}
            <line x1="0" y1="250" x2="1000" y2="250" stroke="rgba(34,211,238,0.25)" strokeDasharray="4,4" />
            <line x1="500" y1="0" x2="500" y2="500" stroke="rgba(34,211,238,0.25)" strokeDasharray="4,4" />

            {/* Tropics */}
            <line x1="0" y1="185" x2="1000" y2="185" stroke="rgba(34,211,238,0.1)" />
            <line x1="0" y1="315" x2="1000" y2="315" stroke="rgba(34,211,238,0.1)" />

            {/* Simplified World Continents Wireframe Polygons */}
            {/* North America */}
            <polygon
              points="150,80 260,80 280,180 200,240 120,180 90,120"
              fill="rgba(34,211,238,0.06)"
              stroke="rgba(34,211,238,0.35)"
              strokeWidth="1"
            />
            {/* South America */}
            <polygon
              points="250,260 340,280 320,440 250,470 230,340"
              fill="rgba(34,211,238,0.06)"
              stroke="rgba(34,211,238,0.35)"
              strokeWidth="1"
            />
            {/* Europe */}
            <polygon
              points="460,90 560,90 540,180 470,170 450,120"
              fill="rgba(34,211,238,0.06)"
              stroke="rgba(34,211,238,0.35)"
              strokeWidth="1"
            />
            {/* Africa */}
            <polygon
              points="460,190 560,200 580,360 510,430 440,300"
              fill="rgba(34,211,238,0.06)"
              stroke="rgba(34,211,238,0.35)"
              strokeWidth="1"
            />
            {/* Asia */}
            <polygon
              points="580,70 850,80 880,240 700,280 600,180"
              fill="rgba(34,211,238,0.06)"
              stroke="rgba(34,211,238,0.35)"
              strokeWidth="1"
            />
            {/* Australia */}
            <polygon
              points="770,340 890,340 880,440 760,420"
              fill="rgba(34,211,238,0.06)"
              stroke="rgba(34,211,238,0.35)"
              strokeWidth="1"
            />

            {/* Active Satellite Ground Track */}
            {activeSat && (activeSat as any).groundTrack && (
              <polyline
                points={(activeSat as any).groundTrack
                  .map((p: any) => `${((p.lon + 180) / 360) * 1000},${((90 - p.lat) / 180) * 500}`)
                  .join(" ")}
                fill="none"
                stroke="rgba(34, 211, 238, 0.7)"
                strokeWidth="1.5"
                strokeDasharray="6,4"
              />
            )}

            {/* All Satellites Markers */}
            {computedSatellites.map((sat) => {
              const coords = toMapCoords(sat.lat, sat.lon);
              const svgX = (coords.x / 100) * 1000;
              const svgY = (coords.y / 100) * 500;
              const isSelected = sat.id === selectedSatId;

              return (
                <g key={sat.id} className="cursor-pointer" onClick={() => handleSelectSat(sat.id)}>
                  {/* Footprint Coverage Circle */}
                  {isSelected && (
                    <circle
                      cx={svgX}
                      cy={svgY}
                      r={45}
                      fill="rgba(34, 211, 238, 0.15)"
                      stroke="rgba(34, 211, 238, 0.6)"
                      strokeWidth="1"
                    />
                  )}

                  {/* Satellite Core Dot */}
                  <circle
                    cx={svgX}
                    cy={svgY}
                    r={isSelected ? 6 : 4}
                    fill={isSelected ? "#FFB300" : "#22D3EE"}
                    stroke="#020508"
                    strokeWidth="1.5"
                  />

                  {/* Pulsing ring for active */}
                  {isSelected && (
                    <circle
                      cx={svgX}
                      cy={svgY}
                      r={10}
                      fill="none"
                      stroke="#FFB300"
                      strokeWidth="1"
                      className="animate-ping opacity-75"
                    />
                  )}

                  {/* Label */}
                  <text
                    x={svgX + 8}
                    y={svgY + 4}
                    fill={isSelected ? "#FFB300" : "#22D3EE"}
                    fontSize="11"
                    fontFamily="monospace"
                    fontWeight={isSelected ? "bold" : "normal"}
                  >
                    {sat.name.split(" ")[0]}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Map Overlay HUD info */}
          <div className="absolute top-2 left-3 text-[10px] text-cyan-300 bg-cyan-950/70 backdrop-blur-md px-2.5 py-1 rounded-lg border border-cyan-500/30">
            PROYECCIÓN ORBITAL EQUIRECTANGULAR WGS-84
          </div>
          <div className="absolute bottom-2 right-3 text-[10px] text-cyan-400/60 bg-cyan-950/70 backdrop-blur-md px-2.5 py-1 rounded-lg border border-cyan-500/20">
            COORDENADAS TERRESTRES EN VIVO
          </div>
        </div>

        {/* Selected Satellite Detailed Telemetry Card */}
        {activeSat && (
          <div className="p-4 rounded-xl bg-cyan-950/30 backdrop-blur-md border border-cyan-500/25 space-y-3 shadow-[0_0_20px_rgba(34,211,238,0.06)]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-cyan-500/20">
              <div>
                <span className="text-[10px] text-cyan-400/60 uppercase">OBJETIVO ORBITAL SELECCIONADO</span>
                <h3 className="text-base font-bold text-white flex items-center gap-2 font-mono">
                  {activeSat.name}
                  <span className="text-xs px-2 py-0.5 rounded bg-amber-950/40 border border-amber-500/40 text-amber-300">
                    NORAD #{activeSat.catalogNumber}
                  </span>
                </h3>
              </div>

              <button
                onClick={handleLockAndQuery}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-400/30 border border-cyan-400/60 text-white font-bold transition-all shadow-[0_0_12px_rgba(34,211,238,0.2)] active:scale-95 backdrop-blur-md"
              >
                <Target className="w-3.5 h-3.5 text-cyan-300" />
                <span>Bloquear Objetivo & Consultar JARVIS</span>
              </button>
            </div>

            {/* Metric Telemetry Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-lg bg-cyan-950/40 backdrop-blur-md border border-cyan-500/20">
                <span className="text-[10px] text-cyan-400/60 uppercase">ALTITUD ORBITAL</span>
                <div className="text-sm font-bold text-white mt-0.5">{activeSat.altitudeKm} km</div>
              </div>

              <div className="p-3 rounded-lg bg-cyan-950/40 backdrop-blur-md border border-cyan-500/20">
                <span className="text-[10px] text-cyan-400/60 uppercase">VELOCIDAD ORBITAL</span>
                <div className="text-sm font-bold text-white mt-0.5">{activeSat.velocityKmh.toLocaleString()} km/h</div>
              </div>

              <div className="p-3 rounded-lg bg-cyan-950/40 backdrop-blur-md border border-cyan-500/20">
                <span className="text-[10px] text-cyan-400/60 uppercase">PERIODO ORBITAL</span>
                <div className="text-sm font-bold text-white mt-0.5">{activeSat.periodMinutes} min</div>
              </div>

              <div className="p-3 rounded-lg bg-cyan-950/40 backdrop-blur-md border border-cyan-500/20">
                <span className="text-[10px] text-cyan-400/60 uppercase">INCLINACIÓN</span>
                <div className="text-sm font-bold text-white mt-0.5">{activeSat.inclination}°</div>
              </div>
            </div>

            {/* Mission Purpose & Pass Calculation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <div className="p-3 rounded-lg bg-cyan-950/40 backdrop-blur-md border border-cyan-500/20">
                <span className="text-[10px] text-cyan-400/60 uppercase">PROPÓSITO & OPERADOR</span>
                <div className="text-xs text-slate-200 mt-1 font-sans">{activeSat.purpose}</div>
                <div className="text-[10px] text-cyan-400/80 mt-1">Operador: {activeSat.country} (Lanzado {activeSat.launchYear})</div>
              </div>

              {nextPass && (
                <div className="p-3 rounded-lg bg-cyan-950/40 backdrop-blur-md border border-cyan-500/20">
                  <span className="text-[10px] text-cyan-400/60 uppercase flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" /> PRÓXIMO PASO SOBRE ZONA
                  </span>
                  <div className="text-xs text-amber-300 font-bold mt-1">En aprox. {nextPass.nextPassMinutes} minutos</div>
                  <div className="text-[10px] text-cyan-400/60 mt-0.5">
                    Elevación máx: {nextPass.maxElevationDeg}° · Azimut: {nextPass.azimuthArrival}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

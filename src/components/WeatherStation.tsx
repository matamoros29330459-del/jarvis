import React, { useState, useEffect, useRef } from "react";
import { CloudRain, Wind, Compass, Droplets, Sun, Gauge, MapPin, RefreshCw, Eye, Navigation } from "lucide-react";
import { WeatherTelemetry } from "../types";
import { soundFX } from "../utils/audioSynthesizer";

interface WeatherStationProps {
  weatherData: WeatherTelemetry | null;
  loading: boolean;
  onRefreshCity: (cityKey: string, lat?: number, lon?: number) => void;
}

export const WeatherStation: React.FC<WeatherStationProps> = ({
  weatherData,
  loading,
  onRefreshCity,
}) => {
  const [selectedCity, setSelectedCity] = useState("malibu");
  const [useFahrenheit, setUseFahrenheit] = useState(false);
  const radarCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const cityOptions = [
    { key: "malibu", name: "Malibu (Stark HQ)", country: "US" },
    { key: "newyork", name: "New York (Stark Tower)", country: "US" },
    { key: "madrid", name: "Madrid", country: "ES" },
    { key: "tokyo", name: "Tokyo", country: "JP" },
    { key: "london", name: "London", country: "GB" },
    { key: "paris", name: "Paris", country: "FR" },
    { key: "sydney", name: "Sydney", country: "AU" },
    { key: "dubai", name: "Dubai", country: "AE" },
  ];

  // Radar animation
  useEffect(() => {
    const canvas = radarCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let scanAngle = 0;

    const renderRadar = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const r = 90;

      // Radar concentric rings
      [0.3, 0.6, 0.9].forEach((fraction) => {
        ctx.beginPath();
        ctx.arc(cx, cy, r * fraction, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(0, 240, 255, 0.25)";
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
      });

      // Crosshairs
      ctx.beginPath();
      ctx.moveTo(cx - r, cy);
      ctx.lineTo(cx + r, cy);
      ctx.moveTo(cx, cy - r);
      ctx.lineTo(cx, cy + r);
      ctx.strokeStyle = "rgba(0, 240, 255, 0.2)";
      ctx.lineWidth = 1;
      ctx.setLineDash([]);
      ctx.stroke();

      // Sweeping radar beam
      scanAngle += 0.035;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(scanAngle);

      const sweepGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
      sweepGrad.addColorStop(0, "rgba(0, 240, 255, 0.4)");
      sweepGrad.addColorStop(1, "rgba(0, 240, 255, 0.0)");

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, r, 0, Math.PI / 4);
      ctx.closePath();
      ctx.fillStyle = sweepGrad;
      ctx.fill();

      // Leading beam line
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(r, 0);
      ctx.strokeStyle = "rgba(0, 240, 255, 0.9)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      // Atmospheric blips (cloud density)
      const blips = [
        { x: cx + 35, y: cy - 25, intensity: 0.6 },
        { x: cx - 40, y: cy + 30, intensity: 0.8 },
        { x: cx + 20, y: cy + 50, intensity: 0.4 },
      ];

      blips.forEach((b) => {
        ctx.beginPath();
        ctx.arc(b.x, b.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(10, 230, 255, ${b.intensity})`;
        ctx.fill();
      });

      animId = requestAnimationFrame(renderRadar);
    };

    renderRadar();
    return () => cancelAnimationFrame(animId);
  }, []);

  const handleCityChange = (key: string) => {
    soundFX.playClick(1100);
    setSelectedCity(key);
    onRefreshCity(key);
  };

  const handleGeoLocation = () => {
    soundFX.playClick(1300);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          onRefreshCity("custom", pos.coords.latitude, pos.coords.longitude);
        },
        (err) => {
          console.warn("Geolocation denied, using default city", err);
        }
      );
    }
  };

  const toTemp = (celsius?: number) => {
    if (celsius === undefined) return "--";
    if (useFahrenheit) {
      return `${((celsius * 9) / 5 + 32).toFixed(1)}°F`;
    }
    return `${celsius.toFixed(1)}°C`;
  };

  const cur = weatherData?.current;

  return (
    <div id="weather-station-module" className="flex flex-col h-full bg-cyan-950/20 backdrop-blur-lg border border-cyan-500/20 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(34,211,238,0.08)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-cyan-950/40 backdrop-blur-md border-b border-cyan-500/20">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-900/40 border border-cyan-400/50 text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.2)]">
            <CloudRain className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-mono font-bold text-white tracking-wider">TELEMETRÍA ATMOSFÉRICA & CLIMA</h2>
            <p className="text-[10px] font-mono text-cyan-400/60">Datos públicos Open-Meteo · Sensores barométricos</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setUseFahrenheit(!useFahrenheit)}
            className="px-2.5 py-1 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-[10px] font-mono text-cyan-300 hover:border-cyan-400 hover:text-white backdrop-blur-md transition-all"
          >
            {useFahrenheit ? "°F" : "°C"}
          </button>
          <button
            onClick={handleGeoLocation}
            title="Usar geolocalización del navegador"
            className="p-1.5 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 hover:text-white hover:border-cyan-400 backdrop-blur-md transition-all"
          >
            <Navigation className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs scrollbar-thin scrollbar-thumb-cyan-900">
        {/* City Selector Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {cityOptions.map((c) => (
            <button
              key={c.key}
              onClick={() => handleCityChange(c.key)}
              className={`px-3 py-1.5 rounded-lg border text-xs whitespace-nowrap transition-all backdrop-blur-md ${
                selectedCity === c.key
                  ? "bg-cyan-500/20 border-cyan-400 text-white shadow-[0_0_15px_rgba(34,211,238,0.25)] font-bold"
                  : "bg-cyan-950/30 border-cyan-500/20 text-cyan-300/70 hover:border-cyan-500/40 hover:text-white hover:bg-cyan-900/30"
              }`}
            >
              <MapPin className="w-3 h-3 inline mr-1.5 text-cyan-400" />
              {c.name}
            </button>
          ))}
        </div>

        {/* Primary Weather Grid & Radar Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* Main Temperature Hero */}
          <div className="md:col-span-2 p-4 rounded-xl bg-cyan-950/30 backdrop-blur-md border border-cyan-500/25 flex flex-col justify-between relative overflow-hidden shadow-[0_0_20px_rgba(34,211,238,0.06)]">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-cyan-400/60 uppercase">UBICACIÓN SELECCIONADA</span>
                <h3 className="text-base font-bold text-white flex items-center gap-1.5 font-mono">
                  {weatherData?.location.name || "Malibu (Stark HQ)"}
                  <span className="text-xs px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
                    {weatherData?.location.country}
                  </span>
                </h3>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-cyan-400/60 uppercase">PRESIÓN BAROMÉTRICA</span>
                <div className="text-sm font-bold text-amber-300 font-mono">{cur?.surface_pressure ?? 1013.2} hPa</div>
              </div>
            </div>

            <div className="my-4 flex items-baseline gap-4">
              <div className="text-4xl sm:text-5xl font-bold text-white tracking-tight font-mono">
                {toTemp(cur?.temperature_2m)}
              </div>
              <div>
                <div className="text-xs text-cyan-300/70">Sensación térmica: {toTemp(cur?.apparent_temperature)}</div>
                <div className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
                  <Sun className="w-3.5 h-3.5" />
                  <span>Condiciones Estables · Visibilidad Óptima</span>
                </div>
              </div>
            </div>

            {/* Micro Telemetry Bar */}
            <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-cyan-500/20 text-center">
              <div className="p-2.5 rounded-lg bg-cyan-950/40 backdrop-blur-md border border-cyan-500/20">
                <div className="text-[10px] text-cyan-400/60 flex items-center justify-center gap-1 uppercase">
                  <Droplets className="w-3 h-3 text-cyan-400" /> HUMEDAD
                </div>
                <div className="text-xs font-bold text-white mt-0.5">{cur?.relative_humidity_2m ?? 50}%</div>
              </div>
              <div className="p-2.5 rounded-lg bg-cyan-950/40 backdrop-blur-md border border-cyan-500/20">
                <div className="text-[10px] text-cyan-400/60 flex items-center justify-center gap-1 uppercase">
                  <Wind className="w-3 h-3 text-cyan-400" /> VIENTO
                </div>
                <div className="text-xs font-bold text-white mt-0.5">{cur?.wind_speed_10m ?? 12} km/h</div>
              </div>
              <div className="p-2.5 rounded-lg bg-cyan-950/40 backdrop-blur-md border border-cyan-500/20">
                <div className="text-[10px] text-cyan-400/60 flex items-center justify-center gap-1 uppercase">
                  <Compass className="w-3 h-3 text-cyan-400" /> VECTOR
                </div>
                <div className="text-xs font-bold text-white mt-0.5">{cur?.wind_direction_10m ?? 240}°</div>
              </div>
            </div>
          </div>

          {/* Atmospheric Radar Scan Visualizer */}
          <div className="p-4 rounded-xl bg-cyan-950/30 backdrop-blur-md border border-cyan-500/25 flex flex-col items-center justify-center relative shadow-[0_0_20px_rgba(34,211,238,0.06)]">
            <div className="absolute top-3 left-3 text-[10px] text-cyan-300 font-bold uppercase">RADAR METEOROLÓGICO</div>
            <canvas ref={radarCanvasRef} width={200} height={200} className="w-[170px] h-[170px]" />
            <span className="text-[9px] text-cyan-400/60 mt-1 uppercase tracking-wider">ESCANEANDO COBERTURA NUBOSA</span>
          </div>
        </div>

        {/* 24h Hourly Telemetry Forecast */}
        {weatherData?.hourly && (
          <div className="p-4 rounded-xl bg-cyan-950/30 backdrop-blur-md border border-cyan-500/25 shadow-[0_0_20px_rgba(34,211,238,0.06)]">
            <h4 className="text-xs font-bold text-white mb-3 flex items-center justify-between font-mono uppercase tracking-wider">
              <span>PROYECCIÓN HORARIA DE TEMPERATURA & PRESIÓN</span>
              <span className="text-[10px] text-cyan-400/60 font-normal">Próximas 12 horas</span>
            </h4>

            <div className="grid grid-cols-6 sm:grid-cols-12 gap-2">
              {weatherData.hourly.time.slice(0, 12).map((t, idx) => {
                const temp = weatherData.hourly!.temperature_2m[idx];
                const hour = t.includes("T") ? t.split("T")[1].substring(0, 5) : t;
                return (
                  <div
                    key={idx}
                    className="flex flex-col items-center p-2 rounded-lg bg-cyan-950/40 backdrop-blur-md border border-cyan-500/20 text-center"
                  >
                    <span className="text-[9px] text-cyan-400/60">{hour}</span>
                    <div className="my-1.5 w-1.5 h-8 bg-cyan-950/80 rounded-full relative overflow-hidden">
                      <div
                        className="w-full bg-gradient-to-t from-cyan-400 to-amber-400 absolute bottom-0 rounded-full"
                        style={{ height: `${Math.min(100, Math.max(20, (temp / 40) * 100))}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-white">{temp}°</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

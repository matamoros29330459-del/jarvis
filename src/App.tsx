import React, { useState, useEffect, useRef, useCallback } from "react";
import { HeaderHUD } from "./components/HeaderHUD";
import { HolographicCore } from "./components/HolographicCore";
import { VoiceAssistant } from "./components/VoiceAssistant";
import { SecuritySystem } from "./components/SecuritySystem";
import { WeatherStation } from "./components/WeatherStation";
import { MemoryEngine } from "./components/MemoryEngine";
import { SatelliteTracker } from "./components/SatelliteTracker";
import { SystemDiagnostics } from "./components/SystemDiagnostics";
import { GlobalCommHub } from "./components/GlobalCommHub";
import { GoogleWorkspaceHub } from "./components/GoogleWorkspaceHub";
import { AppLauncherDeck } from "./components/AppLauncherDeck";
import { ThemeCustomizerModal } from "./components/ThemeCustomizerModal";
import {
  AppLauncherItem,
  ChatMessage,
  CustomThemeColors,
  FileAttachment,
  HUDTab,
  MemoryCategory,
  MemoryItem,
  SecurityLevel,
  SecurityStatus,
  SatelliteInfo,
  SystemTelemetry,
  ThemeId,
  WeatherTelemetry,
} from "./types";
import { soundFX } from "./utils/audioSynthesizer";
import {
  THEME_PRESETS,
  applyThemeToDocument,
  loadSavedTheme,
  saveTheme,
} from "./utils/themeEngine";
import { detectAppOpenIntent, openAppUrlImmediately } from "./utils/appLauncherData";

// Initial default memories for JARVIS Memory Engine v2
const DEFAULT_MEMORIES: MemoryItem[] = [
  {
    id: "mem_dir_1",
    key: "Directiva Primaria",
    value: "Asistencia táctica continua, monitoreo de amenazas globales y fidelidad absoluta al Operador Stark.",
    category: "directive",
    timestamp: "2026-08-27 12:00",
    pinned: true,
    source: "system",
  },
  {
    id: "mem_usr_1",
    key: "Operador Autorizado",
    value: "Identidad biométrica vinculada: Tony Stark / Jaime Matamoros. Acceso total a Gmail y Calendario.",
    category: "user_pref",
    timestamp: "2026-08-27 12:05",
    pinned: true,
    source: "system",
  },
  {
    id: "mem_ent_1",
    key: "Stark Tower & Malibu HQ",
    value: "Infraestructura principal conectada a la red satelital WGS-84 y micro-reactores Arc de respaldo.",
    category: "entity",
    timestamp: "2026-08-27 12:10",
    pinned: false,
    source: "system",
  },
  {
    id: "mem_prot_1",
    key: "Protocolo Centinela",
    value: "Vigilancia activa de órbitas LEO y análisis predictivo meteorológico en tiempo real.",
    category: "custom_protocol",
    timestamp: "2026-08-27 12:15",
    pinned: false,
    source: "system",
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<HUDTab>("core");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg_init",
      sender: "jarvis",
      text: "Todos los sistemas del reactor Arc Mark-VIII se encuentran en línea. Diga 'JARVIS' para hablar conmigo o redacte cualquier instrucción técnica.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  // Visual Theme Customization Engine
  const [themeState, setThemeState] = useState<{ id: ThemeId; colors: CustomThemeColors }>(() => {
    return loadSavedTheme();
  });
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  // Apply theme to document on mount & update
  useEffect(() => {
    applyThemeToDocument(themeState.colors);
    saveTheme(themeState.id, themeState.colors);
  }, [themeState]);

  // Memory Engine v2 persistence
  const [memoryItems, setMemoryItems] = useState<MemoryItem[]>(() => {
    try {
      const saved = localStorage.getItem("jarvis_memory_engine_v2");
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_MEMORIES;
  });

  useEffect(() => {
    try {
      localStorage.setItem("jarvis_memory_engine_v2", JSON.stringify(memoryItems));
    } catch {}
  }, [memoryItems]);

  // Security Status
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus>({
    level: 1,
    title: "Operador Técnico",
    codeName: "STARK_ALPHA_AUTH",
    biometricsVerified: true,
    sandboxIsolated: true,
    httpsEncrypted: true,
    cspActive: true,
    quarantineCount: 0,
    lastAudit: new Date().toLocaleTimeString(),
  });

  // Weather Telemetry
  const [weatherData, setWeatherData] = useState<WeatherTelemetry | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  // Satellites
  const [satellites, setSatellites] = useState<SatelliteInfo[]>([]);

  // System Diagnostics
  const [telemetry, setTelemetry] = useState<SystemTelemetry>({
    fps: 60,
    cpuLoadEst: 24,
    memoryUsedMB: 48,
    memoryTotalMB: 128,
    latencyMs: 18,
    isOnline: true,
    isSecureContext: typeof window !== "undefined" ? window.isSecureContext : true,
    audioActive: true,
    batteryLevel: null,
    isCharging: null,
    coresCount: typeof navigator !== "undefined" ? navigator.hardwareConcurrency || 8 : 8,
    gpuRenderer: "WebGL 2.0 (Shader Pipeline Activo)",
    uptimeSeconds: 0,
  });

  // States
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isBenchmarking, setIsBenchmarking] = useState(false);
  const [tacticalLogs, setTacticalLogs] = useState<string[]>([
    "[INICIO] Núcleo Arc Reactor Mark-VIII inicializado (1.21 GW).",
    "[RECONOCIMIENTO] Canal de escucha para palabra clave 'JARVIS' preparado.",
    "[SEGURIDAD] Sandbox del navegador verificado y blindado.",
    "[ORBITAL] Enlace con catálogo público satelital establecido.",
    "[WORKSPACE] Módulos de Gmail y Calendario listos para conexión.",
    "[MEMORIA] Motor de Memoria v2 sincronizado con almacenamiento local.",
  ]);

  const recognitionRef = useRef<any>(null);
  const shouldStayListeningRef = useRef<boolean>(false);
  const isSpeakingRef = useRef<boolean>(false);

  const addTacticalLog = useCallback((log: string) => {
    setTacticalLogs((prev) => [log, ...prev.slice(0, 30)]);
  }, []);

  const handleApplyTheme = useCallback((id: ThemeId, colors: CustomThemeColors) => {
    setThemeState({ id, colors });
    applyThemeToDocument(colors);
    saveTheme(id, colors);
    const themeName = id === "custom" ? "Personalizado" : THEME_PRESETS[id]?.name || id;
    addTacticalLog(`[TEMA VISUAL] Interfaz reconfigurada con perfil: ${themeName}.`);
  }, [addTacticalLog]);

  // Fetch initial weather and satellites
  const fetchWeather = useCallback(async (cityKey = "malibu", lat?: number, lon?: number) => {
    setWeatherLoading(true);
    try {
      let url = `/api/weather?city=${cityKey}`;
      if (lat !== undefined && lon !== undefined) {
        url = `/api/weather?lat=${lat}&lon=${lon}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      setWeatherData(data);
      addTacticalLog(`[METEO] Telemetría atmosférica actualizada para ${data.location?.name || cityKey}.`);
    } catch (err) {
      console.error("Error fetching weather:", err);
    } finally {
      setWeatherLoading(false);
    }
  }, [addTacticalLog]);

  const fetchSatellites = useCallback(async () => {
    try {
      const res = await fetch("/api/satellites");
      const data = await res.json();
      if (data.satellites) {
        setSatellites(data.satellites);
        addTacticalLog(`[ORBITAL] ${data.satellites.length} objetivos orbitales en seguimiento.`);
      }
    } catch (err) {
      console.error("Error fetching satellites:", err);
    }
  }, [addTacticalLog]);

  useEffect(() => {
    fetchWeather("malibu");
    fetchSatellites();
  }, [fetchWeather, fetchSatellites]);

  // Telemetry loop (FPS, Memory, Uptime)
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animId: number;

    const measureFPS = () => {
      frameCount++;
      const now = performance.now();
      if (now - lastTime >= 1000) {
        const currentFps = Math.round((frameCount * 1000) / (now - lastTime));
        frameCount = 0;
        lastTime = now;

        setTelemetry((prev) => {
          const perfMem = (performance as any).memory;
          const usedMB = perfMem ? Math.round(perfMem.usedJSHeapSize / (1024 * 1024)) : 42 + Math.round(Math.sin(now / 5000) * 8);
          const totalMB = perfMem ? Math.round(perfMem.totalJSHeapSize / (1024 * 1024)) : 128;

          return {
            ...prev,
            fps: Math.min(currentFps, 60),
            memoryUsedMB: usedMB,
            memoryTotalMB: totalMB,
            uptimeSeconds: prev.uptimeSeconds + 1,
          };
        });
      }
      animId = requestAnimationFrame(measureFPS);
    };

    animId = requestAnimationFrame(measureFPS);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Check network latency ping
  useEffect(() => {
    const pingInterval = setInterval(async () => {
      const start = performance.now();
      try {
        const res = await fetch("/api/health");
        if (res.ok) {
          const duration = Math.round(performance.now() - start);
          setTelemetry((prev) => ({ ...prev, latencyMs: Math.max(duration, 5) }));
        }
      } catch {}
    }, 15000);
    return () => clearInterval(pingInterval);
  }, []);

  // Direct app launcher handler
  const handleOpenAppDirect = useCallback(
    (app: AppLauncherItem) => {
      openAppUrlImmediately(app.url);
      soundFX.playHologramOpen();
      addTacticalLog(`[LANZADOR TÁCTICO] Desplegando ${app.name} (${app.url})`);
    },
    [addTacticalLog]
  );

  // Play Iron Man Song
  const handlePlayIronManSong = useCallback(() => {
    soundFX.playIronManTheme();
    addTacticalLog("[AUDIO] Reproduciendo tema icónico Iron Man (Sintetizador Stark Heavy Riff)...");
  }, [addTacticalLog]);

  // Execute embedded AI action tags
  const executeAIActions = useCallback(
    (replyText: string) => {
      const actionMatches = replyText.match(/\[ACTION:([^\]]+)\]/g);
      if (!actionMatches) return;

      actionMatches.forEach((raw) => {
        const inner = raw.replace("[ACTION:", "").replace("]", "").trim();

        if (inner.startsWith("SET_SECURITY")) {
          const match = inner.match(/level="?([0-3])"?/);
          if (match) {
            const lvl = parseInt(match[1]) as SecurityLevel;
            setSecurityStatus((prev) => ({
              ...prev,
              level: lvl,
              title: lvl === 3 ? "Stark Supremo" : lvl === 2 ? "Protocolo Mark-VII" : "Operador Técnico",
            }));
            soundFX.playSecurityAccess();
            addTacticalLog(`[COMANDO AI] Nivel de seguridad actualizado a Nivel ${lvl}.`);
          }
        } else if (inner.startsWith("PLAY_IRON_MAN_SONG")) {
          handlePlayIronManSong();
        } else if (inner.startsWith("SWITCH_TAB")) {
          const match = inner.match(/tab="?([a-zA-Z0-9_-]+)"?/);
          if (match) {
            const tabId = match[1].toLowerCase() as HUDTab;
            setActiveTab(tabId);
            soundFX.playHologramOpen();
            addTacticalLog(`[INTERFAZ] Navegando a pestaña: ${tabId}.`);
          }
        } else if (inner.startsWith("WEATHER_REFRESH")) {
          const match = inner.match(/city="?([^"]+)"?/);
          if (match) {
            fetchWeather(match[1]);
          }
        } else if (inner.startsWith("STORE_MEMORY")) {
          const keyMatch = inner.match(/key="?([^"]+)"?/);
          const valMatch = inner.match(/value="?([^"]+)"?/);
          if (keyMatch && valMatch) {
            const newMem: MemoryItem = {
              id: `mem_ai_${Date.now()}`,
              key: keyMatch[1],
              value: valMatch[1],
              category: "directive",
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              source: "jarvis",
            };
            setMemoryItems((prev) => [newMem, ...prev]);
            soundFX.playSuccess();
            addTacticalLog(`[MEMORIA AI] Nuevo registro almacenado: ${keyMatch[1]}.`);
          }
        } else if (inner.startsWith("PLAY_ALERT")) {
          if (inner.includes("warning")) {
            soundFX.playAlert();
          } else if (inner.includes("hologram")) {
            soundFX.playHologramOpen();
          } else {
            soundFX.playSuccess();
          }
        } else if (inner.startsWith("DIAGNOSTIC_RUN")) {
          soundFX.playAlert();
        } else if (inner.startsWith("CHANGE_THEME")) {
          const match = inner.match(/theme="?([a-zA-Z0-9_-]+)"?/);
          if (match) {
            const targetId = match[1].toLowerCase() as Exclude<ThemeId, "custom">;
            if (THEME_PRESETS[targetId]) {
              handleApplyTheme(targetId, THEME_PRESETS[targetId].colors);
              soundFX.playSuccess();
            }
          }
        } else if (inner.startsWith("OPEN_APP")) {
          const urlMatch = inner.match(/url="([^"]+)"/);
          const nameMatch = inner.match(/name="([^"]+)"/);
          const appUrl = urlMatch ? urlMatch[1] : "";
          const appName = nameMatch ? nameMatch[1] : "Aplicación";

          if (appUrl) {
            openAppUrlImmediately(appUrl);
            soundFX.playHologramOpen();
            addTacticalLog(`[LANZADOR TÁCTICO] Desplegando aplicación: ${appName} (${appUrl})`);
          }
        } else if (inner.startsWith("OPEN_THEME_CUSTOMIZER")) {
          setIsThemeModalOpen(true);
          soundFX.playHologramOpen();
        }
      });
    },
    [addTacticalLog, fetchWeather, handleApplyTheme, handlePlayIronManSong]
  );

  // Send message to Server-Side Gemini API
  const handleSendMessage = useCallback(
    async (text: string, isVoice = false, attachments?: FileAttachment[]) => {
      if ((!text.trim() && (!attachments || attachments.length === 0)) || isProcessing) return;

      const userMsg: ChatMessage = {
        id: `msg_user_${Date.now()}`,
        sender: "user",
        text: text.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isVoiceInput: isVoice,
        attachments: attachments,
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsProcessing(true);
      addTacticalLog(`[TRANSMISIÓN] Usuario: "${text.substring(0, 40) || (attachments ? 'Adjuntos' : '')}..."`);

      // 1. Direct App Launcher: detect intent and open URL immediately without requiring user clicks
      const appIntent = detectAppOpenIntent(text);
      if (appIntent) {
        openAppUrlImmediately(appIntent.url);
        soundFX.playHologramOpen();
        addTacticalLog(`[LANZADOR DIRECTO] Abriendo ${appIntent.appName} (${appIntent.url})`);
      }

      // Check if user said "jarvis", "olle jarvis", or "oye jarvis"
      const lower = text.toLowerCase();
      if (
        lower.includes("olle jarvis") ||
        lower.includes("oye jarvis") ||
        lower.includes("oye jarvis pon la cancion de ironman") ||
        lower.includes("cancion de ironman") ||
        lower.includes("iron man")
      ) {
        handlePlayIronManSong();
      }

      try {
        const payload = {
          prompt: text,
          attachments: attachments,
          memoryContext: memoryItems.map((m) => `${m.key}: ${m.value}`),
          systemTelemetry: {
            fps: telemetry.fps,
            latencyMs: telemetry.latencyMs,
            weather: weatherData?.location?.name,
            satellitesCount: satellites.length,
          },
          securityLevel: `Nivel ${securityStatus.level} (${securityStatus.title})`,
          conversationHistory: messages,
        };

        const res = await fetch("/api/jarvis/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        let rawReply = "Instrucción ejecutada, señor.";
        if (res.ok) {
          const data = await res.json();
          rawReply = data.text || data.fallbackText || "Instrucción ejecutada, señor.";
        } else {
          try {
            const errData = await res.json();
            rawReply = errData.text || errData.fallbackText || "Sistemas operativos y en línea, señor. Continuando bajo protocolo de seguridad.";
          } catch {
            rawReply = "Sistemas operativos y en línea, señor. Continuando bajo protocolo de seguridad.";
          }
        }

        // Extract actions
        const actionsFound = (rawReply.match(/\[ACTION:([^\]]+)\]/g) || []).map((a: string) =>
          a.replace("[ACTION:", "").replace("]", "")
        );

        const cleanReply = rawReply.replace(/\[ACTION:[^\]]+\]/g, "").trim();

        const jarvisMsg: ChatMessage = {
          id: `msg_jarvis_${Date.now()}`,
          sender: "jarvis",
          text: cleanReply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          actionsExtracted: actionsFound,
        };

        setMessages((prev) => [...prev, jarvisMsg]);
        executeAIActions(rawReply);

        // Speak reply via TTS
        if (typeof window !== "undefined" && window.speechSynthesis) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(cleanReply);
          utterance.lang = "es-ES";
          utterance.rate = 1.05;
          utterance.pitch = 0.95;

          const voices = window.speechSynthesis.getVoices();
          const refinedVoice =
            voices.find((v) => v.lang.includes("es-ES") && v.name.toLowerCase().includes("natural")) ||
            voices.find((v) => v.lang.includes("es")) ||
            voices[0];

          if (refinedVoice) {
            utterance.voice = refinedVoice;
          }

          utterance.onstart = () => {
            setIsSpeaking(true);
            isSpeakingRef.current = true;
          };

          utterance.onend = () => {
            setIsSpeaking(false);
            isSpeakingRef.current = false;
            // Resume listening loop if active
            if (shouldStayListeningRef.current && recognitionRef.current) {
              try {
                recognitionRef.current.start();
              } catch {}
            }
          };

          utterance.onerror = () => {
            setIsSpeaking(false);
            isSpeakingRef.current = false;
          };

          window.speechSynthesis.speak(utterance);
        }

        addTacticalLog(`[J.A.R.V.I.S.] Respuesta neural emitida.`);
      } catch (err: any) {
        console.error("Error communicating with JARVIS:", err);
        const errorMsg: ChatMessage = {
          id: `msg_err_${Date.now()}`,
          sender: "jarvis",
          text: "Señor, los enlaces cuánticos con el servidor han fluctuado. Los subsistemas locales permanecen estables.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, errorMsg]);
        soundFX.playAlert();
      } finally {
        setIsProcessing(false);
      }
    },
    [isProcessing, memoryItems, telemetry, weatherData, satellites, securityStatus, messages, addTacticalLog, executeAIActions, handlePlayIronManSong]
  );

  // Setup Continuous Web Speech Recognition with Wake Word "JARVIS"
  const startSpeechRecognition = useCallback(() => {
    const SpeechRec = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRec) {
      alert("El reconocimiento de voz del navegador no está disponible en este dispositivo.");
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }

      const recognition = new SpeechRec();
      recognition.lang = "es-ES";
      recognition.continuous = true;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        soundFX.playVoiceWake();
        addTacticalLog("[VOZ] Canal de audio abierto. Puede hablar o decir 'JARVIS'...");
      };

      recognition.onresult = (event: any) => {
        if (isSpeakingRef.current) return; // Prevent listening to own voice

        const lastResultIndex = event.results.length - 1;
        const transcript = event.results[lastResultIndex][0].transcript;
        if (transcript && transcript.trim()) {
          const lower = transcript.toLowerCase();
          addTacticalLog(`[VOZ DETECTADA] "${transcript}"`);

          if (lower.includes("olle jarvis") || lower.includes("oye jarvis") || lower.includes("jarvis")) {
            soundFX.playClick(1500);
          }

          handleSendMessage(transcript, true);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition notice:", event.error);
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          shouldStayListeningRef.current = false;
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        // Automatically restart if user desired continuous listening and not speaking
        if (shouldStayListeningRef.current && !isSpeakingRef.current) {
          try {
            recognition.start();
          } catch {
            setTimeout(() => {
              if (shouldStayListeningRef.current && !isSpeakingRef.current) {
                try {
                  recognition.start();
                } catch {}
              }
            }, 300);
          }
        } else {
          setIsListening(false);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Failed to start speech recognition:", err);
      setIsListening(false);
    }
  }, [addTacticalLog, handleSendMessage]);

  const handleToggleVoice = useCallback(() => {
    if (isListening) {
      shouldStayListeningRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      setIsListening(false);
      addTacticalLog("[VOZ] Micrófono desactivado.");
      return;
    }

    shouldStayListeningRef.current = true;
    startSpeechRecognition();
  }, [isListening, startSpeechRecognition, addTacticalLog]);

  // Memory Handlers
  const handleAddMemory = (key: string, value: string, category: MemoryCategory) => {
    const newItem: MemoryItem = {
      id: `mem_${Date.now()}`,
      key,
      value,
      category,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      source: "user",
    };
    setMemoryItems((prev) => [newItem, ...prev]);
    addTacticalLog(`[MEMORIA] Entrada agregada: "${key}".`);
  };

  const handleDeleteMemory = (id: string) => {
    setMemoryItems((prev) => prev.filter((m) => m.id !== id));
    addTacticalLog("[MEMORIA] Registro purgado.");
  };

  const handleTogglePin = (id: string) => {
    setMemoryItems((prev) =>
      prev.map((m) => (m.id === id ? { ...m, pinned: !m.pinned } : m))
    );
  };

  const handleClearAllMemories = () => {
    setMemoryItems([]);
    addTacticalLog("[MEMORIA] Purga completa ejecutada.");
  };

  const handleImportMemories = (items: MemoryItem[]) => {
    setMemoryItems(items);
    addTacticalLog(`[MEMORIA] ${items.length} registros importados.`);
  };

  // Security Clearance Handler
  const handleUpdateSecurityLevel = (level: SecurityLevel) => {
    const titles = ["Invitado", "Operador Técnico", "Protocolo Mark-VII", "Stark Supremo"];
    setSecurityStatus((prev) => ({
      ...prev,
      level,
      title: titles[level],
    }));
  };

  // Benchmark Run Handler
  const handleRunBenchmark = () => {
    setIsBenchmarking(true);
    addTacticalLog("[TEST] Iniciando benchmark de rendimiento...");
    setTimeout(() => {
      setIsBenchmarking(false);
      soundFX.playSuccess();
      addTacticalLog("[TEST] Benchmark finalizado. Rendimiento: 100% Óptimo (60 FPS).");
    }, 2000);
  };

  // Tactical Protocol Trigger
  const handleTriggerProtocol = (protocolName: string) => {
    addTacticalLog(`[PROTOCOLO] Activando: ${protocolName}...`);
    handleSendMessage(`JARVIS, he activado el ${protocolName}. Confirma el despliegue de medidas.`);
  };

  return (
    <div className="min-h-screen bg-[#020508] text-cyan-400 font-mono flex flex-col relative selection:bg-cyan-500/30 selection:text-white">
      {/* Frosted Glass Radial Particle Mesh Backdrop */}
      <div
        className="fixed inset-0 opacity-10 pointer-events-none z-0"
        style={{
          backgroundImage: "radial-gradient(#22d3ee 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-b from-cyan-950/20 via-transparent to-[#020508] z-0" />

      {/* Header HUD */}
      <HeaderHUD
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        securityLevel={securityStatus.level}
        isSpeaking={isSpeaking}
        isListening={isListening}
        onActivateVoice={handleToggleVoice}
        weatherTemp={weatherData?.current?.temperature_2m}
        weatherCity={weatherData?.location?.name ? `${weatherData.location.name.toUpperCase()}, ${weatherData.location.country}` : "MALIBU, CA"}
        currentThemeId={themeState.id}
        currentThemeName={themeState.id === "custom" ? "Personalizado" : THEME_PRESETS[themeState.id]?.name || "Clásico"}
        onOpenThemeCustomizer={() => setIsThemeModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 z-10 flex flex-col">
        {activeTab === "core" ? (
          <div className="flex-1 flex flex-col justify-center items-center py-2">
            <HolographicCore
              isSpeaking={isSpeaking}
              isListening={isListening}
              isProcessing={isProcessing}
              securityLevel={securityStatus.level}
              onActivateVoice={handleToggleVoice}
              onSelectTab={setActiveTab}
              activeTab={activeTab}
              themeColors={themeState.colors}
            />
          </div>
        ) : (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[560px]">
            {/* Left Main Functional Module (Frosted Glass Panel) */}
            <div className="lg:col-span-8 h-full flex flex-col">
              {activeTab === "voice" && (
                <VoiceAssistant
                  messages={messages}
                  isListening={isListening}
                  isSpeaking={isSpeaking}
                  isProcessing={isProcessing}
                  onSendMessage={handleSendMessage}
                  onToggleVoice={handleToggleVoice}
                  onClearHistory={() => setMessages([])}
                  onPlayIronManSong={handlePlayIronManSong}
                  memoryItems={memoryItems}
                  securityLevel={securityStatus.level}
                  systemTelemetry={telemetry}
                />
              )}

              {activeTab === "apps" && (
                <AppLauncherDeck
                  onOpenApp={handleOpenAppDirect}
                  onAddTacticalLog={addTacticalLog}
                  onAskJarvis={(prompt) => {
                    setActiveTab("voice");
                    handleSendMessage(prompt);
                  }}
                />
              )}

              {activeTab === "workspace" && (
                <GoogleWorkspaceHub
                  onAddTacticalLog={addTacticalLog}
                  onAskJarvis={(prompt) => {
                    setActiveTab("voice");
                    handleSendMessage(prompt);
                  }}
                />
              )}

              {activeTab === "satellites" && (
                <SatelliteTracker
                  satellites={satellites}
                  onAskJarvis={(prompt) => {
                    setActiveTab("voice");
                    handleSendMessage(prompt);
                  }}
                />
              )}

              {activeTab === "weather" && (
                <WeatherStation
                  weatherData={weatherData}
                  loading={weatherLoading}
                  onRefreshCity={fetchWeather}
                />
              )}

              {activeTab === "security" && (
                <SecuritySystem
                  securityStatus={securityStatus}
                  onUpdateSecurityLevel={handleUpdateSecurityLevel}
                  onAddLog={addTacticalLog}
                />
              )}

              {activeTab === "memory" && (
                <MemoryEngine
                  memoryItems={memoryItems}
                  onAddMemory={handleAddMemory}
                  onDeleteMemory={handleDeleteMemory}
                  onTogglePin={handleTogglePin}
                  onClearAllMemories={handleClearAllMemories}
                  onImportMemories={handleImportMemories}
                />
              )}

              {activeTab === "diagnostics" && (
                <SystemDiagnostics
                  telemetry={telemetry}
                  onRunBenchmark={handleRunBenchmark}
                  isBenchmarking={isBenchmarking}
                />
              )}

              {activeTab === "comm" && (
                <GlobalCommHub
                  logs={tacticalLogs}
                  onTriggerProtocol={handleTriggerProtocol}
                  onSendEncryptedTransmission={(msg) => handleSendMessage(msg)}
                />
              )}
            </div>

            {/* Right Tactical Mini-Core & Assistant Sidebar - Authentic Iron Man Mini Arc Reactor */}
            <div className="lg:col-span-4 h-full flex flex-col gap-5">
              {/* Mini Arc Reactor Visualizer Card */}
              <div
                onClick={() => {
                  soundFX.playArcReactorBoot();
                  handleToggleVoice();
                }}
                className="p-4 rounded-xl bg-cyan-950/30 backdrop-blur-lg border border-cyan-500/30 flex items-center justify-between cursor-pointer hover:border-cyan-400/80 hover:bg-cyan-900/40 transition-all shadow-[0_0_25px_rgba(34,211,238,0.12)] group"
              >
                <div className="flex items-center gap-3.5">
                  {/* Detailed Mini SVG Arc Reactor */}
                  <div className="relative w-14 h-14 rounded-full bg-[#050b12] border border-cyan-500/40 flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.35)] group-hover:scale-105 transition-transform backdrop-blur-md overflow-hidden">
                    <svg viewBox="0 0 100 100" className={`w-full h-full ${isSpeaking ? 'animate-spin' : isListening ? 'animate-pulse' : ''}`} style={{ animationDuration: '10s' }}>
                      {/* Outer titanium ring */}
                      <circle cx="50" cy="50" r="46" fill="#0c1824" stroke="#22d3ee" strokeWidth="2" opacity="0.8" />
                      {/* 10 Copper Coil Segments */}
                      {[...Array(10)].map((_, i) => {
                        const angle = (i * 36) * (Math.PI / 180);
                        const x = 50 + Math.cos(angle) * 35;
                        const y = 50 + Math.sin(angle) * 35;
                        return (
                          <g key={i} transform={`rotate(${i * 36}, 50, 50)`}>
                            <rect x="47" y="10" width="6" height="12" fill="#d97706" stroke="#78350f" strokeWidth="0.5" rx="1" />
                            <line x1="47" y1="13" x2="53" y2="13" stroke="#fde68a" strokeWidth="0.5" />
                            <line x1="47" y1="16" x2="53" y2="16" stroke="#fde68a" strokeWidth="0.5" />
                            <line x1="47" y1="19" x2="53" y2="19" stroke="#fde68a" strokeWidth="0.5" />
                            <rect x="48.5" y="9" width="3" height="14" fill="#374151" />
                          </g>
                        );
                      })}
                      {/* Inner glowing ring */}
                      <circle cx="50" cy="50" r="24" fill="#040a12" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4 2" />
                      {/* Core Lens */}
                      <circle cx="50" cy="50" r="14" fill="#0284c7" opacity="0.6" />
                      <circle cx="50" cy="50" r="8" fill="#e0f2fe" opacity="0.9" />
                      <circle cx="50" cy="50" r="3" fill="#ffffff" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white tracking-wider flex items-center gap-1.5">
                      <span>CHEST ARC REACTOR</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    </div>
                    <div className="text-[10px] text-cyan-300/70 font-mono">
                      {isListening ? "Escuchando: diga 'JARVIS'..." : isSpeaking ? "JARVIS respondiendo..." : "Pulsar o decir 'JARVIS'"}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-bold text-emerald-400 font-mono">100%</span>
                  <div className="text-[9px] text-cyan-400/60 uppercase tracking-tighter">1.21 GW FLUX</div>
                </div>
              </div>

              {/* Tactical Event Stream Sidebar - Frosted Glass Container */}
              <div className="flex-1 rounded-xl bg-cyan-950/20 backdrop-blur-lg border border-cyan-500/20 p-4 flex flex-col shadow-[0_0_20px_rgba(34,211,238,0.08)] overflow-hidden">
                <div className="flex items-center justify-between pb-3 mb-2.5 border-b border-cyan-500/20 text-xs text-white font-bold tracking-wider uppercase">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Telemetría Táctica</span>
                  </div>
                  <span className="text-[10px] text-cyan-400/60 font-normal">EN VIVO</span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2.5 font-mono text-[11px] text-cyan-300/70 scrollbar-thin scrollbar-thumb-cyan-900">
                  {tacticalLogs.map((log, idx) => (
                    <div key={idx} className="leading-relaxed p-1.5 rounded bg-cyan-900/10 border-l-2 border-cyan-500/40">
                      <span className="text-cyan-400 font-bold mr-1">&gt;</span>
                      <span className="text-slate-200">{log}</span>
                    </div>
                  ))}
                </div>

                {/* Quick Directive Input in sidebar */}
                <div className="pt-3 mt-2.5 border-t border-cyan-500/20 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Escribir 'JARVIS' o comando directo..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.target as HTMLInputElement).value.trim()) {
                        handleSendMessage((e.target as HTMLInputElement).value.trim());
                        (e.target as HTMLInputElement).value = "";
                      }
                    }}
                    className="flex-1 bg-cyan-950/40 border border-cyan-500/30 rounded-lg px-3 py-1.5 text-xs font-mono text-white placeholder-cyan-500/40 outline-none focus:border-cyan-400 backdrop-blur-md transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Frosted Glass Footer Telemetry Dock */}
        <footer className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 z-10">
          <div className="bg-cyan-950/40 backdrop-blur-md border border-cyan-500/20 p-3.5 rounded-xl shadow-[0_0_15px_rgba(34,211,238,0.06)] hover:border-cyan-500/40 transition-all">
            <div className="text-[9px] text-cyan-400/60 mb-1 uppercase tracking-wider font-semibold">Tasa de Refresco</div>
            <div className="text-base sm:text-lg font-bold text-white font-mono flex items-baseline justify-between">
              <span>{telemetry.fps} FPS</span>
              <span className="text-[10px] font-normal text-emerald-400 font-sans ml-2">ESTABLE</span>
            </div>
          </div>

          <div className="bg-cyan-950/40 backdrop-blur-md border border-cyan-500/20 p-3.5 rounded-xl shadow-[0_0_15px_rgba(34,211,238,0.06)] hover:border-cyan-500/40 transition-all">
            <div className="text-[9px] text-cyan-400/60 mb-1 uppercase tracking-wider font-semibold">Enlace Neuronal</div>
            <div className="text-base sm:text-lg font-bold text-white font-mono flex items-baseline justify-between">
              <span>99.9%</span>
              <span className="text-[10px] font-normal text-cyan-300 font-sans ml-2">GEMINI 3.7</span>
            </div>
          </div>

          <div className="bg-cyan-950/40 backdrop-blur-md border border-cyan-500/20 p-3.5 rounded-xl shadow-[0_0_15px_rgba(34,211,238,0.06)] hover:border-cyan-500/40 transition-all">
            <div className="text-[9px] text-cyan-400/60 mb-1 uppercase tracking-wider font-semibold">Latencia API / RTT</div>
            <div className="text-base sm:text-lg font-bold text-white font-mono flex items-baseline justify-between">
              <span>{telemetry.latencyMs}ms</span>
              <span className="text-[10px] font-normal text-emerald-400 font-sans ml-2">ÓPTIMO</span>
            </div>
          </div>

          <div className="bg-cyan-950/40 backdrop-blur-md border border-cyan-500/20 p-3.5 rounded-xl shadow-[0_0_15px_rgba(34,211,238,0.06)] hover:border-cyan-500/40 transition-all">
            <div className="text-[9px] text-cyan-400/60 mb-1 uppercase tracking-wider font-semibold">Reactor Arc Mark-VIII</div>
            <div className="text-base sm:text-lg font-bold text-white font-mono flex items-baseline justify-between">
              <span>100%</span>
              <span className="text-[10px] font-normal text-cyan-300 font-sans ml-2">1.21 GW</span>
            </div>
          </div>
        </footer>
      </main>

      {/* Futuristic Theme Customizer Modal */}
      <ThemeCustomizerModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        currentThemeId={themeState.id}
        currentColors={themeState.colors}
        onApplyTheme={handleApplyTheme}
      />
    </div>
  );
}

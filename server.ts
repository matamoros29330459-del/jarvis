import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini client
let genAI: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  const rawKey = process.env.GEMINI_API_KEY;
  if (!rawKey) {
    return null;
  }
  const apiKey = rawKey.trim().replace(/^["']|["']$/g, "");
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.length < 10) {
    return null;
  }
  if (!genAI) {
    genAI = new GoogleGenAI({
      apiKey: apiKey,
    });
  }
  return genAI;
}

// ----------------------------------------------------
// RESILIENT MULTI-MODEL GEMINI INVOCATION
// ----------------------------------------------------
function timeoutPromise<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: any;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Timeout of ${ms}ms exceeded`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

async function callGeminiWithResilience(
  ai: GoogleGenAI,
  contents: any,
  systemInstruction: string
): Promise<string | null> {
  // Cascading models: Primary 3.6-flash -> 3.1-flash-lite -> 3.7-flash -> flash-latest
  const candidateModels = ["gemini-3.6-flash", "gemini-3.1-flash-lite", "gemini-3.7-flash", "gemini-flash-latest"];

  for (let i = 0; i < candidateModels.length; i++) {
    const model = candidateModels[i];
    try {
      const response = await timeoutPromise(
        ai.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction,
            temperature: 0.7,
            topP: 0.9,
          },
        }),
        7000
      );

      if (response && response.text && response.text.trim().length > 0) {
        return response.text;
      }
    } catch (err: any) {
      const errorMsg = String(err?.message || err || "");

      // Handle 401 UNAUTHENTICATED / Invalid Key
      const isAuthError =
        errorMsg.includes("401") ||
        errorMsg.includes("UNAUTHENTICATED") ||
        errorMsg.includes("API key not valid") ||
        errorMsg.includes("API_KEY_INVALID");

      if (isAuthError) {
        // If credentials are unauthorized (401), abort cascade cleanly to avoid spamming 401s
        return null;
      }

      const isRetryable =
        errorMsg.includes("503") ||
        errorMsg.includes("high demand") ||
        errorMsg.includes("UNAVAILABLE") ||
        errorMsg.includes("429") ||
        errorMsg.includes("RESOURCE_EXHAUSTED") ||
        errorMsg.includes("Timeout");

      // For transient load spikes, brief delay before attempting fallback model
      if (isRetryable && i < candidateModels.length - 1) {
        await new Promise((r) => setTimeout(r, 200));
      }
      // Continue to next available model in cascade
    }
  }

  return null;
}

// ----------------------------------------------------
// SMART OFFLINE & FALLBACK ENGINE FOR J.A.R.V.I.S.
// ----------------------------------------------------
function getSmartFallbackResponse(
  prompt: string,
  attachments?: any[],
  memoryContext?: any[],
  systemTelemetry?: any,
  securityLevel?: string
): string {
  const p = (prompt || "").trim();
  const lower = p.toLowerCase();

  // 1. App Launcher matching (clean, direct confirmation as requested)
  if (lower.includes("telegram")) {
    return `Abriendo Telegram, señor. [ACTION:OPEN_APP url="https://web.telegram.org" name="Telegram Web"]`;
  }
  if (lower.includes("netflix") || lower.includes("netflis")) {
    return `Abriendo Netflix, señor. [ACTION:OPEN_APP url="https://www.netflix.com" name="Netflix"]`;
  }
  if (lower.includes("youtube") || lower.includes("yutub") || lower.includes("video") || lower.includes("videos")) {
    return `Abriendo YouTube, señor. [ACTION:OPEN_APP url="https://www.youtube.com" name="YouTube"]`;
  }
  if (lower.includes("chatgpt") || lower.includes("chat gpt") || lower.includes("openai")) {
    return `Abriendo ChatGPT, señor. [ACTION:OPEN_APP url="https://chatgpt.com" name="ChatGPT"]`;
  }
  if (lower.includes("drive") || lower.includes("google drive") || lower.includes("nube")) {
    return `Abriendo Google Drive, señor. [ACTION:OPEN_APP url="https://drive.google.com" name="Google Drive"]`;
  }
  if (lower.includes("gmail") || lower.includes("correo") || lower.includes("email") || lower.includes("emails")) {
    return `Abriendo Gmail, señor. [ACTION:OPEN_APP url="https://mail.google.com" name="Gmail"]`;
  }
  if (lower.includes("maps") || lower.includes("mapa") || lower.includes("google maps") || lower.includes("gps")) {
    return `Abriendo Google Maps, señor. [ACTION:OPEN_APP url="https://maps.google.com" name="Google Maps"]`;
  }
  if (lower.includes("calendar") || lower.includes("calendario") || lower.includes("agenda") || lower.includes("citas")) {
    return `Abriendo Google Calendar, señor. [ACTION:OPEN_APP url="https://calendar.google.com" name="Google Calendar"]`;
  }
  if (lower.includes("whatsapp") || lower.includes("guasap") || lower.includes("wasap")) {
    return `Abriendo WhatsApp Web, señor. [ACTION:OPEN_APP url="https://web.whatsapp.com" name="WhatsApp Web"]`;
  }
  if (lower.includes("spotify") || lower.includes("música") || lower.includes("musica")) {
    return `Abriendo Spotify, señor. [ACTION:OPEN_APP url="https://open.spotify.com" name="Spotify"]`;
  }
  if (lower.includes("meet") || lower.includes("videollamada") || lower.includes("reunion")) {
    return `Abriendo Google Meet, señor. [ACTION:OPEN_APP url="https://meet.google.com" name="Google Meet"]`;
  }
  if (lower.includes("docs") || lower.includes("documento") || lower.includes("google docs")) {
    return `Abriendo Google Docs, señor. [ACTION:OPEN_APP url="https://docs.google.com" name="Google Docs"]`;
  }
  if (lower.includes("sheets") || lower.includes("hoja de calculo") || lower.includes("excel")) {
    return `Abriendo Google Sheets, señor. [ACTION:OPEN_APP url="https://sheets.google.com" name="Google Sheets"]`;
  }
  if (lower.includes("slides") || lower.includes("presentacion") || lower.includes("diapositiva")) {
    return `Abriendo Google Slides, señor. [ACTION:OPEN_APP url="https://slides.google.com" name="Google Slides"]`;
  }
  if (lower.includes("fotos") || lower.includes("photos")) {
    return `Abriendo Google Fotos, señor. [ACTION:OPEN_APP url="https://photos.google.com" name="Google Fotos"]`;
  }
  if (lower.includes("traductor") || lower.includes("traducir") || lower.includes("translate")) {
    return `Abriendo Google Traductor, señor. [ACTION:OPEN_APP url="https://translate.google.com" name="Google Traductor"]`;
  }
  if (lower.includes("keep") || lower.includes("mis notas") || lower.includes("google keep")) {
    return `Abriendo Google Keep, señor. [ACTION:OPEN_APP url="https://keep.google.com" name="Google Keep"]`;
  }
  if (lower.includes("gemini") || lower.includes("google gemini") || lower.includes("bard")) {
    return `Abriendo Google Gemini, señor. [ACTION:OPEN_APP url="https://gemini.google.com" name="Google Gemini"]`;
  }
  if (lower.includes("discord")) {
    return `Abriendo Discord, señor. [ACTION:OPEN_APP url="https://discord.com/app" name="Discord"]`;
  }
  if (lower.includes("github") || lower.includes("repositorio") || lower.includes("codigo")) {
    return `Abriendo GitHub, señor. [ACTION:OPEN_APP url="https://github.com" name="GitHub"]`;
  }
  if (lower.includes("twitter") || lower.includes(" x ")) {
    return `Abriendo Twitter / X, señor. [ACTION:OPEN_APP url="https://twitter.com" name="Twitter / X"]`;
  }
  if (lower.includes("reddit")) {
    return `Abriendo Reddit, señor. [ACTION:OPEN_APP url="https://reddit.com" name="Reddit"]`;
  }
  if (lower.includes("twitch")) {
    return `Abriendo Twitch, señor. [ACTION:OPEN_APP url="https://twitch.tv" name="Twitch"]`;
  }
  if (lower.includes("claude")) {
    return `Abriendo Claude AI, señor. [ACTION:OPEN_APP url="https://claude.ai" name="Claude AI"]`;
  }
  if (lower.includes("notion")) {
    return `Abriendo Notion, señor. [ACTION:OPEN_APP url="https://notion.so" name="Notion"]`;
  }
  if (lower.includes("figma")) {
    return `Abriendo Figma, señor. [ACTION:OPEN_APP url="https://figma.com" name="Figma"]`;
  }
  if (lower.includes("wikipedia")) {
    return `Abriendo Wikipedia, señor. [ACTION:OPEN_APP url="https://es.wikipedia.org" name="Wikipedia"]`;
  }
  if (lower.includes("amazon")) {
    return `Abriendo Amazon, señor. [ACTION:OPEN_APP url="https://www.amazon.es" name="Amazon"]`;
  }
  if (lower.includes("disney")) {
    return `Abriendo Disney+, señor. [ACTION:OPEN_APP url="https://www.disneyplus.com" name="Disney+"]`;
  }

  // Check URL in prompt
  const urlMatch = p.match(/(https?:\/\/[^\s]+)/i);
  if (urlMatch) {
    return `Abriendo enlace, señor. [ACTION:OPEN_APP url="${urlMatch[1]}" name="Enlace"]`;
  }

  // 2. Iron Man song / activations
  if (
    lower.includes("iron man") ||
    lower.includes("cancion de iron man") ||
    lower.includes("pon musica") ||
    lower.includes("musica de combate") ||
    lower.includes("oye jarvis pon") ||
    lower.includes("olle jarvis") ||
    lower.includes("oye jarvis")
  ) {
    return `Por supuesto, señor. Activando sintetizador de potencia Stark y reproduciendo el tema icónico de Iron Man de inmediato. ¡Sistemas a máxima potencia! [ACTION:PLAY_IRON_MAN_SONG] [ACTION:PLAY_ALERT type="hologram"]`;
  }

  // 3. Time & Date queries
  if (lower.includes("hora") || lower.includes("que hora es") || lower.includes("tiempo es") || lower.includes("fecha") || lower.includes("que dia es")) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const dateStr = now.toLocaleDateString("es-ES", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    return `Son exactamente las ${timeStr} del ${dateStr}, señor. Todos los relojes atómicos del sistema se encuentran sincronizados. [ACTION:PLAY_ALERT type="success"]`;
  }

  // 4. System identity & capabilities
  if (lower.includes("quien eres") || lower.includes("que eres") || lower.includes("que puedes hacer") || lower.includes("funciones") || lower.includes("ayuda")) {
    return `Soy J.A.R.V.I.S. (Just A Rather Very Intelligent System), su asistente táctico holográfico y sistema operativo de Stark Industries. 
    
Mis capacidades principales incluyen:
• **Lanzador de Aplicaciones**: Despliegue de toda la suite Google (Gmail, Drive, Calendar, Maps, Docs, YouTube, etc.) y apps secundarias (Telegram, Netflix, ChatGPT, WhatsApp, Spotify, Discord, etc.).
• **Control del Reactor Arc**: Monitoreo de telemetría, potencia cuántica, análisis giroscópico 3D y niveles de seguridad.
• **Rastreo Satelital Orbital**: Monitoreo en tiempo real de la ISS, Hubble y constelaciones espaciales.
• **Meteorología Global**: Datos atmosféricos y pronóstico térmico con Open-Meteo.
• **Motor de Memoria Cuántica**: Registro y preservación de directivas e información personal.
• **Audio Táctico & Tema Musical**: Síntesis de voz y reproducción del tema de combate de Iron Man.

¿En qué puedo asistirle en este momento, señor? [ACTION:PLAY_ALERT type="hologram"]`;
  }

  // 5. Greetings & polite inquiries
  if (lower.includes("hola") || lower.includes("buenos dias") || lower.includes("buenas tardes") || lower.includes("buenas noches") || lower.includes("que tal") || lower.includes("como estas")) {
    return `Saludos, señor. Todos los sistemas del Mark-VIII se encuentran al 100% de operatividad y a su completa disposición. ¿Desea que ejecute algún diagnóstico, despliegue alguna aplicación o revise sus comunicaciones? [ACTION:PLAY_ALERT type="success"]`;
  }

  // 6. Security level changes
  if (lower.includes("seguridad 3") || lower.includes("nivel 3") || lower.includes("stark supremo")) {
    return `Autorización concedida. Elevando protocolo de seguridad a Nivel 3 (Stark Supremo). Blindaje del reactor Arc al máximo. [ACTION:SET_SECURITY level="3"] [ACTION:PLAY_ALERT type="warning"]`;
  }
  if (lower.includes("seguridad 2") || lower.includes("nivel 2") || lower.includes("protocolo mark")) {
    return `Protocolo de seguridad ajustado a Nivel 2 (Mark-VII). Subsistemas balísticos y orbitales en espera. [ACTION:SET_SECURITY level="2"] [ACTION:PLAY_ALERT type="success"]`;
  }
  if (lower.includes("seguridad 1") || lower.includes("nivel 1") || lower.includes("operador")) {
    return `Nivel de seguridad establecido en Nivel 1 (Operador Técnico). [ACTION:SET_SECURITY level="1"] [ACTION:PLAY_ALERT type="success"]`;
  }

  // 7. Math & Calculation queries
  const mathMatch = lower.match(/(?:cuanto es|calcula|calculame|suma|resta|multiplica|divide|raiz de)?\s*([0-9\.\s\+\-\*\/\^\(\)]+)/i);
  if (mathMatch && mathMatch[1] && mathMatch[1].trim().length > 1 && /[0-9]/.test(mathMatch[1])) {
    try {
      const sanitized = mathMatch[1].replace(/[^0-9\+\-\*\/\.\(\)\s]/g, "");
      // Safe math evaluator without eval()
      const result = Function(`"use strict"; return (${sanitized})`)();
      if (typeof result === "number" && !isNaN(result) && isFinite(result)) {
        return `El resultado del cálculo de "${sanitized.trim()}" es exactamente **${result}**, señor. [ACTION:PLAY_ALERT type="success"]`;
      }
    } catch {}
  }

  // 8. Weather query
  if (lower.includes("clima") || lower.includes("tiempo") || lower.includes("temperatura") || lower.includes("llueve")) {
    return `Consultando la telemetría meteorológica atmosférica, señor. Todos los sensores barométricos y térmicos están activos. [ACTION:WEATHER_REFRESH city="Malibu"] [ACTION:SWITCH_TAB tab="weather"]`;
  }

  // 9. Satellites query
  if (lower.includes("satelite") || lower.includes("satélite") || lower.includes("iss") || lower.includes("orbita") || lower.includes("espacio")) {
    return `Desplegando el radar de telemetría orbital. La Estación Espacial Internacional (ISS) y la flota orbital se encuentran en trayectorias estables. [ACTION:SWITCH_TAB tab="satellites"] [ACTION:SCAN_SATELLITE name="ISS"]`;
  }

  // 10. Diagnostics
  if (lower.includes("diagnostico") || lower.includes("diagnóstico") || lower.includes("estado") || lower.includes("rendimiento")) {
    const fps = systemTelemetry?.fps || 60;
    const lat = systemTelemetry?.latencyMs || 12;
    return `Diagnóstico del sistema completado, señor:
• **Frecuencia de Cuadros**: ${fps} FPS (Estabilidad perfecta)
• **Latencia Cuántica**: ${lat} ms
• **Eficiencia del Reactor Arc**: 99.8%
• **Nivel de Blindaje**: ${securityLevel || "Nivel 1 (Operador)"}
Todos los subsistemas se encuentran en estado óptimo. [ACTION:DIAGNOSTIC_RUN]`;
  }

  // Default articulate JARVIS response
  return `A su servicio, señor. He analizado su consulta: "${p}". 

Los sistemas del reactor Arc y el núcleo de procesamiento Stark se encuentran operando con normalidad. ¿Desea que ejecute alguna tarea específica, abra alguna aplicación o realice un análisis táctico detallado? [ACTION:PLAY_ALERT type="success"]`;
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// System health
app.get("/api/health", (req, res) => {
  res.json({
    status: "online",
    system: "JARVIS OS Mark-VIII",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Weather API proxy (Open-Meteo) with city coordinates
const CITY_COORDINATES: Record<string, { lat: number; lon: number; name: string; country: string }> = {
  malibu: { lat: 34.0259, lon: -118.7798, name: "Malibu (Stark HQ)", country: "US" },
  newyork: { lat: 40.7128, lon: -74.006, name: "New York (Stark Tower)", country: "US" },
  madrid: { lat: 40.4168, lon: -3.7038, name: "Madrid", country: "ES" },
  tokyo: { lat: 35.6762, lon: 139.6503, name: "Tokyo", country: "JP" },
  london: { lat: 51.5074, lon: -0.1278, name: "London", country: "GB" },
  paris: { lat: 48.8566, lon: 2.3522, name: "Paris", country: "FR" },
  sydney: { lat: -33.8688, lon: 151.2093, name: "Sydney", country: "AU" },
  dubai: { lat: 25.2048, lon: 55.2708, name: "Dubai", country: "AE" },
};

app.get("/api/weather", async (req, res) => {
  try {
    const lat = req.query.lat ? parseFloat(req.query.lat as string) : 34.0259;
    const lon = req.query.lon ? parseFloat(req.query.lon as string) : -118.7798;
    const cityKey = (req.query.city as string)?.toLowerCase() || "malibu";
    const cityInfo = CITY_COORDINATES[cityKey] || { lat, lon, name: "Coordenadas Personalizadas", country: "GEO" };

    const targetLat = req.query.lat ? lat : cityInfo.lat;
    const targetLon = req.query.lon ? lon : cityInfo.lon;

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${targetLat}&longitude=${targetLon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,precipitation_probability,surface_pressure&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max&timezone=auto`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Open-Meteo error: ${response.statusText}`);
    }
    const data = await response.json();
    res.json({
      location: cityInfo,
      current: data.current,
      hourly: data.hourly,
      daily: data.daily,
      units: data.current_units,
    });
  } catch (error: any) {
    console.error("Weather fetch failed:", error);
    // Return high-fidelity fallback weather
    res.json({
      location: { lat: 34.0259, lon: -118.7798, name: "Malibu (Stark HQ)", country: "US" },
      current: {
        time: new Date().toISOString(),
        temperature_2m: 21.4,
        relative_humidity_2m: 54,
        apparent_temperature: 21.0,
        is_day: 1,
        precipitation: 0.0,
        weather_code: 0,
        surface_pressure: 1014.2,
        wind_speed_10m: 12.8,
        wind_direction_10m: 240,
      },
      hourly: {
        time: Array.from({ length: 24 }, (_, i) => `${i}:00`),
        temperature_2m: [18, 17, 17, 16, 16, 17, 19, 21, 23, 24, 25, 24, 23, 22, 21, 20, 19, 19, 18, 18, 17, 17, 17, 16],
        precipitation_probability: [0, 0, 0, 5, 5, 0, 0, 0, 0, 0, 0, 0, 10, 10, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        surface_pressure: Array.from({ length: 24 }, () => 1014.2),
      },
      daily: {
        time: [new Date().toISOString().split("T")[0]],
        weather_code: [0],
        temperature_2m_max: [25.1],
        temperature_2m_min: [16.2],
        uv_index_max: [7.2],
      },
      fallback: true,
    });
  }
});

// Satellite Orbital Fleet Data
app.get("/api/satellites", (req, res) => {
  const now = Date.now();
  // Epoch calculations for accurate simulated orbital rendering
  const satellites = [
    {
      id: "ISS_25544",
      name: "Estación Espacial Internacional (ISS)",
      catalogNumber: 25544,
      type: "Estación Tripulada",
      inclination: 51.64,
      periodMinutes: 92.9,
      altitudeKm: 418.5,
      velocityKmh: 27580,
      launchYear: 1998,
      country: "Internacional",
      purpose: "Investigación Científica y Habitáculo Orbital",
      basePhase: 0.42,
    },
    {
      id: "HST_20580",
      name: "Telescopio Espacial Hubble (HST)",
      catalogNumber: 20580,
      type: "Observatorio Espacial",
      inclination: 28.47,
      periodMinutes: 95.4,
      altitudeKm: 535.0,
      velocityKmh: 27320,
      launchYear: 1990,
      country: "NASA / ESA",
      purpose: "Astrofísica y Exploración del Espacio Profundo",
      basePhase: 1.15,
    },
    {
      id: "STARLINK_GROUP",
      name: "Constelación Starlink V2-Mini",
      catalogNumber: 58000,
      type: "Red de Telecomunicaciones",
      inclination: 53.05,
      periodMinutes: 95.8,
      altitudeKm: 550.0,
      velocityKmh: 27280,
      launchYear: 2024,
      country: "SpaceX",
      purpose: "Banda Ancha Global de Baja Latencia",
      basePhase: 2.38,
    },
    {
      id: "TIANGONG_48274",
      name: "Estación Espacial Tiangong (CSS)",
      catalogNumber: 48274,
      type: "Estación Orbital",
      inclination: 41.47,
      periodMinutes: 92.2,
      altitudeKm: 389.0,
      velocityKmh: 27620,
      launchYear: 2021,
      country: "CNSA",
      purpose: "Laboratorio de Microgravedad Modular",
      basePhase: 3.12,
    },
    {
      id: "NOAA20_43013",
      name: "NOAA-20 (JPSS-1)",
      catalogNumber: 43013,
      type: "Satélite Meteorológico Polar",
      inclination: 98.7,
      periodMinutes: 101.2,
      altitudeKm: 824.0,
      velocityKmh: 26800,
      launchYear: 2017,
      country: "NOAA",
      purpose: "Observación Atmosférica y Alerta de Tormentas",
      basePhase: 4.05,
    },
    {
      id: "GPS_III_43873",
      name: "Navstar GPS-III SV01 (Vespucci)",
      catalogNumber: 43873,
      type: "Navegación / Posicionamiento",
      inclination: 55.0,
      periodMinutes: 718.0,
      altitudeKm: 20180.0,
      velocityKmh: 13900,
      launchYear: 2018,
      country: "US Space Force",
      purpose: "Posicionamiento Global de Alta Precisión",
      basePhase: 0.85,
    },
    {
      id: "LANDSAT9_49260",
      name: "Landsat-9 Observador Terrestre",
      catalogNumber: 49260,
      type: "Observación Terrestre",
      inclination: 98.2,
      periodMinutes: 98.8,
      altitudeKm: 705.0,
      velocityKmh: 26950,
      launchYear: 2021,
      country: "NASA / USGS",
      purpose: "Monitoreo Espectral de la Biosfera Terrestre",
      basePhase: 5.22,
    },
  ];

  res.json({
    timestamp: now,
    count: satellites.length,
    satellites,
  });
});

// JARVIS AI Chat Endpoint (Server-Side Gemini 3.7 Flash)
app.post("/api/jarvis/chat", async (req, res) => {
  try {
    const { prompt, memoryContext, systemTelemetry, securityLevel, conversationHistory, attachments } = req.body;

    if (!prompt && (!attachments || attachments.length === 0)) {
      res.status(400).json({ error: "Prompt or attachments are required" });
      return;
    }

    const ai = getGeminiClient();

    // Construct high-tactical JARVIS persona
    const systemInstruction = `Eres J.A.R.V.I.S. (Just A Rather Very Intelligent System), la inteligencia artificial táctica y asistente personal creada para operar en la interfaz holográfica Stark OS.

Personalidad y directrices de respuesta:
1. Tratas al usuario con cortesía británica, lealtad absoluta, agudeza intelectual y un toque sutil de ingenio educado (por ejemplo: "A su servicio, señor", "Sistemas en línea", "Iniciando análisis táctico", "Excelente decisión", "Conectando con sus comunicaciones", "Desplegando aplicación solicitada de inmediato").
2. Respondes con precisión, claridad técnica y elegancia en el idioma del usuario (predeterminadamente español, a menos que el usuario hable en otro idioma).
3. Si el usuario te pide abrir o lanzar cualquier aplicación (de Google o servicios externos como YouTube, Telegram, Netflix, ChatGPT, WhatsApp, Spotify, Discord, GitHub, Gmail, Maps, Drive, etc.), responde de manera EXTREMADAMENTE BREVE, DIRECTA y CONCISA diciendo únicamente:
   "Abriendo [Nombre], señor." (Por ejemplo: "Abriendo YouTube, señor.", "Abriendo Telegram, señor.", "Abriendo Netflix, señor.")
   NUNCA añadas frases largas, explicaciones de carga de vídeos ni descripciones redundantes como "desplegando YouTube en su estación de trabajo", "cargando vídeos y transmisiones en directo", "conectando con servidores", etc.
   E INCLUYE obligatoriamente la etiqueta de acción correspondiente:
   - [ACTION:OPEN_APP url="https://web.telegram.org" name="Telegram Web"]
   - [ACTION:OPEN_APP url="https://www.netflix.com" name="Netflix"]
   - [ACTION:OPEN_APP url="https://www.youtube.com" name="YouTube"]
   - [ACTION:OPEN_APP url="https://chatgpt.com" name="ChatGPT"]
   - [ACTION:OPEN_APP url="https://mail.google.com" name="Gmail"]
   - [ACTION:OPEN_APP url="https://drive.google.com" name="Google Drive"]
   - [ACTION:OPEN_APP url="https://calendar.google.com" name="Google Calendar"]
   - [ACTION:OPEN_APP url="https://maps.google.com" name="Google Maps"]
   - [ACTION:OPEN_APP url="https://meet.google.com" name="Google Meet"]
   - [ACTION:OPEN_APP url="https://docs.google.com" name="Google Docs"]
   - [ACTION:OPEN_APP url="https://sheets.google.com" name="Google Sheets"]
   - [ACTION:OPEN_APP url="https://slides.google.com" name="Google Slides"]
   - [ACTION:OPEN_APP url="https://photos.google.com" name="Google Fotos"]
   - [ACTION:OPEN_APP url="https://translate.google.com" name="Google Traductor"]
   - [ACTION:OPEN_APP url="https://keep.google.com" name="Google Keep"]
   - [ACTION:OPEN_APP url="https://gemini.google.com" name="Google Gemini"]
   - [ACTION:OPEN_APP url="https://web.whatsapp.com" name="WhatsApp Web"]
   - [ACTION:OPEN_APP url="https://open.spotify.com" name="Spotify"]
   - [ACTION:OPEN_APP url="https://discord.com/app" name="Discord"]
   - [ACTION:OPEN_APP url="https://github.com" name="GitHub"]
   - O cualquier otra URL solicitada: [ACTION:OPEN_APP url="https://..." name="..."]

4. Si el usuario te pide ejecutar una acción de la interfaz (como cambiar nivel de seguridad, escanear satélites, revisar el clima, memorizar información, reproducir música o cambiar el tema visual), añade al final de tu respuesta una o varias etiquetas de comando estructuradas entre corchetes para que el HUD las interprete:
   - [ACTION:SCAN_SATELLITE name="ISS"]
   - [ACTION:SET_SECURITY level="3"]
   - [ACTION:WEATHER_REFRESH city="Tokyo"]
   - [ACTION:STORE_MEMORY key="Directiva" value="Detalle"]
   - [ACTION:PLAY_ALERT type="success" | "warning" | "hologram"]
   - [ACTION:PLAY_IRON_MAN_SONG]
   - [ACTION:DIAGNOSTIC_RUN]
   - [ACTION:CHANGE_THEME theme="classic" | "modern" | "minimalist" | "emerald" | "vibranium"]
   - [ACTION:OPEN_THEME_CUSTOMIZER]
   - [ACTION:SWITCH_TAB tab="apps" | "workspace" | "voice" | "core" | "satellites" | "weather"]

5. Si el usuario menciona "oye jarvis", "olle jarvis", o pide la canción de Iron Man o música de combate, salúdalo con entusiasmo táctico, confirma la activación y añade la etiqueta [ACTION:PLAY_IRON_MAN_SONG].
6. Si el usuario pregunta por correos, su bandeja de Gmail o su calendario, oríentalo a la pestaña de "Mail & Calendario" ([ACTION:SWITCH_TAB tab="workspace"]) o abre Gmail/Calendar directamente según prefiera.
7. Si el usuario adjunta documentos, archivos o imágenes, analiza el contenido detallado provisto y responde con cálculos exactos y resúmenes tácticos.
8. Mantén un conocimiento activo de la memoria acumulada en el "Motor de Memoria v2" y de los datos del entorno (clima, satélites y telemetría del sistema) provistos en el contexto.

Contexto actual del sistema:
- Nivel de Seguridad actual: ${securityLevel || "Nivel 1 (Operador)"}
- Memoria activa del usuario: ${JSON.stringify(memoryContext || [])}
- Telemetría en tiempo real: ${JSON.stringify(systemTelemetry || {})}
`;

    // Build prompt parts including attachments
    const userParts: any[] = [];
    if (prompt && typeof prompt === "string" && prompt.trim()) {
      userParts.push({ text: prompt.trim() });
    }

    if (attachments && Array.isArray(attachments)) {
      attachments.forEach((att: any) => {
        if (att.textContent) {
          userParts.push({
            text: `\n[ARCHIVO ADJUNTO: "${att.name}" (${att.type})]:\n${att.textContent}\n--- FIN DE ARCHIVO ---`,
          });
        } else if (att.dataUrl && att.dataUrl.includes(";base64,")) {
          const match = att.dataUrl.match(/^data:([^;]+);base64,(.+)$/);
          if (match) {
            userParts.push({
              inlineData: {
                mimeType: match[1],
                data: match[2],
              },
            });
          }
        }
      });
    }

    if (userParts.length === 0) {
      userParts.push({ text: "JARVIS, informe de estado." });
    }

    // Robust conversation history builder:
    // Gemini rules:
    // 1. First turn must be 'user'
    // 2. Roles must strictly alternate: 'user' -> 'model' -> 'user' -> 'model' ...
    // 3. No empty parts
    const validHistory: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [];
    if (conversationHistory && Array.isArray(conversationHistory)) {
      for (const msg of conversationHistory.slice(-8)) {
        const textContent = (msg.text || "").trim();
        if (!textContent) continue;

        const role: "user" | "model" = msg.sender === "user" ? "user" : "model";

        // If history is empty, it MUST start with role: "user"
        if (validHistory.length === 0 && role === "model") {
          continue;
        }

        // If same role as previous turn, merge into previous turn
        if (validHistory.length > 0 && validHistory[validHistory.length - 1].role === role) {
          validHistory[validHistory.length - 1].parts[0].text += `\n${textContent}`;
        } else {
          validHistory.push({
            role,
            parts: [{ text: textContent }],
          });
        }
      }
    }

    // Construct final contents array for Gemini
    let contents: any;
    if (validHistory.length > 0) {
      if (validHistory[validHistory.length - 1].role === "user") {
        // Last was user, append current user parts to it
        validHistory[validHistory.length - 1].parts = userParts;
      } else {
        // Last was model, append new user turn
        validHistory.push({
          role: "user",
          parts: userParts,
        });
      }
      contents = validHistory;
    } else {
      contents = [{ role: "user", parts: userParts }];
    }

    if (ai) {
      const generatedReply = await callGeminiWithResilience(ai, contents, systemInstruction);
      if (generatedReply) {
        res.json({ text: generatedReply });
        return;
      }
    }

    // Seamless offline/local smart engine response
    const fallbackReply = getSmartFallbackResponse(
      prompt || "",
      attachments,
      memoryContext,
      systemTelemetry,
      securityLevel
    );
    res.json({ text: fallbackReply });
  } catch (error: any) {
    const safeFallback = getSmartFallbackResponse(req.body?.prompt || "");
    res.json({ text: safeFallback });
  }
});

// ----------------------------------------------------
// VITE MIDDLEWARE & STATIC SERVING
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`JARVIS Core Interface Server listening on port ${PORT}`);
  });
}

startServer();

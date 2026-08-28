import { AppLauncherItem } from "../types";

export const DEFAULT_APPLICATIONS: AppLauncherItem[] = [
  // ==========================================
  // GOOGLE SUITE APPLICATIONS
  // ==========================================
  {
    id: "google_search",
    name: "Google Buscador",
    category: "google",
    url: "https://www.google.com",
    description: "Búsqueda web global, información y tendencias en tiempo real.",
    iconName: "Search",
    color: "#4285F4",
    isPopular: true,
    voiceAliases: ["google", "buscador", "buscar en google", "google search", "chrome"],
  },
  {
    id: "youtube",
    name: "YouTube",
    category: "google",
    url: "https://www.youtube.com",
    description: "Plataforma global de vídeo, directos y música en streaming.",
    iconName: "Youtube",
    color: "#FF0000",
    isPopular: true,
    voiceAliases: ["youtube", "yutub", "videos", "ver videos", "musica en youtube"],
  },
  {
    id: "gmail",
    name: "Gmail",
    category: "google",
    url: "https://mail.google.com",
    description: "Bandeja de entrada y servicio de mensajería electrónica de Google.",
    iconName: "Mail",
    color: "#EA4335",
    isPopular: true,
    voiceAliases: ["gmail", "correo", "correos", "emails", "bandeja de entrada", "mensajes de gmail"],
  },
  {
    id: "google_drive",
    name: "Google Drive",
    category: "google",
    url: "https://drive.google.com",
    description: "Almacenamiento en la nube, copias de seguridad y documentos colaborativos.",
    iconName: "HardDrive",
    color: "#34A853",
    isPopular: true,
    voiceAliases: ["drive", "google drive", "disco", "nube de google", "archivos en la nube"],
  },
  {
    id: "google_calendar",
    name: "Google Calendar",
    category: "google",
    url: "https://calendar.google.com",
    description: "Agenda interactiva, planificación de eventos y citas de trabajo.",
    iconName: "Calendar",
    color: "#4285F4",
    isPopular: true,
    voiceAliases: ["calendario", "google calendar", "agenda", "mis citas", "eventos"],
  },
  {
    id: "google_maps",
    name: "Google Maps",
    category: "google",
    url: "https://maps.google.com",
    description: "Cartografía mundial, navegación GPS y vista satelital detallada.",
    iconName: "MapPin",
    color: "#34A853",
    isPopular: true,
    voiceAliases: ["maps", "google maps", "mapas", "navegacion", "ubicacion", "gps"],
  },
  {
    id: "google_meet",
    name: "Google Meet",
    category: "google",
    url: "https://meet.google.com",
    description: "Videollamadas seguras en alta definición y reuniones virtuales.",
    iconName: "Video",
    color: "#00897B",
    isPopular: false,
    voiceAliases: ["meet", "google meet", "videollamada", "reunion"],
  },
  {
    id: "google_docs",
    name: "Google Docs",
    category: "google",
    url: "https://docs.google.com",
    description: "Procesador de textos online y edición colaborativa en tiempo real.",
    iconName: "FileText",
    color: "#4285F4",
    isPopular: false,
    voiceAliases: ["docs", "google docs", "documentos", "procesador de texto"],
  },
  {
    id: "google_sheets",
    name: "Google Sheets",
    category: "google",
    url: "https://sheets.google.com",
    description: "Hojas de cálculo avanzadas, fórmulas y gráficos dinámicos.",
    iconName: "Table",
    color: "#0F9D58",
    isPopular: false,
    voiceAliases: ["sheets", "google sheets", "hojas de calculo", "excel de google"],
  },
  {
    id: "google_slides",
    name: "Google Slides",
    category: "google",
    url: "https://slides.google.com",
    description: "Presentaciones interactivas de diapositivas y proyectos visuales.",
    iconName: "Presentation",
    color: "#FBBC04",
    isPopular: false,
    voiceAliases: ["slides", "google slides", "presentaciones", "diapositivas"],
  },
  {
    id: "google_photos",
    name: "Google Fotos",
    category: "google",
    url: "https://photos.google.com",
    description: "Galería inteligente de fotos, recuerdos y álbumes en la nube.",
    iconName: "Image",
    color: "#EA4335",
    isPopular: false,
    voiceAliases: ["fotos", "google fotos", "galeria", "imagenes", "google photos"],
  },
  {
    id: "google_translate",
    name: "Google Traductor",
    category: "google",
    url: "https://translate.google.com",
    description: "Traducción multilingüe instantánea de texto, voz y sitios web.",
    iconName: "Languages",
    color: "#4285F4",
    isPopular: false,
    voiceAliases: ["traductor", "google traductor", "translate", "traducir"],
  },
  {
    id: "google_keep",
    name: "Google Keep",
    category: "google",
    url: "https://keep.google.com",
    description: "Notas rápidas, listas de tareas y recordatorios sincronizados.",
    iconName: "CheckSquare",
    color: "#F4B400",
    isPopular: false,
    voiceAliases: ["keep", "google keep", "mis notas", "notas de google", "recordatorios"],
  },
  {
    id: "google_gemini",
    name: "Google Gemini",
    category: "ai",
    url: "https://gemini.google.com",
    description: "Modelo de inteligencia artificial multimodal conversacional de Google.",
    iconName: "Sparkles",
    color: "#8E75FF",
    isPopular: true,
    voiceAliases: ["gemini", "google gemini", "bard"],
  },
  {
    id: "google_earth",
    name: "Google Earth",
    category: "google",
    url: "https://earth.google.com",
    description: "Exploración tridimensional del globo terráqueo y terreno satelital.",
    iconName: "Globe",
    color: "#2BAAF8",
    isPopular: false,
    voiceAliases: ["earth", "google earth", "globo terraqueo", "tierra en 3d"],
  },
  {
    id: "google_news",
    name: "Google Noticias",
    category: "google",
    url: "https://news.google.com",
    description: "Titulares, noticias internacionales y actualidad informativa.",
    iconName: "Newspaper",
    color: "#4285F4",
    isPopular: false,
    voiceAliases: ["noticias", "google news", "noticias de google", "titulares"],
  },
  {
    id: "google_cloud",
    name: "Google Cloud Platform",
    category: "dev",
    url: "https://console.cloud.google.com",
    description: "Consola de computación en la nube, servidores y APIs de Google Cloud.",
    iconName: "Cloud",
    color: "#4285F4",
    isPopular: false,
    voiceAliases: ["google cloud", "cloud console", "gcp"],
  },

  // ==========================================
  // SECONDARY APPS (USER HIGHLIGHTS)
  // ==========================================
  {
    id: "telegram",
    name: "Telegram Web",
    category: "messaging",
    url: "https://web.telegram.org",
    description: "Mensajería instantánea segura basada en la nube y canales de difusión.",
    iconName: "Send",
    color: "#229ED9",
    isPopular: true,
    voiceAliases: ["telegram", "telegram web", "mensajes de telegram", "abrir telegram"],
  },
  {
    id: "netflix",
    name: "Netflix",
    category: "streaming",
    url: "https://www.netflix.com",
    description: "Plataforma de streaming con películas, series y documentales.",
    iconName: "Film",
    color: "#E50914",
    isPopular: true,
    voiceAliases: ["netflix", "netflis", "ver peliculas", "ver series", "abrir netflix"],
  },
  {
    id: "chatgpt",
    name: "ChatGPT",
    category: "ai",
    url: "https://chatgpt.com",
    description: "Asistente de inteligencia artificial y modelo de lenguaje de OpenAI.",
    iconName: "Bot",
    color: "#10A37F",
    isPopular: true,
    voiceAliases: ["chatgpt", "chat gpt", "openai", "abrir chatgpt"],
  },
  {
    id: "whatsapp",
    name: "WhatsApp Web",
    category: "messaging",
    url: "https://web.whatsapp.com",
    description: "Servicio de mensajería y llamadas cifradas de extremo a extremo.",
    iconName: "MessageCircle",
    color: "#25D366",
    isPopular: true,
    voiceAliases: ["whatsapp", "wasap", "guasap", "whatsapp web", "mensajes de whatsapp"],
  },
  {
    id: "spotify",
    name: "Spotify Web",
    category: "streaming",
    url: "https://open.spotify.com",
    description: "Reproductor web de música digital, podcasts y listas de reproducción.",
    iconName: "Music",
    color: "#1DB954",
    isPopular: true,
    voiceAliases: ["spotify", "musica", "reproducir musica", "abrir spotify"],
  },
  {
    id: "discord",
    name: "Discord Web",
    category: "messaging",
    url: "https://discord.com/app",
    description: "Comunidades de voz, vídeo y salas de chat temáticas.",
    iconName: "Headphones",
    color: "#5865F2",
    isPopular: true,
    voiceAliases: ["discord", "abrir discord", "canal de discord"],
  },
  {
    id: "github",
    name: "GitHub",
    category: "dev",
    url: "https://github.com",
    description: "Alojamiento de repositorios Git, colaboración de software y CI/CD.",
    iconName: "Code",
    color: "#F0F6FC",
    isPopular: true,
    voiceAliases: ["github", "repositorios", "codigo", "git hub"],
  },
  {
    id: "twitter_x",
    name: "X (Twitter)",
    category: "secondary",
    url: "https://x.com",
    description: "Red social global de microblogging y noticias de última hora.",
    iconName: "Twitter",
    color: "#1DA1F2",
    isPopular: false,
    voiceAliases: ["twitter", "tuiter", "x", "red social x"],
  },
  {
    id: "reddit",
    name: "Reddit",
    category: "secondary",
    url: "https://www.reddit.com",
    description: "La portada de internet con comunidades, debates y contenido variado.",
    iconName: "Share2",
    color: "#FF4500",
    isPopular: false,
    voiceAliases: ["reddit", "foros de reddit"],
  },
  {
    id: "twitch",
    name: "Twitch",
    category: "streaming",
    url: "https://www.twitch.tv",
    description: "Plataforma de streaming en directo de videojuegos, música y entretenimiento.",
    iconName: "Tv",
    color: "#9146FF",
    isPopular: false,
    voiceAliases: ["twitch", "tuich", "directos de twitch"],
  },
  {
    id: "claude_ai",
    name: "Claude AI",
    category: "ai",
    url: "https://claude.ai",
    description: "Asistente inteligente de Anthropic para razonamiento y redacción.",
    iconName: "Sparkles",
    color: "#D97706",
    isPopular: false,
    voiceAliases: ["claude", "claude ai", "anthropic"],
  },
  {
    id: "notion",
    name: "Notion",
    category: "secondary",
    url: "https://www.notion.so",
    description: "Espacio de trabajo todo en uno para notas, bases de datos y proyectos.",
    iconName: "BookOpen",
    color: "#FFFFFF",
    isPopular: false,
    voiceAliases: ["notion", "apuntes notion", "tableros notion"],
  },
  {
    id: "figma",
    name: "Figma Web",
    category: "dev",
    url: "https://www.figma.com",
    description: "Herramienta de diseño de interfaces, prototipado y trabajo en equipo.",
    iconName: "Layers",
    color: "#F24E1E",
    isPopular: false,
    voiceAliases: ["figma", "diseno", "prototipos figma"],
  },
  {
    id: "wikipedia",
    name: "Wikipedia",
    category: "secondary",
    url: "https://es.wikipedia.org",
    description: "Enciclopedia libre universal editada colaborativamente.",
    iconName: "BookOpen",
    color: "#E2E8F0",
    isPopular: false,
    voiceAliases: ["wikipedia", "enciclopedia", "buscar en wikipedia"],
  },
  {
    id: "amazon",
    name: "Amazon",
    category: "secondary",
    url: "https://www.amazon.com",
    description: "Comercio electrónico global, compras y servicios digitales.",
    iconName: "ShoppingBag",
    color: "#FF9900",
    isPopular: false,
    voiceAliases: ["amazon", "tienda amazon", "compras"],
  },
  {
    id: "disney_plus",
    name: "Disney+",
    category: "streaming",
    url: "https://www.disneyplus.com",
    description: "Streaming de Disney, Marvel, Star Wars, Pixar y National Geographic.",
    iconName: "Film",
    color: "#113CCF",
    isPopular: false,
    voiceAliases: ["disney", "disney plus", "disney+"],
  },
];

/**
 * Searches and finds an app by matching text with name or voice aliases
 */
export function findAppByVoiceOrText(input: string, customApps: AppLauncherItem[] = []): AppLauncherItem | null {
  const clean = input.toLowerCase().trim();
  const allApps = [...DEFAULT_APPLICATIONS, ...customApps];

  // 1. Direct alias match
  for (const app of allApps) {
    if (app.name.toLowerCase() === clean) return app;
    for (const alias of app.voiceAliases) {
      if (clean.includes(alias.toLowerCase())) {
        return app;
      }
    }
  }

  // 2. Substring match on name
  for (const app of allApps) {
    if (clean.includes(app.name.toLowerCase()) || app.name.toLowerCase().includes(clean)) {
      return app;
    }
  }

  return null;
}

/**
 * Detects if the user prompt is an explicit instruction to open or launch an app
 * (e.g. "abre youtube", "abrir telegram", "pon netflix", "inicia chatgpt", or just "youtube")
 */
export function detectAppOpenIntent(
  input: string,
  customApps: AppLauncherItem[] = []
): { appName: string; url: string } | null {
  const text = (input || "").trim();
  if (!text) return null;
  const lower = text.toLowerCase();

  // 1. Check for direct URL in text
  const urlMatch = text.match(/(https?:\/\/[^\s]+)/i);
  if (urlMatch) {
    return { appName: "Enlace Web", url: urlMatch[1] };
  }

  // 2. Action verbs indicating app opening
  const hasOpenAction = /(?:abre|abrir|abreme|ábreme|lanza|lanzar|despliega|desplegar|pon|ponme|entra\s*a|entrar\s*a|inicia|iniciar|ve\s*a|ir\s*a|cargar|carga|open|launch)\b/i.test(lower);

  const matchedApp = findAppByVoiceOrText(text, customApps);
  if (matchedApp) {
    // If it has an action keyword OR the whole query is short (e.g. user just said "youtube", "netflix", "telegram", "whatsapp")
    if (hasOpenAction || lower.length <= 25) {
      return { appName: matchedApp.name, url: matchedApp.url };
    }
  }

  return null;
}

// Track recently opened URLs to avoid opening duplicate tabs in quick succession
let lastOpenedUrl = "";
let lastOpenedTimestamp = 0;

/**
 * Directly opens a URL in a new tab immediately, using multiple fallback techniques
 * to bypass browser popup blockers without requiring any user click.
 */
export function openAppUrlImmediately(url: string): boolean {
  if (!url) return false;

  const now = Date.now();
  if (lastOpenedUrl === url && now - lastOpenedTimestamp < 4000) {
    // Already opened this exact URL within the last 4 seconds
    return true;
  }
  lastOpenedUrl = url;
  lastOpenedTimestamp = now;

  let opened = false;

  // Method 1: Direct window.open with security flags
  try {
    const win = window.open(url, "_blank", "noopener,noreferrer");
    if (win) {
      win.focus?.();
      opened = true;
    }
  } catch (err) {
    console.warn("window.open call failed:", err);
  }

  // Method 2: Synthetic anchor click (works in iframes and many sandbox environments)
  try {
    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      try {
        if (a.parentNode) document.body.removeChild(a);
      } catch {}
    }, 150);
    opened = true;
  } catch (err) {
    console.warn("Anchor dispatch failed:", err);
  }

  return opened;
}


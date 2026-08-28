// Google Workspace Client Integration for JARVIS HUD (Gmail & Calendar)

declare global {
  interface Window {
    google?: any;
    gapi?: any;
  }
}

const SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/calendar.events",
].join(" ");

let tokenClient: any = null;
let currentAccessToken: string | null = null;

// Load Google Identity Services script if not present
export function loadGsiScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) {
      resolve();
      return;
    }
    const existing = document.getElementById("gsi-client-script");
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", (e) => reject(e));
      return;
    }
    const script = document.createElement("script");
    script.id = "gsi-client-script";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = (e) => reject(e);
    document.head.appendChild(script);
  });
}

// Request Access Token using popup/redirect via GIS
export async function requestGoogleAccessToken(clientId?: string): Promise<string> {
  await loadGsiScript();

  return new Promise((resolve, reject) => {
    try {
      if (!window.google?.accounts?.oauth2) {
        throw new Error("Google Identity Services no está disponible en este entorno");
      }

      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId || "633950930486-oauth.apps.googleusercontent.com",
        scope: SCOPES,
        callback: (tokenResponse: any) => {
          if (tokenResponse.error) {
            console.error("OAuth token error:", tokenResponse);
            if (tokenResponse.error === "invalid_client" || tokenResponse.error === "unauthorized_client") {
              reject(new Error("Error de autorización (401): El identificador de cliente Google OAuth no es válido para este dominio."));
              return;
            }
            reject(new Error(tokenResponse.error_description || tokenResponse.error));
            return;
          }
          currentAccessToken = tokenResponse.access_token;
          if (typeof window !== "undefined") {
            try {
              sessionStorage.setItem("jarvis_g_access_token", tokenResponse.access_token);
            } catch {}
          }
          resolve(tokenResponse.access_token);
        },
      });

      tokenClient = client;
      client.requestAccessToken({ prompt: "consent" });
    } catch (err) {
      reject(err);
    }
  });
}

export function getStoredAccessToken(): string | null {
  if (currentAccessToken && currentAccessToken.trim().length > 15) return currentAccessToken;
  if (typeof window !== "undefined") {
    try {
      const stored = sessionStorage.getItem("jarvis_g_access_token");
      if (stored && stored.trim().length > 15) {
        currentAccessToken = stored;
        return stored;
      }
    } catch {}
  }
  return null;
}

export function clearStoredAccessToken(): void {
  currentAccessToken = null;
  if (typeof window !== "undefined") {
    try {
      sessionStorage.removeItem("jarvis_g_access_token");
    } catch {}
    // Notify application listeners
    window.dispatchEvent(new CustomEvent("jarvis_auth_expired", { detail: { code: 401 } }));
  }
}

// ----------------------------------------------------------------------
// Gmail API Calls
// ----------------------------------------------------------------------

export async function fetchRecentEmails(token: string, maxResults = 8): Promise<any[]> {
  if (!token || typeof token !== "string" || token.trim().length < 15) {
    clearStoredAccessToken();
    return [];
  }

  const listUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}&q=in:inbox`;
  const listRes = await fetch(listUrl, {
    headers: { Authorization: `Bearer ${token.trim()}` },
  });

  if (!listRes.ok) {
    if (listRes.status === 401) {
      clearStoredAccessToken();
      const err = new Error("Sesión no autorizada o expirada (Error 401). Las credenciales de Google Workspace han caducado.");
      (err as any).status = 401;
      throw err;
    }
    throw new Error(`Error al sincronizar Gmail (${listRes.status}): ${listRes.statusText}`);
  }

  const listData = await listRes.json();
  if (!listData.messages || listData.messages.length === 0) {
    return [];
  }

  const detailedEmails = await Promise.all(
    listData.messages.map(async (msgItem: { id: string; threadId: string }) => {
      try {
        const detailUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msgItem.id}?format=full`;
        const res = await fetch(detailUrl, {
          headers: { Authorization: `Bearer ${token.trim()}` },
        });
        if (!res.ok) {
          if (res.status === 401) {
            clearStoredAccessToken();
          }
          return null;
        }
        const data = await res.json();

        const headers = data.payload?.headers || [];
        const getHeader = (name: string) => headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || "";

        return {
          id: data.id,
          threadId: data.threadId,
          snippet: data.snippet || "",
          subject: getHeader("Subject") || "(Sin Asunto)",
          from: getHeader("From") || "Desconocido",
          date: getHeader("Date") || new Date(parseInt(data.internalDate)).toLocaleString(),
          unread: (data.labelIds || []).includes("UNREAD"),
        };
      } catch {
        return null;
      }
    })
  );

  return detailedEmails.filter(Boolean);
}

export async function sendEmailMessage(token: string, to: string, subject: string, bodyText: string): Promise<any> {
  if (!token || typeof token !== "string" || token.trim().length < 15) {
    clearStoredAccessToken();
    const err = new Error("No hay una sesión activa de Google. Por favor, conecte su cuenta.");
    (err as any).status = 401;
    throw err;
  }

  const utf8Subject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`;
  const messageParts = [
    `To: ${to}`,
    `Subject: ${utf8Subject}`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=utf-8",
    "Content-Transfer-Encoding: 7bit",
    "",
    bodyText,
  ];
  const rawMessage = messageParts.join("\r\n");
  const encodedMessage = btoa(unescape(encodeURIComponent(rawMessage)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const response = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token.trim()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ raw: encodedMessage }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      clearStoredAccessToken();
      const err = new Error("Sesión no autorizada o expirada (Error 401). Por favor, reconecte su cuenta Google.");
      (err as any).status = 401;
      throw err;
    }
    throw new Error(`Error enviando correo (${response.status}): ${response.statusText}`);
  }
  return response.json();
}

// ----------------------------------------------------------------------
// Google Calendar API Calls
// ----------------------------------------------------------------------

export async function fetchCalendarEvents(token: string, maxResults = 10): Promise<any[]> {
  if (!token || typeof token !== "string" || token.trim().length < 15) {
    clearStoredAccessToken();
    return [];
  }

  const now = new Date().toISOString();
  const calUrl = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(
    now
  )}&maxResults=${maxResults}&singleEvents=true&orderBy=startTime`;

  const res = await fetch(calUrl, {
    headers: { Authorization: `Bearer ${token.trim()}` },
  });

  if (!res.ok) {
    if (res.status === 401) {
      clearStoredAccessToken();
      const err = new Error("Sesión no autorizada o expirada (Error 401). Las credenciales de Google Workspace han caducado.");
      (err as any).status = 401;
      throw err;
    }
    throw new Error(`Error al sincronizar Google Calendar (${res.status}): ${res.statusText}`);
  }

  const data = await res.json();
  return (data.items || []).map((item: any) => ({
    id: item.id,
    summary: item.summary || "(Sin Título)",
    description: item.description || "",
    location: item.location || "",
    start: item.start?.dateTime || item.start?.date || "",
    end: item.end?.dateTime || item.end?.date || "",
    htmlLink: item.htmlLink || "",
  }));
}

export async function createCalendarEvent(
  token: string,
  event: { summary: string; description?: string; location?: string; startIso: string; endIso: string }
): Promise<any> {
  if (!token || typeof token !== "string" || token.trim().length < 15) {
    clearStoredAccessToken();
    const err = new Error("No hay una sesión activa de Google. Por favor, conecte su cuenta.");
    (err as any).status = 401;
    throw err;
  }

  const url = "https://www.googleapis.com/calendar/v3/calendars/primary/events";
  const body = {
    summary: event.summary,
    description: event.description,
    location: event.location,
    start: { dateTime: event.startIso },
    end: { dateTime: event.endIso },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token.trim()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    if (res.status === 401) {
      clearStoredAccessToken();
      const err = new Error("Sesión no autorizada o expirada (Error 401). Por favor, reconecte su cuenta Google.");
      (err as any).status = 401;
      throw err;
    }
    throw new Error(`Error al crear evento de calendario (${res.status}): ${res.statusText}`);
  }

  return res.json();
}

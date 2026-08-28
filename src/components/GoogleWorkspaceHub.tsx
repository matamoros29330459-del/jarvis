import React, { useState, useEffect } from "react";
import { Mail, Calendar, RefreshCw, Send, Plus, Lock, CheckCircle2, AlertTriangle, ExternalLink, Sparkles, User, Clock, MapPin, FileText } from "lucide-react";
import { GmailMessageSummary, CalendarEventSummary } from "../types";
import { soundFX } from "../utils/audioSynthesizer";
import {
  requestGoogleAccessToken,
  getStoredAccessToken,
  clearStoredAccessToken,
  fetchRecentEmails,
  fetchCalendarEvents,
  sendEmailMessage,
  createCalendarEvent,
} from "../utils/googleWorkspace";

interface GoogleWorkspaceHubProps {
  onAddTacticalLog: (log: string) => void;
  onAskJarvis: (prompt: string) => void;
}

export const GoogleWorkspaceHub: React.FC<GoogleWorkspaceHubProps> = ({
  onAddTacticalLog,
  onAskJarvis,
}) => {
  const [token, setToken] = useState<string | null>(() => getStoredAccessToken());
  const [activeSubTab, setActiveSubTab] = useState<"mail" | "calendar">("mail");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mail State
  const [emails, setEmails] = useState<GmailMessageSummary[]>([]);
  const [showComposeMail, setShowComposeMail] = useState(false);
  const [toEmail, setToEmail] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [isSendingMail, setIsSendingMail] = useState(false);

  // Calendar State
  const [events, setEvents] = useState<CalendarEventSummary[]>([]);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [eventStartTime, setEventStartTime] = useState("10:00");
  const [eventEndTime, setEventEndTime] = useState("11:00");
  const [eventLocation, setEventLocation] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);

  const handleConnectGoogle = async () => {
    try {
      setIsLoading(true);
      setError(null);
      soundFX.playClick(1200);
      const accessToken = await requestGoogleAccessToken();
      setToken(accessToken);
      soundFX.playSuccess();
      onAddTacticalLog("[PROTOCOLO WORKSPACE] Autenticación Google OAuth autorizada con éxito.");
      syncAllData(accessToken);
    } catch (err: any) {
      console.error("Auth error:", err);
      setError(err?.message || "No se pudo completar la autenticación con Google");
      soundFX.playAlert();
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    clearStoredAccessToken();
    setToken(null);
    setEmails([]);
    setEvents([]);
    soundFX.playClick(800);
    onAddTacticalLog("[PROTOCOLO WORKSPACE] Sesión de Google desconectada de JARVIS.");
  };

  const syncAllData = async (currentToken: string) => {
    if (!currentToken || currentToken.length < 15) {
      clearStoredAccessToken();
      setToken(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      let is401Error = false;
      const [fetchedEmails, fetchedEvents] = await Promise.all([
        fetchRecentEmails(currentToken).catch((e: any) => {
          if (e?.status === 401 || String(e?.message).includes("401") || String(e?.message).includes("Unauthorized")) {
            is401Error = true;
          }
          console.warn("Gmail sync warning:", e);
          return [];
        }),
        fetchCalendarEvents(currentToken).catch((e: any) => {
          if (e?.status === 401 || String(e?.message).includes("401") || String(e?.message).includes("Unauthorized")) {
            is401Error = true;
          }
          console.warn("Calendar sync warning:", e);
          return [];
        }),
      ]);

      if (is401Error) {
        clearStoredAccessToken();
        setToken(null);
        setEmails([]);
        setEvents([]);
        setError("Sesión de Google no autorizada o expirada (Error 401). Las credenciales se han restablecido de forma segura; pulse 'Conectar mi Cuenta Google' para renovar el acceso.");
        onAddTacticalLog("[SEGURIDAD OAUTH] Sesión expirada (Error 401). Credenciales reseteadas de forma segura.");
        soundFX.playAlert();
        return;
      }

      setEmails(fetchedEmails);
      setEvents(fetchedEvents);
      soundFX.playHologramOpen();
      onAddTacticalLog(`[WORKSPACE SYNC] ${fetchedEmails.length} correos y ${fetchedEvents.length} eventos sincronizados.`);
    } catch (err: any) {
      if (err?.status === 401 || String(err?.message).includes("401") || String(err?.message).includes("Unauthorized")) {
        clearStoredAccessToken();
        setToken(null);
        setEmails([]);
        setEvents([]);
        setError("Sesión no autorizada o expirada (Error 401). Las credenciales se han restablecido de forma segura; por favor vuelva a iniciar sesión.");
      } else {
        setError(err?.message || "Error al sincronizar datos de Google");
      }
      soundFX.playAlert();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleAuthExpired = () => {
      setToken(null);
      setEmails([]);
      setEvents([]);
      setError("Sesión de Google no autorizada o expirada (Error 401). Credenciales reseteadas de forma segura.");
    };

    window.addEventListener("jarvis_auth_expired", handleAuthExpired);
    return () => {
      window.removeEventListener("jarvis_auth_expired", handleAuthExpired);
    };
  }, []);

  useEffect(() => {
    if (token) {
      syncAllData(token);
    }
  }, [token]);

  const handleSendMail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !toEmail.trim() || !emailSubject.trim()) return;
    try {
      setIsSendingMail(true);
      await sendEmailMessage(token, toEmail.trim(), emailSubject.trim(), emailBody.trim());
      soundFX.playSuccess();
      onAddTacticalLog(`[GMAIL ENVIADO] Mensaje transmitido a ${toEmail}.`);
      setToEmail("");
      setEmailSubject("");
      setEmailBody("");
      setShowComposeMail(false);
      // Refresh
      syncAllData(token);
    } catch (err: any) {
      if (err?.status === 401 || String(err?.message).includes("401")) {
        clearStoredAccessToken();
        setToken(null);
        setError("Sesión no autorizada o expirada (Error 401). Por favor reconecte su cuenta Google.");
      } else {
        setError(err?.message || "Error enviando correo");
      }
      soundFX.playAlert();
    } finally {
      setIsSendingMail(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !eventTitle.trim()) return;
    try {
      setIsCreatingEvent(true);
      const startIso = new Date(`${eventDate}T${eventStartTime}:00`).toISOString();
      const endIso = new Date(`${eventDate}T${eventEndTime}:00`).toISOString();

      await createCalendarEvent(token, {
        summary: eventTitle.trim(),
        description: eventDescription.trim(),
        location: eventLocation.trim(),
        startIso,
        endIso,
      });

      soundFX.playSuccess();
      onAddTacticalLog(`[CALENDARIO CREADO] Evento "${eventTitle}" agendado.`);
      setEventTitle("");
      setEventLocation("");
      setEventDescription("");
      setShowCreateEvent(false);
      // Refresh
      syncAllData(token);
    } catch (err: any) {
      if (err?.status === 401 || String(err?.message).includes("401")) {
        clearStoredAccessToken();
        setToken(null);
        setError("Sesión no autorizada o expirada (Error 401). Por favor reconecte su cuenta Google.");
      } else {
        setError(err?.message || "Error creando evento");
      }
      soundFX.playAlert();
    } finally {
      setIsCreatingEvent(false);
    }
  };

  return (
    <div id="google-workspace-module" className="flex flex-col h-full bg-cyan-950/20 backdrop-blur-lg border border-cyan-500/25 rounded-xl overflow-hidden shadow-[0_0_25px_rgba(34,211,238,0.1)]">
      {/* Module Header */}
      <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-cyan-950/40 backdrop-blur-md border-b border-cyan-500/20 gap-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-900/40 border border-cyan-400/50 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.25)]">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-mono font-bold text-white tracking-wider flex items-center gap-2">
              GOOGLE WORKSPACE · GMAIL & CALENDAR
              {token && <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-[9px]">EN LÍNEA</span>}
            </h2>
            <p className="text-[10px] font-mono text-cyan-400/70">
              Integración nativa con su cuenta personal de correo y agenda ejecutiva
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {token ? (
            <>
              <button
                onClick={() => syncAllData(token)}
                disabled={isLoading}
                className="p-2 rounded-lg border border-cyan-500/30 bg-cyan-950/50 text-cyan-300 hover:text-white hover:border-cyan-400 transition-all text-xs font-mono flex items-center gap-1.5 backdrop-blur-md disabled:opacity-50"
                title="Sincronizar Bandeja & Calendario"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-cyan-400" : ""}`} />
                <span className="hidden sm:inline text-[11px]">Sincronizar</span>
              </button>
              <button
                onClick={handleDisconnect}
                className="px-2.5 py-1.5 rounded-lg border border-red-500/30 bg-red-950/30 text-red-300 hover:bg-red-900/40 text-[11px] font-mono transition-all backdrop-blur-md"
              >
                Desconectar
              </button>
            </>
          ) : (
            <button
              onClick={handleConnectGoogle}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl bg-cyan-500/25 hover:bg-cyan-400/35 border border-cyan-400/70 text-white font-mono text-xs font-bold transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)] backdrop-blur-md flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-cyan-300 animate-pulse" />
              <span>Conectar mi Cuenta Google</span>
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mx-4 mt-3 p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs font-mono flex items-center justify-between backdrop-blur-md">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-white ml-2">×</button>
        </div>
      )}

      {/* Main Workspace Body */}
      {!token ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-cyan-950/60 border border-cyan-400/40 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(34,211,238,0.2)]">
            <Lock className="w-8 h-8 text-cyan-300" />
          </div>
          <h3 className="text-base font-mono font-bold text-white mb-2 tracking-wide">
            ACCESO SEGURO A GMAIL Y CALENDARIO
          </h3>
          <p className="text-xs font-mono text-cyan-300/70 max-w-md mb-6 leading-relaxed">
            Conecte su cuenta Google para que JARVIS pueda leer su bandeja de entrada, redactar correos, consultar reuniones programadas y agendar nuevos eventos mediante voz o texto.
          </p>
          <button
            onClick={handleConnectGoogle}
            disabled={isLoading}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500/30 to-blue-500/30 hover:from-cyan-400/40 hover:to-blue-400/40 border border-cyan-400/80 text-white font-mono text-xs font-bold transition-all shadow-[0_0_30px_rgba(34,211,238,0.4)] backdrop-blur-lg flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-cyan-300" />
            <span>{isLoading ? "Iniciando Protocolo OAuth..." : "Vincular Gmail & Google Calendar"}</span>
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Sub Navigation Bar */}
          <div className="flex items-center justify-between px-4 py-2 bg-cyan-950/30 border-b border-cyan-500/20 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  soundFX.playClick(1000);
                  setActiveSubTab("mail");
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  activeSubTab === "mail"
                    ? "bg-cyan-500/25 border border-cyan-400 text-white font-bold shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                    : "text-cyan-400/70 hover:text-white"
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Bandeja Gmail ({emails.length})</span>
              </button>

              <button
                onClick={() => {
                  soundFX.playClick(1000);
                  setActiveSubTab("calendar");
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  activeSubTab === "calendar"
                    ? "bg-cyan-500/25 border border-cyan-400 text-white font-bold shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                    : "text-cyan-400/70 hover:text-white"
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Google Calendar ({events.length})</span>
              </button>
            </div>

            <div>
              {activeSubTab === "mail" ? (
                <button
                  onClick={() => setShowComposeMail(!showComposeMail)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-900/40 hover:bg-cyan-800/50 border border-cyan-400/50 text-xs font-mono text-cyan-200 transition-all"
                >
                  <Plus className="w-3.5 h-3.5 text-cyan-300" />
                  <span>Redactar Correo</span>
                </button>
              ) : (
                <button
                  onClick={() => setShowCreateEvent(!showCreateEvent)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-900/40 hover:bg-cyan-800/50 border border-cyan-400/50 text-xs font-mono text-cyan-200 transition-all"
                >
                  <Plus className="w-3.5 h-3.5 text-cyan-300" />
                  <span>Nuevo Evento</span>
                </button>
              )}
            </div>
          </div>

          {/* Subtab Content Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono scrollbar-thin scrollbar-thumb-cyan-900">
            {/* GMAIL TAB */}
            {activeSubTab === "mail" && (
              <>
                {showComposeMail && (
                  <form onSubmit={handleSendMail} className="p-4 rounded-xl bg-cyan-950/60 border border-cyan-400/60 shadow-[0_0_20px_rgba(34,211,238,0.15)] space-y-3 backdrop-blur-md animate-fadeIn">
                    <div className="flex items-center justify-between text-xs font-bold text-white border-b border-cyan-500/20 pb-2">
                      <span className="flex items-center gap-1.5"><Send className="w-4 h-4 text-cyan-300" /> REDACTAR MENSAJE GMAIL</span>
                      <button type="button" onClick={() => setShowComposeMail(false)} className="text-cyan-400 hover:text-white">✕</button>
                    </div>

                    <div>
                      <label className="text-[10px] text-cyan-400/80 uppercase block mb-1">Para (Destinatario):</label>
                      <input
                        type="email"
                        required
                        value={toEmail}
                        onChange={(e) => setToEmail(e.target.value)}
                        placeholder="ejemplo@correo.com"
                        className="w-full bg-cyan-950/40 border border-cyan-500/30 rounded-lg px-3 py-1.5 text-xs text-white placeholder-cyan-500/40 focus:border-cyan-400 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-cyan-400/80 uppercase block mb-1">Asunto:</label>
                      <input
                        type="text"
                        required
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                        placeholder="Asunto del mensaje..."
                        className="w-full bg-cyan-950/40 border border-cyan-500/30 rounded-lg px-3 py-1.5 text-xs text-white placeholder-cyan-500/40 focus:border-cyan-400 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-cyan-400/80 uppercase block mb-1">Cuerpo del Mensaje:</label>
                      <textarea
                        rows={3}
                        value={emailBody}
                        onChange={(e) => setEmailBody(e.target.value)}
                        placeholder="Escriba su mensaje aquí..."
                        className="w-full bg-cyan-950/40 border border-cyan-500/30 rounded-lg px-3 py-1.5 text-xs text-white placeholder-cyan-500/40 focus:border-cyan-400 outline-none resize-none"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowComposeMail(false)}
                        className="px-3 py-1.5 rounded-lg border border-cyan-500/30 text-xs text-cyan-400 hover:text-white"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={isSendingMail}
                        className="px-4 py-1.5 rounded-lg bg-cyan-500/30 hover:bg-cyan-400/40 border border-cyan-400 text-xs text-white font-bold flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{isSendingMail ? "Transmitiendo..." : "Enviar Correo"}</span>
                      </button>
                    </div>
                  </form>
                )}

                {emails.length === 0 ? (
                  <div className="text-center py-12 text-cyan-500/50">
                    <Mail className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p className="text-xs">No se encontraron correos recientes en la bandeja de entrada.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2.5">
                    {emails.map((m) => (
                      <div
                        key={m.id}
                        className="p-3.5 rounded-xl bg-cyan-950/30 hover:bg-cyan-900/30 border border-cyan-500/25 hover:border-cyan-400/50 transition-all backdrop-blur-md group flex flex-col gap-1.5"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-white flex items-center gap-1.5 truncate max-w-[70%]">
                            {m.unread && <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping flex-shrink-0" />}
                            {m.from}
                          </span>
                          <span className="text-[10px] text-cyan-400/60">{m.date}</span>
                        </div>
                        <div className="text-xs font-bold text-cyan-200 truncate">{m.subject}</div>
                        <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">{m.snippet}</p>

                        <div className="flex items-center justify-between pt-1 text-[10px] text-cyan-400/60 border-t border-cyan-500/10 mt-1">
                          <span>ID: {m.id.substring(0, 10)}...</span>
                          <button
                            onClick={() => onAskJarvis(`Resume este correo de ${m.from} con asunto "${m.subject}": ${m.snippet}`)}
                            className="text-cyan-300 hover:text-white flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Sparkles className="w-3 h-3 text-cyan-400" />
                            <span>Pedir a JARVIS que analice este correo</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* CALENDAR TAB */}
            {activeSubTab === "calendar" && (
              <>
                {showCreateEvent && (
                  <form onSubmit={handleCreateEvent} className="p-4 rounded-xl bg-cyan-950/60 border border-cyan-400/60 shadow-[0_0_20px_rgba(34,211,238,0.15)] space-y-3 backdrop-blur-md animate-fadeIn">
                    <div className="flex items-center justify-between text-xs font-bold text-white border-b border-cyan-500/20 pb-2">
                      <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-cyan-300" /> AGENDAR EVENTO EN GOOGLE CALENDAR</span>
                      <button type="button" onClick={() => setShowCreateEvent(false)} className="text-cyan-400 hover:text-white">✕</button>
                    </div>

                    <div>
                      <label className="text-[10px] text-cyan-400/80 uppercase block mb-1">Título del Evento:</label>
                      <input
                        type="text"
                        required
                        value={eventTitle}
                        onChange={(e) => setEventTitle(e.target.value)}
                        placeholder="Reunión de Análisis Táctico..."
                        className="w-full bg-cyan-950/40 border border-cyan-500/30 rounded-lg px-3 py-1.5 text-xs text-white placeholder-cyan-500/40 focus:border-cyan-400 outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <label className="text-[10px] text-cyan-400/80 uppercase block mb-1">Fecha:</label>
                        <input
                          type="date"
                          required
                          value={eventDate}
                          onChange={(e) => setEventDate(e.target.value)}
                          className="w-full bg-cyan-950/40 border border-cyan-500/30 rounded-lg px-3 py-1.5 text-xs text-white focus:border-cyan-400 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-cyan-400/80 uppercase block mb-1">Hora Inicio:</label>
                        <input
                          type="time"
                          required
                          value={eventStartTime}
                          onChange={(e) => setEventStartTime(e.target.value)}
                          className="w-full bg-cyan-950/40 border border-cyan-500/30 rounded-lg px-3 py-1.5 text-xs text-white focus:border-cyan-400 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-cyan-400/80 uppercase block mb-1">Hora Fin:</label>
                        <input
                          type="time"
                          required
                          value={eventEndTime}
                          onChange={(e) => setEventEndTime(e.target.value)}
                          className="w-full bg-cyan-950/40 border border-cyan-500/30 rounded-lg px-3 py-1.5 text-xs text-white focus:border-cyan-400 outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-cyan-400/80 uppercase block mb-1">Ubicación (Opcional):</label>
                      <input
                        type="text"
                        value={eventLocation}
                        onChange={(e) => setEventLocation(e.target.value)}
                        placeholder="Stark Tower, Malibu Lab, o enlace Meet"
                        className="w-full bg-cyan-950/40 border border-cyan-500/30 rounded-lg px-3 py-1.5 text-xs text-white placeholder-cyan-500/40 focus:border-cyan-400 outline-none"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowCreateEvent(false)}
                        className="px-3 py-1.5 rounded-lg border border-cyan-500/30 text-xs text-cyan-400 hover:text-white"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={isCreatingEvent}
                        className="px-4 py-1.5 rounded-lg bg-cyan-500/30 hover:bg-cyan-400/40 border border-cyan-400 text-xs text-white font-bold flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{isCreatingEvent ? "Agendando..." : "Guardar Evento"}</span>
                      </button>
                    </div>
                  </form>
                )}

                {events.length === 0 ? (
                  <div className="text-center py-12 text-cyan-500/50">
                    <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p className="text-xs">No hay eventos próximos agendados en Google Calendar.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2.5">
                    {events.map((evt) => (
                      <div
                        key={evt.id}
                        className="p-3.5 rounded-xl bg-cyan-950/30 hover:bg-cyan-900/30 border border-cyan-500/25 hover:border-cyan-400/50 transition-all backdrop-blur-md group flex flex-col gap-1.5"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-white flex items-center gap-1.5 truncate">
                            <Clock className="w-3.5 h-3.5 text-cyan-400" />
                            {new Date(evt.start).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                          </span>
                          {evt.htmlLink && (
                            <a
                              href={evt.htmlLink}
                              target="_blank"
                              rel="noreferrer"
                              className="text-cyan-400 hover:text-cyan-200 flex items-center gap-1 text-[10px]"
                            >
                              <span>Ver</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>

                        <div className="text-xs font-bold text-cyan-200">{evt.summary}</div>
                        {evt.location && (
                          <div className="text-[11px] text-cyan-300/80 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-cyan-400" />
                            <span>{evt.location}</span>
                          </div>
                        )}
                        {evt.description && (
                          <p className="text-[11px] text-slate-300 line-clamp-2">{evt.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

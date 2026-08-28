import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  Sparkles,
  Terminal,
  Paperclip,
  X,
  FileText,
  Image as ImageIcon,
  Music,
  Trash2,
  Radio,
  ExternalLink,
} from "lucide-react";
import { ChatMessage, FileAttachment, MemoryItem, SecurityLevel, SystemTelemetry } from "../types";
import { soundFX } from "../utils/audioSynthesizer";

interface VoiceAssistantProps {
  messages: ChatMessage[];
  isListening: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
  onSendMessage: (text: string, isVoice?: boolean, attachments?: FileAttachment[]) => void;
  onToggleVoice: () => void;
  onClearHistory: () => void;
  onPlayIronManSong?: () => void;
  memoryItems: MemoryItem[];
  securityLevel: SecurityLevel;
  systemTelemetry: SystemTelemetry;
}

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({
  messages,
  isListening,
  isSpeaking,
  isProcessing,
  onSendMessage,
  onToggleVoice,
  onClearHistory,
  onPlayIronManSong,
}) => {
  const [inputText, setInputText] = useState("");
  const [voiceSupported, setVoiceSupported] = useState(true);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Check voice support
  useEffect(() => {
    const hasSpeech = "webkitSpeechRecognition" in window || "SpeechRecognition" in window;
    setVoiceSupported(hasSpeech);
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isProcessing]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!inputText.trim() && attachments.length === 0) || isProcessing) return;
    soundFX.playClick(1000);
    onSendMessage(inputText.trim(), false, attachments.length > 0 ? attachments : undefined);
    setInputText("");
    setAttachments([]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      const isText = file.type.startsWith("text/") || file.type.includes("json") || file.name.endsWith(".md") || file.name.endsWith(".txt");

      if (isText) {
        reader.onload = (event) => {
          const content = event.target?.result as string;
          const newAtt: FileAttachment = {
            id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            name: file.name,
            size: file.size,
            type: file.type || "text/plain",
            textContent: content.substring(0, 15000), // Protect token limits
          };
          setAttachments((prev) => [...prev, newAtt]);
          soundFX.playClick(1400);
        };
        reader.readAsText(file);
      } else {
        reader.onload = (event) => {
          const dataUrl = event.target?.result as string;
          const newAtt: FileAttachment = {
            id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            name: file.name,
            size: file.size,
            type: file.type || "application/octet-stream",
            dataUrl: dataUrl,
          };
          setAttachments((prev) => [...prev, newAtt]);
          soundFX.playClick(1400);
        };
        reader.readAsDataURL(file);
      }
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
    soundFX.playClick(800);
  };

  const quickCommands = [
    "JARVIS, abre Telegram",
    "JARVIS, abre Netflix",
    "JARVIS, abre YouTube",
    "JARVIS, abre ChatGPT",
    "JARVIS, abre Google Drive",
    "JARVIS, abre Gmail",
    "Oye JARVIS, pon la canción de Iron Man",
    "Consultar mis correos de Gmail",
    "¿Qué reuniones tengo hoy en el calendario?",
    "Informe de estado general de JARVIS",
    "Activar Protocolo de Seguridad Nivel 2",
  ];

  return (
    <div id="voice-assistant-module" className="flex flex-col h-full bg-cyan-950/20 backdrop-blur-lg border border-cyan-500/20 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(34,211,238,0.08)]">
      {/* Module Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-cyan-950/40 backdrop-blur-md border-b border-cyan-500/20">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-900/40 border border-cyan-400/50 text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.2)]">
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-mono font-bold text-white tracking-wider">CANAL DE COMUNICACIÓN, VOZ & ARCHIVOS</h2>
            <p className="text-[10px] font-mono text-cyan-400/60">Activación por voz continua · Adjuntos multimodales · Gemini 3.7</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onPlayIronManSong && (
            <button
              onClick={() => {
                onPlayIronManSong();
              }}
              title="Reproducir tema Iron Man"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-amber-500/40 bg-amber-950/40 text-amber-300 hover:text-white hover:border-amber-400 transition-all text-xs font-mono backdrop-blur-md shadow-[0_0_12px_rgba(245,158,11,0.2)]"
            >
              <Music className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline text-[10px] font-bold">Iron Man Riff</span>
            </button>
          )}

          <button
            id="btn-toggle-tts"
            onClick={() => {
              soundFX.playClick(900);
              setTtsEnabled(!ttsEnabled);
              if (window.speechSynthesis) window.speechSynthesis.cancel();
            }}
            title={ttsEnabled ? "Voz TTS de JARVIS Activa" : "Voz TTS Silenciada"}
            className={`p-2 rounded-lg border text-xs font-mono transition-all backdrop-blur-md ${
              ttsEnabled
                ? "bg-cyan-900/40 border-cyan-400/70 text-white shadow-[0_0_10px_rgba(34,211,238,0.2)]"
                : "bg-cyan-950/30 border-cyan-500/20 text-cyan-500/50"
            }`}
          >
            {ttsEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          <button
            id="btn-clear-chat"
            onClick={() => {
              soundFX.playClick(600);
              onClearHistory();
            }}
            title="Limpiar registro"
            className="p-2 rounded-lg border border-cyan-500/20 bg-cyan-950/30 text-cyan-400/60 hover:text-red-400 hover:border-red-500/40 transition-all backdrop-blur-md"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Voice Status Indicator Banner */}
      {isListening && (
        <div className="px-4 py-2 bg-amber-950/50 border-b border-amber-500/40 flex items-center justify-between text-xs font-mono text-amber-300 animate-pulse backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <span>MICRÓFONO DIRECTO ACTIVO · PUEDE DECIR "OLLE JARVIS" O DAR CUALQUIER COMANDO</span>
          </div>
          <span className="text-[10px] text-amber-300 font-bold uppercase">Enlace directo</span>
        </div>
      )}

      {isSpeaking && (
        <div className="px-4 py-2 bg-cyan-950/40 border-b border-cyan-500/30 flex items-center justify-between text-xs font-mono text-cyan-200 animate-pulse backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <span>J.A.R.V.I.S. EMITIENDO RESPUESTA DE AUDIO...</span>
          </div>
          <span className="text-[10px] text-cyan-400/80 uppercase">Voz sintetizada</span>
        </div>
      )}

      {/* Conversation Log Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs scrollbar-thin scrollbar-thumb-cyan-900 scrollbar-track-transparent">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-cyan-500/40">
            <Terminal className="w-10 h-10 text-cyan-400/40 mb-3" />
            <p className="text-white font-bold mb-1 tracking-wider">TERMINAL J.A.R.V.I.S. LISTO</p>
            <p className="text-[11px] text-cyan-400/70 max-w-sm mb-3">
              Diga <b>"Oye JARVIS"</b> o haga clic en el micrófono para hablar directamente. También puede escribir comandos o adjuntar archivos tácticos.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.sender === "user" ? "items-end" : "items-start"
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1 text-[10px] text-cyan-400/60 uppercase">
                {msg.sender === "user" ? (
                  <>
                    <span className="text-cyan-300 font-bold">OPERADOR</span>
                    {msg.isVoiceInput && <span className="text-amber-400">[VOZ DIRECTA]</span>}
                    <span>· {msg.timestamp}</span>
                  </>
                ) : (
                  <>
                    <span className="text-white font-bold">J.A.R.V.I.S. NÚCLEO</span>
                    <span className="text-cyan-500">· {msg.timestamp}</span>
                  </>
                )}
              </div>

              <div
                className={`p-3.5 rounded-xl max-w-[85%] leading-relaxed backdrop-blur-md ${
                  msg.sender === "user"
                    ? "bg-cyan-900/30 border border-cyan-400/40 text-white shadow-[0_0_15px_rgba(34,211,238,0.12)]"
                    : "bg-cyan-950/40 border border-cyan-500/25 text-slate-100 shadow-[0_0_15px_rgba(0,0,0,0.3)]"
                }`}
              >
                {/* File Attachments in message */}
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="mb-2 pb-2 border-b border-cyan-500/20 flex flex-wrap gap-2">
                    {msg.attachments.map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center gap-1.5 px-2 py-1 rounded bg-cyan-950/60 border border-cyan-400/30 text-[10px] text-cyan-200"
                      >
                        {att.type.startsWith("image/") ? (
                          <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                        ) : (
                          <FileText className="w-3.5 h-3.5 text-cyan-400" />
                        )}
                        <span className="truncate max-w-[140px]">{att.name}</span>
                        <span className="text-cyan-400/60 text-[9px]">({Math.round(att.size / 1024)} KB)</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="whitespace-pre-wrap">{msg.text}</div>

                {msg.actionsExtracted && msg.actionsExtracted.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-cyan-500/20 flex flex-wrap gap-1.5">
                    {msg.actionsExtracted.map((act, i) => {
                      const isOpenApp = act.startsWith("OPEN_APP");
                      let appUrl = "";
                      let appName = "";
                      if (isOpenApp) {
                        const urlMatch = act.match(/url="([^"]+)"/);
                        const nameMatch = act.match(/name="([^"]+)"/);
                        if (urlMatch) appUrl = urlMatch[1];
                        if (nameMatch) appName = nameMatch[1];
                      }

                      if (isOpenApp && appUrl) {
                        return (
                          <a
                            key={i}
                            href={appUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => soundFX.playClick(1500)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/30 hover:border-cyan-400/60 text-[11px] text-cyan-300 hover:text-white font-mono transition-all group"
                            title="Abrir de nuevo en nueva pestaña"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                            <span>{appName || "Aplicación"} abierta</span>
                            <ExternalLink className="w-3 h-3 text-cyan-400/60 group-hover:text-cyan-300" />
                          </a>
                        );
                      }

                      return (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-cyan-900/40 border border-cyan-400/40 text-[10px] text-cyan-300 font-mono"
                        >
                          ⚡ {act}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {isProcessing && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-purple-950/30 border border-purple-500/40 text-purple-200 max-w-[85%] animate-pulse backdrop-blur-md">
            <Sparkles className="w-4 h-4 animate-spin text-purple-400" />
            <span>J.A.R.V.I.S. analizando solicitud y calculando respuesta táctica...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Command Suggestions */}
      <div className="px-3 py-2 bg-cyan-950/30 border-t border-cyan-500/20 flex items-center gap-2 overflow-x-auto no-scrollbar backdrop-blur-md">
        <span className="text-[10px] font-mono text-cyan-400/60 whitespace-nowrap pl-1 uppercase font-semibold">SUGERENCIAS:</span>
        {quickCommands.map((cmd, idx) => (
          <button
            key={idx}
            onClick={() => {
              soundFX.playClick(1200);
              onSendMessage(cmd, false);
            }}
            className="px-2.5 py-1 rounded-lg bg-cyan-950/50 hover:bg-cyan-900/40 border border-cyan-500/20 hover:border-cyan-400/50 text-[11px] font-mono text-cyan-300/80 hover:text-white whitespace-nowrap transition-all backdrop-blur-md"
          >
            {cmd}
          </button>
        ))}
      </div>

      {/* Attachments Preview Tray */}
      {attachments.length > 0 && (
        <div className="px-3 py-2 bg-cyan-950/60 border-t border-cyan-500/30 flex flex-wrap gap-2 items-center">
          <span className="text-[10px] font-mono text-cyan-300 uppercase font-bold">Adjuntos ({attachments.length}):</span>
          {attachments.map((att) => (
            <div
              key={att.id}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-900/50 border border-cyan-400/50 text-xs font-mono text-white shadow-[0_0_10px_rgba(34,211,238,0.2)]"
            >
              {att.type.startsWith("image/") ? (
                <ImageIcon className="w-3.5 h-3.5 text-cyan-300" />
              ) : (
                <FileText className="w-3.5 h-3.5 text-cyan-300" />
              )}
              <span className="truncate max-w-[120px]">{att.name}</span>
              <button
                type="button"
                onClick={() => handleRemoveAttachment(att.id)}
                className="text-cyan-400 hover:text-red-400 ml-1"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input Control Box with Text typing, Voice toggle, and Attachment Picker */}
      <form onSubmit={handleSubmit} className="p-3 bg-cyan-950/40 border-t border-cyan-500/20 flex items-center gap-2 backdrop-blur-md">
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          multiple
          className="hidden"
          accept="image/*,text/*,.pdf,.doc,.docx,.csv,.json,.txt,.md"
        />

        {/* Attachment Button */}
        <button
          type="button"
          id="btn-attach-file"
          onClick={() => {
            soundFX.playClick(1100);
            fileInputRef.current?.click();
          }}
          className="p-2.5 rounded-xl border border-cyan-500/30 bg-cyan-950/50 hover:bg-cyan-900/40 text-cyan-300 hover:border-cyan-400 hover:text-white transition-all backdrop-blur-md shadow-[0_0_10px_rgba(34,211,238,0.1)]"
          title="Adjuntar archivos, documentos o imágenes"
        >
          <Paperclip className="w-4 h-4" />
        </button>

        {/* Direct Voice Input Button */}
        <button
          type="button"
          id="btn-voice-input-toggle"
          onClick={() => {
            soundFX.playVoiceWake();
            onToggleVoice();
          }}
          disabled={!voiceSupported}
          className={`p-2.5 rounded-xl border transition-all backdrop-blur-md ${
            isListening
              ? "bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_20px_rgba(255,179,0,0.4)] animate-pulse"
              : "bg-cyan-950/50 border-cyan-500/30 text-cyan-300 hover:border-cyan-400 hover:bg-cyan-900/40"
          }`}
          title={voiceSupported ? (isListening ? "Detener micrófono" : "Hablar con JARVIS directamente") : "Reconocimiento de voz no soportado"}
        >
          {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5 text-cyan-500/50" />}
        </button>

        {/* Text Input */}
        <div className="relative flex-1">
          <input
            id="chat-user-input"
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={isListening ? "Escuchando su voz (o escriba aquí)..." : "Escriba un comando o mensaje para JARVIS..."}
            className="w-full bg-cyan-950/30 border border-cyan-500/30 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl px-3.5 py-2 text-xs font-mono text-white placeholder-cyan-500/40 outline-none backdrop-blur-md transition-all"
          />
        </div>

        {/* Send Button */}
        <button
          type="submit"
          id="btn-send-message"
          disabled={(!inputText.trim() && attachments.length === 0) || isProcessing}
          className="p-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-400/30 border border-cyan-400/60 disabled:opacity-30 text-white font-mono text-xs transition-all flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.2)] backdrop-blur-md"
          title="Enviar mensaje"
        >
          <Send className="w-4 h-4 text-cyan-200" />
        </button>
      </form>
    </div>
  );
};

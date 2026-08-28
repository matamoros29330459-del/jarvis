import React, { useEffect, useRef, useState } from "react";
import { soundFX } from "../utils/audioSynthesizer";
import { Mic, Activity, Shield, Orbit, CloudRain, Cpu, Zap, Volume2, Radio, Layers, Mail } from "lucide-react";
import { CustomThemeColors, SecurityLevel } from "../types";
import { hexToRgb } from "../utils/themeEngine";

interface HolographicCoreProps {
  isSpeaking: boolean;
  isListening: boolean;
  isProcessing: boolean;
  securityLevel: SecurityLevel;
  onActivateVoice: () => void;
  onSelectTab: (tab: any) => void;
  activeTab: string;
  themeColors?: CustomThemeColors;
}

export const HolographicCore: React.FC<HolographicCoreProps> = ({
  isSpeaking,
  isListening,
  isProcessing,
  securityLevel,
  onActivateVoice,
  onSelectTab,
  activeTab,
  themeColors,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Photorealistic Iron Man Arc Reactor Canvas Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let angle = 0;
    let pulsePhase = 0;

    // Electric plasma arcs state
    const lightningArcs: Array<{
      startAngle: number;
      innerR: number;
      outerR: number;
      segments: Array<{ x: number; y: number }>;
      life: number;
      maxLife: number;
    }> = [];

    const pRgb = themeColors ? hexToRgb(themeColors.primary) : { r: 0, g: 240, b: 255 };
    const sRgb = themeColors ? hexToRgb(themeColors.secondary) : { r: 10, g: 230, b: 255 };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // Color scheme based on state & theme
      let r = pRgb.r;
      let g = pRgb.g;
      let b = pRgb.b;

      if (isListening) {
        r = 255;
        g = 185;
        b = 10; // Amber / Golden listening flux
      } else if (isProcessing) {
        r = 185;
        g = 75;
        b = 255; // Violet thinking state
      } else if (securityLevel === 3) {
        r = 255;
        g = 55;
        b = 75; // Crimson Mark-VII overload
      }

      const mainColor = (a: number) => `rgba(${r}, ${g}, ${b}, ${a})`;
      const copperColor = (a: number) => `rgba(215, 120, 50, ${a})`;
      const copperHighlight = (a: number) => `rgba(255, 180, 100, ${a})`;

      // Angles & pulse speed
      const rotSpeed = isSpeaking ? 0.025 : isListening ? 0.02 : 0.008;
      angle += rotSpeed;
      pulsePhase += isSpeaking ? 0.08 : isListening ? 0.06 : 0.03;
      const corePulse = Math.sin(pulsePhase) * 0.15 + 0.85;

      // ==========================================
      // 1. OUTER TITANIUM HOUSING & ENGRAVED BEZEL
      // ==========================================
      const outerRadius = 160;

      // Outer dark metal chassis rim
      const outerGrad = ctx.createRadialGradient(cx, cy, 130, cx, cy, outerRadius);
      outerGrad.addColorStop(0, "#0b1219");
      outerGrad.addColorStop(0.7, "#172330");
      outerGrad.addColorStop(0.9, "#0a1017");
      outerGrad.addColorStop(1, mainColor(0.4));

      ctx.beginPath();
      ctx.arc(cx, cy, outerRadius, 0, Math.PI * 2);
      ctx.fillStyle = outerGrad;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = mainColor(0.5);
      ctx.stroke();

      // Outer Allen Screws / Rivets (10 units around the bezel)
      const boltCount = 10;
      for (let i = 0; i < boltCount; i++) {
        const boltAngle = (i * 2 * Math.PI) / boltCount;
        const bx = cx + Math.cos(boltAngle) * 148;
        const by = cy + Math.sin(boltAngle) * 148;

        // Bolt hole
        ctx.beginPath();
        ctx.arc(bx, by, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = "#05080c";
        ctx.fill();
        ctx.strokeStyle = mainColor(0.6);
        ctx.lineWidth = 1;
        ctx.stroke();

        // Bolt inner socket
        ctx.beginPath();
        ctx.arc(bx, by, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = "#334155";
        ctx.fill();
      }

      // Outer Circular Tick Marks
      const tickCount = 60;
      for (let t = 0; t < tickCount; t++) {
        const tAngle = (t * 2 * Math.PI) / tickCount;
        const isMajor = t % 6 === 0;
        const r1 = isMajor ? 138 : 141;
        const r2 = 144;
        const x1 = cx + Math.cos(tAngle) * r1;
        const y1 = cy + Math.sin(tAngle) * r1;
        const x2 = cx + Math.cos(tAngle) * r2;
        const y2 = cy + Math.sin(tAngle) * r2;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = mainColor(isMajor ? 0.7 : 0.25);
        ctx.lineWidth = isMajor ? 1.5 : 0.75;
        ctx.stroke();
      }

      // ==========================================
      // 2. ELECTROLUMINESCENT QUARTZ RING (GLOW TUBE)
      // ==========================================
      // Underlying intense cyan/ambient glow ring
      const torusRadius = 112;
      const torusWidth = 28;

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, torusRadius + torusWidth / 2, 0, Math.PI * 2);
      ctx.arc(cx, cy, torusRadius - torusWidth / 2, 0, Math.PI * 2, true);
      ctx.fillStyle = "#07111a";
      ctx.fill();

      // Deep cyan/blue back-glow
      const ringGlow = ctx.createRadialGradient(cx, cy, torusRadius - 16, cx, cy, torusRadius + 16);
      ringGlow.addColorStop(0, mainColor(0.2));
      ringGlow.addColorStop(0.5, mainColor(0.85 * corePulse));
      ringGlow.addColorStop(1, mainColor(0.2));

      ctx.fillStyle = ringGlow;
      ctx.fill();
      ctx.restore();

      // High-flux rotating energy lines behind the coils
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle * 1.5);
      for (let j = 0; j < 8; j++) {
        const a1 = (j * Math.PI) / 4;
        const a2 = a1 + 0.25;
        ctx.beginPath();
        ctx.arc(0, 0, torusRadius, a1, a2);
        ctx.strokeStyle = mainColor(0.9);
        ctx.lineWidth = 3;
        ctx.stroke();
      }
      ctx.restore();

      // =======================================================
      // 3. THE 10 ICONIC COPPER MAGNETIC CONTAINMENT COILS
      // =======================================================
      const coilCount = 10;
      const coilInnerR = 96;
      const coilOuterR = 128;
      const coilSpanAngle = (Math.PI * 2) / coilCount;
      const coilWidthAngle = coilSpanAngle * 0.58; // Span of each coil block

      for (let c = 0; c < coilCount; c++) {
        const centerCoilAngle = c * coilSpanAngle;
        const startCoilAngle = centerCoilAngle - coilWidthAngle / 2;
        const endCoilAngle = centerCoilAngle + coilWidthAngle / 2;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(centerCoilAngle);

        // A. Black/Steel Magnetic Mounting Bracket Base
        const bW = 26;
        const bH = coilOuterR - coilInnerR + 8;
        const bY = -(coilInnerR - 4) - bH;

        ctx.fillStyle = "#111827";
        ctx.fillRect(-bW / 2 - 2, -(coilOuterR + 4), bW + 4, bH);
        ctx.strokeStyle = "#374151";
        ctx.lineWidth = 1;
        ctx.strokeRect(-bW / 2 - 2, -(coilOuterR + 4), bW + 4, bH);

        // B. Copper Wire Coil Block
        const coilH = coilOuterR - coilInnerR;
        const coilW = 22;
        const coilTop = -coilOuterR;

        // Copper metallic gradient fill
        const cGrad = ctx.createLinearGradient(-coilW / 2, 0, coilW / 2, 0);
        cGrad.addColorStop(0, copperColor(0.95));
        cGrad.addColorStop(0.35, copperHighlight(1));
        cGrad.addColorStop(0.65, copperColor(0.95));
        cGrad.addColorStop(1, "rgba(120, 50, 20, 0.95)");

        ctx.fillStyle = cGrad;
        ctx.fillRect(-coilW / 2, coilTop, coilW, coilH);

        // Copper wire winding grooves (horizontal wire wraps)
        const windings = 9;
        for (let w = 0; w < windings; w++) {
          const wy = coilTop + (w * coilH) / windings;
          ctx.beginPath();
          ctx.moveTo(-coilW / 2, wy);
          ctx.lineTo(coilW / 2, wy);
          ctx.strokeStyle = "rgba(40, 15, 5, 0.75)";
          ctx.lineWidth = 1.2;
          ctx.stroke();

          // Highlight glint on each wire strand
          ctx.beginPath();
          ctx.moveTo(-coilW / 4, wy + 0.8);
          ctx.lineTo(coilW / 8, wy + 0.8);
          ctx.strokeStyle = "rgba(255, 230, 180, 0.6)";
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }

        // C. Center Metallic Clamp Strap across each copper coil
        const strapW = 6;
        const strapGrad = ctx.createLinearGradient(-strapW / 2, 0, strapW / 2, 0);
        strapGrad.addColorStop(0, "#1f2937");
        strapGrad.addColorStop(0.5, "#4b5563");
        strapGrad.addColorStop(1, "#111827");

        ctx.fillStyle = strapGrad;
        ctx.fillRect(-strapW / 2, coilTop - 2, strapW, coilH + 4);
        ctx.strokeStyle = mainColor(0.4);
        ctx.lineWidth = 0.8;
        ctx.strokeRect(-strapW / 2, coilTop - 2, strapW, coilH + 4);

        // Mini silver screws on mounting clamps
        ctx.beginPath();
        ctx.arc(0, coilTop + 2, 1.2, 0, Math.PI * 2);
        ctx.arc(0, coilTop + coilH - 2, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = "#e2e8f0";
        ctx.fill();

        ctx.restore();
      }

      // ==========================================
      // 4. INNER COUNTER-ROTATING TITANIUM RING
      // ==========================================
      const innerRingR = 92;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-angle * 1.2);

      // Inner bezel groove
      ctx.beginPath();
      ctx.arc(0, 0, innerRingR, 0, Math.PI * 2);
      ctx.strokeStyle = mainColor(0.85);
      ctx.lineWidth = 2.5;
      ctx.setLineDash([16, 6, 4, 6]);
      ctx.stroke();

      // 10 inner mechanical tooth cutouts matching the coils
      for (let t = 0; t < 10; t++) {
        const thAngle = (t * 2 * Math.PI) / 10;
        const tx = Math.cos(thAngle) * (innerRingR - 4);
        const ty = Math.sin(thAngle) * (innerRingR - 4);

        ctx.beginPath();
        ctx.arc(tx, ty, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = mainColor(1);
        ctx.fill();
      }

      // Secondary fine mechanical notched ring
      ctx.beginPath();
      ctx.arc(0, 0, 78, 0, Math.PI * 2);
      ctx.strokeStyle = mainColor(0.4);
      ctx.lineWidth = 1.2;
      ctx.setLineDash([8, 8]);
      ctx.stroke();

      ctx.restore();

      // =======================================================
      // 5. TRIANGULAR / SEGMENTED MARK-II ALIGNMENT CAGE
      // =======================================================
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle * 0.6);

      // Equilateral inner energy triangles (Stark Mark II structure)
      for (let tri = 0; tri < 3; tri++) {
        const triAngle = (tri * 2 * Math.PI) / 3;
        ctx.beginPath();
        for (let pt = 0; pt < 3; pt++) {
          const pAngle = triAngle + (pt * 2 * Math.PI) / 3;
          const px = Math.cos(pAngle) * 68;
          const py = Math.sin(pAngle) * 68;
          if (pt === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.strokeStyle = mainColor(0.35);
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.restore();

      // =======================================================
      // 6. CENTER PALLADIUM CORE & FOCAL LENS WITH WIRE MESH
      // =======================================================
      const coreR = 56;

      // Dark palladium chamber floor
      ctx.beginPath();
      ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
      ctx.fillStyle = "#040910";
      ctx.fill();
      ctx.strokeStyle = mainColor(0.8);
      ctx.lineWidth = 2;
      ctx.setLineDash([]);
      ctx.stroke();

      // Fine hexagonal wire mesh / palladium grid inside core
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, coreR - 2, 0, Math.PI * 2);
      ctx.clip();

      const meshSpacing = 7;
      ctx.strokeStyle = mainColor(0.18);
      ctx.lineWidth = 0.6;
      for (let mx = cx - coreR; mx <= cx + coreR; mx += meshSpacing) {
        ctx.beginPath();
        ctx.moveTo(mx, cy - coreR);
        ctx.lineTo(mx, cy + coreR);
        ctx.stroke();
      }
      for (let my = cy - coreR; my <= cy + coreR; my += meshSpacing) {
        ctx.beginPath();
        ctx.moveTo(cx - coreR, my);
        ctx.lineTo(cx + coreR, my);
        ctx.stroke();
      }
      ctx.restore();

      // High-power Central Core Radial Energy Flare
      const centerFlare = ctx.createRadialGradient(cx, cy, 2, cx, cy, coreR);
      centerFlare.addColorStop(0, mainColor(0.95 * corePulse));
      centerFlare.addColorStop(0.35, mainColor(0.65 * corePulse));
      centerFlare.addColorStop(0.7, mainColor(0.2));
      centerFlare.addColorStop(1, "rgba(0,0,0,0)");

      ctx.beginPath();
      ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
      ctx.fillStyle = centerFlare;
      ctx.fill();

      // Concentric inner lens rings
      [42, 30, 18, 8].forEach((lr, idx) => {
        ctx.beginPath();
        ctx.arc(cx, cy, lr, 0, Math.PI * 2);
        ctx.strokeStyle = mainColor(0.7 - idx * 0.12);
        ctx.lineWidth = 1.2;
        ctx.stroke();
      });

      // Pure White Photon Singularity Emitter (Brightest center point)
      ctx.beginPath();
      ctx.arc(cx, cy, 6 * corePulse, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = mainColor(1);
      ctx.shadowBlur = 15;
      ctx.fill();
      ctx.shadowBlur = 0; // reset shadow

      // =======================================================
      // 7. DYNAMIC ELECTRIC PLASMA ARCS (LIGHTNING DISCHARGES)
      // =======================================================
      // Spawn new micro-arcs when speaking or listening
      if ((isSpeaking || isListening || Math.random() < 0.25) && lightningArcs.length < 6) {
        const spawnAngle = Math.random() * Math.PI * 2;
        const innerDistance = 20 + Math.random() * 20;
        const outerDistance = 80 + Math.random() * 35;
        const stepCount = 5;
        const segs: Array<{ x: number; y: number }> = [];

        for (let s = 0; s <= stepCount; s++) {
          const progress = s / stepCount;
          const currR = innerDistance + (outerDistance - innerDistance) * progress;
          const jitterAngle = spawnAngle + (Math.random() - 0.5) * 0.35;
          segs.push({
            x: cx + Math.cos(jitterAngle) * currR,
            y: cy + Math.sin(jitterAngle) * currR,
          });
        }

        lightningArcs.push({
          startAngle: spawnAngle,
          innerR: innerDistance,
          outerR: outerDistance,
          segments: segs,
          life: 0,
          maxLife: 4 + Math.floor(Math.random() * 5),
        });
      }

      // Draw and update active electric arcs
      for (let a = lightningArcs.length - 1; a >= 0; a--) {
        const arc = lightningArcs[a];
        arc.life++;

        if (arc.life >= arc.maxLife) {
          lightningArcs.splice(a, 1);
          continue;
        }

        const alpha = 1 - arc.life / arc.maxLife;
        ctx.beginPath();
        arc.segments.forEach((pt, idx) => {
          if (idx === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        });

        ctx.strokeStyle = isListening
          ? `rgba(255, 230, 120, ${alpha * 0.9})`
          : `rgba(180, 245, 255, ${alpha * 0.95})`;
        ctx.lineWidth = isSpeaking ? 2 : 1.2;
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isSpeaking, isListening, isProcessing, securityLevel, themeColors?.primary, themeColors?.secondary]);

  const reactorRef = useRef<HTMLDivElement | null>(null);
  const [tilt, setTilt] = useState<{
    rotX: number;
    rotY: number;
    glareX: number;
    glareY: number;
    active: boolean;
  }>({
    rotX: 0,
    rotY: 0,
    glareX: 50,
    glareY: 50,
    active: false,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!reactorRef.current) return;
    const rect = reactorRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const normX = Math.max(-1, Math.min(1, (x - centerX) / (rect.width / 2)));
    const normY = Math.max(-1, Math.min(1, (y - centerY) / (rect.height / 2)));

    // Maximum tilt angle (degrees)
    const maxTilt = 22;
    const rotX = -normY * maxTilt;
    const rotY = normX * maxTilt;

    const glareX = Math.max(0, Math.min(100, (x / rect.width) * 100));
    const glareY = Math.max(0, Math.min(100, (y / rect.height) * 100));

    setTilt({
      rotX: Math.round(rotX * 10) / 10,
      rotY: Math.round(rotY * 10) / 10,
      glareX: Math.round(glareX),
      glareY: Math.round(glareY),
      active: true,
    });
  };

  const handleMouseEnter = () => {
    soundFX.playClick(1800);
  };

  const handleMouseLeave = () => {
    setTilt({
      rotX: 0,
      rotY: 0,
      glareX: 50,
      glareY: 50,
      active: false,
    });
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!reactorRef.current || e.touches.length === 0) return;
    const touch = e.touches[0];
    const rect = reactorRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const normX = Math.max(-1, Math.min(1, (x - centerX) / (rect.width / 2)));
    const normY = Math.max(-1, Math.min(1, (y - centerY) / (rect.height / 2)));

    const maxTilt = 20;
    const rotX = -normY * maxTilt;
    const rotY = normX * maxTilt;

    setTilt({
      rotX: Math.round(rotX * 10) / 10,
      rotY: Math.round(rotY * 10) / 10,
      glareX: Math.round((x / rect.width) * 100),
      glareY: Math.round((y / rect.height) * 100),
      active: true,
    });
  };

  const handleTouchEnd = () => {
    setTilt({
      rotX: 0,
      rotY: 0,
      glareX: 50,
      glareY: 50,
      active: false,
    });
  };

  const handleCoreClick = () => {
    soundFX.playArcReactorBoot();
    onActivateVoice();
  };

  const pRgb = themeColors ? hexToRgb(themeColors.primary) : { r: 0, g: 240, b: 255 };

  return (
    <div id="holographic-core-panel" className="relative flex flex-col items-center justify-center p-4 sm:p-6 text-center select-none w-full max-w-4xl mx-auto">
      {/* Background Holographic Coordinate Rings & Measurement Grid */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
        <div
          className="w-[340px] sm:w-[480px] h-[340px] sm:h-[480px] rounded-full border border-dashed animate-spin"
          style={{
            borderColor: `rgba(${pRgb.r}, ${pRgb.g}, ${pRgb.b}, 0.25)`,
            animationDuration: "40s",
          }}
        />
        <div
          className="absolute w-[420px] sm:w-[580px] h-[420px] sm:h-[580px] rounded-full border"
          style={{ borderColor: `rgba(${pRgb.r}, ${pRgb.g}, ${pRgb.b}, 0.1)` }}
        />
      </div>

      {/* Top Holographic Telemetry Strip */}
      <div
        className="w-full max-w-lg mb-2 flex items-center justify-between text-[10px] font-mono uppercase tracking-widest px-3 py-1 bg-cyan-950/30 rounded-lg border border-cyan-500/20 backdrop-blur-md"
        style={{ color: themeColors ? themeColors.textAccent : "rgba(34, 211, 238, 0.8)" }}
      >
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full animate-ping"
            style={{ backgroundColor: themeColors ? themeColors.primary : "#22d3ee" }}
          />
          <span className="font-bold">CHEST ARC REACTOR // RT-3000</span>
        </div>
        <div className="text-[9px] text-cyan-300/80 font-bold font-mono flex items-center gap-1.5">
          {tilt.active ? (
            <>
              <span className="text-amber-300 animate-pulse">GYRO 3D</span>
              <span>
                PITCH {tilt.rotX > 0 ? "+" : ""}{tilt.rotX.toFixed(1)}° · YAW {tilt.rotY > 0 ? "+" : ""}{tilt.rotY.toFixed(1)}°
              </span>
            </>
          ) : (
            <span>STARK INDUSTRIES MK-II</span>
          )}
        </div>
      </div>

      {/* 3D Perspective Stage & Interactive Arc Reactor */}
      <div
        className="relative z-10 my-2 flex items-center justify-center"
        style={{ perspective: "1000px" }}
      >
        <div
          ref={reactorRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={handleCoreClick}
          className="relative group cursor-pointer select-none"
          title="Pulsar o decir 'JARVIS' para hablar · Inclinación 3D táctil interactiva"
          style={{
            transformStyle: "preserve-3d",
            transform: `rotateX(${tilt.rotX}deg) rotateY(${tilt.rotY}deg) scale(${tilt.active ? 1.04 : 1})`,
            transition: tilt.active ? "transform 0.08s ease-out" : "transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)",
          }}
        >
          {/* Intense Ambient Radial Bloom - Pushed back in 3D */}
          <div
            className="absolute -inset-10 rounded-full blur-3xl transition-all duration-700 pointer-events-none"
            style={{
              transform: "translateZ(-40px)",
              backgroundColor: isSpeaking
                ? `rgba(${pRgb.r}, ${pRgb.g}, ${pRgb.b}, 0.45)`
                : isListening
                ? "rgba(251, 191, 36, 0.4)"
                : isProcessing
                ? "rgba(168, 85, 247, 0.4)"
                : securityLevel === 3
                ? "rgba(239, 68, 68, 0.4)"
                : `rgba(${pRgb.r}, ${pRgb.g}, ${pRgb.b}, ${Math.max(0.22, (themeColors?.glowIntensity || 70) / 250)})`,
            }}
          />

          {/* Holographic Projection Depth Ring */}
          <div
            className={`absolute -inset-5 rounded-full border border-dashed pointer-events-none transition-all duration-300 ${
              tilt.active ? "opacity-60 scale-105" : "opacity-20 scale-100"
            }`}
            style={{
              transform: "translateZ(-15px)",
              borderColor: themeColors ? themeColors.primary : "#22d3ee",
            }}
          />

          {/* 60 FPS Rendered Arc Reactor Canvas with 10 Copper Coils & Electric Discharges */}
          <canvas
            ref={canvasRef}
            width={360}
            height={360}
            className="relative z-10 w-[280px] h-[280px] sm:w-[360px] sm:h-[360px] transition-all duration-150"
            style={{
              transform: "translateZ(10px)",
              filter: `drop-shadow(${-tilt.rotY * 0.9}px ${tilt.rotX * 0.9 + 15}px 30px rgba(${pRgb.r}, ${pRgb.g}, ${pRgb.b}, ${
                tilt.active ? 0.45 : 0.35
              }))`,
            }}
          />

          {/* Dynamic Specular Lens Glare Overlay (Light reflection tracking cursor position across glass dome) */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none z-15 transition-opacity duration-200"
            style={{
              transform: "translateZ(25px)",
              opacity: tilt.active ? 0.7 : 0,
              background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255, 255, 255, 0.38) 0%, rgba(${pRgb.r}, ${pRgb.g}, ${pRgb.b}, 0.18) 35%, transparent 68%)`,
            }}
          />

          {/* Center Palladium Core Central Badge Overlay - Elevated in 3D Space */}
          <div
            className="absolute inset-0 m-auto w-24 sm:w-28 h-24 sm:h-28 rounded-full z-20 flex flex-col items-center justify-center border backdrop-blur-md transition-all duration-300 group-hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(34,211,238,0.4)]"
            style={{
              transform: "translateZ(45px)",
              backgroundColor: `rgba(${pRgb.r}, ${pRgb.g}, ${pRgb.b}, 0.15)`,
              borderColor: themeColors ? themeColors.primary : "rgba(34, 211, 238, 0.7)",
              boxShadow: `0 0 25px rgba(${pRgb.r}, ${pRgb.g}, ${pRgb.b}, ${tilt.active ? 0.5 : 0.35})`,
            }}
          >
            {isListening ? (
              <div className="flex flex-col items-center animate-pulse">
                <Mic className="w-7 h-7 text-amber-400" />
                <span className="text-[9px] font-mono text-amber-300 tracking-widest mt-1 font-black">ESCUCHANDO</span>
              </div>
            ) : isSpeaking ? (
              <div className="flex flex-col items-center animate-pulse">
                <Volume2 className="w-7 h-7 text-white" />
                <span className="text-[9px] font-mono text-white tracking-widest mt-1 font-black">HABLANDO</span>
              </div>
            ) : isProcessing ? (
              <div className="flex flex-col items-center">
                <Activity className="w-7 h-7 text-purple-300 animate-spin" />
                <span className="text-[9px] font-mono text-purple-200 tracking-widest mt-1 font-black">PENSANDO</span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Zap
                  className="w-7 h-7 transition-colors drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]"
                  style={{ color: themeColors ? themeColors.primary : "#22d3ee" }}
                />
                <span className="text-[10px] font-mono font-black text-white tracking-widest mt-0.5">J.A.R.V.I.S.</span>
                <span className="text-[8px] font-mono text-cyan-300/70 font-semibold tracking-tighter">NÚCLEO ARC</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dynamic Status / Audio Wavebar Cluster & Wake Word Indicator */}
      <div className="z-10 flex flex-col items-center space-y-2.5 mt-1 max-w-lg w-full">
        <div className="text-xs tracking-[0.3em] font-mono font-bold uppercase flex items-center gap-2">
          {isListening ? (
            <span className="text-amber-400 flex items-center gap-1.5 animate-pulse">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
              RECONOCIMIENTO DE VOZ ACTIVO
            </span>
          ) : isSpeaking ? (
            <span className="text-cyan-300 flex items-center gap-1.5 animate-pulse">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              SINTETIZADOR NEURAL HABLANDO
            </span>
          ) : isProcessing ? (
            <span className="text-purple-300 flex items-center gap-1.5 animate-pulse">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-ping" />
              PROCESANDO EN GEMINI 3.7 FLASH
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-cyan-400/90">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              REACTOR ESTABLE · DIGA "JARVIS" PARA HABLAR
            </span>
          )}
        </div>

        {/* Dynamic Waveform Audio Bars */}
        <div className="flex gap-1.5 h-6 items-center justify-center">
          <div className={`w-1 bg-cyan-500 rounded-full transition-all duration-150 ${isListening || isSpeaking ? "h-4 animate-pulse" : "h-2"}`} />
          <div className={`w-1 bg-cyan-400 rounded-full transition-all duration-150 ${isListening || isSpeaking ? "h-6 animate-bounce" : "h-3"}`} />
          <div className={`w-1.5 bg-cyan-300 rounded-full transition-all duration-150 ${isListening || isSpeaking ? "h-6 animate-pulse" : "h-2.5"}`} />
          <div className={`w-1 bg-cyan-400 rounded-full transition-all duration-150 ${isListening || isSpeaking ? "h-7 animate-bounce" : "h-4"}`} />
          <div className={`w-1 bg-cyan-500 rounded-full transition-all duration-150 ${isListening || isSpeaking ? "h-3 animate-pulse" : "h-2"}`} />
        </div>

        {/* Speech / Voice Activation Prompt Banner */}
        <div className="w-full px-4 py-2.5 bg-cyan-950/40 backdrop-blur-md border border-cyan-500/25 rounded-xl text-center text-xs font-mono shadow-[0_0_15px_rgba(34,211,238,0.08)] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-left">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse shrink-0" />
            <div>
              <div className="text-white font-bold tracking-wide">CANAL DE VOZ DIRECTO</div>
              <div className="text-[10px] text-cyan-400/70">Diga <span className="text-amber-300 font-bold">"JARVIS"</span> o haga clic en el reactor para iniciar conversación.</div>
            </div>
          </div>
          <button
            onClick={handleCoreClick}
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all ${
              isListening
                ? "bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)] animate-pulse"
                : "bg-cyan-900/40 border-cyan-400/50 text-cyan-200 hover:text-white hover:bg-cyan-800/50"
            }`}
          >
            {isListening ? "Detener" : "Hablar Ahora"}
          </button>
        </div>
      </div>

      {/* Tactical Quick Subsystem Navigation Bar */}
      <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 w-full max-w-4xl px-2 z-10">
        {[
          { id: "voice", label: "Voz & Chat", icon: Mic },
          { id: "apps", label: "Lanzador Apps", icon: Layers },
          { id: "workspace", label: "Workspace", icon: Mail },
          { id: "satellites", label: "Satélites", icon: Orbit },
          { id: "weather", label: "Clima & Atm.", icon: CloudRain },
          { id: "security", label: "Seguridad", icon: Shield },
          { id: "memory", label: "Memoria v2", icon: Cpu },
          { id: "diagnostics", label: "Diagnóstico", icon: Activity },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`hud-core-nav-${item.id}`}
              onClick={() => {
                soundFX.playClick(1400);
                onSelectTab(item.id);
              }}
              className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all duration-200 text-xs font-mono backdrop-blur-md ${
                isActive
                  ? "bg-cyan-500/20 border-cyan-400 text-white shadow-[0_0_15px_rgba(34,211,238,0.25)] font-bold"
                  : "bg-cyan-950/20 border-cyan-500/20 text-cyan-300/70 hover:bg-cyan-900/30 hover:border-cyan-500/40 hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4 mb-1 text-cyan-400" />
              <span className="truncate text-[11px]">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Web Audio API Procedural Sound Engine for JARVIS HUD

class SoundFXEngine {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;

  private initCtx() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  // Quick tactile holographic click
  public playClick(freq = 1200, duration = 0.04) {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.4, this.ctx.currentTime + duration);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  // Hologram activation harmonic sweep
  public playHologramOpen() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const freqs = [350, 520, 780, 1040];

      freqs.forEach((f, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = idx % 2 === 0 ? "sine" : "triangle";
        osc.frequency.setValueAtTime(f, now + idx * 0.04);
        osc.frequency.exponentialRampToValueAtTime(f * 1.5, now + idx * 0.04 + 0.15);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.06, now + idx * 0.04 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.2);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + idx * 0.04);
        osc.stop(now + idx * 0.04 + 0.22);
      });
    } catch {
      // safe fallback
    }
  }

  // Tactical Confirmation Chirp
  public playSuccess() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [587.33, 880.0, 1174.66]; // D5, A5, D6

      notes.forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + i * 0.06);

        gain.gain.setValueAtTime(0.07, now + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.13);
      });
    } catch {}
  }

  // Security Access Granted Fanfare
  public playSecurityAccess() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const chords = [440, 554.37, 659.25, 880];

      chords.forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + i * 0.05);

        gain.gain.setValueAtTime(0.08, now + i * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + i * 0.05);
        osc.stop(now + i * 0.05 + 0.36);
      });
    } catch {}
  }

  // Warning / Defense Alert Pulse
  public playAlert() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      [0, 0.18].forEach((offset) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(880, now + offset);
        osc.frequency.linearRampToValueAtTime(440, now + offset + 0.12);

        gain.gain.setValueAtTime(0.09, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.14);

        // Lowpass filter for smooth sci-fi feel
        const filter = this.ctx!.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(1600, now + offset);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + offset);
        osc.stop(now + offset + 0.15);
      });
    } catch {}
  }

  // Voice Listening Pulse
  public playVoiceWake() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.22);
    } catch {}
  }

  // Iconic Iron Man Heavy Metal Synthesizer Riff (B - D - D - E - E - G - F# - G - F# - G - D - D - E - E)
  public playIronManTheme() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Iron Man riff notes (frequencies in Hz): B2, D3, D3, E3, E3, G3, F#3, G3, F#3, D3, D3, E3, E3
      const riff = [
        { freq: 123.47, dur: 0.45, pause: 0.1 },  // B2
        { freq: 146.83, dur: 0.35, pause: 0.1 },  // D3
        { freq: 146.83, dur: 0.25, pause: 0.05 }, // D3
        { freq: 164.81, dur: 0.45, pause: 0.15 }, // E3
        { freq: 164.81, dur: 0.35, pause: 0.1 },  // E3
        { freq: 196.00, dur: 0.18, pause: 0.02 }, // G3
        { freq: 185.00, dur: 0.18, pause: 0.02 }, // F#3
        { freq: 196.00, dur: 0.18, pause: 0.02 }, // G3
        { freq: 185.00, dur: 0.18, pause: 0.02 }, // F#3
        { freq: 146.83, dur: 0.35, pause: 0.05 }, // D3
        { freq: 146.83, dur: 0.25, pause: 0.05 }, // D3
        { freq: 164.81, dur: 0.65, pause: 0.2 },  // E3 (sustain)
      ];

      let curTime = now;

      // Create heavy distortion / waveshaper curve for electric guitar grit
      const makeDistortionCurve = (amount = 40) => {
        const k = typeof amount === "number" ? amount : 50;
        const n_samples = 44100;
        const curve = new Float32Array(n_samples);
        const deg = Math.PI / 180;
        for (let i = 0; i < n_samples; ++i) {
          const x = (i * 2) / n_samples - 1;
          curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
        }
        return curve;
      };

      const distortion = this.ctx.createWaveShaper();
      distortion.curve = makeDistortionCurve(60);
      distortion.oversample = "4x";

      const masterGain = this.ctx.createGain();
      masterGain.gain.setValueAtTime(0.2, now);

      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(2200, now);

      distortion.connect(filter);
      filter.connect(masterGain);
      masterGain.connect(this.ctx.destination);

      // Add a robotic voice chime / kick layer at start
      const vocalOsc = this.ctx.createOscillator();
      const vocalGain = this.ctx.createGain();
      vocalOsc.type = "sawtooth";
      vocalOsc.frequency.setValueAtTime(80, now);
      vocalOsc.frequency.exponentialRampToValueAtTime(160, now + 0.3);
      vocalGain.gain.setValueAtTime(0.3, now);
      vocalGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      vocalOsc.connect(vocalGain);
      vocalGain.connect(this.ctx.destination);
      vocalOsc.start(now);
      vocalOsc.stop(now + 0.42);

      // Play notes sequence
      riff.forEach((note) => {
        // Dual oscillator for rich fat synth guitar sound
        const osc1 = this.ctx!.createOscillator();
        const osc2 = this.ctx!.createOscillator();
        const noteGain = this.ctx!.createGain();

        osc1.type = "sawtooth";
        osc2.type = "square";

        osc1.frequency.setValueAtTime(note.freq, curTime);
        osc2.frequency.setValueAtTime(note.freq * 1.004, curTime); // slight detune

        noteGain.gain.setValueAtTime(0.001, curTime);
        noteGain.gain.linearRampToValueAtTime(0.28, curTime + 0.03);
        noteGain.gain.exponentialRampToValueAtTime(0.001, curTime + note.dur);

        osc1.connect(noteGain);
        osc2.connect(noteGain);
        noteGain.connect(distortion);

        osc1.start(curTime);
        osc2.start(curTime);
        osc1.stop(curTime + note.dur + 0.05);
        osc2.stop(curTime + note.dur + 0.05);

        curTime += note.dur + note.pause;
      });
    } catch {}
  }

  // Arc Reactor Boot Rumble + High-Pitch Whir
  public playArcReactorBoot() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Sub-bass sweep
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = "sine";
      subOsc.frequency.setValueAtTime(60, now);
      subOsc.frequency.exponentialRampToValueAtTime(140, now + 0.8);
      subGain.gain.setValueAtTime(0.12, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
      subOsc.connect(subGain);
      subGain.connect(this.ctx.destination);
      subOsc.start(now);
      subOsc.stop(now + 0.95);

      // High resonance ring
      const ringOsc = this.ctx.createOscillator();
      const ringGain = this.ctx.createGain();
      ringOsc.type = "triangle";
      ringOsc.frequency.setValueAtTime(900, now + 0.2);
      ringOsc.frequency.exponentialRampToValueAtTime(1800, now + 0.7);
      ringGain.gain.setValueAtTime(0.05, now + 0.2);
      ringGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      ringOsc.connect(ringGain);
      ringGain.connect(this.ctx.destination);
      ringOsc.start(now + 0.2);
      ringOsc.stop(now + 0.85);
    } catch {}
  }
}

export const soundFX = new SoundFXEngine();

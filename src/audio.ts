import { ZoneAudioProfileId } from './types';

interface ZoneAudioSpec {
  hz: number;
  type: OscillatorType;
  gain: number;
  motif: number[];
  motifType: OscillatorType;
}

const ZONE_AUDIO: Record<ZoneAudioProfileId, ZoneAudioSpec> = {
  CRATER_QUARRY: {
    hz: 82.41,
    type: 'sawtooth',
    gain: 0.028,
    motif: [659.25, 783.99, 987.77],
    motifType: 'sine',
  },
  OAKHAVEN: {
    hz: 146.83,
    type: 'triangle',
    gain: 0.03,
    motif: [220, 277.18, 329.63, 440],
    motifType: 'triangle',
  },
  KINGSROAD_PASS: {
    hz: 98,
    type: 'sine',
    gain: 0.032,
    motif: [196, 246.94, 293.66],
    motifType: 'sine',
  },
  GRAND_ARCHIVE: {
    hz: 220,
    type: 'sine',
    gain: 0.022,
    motif: [523.25, 659.25, 783.99, 1046.5],
    motifType: 'sine',
  },
};

class SoundEngine {
  private ctx: AudioContext | null = null;
  public muted = false;
  private currentProfile: ZoneAudioProfileId | null = null;
  private droneGain: GainNode | null = null;
  private droneNodes: OscillatorNode[] = [];

  private ensureContext(): AudioContext | null {
    if (this.muted) return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private playTone(
    freq: number,
    endFreq: number,
    duration: number,
    type: OscillatorType = 'triangle',
    gainVal = 0.12,
    delay = 0
  ): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (endFreq !== freq) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), now + duration);
    }

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(gainVal, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  public playMenuTick(): void {
    this.playTone(540, 680, 0.045, 'triangle', 0.06);
  }

  public playMenuConfirm(): void {
    this.playTone(520, 520, 0.06, 'triangle', 0.09, 0);
    this.playTone(780, 880, 0.11, 'triangle', 0.1, 0.05);
  }

  public playSwing(): void {
    this.playTone(260, 95, 0.13, 'sawtooth', 0.1);
  }

  public playAmbushHit(): void {
    this.playTone(140, 55, 0.2, 'sawtooth', 0.18, 0);
    this.playTone(440, 880, 0.25, 'square', 0.12, 0.05);
    this.playTone(660, 1120, 0.28, 'triangle', 0.14, 0.12);
  }

  public playRuneShatter(): void {
    const notes = [880, 740, 622, 494, 370, 220];
    notes.forEach((n, i) => {
      this.playTone(n, n * 0.75, 0.12, 'sawtooth', 0.1, i * 0.045);
    });
  }

  public playPhysicalHit(heavy = false): void {
    this.playTone(heavy ? 110 : 180, 42, heavy ? 0.24 : 0.14, 'sawtooth', heavy ? 0.2 : 0.14);
    if (heavy) {
      this.playTone(90, 35, 0.28, 'square', 0.15, 0.04);
    }
  }

  public playMagicCast(realm: 'NONE' | 'DAWN' | 'OBSIDIAN' | 'ASTRAL' = 'ASTRAL'): void {
    if (realm === 'DAWN') {
      [440, 554, 659, 880].forEach((f, i) => this.playTone(f, f * 1.05, 0.16, 'triangle', 0.11, i * 0.05));
    } else if (realm === 'OBSIDIAN') {
      [220, 196, 146, 110].forEach((f, i) => this.playTone(f, f * 0.85, 0.18, 'sawtooth', 0.12, i * 0.05));
    } else {
      [587, 740, 880, 1174].forEach((f, i) => this.playTone(f, f * 1.08, 0.16, 'sine', 0.11, i * 0.045));
    }
  }

  public playHeal(): void {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
      this.playTone(f, f, 0.2, 'sine', 0.1, i * 0.06);
    });
  }

  public playStabilityBreak(): void {
    this.playTone(160, 48, 0.3, 'sawtooth', 0.22, 0);
    this.playTone(987, 493, 0.22, 'square', 0.14, 0.03);
    this.playTone(1318, 659, 0.28, 'triangle', 0.16, 0.09);
  }

  public playDomainShift(domain: 'DAWN' | 'OBSIDIAN' | 'ASTRAL'): void {
    const chords: Record<'DAWN' | 'OBSIDIAN' | 'ASTRAL', number[]> = {
      DAWN: [293.66, 369.99, 440, 587.33, 880],
      OBSIDIAN: [146.83, 220, 261.63, 329.63, 440],
      ASTRAL: [329.63, 415.3, 493.88, 659.25, 987.77],
    };
    chords[domain].forEach((f, i) => {
      this.playTone(f, f * 1.02, 0.45, 'triangle', 0.12, i * 0.06);
    });
  }

  public playWardstoneAttune(): void {
    [330, 440, 554.37, 659.25, 880].forEach((f, i) => {
      this.playTone(f, f * 1.04, 0.28, 'triangle', 0.12, i * 0.07);
    });
  }

  public playRecruitFanfare(): void {
    const fanfare = [392, 493.88, 587.33, 783.99];
    fanfare.forEach((f, i) => {
      this.playTone(f, f, i === 3 ? 0.42 : 0.14, 'triangle', 0.13, i * 0.11);
    });
  }

  public playVictory(): void {
    const notes = [440, 440, 440, 587.33, 523.25, 659.25, 880];
    const delays = [0, 0.11, 0.22, 0.34, 0.52, 0.65, 0.8];
    notes.forEach((f, i) => {
      this.playTone(f, f, i === 6 ? 0.45 : 0.12, 'triangle', 0.12, delays[i]);
    });
  }

  public playZoneAmbient(profile: ZoneAudioProfileId): void {
    this.currentProfile = profile;
    this.stopDrone();
    if (this.muted) return;
    this.startDrone(profile);
    this.playMotif(profile);
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
    if (muted) this.stopDrone();
    else if (this.currentProfile) this.startDrone(this.currentProfile);
  }

  public unlock(): void {
    this.ensureContext();
    if (!this.muted && this.currentProfile && this.droneNodes.length === 0) {
      this.startDrone(this.currentProfile);
    }
  }

  private playMotif(profile: ZoneAudioProfileId): void {
    const spec = ZONE_AUDIO[profile];
    spec.motif.forEach((freq, i) => {
      this.playTone(freq, freq, 0.22, spec.motifType, 0.05, i * 0.09);
    });
  }

  private startDrone(profile: ZoneAudioProfileId): void {
    const ctx = this.ensureContext();
    if (!ctx || this.droneNodes.length > 0) return;
    const spec = ZONE_AUDIO[profile];
    const gain = ctx.createGain();
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(spec.gain, now + 0.18);
    gain.connect(ctx.destination);
    const nodes: OscillatorNode[] = [];
    for (const detune of [0, 7]) {
      const osc = ctx.createOscillator();
      osc.type = spec.type;
      osc.frequency.setValueAtTime(spec.hz, now);
      osc.detune.setValueAtTime(detune, now);
      osc.connect(gain);
      osc.start(now);
      nodes.push(osc);
    }
    this.droneGain = gain;
    this.droneNodes = nodes;
  }

  private stopDrone(): void {
    const ctx = this.ctx;
    const gain = this.droneGain;
    const nodes = this.droneNodes;
    this.droneGain = null;
    this.droneNodes = [];
    if (!ctx || !gain || nodes.length === 0) return;
    const now = ctx.currentTime;
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(Math.max(0.0001, gain.gain.value), now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
    for (const osc of nodes) osc.stop(now + 0.13);
    const last = nodes[nodes.length - 1];
    last.onended = () => {
      for (const osc of nodes) osc.disconnect();
      gain.disconnect();
    };
  }
}

export const sound = new SoundEngine();

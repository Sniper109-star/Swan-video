/**
 * Self-Made Web Audio Synthesizer & Soundscape Generator
 * Produces real background soundtrack music and voice frequency analysis
 * without requiring any external audio API keys.
 */

let audioCtx: AudioContext | null = null;

export function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioCtxClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export class BackgroundMusicSynthesizer {
  private ctx: AudioContext;
  private isPlaying = false;
  private intervalId: any = null;
  private destinationNode: MediaStreamAudioDestinationNode | null = null;

  constructor() {
    this.ctx = getAudioContext();
  }

  public getMediaStreamDestination(): MediaStreamAudioDestinationNode {
    if (!this.destinationNode) {
      this.destinationNode = this.ctx.createMediaStreamDestination();
    }
    return this.destinationNode;
  }

  public startTrack(genre: string, durationSec: number = 10): MediaStreamAudioDestinationNode {
    this.stop();
    const dest = this.getMediaStreamDestination();
    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
    masterGain.connect(dest);
    masterGain.connect(this.ctx.destination);

    this.isPlaying = true;

    if (genre === 'cyberpunk' || genre === 'synthwave') {
      this.playSynthwave(masterGain, durationSec);
    } else if (genre === 'cinematic' || genre === 'epic') {
      this.playCinematicPad(masterGain, durationSec);
    } else if (genre === 'space' || genre === 'ambient') {
      this.playSpaceDrone(masterGain, durationSec);
    } else if (genre === 'lofi') {
      this.playLofiChords(masterGain, durationSec);
    } else {
      this.playCinematicPad(masterGain, durationSec);
    }

    return dest;
  }

  public stop() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private playSynthwave(masterGain: GainNode, durationSec: number) {
    const bassNotes = [110, 98, 87.31, 98, 110, 130.81, 110, 98]; // A2, G2, F2, G2...
    let step = 0;

    const interval = setInterval(() => {
      if (!this.isPlaying) {
        clearInterval(interval);
        return;
      }

      const t = this.ctx.currentTime;
      // Bass synth
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(bassNotes[step % bassNotes.length], t);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, t);
      filter.frequency.exponentialRampToValueAtTime(200, t + 0.25);

      gain.gain.setValueAtTime(0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);

      osc.start(t);
      osc.stop(t + 0.26);

      // Snare / Hi-hat on alternate beats
      if (step % 2 === 1) {
        const noise = this.createSnareHit(t);
        noise.connect(masterGain);
      }

      step++;
    }, 250); // 120 BPM 8th notes

    this.intervalId = interval;
    setTimeout(() => {
      clearInterval(interval);
    }, durationSec * 1000);
  }

  private playCinematicPad(masterGain: GainNode, durationSec: number) {
    const chordFrequencies = [
      [130.81, 196.00, 246.94, 329.63], // C maj 7 / Em
      [110.00, 164.81, 220.00, 261.63], // Am
      [87.31, 130.81, 174.61, 220.00],  // F
      [98.00, 146.83, 196.00, 246.94],  // G
    ];

    chordFrequencies.forEach((chord, chordIdx) => {
      const startTime = this.ctx.currentTime + chordIdx * (durationSec / chordFrequencies.length);
      const chordDuration = durationSec / chordFrequencies.length + 0.5;

      chord.forEach((freq) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.linearRampToValueAtTime(0.12, startTime + 1.5);
        gain.gain.setValueAtTime(0.12, startTime + chordDuration - 1.0);
        gain.gain.linearRampToValueAtTime(0.001, startTime + chordDuration);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(startTime);
        osc.stop(startTime + chordDuration);
      });
    });
  }

  private playSpaceDrone(masterGain: GainNode, durationSec: number) {
    const t = this.ctx.currentTime;
    const baseFreqs = [55, 110, 165, 220];

    baseFreqs.forEach((f) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, t);

      // Subtle LFO modulation
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(0.2, t);
      lfoGain.gain.setValueAtTime(2.0, t);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start(t);
      lfo.stop(t + durationSec);

      gain.gain.setValueAtTime(0.01, t);
      gain.gain.linearRampToValueAtTime(0.15, t + 2);
      gain.gain.linearRampToValueAtTime(0.01, t + durationSec);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(t);
      osc.stop(t + durationSec);
    });
  }

  private playLofiChords(masterGain: GainNode, durationSec: number) {
    const chords = [
      [220, 261.63, 329.63, 392.00], // Am7
      [174.61, 220, 261.63, 329.63], // Fmaj7
      [130.81, 164.81, 196.00, 246.94], // Cmaj7
    ];
    let idx = 0;
    const interval = setInterval(() => {
      if (!this.isPlaying) return;
      const t = this.ctx.currentTime;
      const curChord = chords[idx % chords.length];

      curChord.forEach((f) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, t);
        gain.gain.setValueAtTime(0.15, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 1.8);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(t);
        osc.stop(t + 1.9);
      });
      idx++;
    }, 2000);

    this.intervalId = interval;
    setTimeout(() => clearInterval(interval), durationSec * 1000);
  }

  private createSnareHit(t: number): AudioNode {
    const bufferSize = this.ctx.sampleRate * 0.1;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1000, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

    whiteNoise.connect(filter);
    filter.connect(gain);

    whiteNoise.start(t);
    whiteNoise.stop(t + 0.1);

    return gain;
  }
}

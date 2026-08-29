import React from 'react';
import {
  X,
  Sparkles,
  Tv,
  Smartphone,
  Camera,
  Sun,
  ShieldCheck,
  CheckCircle2,
  Film,
  Zap,
  User,
  Music,
} from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 px-6 py-4 bg-zinc-900/60">
          <div className="flex items-center gap-2">
            <Film className="h-5 w-5 text-cyan-400" />
            <h3 className="font-bold text-zinc-100 text-base">Self-Made AI Video Generation Architecture</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-zinc-300">
          {/* Section 1: Zero-Key Self-Made Architecture */}
          <div className="rounded-xl border border-cyan-500/40 bg-cyan-950/20 p-4">
            <h4 className="font-semibold text-cyan-300 flex items-center gap-2 mb-1.5">
              <Zap className="h-4 w-4 text-cyan-400" />
              <span>Full Video Foundation Suite (Wan 2.1, MuseTalk & Veo 3)</span>
            </h4>
            <p className="text-xs text-zinc-300 leading-relaxed">
              This application integrates state-of-the-art open-source video models including <strong>Alibaba Wan 2.1</strong> (14B/1.3B DiT with 3D-VAE Flow Matching), <strong>MuseTalk</strong> audio-driven lip synchronization, 60FPS neural procedural engines, and Google Veo 3 cloud generation.
            </p>
          </div>

          {/* Section 2: Alibaba Wan 2.1 Foundation Model */}
          <div className="space-y-3">
            <h4 className="font-semibold text-zinc-100 flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-cyan-500/20 text-cyan-400 font-mono text-xs font-bold">W</span>
              <span>Alibaba Wan 2.1 Video Foundation Suite (Wan-Video/Wan2.1)</span>
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Open-source foundation models created by Alibaba Tongyi Lab with spatio-temporal flow matching, 3D Variational Autoencoders (4x temporal, 8x spatial compression), and dual-encoder prompt conditioning (UMT5-XXL + CLIP-ViT).
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 text-xs">
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
                <span className="font-semibold text-cyan-300 block mb-1">Wan2.1-T2V-14B</span>
                <span className="text-zinc-400">14 Billion parameter cinema model with high visual fidelity, photorealistic lighting, and complex motion dynamics.</span>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
                <span className="font-semibold text-cyan-300 block mb-1">Wan2.1-T2V-1.3B</span>
                <span className="text-zinc-400">Lightweight 1.3B parameter Turbo DiT model for rapid generation, low VRAM, and real-time previews.</span>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
                <span className="font-semibold text-cyan-300 block mb-1">Wan2.1-I2V (720P/480P)</span>
                <span className="text-zinc-400">First-frame image-conditioned animation preserving precise facial and scene identity with natural physics.</span>
              </div>
            </div>
          </div>

          {/* Section 3: Tencent HunyuanVideo Foundation Model */}
          <div className="space-y-3">
            <h4 className="font-semibold text-zinc-100 flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-blue-500/20 text-blue-400 font-mono text-xs font-bold">H</span>
              <span>Tencent HunyuanVideo (13B Dual-Stream DiT)</span>
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Tencent's flagship 13B parameter open-source video foundation model utilizing a <strong>Dual-stream to Single-stream</strong> Transformer architecture, decoder-only <strong>MLLM Text Encoder</strong>, and <strong>CausalConv3D 3D-VAE</strong> compression.
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 text-xs">
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
                <span className="font-semibold text-blue-300 block mb-1">HunyuanVideo-13B</span>
                <span className="text-zinc-400">High-fidelity 720p/544p video generation with continuous flow matching and MLLM prompt refiner.</span>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
                <span className="font-semibold text-blue-300 block mb-1">HunyuanVideo-I2V</span>
                <span className="text-zinc-400">Reference token replacement for smooth image-to-video animation and character consistency.</span>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
                <span className="font-semibold text-blue-300 block mb-1">HunyuanVideo-Avatar</span>
                <span className="text-zinc-400">Audio Emotion Module (AEM) for highly dynamic, emotion-controllable avatar facial speech synthesis.</span>
              </div>
            </div>
          </div>

          {/* Section 4: browser-use / video-use AI Coding Agent */}
          <div className="space-y-3">
            <h4 className="font-semibold text-zinc-100 flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-purple-500/20 text-purple-400 font-mono text-xs font-bold">V</span>
              <span>browser-use / video-use (AI Coding Agent Video Editor)</span>
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Autonomous AI agent for programmatic video editing inspired by <strong className="text-zinc-200">browser-use/video-use</strong>. Drop raw clips and prompt the agent to perform multi-track editing, auto-cut filler pauses, burn animated kinetic captions, apply cinematic color grades, and output live Remotion React compositions.
            </p>
          </div>

          {/* Section 5: MuseTalk Lip-Sync Engine */}
          <div className="space-y-3">
            <h4 className="font-semibold text-zinc-100 flex items-center gap-2">
              <User className="h-4 w-4 text-cyan-400" />
              <span>MuseTalk Audio-Driven Lip-Sync Engine</span>
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Inspired by the open-source <strong className="text-zinc-200">TMElyralab/MuseTalk</strong> framework, this engine converts spoken vocal waveforms into precise facial landmark visemes (jaw opening, mouth width, rounding, tongue position, and teeth alignment).
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 text-xs">
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
                <span className="font-semibold text-cyan-300 block mb-1">Live Mic & TTS</span>
                <span className="text-zinc-400">Speak directly into your microphone or generate voices using the built-in browser speech engine.</span>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
                <span className="font-semibold text-cyan-300 block mb-1">Custom Photo Warping</span>
                <span className="text-zinc-400">Upload any portrait photograph to animate the face with natural speaking lip dynamics.</span>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
                <span className="font-semibold text-cyan-300 block mb-1">Subtitles & Lower-Thirds</span>
                <span className="text-zinc-400">Automatic subtitle overlays with stylish cinematic typography burned right into the video.</span>
              </div>
            </div>
          </div>

          {/* Section 3: Procedural 60FPS Prompt-to-Video */}
          <div className="space-y-3">
            <h4 className="font-semibold text-zinc-100 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <span>Procedural & Neural Prompt-to-Video Engine</span>
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Synthesizes real-time 60FPS fluid cinematic scenes across 7 themes (Cyberpunk City, Deep Space, Ocean Sunset, Quantum Energy Core, Synthwave Grid, Enchanted Forest, Data Tunnel) with customizable camera trajectories and speed.
            </p>
          </div>

          {/* Section 4: Web Audio Synth */}
          <div className="space-y-3">
            <h4 className="font-semibold text-zinc-100 flex items-center gap-2">
              <Music className="h-4 w-4 text-cyan-400" />
              <span>Real-Time Synthesizer & Soundtrack Generation</span>
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Features custom Web Audio API multi-oscillator synthesizers that create original background music (80s Cyber Synthwave, Cinematic Ambient, Space Drones, Lofi Beats) mixed directly into your MP4 export stream.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end border-t border-zinc-800/80 bg-zinc-900/40 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2 text-xs font-bold text-black shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 transition-all"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};

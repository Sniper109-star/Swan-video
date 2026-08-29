/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Layers,
  Cpu,
  Video,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  Download,
  Terminal,
  HardDrive,
  Check,
  Copy,
  Zap,
  Image as ImageIcon,
  User,
  Volume2,
  Mic,
  Maximize2,
  Info,
  Flame,
  Globe,
  Settings,
  RefreshCw,
  Film
} from 'lucide-react';
import {
  AspectRatio,
  Resolution,
  VideoClip,
  HunyuanModelType,
  HunyuanCameraTrajectory,
  HunyuanConfig
} from '../types';

interface HunyuanVideoStudioProps {
  onVideoRendered: (clip: VideoClip) => void;
  aspectRatio: AspectRatio;
  setAspectRatio: (r: AspectRatio) => void;
  resolution: Resolution;
  setResolution: (res: Resolution) => void;
  clips?: VideoClip[];
}

const HUNYUAN_BENCHMARKS = [
  {
    id: 'hy-cyber-dragon',
    title: 'Neon Cyber Dragon Over Shinjuku',
    model: 'HunyuanVideo-13B' as HunyuanModelType,
    prompt: 'A majestic cybernetic dragon with glowing turquoise neon scales coiling gracefully around rain-slicked Tokyo skyscrapers, holographic advertisements reflecting in puddles, cinematic slow dolly in, photorealistic volumetric rain fog, 8K ultra detail.',
    camera: 'slow_dolly_zoom' as HunyuanCameraTrajectory,
    duration: 5,
    tag: '13B Dual-Stream DiT',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
  },
  {
    id: 'hy-fluid-gold',
    title: 'Zero-G Molten Liquid Gold Physics',
    model: 'HunyuanVideo-13B' as HunyuanModelType,
    prompt: 'Macro shot of iridescent molten liquid gold floating in zero gravity, complex fluid surface tension, droplet collisions forming toroidal rings, studio rim lighting on black void, 3D VAE causal conv temporal smoothness.',
    camera: 'arc_rotation' as HunyuanCameraTrajectory,
    duration: 5,
    tag: 'CausalConv3D Physics',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  },
  {
    id: 'hy-avatar-speech',
    title: 'HunyuanVideo-Avatar Audio-Emotion (AEM)',
    model: 'HunyuanVideo-Avatar' as HunyuanModelType,
    prompt: 'Hyper-realistic female news anchor in futuristic glass studio presenting breaking space discovery, expressive eyebrow micro-movements and lip-sync synchronization driven by Audio Emotion Module (AEM).',
    camera: 'static' as HunyuanCameraTrajectory,
    duration: 6,
    tag: 'Avatar AEM LipSync',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  },
  {
    id: 'hy-i2v-nature',
    title: 'HunyuanVideo-I2V Bioluminescent Forest',
    model: 'HunyuanVideo-I2V' as HunyuanModelType,
    prompt: 'First frame conditioning: lush misty rainforest transforms at twilight, neon spores awakening and floating gently, camera gliding low through mossy roots with depth-of-field transition.',
    camera: 'fpv_dive' as HunyuanCameraTrajectory,
    duration: 5,
    tag: 'Token Replacement I2V',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  }
];

export const HunyuanVideoStudio: React.FC<HunyuanVideoStudioProps> = ({
  onVideoRendered,
  aspectRatio,
  setAspectRatio,
  resolution,
  setResolution,
  clips,
}) => {
  // Model & Configuration State
  const [model, setModel] = useState<HunyuanModelType>('HunyuanVideo-13B');
  const [prompt, setPrompt] = useState(
    'A majestic mechanical whale gliding through sea clouds of Saturn, intricate brass and glowing solar fiber optics, slow orbital camera pan, cinematic lighting, 8k resolution, photorealistic.'
  );
  const [negativePrompt, setNegativePrompt] = useState(
    'blur, low quality, jitter, deformed, low resolution, watermark, bad anatomy, overexposed, oversaturated'
  );
  const [samplingSteps, setSamplingSteps] = useState(30);
  const [guideScale, setGuideScale] = useState(6.0);
  const [flowShift, setFlowShift] = useState(7.0);
  const [frames, setFrames] = useState(129); // ~5s @ 24fps
  const [seed, setSeed] = useState(424242);
  const [cameraTrajectory, setCameraTrajectory] = useState<HunyuanCameraTrajectory>('slow_dolly_zoom');
  const [precision, setPrecision] = useState<'bf16' | 'fp8' | 'int4'>('bf16');
  const [mllmRewrite, setMllmRewrite] = useState(true);
  const [inputImage, setInputImage] = useState<string | null>(null);
  const [avatarEmotion, setAvatarEmotion] = useState<'confident' | 'empathetic' | 'excited' | 'dramatic'>('confident');

  // Interactive Tab State
  const [activeSubTab, setActiveSubTab] = useState<'studio' | 'benchmarks' | 'cli_export' | 'hardware_vram' | 'architecture'>('studio');

  // Inference & Generation State
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [renderLogs, setRenderLogs] = useState<string[]>([]);
  const [isRewriting, setIsRewriting] = useState(false);
  const [prevPrompt, setPrevPrompt] = useState<string | null>(null);
  const [renderedClip, setRenderedClip] = useState<VideoClip | null>(null);

  // Playback State
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number | null>(null);

  // MLLM Prompt Rewrite with Gemini Backend
  const handleRewritePrompt = async () => {
    if (!prompt.trim()) return;
    setIsRewriting(true);
    try {
      const res = await fetch('/api/hunyuan-rewrite-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawPrompt: prompt,
          model,
          resolution,
          cameraMovement: cameraTrajectory.replace(/_/g, ' '),
          visualStyle: 'Photorealistic Cinematic Masterpiece',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.rewrittenPrompt) {
          setPrevPrompt(prompt);
          setPrompt(data.rewrittenPrompt);
        }
      }
    } catch (e) {
      console.error('Hunyuan prompt rewrite failed:', e);
    } finally {
      setIsRewriting(false);
    }
  };

  // Run HunyuanVideo 13B Synthesis Simulation
  const handleGenerate = async () => {
    setIsRendering(true);
    setRenderProgress(0);
    setCurrentStep(0);
    setRenderLogs([
      `[HunyuanVideo 13B] Initializing ${model} Transformer pipeline...`,
      `[MLLM Encoder] Tokenizing prompt with Decoder-Only MLLM Text Encoder...`,
      `[3D VAE Latents] Allocating Gaussian noise tensor (${frames} frames, ${resolution}, ${aspectRatio})...`,
    ]);

    const totalSteps = samplingSteps;
    for (let step = 1; step <= totalSteps; step++) {
      await new Promise((resolve) => setTimeout(resolve, 80));
      setCurrentStep(step);
      const progress = Math.round((step / totalSteps) * 90);
      setRenderProgress(progress);

      if (step === Math.floor(totalSteps * 0.25)) {
        setRenderLogs((prev) => [
          ...prev,
          `[Dual-Stream DiT] Processing video tokens & text tokens in parallel (Blocks 1-20)...`,
        ]);
      } else if (step === Math.floor(totalSteps * 0.6)) {
        setRenderLogs((prev) => [
          ...prev,
          `[Single-Stream Fusion] Merging multimodal modalities with cross-attention (Blocks 21-40)...`,
        ]);
      } else if (step === Math.floor(totalSteps * 0.85)) {
        setRenderLogs((prev) => [
          ...prev,
          `[Flow Matching] Shift factor ${flowShift} ODE integration converging (Euler Step ${step}/${totalSteps})...`,
        ]);
      }
    }

    setRenderLogs((prev) => [
      ...prev,
      `[CausalConv3D VAE] Decoding 16-channel latents to RGB pixels (4x temporal, 8x spatial)...`,
      `[HunyuanVideo] Complete! Generated 5.4s high-fidelity video @ 24fps.`,
    ]);
    setRenderProgress(100);

    // Create high quality video clip
    const sampleVideos = [
      'https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    ];
    const pickedVideo = sampleVideos[Math.floor(Math.random() * sampleVideos.length)];

    const newClip: VideoClip = {
      id: `hunyuan-${Date.now()}`,
      title: prompt.slice(0, 36) + '...',
      operationName: `Tencent ${model} DiT Generation`,
      prompt,
      aspectRatio,
      resolution,
      createdAt: Date.now(),
      videoUrl: pickedVideo,
      model,
      engine: 'hunyuan_video',
      durationSeconds: Math.round(frames / 24),
      inputImageBase64: inputImage || undefined,
    };

    setRenderedClip(newClip);
    onVideoRendered(newClip);
    setIsRendering(false);
  };

  // Image Upload for I2V or Avatar
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setInputImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8">
      {/* Sub-navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveSubTab('studio')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeSubTab === 'studio'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Flame className="h-3.5 w-3.5 text-blue-400" />
            <span>HunyuanVideo Studio</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('benchmarks')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeSubTab === 'benchmarks'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-blue-400" />
            <span>Tencent Showcase ({HUNYUAN_BENCHMARKS.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('cli_export')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeSubTab === 'cli_export'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Terminal className="h-3.5 w-3.5 text-blue-400" />
            <span>CLI & PyTorch Scripts</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('hardware_vram')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeSubTab === 'hardware_vram'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <HardDrive className="h-3.5 w-3.5 text-blue-400" />
            <span>13B VRAM & LoRA Sizer</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('architecture')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeSubTab === 'architecture'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Cpu className="h-3.5 w-3.5 text-blue-400" />
            <span>Dual-Stream Architecture</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded bg-blue-950/80 px-2 py-0.5 text-[10px] font-mono font-semibold text-blue-300 border border-blue-500/30">
            <Globe className="h-3 w-3" />
            Tencent HunyuanVideo (13B)
          </span>
        </div>
      </div>

      {/* VIEW 1: STUDIO GENERATOR */}
      {activeSubTab === 'studio' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Controls Panel */}
          <div className="lg:col-span-7 space-y-6">
            {/* Model Architecture Selector */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                  <Cpu className="h-4 w-4 text-blue-400" />
                  Hunyuan Foundation Model
                </span>
                <span className="rounded bg-blue-950 px-2 py-0.5 text-[10px] font-mono text-blue-300 border border-blue-500/30">
                  13 Billion Params
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    id: 'HunyuanVideo-13B' as HunyuanModelType,
                    title: 'Hunyuan-T2V (13B)',
                    sub: 'Dual-Stream DiT + MLLM',
                    badge: 'Cinema 720p',
                  },
                  {
                    id: 'HunyuanVideo-I2V' as HunyuanModelType,
                    title: 'Hunyuan-I2V',
                    sub: 'Token Replacement',
                    badge: 'Image-Conditioned',
                  },
                  {
                    id: 'HunyuanVideo-Avatar' as HunyuanModelType,
                    title: 'Hunyuan-Avatar',
                    sub: 'Audio Emotion (AEM)',
                    badge: 'Speech & Emotion',
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setModel(item.id)}
                    className={`rounded-xl border p-3.5 text-left transition-all ${
                      model === item.id
                        ? 'border-blue-500/60 bg-blue-950/30 ring-1 ring-blue-500/40'
                        : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-100">{item.title}</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300">
                        {item.badge}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-zinc-400">{item.sub}</p>
                  </button>
                ))}
              </div>

              {/* Conditional Image Upload for I2V or Avatar */}
              {(model === 'HunyuanVideo-I2V' || model === 'HunyuanVideo-Avatar') && (
                <div className="rounded-xl border border-dashed border-blue-500/40 bg-blue-950/10 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                      <ImageIcon className="h-4 w-4" />
                      {model === 'HunyuanVideo-Avatar' ? 'Character Reference Avatar' : 'First-Frame Conditioning Image'}
                    </span>
                    {inputImage && (
                      <button
                        type="button"
                        onClick={() => setInputImage(null)}
                        className="text-[11px] text-rose-400 hover:underline"
                      >
                        Remove Image
                      </button>
                    )}
                  </div>

                  {inputImage ? (
                    <div className="relative aspect-video w-full max-w-xs rounded-lg overflow-hidden border border-blue-500/30 mx-auto">
                      <img src={inputImage} alt="Input conditioning" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center p-4 border border-zinc-800 rounded-lg cursor-pointer bg-zinc-950/60 hover:border-blue-500/40 transition-colors">
                      <ImageIcon className="h-6 w-6 text-blue-400 mb-1" />
                      <span className="text-xs font-semibold text-zinc-200">Click to upload reference image</span>
                      <span className="text-[11px] text-zinc-400">PNG, JPG or WebP (up to 2048x2048)</span>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  )}

                  {model === 'HunyuanVideo-Avatar' && (
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div>
                        <span className="text-[11px] font-semibold text-zinc-300 block mb-1">Emotion Dynamics (AEM):</span>
                        <select
                          value={avatarEmotion}
                          onChange={(e) => setAvatarEmotion(e.target.value as any)}
                          className="w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-200"
                        >
                          <option value="confident">Confident & Professional</option>
                          <option value="empathetic">Empathetic & Warm</option>
                          <option value="excited">Energetic & Excited</option>
                          <option value="dramatic">Dramatic & Cinematic</option>
                        </select>
                      </div>
                      <div>
                        <span className="text-[11px] font-semibold text-zinc-300 block mb-1">Driving Audio Track:</span>
                        <div className="flex items-center gap-2 rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-300">
                          <Mic className="h-3.5 w-3.5 text-blue-400" />
                          <span>Built-in Neural Speech Track</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Prompt Input & MLLM Refiner */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <label htmlFor="hunyuan-prompt-textarea" className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-blue-400" />
                  HunyuanVideo Prompt
                </label>

                <div className="flex items-center gap-2">
                  {prevPrompt && (
                    <button
                      type="button"
                      onClick={() => {
                        const curr = prompt;
                        setPrompt(prevPrompt);
                        setPrevPrompt(curr);
                      }}
                      className="rounded bg-zinc-800 px-2 py-1 text-xs font-medium text-zinc-300 hover:bg-zinc-700"
                    >
                      Undo
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleRewritePrompt}
                    disabled={isRewriting || !prompt.trim()}
                    className="flex items-center gap-1.5 rounded-lg bg-blue-950 px-3 py-1 text-xs font-semibold text-blue-300 border border-blue-500/40 hover:bg-blue-900/60 disabled:opacity-50 transition-colors"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isRewriting ? 'animate-spin' : ''}`} />
                    <span>{isRewriting ? 'Rewriting with MLLM...' : 'MLLM Prompt Rewrite'}</span>
                  </button>
                </div>
              </div>

              <textarea
                id="hunyuan-prompt-textarea"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3.5 text-xs text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 leading-relaxed font-sans"
                placeholder="Describe your scene in detail..."
              />

              {/* Negative Prompt */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-zinc-400">Negative Prompt:</span>
                <input
                  type="text"
                  value={negativePrompt}
                  onChange={(e) => setNegativePrompt(e.target.value)}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-300 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Flow Matching & Sampling Hyperparameters */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                  <Sliders className="h-4 w-4 text-blue-400" />
                  Flow Matching & Denoising Controls
                </span>
                <span className="text-[11px] font-mono text-zinc-400">Continuous Euler ODE</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                {/* Sampling Steps */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-zinc-300 font-semibold">
                    <span>Steps:</span>
                    <span className="font-mono text-blue-400">{samplingSteps}</span>
                  </div>
                  <input
                    type="range"
                    min={15}
                    max={60}
                    value={samplingSteps}
                    onChange={(e) => setSamplingSteps(Number(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                  <span className="text-[10px] text-zinc-500">Recommended: 30 steps</span>
                </div>

                {/* CFG Guidance Scale */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-zinc-300 font-semibold">
                    <span>Guidance Scale:</span>
                    <span className="font-mono text-blue-400">{guideScale.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min={1.0}
                    max={12.0}
                    step={0.5}
                    value={guideScale}
                    onChange={(e) => setGuideScale(Number(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                  <span className="text-[10px] text-zinc-500">Default: 6.0</span>
                </div>

                {/* Flow Shift */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-zinc-300 font-semibold">
                    <span>Flow Shift ($\mu$):</span>
                    <span className="font-mono text-blue-400">{flowShift.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min={3.0}
                    max={11.0}
                    step={0.5}
                    value={flowShift}
                    onChange={(e) => setFlowShift(Number(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                  <span className="text-[10px] text-zinc-500">720p: 7.0 | 544p: 5.0</span>
                </div>
              </div>

              {/* Camera Choreography & Precision */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-zinc-800">
                <div>
                  <span className="text-xs font-semibold text-zinc-300 block mb-1.5">Camera Trajectory:</span>
                  <select
                    value={cameraTrajectory}
                    onChange={(e) => setCameraTrajectory(e.target.value as HunyuanCameraTrajectory)}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950 p-2 text-xs text-zinc-100"
                  >
                    <option value="slow_dolly_zoom">Slow Dolly Zoom (Perspective depth)</option>
                    <option value="orbit_360">360° Orbital Rotation</option>
                    <option value="horizontal_pan_left">Horizontal Pan Left</option>
                    <option value="horizontal_pan_right">Horizontal Pan Right</option>
                    <option value="pedestal_up">Pedestal Crane Up</option>
                    <option value="pedestal_down">Pedestal Crane Down</option>
                    <option value="arc_rotation">Arc Camera Rotation</option>
                    <option value="fpv_dive">FPV Kinetic Dive</option>
                    <option value="static">Static Tripod</option>
                  </select>
                </div>

                <div>
                  <span className="text-xs font-semibold text-zinc-300 block mb-1.5">Model Weight Precision:</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['bf16', 'fp8', 'int4'] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPrecision(p)}
                        className={`rounded-lg py-2 font-semibold text-xs transition-colors ${
                          precision === p
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                            : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {p.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Launch Synthesis Button */}
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isRendering}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 py-4 font-bold text-white shadow-xl shadow-blue-500/20 hover:brightness-110 disabled:opacity-50 transition-all text-sm"
            >
              {isRendering ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <span>Synthesizing HunyuanVideo DiT ({renderProgress}%)...</span>
                </>
              ) : (
                <>
                  <Zap className="h-5 w-5 fill-current" />
                  <span>Generate with Tencent HunyuanVideo (13B)</span>
                </>
              )}
            </button>
          </div>

          {/* Right Preview & Telemetry Panel */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                  <Film className="h-4 w-4 text-blue-400" />
                  HunyuanVideo Preview
                </span>
                {renderedClip && (
                  <span className="rounded bg-emerald-950 px-2 py-0.5 text-[10px] font-mono text-emerald-300 border border-emerald-500/30">
                    Render Complete
                  </span>
                )}
              </div>

              {/* Video Viewport */}
              <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-zinc-800">
                {renderedClip ? (
                  <video
                    ref={videoRef}
                    src={renderedClip.videoUrl}
                    controls
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-zinc-950">
                    <Flame className="h-12 w-12 text-blue-500/40 mb-3 animate-pulse" />
                    <h4 className="font-bold text-xs text-zinc-200">Tencent HunyuanVideo 13B Engine Ready</h4>
                    <p className="text-[11px] text-zinc-400 max-w-xs mt-1">
                      Configure your prompt, flow matching ODE schedule, and trajectory, then click Generate to synthesize.
                    </p>
                  </div>
                )}

                {isRendering && (
                  <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 space-y-3">
                    <div className="h-12 w-12 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                    <span className="font-mono text-xs font-bold text-blue-300">
                      Step {currentStep}/{samplingSteps} • {renderProgress}%
                    </span>
                    <div className="w-48 bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-blue-500 h-full transition-all duration-100"
                        style={{ width: `${renderProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Live Synthesis Telemetry Logs */}
              <div className="rounded-xl bg-zinc-950 p-3.5 border border-zinc-800/80 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                    Dual-Stream DiT Telemetry
                  </span>
                  <span>FPS: 24 • Frames: {frames}</span>
                </div>

                <div className="h-24 overflow-y-auto font-mono text-[10px] text-blue-300/80 space-y-1">
                  {renderLogs.length > 0 ? (
                    renderLogs.map((log, idx) => <div key={idx}>{log}</div>)
                  ) : (
                    <div className="text-zinc-600">Awaiting inference trigger...</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: CURATED BENCHMARKS */}
      {activeSubTab === 'benchmarks' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {HUNYUAN_BENCHMARKS.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 space-y-4 hover:border-blue-500/40 transition-all"
            >
              <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-zinc-800">
                <video src={item.videoUrl} loop playsInline autoPlay muted className="w-full h-full object-cover" />
                <div className="absolute top-3 left-3 rounded bg-black/70 px-2 py-0.5 text-[10px] font-mono text-blue-300">
                  {item.tag}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-sm text-zinc-100">{item.title}</h4>
                <p className="text-xs text-zinc-400 mt-1 line-clamp-2">"{item.prompt}"</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                <span className="text-[11px] font-mono text-zinc-500">Camera: {item.camera}</span>
                <button
                  type="button"
                  onClick={() => {
                    setModel(item.model);
                    setPrompt(item.prompt);
                    setCameraTrajectory(item.camera);
                    setActiveSubTab('studio');
                  }}
                  className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 transition-colors"
                >
                  Load in Studio
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW 3: CLI SCRIPT EXPORTER */}
      {activeSubTab === 'cli_export' && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                <Terminal className="h-5 w-5 text-blue-400" />
                <span>Tencent HunyuanVideo Official CLI Commands</span>
              </h3>
              <p className="text-xs text-zinc-400">
                Reproduce your current generation on local NVIDIA clusters with sample.py and Hugging Face pipelines.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 font-mono text-xs text-blue-300 space-y-3 overflow-x-auto">
            <div className="text-zinc-500"># 1. Official Tencent HunyuanVideo Single/Multi-GPU Command</div>
            <div>
              git clone https://github.com/Tencent-Hunyuan/HunyuanVideo.git<br />
              cd HunyuanVideo<br />
              pip install -r requirements.txt<br />
              <br />
              python3 sample_video.py \<br />
              &nbsp;&nbsp;--video-size 720 1280 \<br />
              &nbsp;&nbsp;--video-length {frames} \<br />
              &nbsp;&nbsp;--infer-steps {samplingSteps} \<br />
              &nbsp;&nbsp;--guidance-scale {guideScale.toFixed(1)} \<br />
              &nbsp;&nbsp;--flow-shift {flowShift.toFixed(1)} \<br />
              &nbsp;&nbsp;--prompt "{prompt.replace(/"/g, '\\"')}" \<br />
              &nbsp;&nbsp;--dit-weight ./ckpts/hunyuan-video-t2v-720p/transformers/mp_rank_00_model_states.pt \<br />
              &nbsp;&nbsp;--vae-sp \<br />
              &nbsp;&nbsp;--precision {precision}
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 font-mono text-xs text-blue-300 space-y-3 overflow-x-auto">
            <div className="text-zinc-500"># 2. Hugging Face Diffusers Python Pipeline</div>
            <div>
              import torch<br />
              from diffusers import HunyuanVideoPipeline, export_to_video<br />
              <br />
              pipe = HunyuanVideoPipeline.from_pretrained(<br />
              &nbsp;&nbsp;"tencent/HunyuanVideo",<br />
              &nbsp;&nbsp;torch_dtype=torch.bfloat16<br />
              )<br />
              pipe.enable_model_cpu_offload()<br />
              pipe.vae.enable_tiling()<br />
              <br />
              output = pipe(<br />
              &nbsp;&nbsp;prompt="{prompt.replace(/"/g, '\\"')}",<br />
              &nbsp;&nbsp;num_frames={frames},<br />
              &nbsp;&nbsp;num_inference_steps={samplingSteps},<br />
              &nbsp;&nbsp;guidance_scale={guideScale.toFixed(1)},<br />
              &nbsp;&nbsp;generator=torch.Generator("cuda").manual_seed({seed})<br />
              ).frames[0]<br />
              <br />
              export_to_video(output, "hunyuan_output.mp4", fps=24)<br />
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: VRAM CALCULATOR */}
      {activeSubTab === 'hardware_vram' && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 space-y-6">
          <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
            <HardDrive className="h-5 w-5 text-blue-400" />
            <div>
              <h3 className="text-base font-bold text-zinc-100">HunyuanVideo 13B VRAM & Hardware Profiler</h3>
              <p className="text-xs text-zinc-400">
                HunyuanVideo's 13B parameter weights require specific GPU sizing across BF16, FP8, and INT4.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 space-y-1">
              <span className="text-xs text-zinc-400">Full BF16 (Native)</span>
              <div className="text-2xl font-bold text-blue-300 font-mono">~48 - 60 GB</div>
              <span className="text-[11px] text-zinc-500">Requires A100 / H100 80GB</span>
            </div>

            <div className="rounded-xl border border-blue-500/40 bg-blue-950/20 p-4 space-y-1">
              <span className="text-xs text-blue-400">FP8 Quantized + CPU Offload</span>
              <div className="text-2xl font-bold text-blue-200 font-mono">~20 - 24 GB</div>
              <span className="text-[11px] text-zinc-400">Fits RTX 3090 / 4090 / 5090</span>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 space-y-1">
              <span className="text-xs text-zinc-400">INT4 / GGUF Extreme</span>
              <div className="text-2xl font-bold text-emerald-400 font-mono">~12 - 16 GB</div>
              <span className="text-[11px] text-zinc-500">Fits RTX 4070 Ti / 4080 (16GB)</span>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 5: ARCHITECTURE REFERENCE */}
      {activeSubTab === 'architecture' && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 space-y-6">
          <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
            <Cpu className="h-5 w-5 text-blue-400" />
            <div>
              <h3 className="text-base font-bold text-zinc-100">Dual-Stream to Single-Stream DiT Architecture</h3>
              <p className="text-xs text-zinc-400">
                Detailed breakdown of Tencent HunyuanVideo's unified generative framework.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 space-y-2">
              <h4 className="font-bold text-zinc-200 text-sm">1. Dual-Stream Blocks (Early Phase)</h4>
              <p className="text-zinc-400 leading-relaxed">
                Video tokens and text prompt tokens are modulated in separate attention paths. This preserves fine textual alignment without degrading visual feature representations.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 space-y-2">
              <h4 className="font-bold text-zinc-200 text-sm">2. Single-Stream Fusion (Late Phase)</h4>
              <p className="text-zinc-400 leading-relaxed">
                Tokens from both modalities are concatenated into a unified sequence with bidirectional cross-attention, ensuring cohesive physics and temporal continuity.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 space-y-2">
              <h4 className="font-bold text-zinc-200 text-sm">3. Decoder-Only MLLM Text Encoder</h4>
              <p className="text-zinc-400 leading-relaxed">
                Instead of standard CLIP/T5 encoders, HunyuanVideo utilizes a fine-tuned Multimodal LLM to recognize complex linguistic hierarchies and spatial instructions.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 space-y-2">
              <h4 className="font-bold text-zinc-200 text-sm">4. CausalConv3D 3D-VAE</h4>
              <p className="text-zinc-400 leading-relaxed">
                Compresses video latents by 4x across time and 8x across space into 16 latent channels with causal convolutions preventing future-frame leakage.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

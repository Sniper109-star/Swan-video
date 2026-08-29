import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Play,
  Square,
  Upload,
  Tv,
  Smartphone,
  Sliders,
  Camera,
  Music,
  Film,
  Zap,
  RefreshCw,
  Eye,
  CheckCircle2,
  Compass,
} from 'lucide-react';
import { AspectRatio, Resolution, VideoClip } from '../types';
import {
  detectThemeFromPrompt,
  renderProceduralFrame,
  CameraParams,
} from '../utils/proceduralVideoEngine';
import { exportCanvasVideo } from '../utils/videoRecorder';
import { BackgroundMusicSynthesizer } from '../utils/audioSynth';
import { AUDIO_TRACK_OPTIONS } from '../data/avatars';

interface ProceduralPromptStudioProps {
  onVideoRendered: (clip: VideoClip) => void;
  aspectRatio: AspectRatio;
  setAspectRatio: (ar: AspectRatio) => void;
  resolution: Resolution;
  setResolution: (res: Resolution) => void;
  initialPrompt?: string;
  onOpenTemplates: () => void;
}

const THEME_OPTIONS = [
  { id: 'auto', name: 'Auto-Detect from Prompt', desc: 'Analyzes prompt keywords automatically' },
  { id: 'cyberpunk_city', name: 'Cyberpunk Metropolis', desc: 'Neon skyscrapers, holographic signs, volumetric rain' },
  { id: 'space_galaxy', name: 'Deep Space & Exoplanet', desc: 'Cosmic nebula, ringed planet, warp starfield' },
  { id: 'ocean_sunset', name: 'Ocean Sunset & Mountains', desc: 'Golden hour waves, sun glare, rolling mountains' },
  { id: 'quantum_core', name: 'Quantum Energy Vortex', desc: 'Swirling particle filaments, plasma core sphere' },
  { id: 'synthwave_grid', name: '80s Retro Synthwave Grid', desc: 'Wireframe laser mountains, neon segmented sun' },
  { id: 'enchanted_forest', name: 'Enchanted Mystical Forest', desc: 'God rays, bioluminescent spores, ancient trees' },
  { id: 'data_tunnel', name: 'Hyper-Speed Data Tunnel', desc: 'Hexagonal cyber tunnels rushing at hyperspeed' },
];

export const ProceduralPromptStudio: React.FC<ProceduralPromptStudioProps> = ({
  onVideoRendered,
  aspectRatio,
  setAspectRatio,
  resolution,
  setResolution,
  initialPrompt = 'Cinematic drone flyover of a futuristic neon cyberpunk city at night with wet reflective streets and flying vehicles',
  onOpenTemplates,
}) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [selectedTheme, setSelectedTheme] = useState('auto');
  const [cameraMotion, setCameraMotion] = useState<CameraParams['motionType']>('dolly_in');
  const [cameraSpeed, setCameraSpeed] = useState(1.0);
  const [cameraShake, setCameraShake] = useState(0.2);
  const [selectedAudioTrack, setSelectedAudioTrack] = useState('synthwave');
  const [clipDurationSec, setClipDurationSec] = useState(8);

  // Image Upload for Image-to-Video
  const [startingImageImg, setStartingImageImg] = useState<HTMLImageElement | null>(null);
  const [startingImageUrl, setStartingImageUrl] = useState<string | null>(null);

  // Render status
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [renderStatusMsg, setRenderStatusMsg] = useState('');
  const [isPlayingPreview, setIsPlayingPreview] = useState(true);

  // Canvas & Audio Refs
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const musicSynthRef = useRef<BackgroundMusicSynthesizer>(new BackgroundMusicSynthesizer());

  // 60FPS Live Preview Canvas Loop
  useEffect(() => {
    let startTime = performance.now();

    const renderLoop = () => {
      const now = performance.now();
      const timeSec = (now - startTime) / 1000;

      if (previewCanvasRef.current && isPlayingPreview) {
        const canvas = previewCanvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const effectiveTheme =
            selectedTheme === 'auto' ? detectThemeFromPrompt(prompt) : selectedTheme;

          renderProceduralFrame(
            ctx,
            canvas.width,
            canvas.height,
            timeSec,
            effectiveTheme,
            prompt,
            {
              motionType: cameraMotion,
              speed: cameraSpeed,
              zoom: 1.0,
              shake: cameraShake,
            },
            startingImageImg
          );
        }
      }

      animationFrameRef.current = requestAnimationFrame(renderLoop);
    };

    animationFrameRef.current = requestAnimationFrame(renderLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [prompt, selectedTheme, cameraMotion, cameraSpeed, cameraShake, startingImageImg, isPlayingPreview]);

  // Handle Starting Image Upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      setStartingImageUrl(url);
      const img = new Image();
      img.onload = () => {
        setStartingImageImg(img);
      };
      img.src = url;
    };
    reader.readAsDataURL(file);
  };

  // Enhance Prompt via lightweight LLM call (Gemini 3.7 Flash)
  const [isEnhancingPrompt, setIsEnhancingPrompt] = useState(false);
  const [prevProceduralPrompt, setPrevProceduralPrompt] = useState<string | null>(null);

  const enhancePrompt = async () => {
    if (!prompt.trim()) return;
    setPrevProceduralPrompt(prompt);
    setIsEnhancingPrompt(true);

    try {
      const res = await fetch('/api/enhance-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawPrompt: prompt,
          cameraStyle: cameraMotion,
          aspectRatio,
          mood: selectedTheme !== 'auto' ? selectedTheme : 'Cinematic realism',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.enhancedPrompt) {
          setPrompt(data.enhancedPrompt);
          return;
        }
      }
      // Fallback
      const enhancements = [
        'shot on 35mm anamorphic lens, 8k hyper-detailed resolution, cinematic volumetric haze, unreal engine 5 render, global illumination, raytraced reflections',
        'award-winning cinematography, golden hour atmospheric mist, depth of field, delicate particle physics, ultra-realistic motion flow',
        'masterpiece, volumetric god rays piercing through dense fog, photorealistic texture grading, 60fps fluid cinematic motion',
      ];
      const picked = enhancements[Math.floor(Math.random() * enhancements.length)];
      if (!prompt.includes(picked.slice(0, 15))) {
        setPrompt((prev) => `${prev.trim()}, ${picked}`);
      }
    } catch {
      const enhancements = [
        'shot on 35mm anamorphic lens, 8k hyper-detailed resolution, cinematic volumetric haze, unreal engine 5 render, global illumination, raytraced reflections',
        'award-winning cinematography, golden hour atmospheric mist, depth of field, delicate particle physics, ultra-realistic motion flow',
      ];
      const picked = enhancements[Math.floor(Math.random() * enhancements.length)];
      setPrompt((prev) => `${prev.trim()}, ${picked}`);
    } finally {
      setIsEnhancingPrompt(false);
    }
  };

  // Render & Export MP4 Video Clip
  const handleRenderVideo = async () => {
    if (isRendering) return;
    setIsRendering(true);
    setRenderProgress(5);
    setRenderStatusMsg('Configuring high-resolution video frame buffer...');

    const canvasW = aspectRatio === '9:16' ? 720 : 1280;
    const canvasH = aspectRatio === '9:16' ? 1280 : 720;

    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = canvasW;
    offscreenCanvas.height = canvasH;
    const offCtx = offscreenCanvas.getContext('2d');

    if (!offCtx) {
      setIsRendering(false);
      return;
    }

    // Start background music synthesis into destination stream
    let audioStream: MediaStream | null = null;
    if (selectedAudioTrack !== 'none') {
      const synthDest = musicSynthRef.current.startTrack(selectedAudioTrack, clipDurationSec);
      audioStream = synthDest.stream;
    }

    setRenderStatusMsg(`Rendering 60FPS cinematic motion frames (${aspectRatio})...`);

    const effectiveTheme =
      selectedTheme === 'auto' ? detectThemeFromPrompt(prompt) : selectedTheme;

    let animId: number;
    const renderStartTime = performance.now();

    const drawFrame = () => {
      const elapsed = (performance.now() - renderStartTime) / 1000;

      renderProceduralFrame(
        offCtx,
        canvasW,
        canvasH,
        elapsed,
        effectiveTheme,
        prompt,
        {
          motionType: cameraMotion,
          speed: cameraSpeed,
          zoom: 1.0,
          shake: cameraShake,
        },
        startingImageImg
      );

      if (elapsed < clipDurationSec) {
        animId = requestAnimationFrame(drawFrame);
      }
    };

    animId = requestAnimationFrame(drawFrame);

    try {
      const result = await exportCanvasVideo({
        canvas: offscreenCanvas,
        audioStream,
        durationSec: clipDurationSec,
        fps: 30,
        onProgress: (pct, frame, total) => {
          setRenderProgress(pct);
          setRenderStatusMsg(`Encoding frame ${frame} / ${total}...`);
        },
      });

      musicSynthRef.current.stop();
      cancelAnimationFrame(animId);

      const newClip: VideoClip = {
        id: `clip_${Date.now()}`,
        title: prompt.slice(0, 32) + '...',
        operationName: `procedural_${Date.now()}`,
        prompt,
        aspectRatio,
        resolution,
        createdAt: Date.now(),
        videoUrl: result.url,
        model: 'Neural-Procedural-60FPS',
        engine: 'local_prompt',
        durationSeconds: clipDurationSec,
        audioTrackName: AUDIO_TRACK_OPTIONS.find((a) => a.id === selectedAudioTrack)?.name,
      };

      onVideoRendered(newClip);
      setRenderStatusMsg('Render Complete!');
      setRenderProgress(100);
      setTimeout(() => {
        setIsRendering(false);
      }, 1000);
    } catch (err) {
      console.error('Video rendering failed:', err);
      setIsRendering(false);
      alert('Video encoding failed.');
    }
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
      {/* Left Column: Live 60FPS Video Preview Canvas & Export */}
      <div className="lg:col-span-6 space-y-6">
        <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl">
          {/* Canvas Top Bar */}
          <div className="flex items-center justify-between border-b border-zinc-800/80 bg-zinc-900/80 px-4 py-2.5 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span className="text-xs font-bold text-zinc-200">Neural Scene Canvas</span>
              <span className="rounded bg-cyan-950/80 px-2 py-0.5 text-[10px] font-mono font-semibold text-cyan-300 border border-cyan-500/30">
                Live 60 FPS
              </span>
            </div>

            {/* Aspect Ratio Switcher */}
            <div className="flex items-center rounded-lg bg-zinc-950 p-0.5 border border-zinc-800">
              <button
                type="button"
                onClick={() => setAspectRatio('16:9')}
                className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                  aspectRatio === '16:9'
                    ? 'bg-zinc-800 text-cyan-300 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Tv className="h-3 w-3" />
                <span>16:9</span>
              </button>
              <button
                type="button"
                onClick={() => setAspectRatio('9:16')}
                className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                  aspectRatio === '9:16'
                    ? 'bg-zinc-800 text-cyan-300 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Smartphone className="h-3 w-3" />
                <span>9:16</span>
              </button>
            </div>
          </div>

          {/* Canvas Element */}
          <div className="relative flex items-center justify-center bg-black p-3">
            <canvas
              ref={previewCanvasRef}
              width={aspectRatio === '9:16' ? 540 : 800}
              height={aspectRatio === '9:16' ? 960 : 450}
              className={`rounded-xl shadow-inner border border-zinc-800/60 object-contain ${
                aspectRatio === '9:16'
                  ? 'h-[440px] w-auto aspect-[9/16]'
                  : 'w-full aspect-video max-h-[440px]'
              }`}
            />
          </div>

          {/* Quick Preview Toolbar */}
          <div className="flex items-center justify-between border-t border-zinc-800/80 bg-zinc-900/90 px-4 py-2.5 text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPlayingPreview(!isPlayingPreview)}
                className="flex items-center gap-1 text-zinc-300 hover:text-white"
              >
                {isPlayingPreview ? <Square className="h-3 w-3" /> : <Play className="h-3 w-3 fill-current" />}
                <span>{isPlayingPreview ? 'Pause Preview' : 'Play Preview'}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono">{clipDurationSec}s Duration</span>
              <span>•</span>
              <span className="font-mono">{resolution}</span>
            </div>
          </div>
        </div>

        {/* Render Video CTA Card */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-zinc-100 text-sm flex items-center gap-2">
                <Zap className="h-4 w-4 text-cyan-400" />
                <span>Generate Video Clip (Zero API Key)</span>
              </h4>
              <p className="text-xs text-zinc-400 mt-0.5">
                Encodes high-definition video directly in your browser with cinematic motion and music.
              </p>
            </div>

            <button
              type="button"
              onClick={handleRenderVideo}
              disabled={isRendering || !prompt.trim()}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-sm font-bold text-black shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Film className="h-4 w-4" />
              <span>{isRendering ? 'Rendering Video...' : 'Render MP4 Clip'}</span>
            </button>
          </div>

          {/* Render Progress Bar */}
          {isRendering && (
            <div className="mt-4 pt-4 border-t border-zinc-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-cyan-300 font-mono">{renderStatusMsg}</span>
                <span className="font-bold text-zinc-300 font-mono">{renderProgress}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300 rounded-full"
                  style={{ width: `${renderProgress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Prompt Input, Director Controls, Image Animator, & Soundtrack */}
      <div className="lg:col-span-6 space-y-6">
        {/* 1. Prompt Input & AI Enhancer */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-zinc-100 text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <span>Prompt Description</span>
            </h3>

            <div className="flex items-center gap-2">
              {prevProceduralPrompt && (
                <button
                  type="button"
                  onClick={() => {
                    const curr = prompt;
                    setPrompt(prevProceduralPrompt);
                    setPrevProceduralPrompt(curr);
                  }}
                  className="rounded-md bg-zinc-800 px-2 py-1 text-xs font-medium text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
                >
                  Undo
                </button>
              )}

              <button
                type="button"
                onClick={enhancePrompt}
                disabled={isEnhancingPrompt || !prompt.trim()}
                className="flex items-center gap-1 rounded-md bg-cyan-950/60 px-2.5 py-1 text-xs font-semibold text-cyan-300 border border-cyan-500/30 hover:bg-cyan-900/60 disabled:opacity-50 transition-colors"
              >
                <Sparkles className={`h-3 w-3 ${isEnhancingPrompt ? 'animate-spin' : ''}`} />
                <span>{isEnhancingPrompt ? 'Enhancing...' : 'Enhance Prompt'}</span>
              </button>

              <button
                type="button"
                onClick={onOpenTemplates}
                className="rounded-md bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
              >
                Inspirations
              </button>
            </div>
          </div>

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your scene in detail (e.g., Cyberpunk neon metropolis in the rain with flying cars)..."
            rows={3}
            className="w-full rounded-xl border border-zinc-700/80 bg-zinc-950/90 p-3.5 text-xs text-zinc-100 placeholder-zinc-500 outline-none focus:border-cyan-500 transition-colors leading-relaxed resize-none"
          />

          {/* Theme Selector */}
          <div>
            <label className="text-xs text-zinc-400 block mb-1.5 font-medium">
              Procedural Visual Theme:
            </label>
            <select
              value={selectedTheme}
              onChange={(e) => setSelectedTheme(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200 outline-none focus:border-cyan-500"
            >
              {THEME_OPTIONS.map((th) => (
                <option key={th.id} value={th.id}>
                  {th.name} ({th.desc})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 2. Image-to-Video Starting Frame */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-zinc-100 text-sm flex items-center gap-2">
              <Upload className="h-4 w-4 text-cyan-400" />
              <span>Image-to-Video (Animate Photo)</span>
            </h3>
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300"
            >
              Select Image
            </button>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>

          {startingImageUrl ? (
            <div className="flex items-center justify-between rounded-xl border border-cyan-500/40 bg-cyan-950/20 p-3">
              <div className="flex items-center gap-3">
                <img
                  src={startingImageUrl}
                  alt="Starting Frame"
                  className="h-12 w-12 rounded-lg object-cover border border-cyan-500"
                />
                <div>
                  <span className="text-xs font-bold text-cyan-300">Starting Photo Active</span>
                  <p className="text-[11px] text-zinc-400">2.5D parallax camera motion & lighting sweep applied</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setStartingImageImg(null);
                  setStartingImageUrl(null);
                }}
                className="text-xs text-rose-400 hover:text-rose-300"
              >
                Remove
              </button>
            </div>
          ) : (
            <div
              onClick={() => imageInputRef.current?.click()}
              className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 bg-zinc-950/40 p-4 text-center hover:border-zinc-700 transition-colors"
            >
              <Upload className="h-6 w-6 text-zinc-500 mb-1" />
              <span className="text-xs font-medium text-zinc-300">Drop starting photo here to animate</span>
              <span className="text-[11px] text-zinc-500">Supports PNG, JPG, WebP</span>
            </div>
          )}
        </div>

        {/* 3. Camera Directing & Soundtrack Controls */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 shadow-xl space-y-4">
          <h3 className="font-bold text-zinc-100 text-sm flex items-center gap-2">
            <Compass className="h-4 w-4 text-cyan-400" />
            <span>Cinematic Camera & Soundtrack</span>
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Camera Motion */}
            <div>
              <label className="text-xs text-zinc-400 block mb-1.5 font-medium">Camera Motion:</label>
              <select
                value={cameraMotion}
                onChange={(e) => setCameraMotion(e.target.value as any)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200 outline-none focus:border-cyan-500"
              >
                <option value="dolly_in">Dolly Push-In (Forward)</option>
                <option value="dolly_out">Dolly Pull-Back</option>
                <option value="orbit_360">Orbit 360° Rotation</option>
                <option value="drone_flyover">Drone Flyover</option>
                <option value="fpv_dynamic">FPV Dynamic Skim</option>
                <option value="pan_tilt">Cinematic Pan & Tilt</option>
              </select>
            </div>

            {/* Soundtrack */}
            <div>
              <label className="text-xs text-zinc-400 block mb-1.5 font-medium">Background Music:</label>
              <select
                value={selectedAudioTrack}
                onChange={(e) => setSelectedAudioTrack(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200 outline-none focus:border-cyan-500"
              >
                {AUDIO_TRACK_OPTIONS.map((track) => (
                  <option key={track.id} value={track.id}>
                    {track.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sliders: Duration & Motion Speed */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2 border-t border-zinc-800">
            <div>
              <div className="flex justify-between text-xs text-zinc-400 mb-1">
                <span>Clip Duration:</span>
                <span className="font-mono text-cyan-400">{clipDurationSec} seconds</span>
              </div>
              <input
                type="range"
                min="4"
                max="20"
                step="1"
                value={clipDurationSec}
                onChange={(e) => setClipDurationSec(parseInt(e.target.value))}
                className="w-full accent-cyan-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-zinc-400 mb-1">
                <span>Motion Speed:</span>
                <span className="font-mono text-cyan-400">{cameraSpeed}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.5"
                step="0.1"
                value={cameraSpeed}
                onChange={(e) => setCameraSpeed(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

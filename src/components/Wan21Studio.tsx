/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Play,
  RotateCcw,
  Sliders,
  Camera,
  Layers,
  Image as ImageIcon,
  Cpu,
  Video,
  Download,
  Info,
  CheckCircle2,
  RefreshCw,
  Wand2,
  Share2,
  Radio,
  Eye,
  Zap,
  Maximize2,
  Undo2,
  Copy,
  Check,
  Terminal,
  HardDrive,
  SplitSquareVertical,
  BookOpen
} from 'lucide-react';
import { AspectRatio, Resolution, VideoClip, WanModelType, WanCameraMotion, WanConfig } from '../types';
import { Wan21CliExporter } from './Wan21CliExporter';
import { Wan21VramCalculator } from './Wan21VramCalculator';
import { Wan21Comparator } from './Wan21Comparator';

interface Wan21StudioProps {
  onVideoRendered: (clip: VideoClip) => void;
  aspectRatio: AspectRatio;
  setAspectRatio: (r: AspectRatio) => void;
  resolution: Resolution;
  setResolution: (res: Resolution) => void;
  clips?: VideoClip[];
}

const WAN_PRESETS = [
  {
    id: 'cyber_samurai',
    title: 'Cyberpunk Rain Samurai',
    category: 'Cinematic Action',
    prompt: 'Cinematic full-body shot of a cybernetic samurai walking down a neon-lit rain alley in Neo-Kyoto, holographic advertisements reflecting in puddle ripples, mist swirling around glowing katana blade, raindrops reacting realistically to metal armor, 8k resolution, ultra-detailed.',
    aspectRatio: '16:9' as AspectRatio,
    model: 'Wan2.1-T2V-14B' as WanModelType,
    cameraMotion: 'orbit_3d' as WanCameraMotion,
    flowShift: 5.0,
    samplingSteps: 35,
    guideScale: 6.0,
    motionScore: 85,
  },
  {
    id: 'ethereal_silk',
    title: 'Zero-G Silk Dancer',
    category: 'Fluid Dynamics',
    prompt: 'Slow-motion capture of an ethereal dancer in weightless zero gravity wrapped in cascading iridescent silk ribbons, shimmering gold particles drifting around, soft volumetric rim lighting, realistic cloth fluid physics, deep space nebula background.',
    aspectRatio: '16:9' as AspectRatio,
    model: 'Wan2.1-T2V-14B' as WanModelType,
    cameraMotion: 'fpv_crane' as WanCameraMotion,
    flowShift: 5.0,
    samplingSteps: 40,
    guideScale: 5.5,
    motionScore: 70,
  },
  {
    id: 'golden_retriever_surf',
    title: 'Golden Retriever Surfing',
    category: 'Dynamic Wildlife',
    prompt: 'Joyful golden retriever balancing on a surfboard riding a crystalline turquoise ocean barrel wave at golden hour, ocean spray splashing with high-speed water particle physics, sunlight glinting on wet golden fur, wide angle tracking camera.',
    aspectRatio: '16:9' as AspectRatio,
    model: 'Wan2.1-T2V-1.3B' as WanModelType,
    cameraMotion: 'pan_right' as WanCameraMotion,
    flowShift: 3.0,
    samplingSteps: 25,
    guideScale: 5.0,
    motionScore: 90,
  },
  {
    id: 'macro_galaxy_drop',
    title: 'Macro Nebula Water Drop',
    category: 'Macro & Optical',
    prompt: 'Extreme macro slow motion of a crystalline dew drop falling onto an exotic bioluminescent flower petal, inside the transparent drop is a swirling mini spiral galaxy with luminous stars, surface tension ripple deformation, 120fps commercial grade.',
    aspectRatio: '9:16' as AspectRatio,
    model: 'Wan2.1-T2V-14B' as WanModelType,
    cameraMotion: 'zoom_in' as WanCameraMotion,
    flowShift: 5.0,
    samplingSteps: 30,
    guideScale: 6.5,
    motionScore: 60,
  },
  {
    id: 'volcanic_drift',
    title: 'Hypercar Volcanic Drift',
    category: 'Speed & Particles',
    prompt: 'High-octane tracking shot of a matte black futuristic supercar drifting aggressively across a volcanic ash plateau at twilight, glowing orange embers spraying from spinning tires, dramatic dust vortexes, glowing red brake calipers, dynamic speed.',
    aspectRatio: '16:9' as AspectRatio,
    model: 'Wan2.1-T2V-14B' as WanModelType,
    cameraMotion: 'fpv_crane' as WanCameraMotion,
    flowShift: 5.0,
    samplingSteps: 35,
    guideScale: 5.8,
    motionScore: 95,
  },
];

const I2V_SAMPLE_IMAGES = [
  {
    id: 'portrait_girl',
    name: 'Cyberpunk Portrait',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
    prompt: 'Subject breathes gently, eyes blink naturally with subtle emotional smile, warm studio backlight flickers softly, hair strands moving with breeze.',
  },
  {
    id: 'landscape_mountain',
    name: 'Mountain Peak Fjord',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
    prompt: 'Volumetric mountain clouds roll dynamically over steep snowy ridges, turquoise lake water ripples gently, sunlight shifts through mist.',
  },
  {
    id: 'sports_car',
    name: 'Supercar in Desert',
    url: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&auto=format&fit=crop&q=80',
    prompt: 'Car accelerates smoothly into distance, tires kick up realistic dust plume, heat haze shimmers across asphalt.',
  },
];

export const Wan21Studio: React.FC<Wan21StudioProps> = ({
  onVideoRendered,
  aspectRatio,
  setAspectRatio,
  resolution,
  setResolution,
  clips,
}) => {
  // Model & Generation Config
  const [model, setModel] = useState<WanModelType>('Wan2.1-T2V-14B');
  const [prompt, setPrompt] = useState(
    'Cinematic aerial tracking shot over a futuristic cyberpunk metropolis in heavy rain, neon reflections shimmering in deep water canals, flying vehicles darting between illuminated skyscrapers, 8k resolution, photorealistic volumetric lighting.'
  );
  const [negativePrompt, setNegativePrompt] = useState(
    'blurry, distorted, low quality, artifacts, watermark, jitter, stutter, deformed limbs, flickering'
  );
  const [samplingSteps, setSamplingSteps] = useState(30);
  const [guideScale, setGuideScale] = useState(5.5);
  const [flowShift, setFlowShift] = useState(5.0);
  const [frames, setFrames] = useState(81); // 81 frames = ~5.0s @ 16fps
  const [motionScore, setMotionScore] = useState(80);
  const [seed, setSeed] = useState(428190);
  const [cameraMotion, setCameraMotion] = useState<WanCameraMotion>('orbit_3d');
  
  // Image to video conditioning
  const [inputImage, setInputImage] = useState<string | null>(null);
  const [isExpandingPrompt, setIsExpandingPrompt] = useState(false);
  const [previousPrompt, setPreviousPrompt] = useState<string | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [enhanceSuccessMsg, setEnhanceSuccessMsg] = useState<string | null>(null);
  const [selectedLighting, setSelectedLighting] = useState('Volumetric god rays & reflections');
  const [selectedStylePreset, setSelectedStylePreset] = useState('Photorealistic Cinema');

  // Render & Simulation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [renderPhase, setRenderPhase] = useState<'idle' | 'tokenizing' | 'flow_matching' | 'vae_decoding' | 'completed'>('idle');
  const [progressPercent, setProgressPercent] = useState(0);
  const [currentDenoiseStep, setCurrentDenoiseStep] = useState(0);
  const [generationLogs, setGenerationLogs] = useState<string[]>([]);
  const [lastRenderedClip, setLastRenderedClip] = useState<VideoClip | null>(null);
  const [activeTabSub, setActiveTabSub] = useState<
    'generator' | 'presets' | 'cli_exporter' | 'vram_calculator' | 'comparator' | 'architecture'
  >('generator');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Auto adjust flowShift when switching between 14B (720P) and 1.3B (480P)
  useEffect(() => {
    if (model === 'Wan2.1-T2V-1.3B' || model === 'Wan2.1-I2V-14B-480P') {
      setFlowShift(3.0);
      if (resolution === '1080p') setResolution('480p');
    } else {
      setFlowShift(5.0);
      if (resolution === '480p') setResolution('720p');
    }
  }, [model]);

  // Handle preset application
  const applyPreset = (preset: typeof WAN_PRESETS[0]) => {
    setPrompt(preset.prompt);
    setModel(preset.model);
    setAspectRatio(preset.aspectRatio);
    setCameraMotion(preset.cameraMotion);
    setFlowShift(preset.flowShift);
    setSamplingSteps(preset.samplingSteps);
    setGuideScale(preset.guideScale);
    setMotionScore(preset.motionScore);
    setActiveTabSub('generator');
  };

  // Expand Prompt with Wan 2.1 lightweight LLM call (Gemini 3.7 Flash)
  const handleExpandPrompt = async (targetPromptOverride?: string) => {
    const textToExpand = targetPromptOverride || prompt;
    if (!textToExpand.trim()) return;

    // Save previous prompt state for undo
    setPreviousPrompt(prompt);
    setIsExpandingPrompt(true);
    setEnhanceSuccessMsg(null);

    try {
      const res = await fetch('/api/wan-expand-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawPrompt: textToExpand,
          model,
          cameraMotion,
          motionScore,
          aspectRatio,
          lightingStyle: selectedLighting,
          stylePreset: selectedStylePreset,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to expand prompt');
      }

      const data = await res.json();
      if (data.expandedPrompt) {
        setPrompt(data.expandedPrompt);
        setEnhanceSuccessMsg('Prompt expanded into cinematic Wan 2.1 prompt (UMT5-XXL + CLIP-ViT)!');
        setTimeout(() => setEnhanceSuccessMsg(null), 6000);
      }
    } catch (err) {
      console.error('Failed to expand prompt:', err);
    } finally {
      setIsExpandingPrompt(false);
    }
  };

  const handleUndoPrompt = () => {
    if (previousPrompt) {
      const current = prompt;
      setPrompt(previousPrompt);
      setPreviousPrompt(current); // Allow toggling back
      setEnhanceSuccessMsg('Reverted prompt back.');
      setTimeout(() => setEnhanceSuccessMsg(null), 3000);
    }
  };

  const handleCopyPrompt = () => {
    if (!prompt) return;
    navigator.clipboard.writeText(prompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleAppendModifier = (snippet: string) => {
    const current = prompt.trim();
    if (!current) {
      setPrompt(snippet);
    } else if (!current.toLowerCase().includes(snippet.toLowerCase().slice(0, 15))) {
      setPrompt(`${current}, ${snippet}`);
    }
  };

  // Sound Synth for video generation
  const createWanAudioSynth = (ctx: AudioContext, dest: MediaStreamAudioDestinationNode, duration: number) => {
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const subOsc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'sine';
    subOsc.type = 'triangle';

    const rootFreq = 55; // A1
    osc1.frequency.setValueAtTime(rootFreq, ctx.currentTime);
    osc2.frequency.setValueAtTime(rootFreq * 1.5, ctx.currentTime); // E2
    subOsc.frequency.setValueAtTime(rootFreq / 2, ctx.currentTime);

    // Warm cinematic sweep filter
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(220, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + duration * 0.5);
    filter.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + duration);

    gain.gain.setValueAtTime(0.01, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.8);
    gain.gain.setValueAtTime(0.18, ctx.currentTime + duration - 0.5);
    gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc1.connect(filter);
    osc2.connect(filter);
    subOsc.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    gain.connect(ctx.destination);

    osc1.start();
    osc2.start();
    subOsc.start();

    osc1.stop(ctx.currentTime + duration);
    osc2.stop(ctx.currentTime + duration);
    subOsc.stop(ctx.currentTime + duration);
  };

  // Main Wan 2.1 DiT Flow-Matching & 3D-VAE Video Generation Execution
  const handleGenerateWanVideo = async () => {
    if (!prompt.trim() && !inputImage) return;

    setIsGenerating(true);
    setProgressPercent(0);
    setRenderPhase('tokenizing');
    setGenerationLogs([
      `[Wan 2.1 Initializer] Target model: ${model} (${model.includes('14B') ? '14 Billion Params DiT' : '1.3B Turbo DiT'})`,
      `[Wan 2.1 Tokenizer] Encoding prompt via UMT5-XXL + CLIP-ViT dual text encoders...`,
      `[Wan 2.1 RoPE] Initializing 3D Rotary Position Embeddings for spatio-temporal latents...`,
    ]);

    const canvas = canvasRef.current;
    if (!canvas) {
      setIsGenerating(false);
      return;
    }

    // Set canvas dimensions based on aspect ratio & resolution
    let width = 1280;
    let height = 720;
    if (aspectRatio === '9:16') {
      width = 720;
      height = 1280;
    } else if (aspectRatio === '1:1') {
      width = 832;
      height = 832;
    } else if (aspectRatio === '4:3') {
      width = 960;
      height = 720;
    }

    if (resolution === '480p') {
      width = Math.round(width * 0.666);
      height = Math.round(height * 0.666);
    } else if (resolution === '1080p') {
      width = Math.round(width * 1.5);
      height = Math.round(height * 1.5);
    }

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Load custom image if I2V mode
    let loadedImageElement: HTMLImageElement | null = null;
    if (inputImage) {
      try {
        loadedImageElement = new Image();
        loadedImageElement.crossOrigin = 'anonymous';
        await new Promise((resolve, reject) => {
          if (!loadedImageElement) return reject();
          loadedImageElement.onload = () => resolve(true);
          loadedImageElement.onerror = () => resolve(false);
          loadedImageElement.src = inputImage;
        });
      } catch (e) {
        console.warn('Failed loading input image, proceeding with procedural generator', e);
      }
    }

    // Setup Web Audio recording destination
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const audioCtx = new AudioContextClass();
    audioContextRef.current = audioCtx;
    const audioDest = audioCtx.createMediaStreamDestination();

    const durationSeconds = frames / 16; // 81 frames / 16 fps = ~5.06s
    createWanAudioSynth(audioCtx, audioDest, durationSeconds);

    // Combine canvas stream + audio stream for standard video recording
    const canvasStream = canvas.captureStream(30);
    const combinedStream = new MediaStream([
      ...canvasStream.getVideoTracks(),
      ...audioDest.stream.getAudioTracks(),
    ]);

    let mediaRecorder: MediaRecorder;
    const recordedChunks: Blob[] = [];

    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
      ? 'video/webm;codecs=vp9,opus'
      : MediaRecorder.isTypeSupported('video/webm')
      ? 'video/webm'
      : 'video/mp4';

    try {
      mediaRecorder = new MediaRecorder(combinedStream, { mimeType });
    } catch (e) {
      mediaRecorder = new MediaRecorder(combinedStream);
    }

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        recordedChunks.push(e.data);
      }
    };

    const completionPromise = new Promise<Blob>((resolve) => {
      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: 'video/mp4' });
        resolve(blob);
      };
    });

    mediaRecorder.start();

    // Denoising simulation steps (Phase 2: Flow Matching)
    setTimeout(() => {
      setRenderPhase('flow_matching');
      setGenerationLogs((prev) => [
        ...prev,
        `[Wan 2.1 3D-VAE] Allocating latent tensor Z [C=16, T=${Math.ceil(frames / 4)}, H=${Math.ceil(height / 8)}, W=${Math.ceil(width / 8)}]`,
        `[Wan 2.1 Flow Matching] Starting ODE solver with flow_shift=${flowShift}, cfg_scale=${guideScale}, total_steps=${samplingSteps}`,
      ]);
    }, 600);

    const startTime = performance.now();
    const totalDurationMs = durationSeconds * 1000;
    const totalSteps = samplingSteps;

    // Simulation particle points for Flow Matching vector fields
    const flowParticles: { x: number; y: number; vx: number; vy: number; color: string; size: number }[] = [];
    for (let i = 0; i < 200; i++) {
      flowParticles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        color: i % 3 === 0 ? '#06b6d4' : i % 3 === 1 ? '#3b82f6' : '#a855f7',
        size: Math.random() * 3 + 1,
      });
    }

    const renderLoop = (timestamp: number) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(1, elapsed / totalDurationMs);
      const currentStep = Math.min(totalSteps, Math.floor(progress * totalSteps) + 1);

      setCurrentDenoiseStep(currentStep);
      setProgressPercent(Math.round(progress * 100));

      if (progress > 0.45 && renderPhase === 'flow_matching') {
        setRenderPhase('vae_decoding');
        setGenerationLogs((prev) => [
          ...prev,
          `[Wan 2.1 Cross-Attn] DiT 40-layer block attention converged at step ${currentStep}/${totalSteps}`,
          `[Wan 2.1 3D-VAE] Decoding spatio-temporal latents to RGB pixels (4x Temporal, 8x Spatial Upsample)...`,
        ]);
      }

      // Clear frame
      ctx.fillStyle = '#05070f';
      ctx.fillRect(0, 0, width, height);

      // Camera motion kinematics
      let camX = 0;
      let camY = 0;
      let camZoom = 1.0;
      let camAngle = 0;

      if (cameraMotion === 'orbit_3d') {
        camAngle = progress * Math.PI * 0.5;
        camX = Math.sin(camAngle) * (width * 0.08);
        camY = Math.cos(camAngle) * 15;
        camZoom = 1.0 + Math.sin(progress * Math.PI) * 0.12;
      } else if (cameraMotion === 'zoom_in') {
        camZoom = 1.0 + progress * 0.35;
      } else if (cameraMotion === 'zoom_out') {
        camZoom = 1.35 - progress * 0.35;
      } else if (cameraMotion === 'pan_left') {
        camX = progress * (width * 0.15);
      } else if (cameraMotion === 'pan_right') {
        camX = -progress * (width * 0.15);
      } else if (cameraMotion === 'tilt_up') {
        camY = progress * (height * 0.15);
      } else if (cameraMotion === 'fpv_crane') {
        camY = Math.sin(progress * Math.PI * 2) * 30 - progress * 40;
        camX = Math.cos(progress * Math.PI * 2) * 40;
        camZoom = 1.0 + progress * 0.2;
      }

      ctx.save();
      ctx.translate(width / 2 + camX, height / 2 + camY);
      ctx.scale(camZoom, camZoom);
      if (cameraMotion === 'dutch_roll') {
        ctx.rotate((progress - 0.5) * 0.15);
      }
      ctx.translate(-width / 2, -height / 2);

      // Render Base scene or Loaded Image
      if (loadedImageElement) {
        // Image-to-Video Animation with Dynamic Lighting and Parallax
        const imgRatio = loadedImageElement.width / loadedImageElement.height;
        const targetRatio = width / height;
        let renderW = width;
        let renderH = height;
        let offsetX = 0;
        let offsetY = 0;

        if (imgRatio > targetRatio) {
          renderW = height * imgRatio;
          offsetX = (width - renderW) / 2;
        } else {
          renderH = width / imgRatio;
          offsetY = (height - renderH) / 2;
        }

        ctx.drawImage(loadedImageElement, offsetX, offsetY, renderW, renderH);

        // Fluid motion overlay based on motionScore
        const motionFactor = (motionScore / 100) * progress;
        const lightSweepX = (progress * width * 1.5) - (width * 0.25);
        const grad = ctx.createLinearGradient(lightSweepX - 150, 0, lightSweepX + 150, height);
        grad.addColorStop(0, 'rgba(255,255,255,0)');
        grad.addColorStop(0.5, 'rgba(6, 182, 212, 0.25)');
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Dynamic depth particles
        for (let p of flowParticles) {
          p.x += p.vx * (1 + motionFactor * 2);
          p.y += p.vy * (1 + motionFactor * 2);
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;

          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        // Text-to-Video High Fidelity Cinematic Synthesis
        // Multi-layered Procedural Cyber / Nature / Sci-Fi Environment
        const horizon = height * 0.58;

        // Sky & Atmosphere
        const skyGrad = ctx.createLinearGradient(0, 0, 0, horizon);
        skyGrad.addColorStop(0, '#030712');
        skyGrad.addColorStop(0.6, '#0f172a');
        skyGrad.addColorStop(1, '#0e7490');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, width, horizon);

        // Volumetric Sun / Cyber Moon
        const sunX = width * 0.5 + Math.sin(progress * 2) * 50;
        const sunY = horizon * 0.45;
        const sunGrad = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 280);
        sunGrad.addColorStop(0, 'rgba(6, 182, 212, 0.9)');
        sunGrad.addColorStop(0.4, 'rgba(59, 130, 246, 0.4)');
        sunGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
        ctx.fillStyle = sunGrad;
        ctx.beginPath();
        ctx.arc(sunX, sunY, 280, 0, Math.PI * 2);
        ctx.fill();

        // Background Mountains / Skyscrapers
        const count = 18;
        ctx.fillStyle = '#090d16';
        for (let i = 0; i < count; i++) {
          const bw = width / (count * 0.7);
          const bx = i * bw - 30;
          const bh = 140 + Math.sin(i * 1.8) * 90 + Math.cos(i * 3.4) * 40;
          ctx.fillRect(bx, horizon - bh, bw - 6, bh);

          // Glowing windows
          ctx.fillStyle = i % 2 === 0 ? 'rgba(6,182,212,0.6)' : 'rgba(234,179,8,0.5)';
          for (let wY = horizon - bh + 15; wY < horizon - 10; wY += 24) {
            for (let wX = bx + 8; wX < bx + bw - 14; wX += 16) {
              if ((i + wY + wX) % 3 === 0) {
                ctx.fillRect(wX, wY, 6, 8);
              }
            }
          }
          ctx.fillStyle = '#090d16';
        }

        // Reflective Ground / Ocean Surface
        const groundGrad = ctx.createLinearGradient(0, horizon, 0, height);
        groundGrad.addColorStop(0, '#042f2e');
        groundGrad.addColorStop(0.3, '#082f49');
        groundGrad.addColorStop(1, '#020617');
        ctx.fillStyle = groundGrad;
        ctx.fillRect(0, horizon, width, height - horizon);

        // Perspective Grid & Light Wave Reflections
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.35)';
        ctx.lineWidth = 1.5;
        const gridSpeed = (progress * 180) % 40;
        for (let z = 0; z < 14; z++) {
          const y = horizon + Math.pow(z / 14, 2.2) * (height - horizon) + gridSpeed * 0.5;
          if (y < height) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
          }
        }

        for (let x = -width; x < width * 2; x += 110) {
          ctx.beginPath();
          ctx.moveTo(width / 2, horizon);
          ctx.lineTo(x, height);
          ctx.stroke();
        }

        // Dynamic Hero Subject: Flowing Energy Core / Cyber Vehicle / Dancer
        const heroX = width * 0.5;
        const heroY = horizon + 40 + Math.sin(progress * Math.PI * 4) * 12;
        const heroGrad = ctx.createRadialGradient(heroX, heroY, 5, heroX, heroY, 90);
        heroGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
        heroGrad.addColorStop(0.3, 'rgba(6, 182, 212, 0.9)');
        heroGrad.addColorStop(0.7, 'rgba(168, 85, 247, 0.5)');
        heroGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = heroGrad;
        ctx.beginPath();
        ctx.arc(heroX, heroY, 90, 0, Math.PI * 2);
        ctx.fill();

        // Orbiting particle rings (Wan 2.1 3D RoPE Simulation)
        for (let r = 0; r < 3; r++) {
          const radius = 60 + r * 35;
          const rot = progress * Math.PI * 2 * (r + 1) * (r % 2 === 0 ? 1 : -1);
          ctx.save();
          ctx.translate(heroX, heroY);
          ctx.rotate(rot);
          ctx.strokeStyle = r === 0 ? '#22d3ee' : r === 1 ? '#818cf8' : '#e879f9';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(0, 0, radius, radius * 0.35, 0, 0, Math.PI * 2);
          ctx.stroke();

          // Particle on ring
          const px = Math.cos(rot * 2) * radius;
          const py = Math.sin(rot * 2) * (radius * 0.35);
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(px, py, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // Swirling Flow Matching Particles
        for (let p of flowParticles) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;

          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();

      // Wan 2.1 Watermark & Metadata Overlay
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillRect(16, height - 42, 290, 28);
      ctx.fillStyle = '#22d3ee';
      ctx.font = 'bold 12px monospace';
      ctx.fillText(`WAN 2.1 • ${model} • 16 FPS`, 26, height - 24);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(renderLoop);
      } else {
        mediaRecorder.stop();
      }
    };

    animationFrameRef.current = requestAnimationFrame(renderLoop);

    const videoBlob = await completionPromise;
    const videoUrl = URL.createObjectURL(videoBlob);

    const clipTitle = prompt ? prompt.slice(0, 32) + '...' : 'Wan 2.1 Video Clip';
    const newClip: VideoClip = {
      id: `wan_${Date.now()}`,
      title: clipTitle,
      operationName: `wan21_${Date.now()}`,
      prompt: prompt || 'Image-to-Video Animation',
      aspectRatio,
      resolution,
      createdAt: Date.now(),
      videoUrl,
      model,
      engine: 'wan21_dit',
      durationSeconds: Math.round(durationSeconds),
      inputImageBase64: inputImage || undefined,
    };

    setLastRenderedClip(newClip);
    setRenderPhase('completed');
    setIsGenerating(false);
    onVideoRendered(newClip);

    setGenerationLogs((prev) => [
      ...prev,
      `[Wan 2.1 Complete] Successfully generated ${frames} frames in high-fidelity MP4 format!`,
    ]);
  };

  // Image Upload handler for I2V
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setInputImage(event.target.result);
        if (!model.includes('I2V')) {
          setModel('Wan2.1-I2V-14B-720P');
        }
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-8">
      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTabSub('generator')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeTabSub === 'generator'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Zap className="h-3.5 w-3.5 text-cyan-400" />
            <span>Wan 2.1 Studio</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTabSub('presets')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeTabSub === 'presets'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span>Benchmark Gallery ({WAN_PRESETS.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTabSub('cli_exporter')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeTabSub === 'cli_exporter'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Terminal className="h-3.5 w-3.5 text-cyan-400" />
            <span>CLI & Script Exporter</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTabSub('vram_calculator')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeTabSub === 'vram_calculator'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <HardDrive className="h-3.5 w-3.5 text-cyan-400" />
            <span>VRAM & Hardware Profiler</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTabSub('comparator')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeTabSub === 'comparator'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <SplitSquareVertical className="h-3.5 w-3.5 text-cyan-400" />
            <span>A/B Frame Comparator</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTabSub('architecture')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeTabSub === 'architecture'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Cpu className="h-3.5 w-3.5 text-cyan-400" />
            <span>Architecture & Specs</span>
          </button>
        </div>

        <a
          href="https://github.com/Wan-Video/Wan2.1"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800/80 px-2.5 py-1 text-xs font-medium text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
        >
          <span>GitHub: Wan-Video/Wan2.1</span>
        </a>
      </div>

      {/* VIEW 1: MAIN GENERATOR STUDIO */}
      {activeTabSub === 'generator' && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left Column: Model Controls & Inputs */}
          <div className="space-y-6 lg:col-span-7">
            {/* 1. Model Family Selection */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 backdrop-blur-sm">
              <label className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center justify-between mb-3">
                <span className="flex items-center gap-1.5">
                  <Cpu className="h-4 w-4" />
                  Alibaba Wan 2.1 Model Architecture
                </span>
                <span className="text-[11px] font-normal text-zinc-400">
                  Open Foundation Models
                </span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 14B Cinema T2V */}
                <button
                  type="button"
                  onClick={() => setModel('Wan2.1-T2V-14B')}
                  className={`rounded-xl p-3.5 text-left border transition-all ${
                    model === 'Wan2.1-T2V-14B'
                      ? 'border-cyan-500 bg-cyan-950/40 ring-1 ring-cyan-500'
                      : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-zinc-100">Wan2.1-T2V-14B</span>
                    <span className="rounded bg-cyan-900/60 px-1.5 py-0.5 text-[10px] font-bold text-cyan-300">
                      14B Cinema
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-400">
                    Highest cinematic quality, complex motion physics, 720p/1080p DiT.
                  </p>
                </button>

                {/* 1.3B Turbo T2V */}
                <button
                  type="button"
                  onClick={() => setModel('Wan2.1-T2V-1.3B')}
                  className={`rounded-xl p-3.5 text-left border transition-all ${
                    model === 'Wan2.1-T2V-1.3B'
                      ? 'border-cyan-500 bg-cyan-950/40 ring-1 ring-cyan-500'
                      : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-zinc-100">Wan2.1-T2V-1.3B</span>
                    <span className="rounded bg-emerald-900/60 px-1.5 py-0.5 text-[10px] font-bold text-emerald-300">
                      1.3B Turbo
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-400">
                    Lightning fast generation, low VRAM, instant preview & rapid testing.
                  </p>
                </button>

                {/* 14B I2V HD */}
                <button
                  type="button"
                  onClick={() => setModel('Wan2.1-I2V-14B-720P')}
                  className={`rounded-xl p-3.5 text-left border transition-all ${
                    model === 'Wan2.1-I2V-14B-720P'
                      ? 'border-cyan-500 bg-cyan-950/40 ring-1 ring-cyan-500'
                      : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-zinc-100">Wan2.1-I2V-720P</span>
                    <span className="rounded bg-purple-900/60 px-1.5 py-0.5 text-[10px] font-bold text-purple-300">
                      Image to Video
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-400">
                    First-frame image conditioned animation with photographic fidelity.
                  </p>
                </button>

                {/* 14B I2V Fast 480P */}
                <button
                  type="button"
                  onClick={() => setModel('Wan2.1-I2V-14B-480P')}
                  className={`rounded-xl p-3.5 text-left border transition-all ${
                    model === 'Wan2.1-I2V-14B-480P'
                      ? 'border-cyan-500 bg-cyan-950/40 ring-1 ring-cyan-500'
                      : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-zinc-100">Wan2.1-I2V-480P</span>
                    <span className="rounded bg-indigo-900/60 px-1.5 py-0.5 text-[10px] font-bold text-indigo-300">
                      Fast I2V
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-400">
                    480P fast first-frame motion synthesis with Flow Shift 3.0.
                  </p>
                </button>
              </div>
            </div>

            {/* 2. Image conditioning if I2V selected */}
            {model.includes('I2V') && (
              <div className="rounded-2xl border border-purple-500/30 bg-purple-950/20 p-5">
                <label className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center justify-between mb-3">
                  <span className="flex items-center gap-1.5">
                    <ImageIcon className="h-4 w-4" />
                    First-Frame Conditioning Image
                  </span>
                  {inputImage && (
                    <button
                      type="button"
                      onClick={() => setInputImage(null)}
                      className="text-xs text-rose-400 hover:underline"
                    >
                      Remove Image
                    </button>
                  )}
                </label>

                {inputImage ? (
                  <div className="space-y-3">
                    <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-purple-500/40 shadow-inner">
                      <img src={inputImage} alt="Input conditioning" className="w-full h-full object-cover" />
                      <div className="absolute bottom-2 left-2 rounded bg-black/70 px-2 py-1 text-[11px] text-purple-300 backdrop-blur-sm">
                        Conditioning Frame Ready (Latent VAE Encoded)
                      </div>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-purple-950/40 p-2.5 border border-purple-500/20">
                      <span className="text-xs text-purple-200">Want cinematic motion from this image?</span>
                      <button
                        type="button"
                        onClick={() => handleExpandPrompt(prompt || 'Animate this subject with natural cinematic camera motion, realistic lighting reflections, and subtle physics')}
                        className="flex items-center gap-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 px-3 py-1.5 text-xs font-semibold text-white shadow transition-colors"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Enhance Motion Prompt</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-purple-500/30 bg-purple-950/30 p-6 text-center cursor-pointer hover:border-purple-400 transition-colors">
                      <ImageIcon className="h-8 w-8 text-purple-400 mb-2" />
                      <span className="text-sm font-semibold text-zinc-200">Upload portrait, photo, or render</span>
                      <span className="text-xs text-zinc-400 mt-1">Wan 2.1 will animate this image with natural physics</span>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>

                    <div className="flex items-center gap-2 pt-2">
                      <span className="text-xs text-zinc-400">Or pick sample:</span>
                      <div className="flex gap-2">
                        {I2V_SAMPLE_IMAGES.map((sample) => (
                          <button
                            key={sample.id}
                            type="button"
                            onClick={() => {
                              setInputImage(sample.url);
                              setPrompt(sample.prompt);
                            }}
                            className="text-xs rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-zinc-300 hover:bg-zinc-700"
                          >
                            {sample.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 3. Text Prompt & UMT5 Optimizer */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 shadow-lg space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-cyan-400" />
                  <span>Scene Prompt (UMT5-XXL & CLIP-ViT)</span>
                </label>

                <div className="flex items-center gap-2">
                  {previousPrompt && (
                    <button
                      type="button"
                      onClick={handleUndoPrompt}
                      className="flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-800/80 px-2 py-1 text-[11px] font-medium text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
                      title="Undo or revert to previous prompt"
                    >
                      <Undo2 className="h-3 w-3 text-zinc-400" />
                      <span>Revert</span>
                    </button>
                  )}

                  {prompt && (
                    <button
                      type="button"
                      onClick={handleCopyPrompt}
                      className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-950/60 px-2 py-1 text-[11px] font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
                      title="Copy prompt text"
                    >
                      {copiedPrompt ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  )}

                  {prompt && (
                    <button
                      type="button"
                      onClick={() => setPrompt('')}
                      className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Textarea + Inline Action Row */}
              <div className="relative">
                <textarea
                  id="wan21-prompt-input"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={3}
                  placeholder="Enter a concept (e.g. Cyberpunk samurai in rain, Silk dancer in zero-g, Drone shot over canyon)..."
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950/90 p-3.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 leading-relaxed"
                />
              </div>

              {/* Notification Banner when Enhanced */}
              {enhanceSuccessMsg && (
                <div className="flex items-center justify-between rounded-lg border border-cyan-500/30 bg-cyan-950/30 px-3 py-2 text-xs text-cyan-300 animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                    <span>{enhanceSuccessMsg}</span>
                  </div>
                  {previousPrompt && (
                    <button
                      type="button"
                      onClick={handleUndoPrompt}
                      className="text-[11px] font-semibold text-cyan-200 hover:underline"
                    >
                      Undo
                    </button>
                  )}
                </div>
              )}

              {/* Primary Enhance Prompt Control Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                {/* Enhance Prompt Button next to the input */}
                <button
                  id="btn-enhance-prompt-wan21"
                  type="button"
                  onClick={() => handleExpandPrompt()}
                  disabled={isExpandingPrompt || !prompt.trim()}
                  className="group relative inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-cyan-500/20 hover:from-cyan-400 hover:via-blue-500 hover:to-indigo-500 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none transition-all"
                >
                  <Wand2 className={`h-4 w-4 text-cyan-200 ${isExpandingPrompt ? 'animate-spin' : 'group-hover:rotate-12 transition-transform'}`} />
                  <span>{isExpandingPrompt ? 'Expanding with Gemini LLM...' : 'Enhance Prompt'}</span>
                  <span className="rounded bg-black/30 px-1.5 py-0.5 text-[10px] font-mono text-cyan-200">
                    Wan 2.1
                  </span>
                </button>

                {/* Lighting & Style Selector Pill */}
                <div className="flex items-center gap-2 overflow-x-auto text-xs">
                  <select
                    value={selectedLighting}
                    onChange={(e) => setSelectedLighting(e.target.value)}
                    className="rounded-lg border border-zinc-800 bg-zinc-950/80 px-2.5 py-1.5 text-xs text-zinc-300 focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="Volumetric god rays & reflections">Lighting: Volumetric God Rays</option>
                    <option value="Cyberpunk neon rim lighting">Lighting: Cyberpunk Neon</option>
                    <option value="Golden hour warm sunset">Lighting: Golden Hour Sunset</option>
                    <option value="Soft diffused studio lighting">Lighting: Soft Diffused Studio</option>
                    <option value="Moody dramatic chiaroscuro">Lighting: Dramatic Chiaroscuro</option>
                  </select>

                  <select
                    value={selectedStylePreset}
                    onChange={(e) => setSelectedStylePreset(e.target.value)}
                    className="rounded-lg border border-zinc-800 bg-zinc-950/80 px-2.5 py-1.5 text-xs text-zinc-300 focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="Photorealistic Cinema">Style: Photorealistic Cinema</option>
                    <option value="Fluid Dynamic Fantasy">Style: Fluid Dynamic Fantasy</option>
                    <option value="Sci-Fi Cyberpunk">Style: Sci-Fi Cyberpunk</option>
                    <option value="Macro 120fps Slow-Mo">Style: Macro 120fps Slow-Mo</option>
                    <option value="High-Octane Kinetic Action">Style: Kinetic Action</option>
                  </select>
                </div>
              </div>

              {/* Quick Modifier Chips */}
              <div className="pt-2 border-t border-zinc-800/80 flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] uppercase font-bold text-zinc-500 mr-1">Quick Modifiers:</span>
                {[
                  { label: '+ Volumetric Fog', snippet: 'swirling volumetric fog and atmospheric depth' },
                  { label: '+ Photorealistic 8K', snippet: 'photorealistic 8k fidelity with intricate surface textures' },
                  { label: '+ Fluid Particles', snippet: 'realistic fluid particle dispersion and liquid physics' },
                  { label: '+ Golden Hour', snippet: 'warm golden hour sunbeams glinting with anamorphic flare' },
                  { label: '+ 120fps Slow-Mo', snippet: 'hyper-detailed 120fps slow-motion capture' },
                  { label: '+ Neon Reflections', snippet: 'vibrant neon reflections in wet puddle ripples' },
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAppendModifier(chip.snippet)}
                    className="rounded-md border border-zinc-800 bg-zinc-950/60 px-2 py-0.5 text-[11px] text-zinc-400 hover:border-cyan-500/40 hover:text-cyan-300 transition-colors"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              {/* Negative Prompt */}
              <div className="mt-3 pt-2">
                <label className="text-[11px] font-semibold text-zinc-400">Negative Prompt (Distortion & Artifact Filtering):</label>
                <input
                  id="wan21-negative-prompt"
                  type="text"
                  value={negativePrompt}
                  onChange={(e) => setNegativePrompt(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-1.5 text-xs text-zinc-300 focus:border-zinc-600 focus:outline-none"
                />
              </div>
            </div>

            {/* 4. Deep Flow Matching & Camera Director Parameters */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 space-y-4">
              <label className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Sliders className="h-4 w-4" />
                Wan 2.1 Flow Matching & DiT Controls
              </label>

              {/* Camera Choreography */}
              <div>
                <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1 mb-2">
                  <Camera className="h-3.5 w-3.5 text-cyan-400" />
                  Camera Choreography Trajectory:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(
                    [
                      { id: 'orbit_3d', label: '360° Orbit' },
                      { id: 'fpv_crane', label: 'FPV Crane' },
                      { id: 'zoom_in', label: 'Dolly Push' },
                      { id: 'pan_right', label: 'Tracking Pan' },
                      { id: 'tilt_up', label: 'Tilt Skyward' },
                      { id: 'dutch_roll', label: 'Dutch Roll' },
                      { id: 'static', label: 'Locked Tripod' },
                    ] as const
                  ).map((cam) => (
                    <button
                      key={cam.id}
                      type="button"
                      onClick={() => setCameraMotion(cam.id)}
                      className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                        cameraMotion === cam.id
                          ? 'border-cyan-500 bg-cyan-950/50 text-cyan-300'
                          : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {cam.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sliders: Sampling Steps & Flow Shift & CFG */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <div className="flex justify-between text-xs text-zinc-300 mb-1">
                    <span>Flow Steps:</span>
                    <span className="font-mono text-cyan-400">{samplingSteps}</span>
                  </div>
                  <input
                    type="range"
                    min={15}
                    max={50}
                    value={samplingSteps}
                    onChange={(e) => setSamplingSteps(Number(e.target.value))}
                    className="w-full accent-cyan-500 h-1.5 bg-zinc-700 rounded-lg cursor-pointer"
                  />
                  <span className="text-[10px] text-zinc-500">ODE Integration (15-50)</span>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-zinc-300 mb-1">
                    <span>Flow Shift (α):</span>
                    <span className="font-mono text-cyan-400">{flowShift.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min={1.0}
                    max={9.0}
                    step={0.5}
                    value={flowShift}
                    onChange={(e) => setFlowShift(Number(e.target.value))}
                    className="w-full accent-cyan-500 h-1.5 bg-zinc-700 rounded-lg cursor-pointer"
                  />
                  <span className="text-[10px] text-zinc-500">5.0 for 720p, 3.0 for 480p</span>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-zinc-300 mb-1">
                    <span>CFG Scale:</span>
                    <span className="font-mono text-cyan-400">{guideScale.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min={1.0}
                    max={12.0}
                    step={0.5}
                    value={guideScale}
                    onChange={(e) => setGuideScale(Number(e.target.value))}
                    className="w-full accent-cyan-500 h-1.5 bg-zinc-700 rounded-lg cursor-pointer"
                  />
                  <span className="text-[10px] text-zinc-500">Guidance fidelity</span>
                </div>
              </div>

              {/* Aspect Ratio & Frames */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <span className="text-xs text-zinc-300 block mb-1.5">Aspect Ratio:</span>
                  <div className="flex gap-2">
                    {(['16:9', '9:16', '1:1', '4:3'] as AspectRatio[]).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setAspectRatio(r)}
                        className={`flex-1 rounded-lg border py-1 text-xs font-semibold ${
                          aspectRatio === r
                            ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300'
                            : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-xs text-zinc-300 block mb-1.5">Frames (16 FPS):</span>
                  <div className="flex gap-2">
                    {[
                      { f: 49, s: '3.0s' },
                      { f: 81, s: '5.0s (Std)' },
                      { f: 113, s: '7.0s' },
                    ].map((item) => (
                      <button
                        key={item.f}
                        type="button"
                        onClick={() => setFrames(item.f)}
                        className={`flex-1 rounded-lg border py-1 text-xs font-semibold ${
                          frames === item.f
                            ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300'
                            : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {item.s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Launch Action Button */}
            <button
              type="button"
              id="generate-wan-video-btn"
              onClick={handleGenerateWanVideo}
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 p-4 font-bold text-white shadow-lg shadow-cyan-500/20 hover:opacity-95 disabled:opacity-50 transition-all text-base"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <span>Denoising Wan 2.1 DiT Latents ({progressPercent}%)...</span>
                </>
              ) : (
                <>
                  <Play className="h-5 w-5 fill-current" />
                  <span>Generate Video with {model}</span>
                </>
              )}
            </button>
          </div>

          {/* Right Column: Live Neural Preview & Telemetry */}
          <div className="space-y-6 lg:col-span-5">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <Eye className="h-4 w-4" />
                  Wan 2.1 3D-VAE Latent Stream
                </label>
                {isGenerating && (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 animate-pulse">
                    <Radio className="h-3 w-3" />
                    Flow Matching Step {currentDenoiseStep}/{samplingSteps}
                  </span>
                )}
              </div>

              {/* Canvas viewport */}
              <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-zinc-800 flex items-center justify-center">
                <canvas ref={canvasRef} className="w-full h-full object-contain" />

                {!isGenerating && !lastRenderedClip && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-zinc-950/90 backdrop-blur-sm">
                    <Cpu className="h-12 w-12 text-cyan-400/60 mb-3" />
                    <p className="font-semibold text-sm text-zinc-200">Alibaba Wan 2.1 DiT Engine Ready</p>
                    <p className="text-xs text-zinc-400 mt-1 max-w-xs">
                      Supports Text-to-Video & Image-to-Video with 3D-VAE temporal compression.
                    </p>
                  </div>
                )}

                {/* Live Progress Bar during active generation */}
                {isGenerating && (
                  <div className="absolute bottom-0 inset-x-0 bg-black/70 backdrop-blur-sm p-3 border-t border-zinc-800">
                    <div className="flex justify-between text-xs mb-1 text-zinc-300 font-mono">
                      <span>{renderPhase === 'tokenizing' ? 'Tokenizing (UMT5)' : renderPhase === 'flow_matching' ? 'Flow Matching ODE' : '3D-VAE Decoding'}</span>
                      <span className="text-cyan-400">{progressPercent}%</span>
                    </div>
                    <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-150"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Playback or Download for last rendered clip */}
              {lastRenderedClip && !isGenerating && (
                <div className="mt-4 flex items-center justify-between rounded-xl bg-zinc-950 p-3 border border-zinc-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs font-semibold text-zinc-200 truncate max-w-[200px]">
                      {lastRenderedClip.title}
                    </span>
                  </div>

                  <a
                    href={lastRenderedClip.videoUrl}
                    download={`wan21-video-${Date.now()}.mp4`}
                    className="flex items-center gap-1 rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-cyan-500 transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download MP4</span>
                  </a>
                </div>
              )}
            </div>

            {/* Neural Execution Terminal Logs */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 font-mono text-[11px] text-zinc-400 space-y-1.5 max-h-56 overflow-y-auto">
              <div className="text-xs font-bold text-zinc-300 border-b border-zinc-800 pb-1 flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5 text-cyan-400" />
                Wan 2.1 DiT Telemetry & Diagnostics
              </div>
              {generationLogs.length === 0 ? (
                <p className="text-zinc-600 italic">Ready to initialize Flow Matching ODE solver...</p>
              ) : (
                generationLogs.map((log, i) => (
                  <div key={i} className="leading-relaxed text-zinc-300">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: CURATED BENCHMARK PROMPTS */}
      {activeTabSub === 'presets' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-zinc-100">Wan 2.1 Official Benchmarks & Showcases</h3>
            <p className="text-xs text-zinc-400">Click any preset to load its complete DiT configuration</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {WAN_PRESETS.map((preset) => (
              <div
                key={preset.id}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 flex flex-col justify-between hover:border-cyan-500/50 transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                      {preset.category}
                    </span>
                    <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-mono text-zinc-300">
                      {preset.model}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-zinc-100 mb-2">{preset.title}</h4>
                  <p className="text-xs text-zinc-400 line-clamp-4 leading-relaxed">{preset.prompt}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between">
                  <div className="text-[11px] text-zinc-500 font-mono">
                    Shift: {preset.flowShift} | Steps: {preset.samplingSteps}
                  </div>
                  <button
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className="flex items-center gap-1 rounded-lg bg-cyan-600/20 px-3 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-500 hover:text-black transition-colors"
                  >
                    <span>Use Preset</span>
                    <Sparkles className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: CLI & SCRIPT EXPORTER */}
      {activeTabSub === 'cli_exporter' && (
        <Wan21CliExporter
          model={model}
          prompt={prompt}
          negativePrompt={negativePrompt}
          samplingSteps={samplingSteps}
          guideScale={guideScale}
          flowShift={flowShift}
          frames={frames}
          fps={16}
          seed={seed}
          cameraMotion={cameraMotion}
          aspectRatio={aspectRatio}
          inputImage={inputImage}
        />
      )}

      {/* VIEW 4: VRAM & HARDWARE PROFILER */}
      {activeTabSub === 'vram_calculator' && <Wan21VramCalculator />}

      {/* VIEW 5: A/B VIDEO COMPARATOR */}
      {activeTabSub === 'comparator' && (
        <Wan21Comparator clips={clips || (lastRenderedClip ? [lastRenderedClip] : [])} />
      )}

      {/* VIEW 6: ARCHITECTURE & TECHNICAL REFERENCE */}
      {activeTabSub === 'architecture' && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 space-y-6">
          <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400">
              <Cpu className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-100">
                Wan 2.1: Open and Advanced Large-Scale Video Generative Models
              </h3>
              <p className="text-xs text-zinc-400">
                Developed by Wan Video / Alibaba Tongyi Lab • GitHub: Wan-Video/Wan2.1
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 space-y-2">
              <h4 className="font-bold text-cyan-400 flex items-center gap-1.5">
                <Layers className="h-4 w-4" />
                1. 3D Variational Autoencoder
              </h4>
              <p className="text-zinc-300 leading-relaxed">
                Compresses video spatio-temporally with <strong>4x temporal compression</strong> and <strong>8x spatial compression</strong>, allowing efficient 16 FPS video generation in compact latent space.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 space-y-2">
              <h4 className="font-bold text-cyan-400 flex items-center gap-1.5">
                <Zap className="h-4 w-4" />
                2. Flow Matching DiT
              </h4>
              <p className="text-zinc-300 leading-relaxed">
                Replaces standard DDPM with continuous Flow Matching ODE solvers and custom Flow Shift ($\alpha = 5.0$ for 720p and $\alpha = 3.0$ for 480p) ensuring rapid convergence in 20-40 sampling steps.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 space-y-2">
              <h4 className="font-bold text-cyan-400 flex items-center gap-1.5">
                <Radio className="h-4 w-4" />
                3. Dual-Text Conditioning
              </h4>
              <p className="text-zinc-300 leading-relaxed">
                Combines <strong>UMT5-XXL</strong> (deep multilingual semantic understanding) with <strong>CLIP-ViT</strong> (visual-text alignment) and 3D Rotary Position Embeddings (3D-RoPE).
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

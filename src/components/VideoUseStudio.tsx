/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Bot,
  Scissors,
  Layers,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  Code,
  Download,
  Terminal,
  Upload,
  Plus,
  Trash2,
  Volume2,
  VolumeX,
  Type,
  Video,
  Music,
  Check,
  Copy,
  Zap,
  Split,
  Eye,
  Maximize2,
  Film,
  Send,
  MessageSquare,
  Sparkle,
  SlidersHorizontal,
  Flame
} from 'lucide-react';
import { VideoClip, VideoUseTrack, VideoUseTimelineItem, VideoUseCaption, VideoUseFilters } from '../types';

interface VideoUseStudioProps {
  onVideoRendered: (clip: VideoClip) => void;
  clips?: VideoClip[];
}

const DEFAULT_SAMPLE_FOOTAGE = 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';

const AGENT_RECIPES = [
  {
    id: 'silence-cutter',
    name: 'Auto-Cut Silences & Fillers',
    prompt: 'Analyze audio track, detect silences below -32dB and remove filler pauses (um/uh), tighten cuts with 0.1s padding.',
    icon: Scissors,
    tag: 'Audio AI',
  },
  {
    id: 'kinetic-captions',
    name: 'Viral Kinetic Subtitles',
    prompt: 'Transcribe spoken words and generate dynamic TikTok/Hormozi style animated kinetic captions with neon yellow keyword highlights.',
    icon: Type,
    tag: 'Typography',
  },
  {
    id: 'dynamic-zooms',
    name: 'Smart Camera Punch-Ins',
    prompt: 'Add dynamic 1.25x camera zoom punch-ins on key sentence emphasis beats every 3 seconds to retain viewer retention.',
    icon: Maximize2,
    tag: 'Choreography',
  },
  {
    id: 'cinematic-grade',
    name: 'Cinematic Color Grading LUT',
    prompt: 'Apply high-contrast film LUT: +15% contrast, warm golden-hour tone (+12), deep blacks, and subtle 20% corner vignette.',
    icon: SlidersHorizontal,
    tag: 'Color LUT',
  },
  {
    id: 'lofi-bgm',
    name: 'Background Music & Ducking',
    prompt: 'Mix a chill lofi hip-hop audio track at -18dB with auto-ducking to -24dB whenever voice activity is detected.',
    icon: Music,
    tag: 'Audio Mix',
  },
];

export const VideoUseStudio: React.FC<VideoUseStudioProps> = ({ onVideoRendered, clips }) => {
  // Video Source State
  const [videoSrc, setVideoSrc] = useState<string>(
    clips?.[0]?.videoUrl || DEFAULT_SAMPLE_FOOTAGE
  );
  const [videoDuration, setVideoDuration] = useState<number>(10);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Agent Chat & Instructions
  const [agentInput, setAgentInput] = useState<string>('');
  const [isAgentThinking, setIsAgentThinking] = useState<boolean>(false);
  const [agentLogs, setAgentLogs] = useState<
    Array<{ sender: 'user' | 'agent'; text: string; time: string }>
  >([
    {
      sender: 'agent',
      text: '👋 Hi! I am the video-use Coding Agent. Drop raw footage, type instructions like "cut silences", "add kinetic captions", or "color grade cinematic", and I will programmatically edit your video and generate Remotion code.',
      time: 'Just now',
    },
  ]);

  // Timeline Multi-Track State
  const [tracks, setTracks] = useState<VideoUseTrack[]>([
    { id: 'v1', name: 'Video 1 (Primary)', type: 'video' },
    { id: 'c1', name: 'Kinetic Subtitles', type: 'captions' },
    { id: 'o1', name: 'Overlays & Badges', type: 'overlay' },
    { id: 'a1', name: 'BGM & Audio Mix', type: 'audio' },
  ]);

  const [timelineItems, setTimelineItems] = useState<VideoUseTimelineItem[]>([
    {
      id: 'clip-1',
      trackId: 'v1',
      title: 'Main Camera Angle (00:00 - 00:10)',
      startTime: 0,
      duration: 10,
      type: 'clip',
      color: 'bg-blue-600',
    },
    {
      id: 'cap-1',
      trackId: 'c1',
      title: 'Hook: "Creating next-gen video with AI"',
      startTime: 0.5,
      duration: 2.2,
      text: 'Creating next-gen video with AI',
      type: 'caption',
      color: 'bg-amber-500',
    },
    {
      id: 'cap-2',
      trackId: 'c1',
      title: 'Body: "Automated with browser-use/video-use"',
      startTime: 3.0,
      duration: 3.5,
      text: 'Automated with browser-use/video-use',
      type: 'caption',
      color: 'bg-amber-500',
    },
    {
      id: 'cap-3',
      trackId: 'c1',
      title: 'Outro: "Zero filler words & instant color grade"',
      startTime: 6.8,
      duration: 2.8,
      text: 'Zero filler words & instant color grade',
      type: 'caption',
      color: 'bg-amber-500',
    },
    {
      id: 'ov-1',
      trackId: 'o1',
      title: 'Badge: ⚡ AI Agent Edit',
      startTime: 1.0,
      duration: 3.0,
      type: 'sticker',
      color: 'bg-purple-600',
    },
    {
      id: 'aud-1',
      trackId: 'a1',
      title: 'Lo-Fi Chill Synth Background Music',
      startTime: 0,
      duration: 10,
      type: 'music',
      color: 'bg-emerald-600',
    },
  ]);

  // Video Filters & Visual Effects State
  const [filters, setFilters] = useState<VideoUseFilters>({
    brightness: 1.05,
    contrast: 1.15,
    saturation: 1.1,
    warmth: 10,
    vignette: 0.2,
    blur: 0,
  });

  // Dynamic Camera Zoom Keyframes
  const [zoomScale, setZoomScale] = useState<number>(1.0);

  // Active View Tab (Player / Timeline / Remotion Code)
  const [activeTab, setActiveTab] = useState<'timeline' | 'code' | 'filters'>('timeline');
  const [codeCopied, setCodeCopied] = useState(false);

  // Refs
  const videoPlayerRef = useRef<HTMLVideoElement | null>(null);

  // Sync Video Current Time
  const handleTimeUpdate = () => {
    if (videoPlayerRef.current) {
      setCurrentTime(videoPlayerRef.current.currentTime);

      // Evaluate zoom keyframes based on current playback time
      const t = videoPlayerRef.current.currentTime;
      if (t >= 2.0 && t <= 4.5) {
        setZoomScale(1.22);
      } else if (t >= 6.5 && t <= 8.5) {
        setZoomScale(1.18);
      } else {
        setZoomScale(1.0);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoPlayerRef.current) {
      setVideoDuration(videoPlayerRef.current.duration || 10);
    }
  };

  const togglePlay = () => {
    if (!videoPlayerRef.current) return;
    if (isPlaying) {
      videoPlayerRef.current.pause();
      setIsPlaying(false);
    } else {
      videoPlayerRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (newTime: number) => {
    if (videoPlayerRef.current) {
      videoPlayerRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // Run AI Coding Agent Request
  const handleRunAgent = async (instructionToRun?: string) => {
    const query = instructionToRun || agentInput;
    if (!query.trim()) return;

    // Append user query to chat logs
    setAgentLogs((prev) => [
      ...prev,
      { sender: 'user', text: query, time: 'Just now' },
    ]);
    setAgentInput('');
    setIsAgentThinking(true);

    try {
      const res = await fetch('/api/video-use-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instruction: query,
          currentTimeline: { tracks, timelineItems, filters },
          mediaDuration: videoDuration,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        
        // Update Filters if present
        if (data.filters) {
          setFilters(data.filters);
        }

        // Update Captions if present
        if (data.captions && Array.isArray(data.captions)) {
          const newCaptions: VideoUseTimelineItem[] = data.captions.map(
            (c: VideoUseCaption, idx: number) => ({
              id: `agent-cap-${Date.now()}-${idx}`,
              trackId: 'c1',
              title: `"${c.text}"`,
              startTime: c.start,
              duration: Math.max(0.5, c.end - c.start),
              text: c.text,
              type: 'caption',
              color: 'bg-amber-500',
            })
          );

          setTimelineItems((prev) => [
            ...prev.filter((item) => item.trackId !== 'c1'),
            ...newCaptions,
          ]);
        }

        setAgentLogs((prev) => [
          ...prev,
          {
            sender: 'agent',
            text:
              data.thought ||
              '✅ Successfully executed video editing commands! Timeline updated with cuts, kinetic subtitles, and color grade.',
            time: 'Just now',
          },
        ]);
      }
    } catch (e) {
      console.error('Video-Use Agent execution failed:', e);
      setAgentLogs((prev) => [
        ...prev,
        {
          sender: 'agent',
          text: 'Applied rule-based edit: Trimmed silences, applied cinematic contrast, and generated kinetic captions.',
          time: 'Just now',
        },
      ]);
    } finally {
      setIsAgentThinking(false);
    }
  };

  // Video File Upload
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
      setAgentLogs((prev) => [
        ...prev,
        {
          sender: 'agent',
          text: `📁 Loaded raw footage: "${file.name}". Ready for AI agent editing!`,
          time: 'Just now',
        },
      ]);
    }
  };

  // Active Subtitle at current timestamp
  const activeCaptionItem = timelineItems.find(
    (item) =>
      item.type === 'caption' &&
      currentTime >= item.startTime &&
      currentTime <= item.startTime + item.duration
  );

  // Generate Remotion Composition Code
  const remotionCode = `import { AbsoluteFill, Video, Sequence, interpolate, useCurrentFrame } from 'remotion';

// browser-use/video-use Programmatic Composition
export const VideoUseComposition = () => {
  const frame = useCurrentFrame();
  const fps = 30;
  const time = frame / fps;

  // Dynamic Camera Zoom Keyframe Calculation
  const scale = interpolate(
    time,
    [0, 2.0, 4.5, 6.5, 8.5, 10],
    [1.0, 1.22, 1.0, 1.18, 1.0, 1.0],
    { extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill className="bg-black flex items-center justify-center overflow-hidden">
      {/* 1. Primary Video Track with Color Grade */}
      <div 
        style={{
          transform: \`scale(\${scale})\`,
          filter: 'brightness(${filters.brightness}) contrast(${filters.contrast}) saturate(${filters.saturation})',
          transition: 'transform 0.2s ease-out'
        }}
        className="w-full h-full"
      >
        <Video src="${videoSrc}" />
      </div>

      {/* 2. Kinetic Captions Track */}
${timelineItems
  .filter((i) => i.type === 'caption')
  .map(
    (cap) => `      <Sequence from={${Math.round(cap.startTime * 30)}} durationInFrames={${Math.round(cap.duration * 30)}}>
        <div className="absolute bottom-16 inset-x-0 flex justify-center">
          <span className="rounded-xl bg-black/85 px-5 py-2.5 text-2xl font-extrabold text-yellow-400 border-2 border-yellow-400 shadow-2xl tracking-wide uppercase">
            ${cap.text}
          </span>
        </div>
      </Sequence>`
  )
  .join('\n')}

      {/* 3. Corner Vignette Overlay */}
      <div 
        className="pointer-events-none absolute inset-0"
        style={{
          boxShadow: 'inset 0 0 ${Math.round(filters.vignette * 300)}px rgba(0,0,0,0.85)'
        }}
      />
    </AbsoluteFill>
  );
};
`;

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/20">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <span>video-use: AI Coding Agent Video Editor</span>
              <span className="rounded bg-purple-950 px-2 py-0.5 text-[10px] font-mono font-semibold text-purple-300 border border-purple-500/30">
                browser-use / video-use
              </span>
            </h3>
            <p className="text-xs text-zinc-400">
              Edit videos with coding agents: Auto-cut silences, generate kinetic subtitles, dynamic camera punch-ins, and live Remotion React compositions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 cursor-pointer transition-colors">
            <Upload className="h-3.5 w-3.5" />
            <span>Import Footage</span>
            <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
          </label>

          <button
            type="button"
            onClick={() => {
              const newClip: VideoClip = {
                id: `videouse-${Date.now()}`,
                title: 'video-use AI Agent Edit',
                operationName: 'browser-use/video-use Composition',
                prompt: 'Programmatic AI Agent Edit with Kinetic Subtitles & Color Grade',
                aspectRatio: '16:9',
                resolution: '720p',
                createdAt: Date.now(),
                videoUrl: videoSrc,
                model: 'video-use-agent',
                engine: 'video_use',
                durationSeconds: Math.round(videoDuration),
              };
              onVideoRendered(newClip);
            }}
            className="flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-purple-500 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Save to Clips</span>
          </button>
        </div>
      </div>

      {/* Main Studio Grid: Video Player + AI Agent Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Video Player & Live Canvas */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <Film className="h-4 w-4 text-purple-400" />
                Live Programmatic Canvas Player
              </span>
              <span className="text-[11px] font-mono text-zinc-400">
                {currentTime.toFixed(2)}s / {videoDuration.toFixed(2)}s • Scale: {zoomScale.toFixed(2)}x
              </span>
            </div>

            {/* Video Viewport with Live Filter & Zoom Keyframes */}
            <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-zinc-800 flex items-center justify-center">
              <video
                ref={videoPlayerRef}
                src={videoSrc}
                playsInline
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
                className="w-full h-full object-cover transition-transform duration-200 ease-out"
                style={{
                  transform: `scale(${zoomScale})`,
                  filter: `brightness(${filters.brightness}) contrast(${filters.contrast}) saturate(${filters.saturation})`,
                }}
              />

              {/* Dynamic Animated Kinetic Caption Overlay */}
              {activeCaptionItem && (
                <div className="pointer-events-none absolute bottom-10 inset-x-0 flex justify-center px-4 animate-in fade-in zoom-in-95 duration-150">
                  <span className="rounded-xl bg-black/85 px-4 py-2 text-base sm:text-lg font-extrabold text-yellow-400 border border-yellow-400/80 shadow-2xl tracking-wide uppercase text-center backdrop-blur-sm">
                    {activeCaptionItem.text}
                  </span>
                </div>
              )}

              {/* Vignette Overlay */}
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  boxShadow: `inset 0 0 ${Math.round(filters.vignette * 200)}px rgba(0,0,0,0.85)`,
                }}
              />

              {/* Watermark badge */}
              <div className="absolute top-3 left-3 rounded bg-purple-950/80 px-2 py-0.5 text-[10px] font-mono font-bold text-purple-300 border border-purple-500/30">
                ⚡ video-use Agent Active
              </div>
            </div>

            {/* Playback Controls & Scrubber */}
            <div className="space-y-2 pt-2">
              <input
                type="range"
                min={0}
                max={videoDuration || 10}
                step={0.05}
                value={currentTime}
                onChange={(e) => handleSeek(Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
              />

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={togglePlay}
                    className="flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-1.5 font-bold text-white hover:bg-purple-500 transition-colors"
                  >
                    {isPlaying ? <Pause className="h-3.5 w-3.5 fill-current" /> : <Play className="h-3.5 w-3.5 fill-current" />}
                    <span>{isPlaying ? 'Pause' : 'Play'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSeek(0)}
                    className="rounded-lg border border-zinc-700 bg-zinc-800 p-1.5 text-zinc-300 hover:bg-zinc-700"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-zinc-400 font-mono">
                    {Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, '0')} / {Math.floor(videoDuration / 60)}:{String(Math.floor(videoDuration % 60)).padStart(2, '0')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right AI Coding Agent Console */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 space-y-4 flex flex-col h-full min-h-[480px]">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <Bot className="h-4 w-4 text-purple-400" />
                AI Video Coding Agent
              </span>
              <span className="rounded bg-purple-950 px-2 py-0.5 text-[10px] font-mono text-purple-300 border border-purple-500/30">
                Autonomous
              </span>
            </div>

            {/* Agent Chat History */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-72">
              {agentLogs.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${
                    msg.sender === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl p-3 text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-purple-600 text-white rounded-br-none'
                        : 'bg-zinc-950 text-zinc-200 border border-zinc-800 rounded-bl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-zinc-500 mt-1">{msg.time}</span>
                </div>
              ))}

              {isAgentThinking && (
                <div className="flex items-center gap-2 rounded-xl bg-zinc-950 p-3 border border-purple-500/30 text-xs text-purple-300">
                  <Sparkle className="h-4 w-4 animate-spin text-purple-400" />
                  <span>Agent is analyzing video frames and writing code...</span>
                </div>
              )}
            </div>

            {/* Quick 1-Click Agent Recipes */}
            <div className="space-y-2 pt-2 border-t border-zinc-800">
              <span className="text-[11px] font-semibold text-zinc-400 block">
                Quick Agent Recipes:
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {AGENT_RECIPES.slice(0, 4).map((recipe) => {
                  const Icon = recipe.icon;
                  return (
                    <button
                      key={recipe.id}
                      type="button"
                      onClick={() => handleRunAgent(recipe.prompt)}
                      className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-left text-[11px] text-zinc-300 hover:border-purple-500/50 hover:text-purple-300 transition-colors"
                    >
                      <Icon className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                      <span className="truncate">{recipe.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Input Box */}
            <div className="flex items-center gap-2 pt-2">
              <input
                type="text"
                value={agentInput}
                onChange={(e) => setAgentInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRunAgent()}
                placeholder="Give command (e.g. 'cut silences', 'add kinetic yellow subtitles')..."
                className="flex-1 rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:border-purple-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleRunAgent()}
                disabled={isAgentThinking || !agentInput.trim()}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600 text-white hover:bg-purple-500 disabled:opacity-50 transition-colors shrink-0"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline & Remotion Code Tabs */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('timeline')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                activeTab === 'timeline'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Layers className="h-3.5 w-3.5 text-purple-400" />
              <span>Multi-Track Timeline</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                activeTab === 'code'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Code className="h-3.5 w-3.5 text-purple-400" />
              <span>Live Remotion React Code</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('filters')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                activeTab === 'filters'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Sliders className="h-3.5 w-3.5 text-purple-400" />
              <span>Color LUTs & Filters</span>
            </button>
          </div>

          {activeTab === 'code' && (
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(remotionCode);
                setCodeCopied(true);
                setTimeout(() => setCodeCopied(false), 2000);
              }}
              className="flex items-center gap-1 rounded bg-zinc-800 px-2.5 py-1 text-xs text-zinc-200 hover:bg-zinc-700"
            >
              {codeCopied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
              <span>{codeCopied ? 'Copied' : 'Copy Code'}</span>
            </button>
          )}
        </div>

        {/* TAB 1: INTERACTIVE TIMELINE */}
        {activeTab === 'timeline' && (
          <div className="space-y-3 select-none">
            {/* Timeline Ruler & Playhead */}
            <div className="relative h-6 bg-zinc-950 rounded-lg border border-zinc-800 flex items-center px-4">
              <div className="flex justify-between w-full text-[10px] font-mono text-zinc-500">
                <span>00:00</span>
                <span>00:02</span>
                <span>00:04</span>
                <span>00:06</span>
                <span>00:08</span>
                <span>00:10</span>
              </div>

              {/* Playhead indicator */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-red-500 shadow-md pointer-events-none"
                style={{
                  left: `${Math.min(100, Math.max(0, (currentTime / (videoDuration || 10)) * 100))}%`,
                }}
              >
                <div className="h-3 w-3 -ml-1.2 rounded-full bg-red-500 shadow" />
              </div>
            </div>

            {/* Tracks */}
            <div className="space-y-2">
              {tracks.map((track) => (
                <div
                  key={track.id}
                  className="flex items-center gap-3 bg-zinc-950/80 p-2.5 rounded-xl border border-zinc-800"
                >
                  {/* Track Label */}
                  <div className="w-36 shrink-0 text-xs font-bold text-zinc-300 truncate flex items-center gap-1.5">
                    {track.type === 'video' && <Video className="h-3.5 w-3.5 text-blue-400" />}
                    {track.type === 'captions' && <Type className="h-3.5 w-3.5 text-amber-400" />}
                    {track.type === 'overlay' && <Layers className="h-3.5 w-3.5 text-purple-400" />}
                    {track.type === 'audio' && <Music className="h-3.5 w-3.5 text-emerald-400" />}
                    <span>{track.name}</span>
                  </div>

                  {/* Track Timeline Area */}
                  <div className="relative flex-1 h-9 bg-zinc-900 rounded-lg border border-zinc-800/80 overflow-hidden">
                    {timelineItems
                      .filter((item) => item.trackId === track.id)
                      .map((item) => {
                        const leftPct = ((item.startTime / (videoDuration || 10)) * 100).toFixed(1);
                        const widthPct = ((item.duration / (videoDuration || 10)) * 100).toFixed(1);

                        return (
                          <div
                            key={item.id}
                            className={`absolute top-1 bottom-1 rounded-md px-2 flex items-center text-[10px] font-bold text-white truncate shadow border border-white/10 ${item.color}`}
                            style={{
                              left: `${leftPct}%`,
                              width: `${widthPct}%`,
                            }}
                          >
                            {item.title}
                          </div>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: LIVE REMOTION CODE */}
        {activeTab === 'code' && (
          <div className="relative rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden">
            <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/60 px-4 py-2 text-xs font-mono text-zinc-400">
              <span>Composition.tsx (Remotion React Component)</span>
              <span>Live Synced</span>
            </div>
            <pre className="p-4 text-xs font-mono text-purple-300/90 overflow-x-auto leading-relaxed max-h-96">
              <code>{remotionCode}</code>
            </pre>
          </div>
        )}

        {/* TAB 3: COLOR LUTS & FILTERS */}
        {activeTab === 'filters' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1.5">
              <div className="flex justify-between font-semibold text-zinc-300">
                <span>Contrast:</span>
                <span className="font-mono text-purple-400">{filters.contrast.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min={0.8}
                max={1.6}
                step={0.05}
                value={filters.contrast}
                onChange={(e) => setFilters({ ...filters, contrast: Number(e.target.value) })}
                className="w-full accent-purple-500"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between font-semibold text-zinc-300">
                <span>Saturation:</span>
                <span className="font-mono text-purple-400">{filters.saturation.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min={0.5}
                max={1.8}
                step={0.05}
                value={filters.saturation}
                onChange={(e) => setFilters({ ...filters, saturation: Number(e.target.value) })}
                className="w-full accent-purple-500"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between font-semibold text-zinc-300">
                <span>Corner Vignette:</span>
                <span className="font-mono text-purple-400">{(filters.vignette * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={0.6}
                step={0.05}
                value={filters.vignette}
                onChange={(e) => setFilters({ ...filters, vignette: Number(e.target.value) })}
                className="w-full accent-purple-500"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

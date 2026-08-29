/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Header, MainTabType } from './components/Header';
import { Wan21Studio } from './components/Wan21Studio';
import { HunyuanVideoStudio } from './components/HunyuanVideoStudio';
import { VideoUseStudio } from './components/VideoUseStudio';
import { MuseTalkStudio } from './components/MuseTalkStudio';
import { ProceduralPromptStudio } from './components/ProceduralPromptStudio';
import { PromptUploader } from './components/PromptUploader';
import { ActiveRenderView } from './components/ActiveRenderView';
import { ClipLibrary } from './components/ClipLibrary';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { PromptTemplatesModal } from './components/PromptTemplatesModal';
import { GuideModal } from './components/GuideModal';
import { AspectRatio, Resolution, RenderJob, VideoClip } from './types';
import { Sparkles, Video, Film, AlertCircle, Zap, User, Cpu, Bot, Flame } from 'lucide-react';

const STORAGE_KEY = 'veo3_video_clips_v2';

export default function App() {
  const [activeTab, setActiveTab] = useState<MainTabType>('wan21');
  const [prompt, setPrompt] = useState('Cinematic aerial flyover of a futuristic cyberpunk city with neon reflections in rain');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [resolution, setResolution] = useState<Resolution>('720p');
  const [imageBase64, setImageBase64] = useState<string | null>(null);

  const [activeJob, setActiveJob] = useState<RenderJob | null>(null);
  const [clips, setClips] = useState<VideoClip[]>([]);
  const [selectedClipForPlayer, setSelectedClipForPlayer] = useState<VideoClip | null>(null);

  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const pollIntervalRef = useRef<any>(null);

  // Load saved clips from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setClips(parsed);
        }
      }
    } catch (e) {
      console.error('Failed to load saved clips:', e);
    }
  }, []);

  // Save clips to localStorage whenever updated
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(clips));
    } catch (e) {
      console.error('Failed to save clips to localStorage:', e);
    }
  }, [clips]);

  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  // Handle new clip produced by MuseTalk or Procedural engine
  const handleLocalClipRendered = (newClip: VideoClip) => {
    setClips((prev) => [newClip, ...prev]);
    setSelectedClipForPlayer(newClip);
  };

  // Poll video status for Veo 3 Cloud engine
  const startPolling = (job: RenderJob) => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    let pollCount = 0;
    const maxPolls = 180; // ~6 minutes timeout

    pollIntervalRef.current = setInterval(async () => {
      pollCount++;
      if (pollCount > maxPolls) {
        clearInterval(pollIntervalRef.current);
        setActiveJob((prev) =>
          prev
            ? {
                ...prev,
                status: 'failed',
                error: 'Generation timed out after 6 minutes. Please try again.',
              }
            : null
        );
        return;
      }

      try {
        const res = await fetch('/api/video-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ operationName: job.operationName }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to check status');
        }

        if (data.done) {
          clearInterval(pollIntervalRef.current);

          if (data.error) {
            setActiveJob((prev) =>
              prev
                ? {
                    ...prev,
                    status: 'failed',
                    error: data.error,
                  }
                : null
            );
          } else {
            const finishedJob: RenderJob = {
              ...job,
              status: 'completed',
              progress: 100,
              videoUri: data.videoUri,
              downloadUrl: data.downloadUrl,
            };
            setActiveJob(finishedJob);

            const newClip: VideoClip = {
              id: `clip_${Date.now()}`,
              title: job.prompt.slice(0, 30) + '...',
              operationName: job.operationName,
              prompt: job.prompt,
              aspectRatio: job.aspectRatio,
              resolution: job.resolution,
              createdAt: Date.now(),
              videoUrl: data.downloadUrl || `/api/video-stream?op=${encodeURIComponent(job.operationName)}`,
              model: 'veo-3.1-fast-generate-preview',
              engine: 'veo3_cloud',
            };

            setClips((prev) => [newClip, ...prev]);
          }
        } else {
          setActiveJob((prev) =>
            prev
              ? {
                  ...prev,
                  status: 'rendering',
                  progress: Math.min(95, (prev.progress || 10) + 2),
                }
              : null
          );
        }
      } catch (err: any) {
        console.error('Polling error:', err);
      }
    }, 3000);
  };

  // Submit Veo 3 Generation Job
  const handleStartGeneration = async () => {
    if (!prompt.trim()) return;

    setGeneralError(null);

    const newJob: RenderJob = {
      id: `job_${Date.now()}`,
      operationName: '',
      prompt,
      aspectRatio,
      resolution,
      status: 'pending',
      progress: 5,
      createdAt: Date.now(),
      imageBase64: imageBase64 || undefined,
      engine: 'veo3_cloud',
    };

    setActiveJob(newJob);

    try {
      const res = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          aspectRatio,
          resolution,
          imageBase64: imageBase64 || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to start video generation');
      }

      const updatedJob: RenderJob = {
        ...newJob,
        operationName: data.operationName,
        status: 'rendering',
        progress: 15,
      };

      setActiveJob(updatedJob);
      startPolling(updatedJob);
    } catch (err: any) {
      console.error('Generation request failed:', err);
      setActiveJob({
        ...newJob,
        status: 'failed',
        error: err.message || 'Network error occurred. Try the Free MuseTalk or Procedural Engine.',
      });
    }
  };

  const handleCancelJob = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }
    setActiveJob(null);
  };

  const handleDownloadClip = (opName: string, promptText: string) => {
    const clip = clips.find((c) => c.operationName === opName);
    if (!clip) return;

    if (clip.videoUrl.startsWith('blob:')) {
      const link = document.createElement('a');
      link.href = clip.videoUrl;
      const safeTitle = (promptText || 'ai-video-clip')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .slice(0, 32);
      link.download = `${safeTitle}-${Date.now()}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const downloadUrl = `/api/video-stream?op=${encodeURIComponent(opName)}&download=true`;
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `veo3-video-${Date.now()}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleDeleteClip = (id: string) => {
    setClips((prev) => prev.filter((c) => c.id !== id));
    if (selectedClipForPlayer?.id === id) {
      setSelectedClipForPlayer(null);
    }
  };

  const handleClearAllClips = () => {
    if (window.confirm('Are you sure you want to delete all rendered clips from your library?')) {
      setClips([]);
      setSelectedClipForPlayer(null);
    }
  };

  const handleReusePrompt = (
    reusedPrompt: string,
    reusedRatio: AspectRatio,
    reusedRes: Resolution
  ) => {
    setPrompt(reusedPrompt);
    setAspectRatio(reusedRatio);
    setResolution(reusedRes);
    setActiveTab('procedural');
  };

  const handleSelectTemplate = (templatePrompt: string) => {
    setPrompt(templatePrompt);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-cyan-500 selection:text-black">
      {/* Top Application Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        clipCount={clips.length}
        isRendering={activeJob?.status === 'rendering' || activeJob?.status === 'pending'}
        onOpenHelp={() => setIsGuideModalOpen(true)}
      />

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* General Error Banner */}
        {generalError && (
          <div className="mb-6 flex items-center justify-between rounded-xl border border-rose-500/40 bg-rose-950/40 p-4 text-sm text-rose-300">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
              <span>{generalError}</span>
            </div>
            <button
              type="button"
              onClick={() => setGeneralError(null)}
              className="text-xs font-semibold text-rose-400 hover:text-rose-200"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* TAB 0: ALIBABA WAN 2.1 VIDEO FOUNDATION MODEL (T2V & I2V) */}
        {activeTab === 'wan21' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
                    <Cpu className="h-5 w-5 text-cyan-400" />
                    <span>Alibaba Wan 2.1 Video Foundation Studio</span>
                  </h2>
                  <span className="rounded-full bg-cyan-950 px-2.5 py-0.5 text-xs font-bold text-cyan-300 border border-cyan-500/30">
                    14B & 1.3B DiT • 3D-VAE Flow Matching
                  </span>
                </div>
                <p className="mt-1 text-xs text-zinc-400">
                  Open-source state-of-the-art Text-to-Video and Image-to-Video foundation models from Alibaba Tongyi Lab with spatio-temporal flow matching.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('musetalk')}
                  className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
                >
                  Switch to MuseTalk Avatar
                </button>
              </div>
            </div>

            <Wan21Studio
              onVideoRendered={handleLocalClipRendered}
              aspectRatio={aspectRatio}
              setAspectRatio={setAspectRatio}
              resolution={resolution}
              setResolution={setResolution}
              clips={clips}
            />
          </div>
        )}

        {/* TAB 1: TENCENT HUNYUANVIDEO 13B DUAL-STREAM DIT STUDIO */}
        {activeTab === 'hunyuan' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
                    <Flame className="h-5 w-5 text-blue-400" />
                    <span>Tencent HunyuanVideo (13B Dual-Stream DiT)</span>
                  </h2>
                  <span className="rounded-full bg-blue-950 px-2.5 py-0.5 text-xs font-bold text-blue-300 border border-blue-500/30">
                    MLLM Text Encoder • 3D-VAE
                  </span>
                </div>
                <p className="mt-1 text-xs text-zinc-400">
                  Tencent's flagship 13B parameter open-source foundation model with dual-to-single stream transformer, HunyuanVideo-I2V, and Audio Emotion Module (AEM) Avatar animation.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('videouse')}
                  className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
                >
                  Switch to video-use Agent
                </button>
              </div>
            </div>

            <HunyuanVideoStudio
              onVideoRendered={handleLocalClipRendered}
              aspectRatio={aspectRatio}
              setAspectRatio={setAspectRatio}
              resolution={resolution}
              setResolution={setResolution}
              clips={clips}
            />
          </div>
        )}

        {/* TAB 2: BROWSER-USE / VIDEO-USE AI CODING AGENT STUDIO */}
        {activeTab === 'videouse' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
                    <Bot className="h-5 w-5 text-purple-400" />
                    <span>browser-use / video-use: Coding Agent Video Editor</span>
                  </h2>
                  <span className="rounded-full bg-purple-950 px-2.5 py-0.5 text-xs font-bold text-purple-300 border border-purple-500/30">
                    AI Coding Agent • Remotion Engine
                  </span>
                </div>
                <p className="mt-1 text-xs text-zinc-400">
                  Drop raw footage and prompt an autonomous coding agent to cut filler words, apply color LUTs, animate kinetic typography, and generate programmatic Remotion React timelines.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('wan21')}
                  className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
                >
                  Switch to Wan 2.1
                </button>
              </div>
            </div>

            <VideoUseStudio
              onVideoRendered={handleLocalClipRendered}
              clips={clips}
            />
          </div>
        )}

        {/* TAB 3: MUSETALK AUDIO-DRIVEN TALKING AVATAR STUDIO (ZERO KEY) */}
        {activeTab === 'musetalk' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
                    <User className="h-5 w-5 text-cyan-400" />
                    <span>MuseTalk Audio-Driven Avatar Studio</span>
                  </h2>
                  <span className="rounded-full bg-emerald-950 px-2.5 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/30">
                    100% Free • No Key
                  </span>
                </div>
                <p className="mt-1 text-xs text-zinc-400">
                  Real-time audio-to-viseme lip synchronization, natural micro-gestures, live mic analysis, and custom photo animation.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('procedural')}
                  className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
                >
                  Switch to Prompt-to-Video
                </button>
              </div>
            </div>

            <MuseTalkStudio
              onVideoRendered={handleLocalClipRendered}
              aspectRatio={aspectRatio}
              setAspectRatio={setAspectRatio}
              resolution={resolution}
              setResolution={setResolution}
            />
          </div>
        )}

        {/* TAB 2: PROCEDURAL & NEURAL PROMPT-TO-VIDEO STUDIO (ZERO KEY) */}
        {activeTab === 'procedural' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-cyan-400" />
                    <span>Procedural & Neural Prompt-to-Video</span>
                  </h2>
                  <span className="rounded-full bg-emerald-950 px-2.5 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/30">
                    60 FPS • Free
                  </span>
                </div>
                <p className="mt-1 text-xs text-zinc-400">
                  Generates cinematic scenes from text prompts, custom camera trajectories, synthesized soundtracks, and photo animation.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('musetalk')}
                  className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
                >
                  Switch to MuseTalk Avatar
                </button>
              </div>
            </div>

            <ProceduralPromptStudio
              onVideoRendered={handleLocalClipRendered}
              aspectRatio={aspectRatio}
              setAspectRatio={setAspectRatio}
              resolution={resolution}
              setResolution={setResolution}
              initialPrompt={prompt}
              onOpenTemplates={() => setIsTemplatesModalOpen(true)}
            />
          </div>
        )}

        {/* TAB 3: VEO 3 CLOUD STUDIO (OPTIONAL GEMINI KEY) */}
        {activeTab === 'veo3' && (
          <div className="space-y-6">
            <div className="border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
                  <Video className="h-5 w-5 text-cyan-400" />
                  <span>Veo 3 Cloud Video Generation</span>
                </h2>
                <span className="rounded-full bg-cyan-950 px-2.5 py-0.5 text-xs font-bold text-cyan-400 border border-cyan-500/30">
                  Cloud Backend
                </span>
              </div>
              <p className="mt-1 text-xs text-zinc-400">
                Direct integration with Google Veo 3.1 fast preview model (requires Gemini API key configured in server environment).
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <PromptUploader
                  prompt={prompt}
                  setPrompt={setPrompt}
                  aspectRatio={aspectRatio}
                  setAspectRatio={setAspectRatio}
                  resolution={resolution}
                  setResolution={setResolution}
                  imageBase64={imageBase64}
                  setImageBase64={setImageBase64}
                  onGenerate={handleStartGeneration}
                  isRendering={activeJob?.status === 'rendering' || activeJob?.status === 'pending'}
                  onOpenTemplates={() => setIsTemplatesModalOpen(true)}
                />
              </div>

              <div className="lg:col-span-5">
                <ActiveRenderView
                  job={activeJob}
                  onCancel={handleCancelJob}
                  onOpenPlayer={(clip) => setSelectedClipForPlayer(clip)}
                  onDownload={(op, pr) => handleDownloadClip(op, pr)}
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: CLIP LIBRARY */}
        {activeTab === 'library' && (
          <ClipLibrary
            clips={clips}
            onPlayClip={(clip) => setSelectedClipForPlayer(clip)}
            onDownloadClip={handleDownloadClip}
            onDeleteClip={handleDeleteClip}
            onClearAllClips={handleClearAllClips}
            onReusePrompt={handleReusePrompt}
            onGoToStudio={() => setActiveTab('musetalk')}
          />
        )}
      </main>

      {/* Video Player Modal */}
      <VideoPlayerModal
        clip={selectedClipForPlayer}
        onClose={() => setSelectedClipForPlayer(null)}
        onDownload={handleDownloadClip}
        onReusePrompt={handleReusePrompt}
      />

      {/* Prompt Templates Modal */}
      <PromptTemplatesModal
        isOpen={isTemplatesModalOpen}
        onClose={() => setIsTemplatesModalOpen(false)}
        onSelectTemplate={handleSelectTemplate}
      />

      {/* Guide & Architecture Modal */}
      <GuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />
    </div>
  );
}

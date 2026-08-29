import React, { useEffect, useState } from 'react';
import {
  Film,
  Sparkles,
  Loader2,
  AlertTriangle,
  Play,
  Download,
  Share2,
  CheckCircle2,
  Maximize2,
  Copy,
  RotateCw,
} from 'lucide-react';
import { RenderJob, VideoClip } from '../types';

interface ActiveRenderViewProps {
  activeJob: RenderJob | null;
  onCancelJob: () => void;
  onViewClip: (clip: VideoClip) => void;
  onDownload: (opName: string, prompt: string) => void;
}

const PROGRESS_STAGES = [
  { percent: 15, message: 'Analyzing semantic prompt vectors and camera constraints...' },
  { percent: 35, message: 'Synthesizing initial generative keyframes with Veo 3...' },
  { percent: 60, message: 'Calculating temporal motion flow and physical lighting...' },
  { percent: 85, message: 'Interpolating smooth cinematic motion and eliminating artifacts...' },
  { percent: 95, message: 'Encoding final MP4 video stream with H.264...' },
];

export const ActiveRenderView: React.FC<ActiveRenderViewProps> = ({
  activeJob,
  onCancelJob,
  onViewClip,
  onDownload,
}) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [simulatedProgress, setSimulatedProgress] = useState(10);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!activeJob || activeJob.status !== 'rendering') {
      setElapsedSeconds(0);
      return;
    }

    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    const progressTimer = setInterval(() => {
      setSimulatedProgress((prev) => {
        if (prev < 90) {
          return prev + Math.floor(Math.random() * 4) + 1;
        }
        return prev;
      });
    }, 2000);

    return () => {
      clearInterval(timer);
      clearInterval(progressTimer);
    };
  }, [activeJob?.status]);

  if (!activeJob) return null;

  const currentStage =
    PROGRESS_STAGES.slice()
      .reverse()
      .find((s) => simulatedProgress >= s.percent) || PROGRESS_STAGES[0];

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(activeJob.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-6 shadow-2xl backdrop-blur-md">
      {/* Active Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${
              activeJob.status === 'completed'
                ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30'
                : activeJob.status === 'failed'
                ? 'bg-rose-500/20 text-rose-400 ring-1 ring-rose-500/30'
                : 'bg-cyan-500/20 text-cyan-400 ring-1 ring-cyan-500/30'
            }`}
          >
            {activeJob.status === 'completed' ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : activeJob.status === 'failed' ? (
              <AlertTriangle className="h-5 w-5" />
            ) : (
              <Film className="h-5 w-5 animate-pulse" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-zinc-100">
                {activeJob.status === 'completed'
                  ? 'Veo 3 Render Complete!'
                  : activeJob.status === 'failed'
                  ? 'Render Failed'
                  : 'Veo 3 Clip Rendering in Progress'}
              </h3>
              <span className="rounded-md bg-zinc-800 px-2 py-0.5 font-mono text-[11px] font-medium text-zinc-300">
                {activeJob.aspectRatio}
              </span>
              <span className="rounded-md bg-zinc-800 px-2 py-0.5 font-mono text-[11px] font-medium text-zinc-300">
                {activeJob.resolution}
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              {activeJob.status === 'rendering'
                ? `Elapsed: ${elapsedSeconds}s • Model: veo-3.1-fast-generate-preview`
                : new Date(activeJob.createdAt).toLocaleTimeString()}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {activeJob.status === 'rendering' && (
            <button
              type="button"
              onClick={onCancelJob}
              className="rounded-lg border border-zinc-700/80 bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
            >
              Dismiss Monitor
            </button>
          )}

          {activeJob.status === 'completed' && activeJob.videoUrl && (
            <>
              <button
                type="button"
                onClick={() =>
                  onViewClip({
                    id: activeJob.id,
                    operationName: activeJob.operationName,
                    prompt: activeJob.prompt,
                    aspectRatio: activeJob.aspectRatio,
                    resolution: activeJob.resolution,
                    createdAt: activeJob.createdAt,
                    videoUrl: activeJob.videoUrl!,
                    model: activeJob.model,
                  })
                }
                className="flex items-center gap-1.5 rounded-lg bg-cyan-500 px-3.5 py-1.5 text-xs font-bold text-black hover:bg-cyan-400 transition-colors shadow-md shadow-cyan-500/20"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Play Fullscreen</span>
              </button>

              <button
                type="button"
                onClick={() => onDownload(activeJob.operationName, activeJob.prompt)}
                className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-700 hover:text-white transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download MP4</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Video / Preview Stage */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center">
          {activeJob.status === 'completed' && activeJob.videoUrl ? (
            <div
              className={`relative overflow-hidden rounded-xl border border-zinc-700 bg-black shadow-lg ${
                activeJob.aspectRatio === '9:16' ? 'aspect-[9/16] max-h-[460px]' : 'aspect-video w-full'
              }`}
            >
              <video
                src={activeJob.videoUrl}
                controls
                autoPlay
                loop
                playsInline
                className="h-full w-full object-cover"
              />
            </div>
          ) : activeJob.status === 'failed' ? (
            <div className="flex aspect-video w-full flex-col items-center justify-center rounded-xl border border-rose-900/50 bg-rose-950/20 p-6 text-center">
              <AlertTriangle className="h-10 w-10 text-rose-400 mb-2" />
              <p className="font-semibold text-rose-300 text-sm">Generation Encountered an Error</p>
              <p className="text-xs text-rose-400/80 mt-1 max-w-md font-mono">
                {activeJob.error || 'Please verify your prompt adheres to safety guidelines and try again.'}
              </p>
            </div>
          ) : (
            /* Rendering Simulation Canvas */
            <div
              className={`relative flex flex-col items-center justify-center overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 p-6 text-center ${
                activeJob.aspectRatio === '9:16' ? 'aspect-[9/16] max-h-[460px] w-full max-w-[260px]' : 'aspect-video w-full'
              }`}
            >
              {/* Dynamic Scanning Grid Animation */}
              <div className="absolute inset-0 bg-[radial-gradient(#0891b2_1px,transparent_1px)] [background-size:16px_16px] opacity-20"></div>
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent animate-[pulse_3s_ease-in-out_infinite]"></div>

              <div className="relative z-10 flex flex-col items-center">
                <div className="relative mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-950/80 ring-1 ring-cyan-500/40 shadow-lg shadow-cyan-500/20">
                  <Loader2 className="h-7 w-7 animate-spin text-cyan-400" />
                </div>
                <h4 className="font-semibold text-zinc-100 text-sm">Veo 3 Neural Rendering</h4>
                <p className="mt-1 text-xs text-cyan-300/80 font-mono">
                  {simulatedProgress}% Generated
                </p>
                <div className="mt-3 w-48 rounded-full bg-zinc-800 h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500 rounded-full"
                    style={{ width: `${simulatedProgress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Generation Metadata & Reassuring Messages */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Active Prompt
              </span>
              <button
                type="button"
                onClick={handleCopyPrompt}
                className="flex items-center gap-1 text-xs text-zinc-400 hover:text-cyan-300 transition-colors"
              >
                <Copy className="h-3 w-3" />
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            <div className="mt-1.5 rounded-xl border border-zinc-800 bg-zinc-950/60 p-3.5 text-xs text-zinc-200 leading-relaxed font-sans">
              "{activeJob.prompt}"
            </div>
          </div>

          {/* Progress Timeline Tracker */}
          {activeJob.status === 'rendering' && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Pipeline Phase</span>
                </span>
                <span className="text-zinc-500 font-mono">~45s total</span>
              </div>
              <p className="text-xs text-cyan-300 leading-relaxed font-medium">
                {currentStage.message}
              </p>
              <div className="space-y-1.5 pt-1">
                {PROGRESS_STAGES.map((st, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-[11px]">
                    <div
                      className={`h-1.5 w-1.5 rounded-full ${
                        simulatedProgress >= st.percent ? 'bg-cyan-400' : 'bg-zinc-700'
                      }`}
                    ></div>
                    <span
                      className={`${
                        simulatedProgress >= st.percent ? 'text-zinc-300' : 'text-zinc-600'
                      }`}
                    >
                      {st.message.slice(0, 48)}...
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Technical Specs */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-lg bg-zinc-950/60 border border-zinc-800 p-2.5">
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Engine</div>
              <div className="mt-0.5 font-bold text-zinc-200 font-mono">Veo 3 Fast</div>
            </div>
            <div className="rounded-lg bg-zinc-950/60 border border-zinc-800 p-2.5">
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Aspect</div>
              <div className="mt-0.5 font-bold text-zinc-200 font-mono">{activeJob.aspectRatio}</div>
            </div>
            <div className="rounded-lg bg-zinc-950/60 border border-zinc-800 p-2.5">
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Quality</div>
              <div className="mt-0.5 font-bold text-zinc-200 font-mono">{activeJob.resolution}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

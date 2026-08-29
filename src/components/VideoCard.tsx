import React, { useRef, useState } from 'react';
import {
  Play,
  Download,
  Trash2,
  Tv,
  Smartphone,
  Copy,
  Check,
  Sparkles,
  Maximize2,
  RefreshCw,
  Film,
  Loader2,
} from 'lucide-react';
import { VideoClip } from '../types';

interface VideoCardProps {
  clip: VideoClip;
  onPlay: (clip: VideoClip) => void;
  onDownload: (opName: string, prompt: string) => void;
  onDelete: (id: string) => void;
  onReusePrompt: (prompt: string, aspectRatio: '16:9' | '9:16', resolution: '720p' | '1080p') => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  clip,
  onPlay,
  onDownload,
  onDelete,
  onReusePrompt,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current && !isVideoLoading) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const handleCopyPrompt = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(clip.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      id={`video-card-${clip.id}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/80 shadow-lg transition-all hover:border-zinc-700 hover:shadow-xl hover:shadow-cyan-500/5 backdrop-blur-sm"
    >
      {/* Video Preview Container */}
      <div
        onClick={() => onPlay(clip)}
        className={`relative cursor-pointer overflow-hidden bg-zinc-950 flex items-center justify-center ${
          clip.aspectRatio === '9:16' ? 'aspect-[9/16] max-h-[380px]' : 'aspect-video'
        }`}
      >
        {/* Skeleton Shimmer Loader while thumbnail/video loads */}
        <div
          className={`absolute inset-0 z-0 bg-zinc-950 flex flex-col items-center justify-center transition-opacity duration-300 ${
            isVideoLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          aria-hidden={!isVideoLoading}
        >
          {/* Animated Shimmer Bar */}
          <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-zinc-800/30 to-transparent pointer-events-none" />

          <div className="flex flex-col items-center justify-center gap-2 text-zinc-600">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 shadow-inner">
              <Film className="h-5 w-5 text-zinc-500 animate-pulse" />
            </div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider flex items-center gap-1">
              <Loader2 className="h-2.5 w-2.5 animate-spin text-cyan-400" />
              Loading Preview
            </span>
          </div>
        </div>

        <video
          ref={videoRef}
          src={clip.videoUrl}
          poster={clip.inputImageBase64 || undefined}
          loop
          muted
          playsInline
          preload="metadata"
          onLoadStart={() => setIsVideoLoading(true)}
          onLoadedData={() => setIsVideoLoading(false)}
          onCanPlay={() => setIsVideoLoading(false)}
          onError={() => setIsVideoLoading(false)}
          className={`h-full w-full object-cover transition-all duration-500 group-hover:scale-105 ${
            isVideoLoading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
          }`}
        />

        {/* Aspect Ratio Badge */}
        <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1 rounded-md bg-zinc-900/80 px-2 py-1 text-[11px] font-semibold text-zinc-200 backdrop-blur-md border border-zinc-700/60">
          {clip.aspectRatio === '9:16' ? (
            <Smartphone className="h-3 w-3 text-cyan-400" />
          ) : (
            <Tv className="h-3 w-3 text-cyan-400" />
          )}
          <span>{clip.aspectRatio}</span>
        </div>

        {/* Resolution Badge */}
        <div className="absolute top-2.5 right-2.5 z-10 rounded-md bg-zinc-900/80 px-2 py-1 text-[11px] font-mono text-zinc-300 backdrop-blur-md border border-zinc-700/60">
          {clip.resolution}
        </div>

        {/* Hover Overlay Play Icon */}
        <div
          className={`absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] transition-opacity ${
            isHovered && !isVideoLoading ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500 text-black shadow-lg shadow-cyan-500/30 transition-transform group-hover:scale-110">
            <Play className="h-5 w-5 fill-current ml-0.5" />
          </div>
        </div>
      </div>

      {/* Card Info & Prompt */}
      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <p
            className="text-xs text-zinc-200 line-clamp-2 leading-relaxed"
            title={clip.prompt}
          >
            {clip.prompt}
          </p>

          <div className="mt-2.5 flex items-center justify-between text-[11px] text-zinc-500">
            <span className="font-mono">{new Date(clip.createdAt).toLocaleDateString()}</span>
            <span className="text-zinc-400 font-mono text-[10px] rounded bg-zinc-800/80 px-1.5 py-0.5">
              {clip.model || (clip.engine === 'local_musetalk' ? 'MuseTalk' : clip.engine === 'local_prompt' ? 'Procedural' : 'Veo 3')}
            </span>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="mt-3.5 flex items-center justify-between border-t border-zinc-800/80 pt-3">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleCopyPrompt}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
              title="Copy prompt"
            >
              {copied ? (
                <Check className="h-3 w-3 text-emerald-400" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              type="button"
              onClick={() => onReusePrompt(clip.prompt, clip.aspectRatio, clip.resolution)}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-cyan-400 hover:bg-cyan-950/40 hover:text-cyan-300 transition-colors"
              title="Reuse prompt in Studio"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Remix</span>
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onDownload(clip.operationName, clip.prompt)}
              className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
              title="Download MP4"
            >
              <Download className="h-3.5 w-3.5" />
            </button>

            <button
              type="button"
              onClick={() => onDelete(clip.id)}
              className="rounded-md p-1.5 text-zinc-500 hover:bg-rose-950/40 hover:text-rose-400 transition-colors"
              title="Delete clip"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

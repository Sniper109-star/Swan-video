import React, { useRef, useState, useEffect } from 'react';
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Download,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Tv,
  Smartphone,
  RefreshCw,
} from 'lucide-react';
import { VideoClip } from '../types';

interface VideoPlayerModalProps {
  clip: VideoClip | null;
  onClose: () => void;
  onDownload: (opName: string, prompt: string) => void;
  onReusePrompt: (prompt: string, aspectRatio: '16:9' | '9:16', resolution: '720p' | '1080p') => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  clip,
  onClose,
  onDownload,
  onReusePrompt,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLooping, setIsLooping] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === ' ' && clip) {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [clip, isPlaying]);

  if (!clip) return null;

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const time = parseFloat(e.target.value);
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const changeSpeed = (rate: number) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = rate;
    setPlaybackRate(rate);
  };

  const handleFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(clip.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div
      id="video-player-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 px-5 py-3.5 bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 rounded-lg bg-cyan-950/60 px-2.5 py-1 text-xs font-semibold text-cyan-300 border border-cyan-500/30">
              <Sparkles className="h-3 w-3" />
              Veo 3 Clip Preview
            </span>
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              {clip.aspectRatio === '9:16' ? (
                <Smartphone className="h-3.5 w-3.5" />
              ) : (
                <Tv className="h-3.5 w-3.5" />
              )}
              <span className="font-mono">{clip.aspectRatio}</span>
              <span>•</span>
              <span className="font-mono">{clip.resolution}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Video Canvas Stage */}
        <div className="relative flex items-center justify-center bg-black p-4">
          <div
            className={`relative overflow-hidden rounded-xl bg-zinc-950 shadow-2xl flex items-center justify-center ${
              clip.aspectRatio === '9:16'
                ? 'aspect-[9/16] max-h-[58vh] w-auto'
                : 'aspect-video w-full max-h-[58vh]'
            }`}
          >
            <video
              ref={videoRef}
              src={clip.videoUrl}
              autoPlay
              loop={isLooping}
              playsInline
              onTimeUpdate={() => {
                if (videoRef.current) {
                  setCurrentTime(videoRef.current.currentTime);
                  setDuration(videoRef.current.duration || 0);
                }
              }}
              onLoadedMetadata={() => {
                if (videoRef.current) {
                  setDuration(videoRef.current.duration || 0);
                }
              }}
              onClick={togglePlay}
              className="h-full w-full object-contain cursor-pointer"
            />
          </div>
        </div>

        {/* Playback Controls Scrubber & Buttons */}
        <div className="border-t border-zinc-800/80 bg-zinc-900/90 px-5 py-3 space-y-2">
          {/* Progress Timeline */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-zinc-400 w-10 text-right">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min="0"
              max={duration || 100}
              step="0.1"
              value={currentTime}
              onChange={handleSeek}
              className="flex-1 accent-cyan-400 cursor-pointer h-1.5 bg-zinc-700 rounded-lg"
            />
            <span className="text-xs font-mono text-zinc-500 w-10">
              {formatTime(duration)}
            </span>
          </div>

          {/* Control Bar Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={togglePlay}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-800 text-zinc-100 hover:bg-zinc-700 hover:text-white transition-colors"
                title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current ml-0.5" />}
              </button>

              <button
                type="button"
                onClick={toggleMute}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>

              {/* Loop Toggle */}
              <button
                type="button"
                onClick={() => setIsLooping(!isLooping)}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  isLooping ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/30' : 'bg-zinc-800 text-zinc-400'
                }`}
                title="Toggle Looping"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Loop</span>
              </button>

              {/* Speed Switcher */}
              <div className="flex items-center rounded-lg bg-zinc-800 p-0.5 text-xs font-medium">
                {[0.5, 1, 1.5, 2].map((speed) => (
                  <button
                    key={speed}
                    type="button"
                    onClick={() => changeSpeed(speed)}
                    className={`rounded-md px-2 py-1 transition-colors ${
                      playbackRate === speed
                        ? 'bg-zinc-700 text-cyan-300 font-bold'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleFullscreen}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
                title="Fullscreen"
              >
                <Maximize className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => onDownload(clip.operationName, clip.prompt)}
                className="flex items-center gap-1.5 rounded-lg bg-cyan-500 px-3.5 py-1.5 text-xs font-bold text-black hover:bg-cyan-400 transition-colors shadow-md shadow-cyan-500/20"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download MP4</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer with Prompt Details & Remix CTA */}
        <div className="border-t border-zinc-800 bg-zinc-950 p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                Generation Prompt
              </span>
              <p className="mt-1 text-xs text-zinc-200 leading-relaxed font-sans">
                "{clip.prompt}"
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleCopyPrompt}
                className="flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-800/80 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-700 transition-colors"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Prompt'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onReusePrompt(clip.prompt, clip.aspectRatio, clip.resolution);
                  onClose();
                }}
                className="flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-950/40 px-3 py-1.5 text-xs font-medium text-cyan-300 hover:bg-cyan-900/60 transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Remix in Studio</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

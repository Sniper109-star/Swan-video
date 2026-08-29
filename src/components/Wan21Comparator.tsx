/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Layers, Play, Pause, RotateCcw, Sliders, Sparkles, Video, SplitSquareVertical } from 'lucide-react';
import { VideoClip } from '../types';

interface Wan21ComparatorProps {
  clips: VideoClip[];
}

export const Wan21Comparator: React.FC<Wan21ComparatorProps> = ({ clips }) => {
  const [selectedClipA, setSelectedClipA] = useState<string>(clips[0]?.id || '');
  const [selectedClipB, setSelectedClipB] = useState<string>(clips[1]?.id || clips[0]?.id || '');
  const [isPlaying, setIsPlaying] = useState(false);
  const [splitPos, setSplitPos] = useState(50); // percentage 0-100
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [viewMode, setViewMode] = useState<'split' | 'side_by_side'>('split');

  const videoRefA = useRef<HTMLVideoElement>(null);
  const videoRefB = useRef<HTMLVideoElement>(null);

  const clipA = clips.find((c) => c.id === selectedClipA) || clips[0];
  const clipB = clips.find((c) => c.id === selectedClipB) || clips[1] || clips[0];

  const togglePlay = () => {
    if (!videoRefA.current || !videoRefB.current) return;

    if (isPlaying) {
      videoRefA.current.pause();
      videoRefB.current.pause();
      setIsPlaying(false);
    } else {
      videoRefA.current.playbackRate = playbackSpeed;
      videoRefB.current.playbackRate = playbackSpeed;
      videoRefA.current.play();
      videoRefB.current.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (videoRefA.current) videoRefA.current.currentTime = time;
    if (videoRefB.current) videoRefB.current.currentTime = time;
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRefA.current) videoRefA.current.playbackRate = speed;
    if (videoRefB.current) videoRefB.current.playbackRate = speed;
  };

  if (!clips || clips.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-8 text-center space-y-3">
        <Video className="mx-auto h-12 w-12 text-zinc-600" />
        <h4 className="font-bold text-zinc-200">No Video Clips to Compare</h4>
        <p className="text-xs text-zinc-400 max-w-sm mx-auto">
          Generate at least two video clips in the Wan 2.1 Studio, MuseTalk, or Prompt Studio to compare their motion fidelity side by side.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400">
            <SplitSquareVertical className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <span>Wan 2.1 A/B Frame Comparator & Motion Inspector</span>
            </h3>
            <p className="text-xs text-zinc-400">
              Synchronized side-by-side and split-screen comparison for evaluating DiT flow matching quality.
            </p>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 rounded-lg bg-zinc-950 p-1 border border-zinc-800 text-xs">
          <button
            type="button"
            onClick={() => setViewMode('split')}
            className={`rounded px-2.5 py-1 font-semibold ${
              viewMode === 'split' ? 'bg-cyan-600 text-white' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Split Curtain
          </button>
          <button
            type="button"
            onClick={() => setViewMode('side_by_side')}
            className={`rounded px-2.5 py-1 font-semibold ${
              viewMode === 'side_by_side' ? 'bg-cyan-600 text-white' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Side-by-Side
          </button>
        </div>
      </div>

      {/* Clip Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="rounded-xl border border-cyan-500/30 bg-zinc-950/70 p-3.5 space-y-2">
          <span className="font-bold text-cyan-300 block">Stream A (Left / Base):</span>
          <select
            value={selectedClipA}
            onChange={(e) => setSelectedClipA(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 p-2 text-xs text-zinc-100"
          >
            {clips.map((clip) => (
              <option key={clip.id} value={clip.id}>
                {clip.title} ({clip.model})
              </option>
            ))}
          </select>
          {clipA && (
            <p className="text-[11px] text-zinc-400 line-clamp-1 italic">"{clipA.prompt}"</p>
          )}
        </div>

        <div className="rounded-xl border border-indigo-500/30 bg-zinc-950/70 p-3.5 space-y-2">
          <span className="font-bold text-indigo-300 block">Stream B (Right / Variant):</span>
          <select
            value={selectedClipB}
            onChange={(e) => setSelectedClipB(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 p-2 text-xs text-zinc-100"
          >
            {clips.map((clip) => (
              <option key={clip.id} value={clip.id}>
                {clip.title} ({clip.model})
              </option>
            ))}
          </select>
          {clipB && (
            <p className="text-[11px] text-zinc-400 line-clamp-1 italic">"{clipB.prompt}"</p>
          )}
        </div>
      </div>

      {/* Video Viewport */}
      {viewMode === 'split' ? (
        <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-zinc-800 select-none">
          {/* Background Video (Clip B) */}
          <video
            ref={videoRefB}
            src={clipB?.videoUrl}
            loop
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute top-3 right-3 rounded bg-black/70 px-2 py-1 text-[11px] font-mono text-indigo-300">
            Stream B: {clipB?.model}
          </div>

          {/* Foreground Clipped Video (Clip A) */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ width: `${splitPos}%` }}
          >
            <video
              ref={videoRefA}
              src={clipA?.videoUrl}
              loop
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover max-w-none"
              style={{ width: `${100 / (splitPos / 100)}%` }}
            />
            <div className="absolute top-3 left-3 rounded bg-black/70 px-2 py-1 text-[11px] font-mono text-cyan-300">
              Stream A: {clipA?.model}
            </div>
          </div>

          {/* Draggable Divider Line */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-cyan-400 shadow-lg cursor-ew-resize flex items-center justify-center"
            style={{ left: `${splitPos}%` }}
          >
            <div className="h-8 w-4 rounded-full bg-cyan-500 flex items-center justify-center shadow text-black text-[10px] font-bold">
              ↔
            </div>
          </div>

          {/* Invisible Overlay Slider for drag */}
          <input
            type="range"
            min={0}
            max={100}
            value={splitPos}
            onChange={(e) => setSplitPos(Number(e.target.value))}
            className="absolute inset-0 opacity-0 cursor-ew-resize w-full h-full"
          />
        </div>
      ) : (
        /* Side by Side View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-cyan-500/30">
            <video
              ref={videoRefA}
              src={clipA?.videoUrl}
              loop
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 left-2 rounded bg-black/70 px-2 py-1 text-[11px] font-mono text-cyan-300">
              Stream A: {clipA?.model}
            </div>
          </div>

          <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-indigo-500/30">
            <video
              ref={videoRefB}
              src={clipB?.videoUrl}
              loop
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 left-2 rounded bg-black/70 px-2 py-1 text-[11px] font-mono text-indigo-300">
              Stream B: {clipB?.model}
            </div>
          </div>
        </div>
      )}

      {/* Control Bar: Synchronized Playback & Speed */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-zinc-950 p-4 border border-zinc-800 text-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={togglePlay}
            className="flex items-center gap-1.5 rounded-lg bg-cyan-600 px-4 py-2 font-bold text-white hover:bg-cyan-500 transition-colors"
          >
            {isPlaying ? (
              <>
                <Pause className="h-4 w-4 fill-current" />
                <span>Pause Both</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4 fill-current" />
                <span>Sync Play</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              if (videoRefA.current) videoRefA.current.currentTime = 0;
              if (videoRefB.current) videoRefB.current.currentTime = 0;
            }}
            className="flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Restart</span>
          </button>
        </div>

        {/* Playback Speed */}
        <div className="flex items-center gap-1.5">
          <span className="text-zinc-400">Speed:</span>
          {[0.25, 0.5, 1.0, 1.5, 2.0].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => handleSpeedChange(s)}
              className={`rounded px-2 py-1 font-mono text-[11px] ${
                playbackSpeed === s
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

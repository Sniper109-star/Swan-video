import React, { useState, useEffect } from 'react';
import {
  Film,
  Search,
  Filter,
  Tv,
  Smartphone,
  Trash2,
  Sparkles,
  ArrowRight,
  Download,
} from 'lucide-react';
import { VideoClip, AspectRatio } from '../types';
import { VideoCard } from './VideoCard';
import { VideoCardSkeleton } from './VideoCardSkeleton';

interface ClipLibraryProps {
  clips: VideoClip[];
  isLoading?: boolean;
  onPlayClip: (clip: VideoClip) => void;
  onDownloadClip: (opName: string, prompt: string) => void;
  onDeleteClip: (id: string) => void;
  onClearAllClips: () => void;
  onReusePrompt: (prompt: string, aspectRatio: '16:9' | '9:16', resolution: '720p' | '1080p') => void;
  onGoToStudio: () => void;
}

export const ClipLibrary: React.FC<ClipLibraryProps> = ({
  clips,
  isLoading = false,
  onPlayClip,
  onDownloadClip,
  onDeleteClip,
  onClearAllClips,
  onReusePrompt,
  onGoToStudio,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRatio, setFilterRatio] = useState<string>('all');
  const [isFiltering, setIsFiltering] = useState(false);

  // Subtle filter transition effect for smooth skeleton feedback
  const handleFilterChange = (ratio: string) => {
    if (ratio === filterRatio) return;
    setIsFiltering(true);
    setFilterRatio(ratio);
    setTimeout(() => setIsFiltering(false), 200);
  };

  const filteredClips = clips.filter((clip) => {
    const matchesSearch = clip.prompt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRatio = filterRatio === 'all' || clip.aspectRatio === filterRatio;
    return matchesSearch && matchesRatio;
  });

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
            <Film className="h-5 w-5 text-cyan-400" />
            <span>Generated Video Clips</span>
            <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs font-semibold text-zinc-300">
              {clips.length}
            </span>
          </h2>
          <p className="mt-1 text-xs text-zinc-400">
            All rendered video clips stored in your browser workspace
          </p>
        </div>

        {clips.length > 0 && (
          <button
            type="button"
            onClick={onClearAllClips}
            className="self-start sm:self-auto flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs font-medium text-rose-400 hover:bg-rose-950/40 hover:border-rose-800 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear Library</span>
          </button>
        )}
      </div>

      {/* Search & Filter Bar */}
      {clips.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 backdrop-blur-sm">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search prompts..."
              className="w-full rounded-lg border border-zinc-700/60 bg-zinc-950/80 py-1.5 pl-9 pr-3 text-xs text-zinc-200 placeholder-zinc-500 outline-none focus:border-cyan-500/80"
            />
          </div>

          {/* Aspect Ratio Filter Tabs */}
          <div className="flex items-center rounded-lg bg-zinc-950 p-1 border border-zinc-800">
            <button
              type="button"
              onClick={() => handleFilterChange('all')}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                filterRatio === 'all'
                  ? 'bg-zinc-800 text-cyan-300 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              All Clips
            </button>
            <button
              type="button"
              onClick={() => handleFilterChange('16:9')}
              className={`flex items-center gap-1 rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                filterRatio === '16:9'
                  ? 'bg-zinc-800 text-cyan-300 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Tv className="h-3 w-3" />
              <span>16:9</span>
            </button>
            <button
              type="button"
              onClick={() => handleFilterChange('9:16')}
              className={`flex items-center gap-1 rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                filterRatio === '9:16'
                  ? 'bg-zinc-800 text-cyan-300 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Smartphone className="h-3 w-3" />
              <span>9:16</span>
            </button>
          </div>
        </div>
      )}

      {/* Grid of Clips or Skeletons */}
      {isLoading || isFiltering ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: Math.min(Math.max(clips.length, 3), 6) }).map((_, index) => (
            <VideoCardSkeleton
              key={`skeleton-${index}`}
              idPrefix={`clip-skeleton-${index}`}
              aspectRatio={filterRatio === '9:16' ? '9:16' : '16:9'}
            />
          ))}
        </div>
      ) : filteredClips.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredClips.map((clip) => (
            <VideoCard
              key={clip.id}
              clip={clip}
              onPlay={onPlayClip}
              onDownload={onDownloadClip}
              onDelete={onDeleteClip}
              onReusePrompt={onReusePrompt}
            />
          ))}
        </div>
      ) : clips.length > 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/40 p-12 text-center">
          <Search className="h-10 w-10 text-zinc-600 mb-3" />
          <p className="text-sm font-semibold text-zinc-300">No clips match your query</p>
          <p className="text-xs text-zinc-500 mt-1">Try clearing filters or search terms</p>
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 p-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900 text-zinc-500 ring-1 ring-zinc-800">
            <Film className="h-8 w-8 text-cyan-400/80" />
          </div>
          <h3 className="text-base font-bold text-zinc-100">Your Video Library is Empty</h3>
          <p className="mt-1.5 max-w-sm text-xs text-zinc-400 leading-relaxed">
            Generate your first video clip using Wan 2.1, HunyuanVideo, video-use, or MuseTalk.
          </p>
          <button
            type="button"
            onClick={onGoToStudio}
            className="mt-6 flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 transition-all"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Open Generator Studio</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};


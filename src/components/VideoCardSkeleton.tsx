import React from 'react';
import { Film } from 'lucide-react';
import { AspectRatio } from '../types';

interface VideoCardSkeletonProps {
  aspectRatio?: AspectRatio;
  idPrefix?: string;
}

export const VideoCardSkeleton: React.FC<VideoCardSkeletonProps> = ({
  aspectRatio = '16:9',
  idPrefix = 'skeleton-card',
}) => {
  return (
    <div
      id={`${idPrefix}-${Math.random().toString(36).substring(2, 7)}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/60 shadow-lg backdrop-blur-sm"
      aria-busy="true"
      aria-label="Loading video thumbnail..."
    >
      {/* Video Preview Thumbnail Skeleton Container */}
      <div
        className={`relative overflow-hidden bg-zinc-950 flex items-center justify-center ${
          aspectRatio === '9:16' ? 'aspect-[9/16] max-h-[380px]' : 'aspect-video'
        }`}
      >
        {/* Shimmer overlay */}
        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-zinc-800/30 to-transparent pointer-events-none" />

        {/* Pulsing center icon */}
        <div className="flex flex-col items-center justify-center gap-2 text-zinc-700">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800/80 shadow-inner">
            <Film className="h-5 w-5 text-zinc-600 animate-pulse" />
          </div>
          <div className="h-2 w-20 rounded-full bg-zinc-800/80 animate-pulse" />
        </div>

        {/* Top badges skeleton */}
        <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5 rounded-md bg-zinc-900/80 px-2.5 py-1 backdrop-blur-md border border-zinc-800/80">
          <div className="h-2.5 w-2.5 rounded-full bg-zinc-700 animate-pulse" />
          <div className="h-2.5 w-8 rounded bg-zinc-700 animate-pulse" />
        </div>

        <div className="absolute top-2.5 right-2.5 z-10 rounded-md bg-zinc-900/80 px-2.5 py-1 backdrop-blur-md border border-zinc-800/80">
          <div className="h-2.5 w-7 rounded bg-zinc-700 animate-pulse" />
        </div>
      </div>

      {/* Card Info & Prompt Skeleton */}
      <div className="flex flex-1 flex-col justify-between p-4 space-y-4">
        <div className="space-y-2">
          {/* Prompt line 1 */}
          <div className="h-3.5 w-11/12 rounded-md bg-zinc-800 animate-pulse" />
          {/* Prompt line 2 */}
          <div className="h-3.5 w-3/4 rounded-md bg-zinc-800/70 animate-pulse" />

          {/* Date & Model Tag */}
          <div className="mt-3 flex items-center justify-between pt-1">
            <div className="h-2.5 w-16 rounded bg-zinc-800 animate-pulse" />
            <div className="h-4 w-20 rounded bg-zinc-800/90 border border-zinc-700/50 animate-pulse" />
          </div>
        </div>

        {/* Action Buttons Toolbar Skeleton */}
        <div className="flex items-center justify-between border-t border-zinc-800/80 pt-3">
          <div className="flex items-center gap-2">
            <div className="h-6 w-14 rounded-md bg-zinc-800/80 animate-pulse" />
            <div className="h-6 w-14 rounded-md bg-zinc-800/80 animate-pulse" />
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-7 w-7 rounded-md bg-zinc-800/80 animate-pulse" />
            <div className="h-7 w-7 rounded-md bg-zinc-800/80 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Film, Sparkles, Video, User, Layers, HelpCircle, Zap, Cpu, Bot, Flame } from 'lucide-react';
import { EngineMode } from '../types';

export type MainTabType = 'wan21' | 'hunyuan' | 'videouse' | 'musetalk' | 'procedural' | 'veo3' | 'library' | 'templates';

interface HeaderProps {
  activeTab: MainTabType;
  setActiveTab: (tab: MainTabType) => void;
  clipCount: number;
  isRendering: boolean;
  onOpenHelp: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  clipCount,
  isRendering,
  onOpenHelp,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand & Engine Status */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 shadow-lg shadow-cyan-500/20">
            <Film className="h-5 w-5 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-sans text-base sm:text-lg font-bold tracking-tight text-zinc-100">
                AI Video Generator
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-cyan-950/80 px-2.5 py-0.5 text-xs font-semibold text-cyan-300 border border-cyan-500/30">
                <Cpu className="h-3 w-3 text-cyan-400" />
                Wan 2.1 • HunyuanVideo • video-use
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Alibaba Wan 2.1 • Tencent HunyuanVideo (13B) • browser-use / video-use Agent • MuseTalk
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 rounded-xl bg-zinc-900/90 p-1 ring-1 ring-zinc-800 overflow-x-auto max-w-xl">
          <button
            id="nav-tab-wan21"
            onClick={() => setActiveTab('wan21')}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'wan21'
                ? 'bg-cyan-500/20 text-cyan-300 shadow-sm ring-1 ring-cyan-500/50'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Cpu className="h-3.5 w-3.5 text-cyan-400" />
            <span className="font-bold">Wan 2.1</span>
          </button>

          <button
            id="nav-tab-hunyuan"
            onClick={() => setActiveTab('hunyuan')}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'hunyuan'
                ? 'bg-blue-500/20 text-blue-300 shadow-sm ring-1 ring-blue-500/50'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Flame className="h-3.5 w-3.5 text-blue-400" />
            <span className="font-bold">HunyuanVideo</span>
          </button>

          <button
            id="nav-tab-videouse"
            onClick={() => setActiveTab('videouse')}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'videouse'
                ? 'bg-purple-500/20 text-purple-300 shadow-sm ring-1 ring-purple-500/50'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Bot className="h-3.5 w-3.5 text-purple-400" />
            <span className="font-bold">video-use</span>
          </button>

          <button
            id="nav-tab-musetalk"
            onClick={() => setActiveTab('musetalk')}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'musetalk'
                ? 'bg-zinc-800 text-cyan-300 shadow-sm ring-1 ring-zinc-700'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <User className="h-3.5 w-3.5 text-cyan-400" />
            <span className="hidden sm:inline">MuseTalk</span>
          </button>

          <button
            id="nav-tab-procedural"
            onClick={() => setActiveTab('procedural')}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'procedural'
                ? 'bg-zinc-800 text-cyan-300 shadow-sm ring-1 ring-zinc-700'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Prompt</span>
          </button>

          <button
            id="nav-tab-veo3"
            onClick={() => setActiveTab('veo3')}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all whitespace-nowrap ${
              activeTab === 'veo3'
                ? 'bg-zinc-800 text-cyan-300 shadow-sm ring-1 ring-zinc-700'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Video className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Veo 3</span>
          </button>

          <button
            id="nav-tab-library"
            onClick={() => setActiveTab('library')}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all whitespace-nowrap ${
              activeTab === 'library'
                ? 'bg-zinc-800 text-white shadow-sm ring-1 ring-zinc-700'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Film className="h-3.5 w-3.5 text-zinc-400" />
            <span>Clips</span>
            {clipCount > 0 && (
              <span className="rounded-full bg-cyan-950 px-1.5 py-0.2 text-[10px] font-bold text-cyan-400 border border-cyan-500/30">
                {clipCount}
              </span>
            )}
          </button>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenHelp}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <HelpCircle className="h-4 w-4 text-cyan-400" />
            <span className="hidden sm:inline">Engine Guide</span>
          </button>
        </div>
      </div>
    </header>
  );
};

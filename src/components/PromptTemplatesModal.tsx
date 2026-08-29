import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Tv,
  Smartphone,
  Copy,
  Check,
  ArrowUpRight,
  Filter,
} from 'lucide-react';
import { DEFAULT_PROMPT_IDEAS } from '../data/presets';
import { PromptIdea, AspectRatio } from '../types';

interface PromptTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPrompt: (prompt: string, aspectRatio: AspectRatio) => void;
}

export const PromptTemplatesModal: React.FC<PromptTemplatesModalProps> = ({
  isOpen,
  onClose,
  onSelectPrompt,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const categories = ['all', ...Array.from(new Set(DEFAULT_PROMPT_IDEAS.map((i) => i.category)))];

  const filteredIdeas = DEFAULT_PROMPT_IDEAS.filter(
    (idea) => selectedCategory === 'all' || idea.category === selectedCategory
  );

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 px-6 py-4 bg-zinc-900/60">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <h3 className="font-bold text-zinc-100 text-base">Veo 3 Prompt Inspirations</h3>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Production-ready video prompts designed for high fidelity motion and lighting
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 border-b border-zinc-800/80 bg-zinc-900/40 px-6 py-3 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/30'
                  : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Cards Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {filteredIdeas.map((idea) => (
              <div
                key={idea.id}
                className="flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 transition-all hover:border-zinc-700 hover:bg-zinc-900/90"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-[11px] font-semibold text-zinc-300">
                      {idea.category}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-mono text-cyan-400">
                      {idea.aspectRatio === '9:16' ? (
                        <Smartphone className="h-3 w-3" />
                      ) : (
                        <Tv className="h-3 w-3" />
                      )}
                      <span>{idea.aspectRatio}</span>
                    </span>
                  </div>

                  <h4 className="mt-2 text-sm font-bold text-zinc-100">{idea.title}</h4>
                  <p className="mt-1.5 text-xs text-zinc-300 leading-relaxed font-sans line-clamp-4">
                    "{idea.prompt}"
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-zinc-800/80 pt-3">
                  <span className="text-[11px] text-zinc-500 font-mono">Tag: {idea.tag}</span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopy(idea.id, idea.prompt)}
                      className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
                      title="Copy prompt"
                    >
                      {copiedId === idea.id ? (
                        <Check className="h-3 w-3 text-emerald-400" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                      <span>{copiedId === idea.id ? 'Copied' : 'Copy'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onSelectPrompt(idea.prompt, idea.aspectRatio);
                        onClose();
                      }}
                      className="flex items-center gap-1 rounded-md bg-cyan-500/10 px-2.5 py-1 text-xs font-semibold text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/20 transition-colors"
                    >
                      <span>Use Prompt</span>
                      <ArrowUpRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

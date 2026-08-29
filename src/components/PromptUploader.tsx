import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Image as ImageIcon,
  Trash2,
  Tv,
  Smartphone,
  Wand2,
  Camera,
  Sun,
  Palette,
  Loader2,
  Upload,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { AspectRatio, Resolution } from '../types';
import { CAMERA_OPTIONS, LIGHTING_OPTIONS, STYLE_OPTIONS } from '../data/presets';

interface PromptUploaderProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  aspectRatio: AspectRatio;
  setAspectRatio: (ar: AspectRatio) => void;
  resolution: Resolution;
  setResolution: (res: Resolution) => void;
  imageBase64: string | null;
  setImageBase64: (img: string | null) => void;
  onGenerate: () => void;
  isRendering: boolean;
  onOpenTemplates: () => void;
}

export const PromptUploader: React.FC<PromptUploaderProps> = ({
  prompt,
  setPrompt,
  aspectRatio,
  setAspectRatio,
  resolution,
  setResolution,
  imageBase64,
  setImageBase64,
  onGenerate,
  isRendering,
  onOpenTemplates,
}) => {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [selectedLighting, setSelectedLighting] = useState<string>('');
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [activeTagTab, setActiveTagTab] = useState<'camera' | 'lighting' | 'style'>('camera');
  const [dragOver, setDragOver] = useState(false);
  const [enhanceNotification, setEnhanceNotification] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleEnhancePrompt = async () => {
    if (!prompt.trim() && !imageBase64) return;
    setIsEnhancing(true);
    setEnhanceNotification(null);

    try {
      const res = await fetch('/api/enhance-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawPrompt: prompt || (imageBase64 ? 'Animate this starting image into cinematic video motion' : ''),
          cameraStyle: selectedCamera ? CAMERA_OPTIONS.find((c) => c.id === selectedCamera)?.name : undefined,
          lightingStyle: selectedLighting ? LIGHTING_OPTIONS.find((l) => l.id === selectedLighting)?.name : undefined,
          mood: selectedStyle ? STYLE_OPTIONS.find((s) => s.id === selectedStyle)?.name : undefined,
          aspectRatio,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to enhance prompt');
      }

      const data = await res.json();
      if (data.enhancedPrompt) {
        setPrompt(data.enhancedPrompt);
        setEnhanceNotification('Prompt enhanced with cinematic Veo 3 camera and lighting descriptors!');
        setTimeout(() => setEnhanceNotification(null), 5000);
      }
    } catch (err: any) {
      console.error('Enhance error:', err);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPEG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImageBase64(result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleAppendSnippet = (snippet: string) => {
    const current = prompt.trim();
    if (!current) {
      setPrompt(snippet);
    } else if (!current.toLowerCase().includes(snippet.toLowerCase().slice(0, 15))) {
      setPrompt(`${current}, ${snippet}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Prompt Card */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 sm:p-6 shadow-xl backdrop-blur-sm">
        <div className="mb-3 flex items-center justify-between">
          <label htmlFor="prompt-input" className="flex items-center gap-2 text-sm font-semibold text-zinc-200">
            <Wand2 className="h-4 w-4 text-cyan-400" />
            <span>Video Prompt</span>
            <span className="text-xs font-normal text-zinc-500">(Describe motion, scene, lighting)</span>
          </label>

          <div className="flex items-center gap-2">
            <button
              id="btn-browse-ideas"
              type="button"
              onClick={onOpenTemplates}
              className="text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Browse Inspirations →
            </button>
            {prompt && (
              <button
                type="button"
                onClick={() => setPrompt('')}
                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                title="Clear prompt"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Text Area */}
        <div className="relative">
          <textarea
            id="prompt-input"
            rows={4}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Cinematic wide drone shot gliding over misty mountain peaks at sunrise, golden light breaking through fog, ultra-smooth movement, 8k..."
            className="w-full resize-y rounded-xl border border-zinc-700/80 bg-zinc-950/80 p-4 text-sm text-zinc-100 placeholder-zinc-500 shadow-inner outline-none transition-all focus:border-cyan-500/80 focus:ring-2 focus:ring-cyan-500/20"
          />

          <div className="mt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-500">
            <div className="flex items-center gap-2">
              <button
                id="btn-ai-enhance"
                type="button"
                disabled={isEnhancing || (!prompt.trim() && !imageBase64)}
                onClick={handleEnhancePrompt}
                className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-950/40 px-3 py-1.5 font-medium text-cyan-300 transition-all hover:bg-cyan-900/60 hover:border-cyan-400/50 disabled:opacity-50 disabled:pointer-events-none"
              >
                {isEnhancing ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-400" />
                    <span>Cinematic AI Enhancing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Enhance with AI</span>
                  </>
                )}
              </button>

              <span className="text-zinc-600">|</span>
              <span>Model: <strong className="font-mono text-zinc-400">veo-3.1-fast-generate-preview</strong></span>
            </div>

            <div className="font-mono">{prompt.length} chars</div>
          </div>

          {enhanceNotification && (
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-950/30 p-2.5 text-xs text-emerald-300">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>{enhanceNotification}</span>
            </div>
          )}
        </div>

        {/* Cinematography Quick Tag Bar */}
        <div className="mt-5 border-t border-zinc-800/80 pt-4">
          <div className="mb-2.5 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Cinematic Directing Controls
            </span>
            <div className="flex items-center gap-1 rounded-lg bg-zinc-950 p-1">
              <button
                type="button"
                onClick={() => setActiveTagTab('camera')}
                className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                  activeTagTab === 'camera' ? 'bg-zinc-800 text-cyan-300' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Camera className="h-3 w-3" />
                <span>Camera Motion</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTagTab('lighting')}
                className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                  activeTagTab === 'lighting' ? 'bg-zinc-800 text-amber-300' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Sun className="h-3 w-3" />
                <span>Lighting</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTagTab('style')}
                className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                  activeTagTab === 'style' ? 'bg-zinc-800 text-purple-300' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Palette className="h-3 w-3" />
                <span>Visual Style</span>
              </button>
            </div>
          </div>

          {/* Quick Tag Chips */}
          <div className="flex flex-wrap gap-2">
            {activeTagTab === 'camera' &&
              CAMERA_OPTIONS.map((cam) => {
                const isSelected = selectedCamera === cam.id;
                return (
                  <button
                    key={cam.id}
                    type="button"
                    onClick={() => {
                      setSelectedCamera(isSelected ? '' : cam.id);
                      handleAppendSnippet(cam.promptSnippet);
                    }}
                    className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-all ${
                      isSelected
                        ? 'border-cyan-500/60 bg-cyan-950/60 text-cyan-200 shadow-sm'
                        : 'border-zinc-800 bg-zinc-950/60 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800 hover:text-white'
                    }`}
                  >
                    <span>+ {cam.name}</span>
                  </button>
                );
              })}

            {activeTagTab === 'lighting' &&
              LIGHTING_OPTIONS.map((light) => {
                const isSelected = selectedLighting === light.id;
                return (
                  <button
                    key={light.id}
                    type="button"
                    onClick={() => {
                      setSelectedLighting(isSelected ? '' : light.id);
                      handleAppendSnippet(light.promptSnippet);
                    }}
                    className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-all ${
                      isSelected
                        ? 'border-amber-500/60 bg-amber-950/60 text-amber-200 shadow-sm'
                        : 'border-zinc-800 bg-zinc-950/60 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800 hover:text-white'
                    }`}
                  >
                    <span>+ {light.name}</span>
                  </button>
                );
              })}

            {activeTagTab === 'style' &&
              STYLE_OPTIONS.map((style) => {
                const isSelected = selectedStyle === style.id;
                return (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => {
                      setSelectedStyle(isSelected ? '' : style.id);
                      handleAppendSnippet(style.promptSnippet);
                    }}
                    className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-all ${
                      isSelected
                        ? 'border-purple-500/60 bg-purple-950/60 text-purple-200 shadow-sm'
                        : 'border-zinc-800 bg-zinc-950/60 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800 hover:text-white'
                    }`}
                  >
                    <span>+ {style.name}</span>
                  </button>
                );
              })}
          </div>
        </div>
      </div>

      {/* Starting Image (Image-to-Video) + Aspect Ratio & Resolution Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Starting Image (Image-to-Video) */}
        <div className="lg:col-span-5 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 shadow-xl backdrop-blur-sm">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-cyan-400" />
              <h3 className="text-sm font-semibold text-zinc-200">Starting Frame (Optional)</h3>
            </div>
            {imageBase64 && (
              <button
                type="button"
                onClick={() => setImageBase64(null)}
                className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300"
              >
                <Trash2 className="h-3 w-3" />
                Remove
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/webp"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleImageFile(e.target.files[0]);
              }
            }}
          />

          {imageBase64 ? (
            <div className="relative overflow-hidden rounded-xl border border-zinc-700 bg-zinc-950">
              <img
                src={imageBase64}
                alt="Starting Frame"
                className="max-h-48 w-full object-contain"
              />
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between rounded-lg bg-zinc-900/90 px-3 py-1.5 backdrop-blur-md">
                <span className="text-[11px] font-medium text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Image ready for Veo 3 animation
                </span>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[11px] text-zinc-300 hover:text-white underline"
                >
                  Change
                </button>
              </div>
            </div>
          ) : (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all ${
                dragOver
                  ? 'border-cyan-400 bg-cyan-950/30'
                  : 'border-zinc-700/80 bg-zinc-950/40 hover:border-zinc-600 hover:bg-zinc-950/80'
              }`}
            >
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-zinc-400">
                <Upload className="h-5 w-5" />
              </div>
              <p className="text-xs font-semibold text-zinc-200">
                Drop image here or click to browse
              </p>
              <p className="mt-1 text-[11px] text-zinc-500">
                Veo 3 will animate your image into a video clip
              </p>
            </div>
          )}
        </div>

        {/* Aspect Ratio & Resolution Config */}
        <div className="lg:col-span-7 space-y-4">
          {/* Aspect Ratio Selector */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 shadow-xl backdrop-blur-sm">
            <div className="mb-3 flex items-center justify-between">
              <label className="text-sm font-semibold text-zinc-200">
                Aspect Ratio <span className="text-rose-400">*</span>
              </label>
              <span className="text-xs text-zinc-500 font-mono">Veo 3 Supported Ratios</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* 16:9 Landscape */}
              <button
                id="aspect-ratio-16-9"
                type="button"
                onClick={() => setAspectRatio('16:9')}
                className={`relative flex items-center gap-3 rounded-xl border p-3.5 text-left transition-all ${
                  aspectRatio === '16:9'
                    ? 'border-cyan-500/80 bg-cyan-950/30 text-white shadow-md shadow-cyan-500/10 ring-1 ring-cyan-500/50'
                    : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                }`}
              >
                <div className="flex h-10 w-14 shrink-0 items-center justify-center rounded-lg border border-current bg-zinc-900/60">
                  <Tv className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 font-semibold text-sm">
                    <span>16:9 Landscape</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    YouTube, TV, Cinema & Desktop
                  </p>
                </div>
                {aspectRatio === '16:9' && (
                  <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-cyan-400"></div>
                )}
              </button>

              {/* 9:16 Portrait */}
              <button
                id="aspect-ratio-9-16"
                type="button"
                onClick={() => setAspectRatio('9:16')}
                className={`relative flex items-center gap-3 rounded-xl border p-3.5 text-left transition-all ${
                  aspectRatio === '9:16'
                    ? 'border-cyan-500/80 bg-cyan-950/30 text-white shadow-md shadow-cyan-500/10 ring-1 ring-cyan-500/50'
                    : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                }`}
              >
                <div className="flex h-12 w-8 shrink-0 items-center justify-center rounded-lg border border-current bg-zinc-900/60">
                  <Smartphone className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 font-semibold text-sm">
                    <span>9:16 Portrait</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Shorts, TikTok, Reels & Stories
                  </p>
                </div>
                {aspectRatio === '9:16' && (
                  <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-cyan-400"></div>
                )}
              </button>
            </div>
          </div>

          {/* Resolution & Render CTA */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 shadow-xl backdrop-blur-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="text-xs font-semibold text-zinc-300">Resolution:</span>
              <div className="flex rounded-lg bg-zinc-950 p-1 border border-zinc-800">
                <button
                  type="button"
                  onClick={() => setResolution('720p')}
                  className={`rounded-md px-3 py-1 text-xs font-semibold transition-all ${
                    resolution === '720p'
                      ? 'bg-zinc-800 text-cyan-300 shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  720p HD (Fast)
                </button>
                <button
                  type="button"
                  onClick={() => setResolution('1080p')}
                  className={`rounded-md px-3 py-1 text-xs font-semibold transition-all ${
                    resolution === '1080p'
                      ? 'bg-zinc-800 text-cyan-300 shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  1080p Full HD
                </button>
              </div>
            </div>

            {/* Primary Action Button */}
            <button
              id="btn-render-clip"
              type="button"
              disabled={isRendering || (!prompt.trim() && !imageBase64)}
              onClick={onGenerate}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 transition-all hover:from-cyan-400 hover:to-blue-500 hover:shadow-cyan-500/40 active:scale-95 disabled:opacity-50 disabled:pointer-events-none disabled:shadow-none"
            >
              {isRendering ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Rendering with Veo 3...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Render Video Clip</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

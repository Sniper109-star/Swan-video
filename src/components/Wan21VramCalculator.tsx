/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Cpu, HardDrive, Zap, CheckCircle2, AlertTriangle, XCircle, Info, Layers } from 'lucide-react';
import { WanModelType } from '../types';

export const Wan21VramCalculator: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<WanModelType>('Wan2.1-T2V-14B');
  const [resolution, setResolution] = useState<'480p' | '720p' | '1080p'>('720p');
  const [precision, setPrecision] = useState<'bf16' | 'fp8' | 'int4'>('bf16');
  const [frameCount, setFrameCount] = useState<49 | 81 | 113>(81);
  const [offloadMode, setOffloadMode] = useState<'none' | 't5_cpu' | 'model_offload'>('model_offload');

  // Compute calculated VRAM
  const calculateVram = () => {
    let baseModelWeightGB = selectedModel === 'Wan2.1-T2V-1.3B' ? 2.8 : 28.0;
    const t5WeightGB = 9.5; // UMT5-XXL

    if (precision === 'fp8') {
      baseModelWeightGB *= 0.55;
    } else if (precision === 'int4') {
      baseModelWeightGB *= 0.32;
    }

    // Latent memory scaling based on resolution & frames
    const resFactor = resolution === '480p' ? 1.0 : resolution === '720p' ? 2.25 : 5.0;
    const frameFactor = frameCount / 49;
    const activationMemoryGB = 2.0 * resFactor * frameFactor;

    let totalVram = 0;
    if (offloadMode === 'none') {
      totalVram = baseModelWeightGB + t5WeightGB + activationMemoryGB;
    } else if (offloadMode === 't5_cpu') {
      totalVram = baseModelWeightGB + activationMemoryGB + 1.2; // T5 offloaded to RAM
    } else if (offloadMode === 'model_offload') {
      // Layer-by-layer sequential offload
      totalVram = Math.max(7.5, (baseModelWeightGB * 0.35) + activationMemoryGB);
    }

    return Math.round(totalVram * 10) / 10;
  };

  const requiredVram = calculateVram();

  const GPU_LIST = [
    { name: 'NVIDIA RTX 3060 / 4060 Ti (16GB)', vram: 16, type: 'Consumer' },
    { name: 'NVIDIA RTX 3090 / 4090 (24GB)', vram: 24, type: 'Prosumer Enthusiast' },
    { name: 'NVIDIA RTX 5090 (32GB)', vram: 32, type: 'Next-Gen Flagship' },
    { name: 'NVIDIA A100 / L40S (40GB / 48GB)', vram: 48, type: 'Enterprise Cloud' },
    { name: 'NVIDIA A100 / H100 SXM (80GB)', vram: 80, type: 'Data Center AI' },
    { name: 'Apple M2/M3/M4 Max (36GB - 128GB Unified)', vram: 64, type: 'Unified Apple Silicon' },
  ];

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 space-y-6">
      <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400">
          <HardDrive className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <span>Wan 2.1 VRAM & Hardware Compute Profiler</span>
            <span className="rounded bg-cyan-950 px-2 py-0.5 text-[10px] font-mono text-cyan-300 border border-cyan-500/30">
              Hardware Sizing
            </span>
          </h3>
          <p className="text-xs text-zinc-400">
            Estimate GPU memory footprint for 14B and 1.3B DiT inference across resolutions, offloading strategies, and quantization modes.
          </p>
        </div>
      </div>

      {/* Interactive Sliders & Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        {/* Model */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-3.5 space-y-2">
          <span className="font-bold text-zinc-300 block">Model Family:</span>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value as WanModelType)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 p-2 text-xs text-zinc-100"
          >
            <option value="Wan2.1-T2V-14B">Wan2.1-T2V-14B (Cinema DiT)</option>
            <option value="Wan2.1-T2V-1.3B">Wan2.1-T2V-1.3B (Turbo Fast)</option>
            <option value="Wan2.1-I2V-14B-720P">Wan2.1-I2V-14B (720P HD)</option>
            <option value="Wan2.1-I2V-14B-480P">Wan2.1-I2V-14B (480P Fast)</option>
          </select>
        </div>

        {/* Resolution */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-3.5 space-y-2">
          <span className="font-bold text-zinc-300 block">Output Resolution:</span>
          <div className="grid grid-cols-3 gap-1.5">
            {(['480p', '720p', '1080p'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setResolution(r)}
                className={`rounded-lg py-1.5 font-semibold text-xs transition-colors ${
                  resolution === r
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Precision */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-3.5 space-y-2">
          <span className="font-bold text-zinc-300 block">Weight Precision:</span>
          <div className="grid grid-cols-3 gap-1.5">
            {(['bf16', 'fp8', 'int4'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPrecision(p)}
                className={`rounded-lg py-1.5 font-semibold text-xs transition-colors ${
                  precision === p
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {p.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Offload Strategy */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-3.5 space-y-2">
          <span className="font-bold text-zinc-300 block">Offloading Strategy:</span>
          <select
            value={offloadMode}
            onChange={(e) => setOffloadMode(e.target.value as any)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 p-2 text-xs text-zinc-100"
          >
            <option value="model_offload">--offload_model True (Recommended 24GB)</option>
            <option value="t5_cpu">--t5_cpu (Only T5 to RAM)</option>
            <option value="none">No Offload (Full GPU VRAM)</option>
          </select>
        </div>
      </div>

      {/* Result Card */}
      <div className="rounded-xl border border-cyan-500/40 bg-cyan-950/20 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider block mb-1">
              Estimated Peak GPU VRAM Required
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-cyan-200 font-mono">
                ~{requiredVram} GB
              </span>
              <span className="text-xs text-zinc-400">
                ({selectedModel} @ {resolution}, {precision.toUpperCase()}, {frameCount} frames)
              </span>
            </div>
          </div>

          <div className="rounded-lg bg-zinc-900/90 px-3.5 py-2 border border-zinc-800 text-xs">
            <span className="text-zinc-400 block">System RAM Requirement:</span>
            <span className="font-bold text-zinc-200 font-mono">
              {offloadMode === 'none' ? '≥ 32 GB RAM' : '≥ 64 GB RAM (with T5 CPU offload)'}
            </span>
          </div>
        </div>
      </div>

      {/* GPU Compatibility Matrix */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
          <Cpu className="h-4 w-4 text-cyan-400" />
          Hardware Compatibility Matrix
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {GPU_LIST.map((gpu) => {
            const isCapable = gpu.vram >= requiredVram;
            const margin = gpu.vram - requiredVram;

            return (
              <div
                key={gpu.name}
                className={`rounded-xl border p-4 transition-all ${
                  isCapable
                    ? 'border-emerald-500/30 bg-emerald-950/10'
                    : 'border-rose-500/30 bg-rose-950/10'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-mono text-zinc-400 block">{gpu.type}</span>
                    <h5 className="font-bold text-xs text-zinc-100 mt-0.5">{gpu.name}</h5>
                  </div>
                  {isCapable ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-rose-400 shrink-0" />
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-zinc-800/80">
                  <span className="text-zinc-400">Total VRAM: {gpu.vram} GB</span>
                  <span
                    className={`font-semibold font-mono ${
                      isCapable ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isCapable ? `+${margin.toFixed(1)} GB Free` : `Deficit -${Math.abs(margin).toFixed(1)} GB`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

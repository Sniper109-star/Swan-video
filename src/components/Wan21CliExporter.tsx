/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Copy, Check, Terminal, FileCode, Download, Cpu, Server, Code, Sparkles } from 'lucide-react';
import { WanModelType, WanCameraMotion, AspectRatio } from '../types';

interface Wan21CliExporterProps {
  model: WanModelType;
  prompt: string;
  negativePrompt: string;
  samplingSteps: number;
  guideScale: number;
  flowShift: number;
  frames: number;
  fps: number;
  seed: number;
  cameraMotion: WanCameraMotion;
  aspectRatio: AspectRatio;
  inputImage: string | null;
}

export const Wan21CliExporter: React.FC<Wan21CliExporterProps> = ({
  model,
  prompt,
  negativePrompt,
  samplingSteps,
  guideScale,
  flowShift,
  frames,
  fps,
  seed,
  cameraMotion,
  aspectRatio,
  inputImage,
}) => {
  const [activeFormat, setActiveFormat] = useState<'bash_cli' | 'torchrun' | 'diffusers' | 'comfyui'>('bash_cli');
  const [enableOffload, setEnableOffload] = useState(true);
  const [t5Cpu, setT5Cpu] = useState(true);
  const [ditFsdp, setDitFsdp] = useState(false);
  const [ringDegree, setRingDegree] = useState(1);
  const [numGpus, setNumGpus] = useState(8);
  const [copied, setCopied] = useState(false);

  // Derive task and size
  const taskName = model === 'Wan2.1-T2V-14B' 
    ? 't2v-14B' 
    : model === 'Wan2.1-T2V-1.3B' 
    ? 't2v-1.3B' 
    : model === 'Wan2.1-I2V-14B-720P' 
    ? 'i2v-14B' 
    : 'i2v-14B';

  const sizeResolution = model.includes('480P') 
    ? (aspectRatio === '9:16' ? '480*832' : aspectRatio === '1:1' ? '480*480' : '832*480')
    : (aspectRatio === '9:16' ? '720*1280' : aspectRatio === '1:1' ? '960*960' : '1280*720');

  // Clean prompt for shell escaping
  const escapedPrompt = prompt.replace(/"/g, '\\"');
  const escapedNegPrompt = negativePrompt.replace(/"/g, '\\"');

  // 1. Official Wan 2.1 generate.py command
  const cliCommand = `# Clone official Wan 2.1 repository
git clone https://github.com/Wan-Video/Wan2.1.git
cd Wan2.1

# Install requirements
pip install -r requirements.txt

# Run Wan 2.1 inference with Flow Matching
python generate.py \\
    --task ${taskName} \\
    --size ${sizeResolution} \\
    --ckpt_dir ./Wan2.1-${taskName.toUpperCase()} \\
    --prompt "${escapedPrompt}" \\
    --negative_prompt "${escapedNegPrompt}" \\
    --sample_shift ${flowShift.toFixed(1)} \\
    --sample_guide_scale ${guideScale.toFixed(1)} \\
    --sample_steps ${samplingSteps} \\
    --frame_num ${frames} \\
    --seed ${seed}${model.includes('I2V') ? ` \\
    --image ${inputImage ? '"./input_frame.png"' : '"./assets/sample.jpg"'}` : ''}${enableOffload ? ` \\
    --offload_model True` : ''}${t5Cpu ? ` \\
    --t5_cpu` : ''}`;

  // 2. Multi-GPU Torchrun distributed command with FSDP & Ring Attention
  const torchrunCommand = `# Multi-GPU Distributed Wan 2.1 Inference (${numGpus} GPUs)
torchrun --nproc_per_node=${numGpus} generate.py \\
    --task ${taskName} \\
    --size ${sizeResolution} \\
    --ckpt_dir ./Wan2.1-${taskName.toUpperCase()} \\
    --dit_fsdp${ditFsdp ? ' \\' : ''} \\
    --ring_degree ${ringDegree} \\
    --prompt "${escapedPrompt}" \\
    --sample_shift ${flowShift.toFixed(1)} \\
    --sample_guide_scale ${guideScale.toFixed(1)} \\
    --sample_steps ${samplingSteps} \\
    --frame_num ${frames} \\
    --seed ${seed}${model.includes('I2V') ? ` \\
    --image ${inputImage ? '"./input_frame.png"' : '"./assets/sample.jpg"'}` : ''}`;

  // 3. Hugging Face Diffusers Python Script
  const diffusersScript = `import torch
from diffusers import ${model.includes('I2V') ? 'WanImageToVideoPipeline' : 'WanPipeline'}
from diffusers.utils import export_to_video, load_image

# 1. Load Wan 2.1 Foundation Model in bfloat16
model_id = "Wan-AI/${model}"
pipeline = ${model.includes('I2V') ? 'WanImageToVideoPipeline' : 'WanPipeline'}.from_pretrained(
    model_id,
    torch_dtype=torch.bfloat16
)

# 2. Enable CPU offloading to run on 24GB GPUs (RTX 4090 / 3090)
${enableOffload ? 'pipeline.enable_model_cpu_offload()' : 'pipeline.to("cuda")'}

# 3. Generate 3D-VAE Latent Flow Video
prompt = """${escapedPrompt}"""
negative_prompt = """${escapedNegPrompt}"""
${model.includes('I2V') ? 'image = load_image("./input_frame.png")\n' : ''}
output = pipeline(
    prompt=prompt,
    negative_prompt=negative_prompt,${model.includes('I2V') ? '\n    image=image,' : ''}
    height=${sizeResolution.split('*')[1] || 720},
    width=${sizeResolution.split('*')[0] || 1280},
    num_frames=${frames},
    guidance_scale=${guideScale.toFixed(1)},
    num_inference_steps=${samplingSteps},
    generator=torch.Generator(device="cuda").manual_seed(${seed}),
).frames[0]

# 4. Save video
export_to_video(output, "output_wan21.mp4", fps=${fps})
print("Video successfully rendered: output_wan21.mp4")
`;

  // 4. ComfyUI Workflow JSON
  const comfyUiWorkflow = JSON.stringify(
    {
      last_node_id: 12,
      last_link_id: 15,
      nodes: [
        {
          id: 1,
          type: "Wan21ModelLoader",
          widgets_values: [model, "bf16", enableOffload ? "enable_offload" : "gpu_only"],
        },
        {
          id: 2,
          type: "WanTextEncode",
          widgets_values: [prompt, negativePrompt, "UMT5-XXL + CLIP-ViT"],
        },
        {
          id: 3,
          type: "WanFlowMatchingSampler",
          widgets_values: [samplingSteps, guideScale, flowShift, "Euler-Flow", seed],
        },
        {
          id: 4,
          type: "Wan3DVAEDecode",
          widgets_values: [frames, fps, sizeResolution],
        },
        {
          id: 5,
          type: "SaveVideoMP4",
          widgets_values: ["Wan21_output.mp4", "h264"],
        },
      ],
      extra: {
        model_family: "Wan2.1",
        camera_choreography: cameraMotion,
      },
    },
    null,
    2
  );

  const getActiveCode = () => {
    switch (activeFormat) {
      case 'bash_cli':
        return cliCommand;
      case 'torchrun':
        return torchrunCommand;
      case 'diffusers':
        return diffusersScript;
      case 'comfyui':
        return comfyUiWorkflow;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getActiveCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const code = getActiveCode();
    const filename =
      activeFormat === 'bash_cli' || activeFormat === 'torchrun'
        ? 'run_wan21.sh'
        : activeFormat === 'diffusers'
        ? 'infer_wan21.py'
        : 'wan21_workflow.json';

    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400">
            <Terminal className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <span>Wan 2.1 CLI & Python Script Exporter</span>
              <span className="rounded bg-cyan-950 px-2 py-0.5 text-[10px] font-mono text-cyan-300 border border-cyan-500/30">
                Official Repository Syntax
              </span>
            </h3>
            <p className="text-xs text-zinc-400">
              Generate ready-to-run PyTorch scripts, distributed bash runners, and ComfyUI configurations matching your current parameters.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 hover:text-white transition-colors"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy Script</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-1.5 rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-cyan-500 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* Format Selector Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-800/80 pb-3">
        <button
          type="button"
          onClick={() => setActiveFormat('bash_cli')}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
            activeFormat === 'bash_cli'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 bg-zinc-950/60'
          }`}
        >
          <Terminal className="h-3.5 w-3.5" />
          <span>Official generate.py (Single GPU)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFormat('torchrun')}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
            activeFormat === 'torchrun'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 bg-zinc-950/60'
          }`}
        >
          <Server className="h-3.5 w-3.5" />
          <span>Multi-GPU FSDP (Torchrun)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFormat('diffusers')}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
            activeFormat === 'diffusers'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 bg-zinc-950/60'
          }`}
        >
          <Code className="h-3.5 w-3.5" />
          <span>Hugging Face Diffusers</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFormat('comfyui')}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
            activeFormat === 'comfyui'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 bg-zinc-950/60'
          }`}
        >
          <FileCode className="h-3.5 w-3.5" />
          <span>ComfyUI Node Graph (JSON)</span>
        </button>
      </div>

      {/* Hardware / Offload Toggles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <label className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950/70 p-3 cursor-pointer hover:border-zinc-700">
          <input
            type="checkbox"
            checked={enableOffload}
            onChange={(e) => setEnableOffload(e.target.checked)}
            className="rounded accent-cyan-500"
          />
          <div>
            <span className="font-semibold text-zinc-200 block">--offload_model True</span>
            <span className="text-[11px] text-zinc-400">Fits 14B into 24GB VRAM (RTX 4090)</span>
          </div>
        </label>

        <label className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950/70 p-3 cursor-pointer hover:border-zinc-700">
          <input
            type="checkbox"
            checked={t5Cpu}
            onChange={(e) => setT5Cpu(e.target.checked)}
            className="rounded accent-cyan-500"
          />
          <div>
            <span className="font-semibold text-zinc-200 block">--t5_cpu</span>
            <span className="text-[11px] text-zinc-400">Offloads UMT5-XXL to System RAM</span>
          </div>
        </label>

        {activeFormat === 'torchrun' && (
          <>
            <label className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950/70 p-3 cursor-pointer hover:border-zinc-700">
              <input
                type="checkbox"
                checked={ditFsdp}
                onChange={(e) => setDitFsdp(e.target.checked)}
                className="rounded accent-cyan-500"
              />
              <div>
                <span className="font-semibold text-zinc-200 block">--dit_fsdp</span>
                <span className="text-[11px] text-zinc-400">DiT Fully Sharded Data Parallel</span>
              </div>
            </label>

            <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-3">
              <span className="font-semibold text-zinc-200 block mb-1">GPU Count (--nproc):</span>
              <select
                value={numGpus}
                onChange={(e) => setNumGpus(Number(e.target.value))}
                className="w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-200"
              >
                <option value={2}>2x GPUs</option>
                <option value={4}>4x GPUs</option>
                <option value={8}>8x GPUs (Cluster)</option>
              </select>
            </div>
          </>
        )}
      </div>

      {/* Code Viewer */}
      <div className="relative rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden">
        <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/60 px-4 py-2 text-xs font-mono text-zinc-400">
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-cyan-500/80" />
            {activeFormat === 'bash_cli' || activeFormat === 'torchrun'
              ? 'run_wan21.sh'
              : activeFormat === 'diffusers'
              ? 'generate_wan.py'
              : 'comfyui_wan_workflow.json'}
          </span>
          <span>{model} • Flow Shift {flowShift.toFixed(1)}</span>
        </div>

        <pre className="p-4 text-xs font-mono text-cyan-300/90 overflow-x-auto leading-relaxed max-h-96">
          <code>{getActiveCode()}</code>
        </pre>
      </div>
    </div>
  );
};

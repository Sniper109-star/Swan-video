# 🎬 AI Video Generator Engine Suite

[![AI Video Suite](https://img.shields.io/badge/AI%20Video-Wan%202.1%20%7C%20HunyuanVideo%20%7C%20video--use-blue?style=for-the-badge&logo=film)](https://github.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)
[![GitHub Actions CI](https://img.shields.io/badge/GitHub%20Actions-Video%20Generation%20Pipeline-purple?style=for-the-badge&logo=githubactions)](.github/workflows/video-generation.yml)
[![Node.js 20+](https://img.shields.io/badge/Node.js-20%2B-339933?style=for-the-badge&logo=nodedotjs)](https://nodejs.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com)

A comprehensive, state-of-the-art open-source AI video creation and editing studio bringing together Alibaba **Wan 2.1**, Tencent **HunyuanVideo (13B)**, the **browser-use / video-use** AI coding agent, **MuseTalk** audio-driven lip-sync avatars, and a high-performance **WebCodecs/Canvas Procedural Neural Engine**.

---

## 🌟 Core Engine Capabilities

```
┌────────────────────────────────────────────────────────────────────────────────┐
│                          AI Video Generator Studio                             │
├──────────────────┬──────────────────┬──────────────────┬───────────────────────┤
│  Alibaba Wan 2.1 │ HunyuanVideo 13B │ video-use Agent  │ MuseTalk Avatar / Procedural
├──────────────────┼──────────────────┼──────────────────┼───────────────────────┤
│ • 14B & 1.3B DiT │ • Dual-Stream DiT│ • AI Video Coder │ • Audio Lip-Sync      │
│ • Flow Matching  │ • MLLM Encoder   │ • Remotion Code  │ • 10+ Neural Themes   │
│ • 3D-VAE & T2V   │ • 3D Causal VAE  │ • Silence Cutter │ • Real-Time WebCodecs │
│ • I2V & Extender │ • AEM Avatar     │ • Auto Subtitles │ • Synth Audio Track   │
└──────────────────┴──────────────────┴──────────────────┴───────────────────────┘
```

### 1. 🚀 Alibaba Wan 2.1 (14B / 1.3B DiT Foundation Models)
- **Wan2.1-T2V-14B & 1.3B**: Text-to-video foundation models powered by 3D-VAE compression and continuous flow matching.
- **Wan2.1-I2V-14B (720p/480p)**: Image-to-video motion synthesis with first-frame conditioning and anchor guidance.
- **Prompt Refiner**: Enhances raw prompts into cinema-grade visual instructions.
- **VRAM Calculator & Hardware Profiler**: Memory estimations for BF16, FP8, and INT4 across RTX 3090, 4090, 5090, and Datacenter GPUs.
- **CLI & Code Exporter**: Generates runnable PyTorch CLI scripts, ComfyUI workflows, and Hugging Face Diffusers pipelines.

### 2. ⚡ Tencent HunyuanVideo (13B Dual-Stream DiT)
- **13B Parameter Foundation Architecture**: Dual-stream to single-stream transformer processing text tokens and video latents with cross-attention fusion.
- **MLLM Text Encoder**: Advanced prompt understanding and fine-grained spatial-temporal alignment.
- **Audio Emotion Module (AEM) Avatar**: Dynamic emotion and lip-synchronization for talking characters.
- **Flow Shift ($\mu$) Optimization**: Configurable Euler ODE step schedule ($\mu = 7.0$ for 720p, $\mu = 5.0$ for 544p).

### 3. 🤖 browser-use / video-use (AI Coding Agent Video Editor)
- **Autonomous Video Coding Agent**: Describe edits in natural language (*"Cut pauses, add TikTok kinetic captions, apply cinematic warm color grading"*).
- **Interactive Multi-Track Timeline**: Live tracks for video segments, word-by-word highlighted captions, visual callouts, and audio ducking.
- **Remotion React Exporter**: Generates synchronized, production-ready `<Composition>`, `<Video>`, and `<Sequence>` components.

### 4. 🎙️ MuseTalk (Audio-Driven Lip-Sync Engine)
- Zero-API-key client-side audio lip-sync avatar animator.
- Live microphone recorder, synthetic speech generator, or custom audio upload.
- Realistic mouth viseme mapping and synchronized facial kinematics.

### 5. 🎨 Procedural & Neural Video Engine
- 10+ procedural scenes: *Cyberpunk City, Deep Space Nebula, Enchanted Forest, Volcanic Magma, Matrix Code Rain, Aurora Borealis, Hyperdrive Warp, Deep Underwater, Desert Dune Storm, and Data Tunnel*.
- Synthetic background music generator with multiple cinematic moods.
- Export directly to WebM/MP4 with high bitrate WebCodecs encoding.

---

## 🚀 GitHub Actions Video Generation Pipeline

This repository includes a native GitHub Actions workflow (`.github/workflows/video-generation.yml`) for automated, headless AI video generation in CI/CD pipelines.

### Triggering via GitHub Web UI (`workflow_dispatch`)
1. Navigate to the **Actions** tab in your GitHub repository.
2. Select **"AI Video Generation & CI/CD Pipeline"**.
3. Click **"Run workflow"** and specify:
   - **Prompt**: e.g., *"Cinematic aerial flyover of a neon cyberpunk metropolis in rain"*
   - **Model Engine**: `Wan2.1-T2V-14B`, `HunyuanVideo-13B`, `video-use-agent`, etc.
   - **Aspect Ratio**: `16:9` widescreen or `9:16` portrait.
   - **Duration**: Duration in seconds (e.g., `5`).
   - **Sampling Steps**: Diffusion / Flow matching steps (e.g., `40`).
4. Once completed, download the rendered video artifact directly from the workflow summary!

---

## 💻 Local Quickstart

### Prerequisites
- **Node.js**: v18.0.0 or higher (v20 recommended)
- **npm** or **bun** / **yarn**

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/ai-video-generator.git
cd ai-video-generator

# Install dependencies
npm install

# Start the full-stack dev server (Vite + Express)
npm run dev
```

Visit `http://localhost:3000` in your browser.

---

## 🛠️ CLI Headless Video Generator

You can also generate videos locally from the command line using the included headless rendering script:

```bash
# Generate a 16:9 cinematic video clip
node scripts/generate-video.js \
  --prompt "Bioluminescent coral reef with shimmering jellyfish" \
  --model "HunyuanVideo-13B" \
  --aspect-ratio "16:9" \
  --duration 5 \
  --steps 40 \
  --output output_renders/reef_video.mp4
```

### CLI Arguments

| Argument | Description | Default |
|---|---|---|
| `--prompt` | Text prompt describing the video scene | Cyberpunk city |
| `--model` | Target foundation model / engine | `Wan2.1-T2V-14B` |
| `--aspect-ratio` | `16:9` (landscape) or `9:16` (portrait) | `16:9` |
| `--duration` | Output video length in seconds | `5` |
| `--steps` | Diffusion sampling / Euler ODE steps | `40` |
| `--output` | Destination output video file path | `output_renders/generated_video.mp4` |

---

## 📦 Project Architecture

```
ai-video-generator/
├── .github/
│   └── workflows/
│       └── video-generation.yml    # GitHub Actions automated video generation
├── scripts/
│   └── generate-video.js          # Headless CLI video generation script
├── src/
│   ├── components/
│   │   ├── Wan21Studio.tsx        # Alibaba Wan 2.1 DiT generation studio
│   │   ├── HunyuanVideoStudio.tsx # Tencent HunyuanVideo 13B foundation studio
│   │   ├── VideoUseStudio.tsx     # browser-use / video-use AI coding agent
│   │   ├── MuseTalkStudio.tsx     # MuseTalk audio lip-sync avatar generator
│   │   ├── ProceduralPromptStudio.tsx # Real-time prompt-to-video synthesizer
│   │   ├── ClipLibrary.tsx        # Video clip library with skeleton loaders
│   │   ├── VideoCard.tsx          # Card preview with shimmer loaders
│   │   ├── VideoCardSkeleton.tsx  # Shimmer skeleton loader component
│   │   └── Header.tsx             # Main navigation bar
│   ├── utils/
│   │   ├── proceduralVideoEngine.ts # 10+ procedural visual scene renderers
│   │   ├── videoRecorder.ts       # Canvas & audio WebCodecs / MediaRecorder
│   │   ├── audioSynth.ts          # Procedural background music synthesizer
│   │   └── lipSyncEngine.ts       # Audio viseme tracking for MuseTalk
│   ├── types.ts                   # TypeScript interfaces and model definitions
│   ├── App.tsx                    # Main app container & tab router
│   └── index.css                  # Tailwind styles & shimmer keyframes
├── server.ts                      # Express API & Vite SSR server
├── package.json                   # Dependencies & npm scripts
└── metadata.json                  # App metadata configuration
```

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

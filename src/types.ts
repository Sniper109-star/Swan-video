export type EngineMode = 'local_musetalk' | 'local_prompt' | 'wan21_dit' | 'hunyuan_video' | 'video_use' | 'veo3_cloud';
export type AspectRatio = '16:9' | '9:16' | '4:3' | '1:1';
export type Resolution = '480p' | '544p' | '720p' | '1080p';
export type JobStatus = 'idle' | 'pending' | 'submitting' | 'rendering' | 'completed' | 'failed';

export type WanModelType =
  | 'Wan2.1-T2V-14B'
  | 'Wan2.1-T2V-1.3B'
  | 'Wan2.1-I2V-14B-720P'
  | 'Wan2.1-I2V-14B-480P';

export type HunyuanModelType =
  | 'HunyuanVideo-13B'
  | 'HunyuanVideo-I2V'
  | 'HunyuanVideo-Avatar';

export type HunyuanCameraTrajectory =
  | 'static'
  | 'slow_dolly_zoom'
  | 'horizontal_pan_left'
  | 'horizontal_pan_right'
  | 'pedestal_up'
  | 'pedestal_down'
  | 'arc_rotation'
  | 'orbit_360'
  | 'fpv_dive';

export interface HunyuanConfig {
  model: HunyuanModelType;
  samplingSteps: number;
  guideScale: number;
  flowShift: number;
  frames: number;
  fps: number;
  negativePrompt: string;
  seed: number;
  cameraTrajectory: HunyuanCameraTrajectory;
  mllmRewrite: boolean;
  precision: 'bf16' | 'fp8' | 'int4';
}

// Video-Use Types (browser-use/video-use Coding Agent Video Editor)
export interface VideoUseTrack {
  id: string;
  name: string;
  type: 'video' | 'audio' | 'captions' | 'overlay' | 'effects';
  muted?: boolean;
  locked?: boolean;
}

export interface VideoUseTimelineItem {
  id: string;
  trackId: string;
  title: string;
  startTime: number;
  duration: number;
  mediaUrl?: string;
  text?: string;
  color?: string;
  type: 'clip' | 'caption' | 'music' | 'sfx' | 'sticker' | 'filter';
  params?: Record<string, any>;
}

export interface VideoUseAgentAction {
  type: string;
  description: string;
  params?: Record<string, any>;
}

export interface VideoUseCaption {
  start: number;
  end: number;
  text: string;
  highlight?: string;
  style?: 'kinetic' | 'minimal' | 'cyberpunk' | 'classic';
}

export interface VideoUseFilters {
  brightness: number;
  contrast: number;
  saturation: number;
  warmth: number;
  vignette: number;
  blur: number;
  sepia?: number;
  grain?: number;
}

export type WanCameraMotion =
  | 'static'
  | 'pan_left'
  | 'pan_right'
  | 'tilt_up'
  | 'tilt_down'
  | 'zoom_in'
  | 'zoom_out'
  | 'orbit_3d'
  | 'fpv_crane'
  | 'dutch_roll';

export interface WanConfig {
  model: WanModelType;
  samplingSteps: number;
  guideScale: number;
  flowShift: number;
  frames: number;
  fps: number;
  negativePrompt: string;
  motionScore: number;
  seed: number;
  cameraMotion: WanCameraMotion;
  promptExpansion: boolean;
}

export interface CameraOption {
  id: string;
  name: string;
  description: string;
  promptSnippet: string;
  iconName?: string;
}

export interface LightingOption {
  id: string;
  name: string;
  description: string;
  promptSnippet: string;
}

export interface StyleOption {
  id: string;
  name: string;
  description: string;
  promptSnippet: string;
}

export interface AvatarPreset {
  id: string;
  name: string;
  role: string;
  gender: 'female' | 'male' | 'android' | 'anime';
  avatarUrl: string;
  accentColor: string;
  defaultEmotion: 'neutral' | 'happy' | 'serious' | 'energetic';
  voicePitch: number;
  voiceRate: number;
}

export interface BackdropOption {
  id: string;
  name: string;
  category: string;
  previewColor: string;
  type: 'gradient' | 'cyberpunk' | 'office' | 'stage' | 'nature' | 'green_screen';
}

export interface AudioTrackOption {
  id: string;
  name: string;
  genre: string;
  tempoBpm: number;
  description: string;
}

export interface RenderJob {
  id: string;
  operationName: string;
  prompt: string;
  aspectRatio: AspectRatio;
  resolution: Resolution;
  createdAt: number;
  status: JobStatus;
  progress?: number;
  progressPercent?: number;
  statusMessage?: string;
  error?: string;
  videoUrl?: string;
  videoUri?: string;
  downloadUrl?: string;
  model?: string;
  engine: EngineMode;
  imageBase64?: string;
  inputImageBase64?: string;
  durationSeconds?: number;
}

export interface VideoClip {
  id: string;
  title: string;
  operationName: string;
  prompt: string;
  aspectRatio: AspectRatio;
  resolution: Resolution;
  createdAt: number;
  videoUrl: string;
  model: string;
  engine: EngineMode;
  isFavorite?: boolean;
  inputImageBase64?: string;
  durationSeconds?: number;
  audioTrackName?: string;
  avatarName?: string;
}

export interface PromptIdea {
  id: string;
  title: string;
  category: string;
  aspectRatio: AspectRatio;
  prompt: string;
  tag: string;
  sceneTheme?: string;
}

export interface VisemeFrame {
  time: number;
  mouthOpen: number;
  mouthWide: number;
  mouthRound: number;
  mouthSmile: number;
  headTilt: number;
  headNod: number;
  blink: number;
}

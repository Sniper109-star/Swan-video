import { AvatarPreset, BackdropOption, AudioTrackOption, PromptIdea } from '../types';

export const AVATAR_PRESETS: AvatarPreset[] = [
  {
    id: 'elena-tech',
    name: 'Elena Vance',
    role: 'AI Keynote Presenter',
    gender: 'female',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80',
    accentColor: '#38bdf8',
    defaultEmotion: 'energetic',
    voicePitch: 1.05,
    voiceRate: 1.0,
  },
  {
    id: 'marcus-exec',
    name: 'Marcus Sterling',
    role: 'Executive Director',
    gender: 'male',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=500&auto=format&fit=crop&q=80',
    accentColor: '#0ea5e9',
    defaultEmotion: 'serious',
    voicePitch: 0.9,
    voiceRate: 0.95,
  },
  {
    id: 'nova-android',
    name: 'Nova-7',
    role: 'Cybernetic Android',
    gender: 'android',
    avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80',
    accentColor: '#06b6d4',
    defaultEmotion: 'neutral',
    voicePitch: 1.15,
    voiceRate: 1.05,
  },
  {
    id: 'aoi-anime',
    name: 'Aoi Sakura',
    role: 'Virtual Streamer',
    gender: 'anime',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
    accentColor: '#f43f5e',
    defaultEmotion: 'happy',
    voicePitch: 1.25,
    voiceRate: 1.1,
  },
];

export const BACKDROP_OPTIONS: BackdropOption[] = [
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Studio',
    category: 'Sci-Fi',
    previewColor: '#0f172a',
    type: 'cyberpunk',
  },
  {
    id: 'office',
    name: 'Modern Executive Office',
    category: 'Corporate',
    previewColor: '#1e293b',
    type: 'office',
  },
  {
    id: 'stage',
    name: 'Neon Stage & Spotlights',
    category: 'Event',
    previewColor: '#2e1065',
    type: 'stage',
  },
  {
    id: 'green_screen',
    name: 'Green Screen (Chroma Key)',
    category: 'Production',
    previewColor: '#00ff00',
    type: 'green_screen',
  },
];

export const AUDIO_TRACK_OPTIONS: AudioTrackOption[] = [
  {
    id: 'synthwave',
    name: 'Cyber Synthwave 80s',
    genre: 'synthwave',
    tempoBpm: 120,
    description: 'Energetic pulsing bassline with retro 80s drums',
  },
  {
    id: 'cinematic',
    name: 'Cinematic Ambient Warmth',
    genre: 'cinematic',
    tempoBpm: 80,
    description: 'Lush harmonic pads and sweeping atmospheric chords',
  },
  {
    id: 'space',
    name: 'Interstellar Deep Drone',
    genre: 'space',
    tempoBpm: 60,
    description: 'Hypnotic sub-bass drone with resonant cosmic sweeps',
  },
  {
    id: 'lofi',
    name: 'Chill Lofi Coffee Beats',
    genre: 'lofi',
    tempoBpm: 75,
    description: 'Mellow Rhodes piano chords with relaxed rhythm',
  },
  {
    id: 'none',
    name: 'No Background Music',
    genre: 'none',
    tempoBpm: 0,
    description: 'Clean silence / voice only',
  },
];

export const SAMPLE_SCRIPTS = [
  {
    title: 'Product Announcement',
    text: "Welcome to the next generation of AI video creation. With our in-browser neural rendering engine, you can generate cinematic clips and high-fidelity talking avatars in real time with zero API key required.",
  },
  {
    title: 'Cyberpunk Intro',
    text: "Initializing neural connection to the mainframe. The city lights never sleep, and the digital frontier expands beyond the horizon. Welcome to Neo-Tokyo.",
  },
  {
    title: 'Tech Keynote',
    text: "Today we are unveiling a breakthrough in real-time audio-driven lip synchronization. Every viseme, expression, and camera motion is calculated instantaneously.",
  },
];

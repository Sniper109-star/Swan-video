import { CameraOption, LightingOption, StyleOption, PromptIdea } from '../types';

export const CAMERA_OPTIONS: CameraOption[] = [
  {
    id: 'drone-aerial',
    name: 'Drone Flyover',
    description: 'Sweeping high-altitude aerial view',
    promptSnippet: 'sweeping cinematic drone aerial flyover shot, smooth high angle motion',
    iconName: 'Plane',
  },
  {
    id: 'dolly-zoom',
    name: 'Dolly Push-In',
    description: 'Slow forward camera push toward subject',
    promptSnippet: 'slow cinematic forward dolly push-in shot focusing on the subject',
    iconName: 'MoveRight',
  },
  {
    id: 'orbit-360',
    name: 'Orbit 360°',
    description: 'Smooth rotational pan around subject',
    promptSnippet: '360-degree smooth orbital camera rotation around the central subject',
    iconName: 'RotateCcw',
  },
  {
    id: 'fpv-dynamic',
    name: 'FPV Action',
    description: 'Fast-paced immersive follow cam',
    promptSnippet: 'fast-paced dynamic FPV first-person follow camera skimming smoothly through the scene',
    iconName: 'Zap',
  },
  {
    id: 'macro-slowmo',
    name: 'Macro Close-Up',
    description: 'Ultra detailed extreme close-up',
    promptSnippet: 'extreme macro close-up with shallow depth of field, delicate particle focus',
    iconName: 'Eye',
  },
  {
    id: 'low-angle-hero',
    name: 'Low-Angle Hero',
    description: 'Monumental upward perspective',
    promptSnippet: 'monumental low-angle hero shot panning upward with dramatic perspective',
    iconName: 'Compass',
  },
];

export const LIGHTING_OPTIONS: LightingOption[] = [
  {
    id: 'golden-hour',
    name: 'Golden Hour',
    description: 'Warm, low-angle sunset glow',
    promptSnippet: 'bathed in rich warm golden hour sunlight with soft lens flares and long shadows',
  },
  {
    id: 'cyber-neon',
    name: 'Cyberpunk Neon',
    description: 'Vibrant neon reflections & contrast',
    promptSnippet: 'vivid cyan and magenta neon illumination with reflective wet surfaces and moody shadows',
  },
  {
    id: 'studio-cinematic',
    name: 'Studio Rim Light',
    description: 'Clean high-contrast rim highlights',
    promptSnippet: 'professional cinema studio lighting with sharp rim light and soft volumetric fill',
  },
  {
    id: 'volumetric-fog',
    name: 'Volumetric Haze',
    description: 'Atmospheric god rays through mist',
    promptSnippet: 'atmospheric volumetric god rays cutting through ambient morning mist and light haze',
  },
  {
    id: 'dark-noir',
    name: 'Moody Noir',
    description: 'High contrast dramatic chiaroscuro',
    promptSnippet: 'deep moody noir shadows, high contrast chiaroscuro lighting with subtle ambient highlights',
  },
];

export const STYLE_OPTIONS: StyleOption[] = [
  {
    id: 'hyper-real',
    name: 'Hyper-Realistic',
    description: 'Ultra crisp 8k photorealism',
    promptSnippet: 'photorealistic 8k, ultra-sharp detail, natural organic textures, Panavision 65mm look',
  },
  {
    id: 'vintage-film',
    name: '35mm Film Stock',
    description: 'Warm analog grain & cinema tones',
    promptSnippet: 'authentic 35mm film grain, warm nostalgic kodachrome color grading, subtle film gate weave',
  },
  {
    id: 'anime-motion',
    name: 'Anime Cinematic',
    description: 'High production anime aesthetic',
    promptSnippet: 'high-end Makoto Shinkai style anime aesthetics, vibrant hand-painted backgrounds, fluid 24fps motion',
  },
  {
    id: 'unreal-engine',
    name: 'CGI Next-Gen',
    description: 'Unreal Engine 5 octane render look',
    promptSnippet: 'Unreal Engine 5 hyper-detailed CGI render, raytraced reflections, subsurface scattering, octane render',
  },
];

export const DEFAULT_PROMPT_IDEAS: PromptIdea[] = [
  {
    id: 'idea-1',
    title: 'Futuristic High-Speed Train',
    category: 'Sci-Fi',
    aspectRatio: '16:9',
    prompt: 'A sleek aerodynamic maglev bullet train gliding smoothly through a neon-lit futuristic metropolis at twilight, passing between towering crystal glass skyscrapers, illuminated track with glowing lines, cinematic tracking camera.',
    tag: 'Sci-Fi Action',
  },
  {
    id: 'idea-2',
    title: 'Emerald Forest Waterfall',
    category: 'Nature',
    aspectRatio: '16:9',
    prompt: 'Slow cinematic drone descent through a lush tropical rainforest toward a breathtaking multi-tiered turquoise waterfall, sunbeams piercing through ancient mossy canopy trees, water droplets misting the air.',
    tag: 'Cinematic Nature',
  },
  {
    id: 'idea-3',
    title: 'Neon Cyberpunk Street Food',
    category: 'Street Life',
    aspectRatio: '9:16',
    prompt: 'Vertical portrait shot of a street chef tossing glowing noodles in a sizzling wok under magenta neon rain in a cyberpunk night market, steam swirling dynamically, vibrant bokeh streetlights.',
    tag: 'Shorts / TikTok',
  },
  {
    id: 'idea-4',
    title: 'Luxury Perfume Bottle Unveil',
    category: 'Commercial',
    aspectRatio: '9:16',
    prompt: 'Macro slow-motion rotation around a geometric amber glass perfume bottle resting on black volcanic stone, shimmering golden dust swirling in liquid, studio luxury lighting, commercial grade 120fps.',
    tag: 'Product Video',
  },
  {
    id: 'idea-5',
    title: 'Astronaut on Crimson Dune',
    category: 'Space',
    aspectRatio: '16:9',
    prompt: 'Cinematic wide shot of a solitary astronaut in an advanced white spacesuit walking slowly across endless rippling red sand dunes on Mars, massive ringed planet looming on the horizon, golden dust storm breeze.',
    tag: 'Space Odyssey',
  },
  {
    id: 'idea-6',
    title: 'Cozy Rain on Coffee Shop Window',
    category: 'Atmospheric',
    aspectRatio: '16:9',
    prompt: 'Gentle slow pan focusing on raindrops sliding down a warm coffee shop window at evening, warm amber interior glow, silhouettes of people reading, soft blurry city traffic lights outside.',
    tag: 'Cozy Atmosphere',
  },
];

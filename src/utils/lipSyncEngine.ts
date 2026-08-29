/**
 * MuseTalk-Inspired Audio-Driven Talking Head & Lip-Sync Animation Engine
 * Real-time audio waveform/FFT analysis mapped to anatomical facial landmarks,
 * mouth viseme deformations, natural eye blinks, and head pose physics.
 */

import { VisemeFrame } from '../types';

export interface FaceLandmarks {
  centerX: number;
  centerY: number;
  scale: number;
  jawOpen: number;       // 0 to 1
  mouthWidth: number;    // 0 to 1
  mouthRoundness: number;// 0 to 1
  lipTension: number;    // 0 to 1
  smileAmount: number;   // 0 to 1
  headAngleZ: number;    // tilt in radians
  headAngleY: number;    // pan in radians
  headAngleX: number;    // pitch/nod in radians
  leftEyeOpen: number;   // 0 (closed) to 1 (open)
  rightEyeOpen: number;
  pupilX: number;
  pupilY: number;
  browRaise: number;
  emotion: 'neutral' | 'happy' | 'serious' | 'energetic';
}

export class LipSyncAnalyzer {
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array | null = null;
  private sourceNode: AudioNode | null = null;

  constructor() {}

  public connectStream(audioStream: MediaStream, ctx?: AudioContext) {
    this.audioCtx = ctx || new (window.AudioContext || (window as any).webkitAudioContext)();
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.fftSize = 512;
    this.analyser.smoothingTimeConstant = 0.6;
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

    this.sourceNode = this.audioCtx.createMediaStreamSource(audioStream);
    this.sourceNode.connect(this.analyser);
  }

  public connectAudioElement(audioEl: HTMLAudioElement, ctx?: AudioContext) {
    this.audioCtx = ctx || new (window.AudioContext || (window as any).webkitAudioContext)();
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.fftSize = 512;
    this.analyser.smoothingTimeConstant = 0.65;
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

    try {
      this.sourceNode = this.audioCtx.createMediaElementSource(audioEl);
      this.sourceNode.connect(this.analyser);
      this.analyser.connect(this.audioCtx.destination);
    } catch (e) {
      // Source might already be connected
    }
  }

  public getEnergyLevels(): { low: number; mid: number; high: number; volume: number } {
    if (!this.analyser || !this.dataArray) {
      return { low: 0, mid: 0, high: 0, volume: 0 };
    }

    this.analyser.getByteFrequencyData(this.dataArray);

    let lowSum = 0;
    let midSum = 0;
    let highSum = 0;
    const len = this.dataArray.length;

    // Low bins (vowels, fundamental frequency ~80-300Hz)
    const lowLimit = Math.floor(len * 0.15);
    // Mid bins (formants F1, F2 ~300-2500Hz)
    const midLimit = Math.floor(len * 0.55);

    for (let i = 0; i < lowLimit; i++) lowSum += this.dataArray[i];
    for (let i = lowLimit; i < midLimit; i++) midSum += this.dataArray[i];
    for (let i = midLimit; i < len; i++) highSum += this.dataArray[i];

    const low = lowSum / (lowLimit * 255);
    const mid = midSum / ((midLimit - lowLimit) * 255);
    const high = highSum / ((len - midLimit) * 255);
    const volume = (low * 0.4 + mid * 0.4 + high * 0.2);

    return { low, mid, high, volume };
  }

  public computeLipSyncFrame(
    timeSec: number,
    emotion: 'neutral' | 'happy' | 'serious' | 'energetic' = 'neutral',
    forcedVolume?: number
  ): FaceLandmarks {
    const energy = forcedVolume !== undefined
      ? { low: forcedVolume * 0.8, mid: forcedVolume, high: forcedVolume * 0.5, volume: forcedVolume }
      : this.getEnergyLevels();

    // Natural breathing / idle sway
    const breathing = Math.sin(timeSec * 1.5) * 0.015;
    const headNod = Math.sin(timeSec * 2.1) * 0.02 + (energy.volume > 0.1 ? Math.sin(timeSec * 6) * 0.025 : 0);
    const headTilt = Math.cos(timeSec * 0.8) * 0.018;

    // Eye blinking logic (blink every 3-5 seconds naturally for 150ms)
    const blinkCycle = (timeSec % 3.8);
    let eyeOpen = 1.0;
    if (blinkCycle < 0.16) {
      // Smooth blink curve
      eyeOpen = Math.abs(Math.sin((blinkCycle / 0.16) * Math.PI - Math.PI / 2));
    }

    // MuseTalk-inspired Viseme calculations from frequency formants:
    // High low-band energy = open vowel (A, O)
    // High mid-band energy = wide vowel (E, I)
    // High high-band energy = fricatives / sibilants (S, F, T) -> teeth together
    const jawOpen = Math.min(1.0, Math.max(0, energy.low * 1.4 + energy.mid * 0.6));
    const mouthWidth = Math.min(1.0, Math.max(0.2, 0.4 + energy.mid * 0.8 - energy.low * 0.2));
    const mouthRoundness = Math.min(1.0, Math.max(0, energy.low * 1.1 - energy.mid * 0.4));
    const lipTension = Math.min(1.0, energy.high * 1.3);

    const smileOffset = emotion === 'happy' ? 0.35 : emotion === 'energetic' ? 0.25 : emotion === 'serious' ? -0.1 : 0.05;

    return {
      centerX: 0,
      centerY: breathing * 10,
      scale: 1.0,
      jawOpen,
      mouthWidth,
      mouthRoundness,
      lipTension,
      smileAmount: Math.max(0, Math.min(1, 0.2 + smileOffset)),
      headAngleZ: headTilt,
      headAngleY: Math.sin(timeSec * 0.7) * 0.02,
      headAngleX: headNod,
      leftEyeOpen: eyeOpen,
      rightEyeOpen: eyeOpen,
      pupilX: Math.sin(timeSec * 0.5) * 0.15,
      pupilY: Math.cos(timeSec * 0.6) * 0.08,
      browRaise: emotion === 'energetic' ? 0.3 : emotion === 'serious' ? -0.2 : (energy.volume > 0.3 ? 0.2 : 0),
      emotion,
    };
  }
}

/**
 * High Performance Canvas Renderer for Talking Avatar
 * Renders realistic/stylized face mesh with lip-sync, blinking, hair dynamics, and lighting.
 */
export function renderTalkingAvatarCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  landmarks: FaceLandmarks,
  avatarConfig: {
    name: string;
    gender: string;
    avatarUrl?: string;
    imageElement?: HTMLImageElement | null;
    accentColor: string;
  },
  backdropType: string = 'cyberpunk',
  timeSec: number = 0
) {
  ctx.save();
  ctx.clearRect(0, 0, width, height);

  // 1. Draw dynamic backdrop
  drawBackdrop(ctx, width, height, backdropType, timeSec, avatarConfig.accentColor);

  // 2. Center stage coordinates
  const centerX = width / 2 + landmarks.centerX;
  const centerY = height * 0.52 + landmarks.centerY;
  const baseScale = Math.min(width, height) * 0.38;

  ctx.translate(centerX, centerY);
  ctx.rotate(landmarks.headAngleZ);

  // If custom uploaded image is provided, apply MuseTalk mesh warping & eye/mouth overlay
  if (avatarConfig.imageElement && avatarConfig.imageElement.complete && avatarConfig.imageElement.naturalWidth > 0) {
    drawCustomPhotoAvatar(ctx, avatarConfig.imageElement, baseScale, landmarks, timeSec);
  } else {
    // Render high-fidelity vector / procedural character
    drawProceduralAvatar(ctx, baseScale, landmarks, avatarConfig, timeSec);
  }

  ctx.restore();
}

function drawBackdrop(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  type: string,
  t: number,
  accentColor: string
) {
  if (type === 'green_screen') {
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(0, 0, width, height);
    return;
  }

  // Deep futuristic studio backdrop
  const grad = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, width * 0.8);
  if (type === 'cyberpunk') {
    grad.addColorStop(0, '#131b2e');
    grad.addColorStop(0.6, '#090d16');
    grad.addColorStop(1, '#030509');
  } else if (type === 'office') {
    grad.addColorStop(0, '#1e293b');
    grad.addColorStop(0.7, '#0f172a');
    grad.addColorStop(1, '#020617');
  } else if (type === 'stage') {
    grad.addColorStop(0, '#2e1065');
    grad.addColorStop(0.6, '#0f051d');
    grad.addColorStop(1, '#000000');
  } else {
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(1, '#020617');
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Dynamic ambient neon ring
  ctx.save();
  ctx.strokeStyle = accentColor;
  ctx.globalAlpha = 0.15 + Math.sin(t * 2) * 0.05;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(width / 2, height * 0.48, width * 0.36, 0, Math.PI * 2);
  ctx.stroke();

  // Ambient floating dust / bokeh particles
  ctx.fillStyle = accentColor;
  for (let i = 0; i < 15; i++) {
    const px = (Math.sin(t * 0.5 + i * 1.3) * 0.5 + 0.5) * width;
    const py = (Math.cos(t * 0.3 + i * 2.1) * 0.5 + 0.5) * height;
    const pSize = (Math.sin(t + i) * 0.5 + 0.5) * 3 + 1;
    ctx.globalAlpha = 0.1 + (i % 4) * 0.05;
    ctx.beginPath();
    ctx.arc(px, py, pSize, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawCustomPhotoAvatar(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  scale: number,
  landmarks: FaceLandmarks,
  t: number
) {
  const w = scale * 2.2;
  const h = scale * 2.5;

  ctx.save();

  // Drop shadow / rim light
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 25;

  // Clip into elegant portrait framing
  ctx.beginPath();
  ctx.ellipse(0, 0, w * 0.48, h * 0.48, 0, 0, Math.PI * 2);
  ctx.clip();

  // Draw main face image with subtle 2.5D head pitch
  const pitchOffsetY = landmarks.headAngleX * 40;
  ctx.drawImage(img, -w / 2, -h / 2 + pitchOffsetY, w, h);

  // MuseTalk Dynamic Lip Overlay:
  // Warps lower lip and jaw when speaking
  if (landmarks.jawOpen > 0.05) {
    const mouthY = h * 0.12 + pitchOffsetY;
    const mouthW = scale * (0.28 + landmarks.mouthWidth * 0.15);
    const mouthH = scale * (0.04 + landmarks.jawOpen * 0.22);

    // Mouth cavity
    ctx.fillStyle = '#1c080b';
    ctx.beginPath();
    ctx.ellipse(0, mouthY, mouthW, mouthH, 0, 0, Math.PI * 2);
    ctx.fill();

    // Teeth bar
    if (landmarks.jawOpen > 0.12) {
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.ellipse(0, mouthY - mouthH * 0.4, mouthW * 0.7, mouthH * 0.35, 0, 0, Math.PI);
      ctx.fill();
    }

    // Tongue
    if (landmarks.jawOpen > 0.25) {
      ctx.fillStyle = '#dc2626';
      ctx.globalAlpha = 0.7;
      ctx.beginPath();
      ctx.ellipse(0, mouthY + mouthH * 0.4, mouthW * 0.5, mouthH * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;
    }

    // Natural lip contours
    ctx.strokeStyle = 'rgba(180, 83, 9, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, mouthY, mouthW * 1.05, mouthH * 1.05, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Dynamic Natural Blink Overlay on Eyes
  if (landmarks.leftEyeOpen < 0.8) {
    const eyeY = -h * 0.08 + pitchOffsetY;
    const eyeSpacing = scale * 0.32;
    const eyeW = scale * 0.18;
    const eyeH = scale * 0.08 * (1 - landmarks.leftEyeOpen);

    ctx.fillStyle = 'rgba(30, 20, 15, 0.9)';
    // Left eye lid
    ctx.beginPath();
    ctx.ellipse(-eyeSpacing / 2, eyeY, eyeW / 2, eyeH, 0, 0, Math.PI * 2);
    ctx.fill();
    // Right eye lid
    ctx.beginPath();
    ctx.ellipse(eyeSpacing / 2, eyeY, eyeW / 2, eyeH, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawProceduralAvatar(
  ctx: CanvasRenderingContext2D,
  scale: number,
  landmarks: FaceLandmarks,
  avatarConfig: any,
  t: number
) {
  const isFemale = avatarConfig.gender === 'female' || avatarConfig.gender === 'anime';
  const isAndroid = avatarConfig.gender === 'android';

  // 1. Shoulders & Torso
  ctx.save();
  const bodyGrad = ctx.createLinearGradient(0, scale * 0.6, 0, scale * 1.8);
  bodyGrad.addColorStop(0, isAndroid ? '#1e293b' : '#0f172a');
  bodyGrad.addColorStop(1, '#020617');
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(0, scale * 1.3, scale * 1.2, scale * 0.8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Suit / Collar details
  ctx.strokeStyle = avatarConfig.accentColor;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-scale * 0.4, scale * 0.9);
  ctx.lineTo(0, scale * 1.3);
  ctx.lineTo(scale * 0.4, scale * 0.9);
  ctx.stroke();
  ctx.restore();

  // 2. Neck
  ctx.save();
  ctx.fillStyle = isAndroid ? '#94a3b8' : '#fed7aa';
  ctx.fillRect(-scale * 0.22, scale * 0.35, scale * 0.44, scale * 0.5);
  ctx.restore();

  // 3. Head & Jaw (with pitch / yaw)
  ctx.save();
  const headY = landmarks.headAngleX * 30;
  const faceGrad = ctx.createRadialGradient(0, headY, scale * 0.2, 0, headY, scale * 0.8);
  if (isAndroid) {
    faceGrad.addColorStop(0, '#e2e8f0');
    faceGrad.addColorStop(1, '#64748b');
  } else {
    faceGrad.addColorStop(0, '#ffedd5');
    faceGrad.addColorStop(0.8, '#fdba74');
    faceGrad.addColorStop(1, '#fb923c');
  }
  ctx.fillStyle = faceGrad;

  // Face shape
  ctx.beginPath();
  ctx.ellipse(0, headY, scale * 0.52, scale * 0.65, 0, 0, Math.PI * 2);
  ctx.fill();

  // 4. Eyes & Eyebrows
  const eyeY = headY - scale * 0.08;
  const eyeSpacing = scale * 0.42;
  const eyeWidth = scale * 0.16;
  const eyeHeight = scale * 0.12 * landmarks.leftEyeOpen;

  // Eyebrows
  ctx.strokeStyle = isAndroid ? '#334155' : '#78350f';
  ctx.lineWidth = isFemale ? 3 : 5;
  const browOffset = landmarks.browRaise * 12;

  // Left Brow
  ctx.beginPath();
  ctx.moveTo(-eyeSpacing / 2 - eyeWidth * 0.6, eyeY - scale * 0.14 - browOffset);
  ctx.quadraticCurveTo(-eyeSpacing / 2, eyeY - scale * 0.18 - browOffset, -eyeSpacing / 2 + eyeWidth * 0.6, eyeY - scale * 0.13 - browOffset);
  ctx.stroke();

  // Right Brow
  ctx.beginPath();
  ctx.moveTo(eyeSpacing / 2 - eyeWidth * 0.6, eyeY - scale * 0.13 - browOffset);
  ctx.quadraticCurveTo(eyeSpacing / 2, eyeY - scale * 0.18 - browOffset, eyeSpacing / 2 + eyeWidth * 0.6, eyeY - scale * 0.14 - browOffset);
  ctx.stroke();

  // Eye Sclera & Iris
  [-1, 1].forEach((dir) => {
    const eyeCenterX = (dir * eyeSpacing) / 2;

    // Eye white
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(eyeCenterX, eyeY, eyeWidth / 2, Math.max(1, eyeHeight / 2), 0, 0, Math.PI * 2);
    ctx.fill();

    if (landmarks.leftEyeOpen > 0.2) {
      // Iris
      ctx.fillStyle = avatarConfig.accentColor || '#0284c7';
      ctx.beginPath();
      const pupilOffsetX = landmarks.pupilX * (eyeWidth * 0.3);
      const pupilOffsetY = landmarks.pupilY * (eyeHeight * 0.3);
      ctx.arc(eyeCenterX + pupilOffsetX, eyeY + pupilOffsetY, Math.min(eyeHeight * 0.45, scale * 0.05), 0, Math.PI * 2);
      ctx.fill();

      // Pupil
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(eyeCenterX + pupilOffsetX, eyeY + pupilOffsetY, Math.min(eyeHeight * 0.25, scale * 0.025), 0, Math.PI * 2);
      ctx.fill();

      // Catchlight shine
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(eyeCenterX + pupilOffsetX - scale * 0.015, eyeY + pupilOffsetY - scale * 0.015, scale * 0.012, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // 5. Nose
  ctx.strokeStyle = 'rgba(180, 83, 9, 0.4)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(0, eyeY + scale * 0.05);
  ctx.lineTo(scale * 0.03, headY + scale * 0.12);
  ctx.lineTo(-scale * 0.04, headY + scale * 0.15);
  ctx.stroke();

  // 6. Lip-Synced Mouth (MuseTalk Visemes)
  const mouthY = headY + scale * 0.34;
  const mouthW = scale * (0.24 + landmarks.mouthWidth * 0.18);
  const mouthH = scale * (0.02 + landmarks.jawOpen * 0.26);

  if (landmarks.jawOpen > 0.05) {
    // Open mouth cavity
    ctx.fillStyle = '#260c14';
    ctx.beginPath();
    ctx.ellipse(0, mouthY, mouthW / 2, mouthH / 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Teeth
    if (landmarks.jawOpen > 0.12) {
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.ellipse(0, mouthY - mouthH * 0.35, mouthW * 0.38, mouthH * 0.25, 0, 0, Math.PI);
      ctx.fill();
    }

    // Tongue
    if (landmarks.jawOpen > 0.3) {
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.ellipse(0, mouthY + mouthH * 0.3, mouthW * 0.25, mouthH * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Outer lips
  ctx.strokeStyle = isFemale ? '#e11d48' : '#c2410c';
  ctx.lineWidth = isFemale ? 4.5 : 3;
  ctx.beginPath();
  if (landmarks.jawOpen <= 0.05) {
    // Closed / smiling line
    const smileCurve = landmarks.smileAmount * scale * 0.04;
    ctx.moveTo(-mouthW / 2, mouthY);
    ctx.quadraticCurveTo(0, mouthY + smileCurve, mouthW / 2, mouthY);
  } else {
    ctx.ellipse(0, mouthY, mouthW / 2, mouthH / 2, 0, 0, Math.PI * 2);
  }
  ctx.stroke();

  // 7. Hair / Headgear
  ctx.save();
  ctx.fillStyle = isAndroid ? '#0284c7' : isFemale ? '#7c2d12' : '#1e1b4b';
  ctx.beginPath();
  if (isFemale) {
    ctx.arc(0, headY - scale * 0.15, scale * 0.62, Math.PI, Math.PI * 2);
    ctx.lineTo(scale * 0.65, headY + scale * 0.6);
    ctx.lineTo(scale * 0.45, headY + scale * 0.3);
    ctx.lineTo(-scale * 0.45, headY + scale * 0.3);
    ctx.lineTo(-scale * 0.65, headY + scale * 0.6);
  } else if (isAndroid) {
    // Cybernetic halo / hair plates
    ctx.arc(0, headY - scale * 0.2, scale * 0.58, Math.PI * 0.8, Math.PI * 2.2);
  } else {
    // Executive styled hair
    ctx.arc(0, headY - scale * 0.2, scale * 0.58, Math.PI * 0.85, Math.PI * 2.15);
  }
  ctx.fill();
  ctx.restore();

  ctx.restore();
}

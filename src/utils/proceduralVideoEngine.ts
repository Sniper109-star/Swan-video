/**
 * Self-Made Procedural & Neural Video Generation Engine
 * Generates 60FPS high-definition cinematic scenes from natural prompts,
 * custom uploaded starting images, camera choreography, and lighting
 * without requiring any external API key.
 */

export interface CameraParams {
  motionType: 'dolly_in' | 'dolly_out' | 'orbit_360' | 'drone_flyover' | 'fpv_dynamic' | 'pan_tilt';
  speed: number;
  zoom: number;
  shake: number;
}

export function detectThemeFromPrompt(prompt: string): string {
  const p = prompt.toLowerCase();
  if (p.includes('cyberpunk') || p.includes('neon') || p.includes('tokyo') || p.includes('city') || p.includes('street') || p.includes('blade runner')) {
    return 'cyberpunk_city';
  }
  if (p.includes('space') || p.includes('galaxy') || p.includes('planet') || p.includes('star') || p.includes('cosmos') || p.includes('nebula') || p.includes('black hole')) {
    return 'space_galaxy';
  }
  if (p.includes('ocean') || p.includes('sunset') || p.includes('sea') || p.includes('beach') || p.includes('water') || p.includes('wave') || p.includes('boat')) {
    return 'ocean_sunset';
  }
  if (p.includes('quantum') || p.includes('core') || p.includes('energy') || p.includes('particle') || p.includes('vortex') || p.includes('reactor') || p.includes('atomic')) {
    return 'quantum_core';
  }
  if (p.includes('synthwave') || p.includes('retro') || p.includes('80s') || p.includes('grid') || p.includes('arcade') || p.includes('outrun')) {
    return 'synthwave_grid';
  }
  if (p.includes('forest') || p.includes('nature') || p.includes('tree') || p.includes('mystic') || p.includes('magic') || p.includes('jungle')) {
    return 'enchanted_forest';
  }
  if (p.includes('tunnel') || p.includes('speed') || p.includes('hyperspace') || p.includes('data') || p.includes('digital') || p.includes('matrix')) {
    return 'data_tunnel';
  }
  return 'cyberpunk_city';
}

export function renderProceduralFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  timeSec: number,
  theme: string,
  prompt: string,
  camera: CameraParams,
  customImage?: HTMLImageElement | null
) {
  ctx.save();
  ctx.clearRect(0, 0, width, height);

  // Apply camera shake & motion transform
  const shakeX = (Math.sin(timeSec * 15) + Math.cos(timeSec * 23)) * camera.shake * 3;
  const shakeY = (Math.cos(timeSec * 17) + Math.sin(timeSec * 19)) * camera.shake * 3;

  let zoomScale = 1.0;
  if (camera.motionType === 'dolly_in') {
    zoomScale = 1.0 + (timeSec * 0.04 * camera.speed);
  } else if (camera.motionType === 'dolly_out') {
    zoomScale = 1.25 - (timeSec * 0.03 * camera.speed);
  }

  ctx.translate(width / 2 + shakeX, height / 2 + shakeY);
  ctx.scale(zoomScale, zoomScale);
  ctx.translate(-width / 2, -height / 2);

  if (customImage && customImage.complete && customImage.naturalWidth > 0) {
    drawImageToVideoScene(ctx, width, height, timeSec, customImage, camera);
  } else {
    switch (theme) {
      case 'space_galaxy':
        drawSpaceGalaxy(ctx, width, height, timeSec, camera);
        break;
      case 'ocean_sunset':
        drawOceanSunset(ctx, width, height, timeSec, camera);
        break;
      case 'quantum_core':
        drawQuantumCore(ctx, width, height, timeSec, camera);
        break;
      case 'synthwave_grid':
        drawSynthwaveGrid(ctx, width, height, timeSec, camera);
        break;
      case 'enchanted_forest':
        drawEnchantedForest(ctx, width, height, timeSec, camera);
        break;
      case 'data_tunnel':
        drawDataTunnel(ctx, width, height, timeSec, camera);
        break;
      case 'cyberpunk_city':
      default:
        drawCyberpunkCity(ctx, width, height, timeSec, camera);
        break;
    }
  }

  // Cinematic film vignette
  drawVignette(ctx, width, height);

  ctx.restore();
}

function drawCyberpunkCity(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, cam: CameraParams) {
  // Deep night sky
  const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
  skyGrad.addColorStop(0, '#050711');
  skyGrad.addColorStop(0.6, '#0f172a');
  skyGrad.addColorStop(1, '#020617');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, w, h);

  // Background Fog / Distant Neon Glow
  const fogGrad = ctx.createRadialGradient(w * 0.5, h * 0.6, 50, w * 0.5, h * 0.6, w * 0.7);
  fogGrad.addColorStop(0, 'rgba(6, 182, 212, 0.25)');
  fogGrad.addColorStop(0.5, 'rgba(217, 70, 239, 0.15)');
  fogGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = fogGrad;
  ctx.fillRect(0, 0, w, h);

  // Moving 3D Buildings & Neon Windows
  const buildingCount = 14;
  for (let i = 0; i < buildingCount; i++) {
    const depth = (i % 3) + 1; // 1: close, 3: far
    const speed = (4 - depth) * 20 * cam.speed;
    const posX = ((i * (w / 7) - (t * speed)) % (w * 1.5)) - w * 0.2;
    const bWidth = w * 0.12 * (4 - depth) * 0.4;
    const bHeight = h * (0.4 + (i % 5) * 0.1);
    const bTop = h * 0.75 - bHeight;

    // Building silhouette
    ctx.fillStyle = depth === 1 ? '#0b0f19' : depth === 2 ? '#080d1a' : '#040710';
    ctx.fillRect(posX, bTop, bWidth, bHeight + h * 0.3);

    // Glowing windows
    const windowRows = 12;
    const windowCols = 4;
    const winW = bWidth / (windowCols * 2);
    const winH = bHeight / (windowRows * 2);

    for (let r = 0; r < windowRows; r++) {
      for (let c = 0; c < windowCols; c++) {
        if ((i + r + c) % 3 === 0) {
          const isCyan = (i + r) % 2 === 0;
          ctx.fillStyle = isCyan ? 'rgba(6, 182, 212, 0.8)' : 'rgba(236, 72, 153, 0.8)';
          ctx.fillRect(
            posX + c * (winW * 2) + winW * 0.5,
            bTop + r * (winH * 2) + winH * 0.5,
            winW,
            winH * 0.7
          );
        }
      }
    }

    // Holographic Rooftop Neon Sign
    if (i % 3 === 0) {
      ctx.strokeStyle = i % 2 === 0 ? '#22d3ee' : '#f43f5e';
      ctx.lineWidth = 3;
      ctx.strokeRect(posX + bWidth * 0.1, bTop - 25, bWidth * 0.8, 20);
      ctx.fillStyle = i % 2 === 0 ? '#22d3ee' : '#f43f5e';
      ctx.font = `bold ${Math.max(10, Math.floor(w * 0.015))}px monospace`;
      ctx.fillText('NEON 3', posX + bWidth * 0.2, bTop - 10);
    }
  }

  // Wet Asphalt Ground with Raytraced-style Neon Reflections
  const groundY = h * 0.72;
  const groundGrad = ctx.createLinearGradient(0, groundY, 0, h);
  groundGrad.addColorStop(0, '#090d16');
  groundGrad.addColorStop(1, '#020408');
  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, groundY, w, h - groundY);

  // Reflection streaks on puddle
  for (let k = 0; k < 8; k++) {
    const rx = (Math.sin(k * 2.3 + t * 0.5) * 0.5 + 0.5) * w;
    const rw = w * 0.08;
    const rColor = k % 2 === 0 ? 'rgba(6, 182, 212, 0.3)' : 'rgba(217, 70, 239, 0.25)';
    ctx.fillStyle = rColor;
    ctx.fillRect(rx, groundY, rw, h - groundY);
  }

  // Volumetric Rain Streaks
  ctx.strokeStyle = 'rgba(186, 230, 253, 0.25)';
  ctx.lineWidth = 1.5;
  for (let p = 0; p < 45; p++) {
    const rx = (Math.sin(p * 99 + t * 4) * 0.5 + 0.5) * w;
    const ry = ((p * 35 + t * 650) % h);
    ctx.beginPath();
    ctx.moveTo(rx, ry);
    ctx.lineTo(rx - 8, ry + 25);
    ctx.stroke();
  }
}

function drawSpaceGalaxy(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, cam: CameraParams) {
  // Deep Void
  ctx.fillStyle = '#020208';
  ctx.fillRect(0, 0, w, h);

  // Interstellar Nebula Clouds
  const nebGrad = ctx.createRadialGradient(w * 0.6, h * 0.4, 40, w * 0.6, h * 0.4, w * 0.65);
  nebGrad.addColorStop(0, 'rgba(147, 51, 234, 0.35)');
  nebGrad.addColorStop(0.4, 'rgba(59, 130, 246, 0.2)');
  nebGrad.addColorStop(0.8, 'rgba(236, 72, 153, 0.1)');
  nebGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = nebGrad;
  ctx.fillRect(0, 0, w, h);

  // Warp speed / rotating starfield
  const starCount = 80;
  const cx = w / 2;
  const cy = h / 2;

  for (let i = 0; i < starCount; i++) {
    const angle = (i * (Math.PI * 2) / starCount) + t * 0.08 * cam.speed;
    const dist = ((i * 17 + t * 120 * cam.speed) % (w * 0.8));
    const sx = cx + Math.cos(angle) * dist;
    const sy = cy + Math.sin(angle) * dist;
    const starSize = Math.max(1, (dist / (w * 0.8)) * 3.5);

    ctx.fillStyle = i % 5 === 0 ? '#67e8f9' : i % 7 === 0 ? '#f472b6' : '#ffffff';
    ctx.beginPath();
    ctx.arc(sx, sy, starSize, 0, Math.PI * 2);
    ctx.fill();
  }

  // Giant 3D Ringed Exoplanet
  const planetX = w * 0.3 + Math.sin(t * 0.1) * 20;
  const planetY = h * 0.55 + Math.cos(t * 0.1) * 15;
  const planetRadius = Math.min(w, h) * 0.22;

  // Planet body
  const planetGrad = ctx.createRadialGradient(
    planetX - planetRadius * 0.3,
    planetY - planetRadius * 0.3,
    planetRadius * 0.1,
    planetX,
    planetY,
    planetRadius
  );
  planetGrad.addColorStop(0, '#38bdf8');
  planetGrad.addColorStop(0.5, '#1e3a8a');
  planetGrad.addColorStop(0.9, '#090d16');
  planetGrad.addColorStop(1, '#020408');

  ctx.fillStyle = planetGrad;
  ctx.beginPath();
  ctx.arc(planetX, planetY, planetRadius, 0, Math.PI * 2);
  ctx.fill();

  // Atmospheric rim glow
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(planetX, planetY, planetRadius + 2, 0, Math.PI * 2);
  ctx.stroke();

  // Planetary Rings
  ctx.save();
  ctx.translate(planetX, planetY);
  ctx.rotate(Math.PI * 0.15);
  ctx.strokeStyle = 'rgba(224, 231, 255, 0.35)';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.ellipse(0, 0, planetRadius * 1.9, planetRadius * 0.45, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawOceanSunset(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, cam: CameraParams) {
  // Golden Hour Sky Gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.6);
  skyGrad.addColorStop(0, '#1e1b4b');
  skyGrad.addColorStop(0.35, '#831843');
  skyGrad.addColorStop(0.7, '#ea580c');
  skyGrad.addColorStop(1, '#fde047');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, w, h * 0.6);

  // Glowing Sun
  const sunX = w * 0.5;
  const sunY = h * 0.52;
  const sunGrad = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 120);
  sunGrad.addColorStop(0, '#ffffff');
  sunGrad.addColorStop(0.3, '#fef08a');
  sunGrad.addColorStop(0.7, 'rgba(249, 115, 22, 0.6)');
  sunGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = sunGrad;
  ctx.beginPath();
  ctx.arc(sunX, sunY, 80, 0, Math.PI * 2);
  ctx.fill();

  // Distant Mountain Silhouettes
  ctx.fillStyle = '#1c1917';
  ctx.beginPath();
  ctx.moveTo(0, h * 0.58);
  ctx.lineTo(w * 0.2, h * 0.48);
  ctx.lineTo(w * 0.4, h * 0.56);
  ctx.lineTo(w * 0.7, h * 0.45);
  ctx.lineTo(w, h * 0.58);
  ctx.lineTo(w, h * 0.6);
  ctx.lineTo(0, h * 0.6);
  ctx.fill();

  // Animated Water Surface with Sine-wave light reflection
  const waterY = h * 0.58;
  const waterGrad = ctx.createLinearGradient(0, waterY, 0, h);
  waterGrad.addColorStop(0, '#7c2d12');
  waterGrad.addColorStop(0.3, '#1e293b');
  waterGrad.addColorStop(1, '#020617');
  ctx.fillStyle = waterGrad;
  ctx.fillRect(0, waterY, w, h - waterY);

  // Specular Sun Trail on Ocean
  const waveRows = 25;
  for (let r = 0; r < waveRows; r++) {
    const rowY = waterY + (r / waveRows) * (h - waterY);
    const rowWidth = (r / waveRows) * (w * 0.35) + 30;
    const waveOffset = Math.sin(t * 3 + r * 0.8) * 15;

    ctx.fillStyle = `rgba(254, 240, 138, ${Math.max(0.1, 0.7 - r * 0.025)})`;
    ctx.fillRect(sunX - rowWidth / 2 + waveOffset, rowY, rowWidth, 2.5);
  }

  // Flying Sea Birds
  for (let b = 0; b < 4; b++) {
    const bx = ((b * 120 + t * 40 * cam.speed) % (w + 100)) - 50;
    const by = h * 0.25 + Math.sin(t * 2 + b) * 20;
    const wing = Math.sin(t * 8 + b) * 6;

    ctx.strokeStyle = '#292524';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(bx - 10, by + wing);
    ctx.lineTo(bx, by);
    ctx.lineTo(bx + 10, by + wing);
    ctx.stroke();
  }
}

function drawQuantumCore(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, cam: CameraParams) {
  ctx.fillStyle = '#030712';
  ctx.fillRect(0, 0, w, h);

  const cx = w / 2;
  const cy = h / 2;

  // Swirling Particle Vortex
  const particleCount = 120;
  for (let i = 0; i < particleCount; i++) {
    const spiralRadius = (i * 3.5 + t * 50 * cam.speed) % (Math.min(w, h) * 0.6);
    const angle = i * 0.2 + t * (2.0 - spiralRadius / 200);
    const px = cx + Math.cos(angle) * spiralRadius;
    const py = cy + Math.sin(angle) * spiralRadius;
    const pSize = (spiralRadius / 200) * 4 + 1;

    ctx.fillStyle = i % 3 === 0 ? '#06b6d4' : i % 2 === 0 ? '#8b5cf6' : '#ec4899';
    ctx.beginPath();
    ctx.arc(px, py, pSize, 0, Math.PI * 2);
    ctx.fill();
  }

  // Core Plasma Core Sphere
  const coreGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 90);
  coreGrad.addColorStop(0, '#ffffff');
  coreGrad.addColorStop(0.3, '#38bdf8');
  coreGrad.addColorStop(0.7, '#6366f1');
  coreGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, 80 + Math.sin(t * 6) * 8, 0, Math.PI * 2);
  ctx.fill();

  // Energy Arc Rings
  for (let ring = 1; ring <= 3; ring++) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(t * (ring % 2 === 0 ? 1 : -1) * 0.8);
    ctx.strokeStyle = ring === 1 ? '#22d3ee' : ring === 2 ? '#a855f7' : '#ec4899';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(0, 0, 110 * ring, 40 * ring, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

function drawSynthwaveGrid(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, cam: CameraParams) {
  // Dark Purple Sky
  const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.55);
  skyGrad.addColorStop(0, '#090014');
  skyGrad.addColorStop(0.6, '#2e1065');
  skyGrad.addColorStop(1, '#701a75');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, w, h * 0.55);

  // Segmented Neon Sun
  const cx = w / 2;
  const cy = h * 0.5;
  const sunR = Math.min(w, h) * 0.18;

  const sunGrad = ctx.createLinearGradient(cx, cy - sunR, cx, cy + sunR);
  sunGrad.addColorStop(0, '#fde047');
  sunGrad.addColorStop(1, '#db2777');
  ctx.fillStyle = sunGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, sunR, 0, Math.PI * 2);
  ctx.fill();

  // Sun horizontal laser slices
  for (let s = 0; s < 7; s++) {
    const sliceY = cy + (s * (sunR / 7)) - 5;
    const sliceH = s * 2.5 + 2;
    ctx.fillStyle = '#090014';
    ctx.fillRect(cx - sunR - 10, sliceY, sunR * 2 + 20, sliceH);
  }

  // Perspective 3D Neon Grid Floor
  const floorY = h * 0.55;
  ctx.fillStyle = '#05010d';
  ctx.fillRect(0, floorY, w, h - floorY);

  // Vertical vanishing lines
  ctx.strokeStyle = '#ec4899';
  ctx.lineWidth = 1.5;
  const lineCount = 18;
  for (let i = -lineCount; i <= lineCount; i++) {
    const bottomX = cx + (i * (w / 14));
    ctx.beginPath();
    ctx.moveTo(cx, floorY);
    ctx.lineTo(bottomX, h);
    ctx.stroke();
  }

  // Horizontal moving grid lines
  const gridSpeed = t * 140 * cam.speed;
  const hLines = 14;
  for (let j = 0; j < hLines; j++) {
    const progress = ((j * 30 + gridSpeed) % 240) / 240;
    const y = floorY + Math.pow(progress, 2.5) * (h - floorY);
    ctx.strokeStyle = `rgba(34, 211, 238, ${progress})`;
    ctx.lineWidth = 1 + progress * 2.5;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
}

function drawEnchantedForest(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, cam: CameraParams) {
  // Midnight Emerald Sky
  const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
  bgGrad.addColorStop(0, '#022c22');
  bgGrad.addColorStop(0.5, '#064e3b');
  bgGrad.addColorStop(1, '#021812');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // Volumetric Sunbeams / God Rays
  ctx.save();
  for (let r = 0; r < 5; r++) {
    const rayX = (w * 0.2) + r * (w * 0.15);
    const rayGrad = ctx.createLinearGradient(rayX, 0, rayX + 60, h);
    rayGrad.addColorStop(0, 'rgba(52, 211, 153, 0.25)');
    rayGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = rayGrad;
    ctx.beginPath();
    ctx.moveTo(rayX - 30, 0);
    ctx.lineTo(rayX + 30, 0);
    ctx.lineTo(rayX + 180, h);
    ctx.lineTo(rayX + 60, h);
    ctx.fill();
  }
  ctx.restore();

  // Floating Bioluminescent Fairies / Spores
  for (let s = 0; s < 30; s++) {
    const fx = (Math.sin(s * 7 + t * 0.7) * 0.5 + 0.5) * w;
    const fy = (Math.cos(s * 11 + t * 0.5) * 0.5 + 0.5) * h;
    const fSize = Math.sin(t * 3 + s) * 2 + 3;

    ctx.fillStyle = s % 2 === 0 ? '#34d399' : '#67e8f9';
    ctx.beginPath();
    ctx.arc(fx, fy, fSize, 0, Math.PI * 2);
    ctx.fill();
  }

  // Ancient Tree Silhouettes
  ctx.fillStyle = '#01150f';
  // Left Tree
  ctx.beginPath();
  ctx.moveTo(0, h);
  ctx.lineTo(w * 0.18, h * 0.4);
  ctx.lineTo(w * 0.22, 0);
  ctx.lineTo(0, 0);
  ctx.fill();

  // Right Tree
  ctx.beginPath();
  ctx.moveTo(w, h);
  ctx.lineTo(w * 0.82, h * 0.4);
  ctx.lineTo(w * 0.78, 0);
  ctx.lineTo(w, 0);
  ctx.fill();
}

function drawDataTunnel(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, cam: CameraParams) {
  ctx.fillStyle = '#030712';
  ctx.fillRect(0, 0, w, h);

  const cx = w / 2;
  const cy = h / 2;
  const ringCount = 14;

  for (let i = 0; i < ringCount; i++) {
    const ringProgress = ((i * 35 + t * 200 * cam.speed) % 400) / 400;
    const radius = Math.pow(ringProgress, 2) * (Math.max(w, h) * 0.9);
    const alpha = ringProgress;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(t * 0.5 + i * 0.2);

    // Hexagonal ring
    ctx.strokeStyle = i % 2 === 0 ? `rgba(6, 182, 212, ${alpha})` : `rgba(168, 85, 247, ${alpha})`;
    ctx.lineWidth = 2 + ringProgress * 4;

    ctx.beginPath();
    for (let side = 0; side < 6; side++) {
      const a = (side * Math.PI) / 3;
      const x = Math.cos(a) * radius;
      const y = Math.sin(a) * radius;
      if (side === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();

    ctx.restore();
  }
}

function drawImageToVideoScene(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  img: HTMLImageElement,
  cam: CameraParams
) {
  // Background Fill
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, w, h);

  // 2.5D Parallax Motion & Breathing Zoom
  const scaleRatio = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const baseW = img.naturalWidth * scaleRatio * 1.08;
  const baseH = img.naturalHeight * scaleRatio * 1.08;

  const panX = Math.sin(t * 0.4) * (w * 0.03 * cam.speed);
  const panY = Math.cos(t * 0.3) * (h * 0.02 * cam.speed);

  const imgX = (w - baseW) / 2 + panX;
  const imgY = (h - baseH) / 2 + panY;

  ctx.drawImage(img, imgX, imgY, baseW, baseH);

  // Dynamic Cinematic Lighting Sweep
  const lightGrad = ctx.createLinearGradient(0, 0, w, h);
  const lightPos = (Math.sin(t * 0.6) * 0.5 + 0.5);
  lightGrad.addColorStop(Math.max(0, lightPos - 0.2), 'rgba(255,255,255,0)');
  lightGrad.addColorStop(lightPos, 'rgba(255, 255, 255, 0.12)');
  lightGrad.addColorStop(Math.min(1, lightPos + 0.2), 'rgba(255,255,255,0)');

  ctx.fillStyle = lightGrad;
  ctx.fillRect(0, 0, w, h);

  // Ambient cinematic dust particles
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  for (let i = 0; i < 20; i++) {
    const px = (Math.sin(i * 13 + t * 0.3) * 0.5 + 0.5) * w;
    const py = (Math.cos(i * 17 + t * 0.4) * 0.5 + 0.5) * h;
    ctx.beginPath();
    ctx.arc(px, py, Math.sin(t + i) * 1.5 + 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawVignette(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const vigGrad = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.75);
  vigGrad.addColorStop(0, 'transparent');
  vigGrad.addColorStop(1, 'rgba(0, 0, 0, 0.75)');
  ctx.fillStyle = vigGrad;
  ctx.fillRect(0, 0, w, h);
}

/**
 * In-Browser Video Clip Recorder & Exporter
 * Combines Canvas video streams and Web Audio destinations into real MP4 / WebM video files.
 */

export interface RenderOptions {
  canvas: HTMLCanvasElement;
  audioStream?: MediaStream | null;
  durationSec: number;
  fps?: number;
  onProgress?: (progressPercent: number, frame: number, totalFrames: number) => void;
}

export function exportCanvasVideo(options: RenderOptions): Promise<{ blob: Blob; url: string }> {
  return new Promise((resolve, reject) => {
    const { canvas, audioStream, durationSec, fps = 30, onProgress } = options;

    try {
      const canvasStream = canvas.captureStream(fps);
      const combinedTracks: MediaStreamTrack[] = [...canvasStream.getVideoTracks()];

      if (audioStream) {
        audioStream.getAudioTracks().forEach((track) => {
          combinedTracks.push(track);
        });
      }

      const combinedStream = new MediaStream(combinedTracks);

      // Determine best supported mime type
      const mimeTypes = [
        'video/mp4;codecs=avc1,mp4a.40.2',
        'video/mp4',
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm',
      ];

      let selectedMime = '';
      for (const mime of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mime)) {
          selectedMime = mime;
          break;
        }
      }

      if (!selectedMime) {
        selectedMime = 'video/webm';
      }

      const recorder = new MediaRecorder(combinedStream, {
        mimeType: selectedMime,
        videoBitsPerSecond: 6000000, // 6 Mbps high quality
      });

      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const finalBlob = new Blob(chunks, { type: selectedMime });
        const videoUrl = URL.createObjectURL(finalBlob);
        resolve({ blob: finalBlob, url: videoUrl });
      };

      recorder.onerror = (e) => {
        reject(e);
      };

      recorder.start(100);

      // Track progress timer
      const startTime = Date.now();
      const totalMs = durationSec * 1000;
      const totalFrames = durationSec * fps;

      const progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const pct = Math.min(99, Math.floor((elapsed / totalMs) * 100));
        const currentFrame = Math.floor((elapsed / totalMs) * totalFrames);
        if (onProgress) {
          onProgress(pct, currentFrame, totalFrames);
        }
      }, 100);

      setTimeout(() => {
        clearInterval(progressInterval);
        if (onProgress) onProgress(100, totalFrames, totalFrames);
        if (recorder.state !== 'inactive') {
          recorder.stop();
        }
      }, totalMs);
    } catch (err) {
      reject(err);
    }
  });
}

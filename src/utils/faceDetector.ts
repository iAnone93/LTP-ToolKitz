import { FaceDetector } from '@mediapipe/tasks-vision';
// Served from the installed package so the WASM always matches the JS version and needs no CDN
import wasmLoaderUrl from '@mediapipe/tasks-vision/vision_wasm_internal.js?url';
import wasmBinaryUrl from '@mediapipe/tasks-vision/vision_wasm_internal.wasm?url';

// Bundled locally (public/models) so face detection works offline and sends nothing to a third party
const FACE_MODEL_URL = `${(import.meta as any).env?.BASE_URL || '/'}models/blaze_face_short_range.tflite`;
const MIN_FACE_CONFIDENCE = 0.6;

// The model sees a 128×128 downscale of its input, so small faces (an ID-card photo, an avatar in a
// screenshot) vanish on large images. Extra passes over overlapping windows keep them big enough:
// a 160px window still catches a face around 35-40px wide, e.g. a profile photo in a desktop screenshot.
const TILE_SIZES = [640, 320, 160];
const TILE_STRIDE = 0.75; // 25% overlap, so a face on a window edge is whole in a neighbouring window
const MAX_TILES_PER_PASS = 200; // bounds the cost on very large images by widening the windows
// More windows mean more chances of a false positive, so window detections need a higher score
const MIN_TILE_FACE_CONFIDENCE = 0.7;

// BlazeFace boxes run roughly brow-to-chin; widen them so hair, ears and jaw are censored too
const PAD_SIDES = 0.2;
const PAD_TOP = 0.45;
const PAD_BOTTOM = 0.2;

export interface FaceBox {
  xRatio: number; // 0..1 relative to image width
  yRatio: number; // 0..1 relative to image height (from top)
  wRatio: number;
  hRatio: number;
  score: number;
}

let sharedDetectorPromise: Promise<FaceDetector> | null = null;

function getOrCreateFaceDetector(): Promise<FaceDetector> {
  if (!sharedDetectorPromise) {
    sharedDetectorPromise = FaceDetector.createFromOptions(
      { wasmLoaderPath: wasmLoaderUrl, wasmBinaryPath: wasmBinaryUrl },
      {
        baseOptions: { modelAssetPath: FACE_MODEL_URL },
        runningMode: 'IMAGE',
        minDetectionConfidence: MIN_FACE_CONFIDENCE
      }
    ).catch(err => {
      sharedDetectorPromise = null;
      throw err;
    });
  }
  return sharedDetectorPromise;
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not load image for face detection'));
    img.src = dataUrl;
  });
}

type PixelBox = { x0: number; y0: number; x1: number; y1: number; score: number };

function area(b: PixelBox): number {
  return Math.max(0, b.x1 - b.x0) * Math.max(0, b.y1 - b.y0);
}

function overlapsSameFace(a: PixelBox, b: PixelBox): boolean {
  const ix = Math.max(0, Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0));
  const iy = Math.max(0, Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0));
  const inter = ix * iy;
  if (inter === 0) return false;
  // Same face seen from two tiles: either a solid IoU, or one box mostly inside the other
  return inter / (area(a) + area(b) - inter) > 0.3 || inter / Math.min(area(a), area(b)) > 0.6;
}

/**
 * Find faces in an image and return padded boxes as ratios of the image size.
 * Overlapping detections from different tiles are merged by union, so a face is never
 * left half-censored.
 */
export async function detectFacesInImage(dataUrl: string): Promise<FaceBox[]> {
  if (typeof document === 'undefined' || !dataUrl) return [];

  const [detector, img] = await Promise.all([getOrCreateFaceDetector(), loadImage(dataUrl)]);
  const imgW = img.naturalWidth;
  const imgH = img.naturalHeight;
  if (imgW < 24 || imgH < 24) return [];

  const found: PixelBox[] = [];
  const collect = (source: HTMLImageElement | HTMLCanvasElement, tx: number, ty: number, minScore: number) => {
    for (const det of detector.detect(source).detections) {
      const bb = det.boundingBox;
      const score = det.categories?.[0]?.score ?? 0;
      if (!bb || bb.width <= 0 || bb.height <= 0 || score < minScore) continue;
      found.push({
        x0: tx + bb.originX,
        y0: ty + bb.originY,
        x1: tx + bb.originX + bb.width,
        y1: ty + bb.originY + bb.height,
        score
      });
    }
  };

  collect(img, 0, 0, MIN_FACE_CONFIDENCE);

  const tileCanvas = document.createElement('canvas');
  const tileCtx = tileCanvas.getContext('2d');
  if (tileCtx) {
    for (const baseSize of TILE_SIZES) {
      // Windowing an image that already fits in one window adds nothing over the full-image pass
      if (Math.max(imgW, imgH) <= baseSize * 1.25) continue;

      const positions = (total: number, size: number) => {
        if (total <= size) return [0];
        const step = Math.max(1, Math.floor(size * TILE_STRIDE));
        const list: number[] = [];
        for (let p = 0; p + size < total; p += step) list.push(p);
        list.push(total - size);
        return list;
      };
      const estimatedTiles =
        Math.ceil(imgW / (baseSize * TILE_STRIDE)) * Math.ceil(imgH / (baseSize * TILE_STRIDE));
      const size = Math.round(baseSize * Math.max(1, Math.sqrt(estimatedTiles / MAX_TILES_PER_PASS)));
      const tileW = Math.min(size, imgW);
      const tileH = Math.min(size, imgH);

      tileCanvas.width = tileW;
      tileCanvas.height = tileH;
      for (const ty of positions(imgH, tileH)) {
        for (const tx of positions(imgW, tileW)) {
          tileCtx.clearRect(0, 0, tileW, tileH);
          tileCtx.drawImage(img, tx, ty, tileW, tileH, 0, 0, tileW, tileH);
          collect(tileCanvas, tx, ty, MIN_TILE_FACE_CONFIDENCE);
        }
      }
    }
  }
  tileCanvas.width = 0;
  tileCanvas.height = 0;

  const merged: PixelBox[] = [];
  for (const box of found.sort((a, b) => b.score - a.score)) {
    const same = merged.find(m => overlapsSameFace(m, box));
    if (same) {
      same.x0 = Math.min(same.x0, box.x0);
      same.y0 = Math.min(same.y0, box.y0);
      same.x1 = Math.max(same.x1, box.x1);
      same.y1 = Math.max(same.y1, box.y1);
    } else {
      merged.push({ ...box });
    }
  }

  return merged
    .map(b => {
      const w = b.x1 - b.x0;
      const h = b.y1 - b.y0;
      const x0 = Math.max(0, b.x0 - w * PAD_SIDES);
      const y0 = Math.max(0, b.y0 - h * PAD_TOP);
      const x1 = Math.min(imgW, b.x1 + w * PAD_SIDES);
      const y1 = Math.min(imgH, b.y1 + h * PAD_BOTTOM);
      return {
        xRatio: x0 / imgW,
        yRatio: y0 / imgH,
        wRatio: (x1 - x0) / imgW,
        hRatio: (y1 - y0) / imgH,
        score: b.score
      };
    })
    .sort((a, b) => a.yRatio - b.yRatio || a.xRatio - b.xRatio);
}

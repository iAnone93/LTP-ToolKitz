/**
 * PaddleOCR (ONNX) In-Browser Engine (Option A)
 *
 * Implements high-accuracy neural text detection (DBNet) and recognition (SVTR/CRNN)
 * via ONNX Runtime Web and PP-OCRv6 tiny models (~6.4 MB total).
 *
 * Features:
 * - Persistent IndexedDB caching for zero-network instantaneous subsequent loads (< 50ms)
 * - Byte-level streaming progress reporting during initial download
 * - Direct browser execution via WASM / WebGPU
 * - Automatic conversion into normalized RawOcrLineItem structures for regex/rule evaluation
 */

import type { RawOcrLineItem } from './pdfRedactor';
import {
  eliminateAnomalySymbols,
  hasMeaningfulContent,
  separateLineBySymbolsAndDelimiters
} from './ocrSanitizer';

export const PADDLE_MODEL_URLS = {
  det: 'https://huggingface.co/snowfluke/ppu-paddle-ocr-models/resolve/main/detection/ort/PP-OCRv6_tiny_det.ort',
  rec: 'https://huggingface.co/snowfluke/ppu-paddle-ocr-models/resolve/main/recognition/ort/PP-OCRv6_tiny_rec.ort',
  dict: 'https://huggingface.co/snowfluke/ppu-paddle-ocr-models/resolve/main/recognition/ppocrv6_tiny_dict.txt'
} as const;

const DB_NAME = 'ppu_paddleocr_models_v1';
const STORE_NAME = 'models';
const KEYS = {
  DET: 'det_model_v6_tiny',
  REC: 'rec_model_v6_tiny',
  DICT: 'dict_ppocrv6_tiny'
} as const;

/** Open or create the IndexedDB database for caching PaddleOCR models */
function openPaddleDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      return reject(new Error('IndexedDB is not supported in this environment'));
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/** Retrieve a cached model ArrayBuffer from IndexedDB */
export async function getCachedModelBuffer(key: string): Promise<ArrayBuffer | null> {
  try {
    const db = await openPaddleDb();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

/** Store a model ArrayBuffer into IndexedDB */
export async function setCachedModelBuffer(key: string, buffer: ArrayBuffer): Promise<void> {
  try {
    const db = await openPaddleDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(buffer, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to store model in IndexedDB:', err);
  }
}

/** Check if all PaddleOCR models are already cached in IndexedDB */
export async function isPaddleModelCached(): Promise<boolean> {
  try {
    const [det, rec, dict] = await Promise.all([
      getCachedModelBuffer(KEYS.DET),
      getCachedModelBuffer(KEYS.REC),
      getCachedModelBuffer(KEYS.DICT)
    ]);
    return Boolean(det && rec && dict);
  } catch {
    return false;
  }
}

/** Clear cached PaddleOCR models from IndexedDB */
export async function clearPaddleModelCache(): Promise<void> {
  try {
    const db = await openPaddleDb();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).clear();
    sharedPaddleServicePromise = null;
  } catch (err) {
    console.warn('Failed to clear PaddleOCR cache:', err);
  }
}

/**
 * Fetch a remote model resource with streaming progress, falling back to
 * server-side proxy `/api/proxy-paddle-model` if direct fetch fails.
 */
async function fetchModelWithProgress(
  url: string,
  label: string,
  onProgress?: (statusText: string, percent?: number) => void
): Promise<ArrayBuffer> {
  let response: Response;

  try {
    response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
  } catch {
    // Fallback to server-side proxy
    const proxyUrl = `/api/proxy-paddle-model?url=${encodeURIComponent(url)}`;
    response = await fetch(proxyUrl);
    if (!response.ok) {
      throw new Error(`Failed to load ${label} model via proxy: HTTP ${response.status}`);
    }
  }

  const contentLength = Number(response.headers.get('content-length') || 0);
  if (!response.body || !contentLength) {
    onProgress?.(`Loading ${label}...`);
    return await response.arrayBuffer();
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let receivedBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      chunks.push(value);
      receivedBytes += value.length;
      const pct = Math.min(100, Math.round((receivedBytes / contentLength) * 100));
      const mbReceived = (receivedBytes / (1024 * 1024)).toFixed(1);
      const mbTotal = (contentLength / (1024 * 1024)).toFixed(1);
      onProgress?.(
        `Downloading ${label} (${mbReceived} of ${mbTotal} MB • ${pct}%)...`,
        pct
      );
    }
  }

  const combined = new Uint8Array(receivedBytes);
  let offset = 0;
  for (const chunk of chunks) {
    combined.set(chunk, offset);
    offset += chunk.length;
  }

  return combined.buffer as ArrayBuffer;
}

// Singleton PaddleOcrService instance
let sharedPaddleServicePromise: Promise<any> | null = null;

/**
 * Initialize or get the shared singleton PaddleOcrService instance,
 * loading from IndexedDB cache or downloading with live progress feedback.
 */
export async function getOrCreatePaddleOcrService(
  onProgress?: (statusText: string, percent?: number) => void
): Promise<any> {
  if (sharedPaddleServicePromise) {
    return sharedPaddleServicePromise;
  }

  sharedPaddleServicePromise = (async () => {
    const { PaddleOcrService } = await import('ppu-paddle-ocr/web');

    onProgress?.('Checking IndexedDB model cache...');
    let detBuffer = await getCachedModelBuffer(KEYS.DET);
    let recBuffer = await getCachedModelBuffer(KEYS.REC);
    let dictBuffer = await getCachedModelBuffer(KEYS.DICT);

    const isFullyCached = Boolean(detBuffer && recBuffer && dictBuffer);

    if (!isFullyCached) {
      onProgress?.('Downloading PaddleOCR DBNet Detection (1.8 MB)...', 10);
      detBuffer = await fetchModelWithProgress(
        PADDLE_MODEL_URLS.det,
        'PaddleOCR Detection',
        onProgress
      );
      await setCachedModelBuffer(KEYS.DET, detBuffer);

      onProgress?.('Downloading PaddleOCR SVTR Recognition (4.5 MB)...', 40);
      recBuffer = await fetchModelWithProgress(
        PADDLE_MODEL_URLS.rec,
        'PaddleOCR Recognition',
        onProgress
      );
      await setCachedModelBuffer(KEYS.REC, recBuffer);

      onProgress?.('Downloading Character Dictionary (0.1 MB)...', 85);
      dictBuffer = await fetchModelWithProgress(
        PADDLE_MODEL_URLS.dict,
        'Character Dictionary',
        onProgress
      );
      await setCachedModelBuffer(KEYS.DICT, dictBuffer);

      onProgress?.('PaddleOCR models saved to IndexedDB cache! (100%)', 100);
    } else {
      onProgress?.('Loaded PP-OCRv6 models from IndexedDB cache (100%)', 100);
    }

    onProgress?.('Initializing ONNX Runtime Web sessions...');

    const service = new PaddleOcrService({
      model: {
        detection: detBuffer!,
        recognition: recBuffer!,
        charactersDictionary: dictBuffer!
      },
      detection: {
        maxSideLength: 1920,
        minimumAreaThreshold: 20
      }
    });

    await service.initialize();
    onProgress?.('PaddleOCR (ONNX PP-OCRv6) ready!');
    return service;
  })().catch((err) => {
    sharedPaddleServicePromise = null;
    throw err;
  });

  return sharedPaddleServicePromise;
}

/** Preload PaddleOCR models in the background without blocking */
export async function preloadPaddleModels(
  onProgress?: (statusText: string, percent?: number) => void
): Promise<void> {
  try {
    await getOrCreatePaddleOcrService(onProgress);
  } catch (err) {
    console.warn('Background preload of PaddleOCR failed:', err);
  }
}

/**
 * Execute PaddleOCR on an image source (dataUrl, HTMLImageElement, HTMLCanvasElement),
 * extracting detected text bounding boxes and words into normalized RawOcrLineItem array.
 */
export async function runPaddleOcrOnImage(
  imageSource: string | HTMLCanvasElement | HTMLImageElement,
  imageWidth: number,
  imageHeight: number,
  onProgress?: (statusText: string) => void
): Promise<{ lines: RawOcrLineItem[]; fullText: string; confidence: number }> {
  const service = await getOrCreatePaddleOcrService((status) => onProgress?.(status));

  // Ensure image is rendered onto a canvas element
  let canvas: HTMLCanvasElement;
  if (typeof imageSource === 'string') {
    canvas = document.createElement('canvas');
    canvas.width = Math.max(16, imageWidth);
    canvas.height = Math.max(16, imageHeight);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2D canvas context');
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Failed to load image for PaddleOCR'));
      img.src = imageSource;
    });
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  } else if (
    typeof HTMLImageElement !== 'undefined' &&
    imageSource instanceof HTMLImageElement
  ) {
    canvas = document.createElement('canvas');
    canvas.width = imageWidth || imageSource.naturalWidth;
    canvas.height = imageHeight || imageSource.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2D canvas context');
    ctx.drawImage(imageSource, 0, 0, canvas.width, canvas.height);
  } else {
    canvas = imageSource as HTMLCanvasElement;
  }

  onProgress?.('Running PaddleOCR neural inference (DBNet + SVTR)...');
  const result = await service.recognize(canvas);

  const outLines: RawOcrLineItem[] = [];

  if (Array.isArray(result?.lines)) {
    for (const lineGroup of result.lines) {
      if (!Array.isArray(lineGroup) || lineGroup.length === 0) continue;

      for (const item of lineGroup) {
        const rawText = String(item?.text || '').trim();
        if (!rawText) continue;
        const bx = Number(item.box?.x ?? 0);
        const by = Number(item.box?.y ?? 0);
        const bw = Number(item.box?.width ?? 0);
        const bh = Number(item.box?.height ?? 0);
        const itemBBox = {
          x0: Math.max(0, Math.round(bx)),
          y0: Math.max(0, Math.round(by)),
          x1: Math.min(imageWidth, Math.round(bx + bw)),
          y1: Math.min(imageHeight, Math.round(by + bh))
        };

        const pieces = separateLineBySymbolsAndDelimiters({
          text: rawText,
          bbox: itemBBox
        });

        for (const piece of pieces) {
          if (hasMeaningfulContent(piece.text) && !(piece.text.length === 1 && !/[a-zA-Z0-9]/.test(piece.text))) {
            outLines.push(piece);
          }
        }
      }
    }
  }

  const rawFull = result?.text || outLines.map((l) => l.text).join('\n');
  return {
    lines: outLines,
    fullText: eliminateAnomalySymbols(rawFull),
    confidence: Number(result?.confidence ?? 0.95)
  };
}

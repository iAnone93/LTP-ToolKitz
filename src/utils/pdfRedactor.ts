import * as pdfjsLib from 'pdfjs-dist';
import {
  PDFDocument,
  PDFPage,
  PDFName,
  PDFArray,
  PDFDict,
  PDFRef,
  PDFString,
  PDFHexString,
  rgb,
  StandardFonts
} from 'pdf-lib';

import './pdfjsWorker';

export interface RedactionRule {
  id: string;
  name: string;
  category: 'email' | 'phone' | 'financial' | 'identity' | 'network' | 'image' | 'custom';
  pattern: string;
  flags: string;
  description: string;
  enabled: boolean;
  color: string;
  /** For the `__SENSITIVE_LABELS__` rule: field labels whose values are redacted inside images */
  labels?: string[];
}

export type OcrFieldType = 'input_value' | 'label' | 'header_or_note';
export type OcrEngineType = 'tesseract' | 'paddleocr';
export const DEFAULT_OCR_ENGINE: OcrEngineType = 'tesseract';

import { runPaddleOcrOnImage } from './paddleOcrEngine';
import { detectFacesInImage, FaceBox } from './faceDetector';
import {
  analyzeOcrLayout,
  lineConfidence,
  resolveOcrFieldRoles,
  DEFAULT_SENSITIVE_LABELS,
  OcrLineLayout
} from './ocrLayout';

export { DEFAULT_SENSITIVE_LABELS };
import {
  eliminateAnomalySymbols,
  hasMeaningfulContent,
  cleanOcrWords,
  ALLOWED_OCR_SYMBOLS,
  separateLineBySymbolsAndDelimiters
} from './ocrSanitizer';

export {
  eliminateAnomalySymbols,
  hasMeaningfulContent,
  cleanOcrWords,
  ALLOWED_OCR_SYMBOLS,
  separateLineBySymbolsAndDelimiters
};

export interface InImageSubBox {
  id: string;
  label: string;
  fullLineText?: string;
  fieldType?: OcrFieldType | 'face';
  pairedLabel?: string;
  ruleId?: string;
  ruleName: string;
  xRatio: number; // 0..1 relative to image width
  yRatio: number; // 0..1 relative to image height (from top)
  wRatio: number; // 0..1 relative to image width
  hRatio: number; // 0..1 relative to image height
  selected: boolean;
}

export interface RawOcrLineItem {
  text: string;
  bbox: { x0: number; y0: number; x1: number; y1: number };
  /** Only from "label: value" syntax on the line itself; final roles are decided per rule set */
  fieldType?: OcrFieldType;
  pairedLabel?: string;
  /** 0-100, when the OCR engine reports it */
  confidence?: number;
  /** Pixel and geometry facts measured at scan time (see analyzeOcrLayout) */
  layout?: OcrLineLayout;
  words: {
    text: string;
    bbox: { x0: number; y0: number; x1: number; y1: number };
    confidence?: number;
  }[];
}

export interface DetectedMatch {
  id: string;
  ruleId: string;
  ruleName: string;
  matchedText: string;
  pageIndex: number; // 0-based
  x: number; // in PDF points (from left)
  y: number; // in PDF points (from bottom)
  width: number;
  height: number;
  selected: boolean;
  // In-Image OCR & Linked Image Attachment Fields
  imageObjId?: string;
  unclippedX?: number;
  unclippedY?: number;
  unclippedWidth?: number;
  unclippedHeight?: number;
  linkedUri?: string;
  imageMode?: 'partial' | 'full_blackout';
  originalImageDataUrl?: string;
  redactedImageDataUrl?: string;
  imagePixelWidth?: number;
  imagePixelHeight?: number;
  rawOcrLines?: RawOcrLineItem[];
  rawFaceBoxes?: FaceBox[];
  subBoxes?: InImageSubBox[];
  ocrEngineUsed?: OcrEngineType;
  createLocalFullSizePage?: boolean;
}

export interface RedactionStyleOptions {
  mode: 'replacement_text' | 'blackout' | 'whiteout';
  replacementText: string;
  boxColor: 'black' | 'dark_slate' | 'white' | 'red_tint';
  textColor: 'white' | 'red' | 'dark';
}

export const DEFAULT_REDACTION_RULES: RedactionRule[] = [
  {
    id: 'email',
    name: 'Email Addresses',
    category: 'email',
    pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(?:[.\\s]+[a-zA-Z]{2,})?',
    flags: 'gi',
    description: 'Corporate and personal email addresses (e.g., support@corp.com)',
    enabled: true,
    color: 'bg-amber-500'
  },
  {
    id: 'phone',
    name: 'Phone Numbers',
    category: 'phone',
    pattern: '(?:\\+?\\d{1,3}[-.\\s]?)?(?:\\(\\d{3}\\)|\\d{3})[-.\\s]?\\d{3}[-.\\s]?\\d{4}',
    flags: 'g',
    description: 'US and international phone formats (e.g., (415) 890-4412, +1-555-123-4567)',
    enabled: true,
    color: 'bg-emerald-500'
  },
  {
    id: 'credit_card',
    name: 'Credit Card / Accounts',
    category: 'financial',
    pattern: '\\b(?:\\d{4}[ -]?){3}\\d{4}\\b|\\b\\d{15,19}\\b',
    flags: 'g',
    description: '15-16 digit payment card and bank account numbers',
    enabled: true,
    color: 'bg-rose-500'
  },
  {
    id: 'identity_ssn',
    name: 'Identity / SSN / NIK',
    category: 'identity',
    pattern: '\\b\\d{3}[-\\s]?\\d{2}[-\\s]?\\d{4}\\b|\\b\\d{16}\\b',
    flags: 'g',
    description: 'Social Security Numbers (9 digits) and national IDs (16 digits)',
    enabled: true,
    color: 'bg-purple-500'
  },
  {
    id: 'long_ids',
    name: 'Long IDs & Tokens',
    category: 'identity',
    // 20+ letters and digits mixed, e.g. database IDs, UUID-like keys, API tokens
    pattern: '\\b(?=[A-Za-z0-9]*\\d)(?=[A-Za-z0-9]*[A-Za-z])[A-Za-z0-9]{20,}\\b',
    flags: 'g',
    description: 'Database IDs, keys and tokens: 20+ characters mixing letters and digits',
    enabled: true,
    color: 'bg-orange-500'
  },
  {
    id: 'embedded_images',
    name: 'Embedded Images / Photos',
    category: 'image',
    pattern: '__EMBEDDED_IMAGES__',
    flags: 'g',
    description: 'Automatically detect & blackout embedded photos, signatures, seals, and raster images',
    enabled: true,
    color: 'bg-indigo-600'
  },
  {
    id: 'faces',
    name: 'Faces in Images',
    category: 'image',
    pattern: '__FACES__',
    flags: 'g',
    description: 'Detect faces inside embedded photos & screenshots and pixelate them',
    enabled: true,
    color: 'bg-fuchsia-500'
  },
  {
    id: 'sensitive_fields',
    name: 'Sensitive Fields in Images',
    category: 'image',
    pattern: '__SENSITIVE_LABELS__',
    flags: 'g',
    labels: DEFAULT_SENSITIVE_LABELS,
    description: 'Redact the value next to or under these labels (Nama, NIP, Jabatan…); labels & placeholders stay readable',
    enabled: true,
    color: 'bg-teal-500'
  },
  {
    id: 'all_input_values',
    name: 'All Input Values in Images (strict)',
    category: 'image',
    pattern: '__ALL_INPUT_VALUES__',
    flags: 'g',
    description: 'Also redact form values whose label is not in the sensitive list',
    enabled: false,
    color: 'bg-slate-500'
  },
  {
    id: 'currency',
    name: 'Currency & Balances',
    category: 'financial',
    pattern: '(?:\\$|Rp|EUR|USD|GBP|\\bIDR\\b)\\s?[-+]?\\d{1,3}(?:[.,\\s]\\d{3})*(?:[.,\\s]\\d{2})?',
    flags: 'gi',
    description: 'Dollar, Euro, Rupiah, and financial balances',
    enabled: false,
    color: 'bg-cyan-500'
  },
  {
    id: 'ipv4',
    name: 'IPv4 Addresses & Ports',
    category: 'network',
    pattern: '\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(?::\\d{1,5})?\\b',
    flags: 'g',
    description: 'Internal and external IP addresses with optional ports (e.g., 192.168.1.1, 10.0.0.1:1315)',
    enabled: false,
    color: 'bg-blue-500'
  },
  {
    id: 'url_endpoint',
    name: 'URLs & Server Endpoints',
    category: 'network',
    pattern: 'https?:\\/\\/(?:localhost|(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,}|(?:\\d{1,3}\\.){3}\\d{1,3})(?::\\d{1,5})?(?:\\/[^\\s"\'<>)]*)?',
    flags: 'gi',
    description: 'Full HTTP/HTTPS URLs, API paths, and host:port endpoints (e.g., http://10.0.0.1:1315/api/v1)',
    enabled: false,
    color: 'bg-sky-500'
  }
];

export interface ExtractedTextItem {
  str: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
}

/**
 * Parse and normalize user custom regex input.
 * Handles inputs with leading/trailing slashes and flags:
 * e.g. /\(\d{3}\)\s\d{3}-\d{4}/g -> pattern: \(\d{3}\)\s\d{3}-\d{4}, flags: g
 */
export function parseUserRegexInput(raw: string): { pattern: string; flags: string } {
  let cleaned = raw.trim();
  let flags = 'g';

  // Format 1: /pattern/flags or /pattern/
  const slashMatch = cleaned.match(/^\/(.*)\/([a-z]*)$/i);
  if (slashMatch) {
    cleaned = slashMatch[1];
    const userFlags = slashMatch[2];
    flags = userFlags ? (userFlags.includes('g') ? userFlags : userFlags + 'g') : 'g';
  } else {
    // Format 2: pattern/flags (e.g. \(\d{3}\)\s\d{3}-\d{4}/g)
    const trailingSlashMatch = cleaned.match(/^(.*)\/([a-z]+)$/i);
    if (trailingSlashMatch) {
      cleaned = trailingSlashMatch[1];
      const userFlags = trailingSlashMatch[2];
      flags = userFlags ? (userFlags.includes('g') ? userFlags : userFlags + 'g') : 'g';
    } else if (cleaned.startsWith('/')) {
      // Format 3: leading slash only
      cleaned = cleaned.slice(1);
    }
  }

  // Ensure global search
  if (!flags.includes('g')) {
    flags += 'g';
  }

  return { pattern: cleaned, flags };
}

/**
 * Scan a PDF ArrayBuffer with active rules and return all detected matches with coordinates
 */
export async function scanPdfForSensitiveData(
  pdfBuffer: ArrayBuffer,
  rules: RedactionRule[],
  onProgress?: (current: number, total: number) => void
): Promise<{ matches: DetectedMatch[]; numPages: number }> {
  const loadingTask = pdfjsLib.getDocument({ data: pdfBuffer.slice(0), verbosity: 0 });
  const pdfJsDoc = await loadingTask.promise;
  const numPages = pdfJsDoc.numPages;

  const detectedMatches: DetectedMatch[] = [];
  let matchIdCounter = 0;

  const activeRules = rules.filter(r => r.enabled && r.pattern.trim() !== '');
  const activeTextRules = activeRules.filter(
    r => r.category !== 'image' && r.pattern !== '__EMBEDDED_IMAGES__'
  );
  const activeImageRule = activeRules.find(r => r.pattern === '__EMBEDDED_IMAGES__');

  for (let pageIdx = 0; pageIdx < numPages; pageIdx++) {
    if (onProgress) {
      onProgress(pageIdx + 1, numPages);
    }

    const page = await pdfJsDoc.getPage(pageIdx + 1);

    // 1. Automatic Embedded Image Detection via PDF.js Operator List
    if (activeImageRule) {
      try {
        const opList = await page.getOperatorList();
        const OPS = pdfjsLib.OPS as any;

        const multiplyCtm = (ctm: number[], m: ArrayLike<number>): number[] => {
          const [a, b, c, d, e, f] = ctm;
          const a2 = Number(m[0]),
            b2 = Number(m[1]),
            c2 = Number(m[2]),
            d2 = Number(m[3]),
            e2 = Number(m[4]),
            f2 = Number(m[5]);
          return [
            a2 * a + b2 * c,
            a2 * b + b2 * d,
            c2 * a + d2 * c,
            c2 * b + d2 * d,
            e2 * a + f2 * c + e,
            e2 * b + f2 * d + f
          ];
        };

        const transformRectToBBox = (
          x0: number,
          y0: number,
          x1: number,
          y1: number,
          ctm: number[]
        ): [number, number, number, number] => {
          const [a, b, c, d, e, f] = ctm;
          const xs = [
            x0 * a + y0 * c + e,
            x1 * a + y0 * c + e,
            x0 * a + y1 * c + e,
            x1 * a + y1 * c + e
          ];
          const ys = [
            x0 * b + y0 * d + f,
            x1 * b + y0 * d + f,
            x0 * b + y1 * d + f,
            x1 * b + y1 * d + f
          ];
          return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
        };

        const intersectBBox = (
          a: [number, number, number, number] | null,
          b: [number, number, number, number]
        ): [number, number, number, number] => {
          if (!a) return b;
          const minX = Math.max(a[0], b[0]);
          const minY = Math.max(a[1], b[1]);
          const maxX = Math.min(a[2], b[2]);
          const maxY = Math.min(a[3], b[3]);
          if (maxX > minX && maxY > minY) {
            return [minX, minY, maxX, maxY];
          }
          return b;
        };

        const findImageObjIdInOperatorList = (opListIR: any, depth = 0): string | undefined => {
          if (!opListIR || !Array.isArray(opListIR.fnArray) || depth > 4) return undefined;
          for (let k = 0; k < opListIR.fnArray.length; k++) {
            const opFn = opListIR.fnArray[k];
            const opArgs = opListIR.argsArray?.[k];
            if (
              (opFn === OPS.paintImageXObject || opFn === OPS.paintImageXObjectRepeat) &&
              typeof opArgs?.[0] === 'string'
            ) {
              return opArgs[0];
            }
            if (
              opFn === OPS.paintInlineImageXObject ||
              opFn === OPS.paintImageMaskXObject ||
              opFn === OPS.paintInlineImageXObjectGroup ||
              opFn === OPS.paintImageMaskXObjectRepeat ||
              opFn === OPS.paintImageMaskXObjectGroup
            ) {
              return '__INLINE_IMAGE__';
            }
            if (
              (opFn === OPS.setFillColorN || opFn === OPS.setStrokeColorN) &&
              Array.isArray(opArgs) &&
              opArgs[0] === 'TilingPattern'
            ) {
              const nested = findImageObjIdInOperatorList(opArgs[2], depth + 1);
              if (nested) return nested;
            }
          }
          return undefined;
        };

        interface GraphicsState {
          ctm: number[];
          clipBox: [number, number, number, number] | null;
          fillPatternHasImage: boolean;
          fillPatternImageObjId?: string;
        }

        let state: GraphicsState = {
          ctm: [1, 0, 0, 1, 0, 0],
          clipBox: null,
          fillPatternHasImage: false,
          fillPatternImageObjId: undefined
        };
        const stateStack: GraphicsState[] = [];
        const cloneState = (s: GraphicsState): GraphicsState => ({
          ctm: [...s.ctm],
          clipBox: s.clipBox ? [...s.clipBox] : null,
          fillPatternHasImage: s.fillPatternHasImage,
          fillPatternImageObjId: s.fillPatternImageObjId
        });

        let pendingClip = false;
        let pageImgCount = 0;
        const pageDetectedBoxes: [number, number, number, number][] = [];

        // Also inspect PDF Link Annotations on this page so we can pair linked URLs (e.g., CloudFront attachments) with images
        let pageLinkAnnotations: { rect: [number, number, number, number]; url: string }[] = [];
        try {
          const annots = await page.getAnnotations();
          for (const annot of annots) {
            const url = annot?.url || annot?.unsafeUrl;
            if (url && Array.isArray(annot?.rect) && annot.rect.length >= 4) {
              const rx0 = Math.min(Number(annot.rect[0]), Number(annot.rect[2]));
              const ry0 = Math.min(Number(annot.rect[1]), Number(annot.rect[3]));
              const rx1 = Math.max(Number(annot.rect[0]), Number(annot.rect[2]));
              const ry1 = Math.max(Number(annot.rect[1]), Number(annot.rect[3]));
              pageLinkAnnotations.push({ rect: [rx0, ry0, rx1, ry1], url: String(url) });
            }
          }
        } catch {
          // Ignore annotation read errors
        }

        const findOverlappingLinkUri = (
          imgX: number,
          imgY: number,
          imgW: number,
          imgH: number
        ): string | undefined => {
          const ix1 = imgX + imgW;
          const iy1 = imgY + imgH;
          for (const link of pageLinkAnnotations) {
            const [lx0, ly0, lx1, ly1] = link.rect;
            const overlapX = Math.max(0, Math.min(ix1, lx1) - Math.max(imgX, lx0));
            const overlapY = Math.max(0, Math.min(iy1, ly1) - Math.max(imgY, ly0));
            if (overlapX > 2 && overlapY > 2) {
              return link.url;
            }
          }
          return undefined;
        };

        const recordImageBBox = (
          bbox: [number, number, number, number],
          imageObjId?: string,
          rawBBox?: [number, number, number, number]
        ) => {
          const imgX = bbox[0];
          const imgY = bbox[1];
          const imgW = bbox[2] - bbox[0];
          const imgH = bbox[3] - bbox[1];

          if (!isFinite(imgX) || !isFinite(imgY) || !isFinite(imgW) || !isFinite(imgH)) return;
          if (imgW < 8 || imgH < 8) return;

          // Deduplicate identical/overlapping image layers (e.g., SMask + RGB pair)
          const existingIdx = pageDetectedBoxes.findIndex(
            ([bx, by, bw, bh]) =>
              Math.abs(bx - imgX) < 1.5 &&
              Math.abs(by - imgY) < 1.5 &&
              Math.abs(bw - imgW) < 1.5 &&
              Math.abs(bh - imgH) < 1.5
          );
          if (existingIdx !== -1) {
            return;
          }

          pageDetectedBoxes.push([imgX, imgY, imgW, imgH]);
          pageImgCount++;
          const linkedUri = findOverlappingLinkUri(imgX, imgY, imgW, imgH);
          const unclippedX = rawBBox ? rawBBox[0] : imgX;
          const unclippedY = rawBBox ? rawBBox[1] : imgY;
          const unclippedW = rawBBox ? Math.max(imgW, rawBBox[2] - rawBBox[0]) : imgW;
          const unclippedH = rawBBox ? Math.max(imgH, rawBBox[3] - rawBBox[1]) : imgH;
          const cleanObjId = imageObjId && imageObjId !== '__INLINE_IMAGE__' ? imageObjId : undefined;

          detectedMatches.push({
            id: `match-img-${pageIdx}-${matchIdCounter++}`,
            ruleId: activeImageRule.id,
            ruleName: activeImageRule.name,
            matchedText: `Embedded Image #${pageImgCount} (${Math.round(imgW)}×${Math.round(imgH)} pt)`,
            pageIndex: pageIdx,
            x: imgX,
            y: imgY,
            width: imgW,
            height: imgH,
            selected: true,
            imageObjId: cleanObjId,
            unclippedX,
            unclippedY,
            unclippedWidth: unclippedW,
            unclippedHeight: unclippedH,
            linkedUri,
            imageMode: 'partial',
            createLocalFullSizePage: true
          });
        };

        for (let i = 0; i < opList.fnArray.length; i++) {
          const fn = opList.fnArray[i];
          const args = opList.argsArray[i];

          if (fn === OPS.save) {
            stateStack.push(cloneState(state));
          } else if (fn === OPS.restore) {
            if (stateStack.length > 0) {
              state = stateStack.pop()!;
            }
            pendingClip = false;
          } else if (fn === OPS.beginGroup) {
            stateStack.push(cloneState(state));
            const groupOpts = args?.[0];
            if (groupOpts?.bbox && groupOpts.bbox.length >= 4) {
              const gMat =
                groupOpts.matrix && groupOpts.matrix.length >= 6
                  ? multiplyCtm(state.ctm, groupOpts.matrix)
                  : state.ctm;
              const gBox = transformRectToBBox(
                Number(groupOpts.bbox[0]),
                Number(groupOpts.bbox[1]),
                Number(groupOpts.bbox[2]),
                Number(groupOpts.bbox[3]),
                gMat
              );
              state.clipBox = intersectBBox(state.clipBox, gBox);
            }
          } else if (fn === OPS.endGroup) {
            if (stateStack.length > 0) {
              state = stateStack.pop()!;
            }
            pendingClip = false;
          } else if (fn === OPS.paintFormXObjectBegin) {
            stateStack.push(cloneState(state));
            const matrix = args?.[0];
            const bbox = args?.[1];
            if (matrix && matrix.length >= 6) {
              state.ctm = multiplyCtm(state.ctm, matrix);
            }
            if (bbox && bbox.length >= 4) {
              const fBox = transformRectToBBox(
                Number(bbox[0]),
                Number(bbox[1]),
                Number(bbox[2]),
                Number(bbox[3]),
                state.ctm
              );
              state.clipBox = intersectBBox(state.clipBox, fBox);
            }
          } else if (fn === OPS.paintFormXObjectEnd) {
            if (stateStack.length > 0) {
              state = stateStack.pop()!;
            }
            pendingClip = false;
          } else if (fn === OPS.transform && args && args.length >= 6) {
            state.ctm = multiplyCtm(state.ctm, args);
          } else if (fn === OPS.clip || fn === OPS.eoClip) {
            pendingClip = true;
          } else if (fn === OPS.setFillColorN || fn === OPS.setStrokeColorN) {
            if (Array.isArray(args) && args[0] === 'TilingPattern') {
              const foundId = findImageObjIdInOperatorList(args[2]);
              state.fillPatternHasImage = Boolean(foundId);
              state.fillPatternImageObjId = foundId;
            } else {
              state.fillPatternHasImage = false;
              state.fillPatternImageObjId = undefined;
            }
          } else if (
            fn === OPS.setFillRGBColor ||
            fn === OPS.setFillGray ||
            fn === OPS.setFillCMYKColor ||
            fn === OPS.setFillColor
          ) {
            state.fillPatternHasImage = false;
            state.fillPatternImageObjId = undefined;
          } else if (fn === OPS.constructPath) {
            const op = args?.[0];
            const minMax = args?.[2];
            if (
              minMax &&
              minMax.length >= 4 &&
              isFinite(minMax[0]) &&
              isFinite(minMax[1]) &&
              isFinite(minMax[2]) &&
              isFinite(minMax[3])
            ) {
              const pathBBox = transformRectToBBox(
                Number(minMax[0]),
                Number(minMax[1]),
                Number(minMax[2]),
                Number(minMax[3]),
                state.ctm
              );
              if (
                state.fillPatternHasImage &&
                (op === OPS.fill ||
                  op === OPS.eoFill ||
                  op === OPS.fillStroke ||
                  op === OPS.eoFillStroke ||
                  op === OPS.closeFillStroke ||
                  op === OPS.closeEOFillStroke ||
                  op === OPS.rawFillPath)
              ) {
                recordImageBBox(
                  intersectBBox(state.clipBox, pathBBox),
                  state.fillPatternImageObjId,
                  pathBBox
                );
              }
              if (pendingClip || op === OPS.clip || op === OPS.eoClip) {
                state.clipBox = intersectBBox(state.clipBox, pathBBox);
                pendingClip = false;
              }
            } else {
              pendingClip = false;
            }
          } else if (
            fn === OPS.paintImageXObject ||
            fn === OPS.paintInlineImageXObject ||
            fn === OPS.paintImageMaskXObject
          ) {
            const rawBBox = transformRectToBBox(0, 0, 1, 1, state.ctm);
            const objId =
              fn === OPS.paintImageXObject && typeof args?.[0] === 'string'
                ? args[0]
                : undefined;
            recordImageBBox(intersectBBox(state.clipBox, rawBBox), objId, rawBBox);
          } else if (fn === OPS.paintImageXObjectRepeat) {
            const [objIdArg, scaleX, scaleY, positions] = args || [];
            const objId = typeof objIdArg === 'string' ? objIdArg : undefined;
            if (positions && positions.length >= 2) {
              for (let p = 0; p < positions.length; p += 2) {
                const itemCtm = multiplyCtm(state.ctm, [
                  scaleX,
                  0,
                  0,
                  scaleY,
                  positions[p],
                  positions[p + 1]
                ]);
                const rawBBox = transformRectToBBox(0, 0, 1, 1, itemCtm);
                recordImageBBox(intersectBBox(state.clipBox, rawBBox), objId, rawBBox);
              }
            }
          } else if (fn === OPS.paintImageMaskXObjectRepeat) {
            const [, scaleX, skewX, skewY, scaleY, positions] = args || [];
            if (positions && positions.length >= 2) {
              for (let p = 0; p < positions.length; p += 2) {
                const itemCtm = multiplyCtm(state.ctm, [
                  scaleX,
                  skewX,
                  skewY,
                  scaleY,
                  positions[p],
                  positions[p + 1]
                ]);
                const rawBBox = transformRectToBBox(0, 0, 1, 1, itemCtm);
                recordImageBBox(intersectBBox(state.clipBox, rawBBox));
              }
            }
          } else if (fn === OPS.paintInlineImageXObjectGroup) {
            const [, map] = args || [];
            if (Array.isArray(map)) {
              for (const entry of map) {
                if (entry?.transform && entry.transform.length >= 6) {
                  const itemCtm = multiplyCtm(state.ctm, entry.transform);
                  const rawBBox = transformRectToBBox(0, 0, 1, 1, itemCtm);
                  recordImageBBox(intersectBBox(state.clipBox, rawBBox));
                }
              }
            }
          } else if (fn === OPS.paintImageMaskXObjectGroup) {
            const [images] = args || [];
            if (Array.isArray(images)) {
              for (const entry of images) {
                if (entry?.transform && entry.transform.length >= 6) {
                  const itemCtm = multiplyCtm(state.ctm, entry.transform);
                  const rawBBox = transformRectToBBox(0, 0, 1, 1, itemCtm);
                  recordImageBBox(intersectBBox(state.clipBox, rawBBox));
                }
              }
            }
          }
        }
      } catch (err) {
        console.warn('Could not inspect page operator list for images', err);
      }
    }

    const textContent = await page.getTextContent();
    const items = textContent.items as any[];

    // 2. Process each text item on the page
    for (const item of items) {
      const text = item.str;
      if (!text || text.trim() === '') continue;

      const transform = item.transform; // [scaleX, skewY, skewX, scaleY, tx, ty]
      const originX = transform[4];
      const originY = transform[5];
      const totalWidth = item.width || Math.abs(transform[0]) * text.length * 0.5;
      const fontSize = Math.abs(transform[3]) || Math.abs(transform[0]) || 12;
      const totalChars = text.length;

      // Run each active text rule against the text item
      for (const rule of activeTextRules) {
        try {
          const reg = new RegExp(rule.pattern, rule.flags);
          let match: RegExpExecArray | null;

          while ((match = reg.exec(text)) !== null) {
            const matchedText = match[0];
            if (!matchedText) {
              if (reg.lastIndex === match.index) reg.lastIndex++;
              continue;
            }

            const startCharIdx = match.index;
            const endCharIdx = match.index + matchedText.length;

            // Compute sub-bounding box proportional to character indices
            const charWidth = totalChars > 0 ? totalWidth / totalChars : fontSize * 0.6;
            const matchX = originX + (startCharIdx * charWidth);
            const matchWidth = (endCharIdx - startCharIdx) * charWidth;
            const matchHeight = Math.max(item.height || fontSize, fontSize * 0.9);

            detectedMatches.push({
              id: `match-${pageIdx}-${matchIdCounter++}`,
              ruleId: rule.id,
              ruleName: rule.name,
              matchedText,
              pageIndex: pageIdx,
              x: matchX,
              y: originY,
              width: Math.max(matchWidth, 12),
              height: matchHeight,
              selected: true
            });

            if (!rule.flags.includes('g')) break;
          }
        } catch {
          // Ignore invalid regex patterns gracefully
        }
      }
    }
  }

  return { matches: detectedMatches, numPages };
}

// Blocks across the longer side of a censored face. Fewer blocks = less recoverable; ~7 leaves only colour patches.
const FACE_PIXEL_BLOCKS = 7;

function pixelateRegion(ctx: CanvasRenderingContext2D, rx: number, ry: number, rw: number, rh: number) {
  // Whole pixels: fractional edges would be anti-aliased with the original face pixels
  const x = Math.max(0, Math.floor(rx));
  const y = Math.max(0, Math.floor(ry));
  const w = Math.min(ctx.canvas.width - x, Math.ceil(rx + rw) - x);
  const h = Math.min(ctx.canvas.height - y, Math.ceil(ry + rh) - y);
  if (w <= 0 || h <= 0) return;

  const cell = Math.max(4, Math.ceil(Math.max(w, h) / FACE_PIXEL_BLOCKS));
  const smallW = Math.max(1, Math.round(w / cell));
  const smallH = Math.max(1, Math.round(h / cell));

  const small = document.createElement('canvas');
  small.width = smallW;
  small.height = smallH;
  const smallCtx = small.getContext('2d');
  if (!smallCtx) {
    ctx.fillStyle = '#0d0d0d';
    ctx.fillRect(x, y, w, h);
    return;
  }
  smallCtx.imageSmoothingEnabled = true;
  smallCtx.imageSmoothingQuality = 'high';
  smallCtx.drawImage(ctx.canvas, x, y, w, h, 0, 0, smallW, smallH);

  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(small, 0, 0, smallW, smallH, x, y, w, h);
  ctx.restore();
}

/**
 * Render an original image DataURL together with its active InImageSubBox redactions
 * into a composited DataURL (used for live thumbnail preview, modal preview, and PDF export).
 */
export async function renderSanitizedImageWithSubBoxes(
  originalDataUrl: string,
  subBoxes: InImageSubBox[],
  options: RedactionStyleOptions
): Promise<string> {
  if (typeof document === 'undefined' || !originalDataUrl) return originalDataUrl;

  return new Promise<string>((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width || 600;
      canvas.height = img.naturalHeight || img.height || 800;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(originalDataUrl);
        return;
      }

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Faces first, so they are pixelated from the original pixels rather than from other boxes drawn on top
      const activeSubBoxes = (subBoxes || [])
        .filter(b => b.selected)
        .sort((a, b) => Number(b.fieldType === 'face') - Number(a.fieldType === 'face'));
      for (const box of activeSubBoxes) {
        const bx = box.xRatio * canvas.width;
        const by = box.yRatio * canvas.height;
        const bw = Math.max(8, box.wRatio * canvas.width);
        const bh = Math.max(8, box.hRatio * canvas.height);

        if (box.fieldType === 'face') {
          pixelateRegion(ctx, bx, by, bw, bh);
        } else if (options.mode === 'blackout') {
          ctx.fillStyle = '#0d0d0d';
          ctx.fillRect(bx, by, bw, bh);
        } else if (options.mode === 'whiteout') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(bx, by, bw, bh);
          ctx.strokeStyle = '#e2e8f0';
          ctx.lineWidth = 1;
          ctx.strokeRect(bx, by, bw, bh);
        } else {
          const rawLabel = options.replacementText || '[CONFIDENTIAL]';
          let bgHex = '#1e242e';
          let borderHex = '#333b4d';
          let textHex = '#ffffff';

          if (options.boxColor === 'red_tint') {
            bgHex = '#fdeded';
            borderHex = '#e33838';
            textHex = '#bf1919';
          } else if (options.boxColor === 'white') {
            bgHex = '#ffffff';
            borderHex = '#cccccc';
            textHex = '#333333';
          } else if (options.boxColor === 'black') {
            bgHex = '#000000';
            borderHex = '#333333';
            textHex = '#ffffff';
          }

          ctx.fillStyle = bgHex;
          ctx.fillRect(bx, by, bw, bh);
          ctx.strokeStyle = borderHex;
          ctx.lineWidth = 1;
          ctx.strokeRect(bx, by, bw, bh);

          const availW = Math.max(4, bw - 4);
          let fontSize = Math.max(6, Math.min(Math.floor(bh * 0.72), 20));
          ctx.font = `bold ${fontSize}px sans-serif`;

          let display = rawLabel;
          const fullTextW = ctx.measureText(display).width;
          if (fullTextW > availW) {
            const scaledFont = Math.max(6, Math.floor(fontSize * (availW / fullTextW)));
            fontSize = scaledFont;
            ctx.font = `bold ${fontSize}px sans-serif`;
          }

          if (ctx.measureText(display).width > availW && display.length > 3) {
            let t = display;
            while (t.length > 1 && ctx.measureText(t + '..').width > availW) {
              t = t.slice(0, -1);
            }
            display = t + '..';
          }

          ctx.fillStyle = textHex;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(display, bx + bw / 2, by + bh / 2 + 0.5);
        }
      }

      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => resolve(originalDataUrl);
    img.src = originalDataUrl;
  });
}

// Persistent singleton Tesseract worker so WASM & language traineddata only initialize once per session
let sharedOcrWorkerPromise: Promise<any> | null = null;

export function getOrCreateOcrWorker(): Promise<any> {
  if (!sharedOcrWorkerPromise) {
    sharedOcrWorkerPromise = (async () => {
      const Tesseract = await import('tesseract.js');
      return await Tesseract.createWorker('eng');
    })().catch((err) => {
      sharedOcrWorkerPromise = null;
      throw err;
    });
  }
  return sharedOcrWorkerPromise;
}

/**
 * Extract the raw native-resolution uncropped image directly from a PDF.js Image XObject
 * (or fallback to an uncropped high-DPI render) so full portrait/landscape images are never
 * shrunk or cropped into small squares.
 */
async function extractNativePdfImageObject(
  page: any,
  imageObjId?: string
): Promise<{ dataUrl: string; width: number; height: number } | null> {
  if (!imageObjId || typeof document === 'undefined') return null;

  try {
    const rawImgObj = await new Promise<any>((resolve) => {
      let settled = false;
      const finish = (val: any) => {
        if (!settled) {
          settled = true;
          resolve(val);
        }
      };

      const timer = setTimeout(() => finish(null), 400);
      try {
        // PDF.js keeps images shared across pages in `commonObjs` (ids prefixed `g_`), the rest in `objs`
        const store = imageObjId.startsWith('g_') ? page.commonObjs : page.objs;
        if (store?.has?.(imageObjId)) {
          clearTimeout(timer);
          finish(store.get(imageObjId));
        } else if (typeof store?.get === 'function') {
          store.get(imageObjId, (data: any) => {
            clearTimeout(timer);
            finish(data);
          });
        } else {
          clearTimeout(timer);
          finish(null);
        }
      } catch {
        clearTimeout(timer);
        finish(null);
      }
    });

    if (!rawImgObj) return null;

    const natW = Number(rawImgObj.width || rawImgObj.naturalWidth || 0);
    const natH = Number(rawImgObj.height || rawImgObj.naturalHeight || 0);
    if (natW < 16 || natH < 16) return null;

    const canvas = document.createElement('canvas');
    canvas.width = natW;
    canvas.height = natH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Case 1: ImageBitmap or HTMLImageElement or HTMLCanvasElement
    if (rawImgObj.bitmap) {
      ctx.drawImage(rawImgObj.bitmap, 0, 0, natW, natH);
      return { dataUrl: canvas.toDataURL('image/png'), width: natW, height: natH };
    }
    if (
      typeof ImageBitmap !== 'undefined' &&
      rawImgObj instanceof ImageBitmap
    ) {
      ctx.drawImage(rawImgObj, 0, 0, natW, natH);
      return { dataUrl: canvas.toDataURL('image/png'), width: natW, height: natH };
    }
    if (
      (typeof HTMLImageElement !== 'undefined' && rawImgObj instanceof HTMLImageElement) ||
      (typeof HTMLCanvasElement !== 'undefined' && rawImgObj instanceof HTMLCanvasElement)
    ) {
      ctx.drawImage(rawImgObj, 0, 0, natW, natH);
      return { dataUrl: canvas.toDataURL('image/png'), width: natW, height: natH };
    }

    // Case 2: Raw pixel buffer (RGB_24BPP, RGBA_32BPP, GRAYSCALE_1BPP)
    if (rawImgObj.data && rawImgObj.data.length > 0) {
      const src = rawImgObj.data as Uint8Array | Uint8ClampedArray;
      const imgData = ctx.createImageData(natW, natH);
      const dst = imgData.data;
      const totalPixels = natW * natH;

      if (src.length === totalPixels * 4) {
        dst.set(src);
      } else if (src.length === totalPixels * 3) {
        let sIdx = 0;
        let dIdx = 0;
        for (let p = 0; p < totalPixels; p++) {
          dst[dIdx++] = src[sIdx++];
          dst[dIdx++] = src[sIdx++];
          dst[dIdx++] = src[sIdx++];
          dst[dIdx++] = 255;
        }
      } else if (src.length === totalPixels) {
        let dIdx = 0;
        for (let p = 0; p < totalPixels; p++) {
          const v = src[p];
          dst[dIdx++] = v;
          dst[dIdx++] = v;
          dst[dIdx++] = v;
          dst[dIdx++] = 255;
        }
      } else {
        return null;
      }

      ctx.putImageData(imgData, 0, 0);
      return { dataUrl: canvas.toDataURL('image/png'), width: natW, height: natH };
    }
  } catch {
    // Fallback to high-DPI viewport crop if direct XObject extraction is unavailable
  }

  return null;
}

// Remember unreachable external image URLs so large multi-image PDFs never stall on dead links
const failedExternalUrlsCache = new Set<string>();

/**
 * Fetch the linked original full-resolution image via our server-side CORS-free proxy
 * (`/api/proxy-image?url=...`) or direct browser fetch when a PDF thumbnail links to an
 * external server image (e.g., CloudFront / S3 / CDN attachment URL).
 */
async function tryFetchLinkedOriginalImage(
  url?: string
): Promise<{ dataUrl: string; width: number; height: number } | null> {
  if (!url || typeof document === 'undefined' || !/^https?:\/\//i.test(url)) return null;
  // Skip synthetic demo placeholder URL or previously failed URLs
  if (url.includes('d3a1545c382c8b.cloudfront.net') || failedExternalUrlsCache.has(url)) return null;

  const loadViaImageElement = (srcUrl: string, timeoutMs: number) =>
    new Promise<{ dataUrl: string; width: number; height: number } | null>((resolve) => {
      let settled = false;
      const done = (res: { dataUrl: string; width: number; height: number } | null) => {
        if (!settled) {
          settled = true;
          resolve(res);
        }
      };

      const timer = setTimeout(() => done(null), timeoutMs);
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        clearTimeout(timer);
        try {
          const w = img.naturalWidth || img.width;
          const h = img.naturalHeight || img.height;
          if (w < 32 || h < 32) {
            done(null);
            return;
          }
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            done(null);
            return;
          }
          ctx.drawImage(img, 0, 0, w, h);
          done({ dataUrl: canvas.toDataURL('image/png'), width: w, height: h });
        } catch {
          done(null);
        }
      };
      img.onerror = () => {
        clearTimeout(timer);
        done(null);
      };
      img.src = srcUrl;
    });

  // 1. Try server-side CORS-free proxy first (`/api/proxy-image?url=...`)
  const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(url)}`;
  const viaProxy = await loadViaImageElement(proxyUrl, 2500);
  if (viaProxy) return viaProxy;

  // 2. Fallback to direct CORS image load
  const viaDirect = await loadViaImageElement(url, 1500);
  if (!viaDirect) {
    failedExternalUrlsCache.add(url);
  }
  return viaDirect;
}

/**
 * Extract raw uncropped image streams (DCTDecode JPEG or FlateDecode RGB/RGBA) directly
 * from the PDF page's XObject dictionary using pdf-lib.
 * This bypasses any square clipping path on the PDF page so the full portrait/landscape
 * image can be previewed and OCR-scanned in its entirety!
 */
async function extractRawUncroppedImagesFromPdfPage(
  pdfLibDoc: PDFDocument,
  pageIdx: number
): Promise<{ dataUrl: string; width: number; height: number }[]> {
  if (typeof document === 'undefined') return [];
  const results: { dataUrl: string; width: number; height: number }[] = [];

  try {
    const pages = pdfLibDoc.getPages();
    if (pageIdx < 0 || pageIdx >= pages.length) return [];
    const page = pages[pageIdx];

    const collectXObjectsFromResources = (resourcesDict: PDFDict | undefined, visited = new Set<string>()) => {
      const streams: any[] = [];
      if (!resourcesDict) return streams;

      // 1. Inspect /XObject dictionary (Image & Form XObjects)
      const xObjDict = resourcesDict.lookupMaybe(PDFName.of('XObject'), PDFDict);
      if (xObjDict) {
        for (const [, refOrObj] of xObjDict.entries()) {
          const refKey = refOrObj?.toString?.() || '';
          if (refKey && visited.has(refKey)) continue;
          if (refKey) visited.add(refKey);

          const xObj = pdfLibDoc.context.lookup(refOrObj) as any;
          if (!xObj || !xObj.dict) continue;

          const subtype = xObj.dict.lookup(PDFName.of('Subtype'))?.toString?.();
          if (subtype === '/Image') {
            streams.push(xObj);
          } else if (subtype === '/Form') {
            const formRes = xObj.dict.lookupMaybe(PDFName.of('Resources'), PDFDict);
            streams.push(...collectXObjectsFromResources(formRes, visited));
          }
        }
      }

      // 2. Inspect /Pattern dictionary (TilingPatterns used by Chromium/WeasyPrint for object-fit: cover thumbnails!)
      const patternDict = resourcesDict.lookupMaybe(PDFName.of('Pattern'), PDFDict);
      if (patternDict) {
        for (const [, refOrObj] of patternDict.entries()) {
          const refKey = refOrObj?.toString?.() || '';
          if (refKey && visited.has(refKey)) continue;
          if (refKey) visited.add(refKey);

          const patObj = pdfLibDoc.context.lookup(refOrObj) as any;
          const patDict: PDFDict | undefined = patObj?.dict || (patObj instanceof PDFDict ? patObj : undefined);
          if (!patDict) continue;

          const patRes = patDict.lookupMaybe(PDFName.of('Resources'), PDFDict);
          if (patRes) {
            streams.push(...collectXObjectsFromResources(patRes, visited));
          }
        }
      }

      return streams;
    };

    // Only this page's own resources: scanning the whole document could pair an image with one from another page
    const pageResources = page.node.lookupMaybe(PDFName.of('Resources'), PDFDict);
    const imageStreams = collectXObjectsFromResources(pageResources);

    for (const rawStream of imageStreams) {
      try {
        const dict = rawStream.dict as PDFDict;
        const wObj = dict.lookup(PDFName.of('Width')) as any;
        const hObj = dict.lookup(PDFName.of('Height')) as any;
        const natW = Number(wObj?.asNumber?.() ?? wObj?.value ?? 0);
        const natH = Number(hObj?.asNumber?.() ?? hObj?.value ?? 0);
        if (natW < 24 || natH < 24) continue;

        const filterObj = dict.lookup(PDFName.of('Filter'));
        const filterStr = filterObj ? filterObj.toString() : '';
        const rawBytes: Uint8Array | undefined = rawStream.contents;
        if (!rawBytes || rawBytes.length === 0) continue;

        // 1. DCTDecode (JPEG) or JPXDecode -> Load directly via Blob into HTMLImageElement
        if (filterStr.includes('DCTDecode') || (rawBytes[0] === 0xff && rawBytes[1] === 0xd8)) {
          const jpegItem = await new Promise<{ dataUrl: string; width: number; height: number } | null>((resolve) => {
            const blob = new Blob([new Uint8Array(rawBytes)], { type: 'image/jpeg' });
            const objUrl = URL.createObjectURL(blob);
            const img = new Image();
            img.onload = () => {
              URL.revokeObjectURL(objUrl);
              const w = img.naturalWidth || natW;
              const h = img.naturalHeight || natH;
              const c = document.createElement('canvas');
              c.width = w;
              c.height = h;
              const ctx = c.getContext('2d');
              if (!ctx) {
                resolve(null);
                return;
              }
              ctx.drawImage(img, 0, 0, w, h);
              resolve({ dataUrl: c.toDataURL('image/png'), width: w, height: h });
            };
            img.onerror = () => {
              URL.revokeObjectURL(objUrl);
              resolve(null);
            };
            img.src = objUrl;
          });

          if (jpegItem) {
            results.push(jpegItem);
            continue;
          }
        }

        // 2. FlateDecode (zlib-compressed raw RGB / RGBA / Grayscale pixels, including PNG Predictors 10-15)
        if (filterStr.includes('FlateDecode') && typeof DecompressionStream !== 'undefined') {
          const decodeParms = dict.lookupMaybe(PDFName.of('DecodeParms'), PDFDict);
          const predictorObj = decodeParms?.lookup(PDFName.of('Predictor')) as any;
          const predictor = Number(predictorObj?.asNumber?.() ?? predictorObj?.value ?? 1);

          const decompressed = await new Promise<Uint8Array | null>(async (resolve) => {
            for (const fmt of ['deflate', 'deflate-raw'] as const) {
              try {
                const ds = new DecompressionStream(fmt as any);
                const writer = ds.writable.getWriter();
                writer.write(new Uint8Array(rawBytes));
                writer.close();
                const buf = await new Response(ds.readable).arrayBuffer();
                if (buf.byteLength >= natW * natH) {
                  resolve(new Uint8Array(buf));
                  return;
                }
              } catch {
                // try next format
              }
            }
            resolve(null);
          });

          if (decompressed) {
            const totalPixels = natW * natH;
            let pixelBytes = decompressed;

            // Unfilter PNG Predictor rows if Predictor >= 10 (each row has 1 filter-type byte prefix)
            if (predictor >= 10) {
              for (const bpp of [3, 4, 1]) {
                const rowBytes = natW * bpp;
                const stride = rowBytes + 1;
                if (decompressed.length === stride * natH) {
                  const unfiltered = new Uint8Array(totalPixels * bpp);
                  for (let y = 0; y < natH; y++) {
                    const filterType = decompressed[y * stride];
                    const rowIn = y * stride + 1;
                    const rowOut = y * rowBytes;
                    const prevOut = (y - 1) * rowBytes;

                    for (let i = 0; i < rowBytes; i++) {
                      const raw = decompressed[rowIn + i];
                      const a = i >= bpp ? unfiltered[rowOut + i - bpp] : 0;
                      const b = y > 0 ? unfiltered[prevOut + i] : 0;
                      const c = y > 0 && i >= bpp ? unfiltered[prevOut + i - bpp] : 0;

                      if (filterType === 1) {
                        unfiltered[rowOut + i] = (raw + a) & 0xff;
                      } else if (filterType === 2) {
                        unfiltered[rowOut + i] = (raw + b) & 0xff;
                      } else if (filterType === 3) {
                        unfiltered[rowOut + i] = (raw + Math.floor((a + b) / 2)) & 0xff;
                      } else if (filterType === 4) {
                        const p = a + b - c;
                        const pa = Math.abs(p - a);
                        const pb = Math.abs(p - b);
                        const pc = Math.abs(p - c);
                        const pr = pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
                        unfiltered[rowOut + i] = (raw + pr) & 0xff;
                      } else {
                        unfiltered[rowOut + i] = raw;
                      }
                    }
                  }
                  pixelBytes = unfiltered;
                  break;
                }
              }
            }

            const c = document.createElement('canvas');
            c.width = natW;
            c.height = natH;
            const ctx = c.getContext('2d');
            if (ctx) {
              const imgData = ctx.createImageData(natW, natH);
              const dst = imgData.data;
              let valid = false;

              if (pixelBytes.length === totalPixels * 4) {
                dst.set(pixelBytes);
                valid = true;
              } else if (pixelBytes.length === totalPixels * 3) {
                let s = 0;
                let d = 0;
                for (let p = 0; p < totalPixels; p++) {
                  dst[d++] = pixelBytes[s++];
                  dst[d++] = pixelBytes[s++];
                  dst[d++] = pixelBytes[s++];
                  dst[d++] = 255;
                }
                valid = true;
              } else if (pixelBytes.length === totalPixels) {
                let d = 0;
                for (let p = 0; p < totalPixels; p++) {
                  const v = pixelBytes[p];
                  dst[d++] = v;
                  dst[d++] = v;
                  dst[d++] = v;
                  dst[d++] = 255;
                }
                valid = true;
              }

              if (valid) {
                ctx.putImageData(imgData, 0, 0);
                results.push({ dataUrl: c.toDataURL('image/png'), width: natW, height: natH });
              }
            }
          }
        }
      } catch {
        // Ignore individual stream parse error
      }
    }
  } catch {
    // Ignore page resource walk error
  }

  return results;
}

/**
 * Helper to compute a tight, exact-fit bounding box around an OCR text span
 * so adjacent rows never overlap and replacement/blackout bars match the exact text height and width!
 */
function computeFullCoverageBox(
  rawBbox: { x0: number; y0: number; x1: number; y1: number },
  wordsInSpan: { bbox: { x0: number; y0: number; x1: number; y1: number } }[] | undefined,
  imageWidth: number,
  imageHeight: number
) {
  let minX = Number(rawBbox.x0);
  let minY = Number(rawBbox.y0);
  let maxX = Number(rawBbox.x1);
  let maxY = Number(rawBbox.y1);

  if (Array.isArray(wordsInSpan) && wordsInSpan.length > 0) {
    let validWords = 0;
    let wMinX = Infinity;
    let wMinY = Infinity;
    let wMaxX = -Infinity;
    let wMaxY = -Infinity;

    for (const w of wordsInSpan) {
      if (w?.bbox) {
        validWords++;
        wMinX = Math.min(wMinX, Number(w.bbox.x0));
        wMinY = Math.min(wMinY, Number(w.bbox.y0));
        wMaxX = Math.max(wMaxX, Number(w.bbox.x1));
        wMaxY = Math.max(wMaxY, Number(w.bbox.y1));
      }
    }

    if (validWords > 0 && wMaxX > wMinX && wMaxY > wMinY) {
      minX = wMinX;
      minY = wMinY;
      maxX = wMaxX;
      maxY = wMaxY;
    }
  }

  const rawH = Math.max(8, maxY - minY);

  // Tight 1-2px padding (~8% of glyph height) so the highlight and censor bar match the exact text bounds
  // without colliding or overlapping with the row above or below!
  const padX = Math.max(2, Math.min(4, Math.round(rawH * 0.12)));
  const padY = Math.max(1, Math.min(3, Math.round(rawH * 0.08)));

  const x0 = Math.max(0, minX - padX);
  const y0 = Math.max(0, minY - padY);
  const x1 = Math.min(imageWidth, maxX + padX);
  const y1 = Math.min(imageHeight, maxY + padY);

  return { x0, y0, x1, y1 };
}

/**
 * Create a border-suppressed, contrast-enhanced working image for OCR, AND return the raw
 * ImageData of the original image so we can inspect input-box borders around each detected text line.
 *
 * Why this solves missed input-box text (`LAGOA`, `14270`, `Buruh`, `Diploma 3`):
 * Form screenshots have dark rounded-rectangle borders (`[ LAGOA   v ]`) around input values.
 * Standard OCR treats those borders as graphics or connected strokes and skips the word inside.
 * By erasing long horizontal/vertical border lines on the OCR working copy while keeping interior
 * text glyphs crisp, Tesseract detects 100% of text inside inputs and dropdowns!
 */
async function prepareImageForHighSensitivityOcr(
  baseDataUrl: string
): Promise<{
  borderCleanedDataUrl: string;
  pixelData: Uint8ClampedArray | null;
  width: number;
  height: number;
}> {
  if (typeof document === 'undefined' || !baseDataUrl) {
    return { borderCleanedDataUrl: baseDataUrl, pixelData: null, width: 0, height: 0 };
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const w = img.naturalWidth || img.width;
        const h = img.naturalHeight || img.height;
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx || w < 16 || h < 16) {
          resolve({ borderCleanedDataUrl: baseDataUrl, pixelData: null, width: w, height: h });
          return;
        }

        ctx.drawImage(img, 0, 0, w, h);
        const origImgData = ctx.getImageData(0, 0, w, h);
        const src = origImgData.data;

        // Clone pixel buffer for the OCR border-cleaned image
        const workImgData = ctx.createImageData(w, h);
        const dst = workImgData.data;
        dst.set(src);

        const isDarkBorderPixel = (idx: number) => {
          const r = src[idx];
          const g = src[idx + 1];
          const b = src[idx + 2];
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;
          return lum < 155;
        };

        // 1. Detect and erase long horizontal dark lines (input box top/bottom borders >= 18% of image width)
        const minHorizRun = Math.max(36, Math.round(w * 0.18));
        for (let y = 0; y < h; y++) {
          let runStart = -1;
          for (let x = 0; x <= w; x++) {
            const idx = (y * w + x) * 4;
            const dark = x < w && isDarkBorderPixel(idx);
            if (dark) {
              if (runStart === -1) runStart = x;
            } else if (runStart !== -1) {
              const runLen = x - runStart;
              if (runLen >= minHorizRun) {
                // Erase this horizontal border segment and 2px above/below it
                for (let dy = -2; dy <= 2; dy++) {
                  const ny = y + dy;
                  if (ny < 0 || ny >= h) continue;
                  for (let rx = runStart; rx < x; rx++) {
                    const pIdx = (ny * w + rx) * 4;
                    dst[pIdx] = 255;
                    dst[pIdx + 1] = 255;
                    dst[pIdx + 2] = 255;
                  }
                }
              }
              runStart = -1;
            }
          }
        }

        // 2. Detect and erase vertical dark border segments (input box left/right borders >= 24px tall)
        const minVertRun = Math.max(24, Math.round(h * 0.028));
        for (let x = 0; x < w; x++) {
          let runStart = -1;
          for (let y = 0; y <= h; y++) {
            const idx = (y * w + x) * 4;
            const dark = y < h && isDarkBorderPixel(idx);
            if (dark) {
              if (runStart === -1) runStart = y;
            } else if (runStart !== -1) {
              const runLen = y - runStart;
              if (runLen >= minVertRun) {
                // Erase this vertical border segment and 12px inward (also erases rounded corners & right-side dropdown arrows/icons near borders!)
                for (let ry = runStart; ry < y; ry++) {
                  for (let dx = -3; dx <= 3; dx++) {
                    const nx = x + dx;
                    if (nx < 0 || nx >= w) continue;
                    const pIdx = (ry * w + nx) * 4;
                    dst[pIdx] = 255;
                    dst[pIdx + 1] = 255;
                    dst[pIdx + 2] = 255;
                  }
                }
              }
              runStart = -1;
            }
          }
        }

        ctx.putImageData(workImgData, 0, 0);
        resolve({
          borderCleanedDataUrl: canvas.toDataURL('image/png'),
          pixelData: src,
          width: w,
          height: h
        });
      } catch {
        resolve({ borderCleanedDataUrl: baseDataUrl, pixelData: null, width: 0, height: 0 });
      }
    };
    img.onerror = () =>
      resolve({ borderCleanedDataUrl: baseDataUrl, pixelData: null, width: 0, height: 0 });
    img.src = baseDataUrl;
  });
}



/**
 * Decide which OCR lines inside an image are redacted under the current rules:
 * - Regex rule matches (NIK, phone, email…) are always redacted.
 * - Values paired with a sensitive field label (Nama, NIP, Jabatan…) are redacted.
 * - Other input values are suggested (unticked), unless the strict "All Input Values" rule is on.
 * - Labels, titles, placeholders and UI text stay readable.
 * Faces and the user's own drawn boxes are carried over.
 */
export function evaluateOcrLinesAgainstRules(
  rawOcrLines: RawOcrLineItem[],
  rules: RedactionRule[],
  imgW: number,
  imgH: number,
  existingSubBoxes?: InImageSubBox[],
  rawFaceBoxes?: FaceBox[]
): InImageSubBox[] {
  const activeTextRules = rules.filter(
    r =>
      r.enabled &&
      r.category !== 'image' &&
      r.pattern !== '__EMBEDDED_IMAGES__' &&
      r.pattern.trim() !== ''
  );

  // Preserve any custom manual regions drawn by the user inside the modal
  const customBoxes = (existingSubBoxes || []).filter(b => b.id.startsWith('custom-'));
  const subBoxes: InImageSubBox[] = [...customBoxes];
  let subIdx = 0;

  const facesEnabled = rules.some(r => r.enabled && r.pattern === '__FACES__');
  const faceBoxes = facesEnabled ? rawFaceBoxes || [] : [];
  faceBoxes.forEach((face, i) => {
    const id = `face-${i}`;
    const previous = existingSubBoxes?.find(b => b.id === id);
    subBoxes.push({
      id,
      label: `Face #${i + 1}`,
      fieldType: 'face',
      ruleId: 'faces',
      ruleName: `Face (Pixelated) • ${Math.round(face.score * 100)}% confidence`,
      xRatio: face.xRatio,
      yRatio: face.yRatio,
      wRatio: face.wRatio,
      hRatio: face.hRatio,
      selected: previous ? previous.selected : true
    });
  });

  const sensitiveRule = rules.find(r => r.enabled && r.pattern === '__SENSITIVE_LABELS__');
  const sensitiveLabels = sensitiveRule ? sensitiveRule.labels ?? DEFAULT_SENSITIVE_LABELS : [];
  const strictInputs = rules.some(r => r.enabled && r.pattern === '__ALL_INPUT_VALUES__');
  // Lines were split and cleaned at scan time; layout indexes refer to this exact array
  const roles = resolveOcrFieldRoles(rawOcrLines, sensitiveLabels);
  const valueGroupOf = new Map<string, number>();

  for (let lineIdx = 0; lineIdx < rawOcrLines.length; lineIdx++) {
    const line = rawOcrLines[lineIdx];
    const lineText = String(line.text || '').trim();
    if (!lineText || lineText.length < 2) continue;
    const bbox = line.bbox;
    if (!bbox) continue;

    const { role, pairedLabel, sensitive, inlineValueFromWord } = roles[lineIdx];
    const fieldType: OcrFieldType =
      role === 'value' ? 'input_value' : role === 'label' ? 'label' : 'header_or_note';

    // Key and value read as one line: readable key, redacted value
    if (inlineValueFromWord !== undefined && line.words.length > inlineValueFromWord) {
      const keyWords = line.words.slice(0, inlineValueFromWord);
      const valueWords = line.words.slice(inlineValueFromWord);
      const toRatios = (b: { x0: number; y0: number; x1: number; y1: number }) => ({
        xRatio: b.x0 / imgW,
        yRatio: b.y0 / imgH,
        wRatio: (b.x1 - b.x0) / imgW,
        hRatio: (b.y1 - b.y0) / imgH
      });
      const keyText = keyWords.map(w => w.text).join(' ');
      const valueText = eliminateAnomalySymbols(valueWords.map(w => w.text).join(' '));
      subBoxes.push({
        id: `ocr-line-${subIdx++}`,
        label: eliminateAnomalySymbols(keyText),
        fullLineText: lineText,
        fieldType: 'label',
        ruleName: 'Form Label (Readable)',
        ...toRatios(computeFullCoverageBox(bbox, keyWords, imgW, imgH)),
        selected: false
      });
      const valueBox = {
        x0: Math.min(...valueWords.map(w => w.bbox.x0)),
        y0: Math.min(...valueWords.map(w => w.bbox.y0)),
        x1: Math.max(...valueWords.map(w => w.bbox.x1), line.layout?.inkBox?.x1 ?? 0),
        y1: Math.max(...valueWords.map(w => w.bbox.y1))
      };
      subBoxes.push({
        id: `ocr-input-${subIdx++}`,
        label: valueText,
        fullLineText: lineText,
        fieldType: 'input_value',
        pairedLabel,
        ruleId: 'sensitive_fields',
        ruleName: `Sensitive Field • ${pairedLabel}`,
        ...toRatios(computeFullCoverageBox(valueBox, undefined, imgW, imgH)),
        selected: sensitive
      });
      continue;
    }

    // Locate word character spans within `lineText` so we can tightly bound regex sub-matches
    const wordSpans: {
      start: number;
      end: number;
      word: { text: string; bbox: { x0: number; y0: number; x1: number; y1: number } };
    }[] = [];
    let searchCursor = 0;
    for (const w of line.words || []) {
      const wt = String(w.text || '').trim();
      if (!wt || !w.bbox) continue;
      const foundAt = lineText.indexOf(wt, searchCursor);
      if (foundAt !== -1) {
        wordSpans.push({ start: foundAt, end: foundAt + wt.length, word: w });
        searchCursor = foundAt + wt.length;
      }
    }

    const lineMatches: {
      matchedText: string;
      ruleId: string;
      ruleName: string;
      startIdx: number;
      endIdx: number;
    }[] = [];

    for (const rule of activeTextRules) {
      try {
        const flags = rule.flags.includes('g') ? rule.flags : rule.flags + 'g';
        const reg = new RegExp(rule.pattern, flags);
        let m: RegExpExecArray | null;
        while ((m = reg.exec(lineText)) !== null) {
          const matchedStr = m[0];
          if (!matchedStr) {
            if (reg.lastIndex === m.index) reg.lastIndex++;
            continue;
          }

          // Guard against accidental 1-character or partial-word noise matches on headers/labels
          // (e.g. a broad custom regex matching "K" in "Kelayakan" or "B" in "Baru")
          if (matchedStr.trim().length < 2 && !/\d/.test(matchedStr)) {
            if (!rule.flags.includes('g')) break;
            continue;
          }

          const startIdx = m.index;
          const endIdx = m.index + matchedStr.length;

          // If this line is a header/banner or form label, only allow a regex match if it matches a complete token/word
          // or is at least 3 characters long, preventing random broken-letter boxes on titles like "Form Uji Kelayakan"
          if (fieldType !== 'input_value') {
            const charBefore = startIdx > 0 ? lineText[startIdx - 1] : ' ';
            const charAfter = endIdx < lineText.length ? lineText[endIdx] : ' ';
            const isWordBoundary = !/[a-zA-Z0-9]/.test(charBefore) && !/[a-zA-Z0-9]/.test(charAfter);
            if (!isWordBoundary && matchedStr.trim().length < 4) {
              if (!rule.flags.includes('g')) break;
              continue;
            }
          }

          // Avoid duplicate overlapping matches on the exact same character span
          const isDup = lineMatches.some(
            ex => Math.abs(ex.startIdx - startIdx) <= 1 && Math.abs(ex.endIdx - endIdx) <= 1
          );
          if (!isDup) {
            lineMatches.push({
              matchedText: matchedStr,
              ruleId: rule.id,
              ruleName: rule.name,
              startIdx,
              endIdx
            });
          }

          if (!rule.flags.includes('g')) break;
        }
      } catch {
        // Ignore invalid regex syntax while user is typing
      }
    }

    // A form value: redacted when its label is sensitive (or a rule matches), otherwise only suggested
    if (fieldType === 'input_value') {
      // Sized to the measured ink, so letters OCR missed at either end are covered too
      const inkBox = line.layout?.inkBox;
      const { x0, y0, x1, y1 } = computeFullCoverageBox(inkBox ?? bbox, inkBox ? undefined : line.words, imgW, imgH);
      if (x1 > x0 && y1 > y0) {
        const matchedRuleInfo = lineMatches[0];
        const autoRedact = sensitive || Boolean(matchedRuleInfo) || strictInputs;
        if (roles[lineIdx].group !== undefined) valueGroupOf.set(`ocr-input-${subIdx}`, roles[lineIdx].group!);
        subBoxes.push({
          id: `ocr-input-${subIdx++}`,
          label: lineText,
          fullLineText: lineText,
          fieldType: 'input_value',
          pairedLabel,
          ruleId: matchedRuleInfo
            ? matchedRuleInfo.ruleId
            : sensitive
            ? 'sensitive_fields'
            : 'form_input_value',
          ruleName: matchedRuleInfo
            ? `${matchedRuleInfo.ruleName}${pairedLabel ? ` • ${pairedLabel}` : ''}`
            : sensitive
            ? `Sensitive Field • ${pairedLabel}`
            : pairedLabel
            ? `Input Value (${pairedLabel}) • not in sensitive list`
            : 'Input Value (no label found)',
          xRatio: x0 / imgW,
          yRatio: y0 / imgH,
          wRatio: (x1 - x0) / imgW,
          hRatio: (y1 - y0) / imgH,
          selected: autoRedact
        });
      }
    } else if (lineMatches.length > 0) {
      // Explicit Regex Rule match on a non-input line (e.g. a specific name/ID rule on a card)
      for (const lm of lineMatches) {
        const overlappingWords = wordSpans
          .filter(ws => ws.end > lm.startIdx && ws.start < lm.endIdx)
          .map(ws => ws.word);

        let targetRawBBox = bbox;
        if (overlappingWords.length > 0) {
          targetRawBBox = {
            x0: Math.min(...overlappingWords.map(w => Number(w.bbox.x0))),
            y0: Math.min(...overlappingWords.map(w => Number(w.bbox.y0))),
            x1: Math.max(...overlappingWords.map(w => Number(w.bbox.x1))),
            y1: Math.max(...overlappingWords.map(w => Number(w.bbox.y1)))
          };
        } else if (lineText.length > 0) {
          const lineW = Math.max(8, Number(bbox.x1) - Number(bbox.x0));
          targetRawBBox = {
            x0: Number(bbox.x0) + (lm.startIdx / lineText.length) * lineW,
            y0: Number(bbox.y0),
            x1: Number(bbox.x0) + (lm.endIdx / lineText.length) * lineW,
            y1: Number(bbox.y1)
          };
        }

        const { x0, y0, x1, y1 } = computeFullCoverageBox(
          targetRawBBox,
          overlappingWords.length > 0 ? overlappingWords : undefined,
          imgW,
          imgH
        );

        if (x1 > x0 && y1 > y0) {
          subBoxes.push({
            id: `ocr-match-${subIdx++}`,
            label: lm.matchedText,
            fullLineText: lineText,
            fieldType,
            pairedLabel,
            ruleId: lm.ruleId,
            ruleName: lm.ruleName,
            xRatio: x0 / imgW,
            yRatio: y0 / imgH,
            wRatio: (x1 - x0) / imgW,
            hRatio: (y1 - y0) / imgH,
            selected: true
          });
        }
      }
    } else {
      // Labels, titles, placeholders and other text stay readable (`selected: false`)
      const { x0, y0, x1, y1 } = computeFullCoverageBox(bbox, line.words, imgW, imgH);
      if (x1 > x0 && y1 > y0) {
        const typeDesc =
          role === 'label'
            ? 'Form Label (Readable)'
            : role === 'placeholder'
            ? 'Placeholder (Readable)'
            : 'Text (Readable)';

        subBoxes.push({
          id: `ocr-line-${subIdx++}`,
          label: lineText,
          fullLineText: lineText,
          fieldType,
          pairedLabel,
          ruleName: typeDesc,
          xRatio: x0 / imgW,
          yRatio: y0 / imgH,
          wRatio: (x1 - x0) / imgW,
          hRatio: (y1 - y0) / imgH,
          selected: false
        });
      }
    }
  }

  return mergeValuePiecesPerRow(subBoxes, valueGroupOf);
}

/**
 * Pieces of one value on the same row become one box, covering the gaps between them too
 * (justified text and " - " separators leave readable slivers between separate boxes).
 */
function mergeValuePiecesPerRow(boxes: InImageSubBox[], groupOf: Map<string, number>): InImageSubBox[] {
  const out: InImageSubBox[] = [];
  const sameRow = (a: InImageSubBox, b: InImageSubBox) => {
    const overlap = Math.min(a.yRatio + a.hRatio, b.yRatio + b.hRatio) - Math.max(a.yRatio, b.yRatio);
    return overlap >= Math.min(a.hRatio, b.hRatio) * 0.5;
  };
  for (const box of boxes) {
    const group = groupOf.get(box.id);
    const target =
      group === undefined
        ? undefined
        : out.find(o => groupOf.get(o.id) === group && o.selected === box.selected && sameRow(o, box));
    if (!target) {
      out.push(box);
      continue;
    }
    const x0 = Math.min(target.xRatio, box.xRatio);
    const y0 = Math.min(target.yRatio, box.yRatio);
    const x1 = Math.max(target.xRatio + target.wRatio, box.xRatio + box.wRatio);
    const y1 = Math.max(target.yRatio + target.hRatio, box.yRatio + box.hRatio);
    Object.assign(target, {
      label: box.xRatio >= target.xRatio ? `${target.label} ${box.label}` : `${box.label} ${target.label}`,
      xRatio: x0,
      yRatio: y0,
      wRatio: x1 - x0,
      hRatio: y1 - y0
    });
  }
  return out;
}

// Helper to extract normalized line items from a Tesseract recognize() response,
// automatically splitting lines whenever there is a large horizontal space gap between words
// (e.g., two-column "Label ............ Value" rows or "Header ........ Icon")!
function extractLinesFromOcrData(ocrData: any): RawOcrLineItem[] {
  const out: RawOcrLineItem[] = [];
  const extractedLines: any[] = [];
  const extractedWords: any[] = [];

  if (Array.isArray(ocrData?.blocks)) {
    for (const block of ocrData.blocks) {
      for (const para of block?.paragraphs || []) {
        for (const line of para?.lines || []) {
          extractedLines.push(line);
          for (const word of line?.words || []) {
            extractedWords.push(word);
          }
        }
      }
    }
  }
  if (extractedLines.length === 0 && Array.isArray(ocrData?.lines)) {
    extractedLines.push(...ocrData.lines);
  }
  if (extractedWords.length === 0 && Array.isArray(ocrData?.words)) {
    extractedWords.push(...ocrData.words);
  }



  if (extractedLines.length > 0) {
    for (const line of extractedLines) {
      // Pipeline Step 2: Separate text wherever an anomaly symbol or colon/semicolon appears,
      // and eliminate anomaly symbols to strictly preserve only (!@#$%^&*), letters, numbers, and spaces.
      const rawText = String(line.text || '').trim();
      const rawWords = Array.isArray(line.words)
        ? line.words.filter((w: any) => w?.text && w?.bbox)
        : [];

      const pieces = separateLineBySymbolsAndDelimiters({
        text: rawText,
        bbox: line.bbox,
        words: rawWords
      });

      // A label split into columns ("$Y auth   nip:") keeps only the column touching the colon;
      // values on this line that point to the whole text must point to that column instead
      const lineStart = out.length;
      const relabelled = new Map<string, string>();

      for (const piece of pieces) {
        if (
          !hasMeaningfulContent(piece.text) ||
          (piece.text.length === 1 && !/[a-zA-Z0-9]/.test(piece.text))
        ) {
          continue;
        }

        // If piece has multiple words, check if there's an unusually large horizontal gap (e.g. multi-column layout).
        // Word spacing is well under one text height, so a gap of ~2 heights means a new column
        const pWords = piece.words || [];
        if (pWords.length >= 2) {
          const lineH = Math.max(8, ...pWords.map((w: any) => Math.max(6, w.bbox.y1 - w.bbox.y0)));
          const splitGapThreshold = Math.max(16, lineH * 2.2);

          const segments: (typeof pWords)[] = [];
          let currentSeg: typeof pWords = [pWords[0]];

          for (let wIdx = 1; wIdx < pWords.length; wIdx++) {
            const prevW = pWords[wIdx - 1];
            const currW = pWords[wIdx];
            const gapPx = currW.bbox.x0 - prevW.bbox.x1;

            if (gapPx >= splitGapThreshold) {
              segments.push(currentSeg);
              currentSeg = [currW];
            } else {
              currentSeg.push(currW);
            }
          }
          segments.push(currentSeg);

          if (segments.length > 1) {
            const kept = segments
              .map(seg => ({ seg, segText: eliminateAnomalySymbols(seg.map((w: any) => w.text).join(' ')) }))
              .filter(({ segText }) => hasMeaningfulContent(segText) && !(segText.length === 1 && !/\d/.test(segText)));

            if (piece.fieldType === 'label' && kept.length > 0) {
              relabelled.set(piece.text, kept[kept.length - 1].segText);
            }
            kept.forEach(({ seg, segText }, kIdx) => {
              const segBBox = {
                x0: Math.min(...seg.map((w: any) => w.bbox.x0)),
                y0: Math.min(...seg.map((w: any) => w.bbox.y0)),
                x1: Math.max(...seg.map((w: any) => w.bbox.x1)),
                y1: Math.max(...seg.map((w: any) => w.bbox.y1))
              };
              // The "label: value" syntax belongs to the column touching the colon: the last column
              // for a label ("LE Mulyono   NIP:" -> "NIP"), the first for a value. The other columns
              // are independent text, paired later by position.
              const ownsSyntax = piece.fieldType === 'label' ? kIdx === kept.length - 1 : kIdx === 0;
              out.push({
                text: segText,
                bbox: segBBox,
                words: seg,
                fieldType: ownsSyntax ? piece.fieldType : undefined,
                pairedLabel: ownsSyntax ? piece.pairedLabel : undefined
              });
            });
            continue;
          }
        }

        out.push(piece);
      }

      for (let k = lineStart; k < out.length; k++) {
        const renamed = out[k].pairedLabel && relabelled.get(out[k].pairedLabel!);
        if (renamed) out[k].pairedLabel = renamed;
      }
    }
  } else if (extractedWords.length > 0) {
    for (const w of extractedWords) {
      const rawWText = String(w.text || '').trim();
      if (!rawWText || !w.bbox) continue;

      const pieces = separateLineBySymbolsAndDelimiters({
        text: rawWText,
        bbox: {
          x0: Number(w.bbox.x0),
          y0: Number(w.bbox.y0),
          x1: Number(w.bbox.x1),
          y1: Number(w.bbox.y1)
        },
        words: [w]
      });

      for (const piece of pieces) {
        if (
          hasMeaningfulContent(piece.text) &&
          !(piece.text.length === 1 && !/[a-zA-Z0-9]/.test(piece.text))
        ) {
          out.push(piece);
        }
      }
    }
  }

  return out;
}

/**
 * Automatically extract full-resolution uncropped images for all detected Embedded Image matches,
 * stream the extracted image immediately so the modal never waits,
 * and run PaddleOCR (ONNX) or Tesseract OCR to create selective in-image redaction subBoxes
 * strictly matching the user's active Regex & Detection Rules!
 */
/** Face detection is an extra layer on top of OCR, so a failure (e.g. WASM blocked) must not stop the scan */
async function detectFacesSafely(dataUrl: string): Promise<FaceBox[]> {
  try {
    return await detectFacesInImage(dataUrl);
  } catch (err) {
    console.warn('Face detection unavailable for this image:', err);
    return [];
  }
}

// Tesseract reads reliably from ~20px tall text; desktop UI screenshots are often ~10px,
// which turns "Jabatan :" into "Jabotan" and drops colons. Such images are re-read upscaled.
const OCR_MIN_TEXT_HEIGHT = 18;
const OCR_MAX_UPSCALED_SIDE = 4000;

type OcrBox = { x0: number; y0: number; x1: number; y1: number };

function scaleOcrBox(b: OcrBox, factor: number): OcrBox {
  return { x0: b.x0 * factor, y0: b.y0 * factor, x1: b.x1 * factor, y1: b.y1 * factor };
}

function scaleOcrLines(lines: RawOcrLineItem[], factor: number): RawOcrLineItem[] {
  if (factor === 1) return lines;
  return lines.map(l => ({
    ...l,
    bbox: scaleOcrBox(l.bbox, factor),
    words: (l.words || []).map(w => ({ ...w, bbox: scaleOcrBox(w.bbox, factor) }))
  }));
}

function medianWordHeight(lines: RawOcrLineItem[]): number | null {
  const heights = lines
    .flatMap(l => l.words || [])
    .map(w => w.bbox.y1 - w.bbox.y0)
    .filter(h => h > 0)
    .sort((a, b) => a - b);
  return heights.length ? heights[Math.floor(heights.length / 2)] : null;
}

function upscaleImage(dataUrl: string, w: number, h: number, scale: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(w * scale);
      canvas.height = Math.round(h * scale);
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas 2D context unavailable for OCR upscaling'));
        return;
      }
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => reject(new Error('Could not load image for OCR upscaling'));
    img.src = dataUrl;
  });
}

function rebuildLineFromWords(line: RawOcrLineItem, words: RawOcrLineItem['words']): RawOcrLineItem {
  const all = line.words || [];
  // The colon role stays only if the word next to the colon survived
  const keepsSyntax =
    line.fieldType === 'label'
      ? words.includes(all[all.length - 1])
      : line.fieldType === 'input_value'
      ? words.includes(all[0])
      : true;
  return {
    ...line,
    fieldType: keepsSyntax ? line.fieldType : undefined,
    pairedLabel: keepsSyntax ? line.pairedLabel : undefined,
    text: eliminateAnomalySymbols(words.map(w => w.text).join(' ')),
    words,
    bbox: {
      x0: Math.min(...words.map(w => w.bbox.x0)),
      y0: Math.min(...words.map(w => w.bbox.y0)),
      x1: Math.max(...words.map(w => w.bbox.x1)),
      y1: Math.max(...words.map(w => w.bbox.y1))
    }
  };
}

/**
 * Combine the two OCR passes word by word. The block pass reads a whole screen row as one line and
 * can garble single words (`nama:` read as `LE`); where the sparse pass read the same spot clearly,
 * its reading replaces just those weak words.
 */
function mergeOcrPasses(primary: RawOcrLineItem[], extra: RawOcrLineItem[]): RawOcrLineItem[] {
  let merged = [...primary];
  for (const cand of extra) {
    const candCy = (cand.bbox.y0 + cand.bbox.y1) / 2;
    const candH = Math.max(8, cand.bbox.y1 - cand.bbox.y0);
    const candConf = lineConfidence(cand) ?? 0;
    const overlapsCand = (b: OcrBox) =>
      Math.max(0, Math.min(cand.bbox.x1, b.x1) - Math.max(cand.bbox.x0, b.x0)) >= (b.x1 - b.x0) * 0.5;

    const sameSpot = merged
      .map((ex, idx) => ({ ex, idx }))
      .filter(({ ex }) => {
        const exCy = (ex.bbox.y0 + ex.bbox.y1) / 2;
        if (Math.abs(candCy - exCy) >= Math.max(candH, ex.bbox.y1 - ex.bbox.y0) * 0.65) return false;
        const overlapX = Math.max(0, Math.min(cand.bbox.x1, ex.bbox.x1) - Math.max(cand.bbox.x0, ex.bbox.x0));
        const minW = Math.max(1, Math.min(cand.bbox.x1 - cand.bbox.x0, ex.bbox.x1 - ex.bbox.x0));
        return overlapX / minW > 0.45;
      });

    if (sameSpot.length === 0) {
      merged.push(cand);
      continue;
    }

    // The candidate wins only if it is clearly more confident than every word it would replace
    const wins = sameSpot.every(({ ex }) => {
      const covered = (ex.words || []).filter(w => overlapsCand(w.bbox));
      if (covered.length === 0) return false;
      const coveredConf = covered.reduce((s, w) => s + (w.confidence ?? 0), 0) / covered.length;
      return candConf >= coveredConf + 15;
    });
    if (!wins) continue;

    const replacedIdx = new Set(sameSpot.map(s => s.idx));
    const shrunk: RawOcrLineItem[] = [];
    for (const { ex } of sameSpot) {
      const remaining = (ex.words || []).filter(w => !overlapsCand(w.bbox));
      if (remaining.length > 0) shrunk.push(rebuildLineFromWords(ex, remaining));
    }
    merged = [...merged.filter((_, idx) => !replacedIdx.has(idx)), ...shrunk, cand];
  }
  return merged;
}

/**
 * Tesseract in two passes: a block read (PSM 6), then a sparse read (PSM 11) on a copy with
 * input-box borders erased so single words inside inputs are found. Small text is read at 2×.
 * Returned boxes are in the original image's pixel coordinates.
 */
async function runTesseractPasses(
  baseDataUrl: string,
  imgW: number,
  imgH: number,
  opts: { secondPass: 'always' | 'if-sparse'; progressPrefix: string; onProgress?: (s: string) => void }
): Promise<RawOcrLineItem[]> {
  const { secondPass, progressPrefix, onProgress } = opts;
  const worker = await getOrCreateOcrWorker();

  onProgress?.(`${progressPrefix} Tesseract reading text...`.trim());
  await worker.setParameters({ tessedit_pageseg_mode: '6' as any });
  const firstRead = await worker.recognize(baseDataUrl, {}, { text: true, blocks: true });
  let blockLines = extractLinesFromOcrData(firstRead?.data);

  const textHeight = medianWordHeight(blockLines);
  const scale =
    textHeight !== null && textHeight < OCR_MIN_TEXT_HEIGHT
      ? Math.min(2, OCR_MAX_UPSCALED_SIDE / Math.max(imgW, imgH))
      : 1;
  const upscaled = scale >= 1.25;
  let source = baseDataUrl;
  if (upscaled) {
    onProgress?.(
      `${progressPrefix} small text (~${Math.round(textHeight!)}px), re-reading at ${scale.toFixed(1)}×...`.trim()
    );
    source = await upscaleImage(baseDataUrl, imgW, imgH, scale);
    const sharperRead = await worker.recognize(source, {}, { text: true, blocks: true });
    blockLines = scaleOcrLines(extractLinesFromOcrData(sharperRead?.data), 1 / scale);
  }

  let sparseLines: RawOcrLineItem[] = [];
  if (secondPass === 'always' || blockLines.length < 8) {
    onProgress?.(`${progressPrefix} second pass for words inside input boxes...`.trim());
    const { borderCleanedDataUrl } = await prepareImageForHighSensitivityOcr(source);
    await worker.setParameters({ tessedit_pageseg_mode: '11' as any });
    const sparseRead = await worker.recognize(borderCleanedDataUrl, {}, { text: true, blocks: true });
    sparseLines = scaleOcrLines(extractLinesFromOcrData(sparseRead?.data), upscaled ? 1 / scale : 1);
    await worker.setParameters({ tessedit_pageseg_mode: '6' as any });
  }

  return mergeOcrPasses(blockLines, sparseLines);
}

/**
 * OCR one image with the chosen engine (PaddleOCR falls back to Tesseract), then measure the layout
 * facts used to pair labels with values. Faces mark photo areas where OCR "text" is ignored.
 */
async function runOcrForImage(
  baseDataUrl: string,
  imgW: number,
  imgH: number,
  engine: OcrEngineType,
  faces: FaceBox[],
  opts: { secondPass: 'always' | 'if-sparse'; progressPrefix: string; onProgress?: (s: string) => void }
): Promise<{ rawOcrLines: RawOcrLineItem[]; usedEngine: OcrEngineType }> {
  const { pixelData } = await prepareImageForHighSensitivityOcr(baseDataUrl);

  let lines: RawOcrLineItem[] = [];
  let usedEngine: OcrEngineType = engine;
  if (engine === 'paddleocr') {
    try {
      const paddleRes = await runPaddleOcrOnImage(baseDataUrl, imgW, imgH, status =>
        opts.onProgress?.(`${opts.progressPrefix} ${status}`.trim())
      );
      lines = paddleRes.lines;
    } catch (paddleErr) {
      console.warn('PaddleOCR failed on image, falling back to Tesseract:', paddleErr);
      usedEngine = 'tesseract';
    }
  }
  if (usedEngine === 'tesseract' || lines.length === 0) {
    lines = await runTesseractPasses(baseDataUrl, imgW, imgH, opts);
    usedEngine = 'tesseract';
  }

  opts.onProgress?.(`${opts.progressPrefix} pairing labels with values...`.trim());
  return { rawOcrLines: analyzeOcrLayout(lines, pixelData, imgW, imgH, faces), usedEngine };
}

/**
 * Pair a detected image with a raw XObject stream only when its aspect ratio identifies it uniquely.
 * Streams are listed in resource-dictionary order, not paint order, so pairing by index can swap images.
 */
function pickRawXObjectForMatch<T extends { width: number; height: number }>(
  candidates: T[],
  imgMatch: DetectedMatch
): T | null {
  const placedW = imgMatch.unclippedWidth ?? imgMatch.width;
  const placedH = imgMatch.unclippedHeight ?? imgMatch.height;
  if (!(placedW > 0 && placedH > 0)) return null;

  const placedAspect = placedW / placedH;
  const sameShape = candidates.filter(
    c => c.width > 0 && c.height > 0 && Math.abs(Math.log(c.width / c.height / placedAspect)) < 0.02
  );
  return sameShape.length === 1 ? sameShape[0] : null;
}

export async function autoScanImagesWithOcr(
  pdfBuffer: ArrayBuffer,
  imageMatches: DetectedMatch[],
  rules: RedactionRule[],
  redactionOptions: RedactionStyleOptions,
  onProgress?: (statusText: string) => void,
  onPartialUpdate?: (matchId: string, partial: Partial<DetectedMatch>) => void,
  shouldCancel?: () => boolean,
  engine: OcrEngineType = 'tesseract'
): Promise<Record<string, Partial<DetectedMatch>>> {
  if (typeof document === 'undefined' || imageMatches.length === 0) return {};

  const updates: Record<string, Partial<DetectedMatch>> = {};

  try {
    // Warm up Tesseract worker if that's the selected engine
    if (engine === 'tesseract') {
      getOrCreateOcrWorker().catch(() => {});
    }

    const [pdfDoc, pdfLibDoc] = await Promise.all([
      pdfjsLib.getDocument({ data: pdfBuffer.slice(0), verbosity: 0 }).promise,
      PDFDocument.load(pdfBuffer.slice(0)).catch(() => null)
    ]);

    // Group image matches by pageIndex
    const byPage = new Map<number, DetectedMatch[]>();
    for (const m of imageMatches) {
      const list = byPage.get(m.pageIndex) || [];
      list.push(m);
      byPage.set(m.pageIndex, list);
    }

    const totalImages = imageMatches.length;
    let processedCount = 0;

    for (const [pageIdx, pageImgMatches] of byPage.entries()) {
      if (shouldCancel?.()) break;

      const page = await pdfDoc.getPage(pageIdx + 1);
      // Building the operator list makes PDF.js decode this page's images into `page.objs`,
      // so each match can be paired with the exact image it was detected from via `imageObjId`
      if (pageImgMatches.some(m => m.imageObjId)) {
        await page.getOperatorList().catch(() => null);
      }

      // Raw stream decoding is expensive, so only do it if a match on this page actually needs it
      let rawPageXObjectsPromise: Promise<{ dataUrl: string; width: number; height: number }[]> | null =
        null;
      const getRawPageXObjects = () => {
        if (!rawPageXObjectsPromise) {
          rawPageXObjectsPromise = pdfLibDoc
            ? extractRawUncroppedImagesFromPdfPage(pdfLibDoc, pageIdx)
            : Promise.resolve([]);
        }
        return rawPageXObjectsPromise;
      };

      for (let mIdx = 0; mIdx < pageImgMatches.length; mIdx++) {
        if (shouldCancel?.()) break;

        const imgMatch = pageImgMatches[mIdx];
        processedCount++;
        const engineLabel = engine === 'paddleocr' ? 'PaddleOCR (ONNX)' : 'Tesseract OCR';
        if (onProgress) {
          onProgress(
            `${engineLabel} scanning image ${processedCount} of ${totalImages} (Page ${pageIdx + 1})...`
          );
        }

        let baseDataUrl = '';
        let imgW = 0;
        let imgH = 0;

        // 0. HIGHEST PRIORITY: If the PDF thumbnail has a linked full-size image URL, fetch via proxy
        if (imgMatch.linkedUri) {
          const linkedOriginal = await tryFetchLinkedOriginalImage(imgMatch.linkedUri);
          if (linkedOriginal) {
            baseDataUrl = linkedOriginal.dataUrl;
            imgW = linkedOriginal.width;
            imgH = linkedOriginal.height;
          }
        }

        // 1. Second priority: the exact PDF.js Image XObject painted for this match (uncropped, native resolution)
        if (!baseDataUrl) {
          const nativeExtracted = await extractNativePdfImageObject(page, imgMatch.imageObjId);
          if (nativeExtracted) {
            baseDataUrl = nativeExtracted.dataUrl;
            imgW = nativeExtracted.width;
            imgH = nativeExtracted.height;
          }
        }

        // 2. Third priority: Raw uncropped PDF XObject stream from pdf-lib, only when it can be identified unambiguously
        if (!baseDataUrl) {
          const rawXObj = pickRawXObjectForMatch(await getRawPageXObjects(), imgMatch);
          if (rawXObj) {
            baseDataUrl = rawXObj.dataUrl;
            imgW = rawXObj.width;
            imgH = rawXObj.height;
          }
        }

        // 3. Fallback: High-DPI sub-viewport render using UNCLIPPED coordinates
        if (!baseDataUrl || imgW < 16 || imgH < 16) {
          const targetBoxX = imgMatch.unclippedX ?? imgMatch.x;
          const targetBoxY = imgMatch.unclippedY ?? imgMatch.y;
          const targetBoxW = imgMatch.unclippedWidth ?? imgMatch.width;
          const targetBoxH = imgMatch.unclippedHeight ?? imgMatch.height;

          const scale = Math.max(3.5, Math.min(6.0, 960 / Math.max(targetBoxW, 40)));
          const fullViewport = page.getViewport({ scale });

          imgW = Math.max(64, Math.round(targetBoxW * scale));
          imgH = Math.max(64, Math.round(targetBoxH * scale));
          const sx = Math.max(0, targetBoxX * scale);
          const sy = Math.max(0, fullViewport.height - (targetBoxY + targetBoxH) * scale);

          const croppedViewport = page.getViewport({
            scale,
            offsetX: -sx,
            offsetY: -sy
          });

          const cropCanvas = document.createElement('canvas');
          cropCanvas.width = imgW;
          cropCanvas.height = imgH;
          const cropCtx = cropCanvas.getContext('2d');
          if (!cropCtx) continue;

          await page.render({ canvasContext: cropCtx, viewport: croppedViewport }).promise;
          baseDataUrl = cropCanvas.toDataURL('image/png');

          if (imgMatch.imageObjId) {
            const postRenderNative = await extractNativePdfImageObject(page, imgMatch.imageObjId);
            if (postRenderNative) {
              baseDataUrl = postRenderNative.dataUrl;
              imgW = postRenderNative.width;
              imgH = postRenderNative.height;
            }
          }
        }

        const initialPartial: Partial<DetectedMatch> = {
          originalImageDataUrl: baseDataUrl,
          redactedImageDataUrl: baseDataUrl,
          imagePixelWidth: imgW,
          imagePixelHeight: imgH,
          imageMode: 'partial',
          createLocalFullSizePage: true
        };

        updates[imgMatch.id] = initialPartial;
        if (onPartialUpdate) {
          onPartialUpdate(imgMatch.id, initialPartial);
        }

        if (shouldCancel?.()) break;

        onProgress?.(`Detecting faces in image ${processedCount}/${totalImages}...`);
        const rawFaceBoxes = await detectFacesSafely(baseDataUrl);

        let rawOcrLines: RawOcrLineItem[] = [];
        let usedEngine: OcrEngineType = engine;
        try {
          ({ rawOcrLines, usedEngine } = await runOcrForImage(
            baseDataUrl,
            imgW,
            imgH,
            engine,
            rawFaceBoxes,
            {
              secondPass: totalImages <= 12 ? 'always' : 'if-sparse',
              progressPrefix: `Image ${processedCount}/${totalImages}:`,
              onProgress
            }
          ));
        } catch (ocrErr) {
          console.warn('OCR scan warning on image', ocrErr);
        }

        const subBoxes = evaluateOcrLinesAgainstRules(
          rawOcrLines,
          rules,
          imgW,
          imgH,
          undefined,
          rawFaceBoxes
        );

        const redactedDataUrl = await renderSanitizedImageWithSubBoxes(
          baseDataUrl,
          subBoxes,
          redactionOptions
        );

        const finalUpdate: Partial<DetectedMatch> = {
          originalImageDataUrl: baseDataUrl,
          redactedImageDataUrl: redactedDataUrl,
          imagePixelWidth: imgW,
          imagePixelHeight: imgH,
          rawOcrLines,
          rawFaceBoxes,
          subBoxes,
          ocrEngineUsed: usedEngine,
          imageMode: 'partial',
          createLocalFullSizePage: true
        };

        updates[imgMatch.id] = finalUpdate;
        if (onPartialUpdate) {
          onPartialUpdate(imgMatch.id, finalUpdate);
        }
      }
    }
  } catch (err) {
    console.warn('Automated OCR image pipeline error:', err);
  }

  return updates;
}

/**
 * Scan a single image directly with the specified OCR engine (PaddleOCR ONNX or Tesseract WASM).
 * Used for instant on-demand re-scanning inside the Full-Size Image Modal.
 */
export async function scanSingleImageWithOcr(
  imageDataUrl: string,
  imageWidth: number,
  imageHeight: number,
  rules: RedactionRule[],
  redactionOptions: RedactionStyleOptions,
  engine: OcrEngineType = 'tesseract',
  onProgress?: (statusText: string) => void
): Promise<{
  rawOcrLines: RawOcrLineItem[];
  rawFaceBoxes: FaceBox[];
  subBoxes: InImageSubBox[];
  redactedImageDataUrl: string;
  engineUsed: OcrEngineType;
}> {
  onProgress?.('Detecting faces...');
  const rawFaceBoxes = await detectFacesSafely(imageDataUrl);

  const { rawOcrLines, usedEngine } = await runOcrForImage(
    imageDataUrl,
    imageWidth,
    imageHeight,
    engine,
    rawFaceBoxes,
    { secondPass: 'always', progressPrefix: '', onProgress }
  );

  const subBoxes = evaluateOcrLinesAgainstRules(
    rawOcrLines,
    rules,
    imageWidth,
    imageHeight,
    undefined,
    rawFaceBoxes
  );

  const redactedImageDataUrl = await renderSanitizedImageWithSubBoxes(
    imageDataUrl,
    subBoxes,
    redactionOptions
  );

  return {
    rawOcrLines,
    rawFaceBoxes,
    subBoxes,
    redactedImageDataUrl,
    engineUsed: usedEngine
  };
}

/**
 * Helper to remove any overlapping external /Link annotations on a PDF page (Method C)
 * and optionally add an internal /GoTo page jump link to a local appendix page (Method A / Option 2).
 */
function sanitizeAndRewirePageAnnotations(
  pdfDoc: PDFDocument,
  page: any,
  boxX: number,
  boxY: number,
  boxW: number,
  boxH: number,
  targetAppendixPage?: any
) {
  try {
    const annotsRef = page.node.get(PDFName.of('Annots'));
    let annotsArray = annotsRef ? pdfDoc.context.lookupMaybe(annotsRef, PDFArray) : undefined;

    if (annotsArray) {
      const ix1 = boxX + boxW;
      const iy1 = boxY + boxH;
      const keptAnnots: any[] = [];

      for (let i = 0; i < annotsArray.size(); i++) {
        const annotRef = annotsArray.get(i);
        const annotDict = pdfDoc.context.lookupMaybe(annotRef, PDFDict);
        if (!annotDict) {
          keptAnnots.push(annotRef);
          continue;
        }

        const subtype = annotDict.lookup(PDFName.of('Subtype'));
        const isLink = subtype && subtype.toString() === '/Link';
        if (!isLink) {
          keptAnnots.push(annotRef);
          continue;
        }

        const rectObj = annotDict.lookupMaybe(PDFName.of('Rect'), PDFArray);
        if (!rectObj || rectObj.size() < 4) {
          keptAnnots.push(annotRef);
          continue;
        }

        const r0 = Number((rectObj.get(0) as any)?.asNumber?.() ?? 0);
        const r1 = Number((rectObj.get(1) as any)?.asNumber?.() ?? 0);
        const r2 = Number((rectObj.get(2) as any)?.asNumber?.() ?? 0);
        const r3 = Number((rectObj.get(3) as any)?.asNumber?.() ?? 0);

        const lx0 = Math.min(r0, r2);
        const ly0 = Math.min(r1, r3);
        const lx1 = Math.max(r0, r2);
        const ly1 = Math.max(r1, r3);

        const overlapX = Math.max(0, Math.min(ix1, lx1) - Math.max(boxX, lx0));
        const overlapY = Math.max(0, Math.min(iy1, ly1) - Math.max(boxY, ly0));

        // If this external link overlaps our redacted region/image, strip it!
        if (overlapX > 1 && overlapY > 1) {
          continue;
        }

        keptAnnots.push(annotRef);
      }

      const newAnnots = pdfDoc.context.obj(keptAnnots);
      page.node.set(PDFName.of('Annots'), newAnnots);
      annotsArray = newAnnots;
    }

    // If Option 2 (Clickable Local Full-Size View) is enabled, attach an internal /GoTo link annotation
    if (targetAppendixPage) {
      const goToAnnotDict = pdfDoc.context.obj({
        Type: 'Annot',
        Subtype: 'Link',
        Rect: [boxX, boxY, boxX + boxW, boxY + boxH],
        Border: [0, 0, 0],
        Dest: [targetAppendixPage.ref, 'XYZ', null, null, null]
      });
      const goToAnnotRef = pdfDoc.context.register(goToAnnotDict);

      const currentAnnotsRef = page.node.get(PDFName.of('Annots'));
      const currentAnnots = currentAnnotsRef
        ? pdfDoc.context.lookupMaybe(currentAnnotsRef, PDFArray)
        : undefined;

      if (currentAnnots) {
        currentAnnots.push(goToAnnotRef);
      } else {
        page.node.set(PDFName.of('Annots'), pdfDoc.context.obj([goToAnnotRef]));
      }
    }
  } catch (err) {
    console.warn('Annotation sanitization warning:', err);
  }
}

/**
 * Apply redaction rectangles, sanitized readable images, & local full-size attachment pages to the PDF using pdf-lib,
 * then flatten every redacted page so the covered content is removed from the file (see `rebuildWithFlattenedPages`)
 */
export async function applyRedactionsToPdf(
  pdfBuffer: ArrayBuffer,
  matchesToRedact: DetectedMatch[],
  options: RedactionStyleOptions,
  onProgress?: (statusText: string) => void
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfBuffer.slice(0));
  const pages = pdfDoc.getPages();
  const originalPageCount = pages.length;
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Group matches by pageIndex
  const matchesByPage = new Map<number, DetectedMatch[]>();
  for (const match of matchesToRedact) {
    if (!match.selected) continue;
    const list = matchesByPage.get(match.pageIndex) || [];
    list.push(match);
    matchesByPage.set(match.pageIndex, list);
  }

  let attachmentCounter = 0;

  for (const [pageIdx, pageMatches] of matchesByPage.entries()) {
    if (pageIdx >= pages.length) continue;
    const page = pages[pageIdx];

    for (const match of pageMatches) {
      // Exact bounding box for images/manual regions; minimal 1pt padding for text
      const isImageOrManual = match.ruleId === 'embedded_images' || match.ruleId === 'manual_area';
      const padX = isImageOrManual ? 0 : 1;
      const padY = isImageOrManual ? 0 : 1;
      const boxX = Math.max(0, match.x - padX);
      const boxY = Math.max(0, match.y - padY);
      const boxW = match.width + (padX * 2);
      const boxH = match.height + (padY * 2);

      // CASE 1: Partial In-Image Redaction (Keep image readable with sensitive fields inside it redacted + Clickable Local Full-Size View)
      if (
        match.ruleId === 'embedded_images' &&
        match.imageMode === 'partial' &&
        (match.redactedImageDataUrl || match.originalImageDataUrl)
      ) {
        try {
          const freshSanitizedDataUrl = match.originalImageDataUrl
            ? await renderSanitizedImageWithSubBoxes(
                match.originalImageDataUrl,
                match.subBoxes || [],
                options
              )
            : match.redactedImageDataUrl!;

          const embeddedSanitizedImg = await pdfDoc.embedPng(freshSanitizedDataUrl);

          // 1. Cover original thumbnail cleanly and draw the readable sanitized image preserving its true aspect ratio
          const natW = match.imagePixelWidth || embeddedSanitizedImg.width || 600;
          const natH = match.imagePixelHeight || embeddedSanitizedImg.height || 800;

          page.drawRectangle({
            x: boxX,
            y: boxY,
            width: boxW,
            height: boxH,
            color: rgb(0.98, 0.98, 0.99),
            borderColor: rgb(0.86, 0.88, 0.92),
            borderWidth: 0.5
          });

          const thumbFitScale = Math.min(boxW / natW, boxH / natH);
          const thumbDrawW = natW * thumbFitScale;
          const thumbDrawH = natH * thumbFitScale;
          const thumbDrawX = boxX + (boxW - thumbDrawW) / 2;
          const thumbDrawY = boxY + (boxH - thumbDrawH) / 2;

          page.drawImage(embeddedSanitizedImg, {
            x: thumbDrawX,
            y: thumbDrawY,
            width: thumbDrawW,
            height: thumbDrawH
          });

          // 2. Option 2: Create a Local Full-Size View Page inside the PDF at native resolution and link the thumbnail to it
          let appendixPage: any = undefined;
          if (match.createLocalFullSizePage !== false) {
            attachmentCounter++;
            const pageW = Math.max(612, Math.min(1200, natW + 64));
            const pageH = Math.max(792, Math.min(1600, natH + 100));
            appendixPage = pdfDoc.addPage([pageW, pageH]);

            // Header bar on local full-size view page
            const headerH = 50;
            const headerY = pageH - headerH;
            appendixPage.drawRectangle({
              x: 0,
              y: headerY,
              width: pageW,
              height: headerH,
              color: rgb(0.08, 0.11, 0.18)
            });

            appendixPage.drawText(
              `LOCAL SANITIZED IMAGE ATTACHMENT #${attachmentCounter} (Source: Page ${pageIdx + 1} • ${natW}×${natH}px)`,
              {
                x: 28,
                y: headerY + 22,
                size: 11,
                font: fontBold,
                color: rgb(1, 1, 1)
              }
            );

            appendixPage.drawText(
              'Original full-resolution image preserved locally — Sensitive fields redacted via OCR.',
              {
                x: 28,
                y: headerY + 8,
                size: 8.5,
                font: fontRegular,
                color: rgb(0.75, 0.82, 0.92)
              }
            );

            // "<- Back to Page X" button in top-right of appendix page
            const backBtnW = 122;
            const backBtnH = 26;
            const backBtnX = pageW - backBtnW - 24;
            const backBtnY = headerY + 12;
            appendixPage.drawRectangle({
              x: backBtnX,
              y: backBtnY,
              width: backBtnW,
              height: backBtnH,
              color: rgb(0.31, 0.27, 0.9),
              borderColor: rgb(0.45, 0.42, 0.98),
              borderWidth: 1
            });
            appendixPage.drawText(`<- Back to Page ${pageIdx + 1}`, {
              x: backBtnX + 14,
              y: backBtnY + 9,
              size: 9.5,
              font: fontBold,
              color: rgb(1, 1, 1)
            });

            // Add internal /GoTo link on the Back button returning to the source page
            sanitizeAndRewirePageAnnotations(
              pdfDoc,
              appendixPage,
              backBtnX,
              backBtnY,
              backBtnW,
              backBtnH,
              page
            );

            // Fit full-size sanitized image cleanly into the appendix page body without downscaling its embedded PNG stream
            const maxAreaW = pageW - 48;
            const maxAreaH = pageH - headerH - 40;
            const scaleRatio = Math.min(maxAreaW / natW, maxAreaH / natH);
            const drawW = natW * scaleRatio;
            const drawH = natH * scaleRatio;
            const drawX = (pageW - drawW) / 2;
            const drawY = 20 + (maxAreaH - drawH) / 2;

            // Subtle frame around full-size image
            appendixPage.drawRectangle({
              x: drawX - 4,
              y: drawY - 4,
              width: drawW + 8,
              height: drawH + 8,
              color: rgb(0.97, 0.98, 0.99),
              borderColor: rgb(0.82, 0.85, 0.9),
              borderWidth: 1
            });

            appendixPage.drawImage(embeddedSanitizedImg, {
              x: drawX,
              y: drawY,
              width: drawW,
              height: drawH
            });
          }

          // 3. Strip external CloudFront /URI link on the thumbnail and replace with internal /GoTo link
          sanitizeAndRewirePageAnnotations(pdfDoc, page, boxX, boxY, boxW, boxH, appendixPage);
          continue;
        } catch (imgEmbedErr) {
          console.warn('Fallback to standard box redaction for image:', imgEmbedErr);
        }
      }

      // Always strip any underlying clickable /URI link beneath a redacted region (Method C)
      sanitizeAndRewirePageAnnotations(pdfDoc, page, boxX, boxY, boxW, boxH, undefined);

      if (options.mode === 'blackout') {
        // Solid black bar (legal/government redaction standard)
        page.drawRectangle({
          x: boxX,
          y: boxY,
          width: boxW,
          height: boxH,
          color: rgb(0.05, 0.05, 0.05)
        });
      } else if (options.mode === 'whiteout') {
        // Clean white eraser
        page.drawRectangle({
          x: boxX,
          y: boxY,
          width: boxW,
          height: boxH,
          color: rgb(1, 1, 1)
        });
      } else {
        // Replacement text mode: Draw background badge & replacement label within exact box dimensions
        const rawReplacement = options.replacementText || '[CONFIDENTIAL]';
        
        let bgRgb = rgb(0.12, 0.14, 0.18); // default dark slate
        let textRgb = rgb(1, 1, 1);
        let borderRgb = rgb(0.2, 0.23, 0.3);

        if (options.boxColor === 'red_tint') {
          bgRgb = rgb(0.99, 0.93, 0.93);
          borderRgb = rgb(0.89, 0.22, 0.22);
          textRgb = rgb(0.75, 0.1, 0.1);
        } else if (options.boxColor === 'white') {
          bgRgb = rgb(1, 1, 1);
          borderRgb = rgb(0.8, 0.8, 0.8);
          textRgb = rgb(0.2, 0.2, 0.2);
        } else if (options.boxColor === 'black') {
          bgRgb = rgb(0, 0, 0);
          borderRgb = rgb(0.2, 0.2, 0.2);
          textRgb = rgb(1, 1, 1);
        }

        // Keep exact box width so it matches the edit view highlight without overflowing into adjacent items
        const finalBoxWidth = boxW;
        const availableTextWidth = Math.max(4, finalBoxWidth - 6);

        // Start with ideal font size and scale down if needed to fit inside finalBoxWidth
        let targetFontSize = Math.min(Math.max(boxH * 0.65, 6), 11);
        let displayLabel = rawReplacement;
        let textWidth = fontBold.widthOfTextAtSize(displayLabel, targetFontSize);

        if (textWidth > availableTextWidth) {
          const scaledSize = targetFontSize * (availableTextWidth / textWidth);
          targetFontSize = Math.max(5.5, scaledSize);
          textWidth = fontBold.widthOfTextAtSize(displayLabel, targetFontSize);

          // If still wider than the box at minimum readable size, truncate with ellipsis like edit view
          if (textWidth > availableTextWidth && displayLabel.length > 4) {
            let truncated = displayLabel;
            while (
              truncated.length > 1 &&
              fontBold.widthOfTextAtSize(truncated + '...', targetFontSize) > availableTextWidth
            ) {
              truncated = truncated.slice(0, -1);
            }
            displayLabel = truncated + '...';
            textWidth = fontBold.widthOfTextAtSize(displayLabel, targetFontSize);
          }
        }

        page.drawRectangle({
          x: boxX,
          y: boxY,
          width: finalBoxWidth,
          height: boxH,
          color: bgRgb,
          borderColor: borderRgb,
          borderWidth: 0.8
        });

        // Center replacement text inside the exact box
        if (textWidth <= finalBoxWidth && boxH >= targetFontSize) {
          const textX = boxX + (finalBoxWidth - textWidth) / 2;
          const textY = boxY + (boxH - targetFontSize) / 2 + 0.5;

          page.drawText(displayLabel, {
            x: textX,
            y: textY,
            size: targetFontSize,
            font: fontBold,
            color: textRgb
          });
        }
      }
    }
  }

  const redactedPageIdxs = new Set(
    [...matchesByPage.keys()].filter(pageIdx => pageIdx < originalPageCount)
  );
  return await rebuildWithFlattenedPages(pdfDoc, redactedPageIdxs, onProgress);
}

// Flattening renders a page to a bitmap: drawing a box with pdf-lib only paints over content,
// the text and images underneath stay in the file and can be copied or extracted.
const FLATTEN_RENDER_SCALE = 2.5; // ~180 DPI
const FLATTEN_MAX_CANVAS_PIXELS = 16_000_000;
const FLATTEN_JPEG_QUALITY = 0.92;

interface PreservedLink {
  rect: [number, number, number, number];
  uri?: string;
  targetPageIdx?: number;
}

/**
 * Read a page's link annotations as plain data, so they can be recreated in the rebuilt document
 * without carrying over references into the unflattened source pages.
 */
function collectPreservedLinks(
  pdfDoc: PDFDocument,
  page: PDFPage,
  pageIdxByRef: Map<string, number>
): PreservedLink[] {
  const links: PreservedLink[] = [];
  const annots = page.node.lookupMaybe(PDFName.of('Annots'), PDFArray);
  if (!annots) return links;

  for (let i = 0; i < annots.size(); i++) {
    const annot = pdfDoc.context.lookupMaybe(annots.get(i), PDFDict);
    if (!annot || annot.lookup(PDFName.of('Subtype'))?.toString() !== '/Link') continue;

    const rectObj = annot.lookupMaybe(PDFName.of('Rect'), PDFArray);
    if (!rectObj || rectObj.size() < 4) continue;
    const r = [0, 1, 2, 3].map(k => {
      const n = rectObj.lookup(k) as any;
      return Number(n?.asNumber?.() ?? NaN);
    });
    if (r.some(v => !isFinite(v))) continue;
    const rect: PreservedLink['rect'] = [
      Math.min(r[0], r[2]),
      Math.min(r[1], r[3]),
      Math.max(r[0], r[2]),
      Math.max(r[1], r[3])
    ];

    const action = annot.lookupMaybe(PDFName.of('A'), PDFDict);
    const actionType = action?.lookup(PDFName.of('S'))?.toString();
    if (action && actionType === '/URI') {
      const uriObj = action.lookup(PDFName.of('URI'));
      if (uriObj instanceof PDFString || uriObj instanceof PDFHexString) {
        links.push({ rect, uri: uriObj.decodeText() });
      }
      continue;
    }

    const dest =
      action && actionType === '/GoTo'
        ? action.lookup(PDFName.of('D'))
        : annot.lookup(PDFName.of('Dest'));
    if (dest instanceof PDFArray && dest.size() > 0) {
      const targetRef = dest.get(0);
      const targetPageIdx =
        targetRef instanceof PDFRef ? pageIdxByRef.get(targetRef.toString()) : undefined;
      if (targetPageIdx !== undefined) links.push({ rect, targetPageIdx });
    }
  }
  return links;
}

/** The resource dictionaries a page draws from; pages sharing one of these can reach each other's images. */
function getPageResourceDicts(page: PDFPage): PDFDict[] {
  const resources = page.node.Resources();
  if (!resources) return [];
  const xObjects = resources.lookupMaybe(PDFName.of('XObject'), PDFDict);
  return xObjects ? [resources, xObjects] : [resources];
}

function hasNonLinkAnnotations(pdfDoc: PDFDocument, page: PDFPage): boolean {
  const annots = page.node.lookupMaybe(PDFName.of('Annots'), PDFArray);
  if (!annots) return false;
  for (let i = 0; i < annots.size(); i++) {
    const annot = pdfDoc.context.lookupMaybe(annots.get(i), PDFDict);
    if (annot && annot.lookup(PDFName.of('Subtype'))?.toString() !== '/Link') return true;
  }
  return false;
}

async function renderPageToJpeg(
  pdfJsDoc: any,
  pageIdx: number
): Promise<{ jpegBytes: ArrayBuffer; viewport: any }> {
  const pdfJsPage = await pdfJsDoc.getPage(pageIdx + 1);
  const viewport = pdfJsPage.getViewport({ scale: 1 });
  const scale = Math.min(
    FLATTEN_RENDER_SCALE,
    Math.sqrt(FLATTEN_MAX_CANVAS_PIXELS / (viewport.width * viewport.height))
  );
  const renderViewport = pdfJsPage.getViewport({ scale });

  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(renderViewport.width);
  canvas.height = Math.ceil(renderViewport.height);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable for page flattening');

  try {
    await pdfJsPage.render({ canvas, canvasContext: ctx, viewport: renderViewport }).promise;
    const blob = await new Promise<Blob | null>(resolve =>
      canvas.toBlob(resolve, 'image/jpeg', FLATTEN_JPEG_QUALITY)
    );
    if (!blob) throw new Error(`Failed to encode flattened page ${pageIdx + 1}`);
    return { jpegBytes: await blob.arrayBuffer(), viewport };
  } finally {
    // Release the backing store right away; large PDFs otherwise exhaust canvas memory
    canvas.width = 0;
    canvas.height = 0;
    pdfJsPage.cleanup();
  }
}

/**
 * Build the export document from the stamped one:
 * - Redacted pages are rendered to images, so nothing hidden under a redaction box survives.
 * - Other pages are copied as-is (text stays selectable), unless they share resource dictionaries with
 *   a redacted page, in which case copying them would also copy the original images; those get flattened too.
 * - Links are recreated from plain data, and document-level metadata, bookmarks, forms and attachments
 *   are dropped, since none of them are covered by redaction.
 */
async function rebuildWithFlattenedPages(
  stampedDoc: PDFDocument,
  redactedPageIdxs: Set<number>,
  onProgress?: (statusText: string) => void
): Promise<Uint8Array> {
  const stampedPages = stampedDoc.getPages();

  const flattenIdxs = new Set(redactedPageIdxs);
  const redactedResourceDicts = new Set<PDFDict>();
  for (const idx of redactedPageIdxs) {
    getPageResourceDicts(stampedPages[idx]).forEach(d => redactedResourceDicts.add(d));
  }
  stampedPages.forEach((page, idx) => {
    // Form fields, stamps and comments can't be copied safely (they reference other pages and the
    // AcroForm), so pages carrying them are flattened to keep their appearance
    if (
      getPageResourceDicts(page).some(d => redactedResourceDicts.has(d)) ||
      hasNonLinkAnnotations(stampedDoc, page)
    ) {
      flattenIdxs.add(idx);
    }
  });

  const pageIdxByRef = new Map(stampedPages.map((p, idx) => [p.ref.toString(), idx]));
  const linksByPage = stampedPages.map(p => collectPreservedLinks(stampedDoc, p, pageIdxByRef));

  // Strip everything on kept pages that can point at other pages, so copying them can't pull a
  // redacted source page into the output as an unreferenced object
  const copyIdxs = stampedPages.map((_, idx) => idx).filter(idx => !flattenIdxs.has(idx));
  for (const idx of copyIdxs) {
    for (const key of ['Annots', 'B', 'AA']) {
      stampedPages[idx].node.delete(PDFName.of(key));
    }
  }

  const stampedBytes = await stampedDoc.save();
  const pdfJsLoadingTask = pdfjsLib.getDocument({ data: stampedBytes.slice(0), verbosity: 0 });
  const pdfJsDoc = await pdfJsLoadingTask.promise;
  const outDoc = await PDFDocument.create();
  const copiedPages = await outDoc.copyPages(stampedDoc, copyIdxs);

  const outPages: PDFPage[] = [];
  // Maps a point in the stamped page's PDF space to the output page's PDF space
  const toOutRect: ((rect: PreservedLink['rect']) => PreservedLink['rect'])[] = [];
  let copiedCursor = 0;
  let flattenedCount = 0;

  try {
    for (let idx = 0; idx < stampedPages.length; idx++) {
      if (!flattenIdxs.has(idx)) {
        outPages.push(outDoc.addPage(copiedPages[copiedCursor++]));
        toOutRect.push(rect => rect);
        continue;
      }

      flattenedCount++;
      onProgress?.(`Flattening redacted page ${flattenedCount} of ${flattenIdxs.size}...`);
      const { jpegBytes, viewport } = await renderPageToJpeg(pdfJsDoc, idx);
      const jpg = await outDoc.embedJpg(jpegBytes);
      const outPage = outDoc.addPage([viewport.width, viewport.height]);
      outPage.drawImage(jpg, { x: 0, y: 0, width: viewport.width, height: viewport.height });
      outPages.push(outPage);

      // The viewport accounts for /Rotate and CropBox offsets; its y axis points down
      const pageH = viewport.height;
      toOutRect.push(rect => {
        const [vx0, vy0] = viewport.convertToViewportPoint(rect[0], rect[1]);
        const [vx1, vy1] = viewport.convertToViewportPoint(rect[2], rect[3]);
        return [
          Math.min(vx0, vx1),
          pageH - Math.max(vy0, vy1),
          Math.max(vx0, vx1),
          pageH - Math.min(vy0, vy1)
        ];
      });
    }
  } finally {
    await pdfJsLoadingTask.destroy();
  }

  outPages.forEach((outPage, idx) => {
    const annotRefs = linksByPage[idx].map(link => {
      const rect = toOutRect[idx](link.rect);
      const annot =
        link.uri !== undefined
          ? outDoc.context.obj({
              Type: 'Annot',
              Subtype: 'Link',
              Rect: rect,
              Border: [0, 0, 0],
              A: { Type: 'Action', S: 'URI', URI: PDFString.of(link.uri) }
            })
          : outDoc.context.obj({
              Type: 'Annot',
              Subtype: 'Link',
              Rect: rect,
              Border: [0, 0, 0],
              Dest: [outPages[link.targetPageIdx!].ref, 'XYZ', null, null, null]
            });
      return outDoc.context.register(annot);
    });
    if (annotRefs.length > 0) {
      outPage.node.set(PDFName.of('Annots'), outDoc.context.obj(annotRefs));
    }
  });

  return await outDoc.save();
}

/**
 * Generate a realistic demo invoice PDF loaded with confidential PII data
 * so users can test sensitive data redaction in 1 click!
 */
export async function createDemoConfidentialPdf(): Promise<ArrayBuffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]); // Standard US Letter
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const drawHeader = () => {
    // Header Bar
    page.drawRectangle({
      x: 40,
      y: 710,
      width: 532,
      height: 45,
      color: rgb(0.08, 0.12, 0.22)
    });

    page.drawText('ACME CLOUD SERVICES — SERVICE AGREEMENT & INVOICE', {
      x: 55,
      y: 727,
      size: 13,
      font: fontBold,
      color: rgb(1, 1, 1)
    });
  };

  drawHeader();

  let y = 675;

  const writeLine = (label: string, value: string, isBoldVal: boolean = false) => {
    page.drawText(label, { x: 50, y, size: 10, font: fontBold, color: rgb(0.2, 0.25, 0.35) });
    page.drawText(value, { x: 180, y, size: 10, font: isBoldVal ? fontBold : fontRegular, color: rgb(0.1, 0.1, 0.1) });
    y -= 22;
  };

  page.drawText('CUSTOMER & ACCOUNT INFORMATION (STRICTLY CONFIDENTIAL)', {
    x: 50,
    y,
    size: 11,
    font: fontBold,
    color: rgb(0.85, 0.25, 0.2)
  });
  y -= 25;

  writeLine('Account Holder:', 'Alexander Vance (Senior Systems Architect)');
  writeLine('Primary Email:', 'a.vance@megacorp-enterprise.com');
  writeLine('Alternate Email:', 'alex.personal99@gmail.com');
  writeLine('Direct Phone:', '+1-555-839-2041');
  writeLine('Security Hotline:', '(415) 890-4412');
  writeLine('Government SSN:', '123-45-6789');
  writeLine('Tax ID / NIK:', '3201014509870001');

  y -= 10;
  page.drawText('PAYMENT & TRANSACTION DETAILS', {
    x: 50,
    y,
    size: 11,
    font: fontBold,
    color: rgb(0.85, 0.25, 0.2)
  });
  y -= 25;

  writeLine('Corporate Card:', '4532-8901-4412-9081');
  writeLine('Backup Visa:', '5412-7512-3412-0094');
  writeLine('Internal Host IP:', '192.168.1.105');
  writeLine('Production DB IP:', '10.0.4.254');
  writeLine('Invoice Subtotal:', '$ 14,850.00');
  writeLine('Monthly Retainer:', '$ 3,200.00');

  y -= 15;
  page.drawRectangle({
    x: 50,
    y: y - 50,
    width: 512,
    height: 60,
    color: rgb(0.97, 0.98, 1),
    borderColor: rgb(0.8, 0.85, 0.95),
    borderWidth: 1
  });

  page.drawText('CONFIDENTIAL DISCLOSURE NOTICE:', {
    x: 65,
    y: y - 8,
    size: 9,
    font: fontBold,
    color: rgb(0.2, 0.3, 0.5)
  });

  page.drawText('This document contains private personal identifiers (PII), payment card information,', {
    x: 65,
    y: y - 24,
    size: 9,
    font: fontRegular,
    color: rgb(0.3, 0.35, 0.45)
  });

  page.drawText('and private corporate endpoints. All sensitive data must be redacted prior to sharing.', {
    x: 65,
    y: y - 38,
    size: 9,
    font: fontRegular,
    color: rgb(0.3, 0.35, 0.45)
  });

  // Embedded Mobile Screenshot with Sensitive Fields & External Link Annotation for testing Automated OCR In-Image Redaction
  const sigTopY = y - 65;
  try {
    let pngDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPj/HwADBwIAMCbHYQAAAABJRU5ErkJggg==';
    if (typeof document !== 'undefined') {
      const offCanvas = document.createElement('canvas');
      offCanvas.width = 420;
      offCanvas.height = 255;
      const ctx = offCanvas.getContext('2d');
      if (ctx) {
        // Card background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 420, 255);
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 4;
        ctx.strokeRect(2, 2, 416, 251);

        // Top app bar
        ctx.fillStyle = '#1d4ed8';
        ctx.fillRect(4, 4, 412, 42);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 19px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('Detail Informasi Prospek', 18, 31);

        // Non-sensitive status line (kept readable)
        ctx.fillStyle = '#334155';
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText('Status Dokumen: Terverifikasi', 18, 78);

        // Sensitive Field 1: Nama Nasabah
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 18px sans-serif';
        ctx.fillText('Nama Nasabah: Caraka', 18, 120);

        // Sensitive Field 2: Tanggal Lahir
        ctx.fillText('Tanggal Lahir: 1993-03-19', 18, 162);

        // Sensitive Field 3: Email / Phone
        ctx.fillText('Email: caraka.id@corp.com', 18, 204);

        // Footer hint inside screenshot
        ctx.fillStyle = '#475569';
        ctx.font = '14px sans-serif';
        ctx.fillText('Lampiran Bukti Cek Kelayakan', 18, 238);

        pngDataUrl = offCanvas.toDataURL('image/png');
      }
    }
    const embeddedPhoto = await pdfDoc.embedPng(pngDataUrl);
    const imgX = 50;
    const imgY = sigTopY - 95;
    const imgW = 150;
    const imgH = 91;
    page.drawImage(embeddedPhoto, {
      x: imgX,
      y: imgY,
      width: imgW,
      height: imgH
    });

    // Attach a sample external server /URI Link Annotation over the embedded image (just like CloudFront PDF links)
    const linkAnnot = pdfDoc.context.obj({
      Type: 'Annot',
      Subtype: 'Link',
      Rect: [imgX, imgY, imgX + imgW, imgY + imgH],
      Border: [0, 0, 0],
      A: {
        Type: 'Action',
        S: 'URI',
        URI: 'https://d3a1545c382c8b.cloudfront.net/attachments/sample-prospect-screenshot.jpg'
      }
    });
    const linkAnnotRef = pdfDoc.context.register(linkAnnot);
    page.node.set(PDFName.of('Annots'), pdfDoc.context.obj([linkAnnotRef]));
  } catch {
    page.drawRectangle({
      x: 50,
      y: sigTopY - 95,
      width: 150,
      height: 91,
      color: rgb(0.94, 0.96, 0.99),
      borderColor: rgb(0.75, 0.8, 0.88),
      borderWidth: 1
    });
  }

  // Simulated Authorized Signature & Stamp Box
  page.drawRectangle({
    x: 215,
    y: sigTopY - 95,
    width: 347,
    height: 91,
    color: rgb(0.99, 0.99, 0.99),
    borderColor: rgb(0.82, 0.85, 0.9),
    borderWidth: 1
  });
  page.drawText('AUTHORIZED SIGNATURE & CORPORATE SEAL:', {
    x: 230,
    y: sigTopY - 22,
    size: 8.5,
    font: fontBold,
    color: rgb(0.3, 0.35, 0.45)
  });
  page.drawText('Alexander Vance', {
    x: 240,
    y: sigTopY - 52,
    size: 16,
    font: fontBold,
    color: rgb(0.15, 0.25, 0.65)
  });
  page.drawText('Click the embedded image on the left to inspect OCR redactions & local popup!', {
    x: 230,
    y: sigTopY - 78,
    size: 7.5,
    font: fontRegular,
    color: rgb(0.45, 0.5, 0.6)
  });

  const pdfBytes = await pdfDoc.save();
  const buffer = new ArrayBuffer(pdfBytes.byteLength);
  new Uint8Array(buffer).set(pdfBytes);
  return buffer;
}

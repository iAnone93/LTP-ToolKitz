import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument, PDFName, PDFArray, PDFDict, rgb, StandardFonts } from 'pdf-lib';

// Ensure PDF.js worker is properly configured
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.mjs`;

export interface RedactionRule {
  id: string;
  name: string;
  category: 'email' | 'phone' | 'financial' | 'identity' | 'network' | 'image' | 'custom';
  pattern: string;
  flags: string;
  description: string;
  enabled: boolean;
  color: string;
}

export type OcrFieldType = 'input_value' | 'label' | 'header_or_note';

export interface InImageSubBox {
  id: string;
  label: string;
  fullLineText?: string;
  fieldType?: OcrFieldType;
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
  fieldType?: OcrFieldType;
  pairedLabel?: string;
  words: {
    text: string;
    bbox: { x0: number; y0: number; x1: number; y1: number };
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
  subBoxes?: InImageSubBox[];
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
    pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
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
    pattern: '\\b\\d{3}-\\d{2}-\\d{4}\\b|\\b\\d{16}\\b',
    flags: 'g',
    description: 'Social Security Numbers (9 digits) and national IDs (16 digits)',
    enabled: true,
    color: 'bg-purple-500'
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
    id: 'currency',
    name: 'Currency & Balances',
    category: 'financial',
    pattern: '(?:\\$|Rp|EUR|USD|GBP|\\bIDR\\b)\\s?[-+]?\\d{1,3}(?:[.,]\\d{3})*(?:[.,]\\d{2})?',
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
  const loadingTask = pdfjsLib.getDocument({ data: pdfBuffer.slice(0) });
  const pdfJsDoc = await loadingTask.promise;
  const numPages = pdfJsDoc.numPages;

  const detectedMatches: DetectedMatch[] = [];
  let matchIdCounter = 0;

  const activeRules = rules.filter(r => r.enabled && r.pattern.trim() !== '');
  const activeTextRules = activeRules.filter(
    r => r.category !== 'image' && r.pattern !== '__EMBEDDED_IMAGES__'
  );
  const activeImageRule = activeRules.find(
    r => r.category === 'image' || r.pattern === '__EMBEDDED_IMAGES__'
  );

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

      const activeSubBoxes = (subBoxes || []).filter(b => b.selected);
      for (const box of activeSubBoxes) {
        const bx = box.xRatio * canvas.width;
        const by = box.yRatio * canvas.height;
        const bw = Math.max(8, box.wRatio * canvas.width);
        const bh = Math.max(8, box.hRatio * canvas.height);

        if (options.mode === 'blackout') {
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
          ctx.lineWidth = Math.max(1, Math.round(canvas.width / 400));
          ctx.strokeRect(bx, by, bw, bh);

          const fontSize = Math.max(9, Math.min(Math.floor(bh * 0.65), 28));
          ctx.font = `bold ${fontSize}px sans-serif`;
          ctx.fillStyle = textHex;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          let display = rawLabel;
          const availW = Math.max(6, bw - 6);
          if (ctx.measureText(display).width > availW && display.length > 4) {
            let t = display;
            while (t.length > 1 && ctx.measureText(t + '...').width > availW) {
              t = t.slice(0, -1);
            }
            display = t + '...';
          }
          ctx.fillText(display, bx + bw / 2, by + bh / 2);
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
        if (page.objs?.has?.(imageObjId)) {
          clearTimeout(timer);
          finish(page.objs.get(imageObjId));
          return;
        }
        if (page.commonObjs?.has?.(imageObjId)) {
          clearTimeout(timer);
          finish(page.commonObjs.get(imageObjId));
          return;
        }
        if (typeof page.objs?.get === 'function') {
          page.objs.get(imageObjId, (data: any) => {
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

/**
 * Fetch the linked original full-resolution image via our server-side CORS-free proxy
 * (`/api/proxy-image?url=...`) or direct browser fetch when a PDF thumbnail links to an
 * external server image (e.g., CloudFront / S3 / CDN attachment URL).
 */
async function tryFetchLinkedOriginalImage(
  url?: string
): Promise<{ dataUrl: string; width: number; height: number } | null> {
  if (!url || typeof document === 'undefined' || !/^https?:\/\//i.test(url)) return null;
  // Skip synthetic demo placeholder URL
  if (url.includes('d3a1545c382c8b.cloudfront.net')) return null;

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
  const viaProxy = await loadViaImageElement(proxyUrl, 4500);
  if (viaProxy) return viaProxy;

  // 2. Fallback to direct CORS image load
  return await loadViaImageElement(url, 2000);
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

    const pageResources = page.node.lookupMaybe(PDFName.of('Resources'), PDFDict);
    let imageStreams = collectXObjectsFromResources(pageResources);

    // If the image stream was stored inside an indirect Pattern stream or unreferenced dictionary,
    // scan all indirect objects in the PDF document for `/Subtype /Image` streams
    if (imageStreams.length === 0) {
      for (const [, obj] of pdfLibDoc.context.enumerateIndirectObjects()) {
        const rawObj = obj as any;
        if (rawObj?.dict instanceof PDFDict) {
          const subtype = rawObj.dict.lookup(PDFName.of('Subtype'))?.toString?.();
          if (subtype === '/Image') {
            imageStreams.push(rawObj);
          }
        }
      }
    }

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
 * Helper to generously pad an OCR bounding box so ascenders, descenders, and full glyph heights are 100% covered
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
    for (const w of wordsInSpan) {
      if (w?.bbox) {
        minX = Math.min(minX, Number(w.bbox.x0));
        minY = Math.min(minY, Number(w.bbox.y0));
        maxX = Math.max(maxX, Number(w.bbox.x1));
        maxY = Math.max(maxY, Number(w.bbox.y1));
      }
    }
  }

  const rawH = Math.max(8, maxY - minY);

  // Expand vertically by 38% above and 38% below (plus a minimum pixel floor based on image height)
  // so Tesseract's tight baseline bbox never leaves the top or bottom of letters exposed!
  const padX = Math.max(6, Math.round(rawH * 0.3), Math.round(imageWidth * 0.012));
  const padTop = Math.max(6, Math.round(rawH * 0.38), Math.round(imageHeight * 0.012));
  const padBottom = Math.max(6, Math.round(rawH * 0.38), Math.round(imageHeight * 0.012));

  let x0 = Math.max(0, minX - padX);
  let y0 = Math.max(0, minY - padTop);
  let x1 = Math.min(imageWidth, maxX + padX);
  let y1 = Math.min(imageHeight, maxY + padBottom);

  // Enforce a healthy minimum censor bar thickness relative to line width/image height
  const minCensorHeight = Math.max(22, Math.round(rawH * 1.55), Math.round(imageHeight * 0.042));
  const currentH = y1 - y0;
  if (currentH < minCensorHeight) {
    const extra = (minCensorHeight - currentH) / 2;
    y0 = Math.max(0, y0 - extra);
    y1 = Math.min(imageHeight, y1 + extra);
  }

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
 * Inspect the original image's pixels and text syntax to classify each OCR line as:
 * - `'input_value'`: Text inside a bordered form input box or dropdown (`LAGOA`, `14270`, `Buruh`, `1997-08-04`, `Test5`, `BELUM KAWIN`)
 * - `'label'`: Form field label sitting above an input box (`Kelurahan (*)`, `Kode Pos (*)`, `Status Perkawinan (*)`)
 * - `'header_or_note'`: Top app bar, blue banner card (`Form Uji Kelayakan`, `Caraka`, `Baru - baru lima`), button (`Save Draft`), or helper note (`* Usia maximum...`)
 */
function classifyAndPairOcrLines(
  lines: RawOcrLineItem[],
  pixelData: Uint8ClampedArray | null,
  imgW: number,
  imgH: number
): RawOcrLineItem[] {
  if (lines.length === 0) return lines;

  // Sort lines top-to-bottom by vertical center
  const sorted = [...lines].sort(
    (a, b) => (a.bbox.y0 + a.bbox.y1) / 2 - (b.bbox.y0 + b.bbox.y1) / 2
  );

  // Inspect background color & surrounding input-box borders in the original image
  const inspectBoxEnvironment = (bbox: { x0: number; y0: number; x1: number; y1: number }) => {
    if (!pixelData || imgW < 32 || imgH < 32) {
      return { isWhiteInputBox: false, isColoredBannerBg: false };
    }

    const x0 = Math.max(0, Math.floor(bbox.x0));
    const y0 = Math.max(0, Math.floor(bbox.y0));
    const x1 = Math.min(imgW - 1, Math.ceil(bbox.x1));
    const y1 = Math.min(imgH - 1, Math.ceil(bbox.y1));

    const getRgb = (x: number, y: number) => {
      const idx = (Math.min(imgH - 1, Math.max(0, y)) * imgW + Math.min(imgW - 1, Math.max(0, x))) * 4;
      const r = pixelData[idx];
      const g = pixelData[idx + 1];
      const b = pixelData[idx + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      return { r, g, b, lum };
    };

    // 1. Sample background pixels around and inside the text bounding box to detect colored/blue banners vs white/light form surfaces
    let coloredBgSamples = 0;
    let lightNeutralBgSamples = 0;
    let totalBgSamples = 0;

    const sampleYTop = Math.max(0, y0 - 3);
    const sampleYBot = Math.min(imgH - 1, y1 + 3);
    const stepX = Math.max(2, Math.floor((x1 - x0) / 8));

    for (let sx = x0; sx <= x1; sx += stepX) {
      for (const sy of [sampleYTop, sampleYBot]) {
        const { r, g, b, lum } = getRgb(sx, sy);
        totalBgSamples++;
        const maxC = Math.max(r, g, b);
        const minC = Math.min(r, g, b);
        const saturation = maxC - minC;

        // Blue/colored banner or dark app bar: high color saturation (e.g. blue > red + 35) or dark background
        if ((b - r > 35 && lum < 210) || saturation > 45 || lum < 115) {
          coloredBgSamples++;
        } else if (lum >= 215 && saturation <= 30) {
          lightNeutralBgSamples++;
        }
      }
    }

    const isColoredBannerBg = totalBgSamples > 0 && coloredBgSamples / totalBgSamples >= 0.35;
    if (isColoredBannerBg) {
      return { isWhiteInputBox: false, isColoredBannerBg: true };
    }

    // 2. Check if this text sits on a bright white input surface (`lum >= 232`) enclosed by a dark horizontal top border AND bottom border
    const cx = Math.min(imgW - 1, Math.max(0, Math.round((x0 + x1) / 2)));
    const sampleX2 = Math.min(imgW - 1, Math.max(0, Math.round(x0 + (x1 - x0) * 0.25)));
    const maxSearchDist = Math.max(42, Math.round(imgH * 0.075));

    let foundTopBorder = false;
    let topBorderY = y0;
    for (let y = Math.max(0, y0 - 2); y >= Math.max(0, y0 - maxSearchDist); y--) {
      if (getRgb(cx, y).lum < 165 || getRgb(sampleX2, y).lum < 165) {
        let horizDarkCount = 0;
        for (let dx = -18; dx <= 18; dx += 3) {
          const sx = Math.min(imgW - 1, Math.max(0, cx + dx));
          if (getRgb(sx, y).lum < 175) horizDarkCount++;
        }
        if (horizDarkCount >= 9) {
          foundTopBorder = true;
          topBorderY = y;
          break;
        }
      }
    }

    let foundBottomBorder = false;
    let bottomBorderY = y1;
    for (let y = Math.min(imgH - 1, y1 + 2); y <= Math.min(imgH - 1, y1 + maxSearchDist); y++) {
      if (getRgb(cx, y).lum < 165 || getRgb(sampleX2, y).lum < 165) {
        let horizDarkCount = 0;
        for (let dx = -18; dx <= 18; dx += 3) {
          const sx = Math.min(imgW - 1, Math.max(0, cx + dx));
          if (getRgb(sx, y).lum < 175) horizDarkCount++;
        }
        if (horizDarkCount >= 9) {
          foundBottomBorder = true;
          bottomBorderY = y;
          break;
        }
      }
    }

    const boxHeight = bottomBorderY - topBorderY;
    const isPlausibleInputHeight = boxHeight >= 18 && boxHeight <= Math.max(110, imgH * 0.14);
    const isWhiteInputBox =
      foundTopBorder &&
      foundBottomBorder &&
      isPlausibleInputHeight &&
      totalBgSamples > 0 &&
      lightNeutralBgSamples / totalBgSamples >= 0.4;

    return { isWhiteInputBox, isColoredBannerBg: false };
  };

  // Explicit syntax patterns for labels, helper notes, and UI chrome
  const isRequiredMarkerLabel = /\(\s*\*\s*\)|:\s*$/;
  const isHelperNoteRegex = /^\*|\b(wajib|maximum|maksimum|sesuai dengan|apakah)\b/i;
  const isKnownFormLabelRegex =
    /^(sektor\s+ekonomi|sub\s+sektor|jenis\s+usaha|status\s+perkawinan|alamat\s+identitas|kelurahan|kecamatan|kode\s+pos|kode\s+pekerjaan|kode\s+status|pendidikan|gelar|nama\s+nasabah|tanggal\s+lahir|nomor|nik|npwp|no\.\s*hp|telepon|email)\b/i;
  const isHeaderOrBannerRegex =
    /\b(form\s+data|form\s+uji|uji\s+kelayakan|detail\s+informasi|daftar\s+prospek|save\s+draft|back|home|inisiasi|baru\s*-\s*baru)\b/i;
  const isStatusBarRegex = /\b\d{1,2}:\d{2}\b.*%|\b(4g|5g|lte|wifi)\b/i;

  for (const item of sorted) {
    const t = item.text.trim();
    const { isWhiteInputBox, isColoredBannerBg } = inspectBoxEnvironment(item.bbox);

    if (
      isColoredBannerBg ||
      isStatusBarRegex.test(t) ||
      isHeaderOrBannerRegex.test(t) ||
      isHelperNoteRegex.test(t)
    ) {
      item.fieldType = 'header_or_note';
    } else if (isRequiredMarkerLabel.test(t) || isKnownFormLabelRegex.test(t)) {
      item.fieldType = 'label';
    } else if (isWhiteInputBox) {
      item.fieldType = 'input_value';
    } else {
      // Default to header_or_note unless paired directly underneath a Form Label in Pass 2
      item.fieldType = 'header_or_note';
    }
  }

  // Second pass: Pair each `label` with the value line directly below it (and promote that line to `input_value` if it isn't a label/header)
  for (let i = 0; i < sorted.length; i++) {
    const curr = sorted[i];
    if (curr.fieldType === 'label') {
      const cleanLabelName = curr.text.replace(/\(\s*\*\s*\)/g, '').replace(/:\s*$/, '').trim();
      // Find the closest line immediately below this label
      for (let j = i + 1; j < sorted.length; j++) {
        const below = sorted[j];
        const vertGap = below.bbox.y0 - curr.bbox.y1;
        if (vertGap < -6) continue; // same horizontal row
        if (vertGap > imgH * 0.12) break; // too far below
        if (below.fieldType === 'label') break; // hit the next form label

        const { isColoredBannerBg } = inspectBoxEnvironment(below.bbox);
        if (!isColoredBannerBg && !isHelperNoteRegex.test(below.text) && !isHeaderOrBannerRegex.test(below.text)) {
          below.fieldType = 'input_value';
          below.pairedLabel = cleanLabelName;
        }
        break;
      }
    } else if (curr.fieldType === 'input_value' && !curr.pairedLabel) {
      // Look upward for the nearest label above this enclosed input box
      for (let j = i - 1; j >= 0; j--) {
        const above = sorted[j];
        const vertGap = curr.bbox.y0 - above.bbox.y1;
        if (vertGap > imgH * 0.14) break;
        if (above.fieldType === 'label') {
          curr.pairedLabel = above.text.replace(/\(\s*\*\s*\)/g, '').replace(/:\s*$/, '').trim();
          break;
        }
      }
    }
  }

  return sorted;
}

/**
 * Evaluate raw OCR lines against the user's active Regex & Detection Rules AND Form Input Value detection.
 * - Automatically redacts detected Form Input Values (`fieldType === 'input_value'`) once the scan is complete!
 * - Also redacts any exact substring matching the user's active Regex Rules (while skipping single-character noise).
 * - Keeps Form Labels (`label`) and Headers/Banners (`header_or_note`) readable (`selected: false`) unless explicitly matched by a clean multi-character regex.
 */
export function evaluateOcrLinesAgainstRules(
  rawOcrLines: RawOcrLineItem[],
  rules: RedactionRule[],
  imgW: number,
  imgH: number,
  existingSubBoxes?: InImageSubBox[]
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

  for (const line of rawOcrLines) {
    const lineText = String(line.text || '').trim();
    if (!lineText || lineText.length < 2) continue;
    const bbox = line.bbox;
    if (!bbox) continue;

    const fieldType: OcrFieldType = line.fieldType || 'header_or_note';
    const pairedLabel = line.pairedLabel;

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

    // Check if this line is a Form Input Value (`input_value`) -> Automatically redact the full input value!
    if (fieldType === 'input_value') {
      const { x0, y0, x1, y1 } = computeFullCoverageBox(bbox, line.words, imgW, imgH);
      if (x1 > x0 && y1 > y0) {
        const matchedRuleInfo = lineMatches[0];
        subBoxes.push({
          id: `ocr-input-${subIdx++}`,
          label: lineText,
          fullLineText: lineText,
          fieldType: 'input_value',
          pairedLabel,
          ruleId: matchedRuleInfo ? matchedRuleInfo.ruleId : 'form_input_value',
          ruleName: matchedRuleInfo
            ? `${matchedRuleInfo.ruleName}${pairedLabel ? ` • ${pairedLabel}` : ''}`
            : pairedLabel
            ? `Input Value (${pairedLabel})`
            : 'Form Input Value (Auto-Redacted)',
          xRatio: x0 / imgW,
          yRatio: y0 / imgH,
          wRatio: (x1 - x0) / imgW,
          hRatio: (y1 - y0) / imgH,
          selected: true
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
      // Unmatched Form Label or Header/Note: keep `selected: false` (Readable) so labels & titles stay clear!
      const { x0, y0, x1, y1 } = computeFullCoverageBox(bbox, line.words, imgW, imgH);
      if (x1 > x0 && y1 > y0) {
        const typeDesc =
          fieldType === 'label'
            ? 'Form Label (Readable)'
            : 'Header / Banner (Readable)';

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

  return subBoxes;
}

/**
 * Automatically extract full-resolution uncropped images for all detected Embedded Image matches,
 * stream the extracted image immediately so the modal never waits,
 * and run Tesseract OCR with a reusable singleton worker to create selective in-image redaction subBoxes
 * strictly matching the user's active Regex & Detection Rules!
 */
export async function autoScanImagesWithOcr(
  pdfBuffer: ArrayBuffer,
  imageMatches: DetectedMatch[],
  rules: RedactionRule[],
  redactionOptions: RedactionStyleOptions,
  onProgress?: (statusText: string) => void,
  onPartialUpdate?: (matchId: string, partial: Partial<DetectedMatch>) => void
): Promise<Record<string, Partial<DetectedMatch>>> {
  if (typeof document === 'undefined' || imageMatches.length === 0) return {};

  const updates: Record<string, Partial<DetectedMatch>> = {};

  try {
    // Kick off worker warm-up in parallel while we extract native full-resolution images from the PDF
    const workerPromise = getOrCreateOcrWorker();

    const [pdfDoc, pdfLibDoc] = await Promise.all([
      pdfjsLib.getDocument({ data: pdfBuffer.slice(0) }).promise,
      PDFDocument.load(pdfBuffer.slice(0)).catch(() => null)
    ]);

    // Group image matches by pageIndex
    const byPage = new Map<number, DetectedMatch[]>();
    for (const m of imageMatches) {
      const list = byPage.get(m.pageIndex) || [];
      list.push(m);
      byPage.set(m.pageIndex, list);
    }

    // PHASE 1: Extract the full native uncropped image resolution for each embedded image
    const extractedQueue: {
      imgMatch: DetectedMatch;
      baseDataUrl: string;
      imgW: number;
      imgH: number;
    }[] = [];

    for (const [pageIdx, pageImgMatches] of byPage.entries()) {
      const page = await pdfDoc.getPage(pageIdx + 1);
      const rawPageXObjects = pdfLibDoc
        ? await extractRawUncroppedImagesFromPdfPage(pdfLibDoc, pageIdx)
        : [];

      for (let mIdx = 0; mIdx < pageImgMatches.length; mIdx++) {
        const imgMatch = pageImgMatches[mIdx];
        let baseDataUrl = '';
        let imgW = 0;
        let imgH = 0;

        // 0. HIGHEST PRIORITY: If the PDF thumbnail has a linked full-size image URL (e.g., CloudFront / S3),
        // fetch the true full-resolution uncropped original image via `/api/proxy-image`!
        if (imgMatch.linkedUri) {
          const linkedOriginal = await tryFetchLinkedOriginalImage(imgMatch.linkedUri);
          if (linkedOriginal) {
            baseDataUrl = linkedOriginal.dataUrl;
            imgW = linkedOriginal.width;
            imgH = linkedOriginal.height;
          }
        }

        // 1. Second priority: Raw uncropped PDF XObject stream from pdf-lib (bypasses PDF clipping paths!)
        if (!baseDataUrl) {
          const rawXObj = rawPageXObjects[mIdx] || (rawPageXObjects.length === 1 ? rawPageXObjects[0] : null);
          if (rawXObj) {
            baseDataUrl = rawXObj.dataUrl;
            imgW = rawXObj.width;
            imgH = rawXObj.height;
          }
        }

        // 2. Third priority: Direct PDF.js Image XObject extraction
        if (!baseDataUrl) {
          const nativeExtracted = await extractNativePdfImageObject(page, imgMatch.imageObjId);
          if (nativeExtracted) {
            baseDataUrl = nativeExtracted.dataUrl;
            imgW = nativeExtracted.width;
            imgH = nativeExtracted.height;
          }
        }

        // 3. Fallback: High-DPI sub-viewport render using UNCLIPPED coordinates so clipped thumbnails render in full
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

          // Retry native XObject extraction right after page.render (since page.render populates page.objs!)
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

        extractedQueue.push({ imgMatch, baseDataUrl, imgW, imgH });
      }
    }

    // PHASE 2: Run Dual-Pass High-Sensitivity Tesseract OCR (Original + Border-Suppressed Form Input Pass)
    // and classify each detected line into `input_value`, `label`, or `header_or_note`!
    const worker = await workerPromise;
    let processedCount = 0;

    // Helper to extract normalized line items from a Tesseract recognize() response
    const extractLinesFromOcrData = (ocrData: any): RawOcrLineItem[] => {
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

      const cleanTrailingInputArtifacts = (str: string) =>
        str
          .replace(/\s+[vV∨⌄▾▿<>|[\]()]{1,2}\s*$/g, '') // Strip dropdown chevron / calendar icon OCR artifacts at right edge of input boxes
          .trim();

      if (extractedLines.length > 0) {
        for (const line of extractedLines) {
          const lineText = cleanTrailingInputArtifacts(String(line.text || ''));
          if (!lineText || lineText.length < 1 || !line.bbox) continue;
          // Skip single-character noise unless it's a digit
          if (lineText.length === 1 && !/\d/.test(lineText)) continue;

          const words = Array.isArray(line.words)
            ? line.words
                .filter((w: any) => w?.text && w?.bbox)
                .map((w: any) => ({
                  text: cleanTrailingInputArtifacts(String(w.text)),
                  bbox: {
                    x0: Number(w.bbox.x0),
                    y0: Number(w.bbox.y0),
                    x1: Number(w.bbox.x1),
                    y1: Number(w.bbox.y1)
                  }
                }))
                .filter((w: any) => w.text.length > 0)
            : [];

          out.push({
            text: lineText,
            bbox: {
              x0: Number(line.bbox.x0),
              y0: Number(line.bbox.y0),
              x1: Number(line.bbox.x1),
              y1: Number(line.bbox.y1)
            },
            words
          });
        }
      } else if (extractedWords.length > 0) {
        for (const w of extractedWords) {
          const wText = cleanTrailingInputArtifacts(String(w.text || ''));
          if (!wText || (wText.length === 1 && !/\d/.test(wText)) || !w.bbox) continue;
          const wb = {
            x0: Number(w.bbox.x0),
            y0: Number(w.bbox.y0),
            x1: Number(w.bbox.x1),
            y1: Number(w.bbox.y1)
          };
          out.push({
            text: wText,
            bbox: wb,
            words: [{ text: wText, bbox: wb }]
          });
        }
      }
      return out;
    };

    for (const { imgMatch, baseDataUrl, imgW, imgH } of extractedQueue) {
      processedCount++;
      if (onProgress) {
        onProgress(`High-sensitivity OCR scanning image ${processedCount} of ${extractedQueue.length}...`);
      }

      let rawOcrLines: RawOcrLineItem[] = [];
      let subBoxes: InImageSubBox[] = [];
      try {
        // Prepare border-erased image copy + raw pixel buffer for input-box border inspection
        const { borderCleanedDataUrl, pixelData } = await prepareImageForHighSensitivityOcr(baseDataUrl);

        // Pass 1: Standard Page Segmentation (PSM 6 - Uniform Block) on original image (captures multi-word sentences, headers & labels)
        await worker.setParameters({ tessedit_pageseg_mode: '6' as any });
        const pass1Result = await worker.recognize(
          baseDataUrl,
          {},
          { text: true, blocks: true }
        );
        const pass1Lines = extractLinesFromOcrData(pass1Result?.data);

        // Pass 2: Sparse Text (PSM 11) on Border-Cleaned image (captures isolated words inside bordered input boxes & dropdowns like LAGOA, 14270, Buruh, Diploma 3)
        await worker.setParameters({ tessedit_pageseg_mode: '11' as any });
        const pass2Result = await worker.recognize(
          borderCleanedDataUrl,
          {},
          { text: true, blocks: true }
        );
        const pass2Lines = extractLinesFromOcrData(pass2Result?.data);

        // Reset worker default PSM to 6
        await worker.setParameters({ tessedit_pageseg_mode: '6' as any });

        // Merge Pass 1 + Pass 2 lines, deduplicating by spatial overlap so newly discovered input boxes are added cleanly
        const mergedLines: RawOcrLineItem[] = [...pass1Lines];
        for (const cand of pass2Lines) {
          const candCy = (cand.bbox.y0 + cand.bbox.y1) / 2;
          const candH = Math.max(8, cand.bbox.y1 - cand.bbox.y0);

          const alreadyExists = mergedLines.some((ex) => {
            const exCy = (ex.bbox.y0 + ex.bbox.y1) / 2;
            const sameRow = Math.abs(candCy - exCy) < Math.max(candH, ex.bbox.y1 - ex.bbox.y0) * 0.65;
            if (!sameRow) return false;

            const overlapX = Math.max(
              0,
              Math.min(cand.bbox.x1, ex.bbox.x1) - Math.max(cand.bbox.x0, ex.bbox.x0)
            );
            const minW = Math.max(1, Math.min(cand.bbox.x1 - cand.bbox.x0, ex.bbox.x1 - ex.bbox.x0));
            return overlapX / minW > 0.45;
          });

          if (!alreadyExists) {
            mergedLines.push(cand);
          }
        }

        // Classify each line as `input_value`, `label`, or `header_or_note` and pair each `input_value` with the label above it!
        rawOcrLines = classifyAndPairOcrLines(mergedLines, pixelData, imgW, imgH);

        subBoxes = evaluateOcrLinesAgainstRules(rawOcrLines, rules, imgW, imgH);
      } catch (ocrErr) {
        console.warn('OCR scan warning on image', ocrErr);
      }

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
        subBoxes,
        imageMode: 'partial',
        createLocalFullSizePage: true
      };

      updates[imgMatch.id] = finalUpdate;
      if (onPartialUpdate) {
        onPartialUpdate(imgMatch.id, finalUpdate);
      }
    }
  } catch (err) {
    console.warn('Automated OCR image pipeline error:', err);
  }

  return updates;
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
 * Apply redaction rectangles, sanitized readable images, & local full-size attachment pages to the PDF using pdf-lib
 */
export async function applyRedactionsToPdf(
  pdfBuffer: ArrayBuffer,
  matchesToRedact: DetectedMatch[],
  options: RedactionStyleOptions
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfBuffer.slice(0));
  const pages = pdfDoc.getPages();
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

  return await pdfDoc.save();
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

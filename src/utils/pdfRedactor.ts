import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

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

        const operatorListContainsImage = (opListIR: any, depth = 0): boolean => {
          if (!opListIR || !Array.isArray(opListIR.fnArray) || depth > 4) return false;
          for (let k = 0; k < opListIR.fnArray.length; k++) {
            const opFn = opListIR.fnArray[k];
            const opArgs = opListIR.argsArray?.[k];
            if (
              opFn === OPS.paintImageXObject ||
              opFn === OPS.paintInlineImageXObject ||
              opFn === OPS.paintImageMaskXObject ||
              opFn === OPS.paintImageXObjectRepeat ||
              opFn === OPS.paintInlineImageXObjectGroup ||
              opFn === OPS.paintImageMaskXObjectRepeat ||
              opFn === OPS.paintImageMaskXObjectGroup
            ) {
              return true;
            }
            if (
              (opFn === OPS.setFillColorN || opFn === OPS.setStrokeColorN) &&
              Array.isArray(opArgs) &&
              opArgs[0] === 'TilingPattern' &&
              operatorListContainsImage(opArgs[2], depth + 1)
            ) {
              return true;
            }
          }
          return false;
        };

        interface GraphicsState {
          ctm: number[];
          clipBox: [number, number, number, number] | null;
          fillPatternHasImage: boolean;
        }

        let state: GraphicsState = {
          ctm: [1, 0, 0, 1, 0, 0],
          clipBox: null,
          fillPatternHasImage: false
        };
        const stateStack: GraphicsState[] = [];
        const cloneState = (s: GraphicsState): GraphicsState => ({
          ctm: [...s.ctm],
          clipBox: s.clipBox ? [...s.clipBox] : null,
          fillPatternHasImage: s.fillPatternHasImage
        });

        let pendingClip = false;
        let pageImgCount = 0;
        const pageDetectedBoxes: [number, number, number, number][] = [];

        const recordImageBBox = (bbox: [number, number, number, number]) => {
          const imgX = bbox[0];
          const imgY = bbox[1];
          const imgW = bbox[2] - bbox[0];
          const imgH = bbox[3] - bbox[1];

          if (!isFinite(imgX) || !isFinite(imgY) || !isFinite(imgW) || !isFinite(imgH)) return;
          if (imgW < 8 || imgH < 8) return;

          // Deduplicate identical/overlapping image layers (e.g., SMask + RGB pair)
          const isDuplicate = pageDetectedBoxes.some(
            ([bx, by, bw, bh]) =>
              Math.abs(bx - imgX) < 1.5 &&
              Math.abs(by - imgY) < 1.5 &&
              Math.abs(bw - imgW) < 1.5 &&
              Math.abs(bh - imgH) < 1.5
          );
          if (isDuplicate) return;

          pageDetectedBoxes.push([imgX, imgY, imgW, imgH]);
          pageImgCount++;
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
            selected: true
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
              state.fillPatternHasImage = operatorListContainsImage(args[2]);
            } else {
              state.fillPatternHasImage = false;
            }
          } else if (
            fn === OPS.setFillRGBColor ||
            fn === OPS.setFillGray ||
            fn === OPS.setFillCMYKColor ||
            fn === OPS.setFillColor
          ) {
            state.fillPatternHasImage = false;
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
                recordImageBBox(intersectBBox(state.clipBox, pathBBox));
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
            recordImageBBox(intersectBBox(state.clipBox, rawBBox));
          } else if (fn === OPS.paintImageXObjectRepeat) {
            const [, scaleX, scaleY, positions] = args || [];
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
                recordImageBBox(intersectBBox(state.clipBox, rawBBox));
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
 * Apply redaction rectangles & replacement labels to the PDF using pdf-lib
 */
export async function applyRedactionsToPdf(
  pdfBuffer: ArrayBuffer,
  matchesToRedact: DetectedMatch[],
  options: RedactionStyleOptions
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfBuffer.slice(0));
  const pages = pdfDoc.getPages();
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Group matches by pageIndex
  const matchesByPage = new Map<number, DetectedMatch[]>();
  for (const match of matchesToRedact) {
    if (!match.selected) continue;
    const list = matchesByPage.get(match.pageIndex) || [];
    list.push(match);
    matchesByPage.set(match.pageIndex, list);
  }

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

  // Visual ID Photo & Signature Box for testing Automatic & Manual Image Blackout
  const sigTopY = y - 75;
  try {
    let pngDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPj/HwADBwIAMCbHYQAAAABJRU5ErkJggg==';
    if (typeof document !== 'undefined') {
      const offCanvas = document.createElement('canvas');
      offCanvas.width = 280;
      offCanvas.height = 170;
      const ctx = offCanvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#eff6ff';
        ctx.fillRect(0, 0, 280, 170);
        ctx.strokeStyle = '#93c5fd';
        ctx.lineWidth = 4;
        ctx.strokeRect(2, 2, 276, 166);
        // Avatar head & shoulders
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.arc(140, 58, 28, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.roundRect(92, 94, 96, 40, 14);
        ctx.fill();
        ctx.fillStyle = '#1e3a8a';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('EMPLOYEE ID PHOTO', 140, 155);
        pngDataUrl = offCanvas.toDataURL('image/png');
      }
    }
    const embeddedPhoto = await pdfDoc.embedPng(pngDataUrl);
    page.drawImage(embeddedPhoto, {
      x: 50,
      y: sigTopY - 85,
      width: 140,
      height: 85
    });
  } catch {
    page.drawRectangle({
      x: 50,
      y: sigTopY - 85,
      width: 140,
      height: 85,
      color: rgb(0.94, 0.96, 0.99),
      borderColor: rgb(0.75, 0.8, 0.88),
      borderWidth: 1
    });
  }

  // Simulated Authorized Signature & Stamp Box
  page.drawRectangle({
    x: 210,
    y: sigTopY - 85,
    width: 352,
    height: 85,
    color: rgb(0.99, 0.99, 0.99),
    borderColor: rgb(0.82, 0.85, 0.9),
    borderWidth: 1
  });
  page.drawText('AUTHORIZED SIGNATURE & CORPORATE SEAL:', {
    x: 225,
    y: sigTopY - 20,
    size: 8.5,
    font: fontBold,
    color: rgb(0.3, 0.35, 0.45)
  });
  page.drawText('Alexander Vance', {
    x: 235,
    y: sigTopY - 50,
    size: 16,
    font: fontBold,
    color: rgb(0.15, 0.25, 0.65)
  });
  page.drawText('Tip: Use "Draw Image / Area Blackout" in the toolbar to drag over photos or signatures.', {
    x: 225,
    y: sigTopY - 75,
    size: 7.5,
    font: fontRegular,
    color: rgb(0.45, 0.5, 0.6)
  });

  const pdfBytes = await pdfDoc.save();
  const buffer = new ArrayBuffer(pdfBytes.byteLength);
  new Uint8Array(buffer).set(pdfBytes);
  return buffer;
}

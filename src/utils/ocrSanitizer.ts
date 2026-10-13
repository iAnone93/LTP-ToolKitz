/**
 * OCR Anomaly Symbol Elimination & Text Separator
 *
 * Implements the explicit pipeline:
 * [1] OCR Read -> [2] Eliminate Anomaly Symbols & Separate at Delimiters/Colons -> [3] Redact Text
 *
 * Requirements:
 * - The allowed symbols are strictly ONLY: (!@#$%^&*)
 *   plus standard Latin alphanumeric characters (a-z, A-Z, 0-9) and standard whitespace.
 * - All anomaly symbols (such as CJK ideographs 图, 山, 了, 上; geometric shapes ☆, □, ▲, ▾;
 *   table/form borders and separators |, _, \, :, ;, [, ], {, }, <, >, ~, `, +, =;
 *   and stray unicode artifacts) are eliminated.
 * - Wherever an anomaly symbol or colon (:) / semicolon (;) was positioned,
 *   separate the text into distinct detected items (e.g. 'auto山 detect' -> 'auto' and 'detect';
 *   'langsung: {id: 234' -> 'langsung', 'id', and '234').
 *   This ensures the text value after (:) is NEVER connected and makes it effortless
 *   to create regex for the specific value!
 */

export const ALLOWED_OCR_SYMBOLS = '!@#$%^&*()';

/**
 * Eliminates anomaly symbols from OCR-detected text.
 * Strictly preserves ONLY letters (a-z, A-Z), digits (0-9), spaces,
 * and the user-specified symbols (!@#$%^&*).
 */
export function eliminateAnomalySymbols(text: string): string {
  if (!text) return '';

  // 1. Normalize Latin diacritics / accented characters (e.g. 'ā' -> 'a', 'é' -> 'e', 'ü' -> 'u')
  let cleaned = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // 2. Remove all CJK ideographs (Chinese, Japanese, Korean)
  cleaned = cleaned.replace(
    /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff\u3040-\u30ff\uac00-\ud7af]/g,
    ' '
  );

  // 3. Eliminate all symbols except standard alphanumeric (a-zA-Z0-9), whitespace, and (!@#$%^&*)
  // Note: Only (!@#$%^&*) are allowed. Any other character (e.g. .,:_'"/\|[]{}<>~`+=-) is replaced with a space.
  cleaned = cleaned.replace(/[^a-zA-Z0-9\s!@#$%^&*()]/g, ' ');

  // 4. Strip stray orphan artifacts like chevron artifacts at right edge
  cleaned = cleaned.replace(/\s+[vV∨⌄▾▿<>|[\]()©®@]{1,2}\s*$/g, '');

  // 5. Normalize whitespace: collapse multiple spaces into single space and trim
  return cleaned.replace(/\s+/g, ' ').trim();
}

/**
 * Checks if a string contains any meaningful text (letters, digits, or meaningful allowed symbols !@#$%^&*).
 * Returns false if the string is empty or contains only non-allowed anomaly symbols.
 */
export function hasMeaningfulContent(text: string): boolean {
  if (!text) return false;
  return /[a-zA-Z0-9]/.test(text) || /[!@#$%^&*()]/.test(text);
}

/**
 * Clean a list of OCR word items by eliminating anomaly symbols.
 * Strips any words that have no meaningful content after anomaly elimination.
 */
export function cleanOcrWords<
  T extends { text: string; bbox: { x0: number; y0: number; x1: number; y1: number } }
>(words: T[]): T[] {
  if (!Array.isArray(words)) return [];

  const out: T[] = [];
  for (const w of words) {
    const cleanedText = eliminateAnomalySymbols(w.text);
    if (!hasMeaningfulContent(cleanedText)) continue;

    out.push({
      ...w,
      text: cleanedText
    });
  }

  return out;
}

export interface SeparatedOcrSegment {
  text: string;
  bbox: { x0: number; y0: number; x1: number; y1: number };
  words: { text: string; bbox: { x0: number; y0: number; x1: number; y1: number } }[];
  fieldType?: 'input_value' | 'label' | 'header_or_note';
  pairedLabel?: string;
}

/**
 * Splits a line or token into separated items wherever an anomaly symbol or colon/semicolon/brace/bracket is encountered.
 * Examples:
 * - 'auto山 detect' -> separated into 'auto' and 'detect'
 * - 'langsung: {id: 234' -> separated into 'langsung', 'id', and '234'
 * - 'Status: Kawin' -> separated into 'Status' (label) and 'Kawin' (input value)
 * - 'Nama: Budi Santoso' -> separated into 'Nama' and 'Budi Santoso'
 * - 'BELUM|KAWIN' -> separated into 'BELUM' and 'KAWIN'
 * - '[LAGOA]' -> 'LAGOA'
 *
 * Each separated piece gets its own tight, accurate bounding box, word tokens, and label pairing,
 * guaranteeing that text values after (:) are NEVER connected to labels!
 */
export function separateLineBySymbolsAndDelimiters(
  line: {
    text: string;
    bbox: { x0: number; y0: number; x1: number; y1: number };
    words?: { text: string; bbox: { x0: number; y0: number; x1: number; y1: number } }[];
    fieldType?: 'input_value' | 'label' | 'header_or_note';
    pairedLabel?: string;
  }
): SeparatedOcrSegment[] {
  // If line.text is missing or doesn't have colons, check if words contain colons
  let rawText = String(line.text || '').trim();
  if (
    !rawText.includes(':') &&
    Array.isArray(line.words) &&
    line.words.some((w) => String(w.text || '').includes(':'))
  ) {
    rawText = line.words.map((w) => String(w.text || '')).join(' ').trim();
  }
  if (!rawText && Array.isArray(line.words) && line.words.length > 0) {
    rawText = line.words.map((w) => String(w.text || '')).join(' ').trim();
  }
  if (!rawText) return [];

  // Delimiter regex:
  // - Colons ':', semicolons ';'
  // - Braces '{', '}', brackets '[', ']', chevrons '<', '>'
  // - Separator symbols '|', '\', '_', '~', '+', '=', '`'
  // - CJK ideographs (e.g. 山, 图)
  // - Geometric shapes / icons
  // - Any symbol not in standard allowed (!@#$%^&*().,-) or alphanumeric
  const delimiterRegex =
    /([:;{}[\]|\\_~+=<>`]|[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff\u3040-\u30ff\uac00-\ud7af]|[☆★□■▲▼▾▿◆◇口○●]|[^a-zA-Z0-9\s!@#$%^&*().,-]+)/g;

  interface RawSpan {
    rawSegment: string;
    cleanedText: string;
    start: number;
    end: number;
    delimBefore: string;
    delimAfter: string;
  }

  const spans: RawSpan[] = [];
  let lastIdx = 0;
  let lastDelim = '';
  let match: RegExpExecArray | null;

  while ((match = delimiterRegex.exec(rawText)) !== null) {
    const matchIdx = match.index;
    const delimStr = match[0];
    const sliceStr = rawText.slice(lastIdx, matchIdx);
    const trimmed = sliceStr.trim();

    if (trimmed.length > 0) {
      const cleaned = eliminateAnomalySymbols(trimmed);
      if (hasMeaningfulContent(cleaned)) {
        const leadingSpace = sliceStr.search(/\S/);
        const spanStart = lastIdx + (leadingSpace >= 0 ? leadingSpace : 0);
        const spanEnd = spanStart + trimmed.length;
        spans.push({
          rawSegment: trimmed,
          cleanedText: cleaned,
          start: spanStart,
          end: spanEnd,
          delimBefore: lastDelim,
          delimAfter: delimStr
        });
      }
    }
    lastDelim = delimStr;
    lastIdx = delimiterRegex.lastIndex;
  }

  const remainderStr = rawText.slice(lastIdx);
  const trimmedRemainder = remainderStr.trim();
  if (trimmedRemainder.length > 0) {
    const cleaned = eliminateAnomalySymbols(trimmedRemainder);
    if (hasMeaningfulContent(cleaned)) {
      const leadingSpace = remainderStr.search(/\S/);
      const spanStart = lastIdx + (leadingSpace >= 0 ? leadingSpace : 0);
      const spanEnd = spanStart + trimmedRemainder.length;
      spans.push({
        rawSegment: trimmedRemainder,
        cleanedText: cleaned,
        start: spanStart,
        end: spanEnd,
        delimBefore: lastDelim,
        delimAfter: ''
      });
    }
  }

  // If there are no delimiters or only 1 segment found
  if (spans.length <= 1) {
    const cleanedFull = eliminateAnomalySymbols(rawText);
    if (!hasMeaningfulContent(cleanedFull)) return [];
    return [
      {
        text: cleanedFull,
        bbox: line.bbox,
        words:
          line.words && line.words.length > 0
            ? line.words
            : [{ text: cleanedFull, bbox: line.bbox }],
        fieldType: line.fieldType,
        pairedLabel: line.pairedLabel
      }
    ];
  }

  const rawWords = Array.isArray(line.words) ? line.words : [];
  const lineBBox = line.bbox || { x0: 0, y0: 0, x1: 100, y1: 20 };
  const totalLen = Math.max(1, rawText.length);
  const lineW = Math.max(1, lineBBox.x1 - lineBBox.x0);

  // Track the most recent label encountered so values after (:) can be paired with it
  let latestLabelText: string | undefined = undefined;

  return spans.map((span, sIdx) => {
    // 1. Determine Field Type & Label Pairing
    let fieldType = line.fieldType;
    let pairedLabel = line.pairedLabel;

    const isFollowedByColon = span.delimAfter.includes(':') || span.delimAfter.includes(';');
    const isPrecededByColon = span.delimBefore.includes(':') || span.delimBefore.includes(';');

    if (isFollowedByColon) {
      fieldType = 'label';
      if (latestLabelText) {
        pairedLabel = latestLabelText;
      }
      latestLabelText = span.cleanedText;
    } else if (isPrecededByColon) {
      fieldType = 'input_value';
      if (latestLabelText) {
        pairedLabel = latestLabelText;
      } else if (sIdx > 0) {
        pairedLabel = spans[sIdx - 1].cleanedText;
      }
    }

    // 2. Compute accurate Bounding Box & Matching Words
    // Look for matching words in rawWords
    const matchingWords = rawWords.filter((w) => {
      const wClean = eliminateAnomalySymbols(String(w.text || ''));
      if (!wClean) return false;
      return span.cleanedText.includes(wClean) || wClean.includes(span.cleanedText);
    });

    let segBBox: { x0: number; y0: number; x1: number; y1: number };

    if (matchingWords.length > 0) {
      // Check if a single word in rawWords contained multiple spans (e.g. 'langsung:234')
      if (matchingWords.length === 1 && rawWords.length === 1 && spans.length > 1) {
        const singleW = matchingWords[0];
        const singleWWidth = Math.max(4, singleW.bbox.x1 - singleW.bbox.x0);
        const x0 = Math.round(singleW.bbox.x0 + (span.start / totalLen) * singleWWidth);
        const x1 = Math.round(singleW.bbox.x0 + (span.end / totalLen) * singleWWidth);
        segBBox = {
          x0,
          y0: singleW.bbox.y0,
          x1: Math.max(x0 + 4, x1),
          y1: singleW.bbox.y1
        };
      } else {
        segBBox = {
          x0: Math.min(...matchingWords.map((w) => w.bbox.x0)),
          y0: Math.min(...matchingWords.map((w) => w.bbox.y0)),
          x1: Math.max(...matchingWords.map((w) => w.bbox.x1)),
          y1: Math.max(...matchingWords.map((w) => w.bbox.y1))
        };
      }
    } else {
      // Proportional box calculation along horizontal text line
      const x0 = Math.round(lineBBox.x0 + (span.start / totalLen) * lineW);
      const x1 = Math.round(lineBBox.x0 + (span.end / totalLen) * lineW);
      segBBox = {
        x0,
        y0: lineBBox.y0,
        x1: Math.max(x0 + 4, x1),
        y1: lineBBox.y1
      };
    }

    return {
      text: span.cleanedText,
      bbox: segBBox,
      words:
        matchingWords.length > 0
          ? matchingWords.map((w) => ({
              text: eliminateAnomalySymbols(w.text),
              bbox: w.bbox
            }))
          : [{ text: span.cleanedText, bbox: segBBox }],
      fieldType,
      pairedLabel
    };
  });
}

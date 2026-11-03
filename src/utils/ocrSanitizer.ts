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
  let cleaned = text.normalize('NFD').replace(/[̀-ͯ]/g, '');

  // 2. Remove all CJK ideographs (Chinese, Japanese, Korean)
  cleaned = cleaned.replace(
    /[一-鿿㐀-䶿豈-﫿぀-ヿ가-힯]/g,
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

type OcrBBox = { x0: number; y0: number; x1: number; y1: number };
type OcrWord = { text: string; bbox: OcrBBox; confidence?: number };

export interface SeparatedOcrSegment {
  text: string;
  bbox: OcrBBox;
  words: OcrWord[];
  fieldType?: 'input_value' | 'label' | 'header_or_note';
  pairedLabel?: string;
}

// Delimiter regex:
// - Colons ':', semicolons ';'
// - Braces '{', '}', brackets '[', ']', chevrons '<', '>'
// - Separator symbols '|', '\', '_', '~', '+', '=', '`'
// - CJK ideographs (e.g. 山, 图)
// - Geometric shapes / icons
// - Any symbol not in standard allowed (!@#$%^&*().,-) or alphanumeric
const DELIMITER_REGEX =
  /([:;{}[\]|\\_~+=<>`]|[一-鿿㐀-䶿豈-﫿぀-ヿ가-힯]|[☆★□■▲▼▾▿◆◇口○●]|[^a-zA-Z0-9\s!@#$%^&*().,-]+)/g;

// A URL keeps its ':' and '/' together: split there, "https" would become a label and steal the
// value from the real key (e.g. `foto: https://...`)
const URL_REGEX = /\bhttps?:\/\/\S+/gi;

interface RawSpan {
  cleanedText: string;
  start: number;
  end: number;
  delimBefore: string;
  delimAfter: string;
}

/** Character ranges of each OCR word inside the line text, found in reading order. */
function locateWords(rawText: string, words: OcrWord[]) {
  const located: { start: number; end: number; word: OcrWord }[] = [];
  let cursor = 0;
  for (const word of words) {
    const t = String(word.text || '');
    if (!t || !word.bbox) continue;
    const at = rawText.indexOf(t, cursor);
    if (at === -1) continue;
    located.push({ start: at, end: at + t.length, word });
    cursor = at + t.length;
  }
  return located;
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
 * Each piece gets a box built from the exact characters it covers (words are matched by position,
 * and a word shared by two pieces is divided proportionally), plus its label pairing.
 */
export function separateLineBySymbolsAndDelimiters(
  line: {
    text: string;
    bbox: OcrBBox;
    words?: OcrWord[];
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

  const urlRanges = Array.from(rawText.matchAll(URL_REGEX), (m) => [m.index!, m.index! + m[0].length]);
  const insideUrl = (idx: number) => urlRanges.some(([s, e]) => idx >= s && idx < e);

  const spans: RawSpan[] = [];
  let lastIdx = 0;
  // Every delimiter since the previous piece, so `nama: "Budi"` still counts as preceded by a colon
  let pendingDelims = '';

  const pushSpan = (sliceStr: string, sliceStart: number) => {
    const trimmed = sliceStr.trim();
    if (!trimmed) return false;
    const cleaned = eliminateAnomalySymbols(trimmed);
    if (!hasMeaningfulContent(cleaned)) return false;
    const leadingSpace = sliceStr.search(/\S/);
    const start = sliceStart + (leadingSpace >= 0 ? leadingSpace : 0);
    spans.push({ cleanedText: cleaned, start, end: start + trimmed.length, delimBefore: pendingDelims, delimAfter: '' });
    return true;
  };

  // `unit_kerja` is one identifier (a JSON key), not two words to split
  const isSnakeCaseJoin = (m: RegExpExecArray) =>
    m[0] === '_' && /[a-zA-Z0-9]/.test(rawText[m.index - 1] || '') && /[a-zA-Z0-9]/.test(rawText[m.index + 1] || '');
  // A colon between digits is a time ("13T00:00:00Z", "16:53"), not a "label: value" separator
  const isTimeSeparator = (m: RegExpExecArray) =>
    m[0] === ':' && /\d/.test(rawText[m.index - 1] || '') && /\d/.test(rawText[m.index + 1] || '');

  const delimiterRegex = new RegExp(DELIMITER_REGEX.source, 'g');
  let match: RegExpExecArray | null;
  while ((match = delimiterRegex.exec(rawText)) !== null) {
    if (insideUrl(match.index) || isSnakeCaseJoin(match) || isTimeSeparator(match)) continue;
    if (pushSpan(rawText.slice(lastIdx, match.index), lastIdx)) pendingDelims = '';
    pendingDelims += match[0];
    lastIdx = delimiterRegex.lastIndex;
  }
  pushSpan(rawText.slice(lastIdx), lastIdx);
  const trailingDelims = spans.length && spans[spans.length - 1].end <= lastIdx ? pendingDelims : '';
  spans.forEach((span, i) => {
    span.delimAfter = i + 1 < spans.length ? spans[i + 1].delimBefore : trailingDelims;
  });

  if (spans.length === 0) return [];

  // A single piece followed by a colon ("Nama :") is a label, even though the colon itself is dropped
  if (spans.length === 1) {
    const cleanedFull = eliminateAnomalySymbols(rawText);
    if (!hasMeaningfulContent(cleanedFull)) return [];
    const endsWithColon = /[:;]/.test(spans[0].delimAfter);
    return [
      {
        text: cleanedFull,
        bbox: line.bbox,
        words:
          line.words && line.words.length > 0
            ? line.words
            : [{ text: cleanedFull, bbox: line.bbox }],
        fieldType: endsWithColon ? 'label' : line.fieldType,
        pairedLabel: line.pairedLabel
      }
    ];
  }

  const located = locateWords(rawText, Array.isArray(line.words) ? line.words : []);
  const lineBBox = line.bbox || { x0: 0, y0: 0, x1: 100, y1: 20 };
  const totalLen = Math.max(1, rawText.length);
  const lineW = Math.max(1, lineBBox.x1 - lineBBox.x0);

  // Track the most recent label encountered so values after (:) can be paired with it
  let latestLabelText: string | undefined = undefined;

  return spans.map((span, sIdx) => {
    // 1. Determine Field Type & Label Pairing
    let fieldType = line.fieldType;
    let pairedLabel = line.pairedLabel;

    const isFollowedByColon = /[:;]/.test(span.delimAfter);
    const isPrecededByColon = /[:;]/.test(span.delimBefore);

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

    // 2. Box from the exact characters of this piece
    const parts = located
      .filter((lw) => lw.end > span.start && lw.start < span.end)
      .map((lw) => {
        const from = Math.max(span.start, lw.start);
        const to = Math.min(span.end, lw.end);
        const len = Math.max(1, lw.end - lw.start);
        const wb = lw.word.bbox;
        const ww = wb.x1 - wb.x0;
        const bbox =
          from === lw.start && to === lw.end
            ? wb
            : {
                x0: Math.round(wb.x0 + (ww * (from - lw.start)) / len),
                y0: wb.y0,
                x1: Math.round(wb.x0 + (ww * (to - lw.start)) / len),
                y1: wb.y1
              };
        return {
          text: eliminateAnomalySymbols(rawText.slice(from, to)),
          bbox,
          confidence: lw.word.confidence
        };
      })
      .filter((p) => hasMeaningfulContent(p.text));

    let segBBox: OcrBBox;
    if (parts.length > 0) {
      segBBox = {
        x0: Math.min(...parts.map((p) => p.bbox.x0)),
        y0: Math.min(...parts.map((p) => p.bbox.y0)),
        x1: Math.max(...parts.map((p) => p.bbox.x1)),
        y1: Math.max(...parts.map((p) => p.bbox.y1))
      };
    } else {
      // No word boxes (e.g. PaddleOCR line output): proportional box along the line
      const x0 = Math.round(lineBBox.x0 + (span.start / totalLen) * lineW);
      const x1 = Math.round(lineBBox.x0 + (span.end / totalLen) * lineW);
      segBBox = { x0, y0: lineBBox.y0, x1: Math.max(x0 + 4, x1), y1: lineBBox.y1 };
    }

    return {
      text: span.cleanedText,
      bbox: segBBox,
      words: parts.length > 0 ? parts : [{ text: span.cleanedText, bbox: segBBox }],
      fieldType,
      pairedLabel
    };
  });
}

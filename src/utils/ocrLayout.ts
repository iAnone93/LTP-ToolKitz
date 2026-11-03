import type { RawOcrLineItem } from './pdfRedactor';
import type { FaceBox } from './faceDetector';

type BBox = { x0: number; y0: number; x1: number; y1: number };

/**
 * Field labels whose values are personal or confidential. In screenshots, the value next to
 * (or under) one of these labels is redacted; the label itself stays readable.
 * Editable per session from the "Sensitive Fields in Images" rule.
 */
export const DEFAULT_SENSITIVE_LABELS = [
  // Identity
  'Nama', 'Nama Lengkap', 'Nama Nasabah', 'Nama Karyawan', 'Nama Pegawai', 'Nama Ibu Kandung',
  'NIK', 'No KTP', 'Nomor KTP', 'NIP', 'NIP HRIS', 'NPWP', 'ID', 'Absen ID', 'Karyawan ID',
  'Tempat Lahir', 'Tanggal Lahir', 'Tempat/Tgl Lahir', 'Jenis Kelamin', 'Agama',
  'Status Perkawinan', 'Pendidikan', 'Gelar',
  // Employment
  'Jabatan', 'Posisi', 'Unit Kerja', 'Lokasi Kerja', 'Pekerjaan', 'Kode Pekerjaan',
  // A supervisor field holds a person's name ("Atasan Langsung", "Atasan dari Atasan Langsung")
  'Atasan',
  'Tgl Aktif', 'Tanggal Aktif', 'Tgl Masuk', 'Tanggal Masuk',
  'Tgl End Kontrak', 'Tgl Kontrak', 'Tanggal Kontrak', 'Tgl Lahir',
  // Address & contact
  'Alamat', 'Alamat Identitas', 'Alamat Domisili', 'RT/RW', 'Kelurahan', 'Kel/Desa', 'Kecamatan',
  'Kota', 'Kabupaten', 'Provinsi', 'Kode Pos', 'No HP', 'No Telepon', 'Telepon', 'Email',
  // Financial
  'No Rekening', 'Nomor Rekening', 'Rencana Plafon', 'Plafon', 'Penghasilan', 'Gaji',
  // Photos and their links
  'Foto', 'Photo', 'Avatar'
];

// Recognised as labels so their values are never mistaken for free text, but not sensitive themselves
const GENERAL_FORM_LABELS = [
  'ID Pipeline', 'Sektor Ekonomi', 'Sub Sektor', 'Jenis Usaha', 'Status Tempat', 'Kode Status',
  'Lama Usaha', 'Keterangan', 'Catatan', 'Nomor', 'Label', 'Field', 'Status', 'Tanggal', 'Tahun',
  'Periode', 'Awal Periode', 'Akhir Periode', 'Tipe', 'Target', 'Bobot', 'Satuan', 'Realisasi',
  'Pencapaian', 'Nilai Pencapaian', 'Subtotal', 'Total Bobot', 'Grand Total Nilai Pencapaian',
  'Komentar', 'Komentar Karyawan', 'Img URL', 'Image URL'
];

// UI chrome and section titles that look like labels but never own a value
const NEVER_A_LABEL =
  /\b(form\s+data|form\s+uji|uji\s+kelayakan|detail\s+informasi|daftar\s+prospek|save\s+draft|back|home|inisiasi|network\s+elements|keep\s+log|disable\s+cache|no\s+throttling|submit)\b/i;

// Browser DevTools tabs show up in a lot of test evidence; a run of them is UI, not data
const DEVTOOLS_WORDS =
  /\b(elements|console|sources|network|performance|memory|application|lighthouse|recorder|headers|payload|preview|response|initiator|timing|cookies)\b/gi;

function isUiChrome(text: string): boolean {
  return NEVER_A_LABEL.test(text) || (text.match(DEVTOOLS_WORDS) || []).length >= 2;
}

// Typical placeholder wording, used together with the text colour
const PLACEHOLDER_PHRASE = /^(pilih|cari|isi|masukkan|ketik|tulis|select|search|enter|type|choose)\b/i;

/** Facts about a line measured from pixels and geometry at scan time. */
export interface OcrLineLayout {
  isPlaceholder: boolean;
  /** Background minus darkest ink luminance (0-255); undefined on dark backgrounds */
  contrast?: number;
  /** The box grown sideways to the real ink edges; used to size redactions of values */
  inkBox?: BBox;
  inPhoto: boolean;
  inInputBox: boolean;
  onColoredBanner: boolean;
  /** Same phrase continued right after this piece (OCR or a delimiter split it) */
  joinsRightIdx?: number;
  /** Nearest line to the right on the same row, in the same panel */
  rightIdx?: number;
  /** Nearest line directly below, in the same column and panel */
  belowIdx?: number;
  /** Next line of a value that wraps onto several lines */
  wrapsIntoIdx?: number;
}

export type OcrLineRole = 'label' | 'value' | 'placeholder' | 'text';

export interface ResolvedOcrLine {
  role: OcrLineRole;
  pairedLabel?: string;
  sensitive: boolean;
  /** Lines of one value (wrapped or split pieces) share the index of its first line */
  group?: number;
  /**
   * A label and its value read as one line (`nama "Budi"` with the colon lost): words from this
   * index on are the value; `pairedLabel` and `sensitive` describe that value
   */
  inlineValueFromWord?: number;
}

// ---------------------------------------------------------------------------------------------
// Label vocabulary matching (tolerant of OCR misreads such as "Jabotan" or "Karyauan")
// ---------------------------------------------------------------------------------------------

export function normalizeLabelText(text: string): string {
  return text
    .toLowerCase()
    .replace(/\(\s*\*\s*\)/g, ' ')
    .replace(/[_\-/.:]+/g, ' ')
    .replace(/[^a-z0-9 ]+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function editDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const curr = [i];
    for (let j = 1; j <= b.length; j++) {
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = curr;
  }
  return prev[b.length];
}

// Characters OCR mixes up in small or monospace text: "karyawan_1d", "lokas1", "n0ma"
function foldConfusables(s: string): string {
  return s.replace(/[1l|]/g, 'i').replace(/0/g, 'o');
}

// Short tokens (id, nik, nip) must match exactly: one typo away from them is a different word
function tokensMatch(ocrToken: string, labelToken: string): boolean {
  const a = foldConfusables(ocrToken);
  const b = foldConfusables(labelToken);
  if (a === b) return true;
  return Math.min(a.length, b.length) >= 4 && editDistance(a, b) <= 1;
}

/**
 * True when the OCR text is the label, or (with `allowPrefix`) starts with it,
 * e.g. "Nama Atasan" starts with the label "Nama".
 */
export function matchesLabel(ocrText: string, label: string, allowPrefix: boolean): boolean {
  const ocrTokens = normalizeLabelText(ocrText).split(' ').filter(Boolean);
  const labelTokens = normalizeLabelText(label).split(' ').filter(Boolean);
  if (!ocrTokens.length || !labelTokens.length) return false;

  if (ocrTokens.length >= labelTokens.length && (allowPrefix || ocrTokens.length === labelTokens.length)) {
    if (labelTokens.every((t, i) => tokensMatch(ocrTokens[i], t))) return true;
  }

  // OCR sometimes drops or adds the space between words ("UnitKerja", "Uni tKerja")
  const ocrJoined = foldConfusables(ocrTokens.join(''));
  const labelJoined = foldConfusables(labelTokens.join(''));
  // One edit only: two would let "Data Karyawan" pass for "Nama Karyawan"
  if (labelJoined.length >= 6 && Math.abs(ocrJoined.length - labelJoined.length) <= 2) {
    return editDistance(ocrJoined, labelJoined) <= (labelJoined.length >= 14 ? 2 : 1);
  }
  return false;
}

export function matchesAnyLabel(ocrText: string, labels: string[], allowPrefix: boolean): boolean {
  return labels.some(label => matchesLabel(ocrText, label, allowPrefix));
}

function hasLabelSyntax(text: string): boolean {
  const t = text.trim();
  return /:\s*$/.test(t) || /\(\s*\*\s*\)/.test(t);
}

// ---------------------------------------------------------------------------------------------
// Pixel helpers
// ---------------------------------------------------------------------------------------------

function makeLuminance(px: Uint8ClampedArray, w: number, h: number) {
  return (x: number, y: number) => {
    const cx = Math.min(w - 1, Math.max(0, Math.round(x)));
    const cy = Math.min(h - 1, Math.max(0, Math.round(y)));
    const i = (cy * w + cx) * 4;
    return 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2];
  };
}

/**
 * Placeholder text (grey hint text in inputs) is drawn with much less contrast than real values.
 * Compares the darkest ink in the box with its background.
 */
function measureInk(
  lum: (x: number, y: number) => number,
  b: BBox
): { ink: number; background: number } | undefined {
  const values: number[] = [];
  const stepX = Math.max(1, Math.floor((b.x1 - b.x0) / 80));
  const stepY = Math.max(1, Math.floor((b.y1 - b.y0) / 20));
  for (let y = b.y0; y <= b.y1; y += stepY) {
    for (let x = b.x0; x <= b.x1; x += stepX) values.push(lum(x, y));
  }
  if (values.length < 8) return undefined;
  values.sort((a, c) => a - c);
  const ink = values[Math.floor(values.length * 0.04)];
  const background = values[Math.floor(values.length * 0.9)];
  // Light text on a dark surface is a different design language; don't guess there
  if (background < 200) return undefined;
  return { ink, background };
}

/**
 * Grow a box sideways to where its ink really ends. OCR boxes stop at the last letter it
 * recognised ("nforma" for "Informasi"), which would leave the rest of a value readable.
 * Stops at the first gap wider than a letter gap, and never grows more than a few characters.
 */
function extendToInk(
  lum: (x: number, y: number) => number,
  b: BBox,
  inkLevels: { ink: number; background: number },
  imgW: number
): BBox {
  const h = Math.max(6, b.y1 - b.y0);
  // Sensitive enough for the thin, anti-aliased strokes of small grey text ("…Divisi")
  const threshold = inkLevels.background - (inkLevels.background - inkLevels.ink) * 0.3;
  const hasInk = (x: number) => {
    for (let y = Math.ceil(b.y0); y <= Math.floor(b.y1); y++) if (lum(x, y) < threshold) return true;
    return false;
  };
  const maxGap = Math.max(3, Math.round(h * 0.7));
  const maxGrow = h * 4;

  let x1 = b.x1;
  for (let x = Math.ceil(b.x1), gap = 0; x < imgW && x <= b.x1 + maxGrow; x++) {
    if (hasInk(x)) {
      x1 = x + 1;
      gap = 0;
    } else if (++gap > maxGap) break;
  }
  let x0 = b.x0;
  for (let x = Math.floor(b.x0) - 1, gap = 0; x >= 0 && x >= b.x0 - maxGrow; x--) {
    if (hasInk(x)) {
      x0 = x;
      gap = 0;
    } else if (++gap > maxGap) break;
  }
  return { x0, y0: b.y0, x1, y1: b.y1 };
}

// Measured on a real form: placeholders 82-119, grey display values 121-129, labels 136+, typed values ~230.
// Grey display values and placeholders overlap in colour; placeholders are told apart by sitting in an input.
function isPlaceholderText(contrast: number | undefined, text: string, inInputBox: boolean): boolean {
  if (contrast === undefined) return false;
  return (
    contrast < 95 ||
    (inInputBox && contrast < 121) ||
    (contrast < 135 && PLACEHOLDER_PHRASE.test(text.trim()))
  );
}

/** Text sitting on a white surface between a top and bottom border (a form input). */
function measureInInputBox(lum: (x: number, y: number) => number, b: BBox, imgH: number): boolean {
  const cx = (b.x0 + b.x1) / 2;
  const maxSearch = Math.max(14, (b.y1 - b.y0) * 2.5);
  const findBorder = (from: number, dir: 1 | -1) => {
    for (let d = 2; d <= maxSearch; d++) {
      const y = from + dir * d;
      if (y < 0 || y >= imgH) return null;
      // Light grey borders count too: Tailwind's default border (#e5e7eb) is only ~24 below white
      let dark = 0;
      for (let dx = -18; dx <= 18; dx += 3) if (lum(cx + dx, y) < 243) dark++;
      if (dark >= 11) return y;
    }
    return null;
  };
  const top = findBorder(b.y0, -1);
  const bottom = findBorder(b.y1, 1);
  if (top === null || bottom === null) return false;
  return lum(b.x0 - 2, (b.y0 + b.y1) / 2) > 235 || lum(b.x1 + 2, (b.y0 + b.y1) / 2) > 235;
}

function measureOnColoredBanner(px: Uint8ClampedArray, w: number, h: number, b: BBox): boolean {
  let colored = 0;
  let total = 0;
  const stepX = Math.max(2, Math.floor((b.x1 - b.x0) / 8));
  for (let x = b.x0; x <= b.x1; x += stepX) {
    for (const y of [b.y0 - 3, b.y1 + 3]) {
      const cx = Math.min(w - 1, Math.max(0, Math.round(x)));
      const cy = Math.min(h - 1, Math.max(0, Math.round(y)));
      const i = (cy * w + cx) * 4;
      const r = px[i], g = px[i + 1], bl = px[i + 2];
      const l = 0.299 * r + 0.587 * g + 0.114 * bl;
      total++;
      if ((bl - r > 35 && l < 210) || Math.max(r, g, bl) - Math.min(r, g, bl) > 45 || l < 115) colored++;
    }
  }
  return total > 0 && colored / total >= 0.35;
}

/**
 * A panel edge or divider line between two boxes: a column (or row) that differs from its
 * neighbours along a span much taller (or wider) than the text itself. Text glyphs and
 * short input-box borders don't run that long.
 */
function hasVerticalSeparator(lum: (x: number, y: number) => number, a: BBox, b: BBox): boolean {
  const lineH = Math.max(a.y1 - a.y0, b.y1 - b.y0, 6);
  const yTop = Math.min(a.y0, b.y0) - lineH * 2;
  const yBottom = Math.max(a.y1, b.y1) + lineH * 2;
  for (let x = Math.ceil(a.x1) + 2; x <= Math.floor(b.x0) - 2; x++) {
    let edgeRows = 0;
    let rows = 0;
    for (let y = yTop; y <= yBottom; y++) {
      rows++;
      const c = lum(x, y);
      if (Math.abs(c - lum(x - 2, y)) >= 12 || Math.abs(c - lum(x + 2, y)) >= 12) edgeRows++;
    }
    if (rows > 0 && edgeRows / rows >= 0.92) return true;
  }
  return false;
}

function hasHorizontalSeparator(lum: (x: number, y: number) => number, above: BBox, below: BBox): boolean {
  const lineH = Math.max(above.y1 - above.y0, 6);
  const xLeft = Math.min(above.x0, below.x0) - lineH;
  const xRight = Math.max(above.x1, below.x1) + lineH;
  for (let y = Math.ceil(above.y1) + 2; y <= Math.floor(below.y0) - 2; y++) {
    let edgeCols = 0;
    let cols = 0;
    for (let x = xLeft; x <= xRight; x++) {
      cols++;
      const c = lum(x, y);
      if (Math.abs(c - lum(x, y - 2)) >= 12 || Math.abs(c - lum(x, y + 2)) >= 12) edgeCols++;
    }
    if (cols > 0 && edgeCols / cols >= 0.92) return true;
  }
  return false;
}

// ---------------------------------------------------------------------------------------------
// Scan-time analysis
// ---------------------------------------------------------------------------------------------

// Inside a photo of a person, OCR "text" is almost always folds, logos and stripes.
// Elsewhere low-confidence text is kept: a badly read value must still be redacted.
const MIN_PHOTO_LINE_CONFIDENCE = 80;
// A line must be read this confidently before it may act as a label for other text
const MIN_LABEL_CONFIDENCE = 45;

export function lineConfidence(line: RawOcrLineItem): number | undefined {
  const scores = (line.words || []).map(w => w.confidence).filter((c): c is number => typeof c === 'number');
  if (scores.length) return scores.reduce((s, c) => s + c, 0) / scores.length;
  return line.confidence;
}

/**
 * Remove "words" far taller than the rest of their line that OCR wasn't sure of: scrollbars,
 * icons or a half-hidden row read along with real text. Left in, they stretch the line's box
 * (and its redaction) over whatever sits next to it.
 */
function dropOutlierWords(line: RawOcrLineItem): RawOcrLineItem {
  const words = line.words || [];
  if (words.length < 3) return line;
  const heights = words.map(w => w.bbox.y1 - w.bbox.y0).sort((a, b) => a - b);
  const median = heights[Math.floor(heights.length / 2)];
  const kept = words.filter(w => w.bbox.y1 - w.bbox.y0 <= median * 1.8 || (w.confidence ?? 100) >= 70);
  if (kept.length === words.length || kept.length === 0) return line;
  return {
    ...line,
    text: kept.map(w => w.text).join(' '),
    words: kept,
    bbox: {
      x0: Math.min(...kept.map(w => w.bbox.x0)),
      y0: Math.min(...kept.map(w => w.bbox.y0)),
      x1: Math.max(...kept.map(w => w.bbox.x1)),
      y1: Math.max(...kept.map(w => w.bbox.y1))
    }
  };
}

/** The area a person occupies in a photo, from their detected face down to roughly the chest. */
function personRegions(faces: FaceBox[], imgW: number, imgH: number): BBox[] {
  return faces.map(f => {
    const fx = f.xRatio * imgW;
    const fy = f.yRatio * imgH;
    const fw = f.wRatio * imgW;
    const fh = f.hRatio * imgH;
    return { x0: fx - fw, y0: fy - fh * 0.3, x1: fx + fw * 2, y1: fy + fh * 3.5 };
  });
}

function iou(a: BBox, b: BBox): number {
  const ix = Math.max(0, Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0));
  const iy = Math.max(0, Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0));
  const inter = ix * iy;
  const union = (a.x1 - a.x0) * (a.y1 - a.y0) + (b.x1 - b.x0) * (b.y1 - b.y0) - inter;
  return union > 0 ? inter / union : 0;
}

/** How much of the smaller box lies inside the other (two passes reading one word as "nforma" / "nformasi"). */
function overlapOfSmaller(a: BBox, b: BBox): number {
  const ix = Math.max(0, Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0));
  const iy = Math.max(0, Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0));
  const smaller = Math.min((a.x1 - a.x0) * (a.y1 - a.y0), (b.x1 - b.x0) * (b.y1 - b.y0));
  return smaller > 0 ? (ix * iy) / smaller : 0;
}

/**
 * Measure layout facts for every OCR line: noise filtering, placeholders, input boxes, photos,
 * and each line's nearest neighbours (right / below) within the same panel.
 * Returns the cleaned lines sorted top-to-bottom; `layout` indexes refer to that array.
 */
export function analyzeOcrLayout(
  lines: RawOcrLineItem[],
  pixelData: Uint8ClampedArray | null,
  imgW: number,
  imgH: number,
  faces: FaceBox[] = []
): RawOcrLineItem[] {
  const persons = personRegions(faces, imgW, imgH);
  const insidePerson = (b: BBox) => {
    const cx = (b.x0 + b.x1) / 2;
    const cy = (b.y0 + b.y1) / 2;
    return persons.some(p => cx >= p.x0 && cx <= p.x1 && cy >= p.y0 && cy <= p.y1);
  };

  // 1. Drop OCR noise and duplicates produced by the two OCR passes
  const kept: RawOcrLineItem[] = [];
  for (const rawLine of lines) {
    if (!rawLine.bbox || !rawLine.text?.trim()) continue;
    const line = dropOutlierWords(rawLine);
    const conf = lineConfidence(line);
    if (insidePerson(line.bbox) && (conf === undefined || conf < MIN_PHOTO_LINE_CONFIDENCE)) continue;

    const norm = normalizeLabelText(line.text);
    const dupIdx = kept.findIndex(k => {
      const kNorm = normalizeLabelText(k.text);
      const sameText = kNorm === norm || kNorm.includes(norm) || norm.includes(kNorm);
      return sameText && (iou(k.bbox, line.bbox) > 0.5 || overlapOfSmaller(k.bbox, line.bbox) > 0.6);
    });
    if (dupIdx === -1) {
      kept.push(line);
    } else if (line.text.length > kept[dupIdx].text.length) {
      kept[dupIdx] = line;
    }
  }

  const sorted = kept.sort(
    (a, b) => (a.bbox.y0 + a.bbox.y1) / 2 - (b.bbox.y0 + b.bbox.y1) / 2 || a.bbox.x0 - b.bbox.x0
  );

  const lum = pixelData ? makeLuminance(pixelData, imgW, imgH) : null;
  const heightOf = (b: BBox) => Math.max(6, b.y1 - b.y0);

  // 2. Per-line facts measured from pixels
  const result = sorted.map(line => {
    // OCR sometimes returns a sliver of a box (2px for "Div"); widen it just for measuring the ink
    const pad = Math.max(4, (line.bbox.y1 - line.bbox.y0) / 2);
    const inkLevels = lum
      ? measureInk(lum, line.bbox) ?? measureInk(lum, { ...line.bbox, x0: line.bbox.x0 - pad, x1: line.bbox.x1 + pad })
      : undefined;
    const contrast = inkLevels ? inkLevels.background - inkLevels.ink : undefined;
    const inInputBox = lum ? measureInInputBox(lum, line.bbox, imgH) : false;
    return {
    ...line,
    layout: {
      isPlaceholder: isPlaceholderText(contrast, line.text, inInputBox),
      contrast,
      inkBox: lum && inkLevels && contrast! >= 40 ? extendToInk(lum, line.bbox, inkLevels, imgW) : undefined,
      inPhoto: insidePerson(line.bbox),
      inInputBox,
      onColoredBanner: pixelData ? measureOnColoredBanner(pixelData, imgW, imgH, line.bbox) : false
    } as OcrLineLayout
    };
  });

  // 3. Nearest neighbours, never across a panel edge or divider
  result.forEach((line, i) => {
    const b = line.bbox;
    const h = heightOf(b);
    const cy = (b.y0 + b.y1) / 2;

    let right: { idx: number; gap: number } | null = null;
    let below: { idx: number; gap: number; dx: number } | null = null;

    result.forEach((other, j) => {
      if (i === j) return;
      const o = other.bbox;
      const oh = heightOf(o);

      const sameRow = Math.abs((o.y0 + o.y1) / 2 - cy) <= Math.max(h, oh) * 0.6;
      const gapX = o.x0 - b.x1;
      if (sameRow && gapX >= -2 && gapX <= Math.max(h * 8, imgW * 0.3) && (!right || gapX < right.gap)) {
        right = { idx: j, gap: gapX };
      }

      const gapY = o.y0 - b.y1;
      const overlapX = Math.min(b.x1, o.x1) - Math.max(b.x0, o.x0);
      const dx = Math.abs(o.x0 - b.x0);
      const sameColumn = (overlapX > 0 || dx <= h * 2) && o.x0 >= b.x0 - h * 2;
      if (sameColumn && gapY >= -h * 0.3 && gapY <= h * 4) {
        // Nearest row first; within one row (quotes and capitals shift boxes a little), the best-aligned item
        const rowTolerance = h * 0.5;
        if (!below || gapY < below.gap - rowTolerance || (Math.abs(gapY - below.gap) <= rowTolerance && dx < below.dx)) {
          below = { idx: j, gap: gapY, dx };
        }
      }
    });

    const r = right as { idx: number; gap: number } | null;
    if (r && !(lum && hasVerticalSeparator(lum, b, result[r.idx].bbox))) {
      line.layout.rightIdx = r.idx;
      // Closer than a column gap (see the line splitting in extractLinesFromOcrData): the same
      // phrase, cut by OCR or by a symbol like " - " or "|"
      if (r.gap <= h * 2.2) line.layout.joinsRightIdx = r.idx;
    }
    const bl = below as { idx: number; gap: number; dx: number } | null;
    if (bl) {
      const target = result[bl.idx];
      // A form input's own top border sits between its label and value, so only other lines count
      const blocked = lum && !target.layout.inInputBox && hasHorizontalSeparator(lum, b, target.bbox);
      if (!blocked) {
        line.layout.belowIdx = bl.idx;
        if (bl.gap <= h * 1.1 && bl.dx <= h * 1.5) line.layout.wrapsIntoIdx = bl.idx;
      }
    }
  });

  return result;
}

// ---------------------------------------------------------------------------------------------
// Decision time: roles, pairing and sensitivity for the current rule set
// ---------------------------------------------------------------------------------------------

function cleanLabel(text: string): string {
  return text.replace(/\(\s*\*\s*\)/g, '').replace(/[:\s]+$/, '').trim();
}

/**
 * Decide which lines are labels, which are their values, and which values are sensitive.
 * Cheap and pixel-free, so it re-runs whenever the rules or the sensitive label list change.
 */
export function resolveOcrFieldRoles(lines: RawOcrLineItem[], sensitiveLabels: string[]): ResolvedOcrLine[] {
  const vocabulary = [...sensitiveLabels, ...GENERAL_FORM_LABELS];
  const tokenCount = (t: string) => normalizeLabelText(t).split(' ').filter(Boolean).length;

  const isLabel = lines.map(line => {
    const layout = line.layout;
    if (layout?.isPlaceholder || layout?.onColoredBanner || isUiChrome(line.text)) return false;
    if (line.fieldType === 'label' || hasLabelSyntax(line.text)) return true;
    const conf = lineConfidence(line);
    if (conf !== undefined && conf < MIN_LABEL_CONFIDENCE) return false;
    return tokenCount(line.text) <= 6 && matchesAnyLabel(line.text, vocabulary, true);
  });

  // A "label" only because OCR saw a colon after an unknown word may really be part of a wrapped
  // value ("Informasi - Bagian…" read as "nformasi : Bagian…")
  const isWeakLabel = lines.map(
    (line, i) => isLabel[i] && !matchesAnyLabel(line.text, vocabulary, true)
  );

  const resolved: ResolvedOcrLine[] = lines.map((line, i) => ({
    role: isLabel[i] ? 'label' : line.layout?.isPlaceholder ? 'placeholder' : 'text',
    sensitive: false
  }));

  // Text with its own label right before it on the same row ("posisi: Staf") starts a new
  // value; it is never the wrapped continuation of the value on the row above
  const hasOwnLabel = lines.map(() => false);
  lines.forEach((line, i) => {
    const r = line.layout?.rightIdx;
    if (isLabel[i] && r !== undefined) hasOwnLabel[r] = true;
  });

  const assignValue = (idx: number, labelText: string, labelIdx?: number) => {
    const current = resolved[idx];
    if (isLabel[idx] || current.role === 'placeholder' || current.role === 'value') return;
    if (isUiChrome(lines[idx].text)) return;
    const sensitive = matchesAnyLabel(labelText, sensitiveLabels, true);
    const pairedLabel = cleanLabel(labelText);
    const claim = (i: number) => {
      resolved[i] = { role: 'value', pairedLabel, sensitive, group: idx };
    };
    // Continuation of a value: free text, or a weak label (then its own "value" comes along).
    // It must look like the same text: not much taller (a button, icon or scrollbar next to the
    // value) and read with some confidence. Smaller is fine: OCR sometimes returns sliver boxes.
    const valueHeight = Math.max(6, lines[idx].bbox.y1 - lines[idx].bbox.y0);
    const looksLikeSameText = (i: number) => {
      const conf = lineConfidence(lines[i]);
      return lines[i].bbox.y1 - lines[i].bbox.y0 <= valueHeight * 1.8 && (conf === undefined || conf >= 40);
    };
    const isFree = (i: number | undefined): i is number =>
      i !== undefined &&
      !isUiChrome(lines[i].text) &&
      looksLikeSameText(i) &&
      ((!isLabel[i] && resolved[i].role === 'text') || (isWeakLabel[i] && resolved[i].role === 'label'));
    const claimWithColonValues = (i: number) => {
      claim(i);
      if (!isWeakLabel[i]) return;
      const key = cleanLabel(lines[i].text);
      const rowY = (lines[i].bbox.y0 + lines[i].bbox.y1) / 2;
      const rowH = Math.max(6, lines[i].bbox.y1 - lines[i].bbox.y0);
      lines.forEach((other, j) => {
        const sameRow = Math.abs((other.bbox.y0 + other.bbox.y1) / 2 - rowY) <= rowH;
        if (sameRow && other.fieldType === 'input_value' && cleanLabel(other.pairedLabel || '') === key) claim(j);
      });
    };
    // Pieces of the same phrase on this row (OCR or a symbol split it)
    const claimRow = (start: number) => {
      let next = lines[start].layout?.joinsRightIdx;
      for (let guard = 0; isFree(next) && guard < 6; guard++) {
        claimWithColonValues(next);
        next = lines[next].layout?.joinsRightIdx;
      }
    };

    // Every piece of a wrapped row that sits within the column of the value line above it.
    // Spacing can't be trusted here: justified text stretches the gaps between words.
    const claimWrappedRow = (rowStart: number, columnOf: number) => {
      const col = lines[columnOf].bbox;
      const row = lines[rowStart].bbox;
      const h = Math.max(6, row.y1 - row.y0);
      const rowY = (row.y0 + row.y1) / 2;
      lines.forEach((other, j) => {
        const o = other.bbox;
        const sameRow = Math.abs((o.y0 + o.y1) / 2 - rowY) <= h;
        if (sameRow && o.x0 >= col.x0 - h && o.x1 <= col.x1 + h * 3 && isFree(j) && !hasOwnLabel[j]) {
          claimWithColonValues(j);
        }
      });
    };

    // The rest of the value's first row: justified text stretches the gaps, so follow the row's
    // neighbours (they never cross a panel edge) up to where the next column's label starts
    const nextColumnLabel = labelIdx !== undefined ? lines[labelIdx].layout?.rightIdx : undefined;
    const columnEndX =
      nextColumnLabel !== undefined && nextColumnLabel !== idx && isLabel[nextColumnLabel]
        ? lines[nextColumnLabel].bbox.x0
        : Infinity;
    const claimFirstRow = () => {
      let next = lines[idx].layout?.rightIdx;
      for (let guard = 0; isFree(next) && !hasOwnLabel[next] && lines[next].bbox.x0 < columnEndX && guard < 8; guard++) {
        claimWithColonValues(next);
        next = lines[next].layout?.rightIdx;
      }
    };

    claim(idx);
    claimRow(idx);
    claimFirstRow();
    // A value that wraps onto the next lines belongs to the same label
    let above = idx;
    let below = lines[idx].layout?.wrapsIntoIdx;
    for (let guard = 0; isFree(below) && !hasOwnLabel[below] && guard < 4; guard++) {
      claimWithColonValues(below);
      claimRow(below);
      claimWrappedRow(below, above);
      above = below;
      below = lines[below].layout?.wrapsIntoIdx;
    }
  };

  // 1. "label: value" written on one line (forms, JSON in DevTools) is the most reliable pairing
  lines.forEach((line, i) => {
    if (line.fieldType === 'input_value' && line.pairedLabel && !line.layout?.isPlaceholder) {
      assignValue(i, line.pairedLabel);
    }
  });

  // 2. Otherwise the value sits right of its label, or directly under it
  lines.forEach((line, i) => {
    // A weak label already absorbed into a wrapped value has no value of its own
    if (!isLabel[i] || resolved[i].role === 'value') return;
    const hasColonValue = lines.some(
      (other, j) => j !== i && other.fieldType === 'input_value' && other.pairedLabel &&
        cleanLabel(other.pairedLabel) === cleanLabel(line.text) && resolved[j].role === 'value'
    );
    if (hasColonValue) return;

    const { rightIdx, belowIdx } = line.layout || ({} as OcrLineLayout);
    if (rightIdx !== undefined && !isLabel[rightIdx]) {
      assignValue(rightIdx, line.text, i);
    } else if (belowIdx !== undefined && !isLabel[belowIdx]) {
      assignValue(belowIdx, line.text, i);
    }
  });

  // 3. Unlabelled text inside a form input is still an input value, just not a known-sensitive one
  lines.forEach((line, i) => {
    if (resolved[i].role === 'text' && line.layout?.inInputBox && !line.layout.inPhoto && !isUiChrome(line.text)) {
      resolved[i] = { role: 'value', sensitive: false, group: i };
    }
  });

  // 4. A sensitive key and its value read as one line because OCR lost the colon
  //    (`nama: "Budi Santoso"` in small monospace JSON). Split it where the key ends.
  lines.forEach((line, i) => {
    if (resolved[i].sensitive || line.layout?.isPlaceholder || isUiChrome(line.text)) return;
    const k = findInlineKeyEnd(line, sensitiveLabels);
    if (k === undefined) return;
    const key = line.words.slice(0, k).map(w => w.text).join(' ');
    resolved[i] = { role: 'label', pairedLabel: cleanLabel(key.replace(/[:;=.,"'“”]+$/, '')), sensitive: true, inlineValueFromWord: k };
  });

  return resolved;
}

/**
 * Index of the first value word when a line starts with a sensitive key followed by its value,
 * with visible evidence of the boundary: a colon-like mark after the key, an opening quote before
 * the value, or a gap wider than a space. Without such evidence "Nama Atasan" stays one label.
 */
function findInlineKeyEnd(line: RawOcrLineItem, sensitiveLabels: string[]): number | undefined {
  const words = line.words || [];
  for (let k = words.length - 1; k >= 1; k--) {
    const key = words.slice(0, k).map(w => w.text).join(' ');
    if (!matchesAnyLabel(key, sensitiveLabels, false)) continue;
    const last = words[k - 1];
    const next = words[k];
    const h = Math.max(6, last.bbox.y1 - last.bbox.y0);
    const boundary =
      /[:;=.,]["'“”]?$/.test(last.text) || /^["'“”]/.test(next.text) || next.bbox.x0 - last.bbox.x1 >= h * 1.2;
    if (boundary) return k;
  }
  return undefined;
}

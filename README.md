# LTP-ToolKitz (ian's Toolkit v2.1)

> **High-Performance Productivity Suite for PDF, JSON & Other Utilities**  
> 100% Client-Side · Privacy-First · Zero Server Uploads · Fast & Offline-Ready

[![Version](https://img.shields.io/badge/version-2.1.0-blue.svg)](package.json)
[![React](https://img.shields.io/badge/React-18.2-61dafb.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646cff.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4.2-38bdf8.svg)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 🌟 Overview

**LTP-ToolKitz** is an all-in-one browser toolkit crafted for software engineers, QA automation professionals, data analysts, and technical leads. All operations (parsing, rendering, converting, and schema validation) execute directly within your browser session using Web APIs and WebAssembly. Your documents and data **never leave your computer**.

---

## 🚀 Key Modules & Features

### 📄 PDF Utilities
- **PDF Sign & Table Placer (`/pdf-table-placer`)**
  - Interactive multi-page PDF canvas with high-fidelity rendering (`pdfjs-dist`).
  - Customizable grid coordinates, row/column layouts, and automated table placement.
  - Draw, smooth, and stamp electronic signatures directly onto document pages.
  - Client-side document re-compilation and instant download via `pdf-lib`.

- **PDF Merge (`/pdf-merge`)**
  - Drag-and-drop multiple PDF files simultaneously.
  - Visual page thumbnail previews with drag-and-drop reordering.
  - Custom page ranges, individual page rotation (90°/180°/270°), and selective extraction.
  - Combine multiple documents into a single consolidated PDF in seconds.

- **PDF Sensitive Data Redactor (`/pdf-redactor`)** *(New in v2.1)*
  - **Automated PII & Network Sanitization**: Built-in detection rules for Email Addresses, Phone Numbers, Credit Cards/Bank Accounts, Identity/SSN/NIK, Currency & Balances, **IPv4 Addresses & Ports** (e.g., `10.0.0.1:1315`), and **URLs & Server Endpoints**.
  - **Automated In-Image OCR Redaction & Full-Resolution Image Sanitization**:
    - **Native Full-Resolution Uncropped Image Extraction**: Automatically extracts the original full-resolution uncropped image from linked external attachment URLs (via `/api/proxy-image`), raw PDF `/XObject` & `/Pattern` (`TilingPattern`) streams (`DCTDecode` JPEG and `FlateDecode` RGB/RGBA with PNG predictor unfiltering), or unclipped high-DPI sub-viewports so portrait/landscape screenshots are never cropped into small squares.
    - **Dual-Pass High-Sensitivity OCR (`tesseract.js`)**: Runs a persistent singleton OCR worker across two passes:
      1. **Pass 1 (`PSM 6 - Uniform Block`)**: Captures multi-word lines, titles, and form labels on the original image.
      2. **Pass 2 (`PSM 11 - Sparse Text` on Border-Erased Copy)**: Automatically erases horizontal/vertical form input box borders and dropdown chevrons on an offscreen working canvas so isolated single words and numbers inside bordered inputs (`LAGOA`, `14270`, `Buruh`, `Diploma 3`) are reliably detected.
    - **Smart Form Label vs. Input Value Classifier**: Inspects pixel luminance, color saturation, and form syntax (`(*)`, colons, vertical pairing) to differentiate between:
      - **`Input Value` (Auto-Redacted)**: Values inside white/light bordered form inputs or paired directly beneath a form label are **automatically redacted** upon scan completion.
      - **`Form Label` & `Header / Banner` (Readable)**: Form field labels (`Nama Nasabah (*)`, `Kelurahan (*)`) and colored/blue banner headers (`Form Uji Kelayakan`, `Detail Informasi Prospek`) remain readable so document context is preserved.
      - **Regex Rule Matching**: Evaluates active Regex Rules against OCR text lines (and pairs matched Form Labels with their corresponding Input Value beneath them), with full-coverage vertical and horizontal padding (`computeFullCoverageBox`) and 1-click **Redact Inputs Only** / manual click-and-drag box controls in the popup modal.
    - **External Link Sanitization (`Method C`) & Clickable Local Full-Size View (`Option 2`)**: Automatically strips external server `/URI` link annotations (e.g., CloudFront/S3 links) from embedded images and embeds the sanitized full-resolution image as a local attachment page inside the exported PDF with internal `/GoTo` navigation (`<- Back to Page X`).
    - Interactive **Draw Image / Area Blackout** mode to click-and-drag custom redaction rectangles over any visual element on the PDF page.
  - **Quick Custom Regex Rule from PDF Selection**: Highlight any sample text directly on the PDF preview canvas to open the floating **"Pick one that you want."** multi-tier visual pattern picker, then click **OK** to add it directly to your active detection rules.
  - **3-Tab Compact Inspector & Direct Page Jump**:
    - Dedicated **Regex Rules**, **Audit Matches** (with All Pages / Current Page scope filter and search), and **Redact Style** tabs.
    - Editable pagination input (`[ 1 ] / N`) — type a page number and press <kbd>Enter</kbd> to jump directly to any page.
  - **Flexible Replacement Styles**: Export redacted PDFs using customizable **Text Badges** (e.g., `[CONFIDENTIAL]` in Dark Slate, Red Tint, White, or Black themes), **Solid Blackout**, or **Whiteout**.

---

### 🧩 JSON Utilities
- **JSON Formatter & Validator (`/json-formatter`)**
  - **Full & Selection Beautify**: Format entire payloads or highlight a specific sub-block to beautify in-place without altering the surrounding structure.
  - **Minify / Compact**: Strip whitespace for production payloads or network transmission.
  - **Auto-Repair**: Intelligently fix broken JSON (missing quotes, trailing commas, unquoted keys, single quotes) via `jsonrepair`.
  - **JSON Schema Validation**: Real-time schema validation powered by `Ajv` and `ajv-formats` supporting **Draft-07**, **Draft-2019-09**, and **Draft-2020-12**.
  - **Undo & Redo History**: Full <kbd>Ctrl+Z</kbd> / <kbd>Cmd+Z</kbd> and <kbd>Ctrl+Y</kbd> history stack to recover cleared or accidentally deleted payloads instantly.

- **JSON Schema Builder (`/json-schema-builder`)**
  - Convert arbitrary JSON data into a structured JSON Schema tree automatically.
  - Configure data types, required constraints, field descriptions, and titles.
  - Automated enum extraction from array items.
  - One-click copy and `.json` schema export.

- **JSON Compare (`/json-compare`)**
  - Side-by-side split and unified visual diff viewer.
  - Semantic difference detection for keys, values, and array order modifications.
  - Detailed change summary metrics (additions, deletions, modifications).

---

### 🛠️ Other Utilities
- **Data Compare & Multi-Diff (`/data-compare`)** *(New in v2.1)*
  - **Code & Automation Scripts**: Side-by-side and unified diffing with syntax support for **Groovy (Katalon Studio test scripts & custom keywords)**, **SQL (DDL schemas & migrations)**, **JavaScript/TypeScript**, **Python**, **Java**, **JSON**, **XML/HTML**, and **Bash**.
  - **Excel & CSV Spreadsheets**: Cell-level and row-level visual comparison (`.xlsx`, `.xls`, `.csv`) with optional primary-key matching and change counters (Added, Removed, Modified, Unchanged rows).
  - **PDF Document Revisions**: Extracts and compares text across multi-page PDF document revisions (`pdfjs-dist`).
  - **Text & Paragraphs**: Prose, requirements, and release note comparison with ignore-whitespace, ignore-case, word-wrap toggles, pre-loaded sample placeholders, and one-click **Copy Summary Report** for PRs or QA test evidence.

- **Regex Live Tester & Builder (`/regex-live-tester`)** *(New in v2.1)*
  - **Real-Time Live Tester**: Instant regular expression evaluation with yellow inline match highlighting, group capture inspection, and ReDoS loop protection.
  - **Interactive Multi-Tier Pattern Builder**: Paste any log line, URL, or string to inspect stacked visual pattern tiers under each character (ISO timestamps, dates, IPv4 + Port, Web URLs, numbers, words, symbols) and click to synthesize regex rules automatically.
  - **Substitution & Multi-Language Code Generator**: Live search-and-replace preview (`$&`, `$1`) and ready-to-copy regex snippets for **Katalon / Groovy**, **JavaScript / TypeScript**, **Python**, **Java**, **Go**, **C#**, and **PHP**.
  - **Preset Library & Cheatsheet**: Curated starter templates and interactive quick-insert regex tokens.

- **Base64 Encoder / Decoder (`/base64-converter`)**
  - **Text & Code Strings**: Instant bi-directional encoding and decoding between plain text, UTF-8 strings, and Base64.
  - **Images & Documents (PDF, Word, Excel)**:
    - **File $\to$ Base64**: Upload or drag-and-drop images (PNG, JPG, SVG, WebP, GIF) or documents (PDF, Word `.docx`, Excel `.xlsx`, text) to generate Base64 with live previews. Output as Data URI, raw Base64, HTML `<img>`, CSS `background-image`, or Markdown.
    - **Base64 $\to$ File**: Paste raw Base64 or Data URIs; automatically reconstructs binary files using magic-byte auto-detection (%PDF, PNG, JPEG, GIF, WebP, SVG, Office ZIP). Features live image and PDF viewer previews and instant file download.
  - **URL-Safe Base64**: Full RFC 4648 §5 compliance (`+` $\to$ `-`, `/` $\to$ `_`, optional unpadded).
  - **UTF-8 Safe**: Native `TextEncoder`/`TextDecoder` pipeline handles complex Unicode, accents, and emojis without standard `btoa`/`atob` byte errors.
  - **Tester Presets & Tools**: Built-in HTTP Basic Auth header generator (`username:password` $\to$ `Authorization: Basic <base64>`), JSON auto-detection and format utility, sample files, and instant file download.
  - **Undo / Redo History**: Full <kbd>Ctrl+Z</kbd> / <kbd>Cmd+Z</kbd> history tracking and auto-sanitize repair for malformed Base64 streams.

- **Document Converter (`/document-converter`)**
  - In-browser file conversion between **PDF**, **Word (`.docx`)**, **Excel (`.xlsx`)**, and text.
  - Retains structure, sheet layouts, and text formatting without relying on third-party backend conversion APIs.

- **Pipeline (Coming Soon)**:
  - CSV to JSON transformer
  - UUID & cryptographic hash generator

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | [React 18](https://react.dev/) · [TypeScript 5](https://www.typescriptlang.org/) |
| **Build & Dev Server** | [Vite 5](https://vitejs.dev/) with Dynamic Code-Splitting (`React.lazy` & `Suspense`) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) · [Lucide React Icons](https://lucide.dev/) |
| **PDF & OCR Engine** | `pdf-lib` · `pdfjs-dist` · `tesseract.js` (Dual-Pass OCR) · `jspdf` · `jspdf-autotable` |
| **JSON & Schema** | `ajv` (v8) · `ajv-formats` · `jsonrepair` · `react-diff-viewer-continued` |
| **Office Formats** | `xlsx` (SheetJS) · `docx` · `mammoth` |
| **Hosting & CI/CD** | GitHub Pages (`gh-pages`) |

---

## 📦 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (version `18.x` or higher recommended)
- `npm` (version `9.x` or higher)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ianone93/LTP-ToolKitz.git
   cd LTP-ToolKitz
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the local development server**:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:3000` (or `http://localhost:5173`).

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Vite development server with HMR enabled. |
| `npm run build` | Compiles TypeScript and creates an optimized production bundle. |
| `npm run lint` | Runs TypeScript compiler checks (`tsc`) across the codebase. |
| `npm run predeploy` | Builds production assets configured with the GitHub Pages base path (`/LTP-ToolKitz/`). |
| `npm run deploy` | Deploys the built `dist` folder directly to the `gh-pages` branch. |
| `npm run preview` | Locally previews the production build output. |

---

## 🚢 Deploying to GitHub Pages

To deploy updates to your live GitHub Pages environment:

```bash
# 1. Ensure working directory is clean and dependencies are up to date
npm install

# 2. Run the deployment pipeline (runs predeploy then pushes to gh-pages)
npm run deploy
```

---

## 🔒 Privacy & Security

- **Zero Cloud Storage**: Files uploaded to any tool in LTP-ToolKitz are processed entirely in browser memory.
- **No Telemetry / Tracking**: No tracking cookies, third-party analytics, or data-collection beacons.
- **Client-Side Isolated**: Works completely offline once the PWA/browser assets are cached.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Binary,
  Copy,
  Check,
  Trash2,
  Download,
  Upload,
  ArrowLeftRight,
  AlertCircle,
  CheckCircle2,
  Code,
  Key,
  FileCode,
  Undo2,
  Redo2,
  Sparkles,
  Image as ImageIcon,
  FileText,
  FileSpreadsheet,
  File,
  Eye,
  ExternalLink,
  Layers,
  FileType
} from 'lucide-react';
import PdfCanvasViewer from '../components/Base64Converter/PdfCanvasViewer';

type MainTab = 'text' | 'file';
type TextMode = 'encode' | 'decode';
type FileDirection = 'file-to-base64' | 'base64-to-file';
type LineWrap = 'none' | '64' | '76';
type FileOutputFormat = 'data-uri' | 'raw-base64' | 'html-img' | 'css-bg' | 'markdown';

interface TextPresetItem {
  id: string;
  name: string;
  category: string;
  input: string;
  mode: TextMode;
}

const TEXT_PRESETS: TextPresetItem[] = [
  {
    id: 'basic-auth',
    name: 'Basic Auth Credentials',
    category: 'API Testing',
    input: 'admin_tester:SecureP@ssw0rd!2026',
    mode: 'encode'
  },
  {
    id: 'json-payload',
    name: 'JSON API Payload',
    category: 'API Testing',
    input: JSON.stringify({ user_id: 'usr_88291', role: 'qa_lead', env: 'staging', active: true }, null, 2),
    mode: 'encode'
  },
  {
    id: 'unicode-emojis',
    name: 'Multilingual & Emojis',
    category: 'UTF-8 Testing',
    input: 'Hello world! 🚀 測試 • Тест • مرحبا • ☕ (UTF-8 Verified)',
    mode: 'encode'
  },
  {
    id: 'jwt-sample',
    name: 'Decodable Base64 String',
    category: 'Decoding',
    input: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IklhbiBMYXR1cGVpcmlzc2EiLCJpYXQiOjE1MTYyMzkwMjJ9',
    mode: 'decode'
  },
  {
    id: 'url-safe-sample',
    name: 'URL-Safe Base64 String',
    category: 'Decoding',
    input: 'dGVzdC11cmwtc2FmZS1zdHJpbmdfMTIzNDU2Nzg5MA',
    mode: 'decode'
  }
];

// Sample minimal valid PDF base64
const SAMPLE_PDF_BASE64 = 
  'JVBERi0xLjQKMSAwIG9iajw8L1R5cGUvQ2F0YWxvZy9QYWdlcyAyIDAgUj4+ZW5kb2JqCjIgMCBvYmo8PC9UeXBlL1BhZ2VzL0tpZHNbMyAwIFJdL0NvdW50IDE+PmVuZG9iagozIDAgb2JqPDwvVHlwZS9QYWdlL01lZGlhQm94WzAgMCA2MTIgNzkyXS9QYXJlbnQgMiAwIFIvUmVzb3VyY2VzPDw+Pj4+ZW5kb2JqCnhyZWYKMCA0CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAwOSAwMDAwMCBuIAowMDAwMDAwMDU2IDAwMDAwIG4gCjAwMDAwMDAxMTEgMDAwMDAgbiAKdHJhaWxlcjw8L1NpemUgNC9Sb290IDEgMCBSPj4Kc3RhcnR4cmVmCjE5MAolJUVPRg==';

// Sample minimal PNG icon (a 16x16 teal test square)
const SAMPLE_PNG_BASE64 = 
  'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAiSURBVDhPY2AYBeMAMCLh/3+G////MzAwMDEwwmhqGBiGAAAc4y5b5i20vQAAAABJRU5ErkJggg==';

// Sample minimal SVG icon
const SAMPLE_SVG_BASE64 = 
  'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMwNTk2NjkiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cG9seWdvbiBwb2ludHM9IjEyIDIgMiA3IDEyIDEyIDIyIDcgMTIgMiIvPjwvc3ZnPg==';

// UTF-8 Safe Text Base64 Encoder
export function utf8ToBase64(str: string, urlSafe = false, lineWrap: LineWrap = 'none'): string {
  if (!str) return '';
  const utf8Bytes = new TextEncoder().encode(str);
  let binary = '';
  const len = utf8Bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(utf8Bytes[i]);
  }
  let base64 = btoa(binary);

  if (urlSafe) {
    base64 = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  if (lineWrap !== 'none') {
    const wrapLen = lineWrap === '64' ? 64 : 76;
    const regex = new RegExp(`.{1,${wrapLen}}`, 'g');
    const chunks = base64.match(regex);
    return chunks ? chunks.join('\n') : base64;
  }

  return base64;
}

// UTF-8 Safe Text Base64 Decoder
export function base64ToUtf8(base64Str: string): { text: string; error?: string } {
  if (!base64Str || !base64Str.trim()) return { text: '' };

  try {
    let clean = base64Str.replace(/\s+/g, '');
    clean = clean.replace(/-/g, '+').replace(/_/g, '/');
    while (clean.length % 4 !== 0) {
      clean += '=';
    }

    const binary = atob(clean);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    const text = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
    return { text };
  } catch (err: any) {
    return {
      text: '',
      error: err.message || 'Invalid Base64 sequence or malformed byte stream'
    };
  }
}

// Format file size nicely
function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Magic bytes auto-detection for decoded binary files
interface DetectedFileType {
  mime: string;
  ext: string;
  label: string;
  category: 'image' | 'pdf' | 'office' | 'other';
}

function detectFileTypeFromBytes(bytes: Uint8Array, fallbackMime = ''): DetectedFileType {
  if (bytes.length >= 4) {
    // PDF: %PDF (0x25, 0x50, 0x44, 0x46)
    if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
      return { mime: 'application/pdf', ext: 'pdf', label: 'PDF Document', category: 'pdf' };
    }

    // PNG: \x89PNG (0x89, 0x50, 0x4E, 0x47)
    if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
      return { mime: 'image/png', ext: 'png', label: 'PNG Image', category: 'image' };
    }

    // JPEG: \xFF\xD8\xFF
    if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
      return { mime: 'image/jpeg', ext: 'jpg', label: 'JPEG Image', category: 'image' };
    }

    // GIF: GIF8
    if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) {
      return { mime: 'image/gif', ext: 'gif', label: 'GIF Image', category: 'image' };
    }

    // WebP: RIFF....WEBP
    if (
      bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
      bytes.length >= 12 && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
    ) {
      return { mime: 'image/webp', ext: 'webp', label: 'WebP Image', category: 'image' };
    }

    // ZIP / Office OpenXML: PK\x03\x04
    if (bytes[0] === 0x50 && bytes[1] === 0x4B && bytes[2] === 0x03 && bytes[3] === 0x04) {
      // Check fallback mime or default to Office docx
      if (fallbackMime.includes('spreadsheet') || fallbackMime.includes('excel')) {
        return { mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', ext: 'xlsx', label: 'Excel Spreadsheet', category: 'office' };
      }
      return { mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', ext: 'docx', label: 'Word Document', category: 'office' };
    }
  }

  // Check for SVG: text starts with <svg or <?xml
  if (bytes.length > 5) {
    const headerStr = new TextDecoder('utf-8', { fatal: false }).decode(bytes.slice(0, 100)).toLowerCase();
    if (headerStr.includes('<svg')) {
      return { mime: 'image/svg+xml', ext: 'svg', label: 'SVG Vector Image', category: 'image' };
    }
  }

  if (fallbackMime) {
    if (fallbackMime.startsWith('image/')) {
      const ext = fallbackMime.split('/')[1]?.split('+')[0] || 'img';
      return { mime: fallbackMime, ext, label: `${ext.toUpperCase()} Image`, category: 'image' };
    }
    if (fallbackMime.includes('pdf')) {
      return { mime: 'application/pdf', ext: 'pdf', label: 'PDF Document', category: 'pdf' };
    }
    if (fallbackMime.includes('sheet') || fallbackMime.includes('excel')) {
      return { mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', ext: 'xlsx', label: 'Excel Spreadsheet', category: 'office' };
    }
    if (fallbackMime.includes('word') || fallbackMime.includes('document')) {
      return { mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', ext: 'docx', label: 'Word Document', category: 'office' };
    }
  }

  return { mime: 'application/octet-stream', ext: 'bin', label: 'Binary File', category: 'other' };
}

interface DecodedFileSuccess {
  bytes: Uint8Array;
  blob: Blob;
  objectUrl: string;
  size: number;
  detected: DetectedFileType;
  effectiveMime: string;
  effectiveExt: string;
  error?: undefined;
}

interface DecodedFileFailure {
  error: string;
  bytes?: undefined;
  blob?: undefined;
  objectUrl?: undefined;
  size?: undefined;
  detected?: undefined;
  effectiveMime?: undefined;
  effectiveExt?: undefined;
}

type DecodedFileState = DecodedFileSuccess | DecodedFileFailure | null;

function isDecodedSuccess(state: DecodedFileState): state is DecodedFileSuccess {
  return state !== null && !state.error && typeof state.objectUrl === 'string';
}

const Base64Converter: React.FC = () => {
  // Navigation tabs
  const [mainTab, setMainTab] = useState<MainTab>('text');

  // Notification Toast
  const [notice, setNotice] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const showNotice = (message: string, type: 'success' | 'error' = 'success') => {
    setNotice({ message, type });
    setTimeout(() => {
      setNotice((prev) => (prev?.message === message ? null : prev));
    }, 2800);
  };

  // ==========================================
  // TAB 1: TEXT & STRINGS STATE
  // ==========================================
  const [textMode, setTextMode] = useState<TextMode>('encode');
  const [inputText, setInputText] = useState<string>('Hello from LTP-ToolKitz! 🚀 Base64 ready.');
  const [outputText, setOutputText] = useState<string>('');
  const [decodeError, setDecodeError] = useState<string | null>(null);

  // Settings
  const [urlSafe, setUrlSafe] = useState<boolean>(false);
  const [lineWrap, setLineWrap] = useState<LineWrap>('none');
  const [copiedText, setCopiedText] = useState<boolean>(false);

  // Basic Auth helper state
  const [showBasicAuthModal, setShowBasicAuthModal] = useState<boolean>(false);
  const [authUsername, setAuthUsername] = useState<string>('admin');
  const [authPassword, setAuthPassword] = useState<string>('');
  const [copiedAuth, setCopiedAuth] = useState<boolean>(false);

  // Undo / Redo history for text
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const undoStackRef = useRef<string[]>([]);
  const redoStackRef = useRef<string[]>([]);
  const inputRef = useRef<string>(inputText);
  inputRef.current = inputText;

  const pushUndo = (snapshot: string) => {
    const last = undoStackRef.current[undoStackRef.current.length - 1];
    if (last === snapshot) return;
    undoStackRef.current = [...undoStackRef.current.slice(-49), snapshot];
    redoStackRef.current = [];
    setUndoStack([...undoStackRef.current]);
    setRedoStack([]);
  };

  const handleUndo = () => {
    if (undoStackRef.current.length === 0) return;
    const prev = undoStackRef.current[undoStackRef.current.length - 1];
    const newUndo = undoStackRef.current.slice(0, -1);
    undoStackRef.current = newUndo;
    redoStackRef.current = [...redoStackRef.current, inputRef.current];
    setUndoStack([...newUndo]);
    setRedoStack([...redoStackRef.current]);
    setInputText(prev);
    showNotice('Undone (Ctrl+Z)', 'success');
  };

  const handleRedo = () => {
    if (redoStackRef.current.length === 0) return;
    const next = redoStackRef.current[redoStackRef.current.length - 1];
    const newRedo = redoStackRef.current.slice(0, -1);
    redoStackRef.current = newRedo;
    undoStackRef.current = [...undoStackRef.current, inputRef.current];
    setRedoStack([...newRedo]);
    setUndoStack([...undoStackRef.current]);
    setInputText(next);
    showNotice('Redone (Ctrl+Y)', 'success');
  };

  // Keyboard shortcut listener for Ctrl+Z / Ctrl+Y
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (mainTab !== 'text') return;
      const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const isUndo = (isMac ? e.metaKey : e.ctrlKey) && e.key.toLowerCase() === 'z' && !e.shiftKey;
      const isRedo =
        ((isMac ? e.metaKey : e.ctrlKey) && e.key.toLowerCase() === 'y') ||
        ((isMac ? e.metaKey : e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'z');

      if (isUndo && undoStackRef.current.length > 0) {
        e.preventDefault();
        handleUndo();
      } else if (isRedo && redoStackRef.current.length > 0) {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mainTab]);

  // Compute text conversion
  useEffect(() => {
    if (!inputText) {
      setOutputText('');
      setDecodeError(null);
      return;
    }

    if (textMode === 'encode') {
      try {
        const encoded = utf8ToBase64(inputText, urlSafe, lineWrap);
        setOutputText(encoded);
        setDecodeError(null);
      } catch (err: any) {
        setDecodeError(err.message || 'Error encoding text');
      }
    } else {
      const result = base64ToUtf8(inputText);
      if (result.error) {
        setDecodeError(result.error);
        setOutputText('');
      } else {
        setOutputText(result.text);
        setDecodeError(null);
      }
    }
  }, [inputText, textMode, urlSafe, lineWrap]);

  const handleInputChange = (newVal: string) => {
    pushUndo(inputText);
    setInputText(newVal);
  };

  const handleSwapText = () => {
    if (!outputText && !inputText) return;
    pushUndo(inputText);
    const nextInput = outputText;
    const nextMode = textMode === 'encode' ? 'decode' : 'encode';
    setTextMode(nextMode);
    setInputText(nextInput);
    showNotice(`Swapped to ${nextMode === 'encode' ? 'Encode' : 'Decode'} mode`, 'success');
  };

  // Text Stats
  const inputStats = useMemo(() => {
    const chars = inputText.length;
    const bytes = new Blob([inputText]).size;
    const lines = inputText ? inputText.split('\n').length : 0;
    return { chars, bytes, lines };
  }, [inputText]);

  const outputStats = useMemo(() => {
    const chars = outputText.length;
    const bytes = new Blob([outputText]).size;
    const lines = outputText ? outputText.split('\n').length : 0;
    return { chars, bytes, lines };
  }, [outputText]);

  const expansionRatio = useMemo(() => {
    if (!inputStats.bytes || !outputStats.bytes) return null;
    const ratio = ((outputStats.bytes - inputStats.bytes) / inputStats.bytes) * 100;
    return ratio > 0 ? `+${ratio.toFixed(0)}%` : `${ratio.toFixed(0)}%`;
  }, [inputStats.bytes, outputStats.bytes]);

  // Basic Auth Header
  const basicAuthHeader = useMemo(() => {
    const raw = `${authUsername}:${authPassword}`;
    try {
      return `Authorization: Basic ${utf8ToBase64(raw, false, 'none')}`;
    } catch {
      return '';
    }
  }, [authUsername, authPassword]);

  // Is text output JSON?
  const isOutputJson = useMemo(() => {
    if (textMode !== 'decode' || !outputText.trim()) return false;
    try {
      const parsed = JSON.parse(outputText);
      return typeof parsed === 'object' && parsed !== null;
    } catch {
      return false;
    }
  }, [textMode, outputText]);

  const handleFormatDecodedJson = () => {
    if (!isOutputJson) return;
    try {
      const formatted = JSON.stringify(JSON.parse(outputText), null, 2);
      setOutputText(formatted);
      showNotice('Formatted output as structured JSON', 'success');
    } catch {
      // Ignore
    }
  };

  // ==========================================
  // TAB 2: FILES & DOCUMENTS (IMG, PDF, WORD, EXCEL)
  // ==========================================
  const [fileDirection, setFileDirection] = useState<FileDirection>('file-to-base64');
  const [fileOutputFormat, setFileOutputFormat] = useState<FileOutputFormat>('data-uri');

  // Encode file state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileBase64Raw, setFileBase64Raw] = useState<string>('');
  const [fileDataUri, setFileDataUri] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [copiedFileBase64, setCopiedFileBase64] = useState<boolean>(false);

  // Decode file state
  const [inputBase64File, setInputBase64File] = useState<string>('');
  const [customFilename, setCustomFilename] = useState<string>('');
  const [overrideMime, setOverrideMime] = useState<string>('auto');
  const [fileDecodeError, setFileDecodeError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection / drop for encoding
  const processUploadedFile = (file: File) => {
    setUploadedFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      const fullDataUri = e.target?.result as string;
      setFileDataUri(fullDataUri);

      // Extract raw base64 string after comma
      const commaIndex = fullDataUri.indexOf(',');
      const raw = commaIndex !== -1 ? fullDataUri.slice(commaIndex + 1) : fullDataUri;
      setFileBase64Raw(raw);
      showNotice(`Encoded ${file.name} to Base64!`, 'success');
    };
    reader.onerror = () => {
      showNotice('Failed to read file for Base64 encoding', 'error');
    };
    reader.readAsDataURL(file);
  };

  // Compute final encoded string based on selected format
  const encodedFileFormatted = useMemo(() => {
    if (!fileBase64Raw || !uploadedFile) return '';
    const name = uploadedFile.name;

    switch (fileOutputFormat) {
      case 'data-uri':
        return fileDataUri;
      case 'raw-base64':
        return fileBase64Raw;
      case 'html-img':
        return `<img src="${fileDataUri}" alt="${name}" />`;
      case 'css-bg':
        return `background-image: url("${fileDataUri}");`;
      case 'markdown':
        return `![${name}](${fileDataUri})`;
      default:
        return fileDataUri;
    }
  }, [fileOutputFormat, fileBase64Raw, fileDataUri, uploadedFile]);

  // Decode Base64 string into binary representation for file generation
  const decodedFileState = useMemo<DecodedFileState>(() => {
    if (!inputBase64File.trim()) {
      return null;
    }

    try {
      let rawBase64 = inputBase64File.trim();
      let extractedMime = '';

      // Check for Data URI prefix: data:<mime>;base64,<content>
      const dataUriMatch = rawBase64.match(/^data:([^;]+);base64,(.+)$/s);
      if (dataUriMatch) {
        extractedMime = dataUriMatch[1];
        rawBase64 = dataUriMatch[2].trim();
      }

      // Clean whitespaces & normalize URL-safe characters
      let clean = rawBase64.replace(/\s+/g, '');
      clean = clean.replace(/-/g, '+').replace(/_/g, '/');
      while (clean.length % 4 !== 0) {
        clean += '=';
      }

      const binaryStr = atob(clean);
      const len = binaryStr.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }

      // Detect type
      const detected = detectFileTypeFromBytes(bytes, extractedMime);
      const effectiveMime = overrideMime !== 'auto' ? overrideMime : detected.mime;
      const effectiveExt =
        overrideMime !== 'auto'
          ? overrideMime.includes('pdf')
            ? 'pdf'
            : overrideMime.includes('sheet')
            ? 'xlsx'
            : overrideMime.includes('word')
            ? 'docx'
            : overrideMime.includes('png')
            ? 'png'
            : overrideMime.includes('jpeg')
            ? 'jpg'
            : overrideMime.includes('svg')
            ? 'svg'
            : detected.ext
          : detected.ext;

      const blob = new Blob([bytes], { type: effectiveMime });
      const objectUrl = URL.createObjectURL(blob);

      return {
        bytes,
        blob,
        objectUrl,
        size: len,
        detected,
        effectiveMime,
        effectiveExt
      };
    } catch (err: any) {
      return {
        error: err.message || 'Failed to decode Base64 string. Please check formatting.'
      };
    }
  }, [inputBase64File, overrideMime]);

  // Sync decode error
  useEffect(() => {
    if (decodedFileState?.error) {
      setFileDecodeError(decodedFileState.error);
    } else {
      setFileDecodeError(null);
    }
  }, [decodedFileState]);

  // Clean up created object URLs
  useEffect(() => {
    return () => {
      if (decodedFileState?.objectUrl) {
        URL.revokeObjectURL(decodedFileState.objectUrl);
      }
    };
  }, [decodedFileState]);

  // Download decoded file
  const handleDownloadDecodedFile = () => {
    if (!isDecodedSuccess(decodedFileState)) return;

    const defaultName = `decoded-file-${Date.now()}.${decodedFileState.effectiveExt}`;
    const filename = customFilename.trim() ? customFilename.trim() : defaultName;

    const a = document.createElement('a');
    a.href = decodedFileState.objectUrl;
    a.download = filename.includes('.') ? filename : `${filename}.${decodedFileState.effectiveExt}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showNotice(`Downloaded ${a.download}`, 'success');
  };

  // Copy encoded file output
  const handleCopyEncodedFile = () => {
    if (!encodedFileFormatted) return;
    navigator.clipboard.writeText(encodedFileFormatted);
    setCopiedFileBase64(true);
    setTimeout(() => setCopiedFileBase64(false), 2000);
    showNotice('Copied Base64 string to clipboard!', 'success');
  };

  // Download encoded base64 as .txt
  const handleDownloadEncodedTxt = () => {
    if (!encodedFileFormatted) return;
    const filename = `${uploadedFile?.name || 'encoded'}-base64.txt`;
    const blob = new Blob([encodedFileFormatted], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotice(`Downloaded as ${filename}`, 'success');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              to="/"
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
              title="Back to Toolkit Dashboard"
            >
              <ArrowLeft size={18} />
            </Link>

            <div className="p-2 bg-emerald-600 text-white rounded-lg shrink-0 shadow-xs">
              <Binary size={20} />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight truncate">
                  Base64 Encoder / Decoder
                </h1>
                <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200 hidden sm:inline-block">
                  v2.1
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block truncate">
                Convert text, strings, images, and documents (PDF, Word, Excel) to and from Base64
              </p>
            </div>
          </div>

          {/* Header Actions & Toast */}
          <div className="flex items-center gap-2 shrink-0">
            {notice && (
              <span
                className={`text-xs font-medium px-2.5 py-1 rounded-md border animate-fade-in flex items-center gap-1.5 transition-colors ${
                  notice.type === 'error'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}
              >
                {notice.type === 'error' ? (
                  <AlertCircle size={13} className="text-rose-600 shrink-0" />
                ) : (
                  <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                )}
                <span>{notice.message}</span>
              </span>
            )}

            {mainTab === 'text' && (
              <button
                onClick={() => setShowBasicAuthModal(true)}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
                title="Generate HTTP Basic Auth header"
              >
                <Key size={14} className="text-slate-500" />
                <span className="hidden md:inline">Basic Auth Helper</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-4">
        {/* Primary Sub-Tabs Navigation */}
        <div className="bg-white border border-slate-200 rounded-xl p-1.5 shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setMainTab('text')}
              className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center gap-2 ${
                mainTab === 'text'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileCode size={15} />
              <span>Text & Code Strings</span>
            </button>
            <button
              onClick={() => setMainTab('file')}
              className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center gap-2 ${
                mainTab === 'file'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Layers size={15} />
              <span>Images & Documents (PDF, Word, Excel)</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 hidden md:inline">
                NEW
              </span>
            </button>
          </div>

          <div className="text-xs text-slate-500 hidden sm:block pr-2">
            {mainTab === 'text'
              ? 'Encode/decode plain text, JSON payloads & tokens'
              : 'Convert binary files, PDFs, spreadsheets & graphics'}
          </div>
        </div>

        {/* ================================================================================= */}
        {/* VIEW 1: TEXT & STRINGS TAB                                                        */}
        {/* ================================================================================= */}
        {mainTab === 'text' && (
          <>
            {/* Controls Bar */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
              {/* Segmented Mode Selector */}
              <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
                <button
                  onClick={() => setTextMode('encode')}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                    textMode === 'encode'
                      ? 'bg-white text-emerald-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Code size={13} />
                  <span>Encode to Base64</span>
                </button>
                <button
                  onClick={() => setTextMode('decode')}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                    textMode === 'decode'
                      ? 'bg-white text-emerald-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileCode size={13} />
                  <span>Decode to Text</span>
                </button>
              </div>

              {/* Settings & Options */}
              <div className="flex flex-wrap items-center gap-3 text-xs">
                {/* URL-Safe Toggle */}
                <label
                  className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-slate-900 select-none"
                  title="Replaces + with - and / with _, removes trailing padding = (RFC 4648 §5)"
                >
                  <input
                    type="checkbox"
                    checked={urlSafe}
                    onChange={(e) => setUrlSafe(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="font-medium">URL-Safe</span>
                </label>

                {/* Line Wrap Selector */}
                {textMode === 'encode' && (
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <span className="text-slate-500">Wrap:</span>
                    <select
                      value={lineWrap}
                      onChange={(e) => setLineWrap(e.target.value as LineWrap)}
                      className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="none">No wrap</option>
                      <option value="64">64 chars (PEM)</option>
                      <option value="76">76 chars (MIME)</option>
                    </select>
                  </div>
                )}

                {/* Presets Dropdown */}
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500 hidden lg:inline">Presets:</span>
                  <select
                    onChange={(e) => {
                      const preset = TEXT_PRESETS.find((p) => p.id === e.target.value);
                      if (preset) {
                        pushUndo(inputText);
                        setTextMode(preset.mode);
                        setInputText(preset.input);
                        showNotice(`Loaded preset: ${preset.name}`, 'success');
                      }
                      e.target.value = '';
                    }}
                    defaultValue=""
                    className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-md px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="" disabled>
                      Load sample preset...
                    </option>
                    {TEXT_PRESETS.map((preset) => (
                      <option key={preset.id} value={preset.id}>
                        {preset.name} ({preset.mode})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Undo / Redo buttons */}
                <div className="flex items-center gap-0.5 bg-slate-50 border border-slate-200 rounded-lg p-0.5">
                  <button
                    onClick={handleUndo}
                    disabled={undoStack.length === 0}
                    className={`p-1.5 rounded transition-colors ${
                      undoStack.length > 0
                        ? 'text-slate-700 hover:text-slate-900 hover:bg-white shadow-xs'
                        : 'text-slate-300 cursor-not-allowed'
                    }`}
                    title="Undo last edit (Ctrl+Z)"
                  >
                    <Undo2 size={13} />
                  </button>
                  <button
                    onClick={handleRedo}
                    disabled={redoStack.length === 0}
                    className={`p-1.5 rounded transition-colors ${
                      redoStack.length > 0
                        ? 'text-slate-700 hover:text-slate-900 hover:bg-white shadow-xs'
                        : 'text-slate-300 cursor-not-allowed'
                    }`}
                    title="Redo (Ctrl+Y)"
                  >
                    <Redo2 size={13} />
                  </button>
                </div>
              </div>
            </div>

            {/* Dual Panel Editor */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-[460px]">
              {/* Left Panel: Input */}
              <div className="bg-white border border-slate-200 rounded-xl flex flex-col overflow-hidden shadow-xs">
                <div className="bg-slate-50/80 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 font-semibold text-slate-700">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>{textMode === 'encode' ? 'Plain Text Input (UTF-8)' : 'Base64 Encoded Input'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 font-mono tabular-nums">
                      {inputStats.chars} chars · {inputStats.bytes} B
                    </span>

                    <button
                      onClick={() => {
                        if (!inputText) return;
                        pushUndo(inputText);
                        setInputText('');
                        showNotice('Cleared input. Press Ctrl+Z to undo', 'success');
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                      title="Clear input (Ctrl+Z to undo)"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="flex-1 relative flex">
                  <textarea
                    value={inputText}
                    onChange={(e) => handleInputChange(e.target.value)}
                    placeholder={
                      textMode === 'encode'
                        ? 'Enter or paste plaintext, JSON, tokens, or unicode text here to encode...'
                        : 'Paste valid Base64 string here (e.g. SGVsbG8gd29ybGQ=) to decode...'
                    }
                    spellCheck={false}
                    className="flex-1 w-full h-full min-h-[300px] p-4 font-mono text-xs sm:text-sm text-slate-800 bg-transparent resize-none focus:outline-none leading-relaxed selection:bg-emerald-100 selection:text-emerald-900"
                  />
                </div>
              </div>

              {/* Right Panel: Output */}
              <div className="bg-white border border-slate-200 rounded-xl flex flex-col overflow-hidden shadow-xs">
                <div className="bg-slate-50/80 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 font-semibold text-slate-700">
                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                    <span>{textMode === 'encode' ? 'Base64 Result' : 'Decoded Plain Text (UTF-8)'}</span>
                    {expansionRatio && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        {expansionRatio}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 font-mono tabular-nums">
                      {outputStats.chars} chars · {outputStats.bytes} B
                    </span>

                    {isOutputJson && (
                      <button
                        onClick={handleFormatDecodedJson}
                        className="px-2 py-0.5 text-[11px] font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded transition-colors flex items-center gap-1"
                        title="Format decoded JSON string with 2-space indentation"
                      >
                        <Sparkles size={11} />
                        <span>Format JSON</span>
                      </button>
                    )}

                    <button
                      onClick={handleSwapText}
                      className="px-2 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded text-xs transition-colors flex items-center gap-1"
                      title="Swap Input and Output"
                    >
                      <ArrowLeftRight size={13} />
                      <span className="hidden sm:inline">Swap</span>
                    </button>

                    <button
                      onClick={() => {
                        if (!outputText) return;
                        const filename = textMode === 'encode' ? 'encoded-base64.txt' : 'decoded-output.txt';
                        const blob = new Blob([outputText], { type: 'text/plain;charset=utf-8' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = filename;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                        showNotice(`Downloaded as ${filename}`, 'success');
                      }}
                      disabled={!outputText}
                      className={`p-1 rounded transition-colors ${
                        outputText
                          ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                          : 'text-slate-300 cursor-not-allowed'
                      }`}
                      title="Download output as text file"
                    >
                      <Download size={14} />
                    </button>

                    <button
                      onClick={() => {
                        if (!outputText) return;
                        navigator.clipboard.writeText(outputText);
                        setCopiedText(true);
                        setTimeout(() => setCopiedText(false), 2000);
                        showNotice('Copied result to clipboard!', 'success');
                      }}
                      disabled={!outputText}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                        copiedText
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : outputText
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                      title="Copy result to clipboard"
                    >
                      {copiedText ? <Check size={13} /> : <Copy size={13} />}
                      <span>{copiedText ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                {decodeError && (
                  <div className="bg-rose-50 border-b border-rose-200 px-4 py-2.5 flex items-center justify-between text-xs text-rose-700">
                    <div className="flex items-center gap-2 overflow-hidden truncate">
                      <AlertCircle size={14} className="shrink-0 text-rose-600" />
                      <span className="font-medium truncate">{decodeError}</span>
                    </div>
                    <button
                      onClick={() => {
                        if (!inputText) return;
                        pushUndo(inputText);
                        let sanitized = inputText.replace(/[^A-Za-z0-9+/=_-]/g, '');
                        sanitized = sanitized.replace(/-/g, '+').replace(/_/g, '/');
                        while (sanitized.length % 4 !== 0) {
                          sanitized += '=';
                        }
                        setInputText(sanitized);
                        showNotice('Sanitized characters and padded Base64 sequence', 'success');
                      }}
                      className="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded font-semibold text-[11px] shrink-0 transition-colors"
                      title="Remove illegal characters and pad with ="
                    >
                      Auto-Sanitize & Pad
                    </button>
                  </div>
                )}

                <div className="flex-1 relative flex bg-slate-50/50">
                  <textarea
                    readOnly
                    value={outputText}
                    placeholder={
                      textMode === 'encode'
                        ? 'Base64 encoded string will appear here automatically...'
                        : 'Decoded plaintext will appear here once valid Base64 is provided...'
                    }
                    spellCheck={false}
                    className="flex-1 w-full h-full min-h-[300px] p-4 font-mono text-xs sm:text-sm text-slate-800 bg-transparent resize-none focus:outline-none leading-relaxed selection:bg-indigo-100 selection:text-indigo-900"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* ================================================================================= */}
        {/* VIEW 2: IMAGES & DOCUMENTS (PDF, WORD, EXCEL) TAB                                */}
        {/* ================================================================================= */}
        {mainTab === 'file' && (
          <div className="flex flex-col gap-4">
            {/* Sub-direction toggle */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
                <button
                  onClick={() => setFileDirection('file-to-base64')}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                    fileDirection === 'file-to-base64'
                      ? 'bg-white text-emerald-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Upload size={13} />
                  <span>File to Base64 (Encode)</span>
                </button>
                <button
                  onClick={() => setFileDirection('base64-to-file')}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                    fileDirection === 'base64-to-file'
                      ? 'bg-white text-emerald-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Download size={13} />
                  <span>Base64 to File (Decode)</span>
                </button>
              </div>

              {/* Quick Sample Presets for Testing */}
              {fileDirection === 'base64-to-file' ? (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500 hidden sm:inline">Try Sample:</span>
                  <button
                    onClick={() => {
                      setInputBase64File(SAMPLE_PNG_BASE64);
                      setCustomFilename('sample-icon.png');
                      setOverrideMime('image/png');
                      showNotice('Loaded sample PNG Base64', 'success');
                    }}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium transition-colors"
                  >
                    PNG Image
                  </button>
                  <button
                    onClick={() => {
                      setInputBase64File(SAMPLE_PDF_BASE64);
                      setCustomFilename('sample-doc.pdf');
                      setOverrideMime('application/pdf');
                      showNotice('Loaded sample PDF Base64', 'success');
                    }}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium transition-colors"
                  >
                    PDF Document
                  </button>
                  <button
                    onClick={() => {
                      setInputBase64File(SAMPLE_SVG_BASE64);
                      setCustomFilename('icon.svg');
                      setOverrideMime('image/svg+xml');
                      showNotice('Loaded sample SVG Base64', 'success');
                    }}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium transition-colors"
                  >
                    SVG Vector
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <span className="text-slate-500">Output Format:</span>
                  <select
                    value={fileOutputFormat}
                    onChange={(e) => setFileOutputFormat(e.target.value as FileOutputFormat)}
                    className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-md px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                  >
                    <option value="data-uri">Data URI (data:mime;base64,...)</option>
                    <option value="raw-base64">Raw Base64 string only</option>
                    <option value="html-img">HTML &lt;img src="..." /&gt;</option>
                    <option value="css-bg">CSS background-image: url("...")</option>
                    <option value="markdown">Markdown ![alt](data:...)</option>
                  </select>
                </div>
              )}
            </div>

            {/* SUB-MODE A: FILE TO BASE64 (ENCODE) */}
            {fileDirection === 'file-to-base64' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Left: File Upload & Drop Zone */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col gap-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <Upload size={16} className="text-emerald-600" />
                      <span>Upload Document or Image</span>
                    </h2>
                    {uploadedFile && (
                      <button
                        onClick={() => {
                          setUploadedFile(null);
                          setFileBase64Raw('');
                          setFileDataUri('');
                          showNotice('Removed uploaded file', 'success');
                        }}
                        className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2 py-1 rounded transition-colors"
                      >
                        Remove File
                      </button>
                    )}
                  </div>

                  {/* Drag and Drop Zone */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragOver(true);
                    }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragOver(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file) processUploadedFile(file);
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                      isDragOver
                        ? 'border-emerald-500 bg-emerald-50/50 scale-[0.99]'
                        : 'border-slate-300 hover:border-emerald-400 bg-slate-50/50 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) processUploadedFile(file);
                        e.target.value = '';
                      }}
                      className="hidden"
                    />

                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3 shadow-xs">
                      <Upload size={22} />
                    </div>

                    <p className="text-sm font-semibold text-slate-800 mb-1">
                      Click to browse or drag and drop any file
                    </p>
                    <p className="text-xs text-slate-500 max-w-sm">
                      Supports images (<span className="font-mono text-emerald-700">PNG, JPG, SVG, WebP, GIF</span>) and documents (<span className="font-mono text-indigo-700">PDF, Word .docx, Excel .xlsx</span>, text, etc.)
                    </p>
                  </div>

                  {/* Uploaded File Details & Live Preview */}
                  {uploadedFile && (
                    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/80 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-white rounded-lg border border-slate-200 shadow-xs">
                            {uploadedFile.type.startsWith('image/') ? (
                              <ImageIcon size={22} className="text-emerald-600" />
                            ) : uploadedFile.type.includes('pdf') ? (
                              <FileText size={22} className="text-rose-600" />
                            ) : uploadedFile.name.endsWith('.xlsx') || uploadedFile.name.endsWith('.csv') ? (
                              <FileSpreadsheet size={22} className="text-emerald-700" />
                            ) : uploadedFile.name.endsWith('.docx') ? (
                              <FileText size={22} className="text-blue-600" />
                            ) : (
                              <File size={22} className="text-slate-600" />
                            )}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 text-xs sm:text-sm block truncate max-w-[220px] sm:max-w-xs">
                              {uploadedFile.name}
                            </span>
                            <span className="text-[11px] text-slate-500 font-mono">
                              {formatBytes(uploadedFile.size)} · {uploadedFile.type || 'binary/stream'}
                            </span>
                          </div>
                        </div>

                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          Ready
                        </span>
                      </div>

                      {/* Visual Preview */}
                      {uploadedFile.type.startsWith('image/') && fileDataUri && (
                        <div className="border border-slate-200 rounded-lg p-2 bg-white flex items-center justify-center max-h-48 overflow-hidden">
                          <img
                            src={fileDataUri}
                            alt={uploadedFile.name}
                            className="max-h-44 object-contain rounded"
                          />
                        </div>
                      )}

                      {uploadedFile.type.includes('pdf') && fileDataUri && (
                        <PdfCanvasViewer
                          data={fileDataUri}
                          title={uploadedFile.name}
                          size={uploadedFile.size}
                          heightClass="h-64"
                        />
                      )}
                    </div>
                  )}
                </div>

                {/* Right: Generated Base64 String Output */}
                <div className="bg-white border border-slate-200 rounded-xl flex flex-col overflow-hidden shadow-xs">
                  <div className="bg-slate-50/80 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 font-semibold text-slate-700">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span>Generated Base64 String</span>
                      {fileBase64Raw && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                          {formatBytes(fileBase64Raw.length)} string length
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleDownloadEncodedTxt}
                        disabled={!encodedFileFormatted}
                        className={`p-1 rounded transition-colors ${
                          encodedFileFormatted
                            ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                            : 'text-slate-300 cursor-not-allowed'
                        }`}
                        title="Download Base64 as .txt"
                      >
                        <Download size={14} />
                      </button>

                      <button
                        onClick={handleCopyEncodedFile}
                        disabled={!encodedFileFormatted}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                          copiedFileBase64
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : encodedFileFormatted
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                        title="Copy Base64 string to clipboard"
                      >
                        {copiedFileBase64 ? <Check size={13} /> : <Copy size={13} />}
                        <span>{copiedFileBase64 ? 'Copied!' : 'Copy String'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 relative flex bg-slate-50/50">
                    <textarea
                      readOnly
                      value={encodedFileFormatted}
                      placeholder="Upload an image, PDF, Word, or Excel document to generate Base64 output here..."
                      spellCheck={false}
                      className="flex-1 w-full h-full min-h-[380px] p-4 font-mono text-xs text-slate-800 bg-transparent resize-none focus:outline-none leading-relaxed selection:bg-emerald-100 selection:text-emerald-900 break-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SUB-MODE B: BASE64 TO FILE (DECODE & RECONSTRUCT) */}
            {fileDirection === 'base64-to-file' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Left: Base64 String Input */}
                <div className="bg-white border border-slate-200 rounded-xl flex flex-col overflow-hidden shadow-xs">
                  <div className="bg-slate-50/80 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 font-semibold text-slate-700">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span>Paste Base64 or Data URI</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400 font-mono tabular-nums">
                        {inputBase64File.length} chars
                      </span>

                      <button
                        onClick={() => {
                          setInputBase64File('');
                          showNotice('Cleared Base64 input', 'success');
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                        title="Clear input"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="p-3 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center gap-3 text-xs">
                    <div className="flex items-center gap-1.5 flex-1 min-w-[180px]">
                      <span className="text-slate-500 font-medium">Output Filename:</span>
                      <input
                        type="text"
                        value={customFilename}
                        onChange={(e) => setCustomFilename(e.target.value)}
                        placeholder={`e.g. document.${decodedFileState && !decodedFileState.error ? decodedFileState.effectiveExt : 'pdf'}`}
                        className="bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800 flex-1 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-500 font-medium">Format:</span>
                      <select
                        value={overrideMime}
                        onChange={(e) => setOverrideMime(e.target.value)}
                        className="bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      >
                        <option value="auto">Auto-Detect Magic Bytes</option>
                        <option value="application/pdf">PDF Document (.pdf)</option>
                        <option value="image/png">PNG Image (.png)</option>
                        <option value="image/jpeg">JPEG Image (.jpg)</option>
                        <option value="image/webp">WebP Image (.webp)</option>
                        <option value="image/svg+xml">SVG Vector (.svg)</option>
                        <option value="application/vnd.openxmlformats-officedocument.wordprocessingml.document">Word Document (.docx)</option>
                        <option value="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet">Excel Spreadsheet (.xlsx)</option>
                        <option value="application/octet-stream">Generic Binary (.bin)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex-1 relative flex">
                    <textarea
                      value={inputBase64File}
                      onChange={(e) => setInputBase64File(e.target.value)}
                      placeholder="Paste Base64 string here (e.g. data:image/png;base64,iVBORw... or raw JVBERi0xLjQK...) to reconstruct and download as a file..."
                      spellCheck={false}
                      className="flex-1 w-full h-full min-h-[340px] p-4 font-mono text-xs text-slate-800 bg-transparent resize-none focus:outline-none leading-relaxed selection:bg-emerald-100 selection:text-emerald-900 break-all"
                    />
                  </div>
                </div>

                {/* Right: Decoded File Info & Live Preview */}
                <div className="bg-white border border-slate-200 rounded-xl flex flex-col overflow-hidden shadow-xs">
                  <div className="bg-slate-50/80 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 font-semibold text-slate-700">
                      <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                      <span>Decoded File Reconstruction</span>
                    </div>

                    {isDecodedSuccess(decodedFileState) && (
                      <div className="flex items-center gap-2">
                        <a
                          href={decodedFileState.objectUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                          title="Open in new browser tab"
                        >
                          <ExternalLink size={14} />
                        </a>

                        <button
                          onClick={handleDownloadDecodedFile}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-md transition-colors flex items-center gap-1.5 shadow-xs text-xs"
                        >
                          <Download size={13} />
                          <span>Download File</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {fileDecodeError && (
                    <div className="bg-rose-50 border-b border-rose-200 px-4 py-2.5 flex items-center gap-2 text-xs text-rose-700">
                      <AlertCircle size={14} className="shrink-0 text-rose-600" />
                      <span className="font-medium">{fileDecodeError}</span>
                    </div>
                  )}

                  <div className="flex-1 p-5 flex flex-col justify-center items-center">
                    {isDecodedSuccess(decodedFileState) ? (
                      <div className="w-full flex flex-col gap-4">
                        {/* File Metadata Card */}
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-xs">
                              {decodedFileState.effectiveMime.includes('pdf') ? (
                                <FileText size={24} className="text-rose-600" />
                              ) : decodedFileState.effectiveMime.startsWith('image/') ? (
                                <ImageIcon size={24} className="text-emerald-600" />
                              ) : decodedFileState.effectiveMime.includes('sheet') ? (
                                <FileSpreadsheet size={24} className="text-emerald-700" />
                              ) : decodedFileState.effectiveMime.includes('word') ? (
                                <FileText size={24} className="text-blue-600" />
                              ) : (
                                <File size={24} className="text-slate-600" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 text-sm">
                                  {decodedFileState.detected.label}
                                </span>
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold uppercase">
                                  .{decodedFileState.effectiveExt}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 font-mono mt-0.5">
                                Reconstructed Size: {formatBytes(decodedFileState.size)} · {decodedFileState.effectiveMime}
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={handleDownloadDecodedFile}
                            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-xs shadow-xs transition-colors shrink-0"
                          >
                            <Download size={13} />
                            <span>Save File</span>
                          </button>
                        </div>

                        {/* Live Previews depending on mime */}
                        {decodedFileState.effectiveMime.startsWith('image/') && decodedFileState.objectUrl && (
                          <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 flex flex-col items-center justify-center">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 self-start flex items-center gap-1.5">
                              <Eye size={13} />
                              <span>Live Image Preview</span>
                            </span>
                            <div className="max-h-64 overflow-hidden rounded-lg border border-slate-200 bg-white p-2 flex items-center justify-center">
                              <img
                                src={decodedFileState.objectUrl}
                                alt="Decoded preview"
                                className="max-h-60 object-contain rounded"
                              />
                            </div>
                          </div>
                        )}

                        {decodedFileState.effectiveMime.includes('pdf') && (
                          <PdfCanvasViewer
                            data={decodedFileState.bytes}
                            title="Decoded PDF Document Preview"
                            size={decodedFileState.size}
                            heightClass="h-80"
                            onDownload={handleDownloadDecodedFile}
                          />
                        )}

                        {(decodedFileState.effectiveMime.includes('word') || decodedFileState.effectiveMime.includes('sheet')) && (
                          <div className="border border-slate-200 rounded-xl p-6 bg-slate-50 flex flex-col items-center justify-center text-center">
                            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2 shadow-xs">
                              {decodedFileState.effectiveMime.includes('sheet') ? (
                                <FileSpreadsheet size={24} className="text-emerald-600" />
                              ) : (
                                <FileText size={24} className="text-blue-600" />
                              )}
                            </div>
                            <h3 className="text-sm font-bold text-slate-800 mb-1">
                              {decodedFileState.effectiveMime.includes('sheet') ? 'Excel Spreadsheet Ready' : 'Word Document Ready'}
                            </h3>
                            <p className="text-xs text-slate-500 max-w-sm mb-4">
                              Document binaries are decoded cleanly and ready to open in Microsoft Office, Google Workspace, or LibreOffice.
                            </p>
                            <button
                              onClick={handleDownloadDecodedFile}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                            >
                              <Download size={14} />
                              <span>Download .{decodedFileState.effectiveExt.toUpperCase()}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center p-8 flex flex-col items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
                          <FileType size={22} />
                        </div>
                        <h3 className="text-sm font-semibold text-slate-700 mb-1">
                          No Base64 File Provided Yet
                        </h3>
                        <p className="text-xs text-slate-400 max-w-xs mb-3">
                          Paste a Base64 string or Data URI on the left, or click one of the quick test presets above (PNG, PDF, SVG).
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tester Reference Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Key size={13} className="text-emerald-600" />
            <span>Tester Quick Reference & Common Usages</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs text-slate-600">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="font-semibold text-slate-900 block mb-1">Images to Data URI</span>
              <p className="text-[11px] leading-relaxed">
                Embed images directly inside CSS or HTML without extra network requests using <code className="font-mono text-emerald-700">data:image/png;base64,...</code>.
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="font-semibold text-slate-900 block mb-1">PDF & Office Binaries</span>
              <p className="text-[11px] leading-relaxed">
                Full bi-directional conversion for PDFs, Word (<code className="font-mono text-slate-700">.docx</code>), and Excel (<code className="font-mono text-slate-700">.xlsx</code>) with automated magic byte type detection.
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="font-semibold text-slate-900 block mb-1">HTTP Basic Auth</span>
              <p className="text-[11px] leading-relaxed">
                Standard format is <code className="font-mono text-emerald-700">username:password</code> encoded in Base64 and prefixed with <code className="font-mono text-slate-700">Authorization: Basic </code>.
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="font-semibold text-slate-900 block mb-1">URL-Safe (RFC 4648 §5)</span>
              <p className="text-[11px] leading-relaxed">
                Replaces <code className="font-mono text-slate-700">+</code> with <code className="font-mono text-emerald-700">-</code> and <code className="font-mono text-slate-700">/</code> with <code className="font-mono text-emerald-700">_</code>, omitting trailing padding to be safe in URL query params and JWT tokens.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Basic Auth Generator Modal */}
      {showBasicAuthModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-md">
                  <Key size={16} />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">HTTP Basic Auth Generator</h3>
              </div>
              <button
                onClick={() => setShowBasicAuthModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs px-2 py-1 rounded hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <div>
                <label className="font-medium text-slate-700 block mb-1">Username / Client ID</label>
                <input
                  type="text"
                  value={authUsername}
                  onChange={(e) => setAuthUsername(e.target.value)}
                  placeholder="e.g. admin or api_key_123"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono text-xs"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Password / Client Secret</label>
                <input
                  type="text"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="e.g. secret_token_xyz"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono text-xs"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Generated Header Result</label>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-mono text-xs break-all text-slate-800 selection:bg-emerald-100">
                  {basicAuthHeader || '<empty credentials>'}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  setInputText(basicAuthHeader);
                  setTextMode('encode');
                  setShowBasicAuthModal(false);
                  showNotice('Loaded Basic Auth header into editor', 'success');
                }}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Insert to Editor
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(basicAuthHeader);
                  setCopiedAuth(true);
                  setTimeout(() => setCopiedAuth(false), 2000);
                  showNotice('Copied Basic Auth header to clipboard!', 'success');
                }}
                className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              >
                {copiedAuth ? <Check size={13} /> : <Copy size={13} />}
                <span>{copiedAuth ? 'Copied!' : 'Copy Header'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Base64Converter;

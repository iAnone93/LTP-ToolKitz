import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Code, 
  Copy, 
  Check, 
  Sparkles, 
  Minimize2, 
  Trash2, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Wand2, 
  ShieldCheck, 
  Scissors,
  CheckCheck,
  Info,
  Undo2,
  Redo2
} from 'lucide-react';
import { jsonrepair } from 'jsonrepair';
import Ajv from 'ajv';
import Ajv2020 from 'ajv/dist/2020';
import addFormats from 'ajv-formats';

type SchemaVersion = 'draft-07' | 'draft-2020-12' | 'draft-2019-09';
type IndentType = '2' | '4' | 'tab';

interface ValidationError {
  path: string;
  keyword: string;
  message: string;
  params?: any;
}

interface FormatNotice {
  message: string;
  type: 'success' | 'error';
}

const SAMPLE_JSON = `{
  "userId": 10482,
  "username": "ianone93",
  "email": "ianone93@example.com",
  "active": true,
  "role": "QA Automation Lead",
  "preferences": {
    "theme": "dark",
    "notifications": {
      "email": true,
      "sms": false,
      "push": true
    },
    "defaultFormat": "PDF"
  },
  "toolsUsed": [
    "PDF Table Placer",
    "PDF Merge",
    "JSON Formatter & Validator",
    "JSON Compare"
  ],
  "metrics": {
    "testsExecuted": 1420,
    "successRate": 99.4,
    "lastRegression": "2026-09-28T02:00:00Z"
  }
}`;

const SAMPLE_SCHEMA = `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "UserProfile",
  "type": "object",
  "required": ["userId", "username", "email", "active", "toolsUsed"],
  "properties": {
    "userId": {
      "type": "integer",
      "minimum": 1
    },
    "username": {
      "type": "string",
      "minLength": 3
    },
    "email": {
      "type": "string",
      "format": "email"
    },
    "active": {
      "type": "boolean"
    },
    "role": {
      "type": "string"
    },
    "toolsUsed": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "minItems": 1
    },
    "metrics": {
      "type": "object",
      "properties": {
        "testsExecuted": { "type": "integer", "minimum": 0 },
        "successRate": { "type": "number", "minimum": 0, "maximum": 100 }
      }
    }
  }
}`;

const JsonFormatter: React.FC = () => {
  // Main JSON state
  const [jsonText, setJsonText] = useState<string>(SAMPLE_JSON);
  const [indentOption, setIndentOption] = useState<IndentType>('2');
  const [copied, setCopied] = useState<boolean>(false);
  const [selectedText, setSelectedText] = useState<string>('');
  const [selectionRange, setSelectionRange] = useState<{ start: number; end: number } | null>(null);
  const [formatNotice, setFormatNotice] = useState<FormatNotice | null>(null);

  // Schema Validation state
  const [isSchemaEnabled, setIsSchemaEnabled] = useState<boolean>(false);
  const [schemaVersion, setSchemaVersion] = useState<SchemaVersion>('draft-07');
  const [schemaText, setSchemaText] = useState<string>(SAMPLE_SCHEMA);
  const [copiedSchema, setCopiedSchema] = useState<boolean>(false);
  const [schemaValidationResult, setSchemaValidationResult] = useState<{
    valid: boolean | null;
    errors: ValidationError[];
    schemaError?: string;
  }>({ valid: null, errors: [] });

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Undo & Redo History management
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const undoStackRef = useRef<string[]>([]);
  const redoStackRef = useRef<string[]>([]);
  const jsonTextRef = useRef<string>(jsonText);
  jsonTextRef.current = jsonText;
  const isTypingRef = useRef<boolean>(false);
  const typingTimerRef = useRef<any>(null);

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
    const previous = undoStackRef.current[undoStackRef.current.length - 1];
    const newUndo = undoStackRef.current.slice(0, -1);
    undoStackRef.current = newUndo;
    redoStackRef.current = [...redoStackRef.current, jsonTextRef.current];
    setUndoStack([...newUndo]);
    setRedoStack([...redoStackRef.current]);
    setJsonText(previous);

    if (!jsonTextRef.current.trim() && previous.trim()) {
      showNotice('Restored deleted JSON! (Ctrl+Z)', 'success');
    } else {
      showNotice('Undone (Ctrl+Z)', 'success');
    }
  };

  const handleRedo = () => {
    if (redoStackRef.current.length === 0) return;
    const next = redoStackRef.current[redoStackRef.current.length - 1];
    const newRedo = redoStackRef.current.slice(0, -1);
    redoStackRef.current = newRedo;
    undoStackRef.current = [...undoStackRef.current, jsonTextRef.current];
    setRedoStack([...newRedo]);
    setUndoStack([...undoStackRef.current]);
    setJsonText(next);
    showNotice('Redone (Ctrl+Y)', 'success');
  };

  // Global Ctrl+Z / Cmd+Z and Ctrl+Y listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      // Don't intercept if user is typing in schema textarea or another input
      const isOtherInput = activeEl && activeEl !== textareaRef.current && (activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'INPUT');
      if (isOtherInput) return;

      const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const isUndo = (isMac ? e.metaKey : e.ctrlKey) && e.key.toLowerCase() === 'z' && !e.shiftKey;
      const isRedo = 
        ((isMac ? e.metaKey : e.ctrlKey) && e.key.toLowerCase() === 'y') ||
        ((isMac ? e.metaKey : e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'z');

      if (isUndo) {
        if (undoStackRef.current.length > 0) {
          e.preventDefault();
          handleUndo();
        }
      } else if (isRedo) {
        if (redoStackRef.current.length > 0) {
          e.preventDefault();
          handleRedo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Compute indentation string
  const indentString = useMemo(() => {
    if (indentOption === 'tab') return '\t';
    if (indentOption === '4') return '    ';
    return '  ';
  }, [indentOption]);

  // Syntax status of JSON payload
  const jsonSyntaxStatus = useMemo(() => {
    if (!jsonText.trim()) {
      return { isValid: null, error: null, parsed: null };
    }
    try {
      const parsed = JSON.parse(jsonText);
      return { isValid: true, error: null, parsed };
    } catch (err: any) {
      return { isValid: false, error: err.message || 'Invalid JSON syntax', parsed: null };
    }
  }, [jsonText]);

  // Statistics
  const stats = useMemo(() => {
    const chars = jsonText.length;
    const lines = jsonText ? jsonText.split('\n').length : 0;
    const bytes = new Blob([jsonText]).size;
    const formattedBytes = bytes > 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${bytes} B`;
    
    let keyCount = 0;
    let maxDepth = 0;

    const countKeysAndDepth = (obj: any, currentDepth = 1) => {
      if (typeof obj !== 'object' || obj === null) return;
      if (currentDepth > maxDepth) maxDepth = currentDepth;

      if (Array.isArray(obj)) {
        obj.forEach(item => countKeysAndDepth(item, currentDepth + 1));
      } else {
        const keys = Object.keys(obj);
        keyCount += keys.length;
        keys.forEach(k => countKeysAndDepth(obj[k], currentDepth + 1));
      }
    };

    if (jsonSyntaxStatus.isValid && jsonSyntaxStatus.parsed) {
      countKeysAndDepth(jsonSyntaxStatus.parsed);
    }

    return { chars, lines, formattedBytes, keyCount, maxDepth };
  }, [jsonText, jsonSyntaxStatus]);

  // Listen for text selection in JSON editor
  const handleSelect = () => {
    if (!textareaRef.current) return;
    const { selectionStart, selectionEnd } = textareaRef.current;
    if (selectionStart !== selectionEnd) {
      const text = jsonText.substring(selectionStart, selectionEnd);
      setSelectedText(text);
      setSelectionRange({ start: selectionStart, end: selectionEnd });
    } else {
      setSelectedText('');
      setSelectionRange(null);
    }
  };

  // Full Beautify
  const handleBeautifyAll = () => {
    if (!jsonText.trim()) return;
    pushUndo(jsonText);
    try {
      let parsed;
      try {
        parsed = JSON.parse(jsonText);
      } catch (parseErr) {
        // Try repairing first
        parsed = JSON.parse(jsonrepair(jsonText));
      }
      const formatted = JSON.stringify(parsed, null, indentString);
      setJsonText(formatted);
      showNotice('JSON beautified successfully!', 'success');
    } catch (err: any) {
      showNotice(`Cannot beautify: ${err.message || 'Invalid JSON'}`, 'error');
    }
  };

  // Beautify Selected Segment
  const handleBeautifySelection = () => {
    if (!selectionRange || !selectedText.trim() || !textareaRef.current) {
      handleBeautifyAll();
      return;
    }

    pushUndo(jsonText);
    const { start, end } = selectionRange;
    const trimmed = selectedText.trim();

    try {
      let parsedSelection: any;
      let isObjectWrapped = false;

      // 1. Try direct parse
      try {
        parsedSelection = JSON.parse(trimmed);
      } catch {
        // 2. Try jsonrepair
        try {
          parsedSelection = JSON.parse(jsonrepair(trimmed));
        } catch {
          // 3. Try wrapping if it looks like key-values: e.g. "a": 1, "b": 2
          try {
            parsedSelection = JSON.parse(`{${trimmed}}`);
            isObjectWrapped = true;
          } catch {
            // 4. Try array wrap
            parsedSelection = JSON.parse(`[${trimmed}]`);
          }
        }
      }

      let formattedSlice = JSON.stringify(parsedSelection, null, indentString);

      // If we had to wrap with curly braces, strip outer brackets if needed
      if (isObjectWrapped && formattedSlice.startsWith('{\n') && formattedSlice.endsWith('\n}')) {
        formattedSlice = formattedSlice.slice(2, -2).trim();
      }

      const before = jsonText.substring(0, start);
      const after = jsonText.substring(end);
      const newJson = before + formattedSlice + after;

      setJsonText(newJson);
      setSelectedText('');
      setSelectionRange(null);
      showNotice('Selected JSON block beautified!', 'success');

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(start, start + formattedSlice.length);
        }
      }, 50);
    } catch (err: any) {
      showNotice(`Could not format selection: Invalid syntax snippet`, 'error');
    }
  };

  // Minify JSON
  const handleMinify = () => {
    if (!jsonText.trim()) return;
    pushUndo(jsonText);
    try {
      let parsed;
      try {
        parsed = JSON.parse(jsonText);
      } catch {
        parsed = JSON.parse(jsonrepair(jsonText));
      }
      const minified = JSON.stringify(parsed);
      setJsonText(minified);
      showNotice('JSON minified / compacted!', 'success');
    } catch (err: any) {
      showNotice(`Cannot minify: ${err.message}`, 'error');
    }
  };

  // Auto-Repair Malformed JSON
  const handleRepair = () => {
    if (!jsonText.trim()) return;
    pushUndo(jsonText);
    try {
      const repaired = jsonrepair(jsonText);
      const parsed = JSON.parse(repaired);
      setJsonText(JSON.stringify(parsed, null, indentString));
      showNotice('Repaired malformed JSON syntax!', 'success');
    } catch (err: any) {
      showNotice(`Repair failed: ${err.message}`, 'error');
    }
  };

  // Clear Editor with Undo capability
  const handleClear = () => {
    if (!jsonText.trim()) return;
    pushUndo(jsonText);
    setJsonText('');
    setSelectedText('');
    setSelectionRange(null);
    showNotice('Cleared JSON editor. Press Ctrl+Z to undo delete', 'success');
  };

  // Debounced input change tracking for smooth typing undo
  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextVal = e.target.value;
    if (!isTypingRef.current) {
      pushUndo(jsonTextRef.current);
      isTypingRef.current = true;
    }
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      isTypingRef.current = false;
    }, 700);

    setJsonText(nextVal);
  };

  // One-Click Copy
  const handleCopy = (text: string, type: 'json' | 'schema') => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    if (type === 'json') {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      setCopiedSchema(true);
      setTimeout(() => setCopiedSchema(false), 2000);
    }
    showNotice(`Copied ${type === 'json' ? 'JSON' : 'Schema'} to clipboard!`, 'success');
  };

  // Notification helper
  const showNotice = (message: string, type: 'success' | 'error' = 'success') => {
    setFormatNotice({ message, type });
    setTimeout(() => {
      setFormatNotice((prev) => (prev?.message === message ? null : prev));
    }, 3200);
  };

  // Schema Validator execution
  const runSchemaValidation = () => {
    if (!isSchemaEnabled) return;

    if (!jsonSyntaxStatus.isValid || jsonSyntaxStatus.parsed === null) {
      setSchemaValidationResult({
        valid: null,
        errors: [],
        schemaError: 'JSON payload has invalid syntax. Fix syntax errors first.'
      });
      return;
    }

    let parsedSchema: any;
    try {
      parsedSchema = JSON.parse(schemaText);
    } catch (e: any) {
      setSchemaValidationResult({
        valid: null,
        errors: [],
        schemaError: `Invalid Schema JSON: ${e.message}`
      });
      return;
    }

    try {
      // Choose Ajv instance according to selected schema version
      let ajvInstance: any;
      if (schemaVersion === 'draft-2020-12') {
        ajvInstance = new Ajv2020({ allErrors: true, strict: false });
      } else {
        // default / draft-07 / draft-2019-09
        ajvInstance = new Ajv({ allErrors: true, strict: false });
      }

      const addFormatsFn = typeof addFormats === 'function' ? addFormats : (addFormats as any)?.default;
      if (typeof addFormatsFn === 'function') {
        addFormatsFn(ajvInstance);
      }

      const validate = ajvInstance.compile(parsedSchema);
      const isValid = validate(jsonSyntaxStatus.parsed);

      if (isValid) {
        setSchemaValidationResult({
          valid: true,
          errors: [],
          schemaError: undefined
        });
      } else {
        const errors: ValidationError[] = (validate.errors || []).map((err: any) => ({
          path: err.instancePath ? `/${err.instancePath.replace(/^\//, '')}` : '(root)',
          keyword: err.keyword,
          message: err.message || 'Validation condition failed',
          params: err.params
        }));
        setSchemaValidationResult({
          valid: false,
          errors,
          schemaError: undefined
        });
      }
    } catch (err: any) {
      setSchemaValidationResult({
        valid: null,
        errors: [],
        schemaError: `Schema compilation error: ${err.message}`
      });
    }
  };

  // Run schema validation whenever JSON, schema, or version changes if schema is enabled
  useEffect(() => {
    if (isSchemaEnabled) {
      runSchemaValidation();
    }
  }, [isSchemaEnabled, jsonText, schemaText, schemaVersion, jsonSyntaxStatus.isValid]);

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shrink-0 z-20 shadow-xs">
        <div className="flex items-center space-x-3">
          <Link 
            to="/" 
            className="p-1.5 -ml-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            title="Return to Home"
          >
            <ArrowLeft size={20} />
          </Link>
          <div className="bg-emerald-600 p-2 rounded-xl text-white shadow-xs">
            <Code size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">JSON Formatter & Validator</h1>
              <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md border border-slate-200">
                v2.0
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Beautify full or selected blocks, minify, repair, and validate against JSON Schema
            </p>
          </div>
        </div>

        {/* Global Action Bar */}
        <div className="flex items-center gap-2">
          {/* Schema Validator Switch */}
          <button
            onClick={() => setIsSchemaEnabled(!isSchemaEnabled)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              isSchemaEnabled
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <ShieldCheck size={15} className={isSchemaEnabled ? 'text-emerald-600' : 'text-slate-400'} />
            <span>Validate Schema</span>
            <span className={`w-2 h-2 rounded-full ${isSchemaEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
          </button>

          {/* One-Click Copy */}
          <button
            onClick={() => handleCopy(jsonText, 'json')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-all shadow-xs"
            title="Copy entire formatted JSON to clipboard"
          >
            {copied ? <Check size={14} className="text-emerald-200" /> : <Copy size={14} />}
            <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Toolbar Bar */}
        <div className="bg-white border-b border-slate-200 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Left Toolbar: Beautify / Selection / Minify / Repair */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Primary Beautify Button */}
            <button
              onClick={handleBeautifyAll}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
              title="Beautify entire JSON document"
            >
              <Sparkles size={14} className="text-amber-300" />
              <span>Beautify</span>
            </button>

            {/* Beautify Selection Button (Active when text is blocked) */}
            <button
              onClick={handleBeautifySelection}
              disabled={!selectedText.trim()}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                selectedText.trim()
                  ? 'bg-purple-50 text-purple-700 border-purple-300 hover:bg-purple-100 shadow-xs ring-2 ring-purple-100'
                  : 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
              }`}
              title={
                selectedText.trim()
                  ? `Beautify only selected portion (${selectedText.length} chars blocked)`
                  : 'Select/block any portion in the editor to beautify that specific part'
              }
            >
              <Scissors size={14} className={selectedText.trim() ? 'text-purple-600' : 'text-slate-400'} />
              <span>Beautify Selection</span>
              {selectedText.trim() && (
                <span className="px-1.5 py-0.2 bg-purple-200/80 text-purple-800 rounded-md text-[10px]">
                  {selectedText.length} chars
                </span>
              )}
            </button>

            {/* Minify */}
            <button
              onClick={handleMinify}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
              title="Compact JSON into a single line without whitespace"
            >
              <Minimize2 size={13} />
              <span>Minify</span>
            </button>

            {/* Auto Repair */}
            <button
              onClick={handleRepair}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
              title="Repair broken JSON (fixes unquoted keys, trailing commas, single quotes)"
            >
              <Wand2 size={13} className="text-indigo-600" />
              <span>Auto-Repair</span>
            </button>

            {/* Indent Selector */}
            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200 text-xs text-slate-500">
              <span>Indent:</span>
              <select
                value={indentOption}
                onChange={(e) => setIndentOption(e.target.value as IndentType)}
                className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-xs text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-slate-400"
              >
                <option value="2">2 spaces</option>
                <option value="4">4 spaces</option>
                <option value="tab">Tab</option>
              </select>
            </div>
          </div>

          {/* Right Toolbar: Undo / Redo / Sample / Clear / Feedback */}
          <div className="flex items-center gap-2">
            {formatNotice && (
              <span className={`text-xs font-medium px-2.5 py-1 rounded-md border animate-fade-in flex items-center gap-1.5 transition-colors ${
                formatNotice.type === 'error'
                  ? 'bg-rose-50 text-rose-700 border-rose-200 shadow-xs'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-xs'
              }`}>
                {formatNotice.type === 'error' ? (
                  <AlertCircle size={13} className="text-rose-600 shrink-0" />
                ) : (
                  <CheckCheck size={13} className="text-emerald-600 shrink-0" />
                )}
                <span>{formatNotice.message}</span>
              </span>
            )}

            {/* Undo & Redo Buttons */}
            <div className="flex items-center gap-0.5 bg-slate-50 border border-slate-200 rounded-lg p-0.5">
              <button
                onClick={handleUndo}
                disabled={undoStack.length === 0}
                className={`p-1.5 rounded text-xs flex items-center gap-1 transition-colors ${
                  undoStack.length > 0
                    ? 'text-slate-700 hover:text-slate-900 hover:bg-white shadow-xs'
                    : 'text-slate-300 cursor-not-allowed'
                }`}
                title="Undo last change or delete (Ctrl+Z)"
              >
                <Undo2 size={13} />
                <span className="hidden lg:inline text-[11px] font-medium">Undo</span>
              </button>
              <button
                onClick={handleRedo}
                disabled={redoStack.length === 0}
                className={`p-1.5 rounded text-xs flex items-center gap-1 transition-colors ${
                  redoStack.length > 0
                    ? 'text-slate-700 hover:text-slate-900 hover:bg-white shadow-xs'
                    : 'text-slate-300 cursor-not-allowed'
                }`}
                title="Redo (Ctrl+Y)"
              >
                <Redo2 size={13} />
                <span className="hidden lg:inline text-[11px] font-medium">Redo</span>
              </button>
            </div>

            <button
              onClick={() => {
                pushUndo(jsonText);
                setJsonText(SAMPLE_JSON);
                showNotice('Loaded sample JSON payload', 'success');
              }}
              className="px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
            >
              Load Sample
            </button>

            <button
              onClick={handleClear}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
              title="Clear JSON editor (Ctrl+Z to undo delete)"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        {/* Editor Area (Split when Schema is enabled) */}
        <div className="flex-1 flex min-h-0 overflow-hidden bg-slate-100">
          {/* Left Pane: JSON Payload Editor */}
          <div className={`flex flex-col min-w-0 bg-white border-r border-slate-200 transition-all ${
            isSchemaEnabled ? 'w-full md:w-1/2' : 'w-full'
          }`}>
            <div className="bg-slate-50/80 px-4 py-2 border-b border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-semibold text-slate-700">
                <FileText size={14} className="text-slate-500" />
                <span>JSON Payload</span>
                {jsonSyntaxStatus.isValid === true && (
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 size={11} /> Valid Syntax
                  </span>
                )}
                {jsonSyntaxStatus.isValid === false && (
                  <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 flex items-center gap-1">
                    <AlertCircle size={11} /> Syntax Error
                  </span>
                )}
              </div>

              <div className="text-[11px] text-slate-400 hidden sm:block">
                Tip: Highlight any portion & click <span className="font-semibold text-purple-600">Beautify Selection</span>
              </div>
            </div>

            {/* Error Banner if invalid syntax */}
            {jsonSyntaxStatus.isValid === false && (
              <div className="bg-rose-50 border-b border-rose-200 px-4 py-2 flex items-center justify-between text-xs text-rose-700 shrink-0">
                <div className="flex items-center gap-2 overflow-hidden truncate">
                  <AlertCircle size={14} className="shrink-0" />
                  <span className="truncate">{jsonSyntaxStatus.error}</span>
                </div>
                <button
                  onClick={handleRepair}
                  className="px-2 py-0.5 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded font-semibold text-[11px] shrink-0"
                >
                  Quick Repair
                </button>
              </div>
            )}

            {/* Code Textarea with line numbers */}
            <div className="flex-1 relative overflow-hidden flex">
              <textarea
                ref={textareaRef}
                value={jsonText}
                onChange={handleJsonChange}
                onSelect={handleSelect}
                onMouseUp={handleSelect}
                onKeyUp={handleSelect}
                placeholder="Paste or write your JSON here..."
                spellCheck={false}
                className="flex-1 w-full h-full p-4 font-mono text-xs sm:text-sm text-slate-800 bg-transparent resize-none focus:outline-none leading-relaxed selection:bg-purple-100 selection:text-purple-900"
              />
            </div>
          </div>

          {/* Right Pane: JSON Schema & Validation Results */}
          {isSchemaEnabled && (
            <div className="flex flex-col min-w-0 w-full md:w-1/2 bg-white overflow-hidden">
              {/* Schema Header & Version Selector */}
              <div className="bg-slate-50/80 px-4 py-2 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 font-semibold text-slate-700">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  <span>JSON Schema</span>
                </div>

                {/* Schema Version Dropdown */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-500">Version:</span>
                  <select
                    value={schemaVersion}
                    onChange={(e) => setSchemaVersion(e.target.value as SchemaVersion)}
                    className="bg-white border border-slate-200 rounded-md px-2 py-0.5 text-xs text-slate-700 font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="draft-07">Draft-07 (Recommended)</option>
                    <option value="draft-2020-12">Draft-2020-12</option>
                    <option value="draft-2019-09">Draft-2019-09</option>
                  </select>

                  <button
                    onClick={() => handleCopy(schemaText, 'schema')}
                    className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded transition-colors ml-1"
                    title="Copy Schema"
                  >
                    {copiedSchema ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                  </button>

                  <button
                    onClick={() => {
                      setSchemaText(SAMPLE_SCHEMA);
                      showNotice('Loaded sample schema');
                    }}
                    className="text-[11px] text-slate-500 hover:text-slate-800 underline ml-1"
                  >
                    Reset Schema
                  </button>
                </div>
              </div>

              {/* Validation Status Indicator */}
              <div className="p-3 border-b border-slate-200 shrink-0">
                {schemaValidationResult.schemaError ? (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs text-rose-800">
                    <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Schema Error</p>
                      <p className="text-[11px] text-rose-600">{schemaValidationResult.schemaError}</p>
                    </div>
                  </div>
                ) : schemaValidationResult.valid === true ? (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                      <div>
                        <span className="font-bold">Schema Valid!</span> The JSON payload conforms strictly to {schemaVersion}.
                      </div>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-200/60 px-2 py-0.5 rounded text-emerald-800">
                      PASS
                    </span>
                  </div>
                ) : schemaValidationResult.valid === false ? (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5 font-bold">
                        <AlertCircle size={15} className="text-rose-600" />
                        <span>{schemaValidationResult.errors.length} Validation {schemaValidationResult.errors.length === 1 ? 'Error' : 'Errors'} Found</span>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-200/60 px-2 py-0.5 rounded text-rose-800">
                        FAIL
                      </span>
                    </div>

                    <div className="max-h-24 overflow-y-auto space-y-1 pr-1">
                      {schemaValidationResult.errors.map((err, idx) => (
                        <div key={idx} className="bg-white/80 p-1.5 rounded border border-rose-200/70 text-[11px] flex items-start gap-1.5">
                          <span className="font-mono font-semibold text-rose-700 shrink-0">{err.path}</span>
                          <span className="text-slate-600">· {err.message}</span>
                          <span className="ml-auto text-[10px] bg-slate-100 text-slate-500 px-1 rounded font-mono shrink-0">
                            [{err.keyword}]
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2 text-xs text-slate-500">
                    <Info size={14} />
                    <span>Enter JSON payload and Schema to run live validation.</span>
                  </div>
                )}
              </div>

              {/* Schema Code Textarea */}
              <div className="flex-1 relative overflow-hidden flex">
                <textarea
                  value={schemaText}
                  onChange={(e) => setSchemaText(e.target.value)}
                  placeholder="Paste or write your JSON Schema here..."
                  spellCheck={false}
                  className="flex-1 w-full h-full p-4 font-mono text-xs sm:text-sm text-slate-800 bg-transparent resize-none focus:outline-none leading-relaxed selection:bg-emerald-100 selection:text-emerald-900"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Statistics Bar */}
        <footer className="bg-white border-t border-slate-200 px-6 py-2 shrink-0 flex flex-wrap items-center justify-between text-xs text-slate-500">
          <div className="flex items-center flex-wrap gap-4">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Lines:</span>
              <span className="font-semibold text-slate-700">{stats.lines}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Characters:</span>
              <span className="font-semibold text-slate-700">{stats.chars}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Size:</span>
              <span className="font-semibold text-slate-700">{stats.formattedBytes}</span>
            </div>
            {jsonSyntaxStatus.isValid && (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">Keys:</span>
                  <span className="font-semibold text-slate-700">{stats.keyCount}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">Depth:</span>
                  <span className="font-semibold text-slate-700">{stats.maxDepth}</span>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            {selectedText.trim() ? (
              <span className="text-purple-600 font-medium flex items-center gap-1">
                <Scissors size={12} />
                Selected: {selectedText.length} characters
              </span>
            ) : (
              <span className="text-slate-400">
                LTP-ToolKitz JSON Engine · v2.0
              </span>
            )}
          </div>
        </footer>
      </main>
    </div>
  );
};

export default JsonFormatter;

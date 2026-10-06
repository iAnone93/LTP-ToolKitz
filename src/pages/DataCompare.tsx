import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  GitCompare,
  Play,
  Trash2,
  Upload,
  Copy,
  Check,
  Code2,
  FileText,
  Table as TableIcon,
  FileCheck,
  Sparkles,
  Columns,
  ListFilter
} from 'lucide-react';
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer-continued';
import {
  CompareMode,
  CodeLanguage,
  COMPARE_SAMPLES,
  SheetDiffResult,
  extractTextFromPdf,
  parseSpreadsheetToCsv,
  parseCsvStringToRows,
  computeSpreadsheetDiff
} from '../utils/dataCompareUtils';

const CODE_LANGUAGES: { value: CodeLanguage; label: string; badge?: string }[] = [
  { value: 'groovy', label: 'Groovy (Katalon Studio)', badge: 'Katalon' },
  { value: 'sql', label: 'SQL Script / Migration', badge: 'Database' },
  { value: 'javascript', label: 'JavaScript / TypeScript' },
  { value: 'python', label: 'Python Script' },
  { value: 'java', label: 'Java Class' },
  { value: 'json', label: 'JSON Data' },
  { value: 'xml', label: 'XML / HTML' },
  { value: 'bash', label: 'Bash / Shell' }
];

const DataCompare: React.FC = () => {
  // Mode & Language
  const [mode, setMode] = useState<CompareMode>('code');
  const [language, setLanguage] = useState<CodeLanguage>('groovy');

  // Input Data
  const [leftTitle, setLeftTitle] = useState<string>('Baseline / Original');
  const [rightTitle, setRightTitle] = useState<string>('Modified / Target');
  const [leftContent, setLeftContent] = useState<string>('');
  const [rightContent, setRightContent] = useState<string>('');
  const [leftFileName, setLeftFileName] = useState<string | null>(null);
  const [rightFileName, setRightFileName] = useState<string | null>(null);

  // Comparison Options
  const [isComparing, setIsComparing] = useState<boolean>(true);
  const [splitView, setSplitView] = useState<boolean>(true);
  const [ignoreWhitespace, setIgnoreWhitespace] = useState<boolean>(false);
  const [ignoreCase, setIgnoreCase] = useState<boolean>(false);
  const [wordWrap, setWordWrap] = useState<boolean>(true);

  // Spreadsheet Specific State
  const [primaryKey, setPrimaryKey] = useState<string>('');
  const [spreadsheetViewType, setSpreadsheetViewType] = useState<'table' | 'text'>('table');
  const [sheetDiff, setSheetDiff] = useState<SheetDiffResult | null>(null);

  // Feedback State
  const [copiedReport, setCopiedReport] = useState<boolean>(false);
  const [isLoadingFile, setIsLoadingFile] = useState<boolean>(false);
  const leftFileInputRef = useRef<HTMLInputElement>(null);
  const rightFileInputRef = useRef<HTMLInputElement>(null);

  // Load default Katalon Groovy sample on initial render
  useEffect(() => {
    const defaultSample = COMPARE_SAMPLES.find(s => s.id === 'katalon-groovy');
    if (defaultSample) {
      setLeftTitle(defaultSample.leftTitle);
      setRightTitle(defaultSample.rightTitle);
      setLeftContent(defaultSample.leftContent);
      setRightContent(defaultSample.rightContent);
      setMode(defaultSample.mode);
      if (defaultSample.language) setLanguage(defaultSample.language);
      setIsComparing(true);
    }
  }, []);

  // Compute spreadsheet diff whenever contents or primary key changes in spreadsheet mode
  useEffect(() => {
    if (mode === 'spreadsheet' && leftContent && rightContent) {
      try {
        const leftParsed = parseCsvStringToRows(leftContent);
        const rightParsed = parseCsvStringToRows(rightContent);
        const diff = computeSpreadsheetDiff(leftParsed.rows, rightParsed.rows, primaryKey || undefined);
        setSheetDiff(diff);
      } catch (err) {
        console.error('Error computing spreadsheet diff', err);
        setSheetDiff(null);
      }
    } else {
      setSheetDiff(null);
    }
  }, [mode, leftContent, rightContent, primaryKey]);

  // Load a sample
  const handleLoadSample = (sampleId: string) => {
    const sample = COMPARE_SAMPLES.find(s => s.id === sampleId);
    if (!sample) return;

    setMode(sample.mode);
    if (sample.language) setLanguage(sample.language);
    setLeftTitle(sample.leftTitle);
    setRightTitle(sample.rightTitle);
    setLeftContent(sample.leftContent);
    setRightContent(sample.rightContent);
    setLeftFileName(null);
    setRightFileName(null);
    setIsComparing(true);
    if (sample.mode === 'spreadsheet') {
      setPrimaryKey('SKU');
    } else {
      setPrimaryKey('');
    }
  };

  // File Upload Handlers (Left & Right)
  const handleFileUpload = async (side: 'left' | 'right', file: File) => {
    setIsLoadingFile(true);
    try {
      const fileName = file.name;
      const extension = fileName.split('.').pop()?.toLowerCase() || '';

      if (side === 'left') setLeftFileName(fileName);
      else setRightFileName(fileName);

      if (extension === 'pdf') {
        setMode('pdf');
        const buffer = await file.arrayBuffer();
        const extractedText = await extractTextFromPdf(buffer);
        if (side === 'left') {
          setLeftContent(extractedText);
          setLeftTitle(`PDF Baseline: ${fileName}`);
        } else {
          setRightContent(extractedText);
          setRightTitle(`PDF Modified: ${fileName}`);
        }
      } else if (['xlsx', 'xls', 'csv'].includes(extension)) {
        setMode('spreadsheet');
        const buffer = await file.arrayBuffer();
        const { csv } = parseSpreadsheetToCsv(buffer);
        if (side === 'left') {
          setLeftContent(csv);
          setLeftTitle(`Spreadsheet: ${fileName}`);
        } else {
          setRightContent(csv);
          setRightTitle(`Spreadsheet: ${fileName}`);
        }
      } else {
        // Plain text or code file (.groovy, .sql, .py, .java, .js, .txt, etc.)
        const text = await file.text();
        if (extension === 'groovy') {
          setMode('code');
          setLanguage('groovy');
        } else if (extension === 'sql') {
          setMode('code');
          setLanguage('sql');
        } else if (['js', 'ts', 'jsx', 'tsx'].includes(extension)) {
          setMode('code');
          setLanguage('javascript');
        } else if (extension === 'py') {
          setMode('code');
          setLanguage('python');
        } else if (extension === 'java') {
          setMode('code');
          setLanguage('java');
        }

        if (side === 'left') {
          setLeftContent(text);
          setLeftTitle(fileName);
        } else {
          setRightContent(text);
          setRightTitle(fileName);
        }
      }
      setIsComparing(true);
    } catch (err) {
      console.error('File parsing error', err);
      alert('Could not read or parse this file.');
    } finally {
      setIsLoadingFile(false);
    }
  };

  // Clear inputs
  const handleClearAll = () => {
    setLeftContent('');
    setRightContent('');
    setLeftFileName(null);
    setRightFileName(null);
    setLeftTitle('Baseline / Original');
    setRightTitle('Modified / Target');
    setSheetDiff(null);
  };

  // Copy Summary Report
  const handleCopySummary = () => {
    const summary = `DATA COMPARE REPORT
Mode: ${mode.toUpperCase()}${mode === 'code' ? ` (${language})` : ''}
Left Source: ${leftTitle}
Right Source: ${rightTitle}
Timestamp: ${new Date().toLocaleString()}

${mode === 'spreadsheet' && sheetDiff ? `
Summary:
- Added Rows: ${sheetDiff.stats.added}
- Removed Rows: ${sheetDiff.stats.removed}
- Modified Rows: ${sheetDiff.stats.modified}
- Unchanged Rows: ${sheetDiff.stats.unchanged}
` : `
Left Line Count: ${leftContent.split('\n').length} lines
Right Line Count: ${rightContent.split('\n').length} lines
`}
Generated via LTP-ToolKitz Data Compare.
`;
    navigator.clipboard.writeText(summary);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  // Normalized content for diffing with ignore options
  const processedLeftContent = useMemo(() => {
    let text = leftContent;
    if (ignoreCase) text = text.toLowerCase();
    return text;
  }, [leftContent, ignoreCase]);

  const processedRightContent = useMemo(() => {
    let text = rightContent;
    if (ignoreCase) text = text.toLowerCase();
    return text;
  }, [rightContent, ignoreCase]);

  // Dynamic placeholders in italics based on selected mode & language
  const leftPlaceholder = useMemo(() => {
    if (mode === 'code') {
      if (language === 'groovy') return '// Paste baseline Katalon Groovy script (v1) here or drop a .groovy file...';
      if (language === 'sql') return '-- Paste initial SQL schema DDL or baseline queries here or drop a .sql file...';
      return `// Paste original ${language} code here or drop code script...`;
    }
    if (mode === 'spreadsheet') return 'Paste CSV data or drag & drop baseline .xlsx / .csv spreadsheet...';
    if (mode === 'pdf') return 'Drag & drop baseline PDF file here or paste extracted PDF text...';
    return 'Paste original paragraph, documentation, or release notes here...';
  }, [mode, language]);

  const rightPlaceholder = useMemo(() => {
    if (mode === 'code') {
      if (language === 'groovy') return '// Paste modified Katalon Groovy script (v2) here or drop a .groovy file...';
      if (language === 'sql') return '-- Paste updated SQL migration script or queries here or drop a .sql file...';
      return `// Paste modified ${language} code here or drop code script...`;
    }
    if (mode === 'spreadsheet') return 'Paste CSV data or drag & drop target .xlsx / .csv spreadsheet...';
    if (mode === 'pdf') return 'Drag & drop modified PDF file here or paste extracted PDF text...';
    return 'Paste updated paragraph, documentation, or release notes here...';
  }, [mode, language]);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
      
      {/* Top Main Navigation Header */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between shadow-2xs z-30">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Return to Toolkit Dashboard"
          >
            <ArrowLeft size={18} />
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <GitCompare size={20} className="text-indigo-600" />
                <span>Data Compare</span>
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 border border-indigo-200">
                Multi-Format Diff
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Universal comparison for Groovy (Katalon), SQL, Code, Spreadsheets, PDF revisions, and Text
            </p>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-all"
            title="Copy diff summary report"
          >
            {copiedReport ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
            <span>{copiedReport ? 'Report Copied' : 'Copy Summary'}</span>
          </button>

          <button
            onClick={handleClearAll}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-all"
          >
            <Trash2 size={14} />
            <span>Clear</span>
          </button>

          <button
            onClick={() => setIsComparing(true)}
            disabled={isLoadingFile}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg shadow-xs transition-all"
          >
            {isLoadingFile ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Play size={14} />
            )}
            <span>{isLoadingFile ? 'Parsing...' : isComparing ? 'Re-Compare' : 'Compare Now'}</span>
          </button>
        </div>
      </header>

      {/* Mode & Sample Selector Bar */}
      <section className="bg-white border-b border-slate-200 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        
        {/* Left: Mode Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          <button
            onClick={() => setMode('code')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
              mode === 'code'
                ? 'bg-white text-indigo-700 shadow-2xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Code2 size={14} />
            <span>Code & Scripts</span>
          </button>

          <button
            onClick={() => setMode('text')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
              mode === 'text'
                ? 'bg-white text-indigo-700 shadow-2xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText size={14} />
            <span>Text Paragraphs</span>
          </button>

          <button
            onClick={() => setMode('spreadsheet')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
              mode === 'spreadsheet'
                ? 'bg-white text-indigo-700 shadow-2xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TableIcon size={14} />
            <span>Spreadsheets (Excel/CSV)</span>
          </button>

          <button
            onClick={() => setMode('pdf')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
              mode === 'pdf'
                ? 'bg-white text-indigo-700 shadow-2xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCheck size={14} />
            <span>PDF Documents</span>
          </button>
        </div>

        {/* Code Language Dropdown (if in code mode) */}
        {mode === 'code' && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Syntax Format:</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as CodeLanguage)}
              className="text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {CODE_LANGUAGES.map(lang => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Pre-load Sample Pills in Italic Style */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          <span className="text-xs font-semibold text-slate-400 italic shrink-0 flex items-center gap-1">
            <Sparkles size={12} className="text-amber-500" />
            <span>Quick Samples:</span>
          </span>
          {COMPARE_SAMPLES.map(sample => (
            <button
              key={sample.id}
              onClick={() => handleLoadSample(sample.id)}
              className="px-2.5 py-1 rounded-lg text-xs italic font-medium bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 border border-slate-200 hover:border-indigo-300 transition-all shrink-0"
              title={sample.description}
            >
              *{sample.name}*
            </button>
          ))}
        </div>

      </section>

      {/* Comparison Options Toolbar */}
      <section className="bg-slate-50 border-b border-slate-200 px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Left: View Toggles */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 shadow-2xs">
            <button
              onClick={() => setSplitView(true)}
              className={`px-2.5 py-1 rounded font-semibold transition-colors flex items-center gap-1 ${
                splitView ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Columns size={12} />
              <span>Split (Side-by-Side)</span>
            </button>
            <button
              onClick={() => setSplitView(false)}
              className={`px-2.5 py-1 rounded font-semibold transition-colors flex items-center gap-1 ${
                !splitView ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ListFilter size={12} />
              <span>Unified (Inline)</span>
            </button>
          </div>

          <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 select-none">
            <input
              type="checkbox"
              checked={ignoreWhitespace}
              onChange={(e) => setIgnoreWhitespace(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
            />
            <span>Ignore Whitespace</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 select-none">
            <input
              type="checkbox"
              checked={ignoreCase}
              onChange={(e) => setIgnoreCase(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
            />
            <span>Ignore Case</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 select-none">
            <input
              type="checkbox"
              checked={wordWrap}
              onChange={(e) => setWordWrap(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
            />
            <span>Word Wrap</span>
          </label>
        </div>

        {/* Right: Spreadsheet specifics or line counts */}
        <div className="flex items-center gap-3">
          {mode === 'spreadsheet' && (
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Key Column:</span>
              <input
                type="text"
                value={primaryKey}
                onChange={(e) => setPrimaryKey(e.target.value)}
                placeholder="e.g. SKU or ID"
                className="w-24 px-2 py-0.5 text-xs bg-white border border-slate-300 rounded font-mono"
                title="Column name used to identify matching rows (e.g. SKU, ID, email)"
              />
              <div className="flex bg-white rounded border border-slate-200 p-0.5">
                <button
                  onClick={() => setSpreadsheetViewType('table')}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${spreadsheetViewType === 'table' ? 'bg-indigo-600 text-white' : 'text-slate-600'}`}
                >
                  Table Grid
                </button>
                <button
                  onClick={() => setSpreadsheetViewType('text')}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${spreadsheetViewType === 'text' ? 'bg-indigo-600 text-white' : 'text-slate-600'}`}
                >
                  Raw CSV
                </button>
              </div>
            </div>
          )}

          {sheetDiff && (
            <div className="flex items-center gap-1.5 text-[11px] font-bold">
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                +{sheetDiff.stats.added} Added
              </span>
              <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
                -{sheetDiff.stats.removed} Removed
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                ~{sheetDiff.stats.modified} Changed
              </span>
            </div>
          )}
        </div>

      </section>

      {/* Main Dual Editor Panes */}
      <section className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 border-b border-slate-200 bg-white">
        
        {/* Left Pane (Baseline / Original) */}
        <div className="flex flex-col h-72 lg:h-80">
          <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 min-w-0 pr-2">
              <span className="font-bold text-slate-800 truncate">
                {leftTitle}
              </span>
              {leftFileName && (
                <span className="px-2 py-0.2 bg-slate-200 text-slate-700 rounded-full text-[10px] font-mono truncate">
                  {leftFileName}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[11px] text-slate-400 font-mono">
                {leftContent ? `${leftContent.split('\n').length} lines` : '0 lines'}
              </span>
              <button
                onClick={() => leftFileInputRef.current?.click()}
                className="p-1 rounded text-slate-500 hover:text-indigo-600 hover:bg-slate-200 transition-colors"
                title="Upload file for Left side"
              >
                <Upload size={13} />
              </button>
              <input
                ref={leftFileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload('left', file);
                }}
              />
            </div>
          </div>

          <textarea
            value={leftContent}
            onChange={(e) => setLeftContent(e.target.value)}
            placeholder={leftPlaceholder}
            className="flex-1 p-3 font-mono text-xs text-slate-800 bg-white resize-none focus:outline-none placeholder:italic placeholder:text-slate-400 leading-relaxed overflow-y-auto"
            spellCheck={false}
          />
        </div>

        {/* Right Pane (Modified / Target) */}
        <div className="flex flex-col h-72 lg:h-80">
          <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 min-w-0 pr-2">
              <span className="font-bold text-slate-800 truncate">
                {rightTitle}
              </span>
              {rightFileName && (
                <span className="px-2 py-0.2 bg-slate-200 text-slate-700 rounded-full text-[10px] font-mono truncate">
                  {rightFileName}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[11px] text-slate-400 font-mono">
                {rightContent ? `${rightContent.split('\n').length} lines` : '0 lines'}
              </span>
              <button
                onClick={() => rightFileInputRef.current?.click()}
                className="p-1 rounded text-slate-500 hover:text-indigo-600 hover:bg-slate-200 transition-colors"
                title="Upload file for Right side"
              >
                <Upload size={13} />
              </button>
              <input
                ref={rightFileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload('right', file);
                }}
              />
            </div>
          </div>

          <textarea
            value={rightContent}
            onChange={(e) => setRightContent(e.target.value)}
            placeholder={rightPlaceholder}
            className="flex-1 p-3 font-mono text-xs text-slate-800 bg-white resize-none focus:outline-none placeholder:italic placeholder:text-slate-400 leading-relaxed overflow-y-auto"
            spellCheck={false}
          />
        </div>

      </section>

      {/* Diff Results Container */}
      <main className="flex-1 p-4 sm:p-6 bg-slate-100 flex flex-col">
        
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col">
          
          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <GitCompare size={14} className="text-indigo-600" />
              <span>Comparison Output</span>
            </span>

            <span className="text-[11px] text-slate-500">
              {splitView ? 'Side-by-Side View' : 'Inline Unified View'}
            </span>
          </div>

          {/* Conditional Rendering: Spreadsheet Table Grid vs Code/Text Diff */}
          {mode === 'spreadsheet' && spreadsheetViewType === 'table' && sheetDiff ? (
            <div className="flex-1 overflow-x-auto p-4">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold">
                    <th className="p-2 border-r border-slate-200 text-center w-12">#</th>
                    <th className="p-2 border-r border-slate-200 text-center w-20">Diff</th>
                    {sheetDiff.headers.map(h => (
                      <th key={h} className="p-2 border-r border-slate-200 min-w-28 font-mono">
                        {h} {primaryKey === h && <span className="text-[9px] text-indigo-600 uppercase">(Key)</span>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono">
                  {sheetDiff.rows.map((row, idx) => {
                    const isAdded = row.status === 'added';
                    const isRemoved = row.status === 'removed';
                    const isModified = row.status === 'modified';

                    let rowBg = 'bg-white hover:bg-slate-50';
                    if (isAdded) rowBg = 'bg-emerald-50 hover:bg-emerald-100/70 text-emerald-950';
                    if (isRemoved) rowBg = 'bg-rose-50 hover:bg-rose-100/70 text-rose-950 line-through';
                    if (isModified) rowBg = 'bg-amber-50/70 hover:bg-amber-100/70 text-amber-950';

                    const rowNum = row.rowNumberRight || row.rowNumberLeft || (idx + 1);

                    return (
                      <tr key={idx} className={`${rowBg} transition-colors`}>
                        <td className="p-2 border-r border-slate-200 text-center text-slate-400 font-mono text-[10px]">
                          {rowNum}
                        </td>
                        <td className="p-2 border-r border-slate-200 text-center">
                          {isAdded && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-200 text-emerald-800">
                              + Added
                            </span>
                          )}
                          {isRemoved && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-200 text-rose-800">
                              - Removed
                            </span>
                          )}
                          {isModified && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-900">
                              ~ Changed
                            </span>
                          )}
                          {row.status === 'unchanged' && (
                            <span className="text-slate-400 text-[10px] font-bold">
                              Same
                            </span>
                          )}
                        </td>

                        {sheetDiff.headers.map(h => {
                          const isChangedCell = row.diffCells[h];
                          const leftVal = row.leftData ? String(row.leftData[h] ?? '') : '';
                          const rightVal = row.rightData ? String(row.rightData[h] ?? '') : '';

                          return (
                            <td
                              key={h}
                              className={`p-2 border-r border-slate-200 ${
                                isChangedCell
                                  ? 'bg-amber-200/80 font-bold border-amber-300'
                                  : ''
                              }`}
                            >
                              {isModified && isChangedCell ? (
                                <div className="space-y-0.5">
                                  <div className="line-through text-rose-700 text-[10px]">
                                    {leftVal || '<empty>'}
                                  </div>
                                  <div className="text-emerald-800 font-bold">
                                    {rightVal || '<empty>'}
                                  </div>
                                </div>
                              ) : (
                                <span>{rightVal || leftVal || '—'}</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex-1 overflow-x-auto text-xs font-mono">
              <ReactDiffViewer
                oldValue={processedLeftContent}
                newValue={processedRightContent}
                splitView={splitView}
                compareMethod={DiffMethod.WORDS}
                leftTitle={leftTitle}
                rightTitle={rightTitle}
                hideLineNumbers={false}
                useDarkTheme={false}
                styles={{
                  variables: {
                    light: {
                      diffViewerBackground: '#ffffff',
                      diffViewerColor: '#1e293b',
                      addedBackground: '#ecfdf5',
                      addedColor: '#065f46',
                      removedBackground: '#fff1f2',
                      removedColor: '#9f1239',
                      wordAddedBackground: '#a7f3d0',
                      wordRemovedBackground: '#fecdd3',
                      addedGutterBackground: '#d1fae5',
                      removedGutterBackground: '#ffe4e6',
                      gutterBackground: '#f8fafc',
                      gutterBackgroundDark: '#f1f5f9',
                      gutterColor: '#94a3b8',
                      codeFoldGutterBackground: '#f1f5f9',
                      codeFoldBackground: '#f8fafc'
                    }
                  },
                  line: {
                    padding: '2px 8px',
                    fontSize: '12px',
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                    lineHeight: '1.5',
                    wordBreak: wordWrap ? 'break-word' : 'normal',
                    whiteSpace: wordWrap ? 'pre-wrap' : 'pre'
                  }
                }}
              />
            </div>
          )}

        </div>

      </main>

    </div>
  );
};

export default DataCompare;

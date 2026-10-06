import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Upload, 
  Download, 
  FileText, 
  Layout, 
  CheckCircle, 
  Undo, 
  Redo, 
  PenTool, 
  Menu, 
  X, 
  ArrowLeft,
  Table2,
  Trash2,
  Plus,
  Info,
  Check,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import PDFPreview from '../components/PdfTablePlacer/PDFPreview';
import { readFileAsArrayBuffer, insertTableIntoPDF } from '../utils/pdfUtils';
import { TableData, Placement, ProcessingStatus, SignatureData } from '../types';
import ImageProcessorModal from '../components/PdfTablePlacer/ImageProcessorModal';

// Initial Data with Dimensions
const INITIAL_TABLE_DATA: TableData = {
  headers: ['Header 1', 'Header 2'],
  rows: [
    ['Cell 1', 'Cell 2']
  ],
  columnWidths: [100, 100],
  rowHeights: [30, 30],
  merges: [],
  styles: {}
};

type StudioTab = 'table' | 'signatures' | 'document';

const TABLE_PRESETS: { id: string; name: string; desc: string; data: TableData }[] = [
  {
    id: 'basic-2x2',
    name: '2×2 Basic Grid',
    desc: '2 columns, 1 header row, 1 data row',
    data: {
      headers: ['Item / Description', 'Value / Amount'],
      rows: [['Service / Goods', '$0.00']],
      columnWidths: [140, 100],
      rowHeights: [28, 28],
      merges: [],
      styles: {
        '0,0': { bold: true, align: 'left' },
        '0,1': { bold: true, align: 'right' },
        '1,1': { align: 'right' }
      }
    }
  },
  {
    id: 'signoff-block',
    name: 'Sign-Off & Approval Block',
    desc: 'Approved by, signature line, and date',
    data: {
      headers: ['Approved By', 'Signature', 'Date Signed'],
      rows: [['Authorized Signer', '', 'DD / MM / YYYY']],
      columnWidths: [120, 120, 100],
      rowHeights: [26, 45],
      merges: [],
      styles: {
        '0,0': { bold: true },
        '0,1': { bold: true },
        '0,2': { bold: true },
        '1,0': { align: 'left', vAlign: 'middle' },
        '1,2': { align: 'center', vAlign: 'middle' }
      }
    }
  },
  {
    id: 'summary-3col',
    name: '3-Column Summary Table',
    desc: 'Task, status, and completion date',
    data: {
      headers: ['Milestone', 'Status', 'Target Date'],
      rows: [
        ['Phase 1: Verification', 'Completed', '2026-09-28'],
        ['Phase 2: Review & Sign', 'In Progress', '2026-09-30']
      ],
      columnWidths: [150, 90, 90],
      rowHeights: [26, 26, 26],
      merges: [],
      styles: {
        '0,0': { bold: true },
        '0,1': { bold: true, align: 'center' },
        '0,2': { bold: true, align: 'center' },
        '1,1': { align: 'center' },
        '1,2': { align: 'center' },
        '2,1': { align: 'center' },
        '2,2': { align: 'center' }
      }
    }
  }
];

const PdfTablePlacer: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileData, setFileData] = useState<ArrayBuffer | null>(null);
  const [placement, setPlacement] = useState<Placement | null>(null);
  const [status, setStatus] = useState<ProcessingStatus>('idle');

  // Signature State
  const [signatures, setSignatures] = useState<SignatureData[]>([]);
  const [signatureModalOpen, setSignatureModalOpen] = useState<boolean>(false);
  const [signatureFileToProcess, setSignatureFileToProcess] = useState<File | null>(null);

  // Active Page State
  const [activePageIndex, setActivePageIndex] = useState<number>(0);

  // Inspector Studio Tabs
  const [activeStudioTab, setActiveStudioTab] = useState<StudioTab>('table');

  // Sidebar Mobile State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Zoom scale
  const [scale, setScale] = useState<number>(1.1);

  // History Management
  const [history, setHistory] = useState<TableData[]>([INITIAL_TABLE_DATA]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const tableData = history[historyIndex];

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTableDataChange = useCallback((newData: TableData) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(newData);
      return newHistory;
    });
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
    }
  }, [historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
    }
  }, [historyIndex, history.length]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  const handleRemoveFile = () => {
    setFile(null);
    setFileData(null);
    setPlacement(null);
    setSignatures([]);
    setActivePageIndex(0);
    setHistory([INITIAL_TABLE_DATA]);
    setHistoryIndex(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // File Handlers
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setStatus('loading');
      try {
        const buffer = await readFileAsArrayBuffer(selectedFile);
        setFileData(buffer);
        setStatus('idle');
        setPlacement(null);
        setSignatures([]);
        setActivePageIndex(0);
        setHistory([INITIAL_TABLE_DATA]);
        setHistoryIndex(0);
        setIsSidebarOpen(false);
      } catch (error) {
        console.error("File read error", error);
        setStatus('error');
      }
    }
  };

  const handleDownload = async () => {
    if (!fileData) return;
    if (!placement && signatures.length === 0) return;
    
    setStatus('processing');
    try {
      const newPdfBytes = await insertTableIntoPDF(fileData, tableData, placement, signatures);
      const blob = new Blob([newPdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `updated_${file?.name || 'document.pdf'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (error) {
      console.error("PDF Generation Error", error);
      setStatus('error');
    }
  };

  // Signature Logic
  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setSignatureFileToProcess(selected);
      setSignatureModalOpen(true);
      e.target.value = '';
    }
  };

  const addSignature = (dataUrl: string) => {
     setSignatures(prev => [...prev, {
         id: Math.random().toString(36).substring(2, 11),
         dataUrl,
         x: 80,
         y: 120, 
         width: 150,
         height: 70,
         pageIndex: activePageIndex
     }]);
     setSignatureFileToProcess(null);
     setSignatureModalOpen(false);
     setIsSidebarOpen(false);
  };

  const updateSignature = (updated: SignatureData) => {
      setSignatures(prev => prev.map(s => s.id === updated.id ? updated : s));
  };

  const removeSignature = (id: string) => {
      setSignatures(prev => prev.filter(s => s.id !== id));
  };

  // Place or center table on current page
  const handlePlaceTableOnActivePage = () => {
    setPlacement({
      pageIndex: activePageIndex,
      x: 60,
      y: 540,
      pageWidth: 612,
      pageHeight: 792
    });
    // Scroll to page
    const el = document.getElementById(`pdf-page-container-${activePageIndex}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Quick Preset Selection
  const applyPreset = (preset: typeof TABLE_PRESETS[0]) => {
    handleTableDataChange(preset.data);
    if (!placement) {
      handlePlaceTableOnActivePage();
    }
  };

  // Scroll smoothly to a specific page
  const scrollToPage = (pageIdx: number) => {
    setActivePageIndex(pageIdx);
    const el = document.getElementById(`pdf-page-container-${pageIdx}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Formatted file size helper
  const formattedFileSize = file ? (file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : `${Math.round(file.size / 1024)} KB`) : null;

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Global Hidden File Input for PDF uploads */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="application/pdf"
        onChange={handleFileUpload}
      />

      {/* Signature Modal (Draw or Upload) */}
      {(signatureModalOpen || signatureFileToProcess) && (
        <ImageProcessorModal 
          file={signatureFileToProcess} 
          onConfirm={addSignature} 
          onCancel={() => {
            setSignatureModalOpen(false);
            setSignatureFileToProcess(null);
          }} 
        />
      )}

      {/* Top Application Header */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-6 h-16 flex items-center justify-between shrink-0 z-30 shadow-xs relative">
        <div className="flex items-center gap-3 min-w-0">
          <Link 
            to="/" 
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex items-center shrink-0"
            title="Back to Toolkit Dashboard"
          >
            <ArrowLeft size={18} />
          </Link>

          <button 
            className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            title="Toggle Studio Inspector"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          
          <div className="bg-indigo-600 text-white p-2 rounded-lg shrink-0 shadow-xs">
            <Layout size={18} />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight truncate">
                PDF Sign & Table Placer
              </h1>
              <span className="text-xs font-semibold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-200 hidden sm:inline-block">
                v2.1
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden md:block truncate">
              {file ? `${file.name} (${formattedFileSize})` : 'Position interactive tables and electronic signatures on PDF pages'}
            </p>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Global Undo / Redo */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button 
              onClick={undo} 
              disabled={historyIndex === 0}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded disabled:opacity-30 disabled:hover:bg-transparent transition-all"
              title="Undo (Ctrl+Z)"
            >
              <Undo size={14} />
            </button>
            <button 
              onClick={redo} 
              disabled={historyIndex === history.length - 1}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded disabled:opacity-30 disabled:hover:bg-transparent transition-all"
              title="Redo (Ctrl+Y)"
            >
              <Redo size={14} />
            </button>
          </div>

          {/* Primary Action Button: Download PDF */}
          <button
            onClick={handleDownload}
            disabled={!fileData || (!placement && signatures.length === 0) || status === 'processing'}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed rounded-lg shadow-xs transition-all"
            title="Generate and export updated PDF"
          >
            {status === 'processing' ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="hidden sm:inline">Generating...</span>
              </>
            ) : status === 'success' ? (
              <>
                <Check size={14} className="text-white" />
                <span>Downloaded!</span>
              </>
            ) : (
              <>
                <Download size={14} />
                <span>Export PDF</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Studio Workspace Layout */}
      <main className="flex-1 flex overflow-hidden relative">
        
        {/* Mobile Backdrop */}
        {isSidebarOpen && (
          <div 
            className="absolute inset-0 bg-slate-900/40 z-20 lg:hidden backdrop-blur-xs transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Left Studio Inspector Panel */}
        <aside 
          className={`
            absolute top-0 bottom-0 left-0 z-30 w-84 bg-white border-r border-slate-200 flex flex-col shadow-xl 
            transition-transform duration-300 ease-in-out
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            lg:static lg:translate-x-0 lg:shadow-none
          `}
        >
          {/* Mobile Drawer Close Header */}
          <div className="lg:hidden flex items-center justify-between p-3.5 border-b border-slate-200 bg-slate-50">
            <span className="font-bold text-xs text-slate-800 uppercase tracking-wider">Studio Inspector</span>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="p-1 bg-white border border-slate-200 rounded-md text-slate-500 hover:text-slate-700"
            >
              <X size={16} />
            </button>
          </div>

          {/* Segmented Studio Tabs */}
          <div className="p-3 border-b border-slate-200 bg-slate-50/50 flex items-center gap-1">
            <button
              onClick={() => setActiveStudioTab('table')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 ${
                activeStudioTab === 'table'
                  ? 'bg-white text-indigo-700 shadow-2xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Table2 size={13} />
              <span>Table</span>
              {placement && (
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
              )}
            </button>

            <button
              onClick={() => setActiveStudioTab('signatures')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 ${
                activeStudioTab === 'signatures'
                  ? 'bg-white text-indigo-700 shadow-2xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PenTool size={13} />
              <span>Signatures</span>
              {signatures.length > 0 && (
                <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-mono">
                  {signatures.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveStudioTab('document')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 ${
                activeStudioTab === 'document'
                  ? 'bg-white text-indigo-700 shadow-2xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText size={13} />
              <span>Doc</span>
            </button>
          </div>

          {/* Tab Content Panes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
            
            {/* ============================================================== */}
            {/* TAB 1: TABLE STUDIO                                            */}
            {/* ============================================================== */}
            {activeStudioTab === 'table' && (
              <div className="space-y-4">
                {/* Placement Status Card */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Placement Status
                    </span>
                    {placement ? (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle size={10} /> Page {placement.pageIndex + 1}
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                        Not Placed
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {placement
                      ? `Table is positioned on Page ${placement.pageIndex + 1}. Drag the table border to relocate or use handles to resize.`
                      : 'Click anywhere on the PDF sheet in the canvas to place your table, or use the quick button below.'}
                  </p>

                  <div className="flex items-center gap-2 pt-1">
                    {!fileData ? (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <Upload size={13} />
                        <span>Upload PDF First</span>
                      </button>
                    ) : !placement ? (
                      <button
                        onClick={handlePlaceTableOnActivePage}
                        className="flex-1 py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <Plus size={13} />
                        <span>Place on Page {activePageIndex + 1}</span>
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={handlePlaceTableOnActivePage}
                          className="flex-1 py-1.5 px-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg font-medium text-xs transition-colors"
                          title="Re-center table"
                        >
                          Center on Page {activePageIndex + 1}
                        </button>
                        <button
                          onClick={() => setPlacement(null)}
                          className="py-1.5 px-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-medium text-xs transition-colors flex items-center gap-1"
                          title="Remove Table Placement"
                        >
                          <Trash2 size={13} />
                          <span>Remove</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Table Dimensions & Structure Summary */}
                <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Grid Structure
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <span className="text-slate-400 text-[10px] block">Columns</span>
                      <span className="font-mono font-bold text-slate-800 text-sm">
                        {tableData.headers.length} cols
                      </span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <span className="text-slate-400 text-[10px] block">Rows</span>
                      <span className="font-mono font-bold text-slate-800 text-sm">
                        {tableData.rows.length + 1} rows
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Quick Table Templates
                  </span>
                  <div className="flex flex-col gap-1.5">
                    {TABLE_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => applyPreset(preset)}
                        className="w-full text-left p-2.5 bg-white hover:bg-indigo-50/50 hover:border-indigo-200 border border-slate-200 rounded-xl transition-all group"
                      >
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="font-semibold text-slate-800 group-hover:text-indigo-700">
                            {preset.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">Apply</span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-normal">
                          {preset.desc}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Interactive Editing Cheatsheet */}
                <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-1.5 text-[11px] text-indigo-900">
                  <span className="font-bold flex items-center gap-1 text-indigo-950">
                    <Info size={12} className="text-indigo-600" />
                    <span>How to Edit Table on PDF:</span>
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-slate-600 leading-relaxed pl-1">
                    <li><strong className="text-slate-800">Double-click</strong> any cell to type text</li>
                    <li><strong className="text-slate-800">Drag borders</strong> to adjust column/row widths</li>
                    <li><strong className="text-slate-800">Bottom-right handle</strong> scales whole table</li>
                    <li><strong className="text-slate-800">Drag across cells</strong> to select, merge, or format</li>
                  </ul>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB 2: SIGNATURE STUDIO                                        */}
            {/* ============================================================== */}
            {activeStudioTab === 'signatures' && (
              <div className="space-y-4">
                {/* Add Signature Action Cards */}
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Add New Signature
                  </span>

                  <button
                    onClick={() => {
                      setSignatureFileToProcess(null);
                      setSignatureModalOpen(true);
                    }}
                    className="w-full py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs"
                  >
                    <PenTool size={14} />
                    <span>Draw or Upload Signature</span>
                  </button>

                  <label className="w-full py-2 px-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl font-medium text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs">
                    <Upload size={14} className="text-slate-500" />
                    <span>Upload Image Directly</span>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleSignatureUpload} 
                    />
                  </label>
                </div>

                {/* Placed Signatures List */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Placed Signatures ({signatures.length})
                    </span>
                    {signatures.length > 0 && (
                      <button
                        onClick={() => setSignatures([])}
                        className="text-[11px] text-rose-600 hover:text-rose-700"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  {signatures.length === 0 ? (
                    <div className="p-6 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center flex flex-col items-center justify-center">
                      <PenTool size={24} className="text-slate-300 mb-2" />
                      <span className="text-slate-600 font-medium text-xs mb-0.5">No Signatures Placed</span>
                      <p className="text-[11px] text-slate-400">
                        Draw or upload your signature to place it on the document.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {signatures.map((sig, index) => (
                        <div 
                          key={sig.id}
                          className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-2 shadow-2xs hover:border-slate-300 transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-12 h-9 bg-slate-100 rounded border border-slate-200 overflow-hidden flex items-center justify-center p-0.5 shrink-0">
                              <img 
                                src={sig.dataUrl} 
                                alt="Signature preview" 
                                className="max-w-full max-h-full object-contain" 
                              />
                            </div>
                            <div className="min-w-0">
                              <span className="font-semibold text-slate-800 block text-xs truncate">
                                Signature #{index + 1}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                Page {sig.pageIndex + 1} · {Math.round(sig.width)}×{Math.round(sig.height)}pt
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => scrollToPage(sig.pageIndex)}
                              className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded"
                              title={`Jump to Page ${sig.pageIndex + 1}`}
                            >
                              <ExternalLink size={13} />
                            </button>
                            <button
                              onClick={() => removeSignature(sig.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                              title="Delete this signature"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500 leading-relaxed">
                  💡 <strong className="text-slate-700">Tip:</strong> You can drag any signature across the PDF canvas to place it, and use the bottom-right corner circle to resize it.
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB 3: DOCUMENT INFO & PAGES                                   */}
            {/* ============================================================== */}
            {activeStudioTab === 'document' && (
              <div className="space-y-4">
                {/* Upload or Replace PDF Box */}
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Document File
                  </span>

                  {file ? (
                    <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="p-1.5 bg-red-50 text-red-600 rounded-md shrink-0">
                            <FileText size={16} />
                          </div>
                          <div className="min-w-0">
                            <span className="font-semibold text-slate-900 block text-xs truncate">
                              {file.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {formattedFileSize}
                            </span>
                          </div>
                        </div>
                        <CheckCircle size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="flex-1 py-1.5 px-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
                          title="Select a different PDF file"
                        >
                          <RefreshCw size={12} className="text-slate-500" />
                          <span>Replace File</span>
                        </button>
                        <button
                          onClick={handleRemoveFile}
                          className="py-1.5 px-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 shrink-0"
                          title="Delete uploaded PDF and clear workspace"
                        >
                          <Trash2 size={12} />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer bg-slate-50/50 hover:bg-slate-50 transition-all"
                    >
                      <Upload className="w-8 h-8 text-slate-400 mb-2" />
                      <span className="text-xs font-semibold text-slate-700">Click to upload PDF</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">Supports multi-page documents</span>
                    </div>
                  )}
                </div>

                {/* Export Summary Checklist */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Export Checklist
                  </span>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>PDF Document:</span>
                      <span className="font-semibold text-slate-800">
                        {file ? 'Loaded' : 'None'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Table Placed:</span>
                      <span className="font-semibold text-slate-800">
                        {placement ? `Page ${placement.pageIndex + 1}` : 'None'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Signatures:</span>
                      <span className="font-semibold text-slate-800">
                        {signatures.length}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleDownload}
                    disabled={!fileData || (!placement && signatures.length === 0)}
                    className="w-full mt-2 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Download size={13} />
                    <span>Download Final PDF</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Main Canvas Viewport Area */}
        <section className="flex-1 bg-slate-100/60 p-4 sm:p-6 flex flex-col h-full overflow-hidden relative z-10">
          <PDFPreview 
            fileData={fileData} 
            onPlacementSelect={setPlacement}
            selectedPlacement={placement}
            tableData={tableData}
            onTableDataChange={handleTableDataChange}
            onDeleteTable={() => setPlacement(null)}
            signatures={signatures}
            onSignatureUpdate={updateSignature}
            onSignatureRemove={removeSignature}
            onActivePageChange={setActivePageIndex}
            activePageIndex={activePageIndex}
            scale={scale}
            onScaleChange={setScale}
            onUploadClick={() => fileInputRef.current?.click()}
          />
        </section>

      </main>
    </div>
  );
};

export default PdfTablePlacer;

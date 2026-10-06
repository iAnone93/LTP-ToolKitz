import React, { useEffect, useRef, useState } from 'react';
import { getPDFDocument, renderPageToCanvas } from '../../utils/pdfUtils';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Download,
  ExternalLink,
  FileText,
  AlertCircle
} from 'lucide-react';

interface PdfCanvasViewerProps {
  data: ArrayBuffer | Uint8Array | string;
  title?: string;
  size?: number;
  heightClass?: string;
  onDownload?: () => void;
}

export const PdfCanvasViewer: React.FC<PdfCanvasViewerProps> = ({
  data,
  title = 'PDF Document Preview',
  size,
  heightClass = 'h-80',
  onDownload
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [numPages, setNumPages] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.2);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [externalUrl, setExternalUrl] = useState<string | null>(null);

  // Convert incoming data to ArrayBuffer
  useEffect(() => {
    let active = true;
    let urlToRevoke: string | null = null;

    const loadDocument = async () => {
      try {
        setLoading(true);
        setError(null);

        let arrayBuffer: ArrayBuffer;

        if (typeof data === 'string') {
          // Could be Data URI or raw Base64
          let base64 = data.trim();
          if (base64.startsWith('data:')) {
            const commaIndex = base64.indexOf(',');
            base64 = commaIndex !== -1 ? base64.slice(commaIndex + 1) : base64;
          }
          const clean = base64.replace(/\s+/g, '');
          const binaryStr = atob(clean);
          const bytes = new Uint8Array(binaryStr.length);
          for (let i = 0; i < binaryStr.length; i++) {
            bytes[i] = binaryStr.charCodeAt(i);
          }
          arrayBuffer = bytes.buffer;

          const blob = new Blob([bytes], { type: 'application/pdf' });
          urlToRevoke = URL.createObjectURL(blob);
          if (active) setExternalUrl(urlToRevoke);
        } else if (data instanceof Uint8Array) {
          const copy = new Uint8Array(data.byteLength);
          copy.set(data);
          arrayBuffer = copy.buffer;
          const blob = new Blob([copy], { type: 'application/pdf' });
          urlToRevoke = URL.createObjectURL(blob);
          if (active) setExternalUrl(urlToRevoke);
        } else {
          arrayBuffer = data.slice(0);
          const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
          urlToRevoke = URL.createObjectURL(blob);
          if (active) setExternalUrl(urlToRevoke);
        }

        const doc = await getPDFDocument(arrayBuffer);
        if (!active) return;
        setPdfDoc(doc);
        setNumPages(doc.numPages);
        setCurrentPage(1);
      } catch (err: any) {
        if (!active) return;
        console.error('Failed to load PDF via PDF.js:', err);
        setError(err.message || 'Could not parse PDF content');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadDocument();

    return () => {
      active = false;
      if (urlToRevoke) {
        URL.revokeObjectURL(urlToRevoke);
      }
    };
  }, [data]);

  // Render current page to canvas
  useEffect(() => {
    let cancel = false;
    const renderPage = async () => {
      if (!pdfDoc || !canvasRef.current) return;
      try {
        const canvas = canvasRef.current;
        await renderPageToCanvas(pdfDoc, currentPage - 1, canvas, scale);
      } catch (err: any) {
        if (!cancel) {
          console.error('Error rendering PDF page to canvas:', err);
        }
      }
    };

    renderPage();
    return () => {
      cancel = true;
    };
  }, [pdfDoc, currentPage, scale]);

  const formatBytes = (bytes: number): string => {
    if (!bytes) return '';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  return (
    <div className={`border border-slate-200 rounded-xl overflow-hidden bg-slate-100 flex flex-col ${heightClass} shadow-xs`}>
      {/* Viewer Header Bar */}
      <div className="bg-white px-3 py-2 border-b border-slate-200 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1 bg-red-50 text-red-600 rounded">
            <FileText size={15} />
          </div>
          <span className="text-xs font-bold text-slate-800 truncate">{title}</span>
          {size && (
            <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
              ({formatBytes(size)})
            </span>
          )}
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-1.5 text-xs">
          {numPages > 1 && (
            <div className="flex items-center gap-1 bg-slate-100 rounded-md px-1 py-0.5 border border-slate-200">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="p-1 rounded text-slate-600 hover:text-slate-900 disabled:text-slate-300 disabled:cursor-not-allowed"
                title="Previous Page"
              >
                <ChevronLeft size={13} />
              </button>
              <span className="text-[11px] font-mono text-slate-700 px-1">
                {currentPage} / {numPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
                disabled={currentPage >= numPages}
                className="p-1 rounded text-slate-600 hover:text-slate-900 disabled:text-slate-300 disabled:cursor-not-allowed"
                title="Next Page"
              >
                <ChevronRight size={13} />
              </button>
            </div>
          )}

          {/* Zoom controls */}
          <div className="hidden sm:flex items-center gap-0.5 bg-slate-100 rounded-md p-0.5 border border-slate-200">
            <button
              onClick={() => setScale((s) => Math.max(0.6, s - 0.2))}
              className="p-1 rounded text-slate-600 hover:text-slate-900"
              title="Zoom Out"
            >
              <ZoomOut size={13} />
            </button>
            <span className="text-[10px] font-mono text-slate-600 px-1">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={() => setScale((s) => Math.min(2.5, s + 0.2))}
              className="p-1 rounded text-slate-600 hover:text-slate-900"
              title="Zoom In"
            >
              <ZoomIn size={13} />
            </button>
          </div>

          {/* External tab / download actions */}
          {externalUrl && (
            <a
              href={externalUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
              title="Open full PDF in new tab"
            >
              <ExternalLink size={14} />
            </a>
          )}

          {onDownload && (
            <button
              onClick={onDownload}
              className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded transition-colors"
              title="Download PDF"
            >
              <Download size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Main Canvas View Area */}
      <div className="flex-1 overflow-auto p-4 flex items-center justify-center relative bg-slate-200/70">
        {loading && (
          <div className="flex flex-col items-center justify-center gap-2 text-slate-500 text-xs">
            <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Rendering PDF with PDF.js...</span>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center p-6 text-center max-w-sm">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-2">
              <AlertCircle size={20} />
            </div>
            <h4 className="text-xs font-bold text-slate-800 mb-1">Canvas Render Note</h4>
            <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
              {error.includes('Password')
                ? 'This PDF is password-protected.'
                : 'The PDF binary stream can be saved directly to your device.'}
            </p>
            {onDownload && (
              <button
                onClick={onDownload}
                className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 flex items-center gap-1.5 shadow-xs"
              >
                <Download size={13} />
                <span>Download PDF File</span>
              </button>
            )}
          </div>
        )}

        {/* Canvas Element with Shadow and Border */}
        <canvas
          ref={canvasRef}
          className={`shadow-md rounded border border-slate-300 max-w-full bg-white transition-opacity ${
            loading || error ? 'hidden' : 'block'
          }`}
        />
      </div>
    </div>
  );
};

export default PdfCanvasViewer;

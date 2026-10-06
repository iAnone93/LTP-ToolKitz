import React, { useEffect, useRef, useState } from 'react';
import { getPDFDocument } from '../../utils/pdfUtils';
import { Placement, TableData, SignatureData } from '../../types';
import { 
  ZoomIn, 
  ZoomOut, 
  FileText, 
  ChevronLeft, 
  ChevronRight, 
  Table2, 
  PenTool, 
  Sparkles,
  Maximize2
} from 'lucide-react';
import TableOverlay from './TableOverlay';
import SignatureOverlay from './SignatureOverlay';

interface PDFPreviewProps {
  fileData: ArrayBuffer | null;
  onPlacementSelect: (placement: Placement) => void;
  selectedPlacement: Placement | null;
  tableData: TableData;
  onTableDataChange: (data: TableData) => void;
  onDeleteTable: () => void;
  signatures: SignatureData[];
  onSignatureUpdate: (sig: SignatureData) => void;
  onSignatureRemove: (id: string) => void;
  onActivePageChange?: (index: number) => void;
  activePageIndex?: number;
  scale?: number;
  onScaleChange?: (scale: number) => void;
  onUploadClick?: () => void;
}

const PDFPreview: React.FC<PDFPreviewProps> = ({ 
  fileData, 
  onPlacementSelect, 
  selectedPlacement,
  tableData,
  onTableDataChange,
  onDeleteTable,
  signatures,
  onSignatureUpdate,
  onSignatureRemove,
  onActivePageChange,
  activePageIndex = 0,
  scale: externalScale,
  onScaleChange,
  onUploadClick
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [internalScale, setInternalScale] = useState(1.0);
  const [rendering, setRendering] = useState(false);

  const scale = externalScale !== undefined ? externalScale : internalScale;
  const setScale = (newScale: number | ((prev: number) => number)) => {
    const resolved = typeof newScale === 'function' ? newScale(scale) : newScale;
    const clamped = Math.max(0.5, Math.min(3.0, resolved));
    if (onScaleChange) {
      onScaleChange(clamped);
    } else {
      setInternalScale(clamped);
    }
  };

  // --- Drag & Drop State for Signatures ---
  const [dragState, setDragState] = useState<{
    sigId: string;
    offsetX: number; 
    offsetY: number;
    width: number;
    height: number;
    dataUrl: string;
    clientX: number;
    clientY: number;
  } | null>(null);

  useEffect(() => {
    const loadPdf = async () => {
      if (!fileData) {
        setPdfDoc(null);
        setNumPages(0);
        return;
      }
      try {
        setRendering(true);
        const doc = await getPDFDocument(fileData);
        setPdfDoc(doc);
        setNumPages(doc.numPages);
      } catch (err) {
        console.error("Error loading PDF", err);
      } finally {
        setRendering(false);
      }
    };
    loadPdf();
  }, [fileData]);

  // --- Active Page Detection ---
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !onActivePageChange) return;

    const handleScroll = () => {
      const pages = container.querySelectorAll('[data-page-index]');
      const containerRect = container.getBoundingClientRect();
      const centerY = containerRect.top + containerRect.height / 2;

      let closestPage = 0;
      let minDistance = Infinity;

      pages.forEach((page) => {
        const rect = page.getBoundingClientRect();
        const pageCenterY = rect.top + rect.height / 2;
        const distance = Math.abs(centerY - pageCenterY);
        if (distance < minDistance) {
          minDistance = distance;
          closestPage = parseInt(page.getAttribute('data-page-index') || '0', 10);
        }
      });
      onActivePageChange(closestPage);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [onActivePageChange, numPages]);

  // Scroll to active page
  const scrollToPage = (pageIdx: number) => {
    const el = document.getElementById(`pdf-page-container-${pageIdx}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // --- Global Drag Logic ---
  const handleSigDragStart = (e: React.MouseEvent, sig: SignatureData) => {
    e.preventDefault();
    e.stopPropagation();
    
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    setDragState({
      sigId: sig.id,
      offsetX,
      offsetY,
      width: sig.width,
      height: sig.height,
      dataUrl: sig.dataUrl,
      clientX: e.clientX,
      clientY: e.clientY
    });
  };

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!dragState) return;
      setDragState(prev => prev ? ({ ...prev, clientX: e.clientX, clientY: e.clientY }) : null);
    };

    const handleUp = (e: MouseEvent) => {
      if (!dragState) return;

      const elements = document.elementsFromPoint(e.clientX, e.clientY);
      const pageEl = elements.find(el => el.hasAttribute('data-page-index'));

      if (pageEl) {
        const pageIndex = parseInt(pageEl.getAttribute('data-page-index') || '0', 10);
        const rect = pageEl.getBoundingClientRect();
        
        const visX = (e.clientX - dragState.offsetX) - rect.left;
        const visY = (e.clientY - dragState.offsetY) - rect.top;

        const pdfX = visX / scale;
        const pdfY = (rect.height - visY) / scale - dragState.height;

        const targetSig = signatures.find(s => s.id === dragState.sigId);
        if (targetSig) {
          onSignatureUpdate({
             ...targetSig,
             pageIndex,
             x: pdfX,
             y: pdfY
          });
        }
      }

      setDragState(null);
    };

    if (dragState) {
        window.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseup', handleUp);
    }
    return () => {
        window.removeEventListener('mousemove', handleMove);
        window.removeEventListener('mouseup', handleUp);
    };
  }, [dragState, scale, signatures, onSignatureUpdate]);

  // Handle Canvas Click (Table Placement)
  const handleCanvasClick = (
    e: React.MouseEvent<HTMLDivElement>, 
    pageIndex: number, 
    viewport: any
  ) => {
    if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).closest('button')) {
      return;
    }
    if (selectedPlacement) return;
    if (!containerRef.current) return;
    
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const xCanvas = e.clientX - rect.left;
    const yCanvas = e.clientY - rect.top;

    const xPdf = xCanvas / scale;
    const yPdf = (viewport.height - yCanvas) / scale;

    onPlacementSelect({
      pageIndex,
      x: xPdf,
      y: yPdf,
      pageWidth: viewport.width / scale,
      pageHeight: viewport.height / scale,
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-100/90 rounded-2xl overflow-hidden border border-slate-200 relative shadow-xs">
      {/* Dragging Overlay (Global) */}
      {dragState && (
        <div 
          className="fixed z-50 pointer-events-none opacity-85 shadow-2xl"
          style={{
            left: dragState.clientX - dragState.offsetX,
            top: dragState.clientY - dragState.offsetY,
            width: dragState.width * scale,
            height: dragState.height * scale,
          }}
        >
          <img src={dragState.dataUrl} className="w-full h-full object-contain" alt="Dragging Signature" />
          <div className="absolute inset-0 border-2 border-indigo-600 border-dashed rounded bg-indigo-50/20"></div>
        </div>
      )}

      {/* Floating Canvas Top Toolbar */}
      <div className="bg-white/95 backdrop-blur-md px-4 py-2 border-b border-slate-200 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
        {/* Left: Active Page Navigation */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-700">
            <span className="font-semibold text-slate-900">Document Canvas</span>
            {numPages > 0 && (
              <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                {numPages} {numPages === 1 ? 'page' : 'pages'}
              </span>
            )}
          </div>

          {numPages > 1 && (
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
              <button
                onClick={() => scrollToPage(Math.max(0, activePageIndex - 1))}
                disabled={activePageIndex <= 0}
                className="p-1 text-slate-600 hover:text-slate-900 disabled:text-slate-300 disabled:cursor-not-allowed rounded hover:bg-white transition-colors"
                title="Previous Page"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="text-[11px] font-medium text-slate-700 px-1 font-mono">
                Page {activePageIndex + 1} of {numPages}
              </span>
              <button
                onClick={() => scrollToPage(Math.min(numPages - 1, activePageIndex + 1))}
                disabled={activePageIndex >= numPages - 1}
                className="p-1 text-slate-600 hover:text-slate-900 disabled:text-slate-300 disabled:cursor-not-allowed rounded hover:bg-white transition-colors"
                title="Next Page"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Center: Contextual Tool Hint */}
        <div className="hidden lg:flex items-center gap-2 text-xs">
          {!selectedPlacement ? (
            <span className="text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 flex items-center gap-1.5 animate-pulse">
              <Table2 size={12} className="text-amber-600" />
              <span>Click anywhere on any page to place the custom table</span>
            </span>
          ) : (
            <span className="text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200 flex items-center gap-1.5">
              <Sparkles size={12} className="text-indigo-600" />
              <span>Table active on Page {selectedPlacement.pageIndex + 1} · Double-click cells to edit text</span>
            </span>
          )}
        </div>
      </div>

      {/* Pages Viewport Container */}
      <div 
        className="flex-1 overflow-auto p-6 sm:p-10 relative flex flex-col items-center" 
        ref={containerRef}
        style={{
          backgroundImage: 'radial-gradient(#e2e8f0 1.2px, transparent 1.2px)',
          backgroundSize: '24px 24px'
        }}
      >
        {!fileData && (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 max-w-md my-auto">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mb-4 shadow-xs">
              <FileText size={32} />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">No PDF Document Loaded</h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-5">
              Upload a PDF document to preview pages directly on the canvas and place customizable tables, approval grids, and signatures.
            </p>
            {onUploadClick && (
              <button
                onClick={onUploadClick}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-2"
              >
                <FileText size={14} />
                <span>Upload PDF to Preview</span>
              </button>
            )}
          </div>
        )}

        {rendering && (
           <div className="h-full flex flex-col items-center justify-center text-indigo-600 gap-3 my-auto">
             <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
             <span className="text-xs font-semibold text-slate-600">Rendering document pages...</span>
           </div>
        )}

        {pdfDoc && Array.from({ length: numPages }, (_, i) => (
          <div 
            key={i} 
            id={`pdf-page-container-${i}`} 
            className="mb-10 flex flex-col items-center w-full"
          >
            {/* Sheet Metadata Label */}
            <div 
              className="flex items-center justify-between mb-2 text-xs text-slate-500"
              style={{ width: `${(pdfDoc?.viewportWidth || 612) * scale}px`, maxWidth: '100%' }}
            >
              <span className="font-semibold text-slate-700 bg-white/90 backdrop-blur-xs px-2.5 py-0.5 rounded-md border border-slate-200 shadow-2xs font-mono">
                Page {i + 1} of {numPages}
              </span>
              
              <div className="flex items-center gap-1.5 text-[11px]">
                {selectedPlacement?.pageIndex === i && (
                  <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                    <Table2 size={11} /> Table Placed
                  </span>
                )}
                {signatures.filter(s => s.pageIndex === i).length > 0 && (
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                    <PenTool size={11} /> {signatures.filter(s => s.pageIndex === i).length} Signature(s)
                  </span>
                )}
              </div>
            </div>

            {/* Individual PDF Page Canvas Sheet */}
            <PDFPage 
              pdfDoc={pdfDoc} 
              pageIndex={i} 
              scale={scale} 
              onClick={(e, vp) => handleCanvasClick(e, i, vp)}
              selectedPlacement={selectedPlacement?.pageIndex === i ? selectedPlacement : null}
              tableData={tableData}
              onTableDataChange={onTableDataChange}
              onDeleteTable={onDeleteTable}
              onPlacementUpdate={onPlacementSelect}
              signatures={signatures.filter(s => s.pageIndex === i)}
              onSignatureUpdate={onSignatureUpdate}
              onSignatureRemove={onSignatureRemove}
              onSignatureDragStart={handleSigDragStart}
              isDraggingAny={!!dragState}
            />
          </div>
        ))}

        {/* Floating Accessible Zoom Dock (Convenient when deep into document scrolling) */}
        {pdfDoc && (
          <div 
            className="fixed bottom-6 right-6 z-30 flex items-center gap-1 bg-white/95 backdrop-blur-md px-2 py-1.5 rounded-2xl shadow-xl border border-slate-200 ring-1 ring-slate-900/5 transition-all"
            role="toolbar"
            aria-label="Floating canvas zoom controls"
          >
            <button
              onClick={() => setScale(s => Math.round((s - 0.15) * 100) / 100)}
              disabled={scale <= 0.5}
              aria-label="Zoom out PDF document"
              className="p-1.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              title="Zoom Out"
            >
              <ZoomOut size={16} />
            </button>

            <button
              onClick={() => setScale(1.0)}
              aria-label="Reset zoom to 100%"
              className="px-2 py-1 text-xs font-mono font-bold text-slate-800 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
              title="Reset Zoom to 100%"
            >
              {Math.round(scale * 100)}%
            </button>

            <button
              onClick={() => setScale(s => Math.round((s + 0.15) * 100) / 100)}
              disabled={scale >= 3.0}
              aria-label="Zoom in PDF document"
              className="p-1.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              title="Zoom In"
            >
              <ZoomIn size={16} />
            </button>

            <div className="h-4 w-px bg-slate-200 mx-0.5"></div>

            <button
              onClick={() => setScale(s => (s === 1.25 ? 1.0 : 1.25))}
              aria-label="Fit width or reset zoom"
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              title={scale === 1.25 ? "Reset to Standard Zoom" : "Fit Width (125%)"}
            >
              <Maximize2 size={15} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

interface PDFPageProps {
  pdfDoc: any;
  pageIndex: number;
  scale: number;
  onClick: (e: React.MouseEvent<HTMLDivElement>, viewport: any) => void;
  selectedPlacement: Placement | null;
  tableData: TableData;
  onTableDataChange: (data: TableData) => void;
  onDeleteTable: () => void;
  onPlacementUpdate: (placement: Placement) => void;
  signatures: SignatureData[];
  onSignatureUpdate: (sig: SignatureData) => void;
  onSignatureRemove: (id: string) => void;
  onSignatureDragStart: (e: React.MouseEvent, sig: SignatureData) => void;
  isDraggingAny: boolean;
}

const PDFPage: React.FC<PDFPageProps> = ({ 
  pdfDoc, 
  pageIndex, 
  scale, 
  onClick, 
  selectedPlacement,
  tableData,
  onTableDataChange,
  onDeleteTable,
  onPlacementUpdate,
  signatures,
  onSignatureUpdate,
  onSignatureRemove,
  onSignatureDragStart,
  isDraggingAny
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [viewport, setViewport] = useState<any>(null);
  const renderTaskRef = useRef<any>(null);
  
  // Drag State (for table)
  const [isDraggingTable, setIsDraggingTable] = useState(false);
  const [dragStartTable, setDragStartTable] = useState<{ x: number; y: number } | null>(null);
  const [initialPlacement, setInitialPlacement] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    let isMounted = true;

    const renderPage = async () => {
      if (!canvasRef.current || !pdfDoc) return;

      if (renderTaskRef.current) {
        renderTaskRef.current.cancel(); 
      }

      try {
        const page = await pdfDoc.getPage(pageIndex + 1);
        if (!isMounted) return;

        const vp = page.getViewport({ scale });
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (!context) return;

        canvas.height = vp.height;
        canvas.width = vp.width;

        const renderContext = {
          canvasContext: context,
          viewport: vp,
        };

        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;

        await renderTask.promise;

        if (isMounted) {
          setViewport(vp);
          renderTaskRef.current = null;
        }
      } catch (error: any) {
        if (error.name !== 'RenderingCancelledException') {
          console.error('Render error:', error);
        }
      }
    };

    renderPage();

    return () => {
      isMounted = false;
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [pdfDoc, pageIndex, scale]);

  // Handle Dragging Table
  const handleDragStart = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    e.preventDefault();
    if (!selectedPlacement) return;

    setIsDraggingTable(true);
    setDragStartTable({ x: e.clientX, y: e.clientY });
    setInitialPlacement({ x: selectedPlacement.x, y: selectedPlacement.y });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingTable || !dragStartTable || !initialPlacement || !selectedPlacement) return;

      const deltaX = e.clientX - dragStartTable.x;
      const deltaY = e.clientY - dragStartTable.y;
      const deltaPdfX = deltaX / scale;
      const deltaPdfY = deltaY / scale;

      onPlacementUpdate({
        ...selectedPlacement,
        x: initialPlacement.x + deltaPdfX,
        y: initialPlacement.y - deltaPdfY 
      });
    };

    const handleMouseUp = () => {
      setIsDraggingTable(false);
      setDragStartTable(null);
      setInitialPlacement(null);
    };

    if (isDraggingTable) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingTable, dragStartTable, initialPlacement, scale, selectedPlacement, onPlacementUpdate]);

  return (
    <div 
      className="flex justify-center relative group"
    >
      {/* High-Fidelity Paper Sheet with Crisp Shadow */}
      <div 
        className="relative bg-white shadow-xl rounded-sm border border-slate-200/90 ring-1 ring-slate-900/5 transition-all" 
        onClick={(e) => viewport && !isDraggingTable && onClick(e, viewport)}
        data-page-index={pageIndex}
        id={`pdf-page-${pageIndex}`}
      >
        <canvas ref={canvasRef} className="block rounded-xs bg-white" />
        
        {/* Signatures Container */}
        {viewport && signatures.length > 0 && (
           <div className="absolute inset-0 pointer-events-none">
              {signatures.map(sig => (
                  <SignatureOverlay 
                      key={sig.id}
                      signature={sig} 
                      scale={scale} 
                      onUpdate={onSignatureUpdate}
                      onRemove={() => onSignatureRemove(sig.id)}
                      onDragStart={(e) => onSignatureDragStart(e, sig)}
                      isGlobalDragging={isDraggingAny}
                  />
              ))}
           </div>
        )}

        {/* Interactive Table Overlay */}
        {selectedPlacement && viewport && (
          <div 
            className="absolute z-10"
            style={{
              left: selectedPlacement.x * scale,
              top: viewport.height - (selectedPlacement.y * scale),
            }}
            onClick={(e) => e.stopPropagation()} 
          >
             <TableOverlay 
               data={tableData} 
               onChange={onTableDataChange} 
               onDelete={onDeleteTable}
               scale={scale} 
               onDragStart={handleDragStart}
             />
          </div>
        )}
        
        {/* Hover Placement Cue */}
        {!selectedPlacement && (
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-indigo-950/5 pointer-events-none transition-opacity duration-200 flex items-center justify-center cursor-crosshair">
              <span className="bg-white/95 text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-md border border-slate-200 backdrop-blur-xs flex items-center gap-1.5">
                  <Table2 size={13} className="text-indigo-600" />
                  <span>Click to place table here</span>
              </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFPreview;

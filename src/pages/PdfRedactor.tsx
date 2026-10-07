import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ShieldAlert,
  Upload,
  Sparkles,
  Download,
  Sliders,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Lock,
  Trash2,
  ImageOff,
  X,
  Wand2,
  ListChecks,
  ScanText,
  ExternalLink,
  Eye,
  CheckCircle2,
  FileImage,
  Hand,
  PlusSquare
} from 'lucide-react';
import {
  RedactionRule,
  DetectedMatch,
  InImageSubBox,
  RedactionStyleOptions,
  ExtractedTextItem,
  DEFAULT_REDACTION_RULES,
  scanPdfForSensitiveData,
  applyRedactionsToPdf,
  createDemoConfidentialPdf,
  parseUserRegexInput,
  autoScanImagesWithOcr,
  evaluateOcrLinesAgainstRules,
  renderSanitizedImageWithSubBoxes,
  getOrCreateOcrWorker
} from '../utils/pdfRedactor';
import { generateMultiTierSuggestions, escapeRegex } from '../utils/regexGenerator';
import { TokenSuggestion } from '../types/regex';
import * as pdfjsLib from 'pdfjs-dist';

// Helper to determine bubble styling that matches the highlight background color
const getBubbleStyle = (colorClass: string) => {
  if (colorClass.includes('amber') || colorClass.includes('orange')) {
    return {
      bg: 'bg-amber-500 text-slate-950 border-amber-600 shadow-amber-500/25',
      badge: 'bg-amber-600/30 text-slate-950',
      code: 'bg-black/15 text-slate-950 font-bold',
      arrow: 'border-t-amber-500'
    };
  }
  if (colorClass.includes('indigo')) {
    return {
      bg: 'bg-indigo-600 text-white border-indigo-700 shadow-indigo-500/25',
      badge: 'bg-indigo-700/50 text-indigo-100',
      code: 'bg-black/25 text-indigo-100',
      arrow: 'border-t-indigo-600'
    };
  }
  if (colorClass.includes('emerald')) {
    return {
      bg: 'bg-emerald-600 text-white border-emerald-700 shadow-emerald-500/25',
      badge: 'bg-emerald-700/50 text-emerald-100',
      code: 'bg-black/25 text-emerald-100',
      arrow: 'border-t-emerald-600'
    };
  }
  if (colorClass.includes('teal')) {
    return {
      bg: 'bg-teal-600 text-white border-teal-700 shadow-teal-500/25',
      badge: 'bg-teal-700/50 text-teal-100',
      code: 'bg-black/25 text-teal-100',
      arrow: 'border-t-teal-600'
    };
  }
  if (colorClass.includes('cyan')) {
    return {
      bg: 'bg-cyan-600 text-white border-cyan-700 shadow-cyan-500/25',
      badge: 'bg-cyan-700/50 text-cyan-100',
      code: 'bg-black/25 text-cyan-100',
      arrow: 'border-t-cyan-600'
    };
  }
  if (colorClass.includes('purple')) {
    return {
      bg: 'bg-purple-600 text-white border-purple-700 shadow-purple-500/25',
      badge: 'bg-purple-700/50 text-purple-100',
      code: 'bg-black/25 text-purple-100',
      arrow: 'border-t-purple-600'
    };
  }
  if (colorClass.includes('rose')) {
    return {
      bg: 'bg-rose-500 text-white border-rose-600 shadow-rose-500/25',
      badge: 'bg-rose-600/50 text-rose-100',
      code: 'bg-black/25 text-rose-100',
      arrow: 'border-t-rose-500'
    };
  }
  if (colorClass.includes('blue')) {
    return {
      bg: 'bg-blue-500 text-white border-blue-600 shadow-blue-500/25',
      badge: 'bg-blue-600/50 text-blue-100',
      code: 'bg-black/25 text-blue-100',
      arrow: 'border-t-blue-500'
    };
  }
  return {
    bg: 'bg-slate-700 text-white border-slate-800 shadow-slate-700/25',
    badge: 'bg-slate-800 text-slate-200',
    code: 'bg-black/30 text-amber-300 font-bold',
    arrow: 'border-t-slate-700'
  };
};

const PdfRedactor: React.FC = () => {
  // File & Document State
  const [pdfBuffer, setPdfBuffer] = useState<ArrayBuffer | null>(null);
  const [fileName, setFileName] = useState<string>('sample-contract.pdf');
  const [numPages, setNumPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(0); // 0-based
  const [pageInput, setPageInput] = useState<string>('1');
  const [zoomScale, setZoomScale] = useState<number>(1.2);

  // Sidebar UI & Match Filtering State
  const [sidebarTab, setSidebarTab] = useState<'rules' | 'matches' | 'style'>('rules');
  const [matchFilterScope, setMatchFilterScope] = useState<'all' | 'page'>('all');
  const [matchSearchQuery, setMatchSearchQuery] = useState<string>('');

  // Scanning & Detection State
  const [rules, setRules] = useState<RedactionRule[]>(DEFAULT_REDACTION_RULES);
  const [customPattern, setCustomPattern] = useState<string>('');
  const [customName, setCustomName] = useState<string>('Custom Rule');
  const [detectedMatches, setDetectedMatches] = useState<DetectedMatch[]>([]);
  const [manualMatches, setManualMatches] = useState<DetectedMatch[]>([]);
  const [isDrawMode, setIsDrawMode] = useState<boolean>(false);
  const [dragBox, setDragBox] = useState<{ startX: number; startY: number; currX: number; currY: number } | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<{ current: number; total: number } | null>(null);
  const [ocrStatusText, setOcrStatusText] = useState<string | null>(null);

  // In-Image OCR & Local Full-Size View Modal State
  const [activeImageModalId, setActiveImageModalId] = useState<string | null>(null);
  const [modalImageZoom, setModalImageZoom] = useState<number>(1.0);
  const [modalInteractionMode, setModalInteractionMode] = useState<'pan' | 'draw_redact'>('pan');
  const [modalPanState, setModalPanState] = useState<{
    startClientX: number;
    startClientY: number;
    startScrollLeft: number;
    startScrollTop: number;
  } | null>(null);
  const modalPanMovedRef = useRef<boolean>(false);
  const modalViewportRef = useRef<HTMLDivElement>(null);
  const [modalDragBox, setModalDragBox] = useState<{
    startX: number;
    startY: number;
    currX: number;
    currY: number;
  } | null>(null);
  const imageOcrCacheRef = useRef<Map<string, Partial<DetectedMatch>>>(new Map());

  // Reset modal zoom to 100% (Fit) and default to Hand Pan mode whenever a different image modal is opened
  useEffect(() => {
    setModalImageZoom(1.0);
    setModalInteractionMode('pan');
    setModalPanState(null);
    setModalDragBox(null);
  }, [activeImageModalId]);

  // Global window mousemove / mouseup listeners so hand panning never gets stuck or interrupted
  useEffect(() => {
    if (!modalPanState) return;
    const handleWindowMouseMove = (e: MouseEvent) => {
      const vp = modalViewportRef.current;
      if (!vp) return;
      const dx = e.clientX - modalPanState.startClientX;
      const dy = e.clientY - modalPanState.startClientY;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
        modalPanMovedRef.current = true;
      }
      vp.scrollLeft = modalPanState.startScrollLeft - dx;
      vp.scrollTop = modalPanState.startScrollTop - dy;
    };
    const handleWindowMouseUp = () => {
      setModalPanState(null);
    };
    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [modalPanState]);

  // Page Text Layer & Quick Custom Regex Popup State
  const [pageTextItems, setPageTextItems] = useState<ExtractedTextItem[]>([]);
  const [quickRegexPopup, setQuickRegexPopup] = useState<{
    text: string;
    x: number;
    y: number;
  } | null>(null);
  const [quickRegexSelectedIds, setQuickRegexSelectedIds] = useState<string[]>([]);
  const [quickRegexHoveredId, setQuickRegexHoveredId] = useState<string | null>(null);
  const [quickRegexScope, setQuickRegexScope] = useState<'selectedOnly' | 'fullLine'>('selectedOnly');
  const [quickRegexRuleName, setQuickRegexRuleName] = useState<string>('');

  // Redaction Styling Options
  const [redactionOptions, setRedactionOptions] = useState<RedactionStyleOptions>({
    mode: 'replacement_text',
    replacementText: '[CONFIDENTIAL]',
    boxColor: 'dark_slate',
    textColor: 'white'
  });

  // Export State
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [hasExported, setHasExported] = useState<boolean>(false);

  // Canvas Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeRenderTaskRef = useRef<any>(null);
  const [renderedViewport, setRenderedViewport] = useState<{ width: number; height: number } | null>(null);

  const getImageCacheKey = (m: DetectedMatch) =>
    `${m.pageIndex}:${Math.round(m.x)}:${Math.round(m.y)}:${Math.round(m.width)}:${Math.round(m.height)}`;

  // Clear OCR cache when a new PDF buffer is loaded
  useEffect(() => {
    imageOcrCacheRef.current.clear();
    setActiveImageModalId(null);
  }, [pdfBuffer]);

  // Load Demo PDF on initial mount and pre-warm the singleton Tesseract OCR worker
  useEffect(() => {
    let isMounted = true;
    // Pre-warm OCR worker in background
    getOrCreateOcrWorker().catch(() => {});
    (async () => {
      try {
        const demoBuffer = await createDemoConfidentialPdf();
        if (isMounted) {
          setPdfBuffer(demoBuffer);
          setFileName('sample-confidential-agreement.pdf');
        }
      } catch (err) {
        console.error('Failed to create sample PDF', err);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  // When PDF buffer or rules change, scan PDF text & images + run automated OCR on embedded images
  useEffect(() => {
    if (!pdfBuffer) return;

    let isCancelled = false;
    const runScan = async () => {
      setIsScanning(true);
      setScanProgress({ current: 0, total: 1 });
      try {
        const { matches, numPages: pagesCount } = await scanPdfForSensitiveData(
          pdfBuffer,
          rules,
          (curr, tot) => {
            if (!isCancelled) setScanProgress({ current: curr, total: tot });
          }
        );

        if (isCancelled) return;

        // Hydrate any embedded images that already have cached OCR results,
        // and re-evaluate their rawOcrLines against the current active Regex Rules!
        const hydratedMatches = await Promise.all(
          matches.map(async m => {
            if (m.ruleId === 'embedded_images') {
              const cacheKey = getImageCacheKey(m);
              const cached = imageOcrCacheRef.current.get(cacheKey);
              if (cached) {
                if (
                  cached.rawOcrLines &&
                  cached.originalImageDataUrl &&
                  cached.imagePixelWidth &&
                  cached.imagePixelHeight
                ) {
                  const reEvaluatedSubBoxes = evaluateOcrLinesAgainstRules(
                    cached.rawOcrLines,
                    rules,
                    cached.imagePixelWidth,
                    cached.imagePixelHeight,
                    cached.subBoxes
                  );
                  const freshRedactedUrl = await renderSanitizedImageWithSubBoxes(
                    cached.originalImageDataUrl,
                    reEvaluatedSubBoxes,
                    redactionOptions
                  );
                  const updatedCache: Partial<DetectedMatch> = {
                    ...cached,
                    subBoxes: reEvaluatedSubBoxes,
                    redactedImageDataUrl: freshRedactedUrl
                  };
                  imageOcrCacheRef.current.set(cacheKey, updatedCache);
                  return { ...m, ...updatedCache };
                }
                return { ...m, ...cached };
              }
            }
            return m;
          })
        );

        setDetectedMatches(hydratedMatches);
        setNumPages(pagesCount);
        if (currentPage >= pagesCount) setCurrentPage(0);

        // Automatically run OCR on newly detected embedded images:
        // 1. Prioritize the CURRENT page's images first so the page the user is looking at is ready in 1-2 seconds!
        // 2. Immediately continue scanning all remaining unvisited pages in the background so EVERY page in the PDF
        //    is 100% OCR-auto-redacted even if the user never manually opens those pages!
        const allUncachedImages = hydratedMatches.filter(
          m => m.ruleId === 'embedded_images' && !m.subBoxes
        );
        const targetPage = currentPage >= pagesCount ? 0 : currentPage;
        const prioritizedImages = [
          ...allUncachedImages.filter(m => m.pageIndex === targetPage),
          ...allUncachedImages.filter(m => m.pageIndex !== targetPage)
        ];

        if (prioritizedImages.length > 0) {
          setIsScanning(false); // Unblock the main PDF viewer immediately while background OCR streams in!
          setScanProgress(null);

          setOcrStatusText(
            `Auto-OCR scanning 1 of ${prioritizedImages.length} embedded image(s)...`
          );
          const ocrUpdates = await autoScanImagesWithOcr(
            pdfBuffer,
            prioritizedImages,
            rules,
            redactionOptions,
            status => {
              if (!isCancelled) setOcrStatusText(status);
            },
            (matchId, partial) => {
              if (isCancelled) return;
              setDetectedMatches(prev =>
                prev.map(m => {
                  if (m.id === matchId) {
                    const next = { ...m, ...partial };
                    if (partial.subBoxes) {
                      imageOcrCacheRef.current.set(getImageCacheKey(m), partial);
                    }
                    return next;
                  }
                  return m;
                })
              );
            },
            () => isCancelled
          );

          if (!isCancelled && Object.keys(ocrUpdates).length > 0) {
            setDetectedMatches(prev =>
              prev.map(m => {
                const upd = ocrUpdates[m.id];
                if (upd) {
                  imageOcrCacheRef.current.set(getImageCacheKey(m), upd);
                  return { ...m, ...upd };
                }
                return m;
              })
            );
          }
        }
      } catch (err) {
        console.error('Scanning error', err);
      } finally {
        if (!isCancelled) {
          setIsScanning(false);
          setScanProgress(null);
          setOcrStatusText(null);
        }
      }
    };

    runScan();

    return () => {
      isCancelled = true;
    };
  }, [pdfBuffer, rules]);

  // When switching pages on a large PDF (> 15 images), automatically OCR any uncached images on the newly visited page!
  useEffect(() => {
    if (!pdfBuffer || isScanning) return;

    const uncachedOnCurrentPage = detectedMatches.filter(
      m => m.ruleId === 'embedded_images' && m.pageIndex === currentPage && !m.subBoxes
    );
    if (uncachedOnCurrentPage.length === 0) return;

    let isCancelled = false;
    (async () => {
      setOcrStatusText(
        `Auto-OCR scanning ${uncachedOnCurrentPage.length} image(s) on Page ${currentPage + 1}...`
      );
      try {
        const ocrUpdates = await autoScanImagesWithOcr(
          pdfBuffer,
          uncachedOnCurrentPage,
          rules,
          redactionOptions,
          status => {
            if (!isCancelled) setOcrStatusText(status);
          },
          (matchId, partial) => {
            if (isCancelled) return;
            setDetectedMatches(prev =>
              prev.map(m => {
                if (m.id === matchId) {
                  const next = { ...m, ...partial };
                  if (partial.subBoxes) {
                    imageOcrCacheRef.current.set(getImageCacheKey(m), partial);
                  }
                  return next;
                }
                return m;
              })
            );
          },
          () => isCancelled
        );

        if (!isCancelled && Object.keys(ocrUpdates).length > 0) {
          setDetectedMatches(prev =>
            prev.map(m => {
              const upd = ocrUpdates[m.id];
              if (upd) {
                imageOcrCacheRef.current.set(getImageCacheKey(m), upd);
                return { ...m, ...upd };
              }
              return m;
            })
          );
        }
      } finally {
        if (!isCancelled) {
          setOcrStatusText(null);
        }
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [currentPage, isScanning]);

  // Re-composite live sanitized image previews whenever Redact Style options change
  useEffect(() => {
    let isCancelled = false;
    const updateImageStyles = async () => {
      const imgMatches = detectedMatches.filter(
        m => m.ruleId === 'embedded_images' && m.originalImageDataUrl
      );
      if (imgMatches.length === 0) return;

      const updatedMap: Record<string, string> = {};
      for (const m of imgMatches) {
        const freshUrl = await renderSanitizedImageWithSubBoxes(
          m.originalImageDataUrl!,
          m.subBoxes || [],
          redactionOptions
        );
        updatedMap[m.id] = freshUrl;
      }

      if (!isCancelled) {
        setDetectedMatches(prev =>
          prev.map(m => {
            if (updatedMap[m.id]) {
              const updated = { ...m, redactedImageDataUrl: updatedMap[m.id] };
              imageOcrCacheRef.current.set(getImageCacheKey(m), {
                originalImageDataUrl: updated.originalImageDataUrl,
                redactedImageDataUrl: updated.redactedImageDataUrl,
                imagePixelWidth: updated.imagePixelWidth,
                imagePixelHeight: updated.imagePixelHeight,
                rawOcrLines: updated.rawOcrLines,
                subBoxes: updated.subBoxes,
                imageMode: updated.imageMode,
                createLocalFullSizePage: updated.createLocalFullSizePage
              });
              return updated;
            }
            return m;
          })
        );
      }
    };

    updateImageStyles();
    return () => {
      isCancelled = true;
    };
  }, [redactionOptions]);

  // Render current PDF page onto Canvas
  useEffect(() => {
    if (!pdfBuffer || !canvasRef.current) return;

    let isCancelled = false;
    let currentRenderTask: any = null;

    // Cancel any previous in-flight PDF.js render task immediately
    if (activeRenderTaskRef.current) {
      try {
        activeRenderTaskRef.current.cancel();
      } catch {
        // ignore cancel error
      }
      activeRenderTaskRef.current = null;
    }

    const renderPage = async () => {
      try {
        const loadingTask = pdfjsLib.getDocument({ data: pdfBuffer.slice(0), verbosity: 0 });
        const pdfDoc = await loadingTask.promise;
        if (isCancelled) return;

        const page = await pdfDoc.getPage(currentPage + 1);
        if (isCancelled) return;

        const viewport = page.getViewport({ scale: zoomScale });

        // Render onto a dedicated offscreen canvas first so PDF.js never collides on the same HTMLCanvasElement
        // even during rapid page switches, zoom changes, or React StrictMode double-invocations!
        const offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width = viewport.width;
        offscreenCanvas.height = viewport.height;
        const offCtx = offscreenCanvas.getContext('2d');
        if (!offCtx) return;

        currentRenderTask = page.render({
          canvasContext: offCtx,
          viewport
        });
        activeRenderTaskRef.current = currentRenderTask;

        await currentRenderTask.promise;
        if (isCancelled) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(offscreenCanvas, 0, 0);
        }

        // Also extract text items for the selectable PDF text layer (Quick Custom Regex selection)
        const textContent = await page.getTextContent();
        if (isCancelled) return;

        const extractedItems: ExtractedTextItem[] = [];
        for (const item of textContent.items as any[]) {
          const text = item.str;
          if (!text || text.trim() === '') continue;
          const transform = item.transform;
          const originX = transform[4];
          const originY = transform[5];
          const fontSize = Math.abs(transform[3]) || Math.abs(transform[0]) || 12;
          const totalWidth = item.width || fontSize * text.length * 0.5;
          const itemHeight = Math.max(item.height || fontSize, fontSize * 0.9);
          extractedItems.push({
            str: text,
            x: originX,
            y: originY,
            width: totalWidth,
            height: itemHeight,
            fontSize
          });
        }

        if (!isCancelled) {
          setRenderedViewport({ width: viewport.width, height: viewport.height });
          setPageTextItems(extractedItems);
          setQuickRegexPopup(null);
        }
      } catch (err: any) {
        if (err?.name === 'RenderingCancelledException' || isCancelled) {
          return;
        }
        console.error('Page rendering error', err);
      }
    };

    renderPage();

    return () => {
      isCancelled = true;
      if (currentRenderTask) {
        try {
          currentRenderTask.cancel();
        } catch {
          // ignore
        }
      }
    };
  }, [pdfBuffer, currentPage, zoomScale]);

  // Multi-tier regex suggestions for the currently highlighted PDF text
  const quickRegexSuggestions = useMemo(() => {
    if (!quickRegexPopup?.text) return [];
    return generateMultiTierSuggestions(quickRegexPopup.text);
  }, [quickRegexPopup?.text]);

  const quickRegexMaxTier = useMemo(() => {
    return quickRegexSuggestions.reduce((acc, curr) => Math.max(acc, curr.tier), 0);
  }, [quickRegexSuggestions]);

  const quickRegexByTier = useMemo(() => {
    const tiers: TokenSuggestion[][] = Array.from({ length: quickRegexMaxTier + 1 }, () => []);
    quickRegexSuggestions.forEach(s => {
      tiers[s.tier].push(s);
    });
    return tiers;
  }, [quickRegexSuggestions, quickRegexMaxTier]);

  const quickRegexSelectedList = useMemo(() => {
    return quickRegexSuggestions
      .filter(s => quickRegexSelectedIds.includes(s.id))
      .sort((a, b) => a.start - b.start);
  }, [quickRegexSuggestions, quickRegexSelectedIds]);

  const handleToggleQuickRegexSuggestion = (suggestion: TokenSuggestion) => {
    setQuickRegexSelectedIds(prev => {
      if (prev.includes(suggestion.id)) {
        return prev.filter(id => id !== suggestion.id);
      } else {
        const conflictingIds = quickRegexSuggestions
          .filter(s => prev.includes(s.id))
          .filter(s => !(s.end <= suggestion.start || s.start >= suggestion.end))
          .map(s => s.id);
        const filtered = prev.filter(id => !conflictingIds.includes(id));
        return [...filtered, suggestion.id];
      }
    });
  };

  // Synthesized regex pattern from the popup selections
  const quickRegexGeneratedPattern = useMemo(() => {
    const sample = quickRegexPopup?.text || '';
    if (!sample) return '';
    if (quickRegexSelectedList.length === 0) {
      return escapeRegex(sample);
    }

    if (quickRegexScope === 'selectedOnly') {
      if (quickRegexSelectedList.length === 1) {
        return quickRegexSelectedList[0].regexSnippet;
      }
      const sorted = [...quickRegexSelectedList].sort((a, b) => a.start - b.start);
      let result = '';
      for (let i = 0; i < sorted.length; i++) {
        if (i > 0) {
          const prev = sorted[i - 1];
          const curr = sorted[i];
          const gap = sample.substring(prev.end, curr.start);
          if (gap.length > 0) {
            result += /^\s+$/.test(gap) ? '\\s+' : escapeRegex(gap);
          }
        }
        result += sorted[i].regexSnippet;
      }
      return result;
    } else {
      let result = '';
      let cursor = 0;
      const sorted = [...quickRegexSelectedList].sort((a, b) => a.start - b.start);
      sorted.forEach(sugg => {
        if (sugg.start > cursor) {
          result += escapeRegex(sample.substring(cursor, sugg.start));
        }
        result += sugg.regexSnippet;
        cursor = sugg.end;
      });
      if (cursor < sample.length) {
        result += escapeRegex(sample.substring(cursor));
      }
      return result;
    }
  }, [quickRegexPopup?.text, quickRegexSelectedList, quickRegexScope]);

  // Add the selected quick regex rule to Detection Rules on OK
  const handleConfirmQuickRegex = () => {
    if (!quickRegexGeneratedPattern) return;
    try {
      const parsed = parseUserRegexInput(quickRegexGeneratedPattern);
      new RegExp(parsed.pattern, parsed.flags);
      const defaultLabel =
        quickRegexSelectedList.length === 1
          ? quickRegexSelectedList[0].name
          : `Pattern "${(quickRegexPopup?.text || '').slice(0, 18)}${(quickRegexPopup?.text || '').length > 18 ? '…' : ''}"`;

      const newRule: RedactionRule = {
        id: `custom-${Date.now()}`,
        name: quickRegexRuleName.trim() || defaultLabel,
        category: 'custom',
        pattern: parsed.pattern,
        flags: parsed.flags,
        description: `/${parsed.pattern}/${parsed.flags}`,
        enabled: true,
        color: 'bg-indigo-500'
      };
      setRules(prev => [...prev, newRule]);
      setQuickRegexPopup(null);
      setQuickRegexSelectedIds([]);
      setQuickRegexRuleName('');
      window.getSelection()?.removeAllRanges();
    } catch {
      alert('Could not compile generated regular expression.');
    }
  };

  // Detect native text selection on the PDF page
  const handleTextSelectionMouseUp = (wrapperEl: HTMLDivElement) => {
    if (isDrawMode) return;
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const selectedText = selection.toString().trim().replace(/\s+/g, ' ');
    if (!selectedText || selectedText.length < 1 || selectedText.length > 140) return;

    const range = selection.getRangeAt(0);
    if (!wrapperEl.contains(range.commonAncestorContainer)) return;

    const rangeRect = range.getBoundingClientRect();
    const wrapperRect = wrapperEl.getBoundingClientRect();
    if (rangeRect.width === 0 && rangeRect.height === 0) return;

    const relX = rangeRect.left - wrapperRect.left + rangeRect.width / 2;
    const relY = rangeRect.bottom - wrapperRect.top + 10;

    // Auto-preselect the highest-tier full-span suggestion if available
    const initialSuggestions = generateMultiTierSuggestions(selectedText);
    const fullSpanSugg = initialSuggestions
      .filter(s => s.start === 0 && s.end === selectedText.length && s.tier > 0)
      .sort((a, b) => b.tier - a.tier)[0];

    setQuickRegexPopup({
      text: selectedText,
      x: relX,
      y: relY
    });
    setQuickRegexSelectedIds(fullSpanSugg ? [fullSpanSugg.id] : []);
    setQuickRegexScope('selectedOnly');
    setQuickRegexRuleName('');
  };

  // File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const buffer = event.target?.result as ArrayBuffer;
      if (buffer) {
        setPdfBuffer(buffer);
        setHasExported(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Rule toggle helper
  const handleToggleRule = (ruleId: string) => {
    setRules(prev =>
      prev.map(r => (r.id === ruleId ? { ...r, enabled: !r.enabled } : r))
    );
  };

  // Add custom regex rule
  const handleAddCustomRule = () => {
    if (!customPattern.trim()) return;
    try {
      const parsed = parseUserRegexInput(customPattern);
      new RegExp(parsed.pattern, parsed.flags);
      const newRule: RedactionRule = {
        id: `custom-${Date.now()}`,
        name: customName.trim() || 'Custom Rule',
        category: 'custom',
        pattern: parsed.pattern,
        flags: parsed.flags,
        description: `/${parsed.pattern}/${parsed.flags}`,
        enabled: true,
        color: 'bg-indigo-500'
      };
      setRules(prev => [...prev, newRule]);
      setCustomPattern('');
      setCustomName('Custom Rule');
    } catch {
      alert('Invalid regular expression pattern. Please check syntax.');
    }
  };

  // Remove custom rule
  const handleRemoveRule = (ruleId: string) => {
    setRules(prev => prev.filter(r => r.id !== ruleId));
  };

  // Match selection toggle
  const handleToggleMatch = (matchId: string) => {
    if (matchId.startsWith('manual-')) {
      setManualMatches(prev =>
        prev.map(m => (m.id === matchId ? { ...m, selected: !m.selected } : m))
      );
    } else {
      setDetectedMatches(prev =>
        prev.map(m => (m.id === matchId ? { ...m, selected: !m.selected } : m))
      );
    }
  };

  // Remove manual image/area match
  const handleRemoveManualMatch = (matchId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setManualMatches(prev => prev.filter(m => m.id !== matchId));
  };

  // Helper to update an embedded image match and re-composite its sanitized image DataURL
  const updateEmbeddedImageMatch = async (
    matchId: string,
    updater: (m: DetectedMatch) => DetectedMatch
  ) => {
    const target = detectedMatches.find(m => m.id === matchId);
    if (!target) return;
    const nextMatch = updater(target);

    if (nextMatch.originalImageDataUrl) {
      nextMatch.redactedImageDataUrl = await renderSanitizedImageWithSubBoxes(
        nextMatch.originalImageDataUrl,
        nextMatch.subBoxes || [],
        redactionOptions
      );
    }

    imageOcrCacheRef.current.set(getImageCacheKey(nextMatch), {
      originalImageDataUrl: nextMatch.originalImageDataUrl,
      redactedImageDataUrl: nextMatch.redactedImageDataUrl,
      imagePixelWidth: nextMatch.imagePixelWidth,
      imagePixelHeight: nextMatch.imagePixelHeight,
      rawOcrLines: nextMatch.rawOcrLines,
      subBoxes: nextMatch.subBoxes,
      imageMode: nextMatch.imageMode,
      createLocalFullSizePage: nextMatch.createLocalFullSizePage
    });

    setDetectedMatches(prev => prev.map(m => (m.id === matchId ? nextMatch : m)));
  };

  const handleToggleImageSubBox = (matchId: string, subBoxId: string) => {
    updateEmbeddedImageMatch(matchId, m => ({
      ...m,
      subBoxes: (m.subBoxes || []).map(b =>
        b.id === subBoxId ? { ...b, selected: !b.selected } : b
      )
    }));
  };

  const handleDeleteImageSubBox = (matchId: string, subBoxId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    updateEmbeddedImageMatch(matchId, m => ({
      ...m,
      subBoxes: (m.subBoxes || []).filter(b => b.id !== subBoxId)
    }));
  };

  const handleSetAllImageSubBoxes = (matchId: string, selected: boolean) => {
    updateEmbeddedImageMatch(matchId, m => ({
      ...m,
      subBoxes: (m.subBoxes || []).map(b => ({ ...b, selected }))
    }));
  };

  const handleRedactOnlyInputValues = (matchId: string) => {
    updateEmbeddedImageMatch(matchId, m => ({
      ...m,
      subBoxes: (m.subBoxes || []).map(b => ({
        ...b,
        selected: b.fieldType === 'input_value' || b.id.startsWith('custom-')
      }))
    }));
  };

  const handleChangeImageMode = (matchId: string, imageMode: 'partial' | 'full_blackout') => {
    updateEmbeddedImageMatch(matchId, m => ({
      ...m,
      imageMode,
      selected: true
    }));
  };

  const handleToggleLocalFullSizePage = (matchId: string) => {
    updateEmbeddedImageMatch(matchId, m => ({
      ...m,
      createLocalFullSizePage: m.createLocalFullSizePage === false ? true : false
    }));
  };

  const handleRescanSingleImageOcr = async (match: DetectedMatch) => {
    if (!pdfBuffer) return;
    setOcrStatusText('Re-scanning image text with OCR...');
    try {
      const updates = await autoScanImagesWithOcr(
        pdfBuffer,
        [match],
        rules,
        redactionOptions,
        status => setOcrStatusText(status)
      );
      const upd = updates[match.id];
      if (upd) {
        imageOcrCacheRef.current.set(getImageCacheKey(match), upd);
        setDetectedMatches(prev =>
          prev.map(m => (m.id === match.id ? { ...m, ...upd } : m))
        );
      }
    } finally {
      setOcrStatusText(null);
    }
  };

  // Mouse handlers for Hand Panning or Drawing custom redaction boxes inside the Full-Size Image Modal
  const handleModalImageMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalInteractionMode === 'pan') {
      const vp = modalViewportRef.current;
      if (!vp) return;
      e.preventDefault();
      modalPanMovedRef.current = false;
      setModalPanState({
        startClientX: e.clientX,
        startClientY: e.clientY,
        startScrollLeft: vp.scrollLeft,
        startScrollTop: vp.scrollTop
      });
      return;
    }

    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setModalDragBox({ startX: x, startY: y, currX: x, currY: y });
  };

  const handleModalImageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalInteractionMode === 'pan') {
      if (!modalPanState || !modalViewportRef.current) return;
      e.preventDefault();
      const dx = e.clientX - modalPanState.startClientX;
      const dy = e.clientY - modalPanState.startClientY;
      modalViewportRef.current.scrollLeft = modalPanState.startScrollLeft - dx;
      modalViewportRef.current.scrollTop = modalPanState.startScrollTop - dy;
      return;
    }

    if (!modalDragBox) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
    setModalDragBox(prev => (prev ? { ...prev, currX: x, currY: y } : null));
  };

  const handleModalImageMouseUp = (
    e: React.MouseEvent<HTMLDivElement>,
    match: DetectedMatch
  ) => {
    if (modalInteractionMode === 'pan') {
      setModalPanState(null);
      return;
    }

    if (!modalDragBox) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const leftPx = Math.min(modalDragBox.startX, modalDragBox.currX);
    const topPx = Math.min(modalDragBox.startY, modalDragBox.currY);
    const widthPx = Math.abs(modalDragBox.currX - modalDragBox.startX);
    const heightPx = Math.abs(modalDragBox.currY - modalDragBox.startY);

    if (widthPx >= 8 && heightPx >= 8 && rect.width > 0 && rect.height > 0) {
      const newSubBox: InImageSubBox = {
        id: `custom-in-img-${Date.now()}`,
        label: `Custom Drawn Region #${(match.subBoxes?.length || 0) + 1}`,
        ruleName: 'Manual In-Image Box',
        xRatio: leftPx / rect.width,
        yRatio: topPx / rect.height,
        wRatio: widthPx / rect.width,
        hRatio: heightPx / rect.height,
        selected: true
      };
      updateEmbeddedImageMatch(match.id, m => ({
        ...m,
        imageMode: 'partial',
        subBoxes: [...(m.subBoxes || []), newSubBox]
      }));
    }
    setModalDragBox(null);
  };

  // Active Embedded Image Match for the Local Full-Size & OCR Popup Modal
  const activeImageModalMatch = useMemo(() => {
    if (!activeImageModalId) return null;
    return detectedMatches.find(m => m.id === activeImageModalId) || null;
  }, [activeImageModalId, detectedMatches]);

  // Select / Deselect all matches
  const handleToggleSelectAll = (select: boolean) => {
    setManualMatches(prev => prev.map(m => ({ ...m, selected: select })));
    setDetectedMatches(prev => prev.map(m => ({ ...m, selected: select })));
  };

  // Combined matches (manual image/area boxes + regex matches)
  const allMatches = useMemo(() => {
    return [...manualMatches, ...detectedMatches];
  }, [manualMatches, detectedMatches]);

  // Active matches for current page
  const currentPageMatches = useMemo(() => {
    return allMatches.filter(m => m.pageIndex === currentPage);
  }, [allMatches, currentPage]);

  const selectedMatchesCount = useMemo(() => {
    return allMatches.filter(m => m.selected).length;
  }, [allMatches]);

  // Keep pageInput synced when currentPage changes
  useEffect(() => {
    setPageInput(String(currentPage + 1));
  }, [currentPage]);

  // Commit page number input on Enter or Blur
  const handlePageInputCommit = () => {
    const parsed = parseInt(pageInput.trim(), 10);
    if (!isNaN(parsed) && numPages > 0) {
      const clampedPage = Math.max(1, Math.min(numPages, parsed));
      setCurrentPage(clampedPage - 1);
      setPageInput(String(clampedPage));
    } else {
      setPageInput(String(currentPage + 1));
    }
  };

  // Filtered matches for the Audit Matches sidebar tab
  const filteredSidebarMatches = useMemo(() => {
    const q = matchSearchQuery.trim().toLowerCase();
    return allMatches.filter(m => {
      if (matchFilterScope === 'page' && m.pageIndex !== currentPage) {
        return false;
      }
      if (!q) return true;
      return (
        m.matchedText.toLowerCase().includes(q) ||
        m.ruleName.toLowerCase().includes(q) ||
        `page ${m.pageIndex + 1}`.includes(q)
      );
    });
  }, [allMatches, matchFilterScope, currentPage, matchSearchQuery]);

  // Mouse handlers for drawing Image / Area Blackout box on Canvas
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawMode || !renderedViewport) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setDragBox({ startX: x, startY: y, currX: x, currY: y });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawMode || !dragBox) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
    setDragBox(prev => (prev ? { ...prev, currX: x, currY: y } : null));
  };

  const handleCanvasMouseUp = () => {
    if (!isDrawMode || !dragBox || !renderedViewport) {
      setDragBox(null);
      return;
    }

    const leftPx = Math.min(dragBox.startX, dragBox.currX);
    const topPx = Math.min(dragBox.startY, dragBox.currY);
    const widthPx = Math.abs(dragBox.currX - dragBox.startX);
    const heightPx = Math.abs(dragBox.currY - dragBox.startY);

    if (widthPx >= 8 && heightPx >= 8) {
      // Convert HTML canvas top-left pixel coords to PDF bottom-left point coords
      const pdfX = leftPx / zoomScale;
      const pdfWidth = widthPx / zoomScale;
      const pdfHeight = heightPx / zoomScale;
      const pdfY = (renderedViewport.height - topPx - heightPx) / zoomScale;

      const newManualMatch: DetectedMatch = {
        id: `manual-${Date.now()}`,
        ruleId: 'manual_area',
        ruleName: 'Image / Area Blackout',
        matchedText: `Image / Custom Region #${manualMatches.length + 1}`,
        pageIndex: currentPage,
        x: pdfX,
        y: pdfY,
        width: pdfWidth,
        height: pdfHeight,
        selected: true
      };

      setManualMatches(prev => [newManualMatch, ...prev]);
    }

    setDragBox(null);
  };

  // Execute Redaction & Download
  const handleApplyRedactions = async () => {
    if (!pdfBuffer || selectedMatchesCount === 0) return;

    setIsExporting(true);
    try {
      // Safety net: If the user clicks Export before background OCR has finished scanning all pages,
      // automatically complete OCR on any remaining uncached selected images so unvisited pages are 100% OCR-redacted!
      let finalMatchesToExport = allMatches;
      const uncachedSelectedImages = allMatches.filter(
        m => m.selected && m.ruleId === 'embedded_images' && m.imageMode !== 'full_blackout' && !m.subBoxes
      );

      if (uncachedSelectedImages.length > 0) {
        setOcrStatusText(
          `Finishing OCR on remaining ${uncachedSelectedImages.length} image(s) before export...`
        );
        const remainingUpdates = await autoScanImagesWithOcr(
          pdfBuffer,
          uncachedSelectedImages,
          rules,
          redactionOptions,
          status => setOcrStatusText(status)
        );
        finalMatchesToExport = allMatches.map(m => {
          const upd = remainingUpdates[m.id];
          if (upd) {
            imageOcrCacheRef.current.set(getImageCacheKey(m), upd);
            return { ...m, ...upd };
          }
          return m;
        });
        setDetectedMatches(prev =>
          prev.map(m => (remainingUpdates[m.id] ? { ...m, ...remainingUpdates[m.id] } : m))
        );
      }

      const redactedPdfBytes = await applyRedactionsToPdf(
        pdfBuffer,
        finalMatchesToExport,
        redactionOptions
      );

      const outBuffer = new ArrayBuffer(redactedPdfBytes.byteLength);
      new Uint8Array(outBuffer).set(redactedPdfBytes);
      const blob = new Blob([outBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setHasExported(true);

      // Trigger instant download
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName.replace(/\.pdf$/i, '_redacted.pdf');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error('Failed to redact PDF', err);
      alert('An error occurred during redaction.');
    } finally {
      setIsExporting(false);
      setOcrStatusText(null);
    }
  };

  return (
    <div className="h-screen bg-slate-100 flex flex-col text-slate-800 overflow-hidden">
      
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between shadow-2xs z-30 shrink-0">
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
                <ShieldAlert size={20} className="text-rose-600" />
                <span>PDF Sensitive Data Redactor</span>
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200">
                PII Sanitizer
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Scan PDF documents for emails, phone numbers, cards, SSN, and custom regex to redact or replace with [CONFIDENTIAL]
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={async () => {
              const demo = await createDemoConfidentialPdf();
              setPdfBuffer(demo);
              setFileName('sample-confidential-agreement.pdf');
              setHasExported(false);
            }}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-all"
          >
            <Sparkles size={13} className="text-amber-500" />
            <span>Load Sample PDF</span>
          </button>

          <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-all cursor-pointer">
            <Upload size={13} className="text-indigo-600" />
            <span>Upload PDF</span>
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>

          <button
            onClick={handleApplyRedactions}
            disabled={isScanning || isExporting || selectedMatchesCount === 0}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:hover:bg-rose-600 rounded-lg shadow-xs transition-all"
          >
            {isExporting ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Download size={14} />
            )}
            <span>{hasExported ? `Re-Export PDF (${selectedMatchesCount})` : `Export Redacted PDF (${selectedMatchesCount})`}</span>
          </button>
        </div>
      </header>

      {/* Main Studio Body */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
        
        {/* Left Control Sidebar */}
        <aside className="w-full lg:w-92 bg-white border-r border-slate-200 flex flex-col shrink-0 h-full overflow-hidden">
          
          {/* Top Sidebar 3-Tab Switcher (Active shows full title; inactive shows icon + hover tooltip) */}
          <div className="p-2.5 bg-slate-50 border-b border-slate-200 flex items-center gap-1.5 shrink-0">
            {/* Tab 1: Regex Rules */}
            <button
              onClick={() => setSidebarTab('rules')}
              title="1. Regex Rules"
              className={`relative group py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                sidebarTab === 'rules'
                  ? 'flex-1 bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'w-11 text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 border border-transparent'
              }`}
            >
              <Sliders size={14} className={sidebarTab === 'rules' ? 'text-indigo-600 shrink-0' : 'shrink-0'} />
              {sidebarTab === 'rules' ? (
                <span className="truncate">Regex Rules</span>
              ) : (
                <span className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity absolute top-full mt-1.5 left-0 z-50 px-2.5 py-1 rounded-md bg-slate-900 text-white text-[10px] font-semibold whitespace-nowrap shadow-lg">
                  Regex Rules
                </span>
              )}
            </button>

            {/* Tab 2: Audit Matches */}
            <button
              onClick={() => setSidebarTab('matches')}
              title={`2. Audit Matches (${allMatches.length})`}
              className={`relative group py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                sidebarTab === 'matches'
                  ? 'flex-1 bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'px-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 border border-transparent'
              }`}
            >
              <ListChecks size={14} className={sidebarTab === 'matches' ? 'text-rose-600 shrink-0' : 'shrink-0'} />
              {sidebarTab === 'matches' && <span className="truncate">Audit Matches</span>}
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  sidebarTab === 'matches'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-slate-200 text-slate-700 group-hover:bg-rose-100 group-hover:text-rose-800'
                }`}
              >
                {allMatches.length}
              </span>
              {sidebarTab !== 'matches' && (
                <span className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity absolute top-full mt-1.5 left-1/2 -translate-x-1/2 z-50 px-2.5 py-1 rounded-md bg-slate-900 text-white text-[10px] font-semibold whitespace-nowrap shadow-lg">
                  Audit Matches ({allMatches.length})
                </span>
              )}
            </button>

            {/* Tab 3: Redact Style */}
            <button
              onClick={() => setSidebarTab('style')}
              title="3. Redact Style"
              className={`relative group py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                sidebarTab === 'style'
                  ? 'flex-1 bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'w-11 text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 border border-transparent'
              }`}
            >
              <Lock size={14} className={sidebarTab === 'style' ? 'text-rose-600 shrink-0' : 'shrink-0'} />
              {sidebarTab === 'style' ? (
                <span className="truncate">Redact Style</span>
              ) : (
                <span className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity absolute top-full mt-1.5 right-0 z-50 px-2.5 py-1 rounded-md bg-slate-900 text-white text-[10px] font-semibold whitespace-nowrap shadow-lg">
                  Redact Style
                </span>
              )}
            </button>
          </div>

          {sidebarTab === 'rules' && (
            <div className="flex-1 overflow-y-auto divide-y divide-slate-200">
              {/* 1. Detection Rules */}
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Sliders size={14} className="text-indigo-600" />
                    <span>1. Regex & Detection Rules</span>
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    {detectedMatches.length} detected
                  </span>
                </div>

                {/* Built-in Rule Toggles */}
                <div className="space-y-1.5">
                  {rules.map(rule => (
                    <div
                      key={rule.id}
                      className={`p-2.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                        rule.enabled
                          ? 'bg-slate-50/80 border-slate-300 shadow-2xs'
                          : 'bg-white border-slate-200 opacity-60 hover:opacity-90'
                      }`}
                      onClick={() => handleToggleRule(rule.id)}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <input
                          type="checkbox"
                          checked={rule.enabled}
                          onChange={() => {}}
                          className="rounded text-rose-600 focus:ring-rose-500 h-4 w-4"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-900 truncate">
                              {rule.name}
                            </span>
                            {rule.category === 'custom' && (
                              <span className="px-1.5 py-0.2 bg-indigo-100 text-indigo-800 rounded text-[9px] font-bold">
                                Custom
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500 block truncate">
                            {rule.description}
                          </span>
                        </div>
                      </div>

                      {rule.category === 'custom' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveRule(rule.id);
                          }}
                          className="text-slate-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Custom Regex Rule Input */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                    + Add Custom Regex Rule
                  </span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="Rule label..."
                      className="w-1/3 px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                    <input
                      type="text"
                      value={customPattern}
                      onChange={(e) => setCustomPattern(e.target.value)}
                      placeholder="Regex e.g. \(\d{3}\)\s\d{3}-\d{4} or /pattern/g"
                      className="flex-1 px-2.5 py-1.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                    <button
                      onClick={handleAddCustomRule}
                      disabled={!customPattern.trim()}
                      className="px-2.5 py-1.5 text-xs font-bold bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-lg transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Compact Summary Card to open Audit Matches */}
              <div className="p-4 bg-slate-50/60">
                <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      {selectedMatchesCount} of {allMatches.length} items selected
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {currentPageMatches.length} on Page {currentPage + 1}
                    </span>
                  </div>
                  <button
                    onClick={() => setSidebarTab('matches')}
                    className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors"
                  >
                    Audit List →
                  </button>
                </div>
              </div>
            </div>
          )}

          {sidebarTab === 'matches' && (
            /* 2. Dedicated Full-Height Audit Matches Inspector */
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="p-3 border-b border-slate-200 space-y-2.5 shrink-0 bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px]">
                    <button
                      onClick={() => setMatchFilterScope('all')}
                      className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                        matchFilterScope === 'all'
                          ? 'bg-white text-slate-900 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      All Pages ({allMatches.length})
                    </button>
                    <button
                      onClick={() => setMatchFilterScope('page')}
                      className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                        matchFilterScope === 'page'
                          ? 'bg-white text-indigo-700 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Page {currentPage + 1} ({currentPageMatches.length})
                    </button>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <button
                      onClick={() => handleToggleSelectAll(true)}
                      className="text-indigo-600 hover:underline text-[11px] font-semibold"
                    >
                      Select all
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      onClick={() => handleToggleSelectAll(false)}
                      className="text-slate-500 hover:underline text-[11px] font-semibold"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* Search / Filter input */}
                <input
                  type="text"
                  value={matchSearchQuery}
                  onChange={(e) => setMatchSearchQuery(e.target.value)}
                  placeholder="Filter by text, rule, or 'page 6'..."
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex-1 p-3 space-y-1.5 overflow-y-auto">
                {filteredSidebarMatches.length === 0 ? (
                  <div className="p-6 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-slate-400 text-xs">
                    {isScanning
                      ? 'Scanning document...'
                      : 'No matches found for the current filter.'}
                  </div>
                ) : (
                  filteredSidebarMatches.map((m) => {
                    const isManual = m.id.startsWith('manual-');
                    const isEmbeddedImg = m.ruleId === 'embedded_images';
                    const activeOcrCount = (m.subBoxes || []).filter(b => b.selected).length;
                    const totalOcrCount = (m.subBoxes || []).length;

                    return (
                      <div
                        key={m.id}
                        onClick={() => handleToggleMatch(m.id)}
                        className={`p-2 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
                          m.selected
                            ? isManual || isEmbeddedImg
                              ? 'bg-indigo-50/70 border-indigo-200 text-slate-900'
                              : 'bg-rose-50/70 border-rose-200 text-slate-900'
                            : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          <input
                            type="checkbox"
                            checked={m.selected}
                            onChange={() => {}}
                            className="rounded text-rose-600 focus:ring-rose-500 h-3.5 w-3.5 shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="font-mono font-bold block truncate text-slate-900">
                              {m.matchedText}
                            </span>
                            <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-500">
                              <span className="truncate">{m.ruleName}</span>
                              <span>•</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCurrentPage(m.pageIndex);
                                }}
                                className="font-semibold text-indigo-600 hover:underline shrink-0"
                                title={`Jump to Page ${m.pageIndex + 1}`}
                              >
                                Page {m.pageIndex + 1}
                              </button>
                              {isEmbeddedImg && (
                                <>
                                  <span>•</span>
                                  <span className="text-emerald-700 font-semibold">
                                    {m.imageMode === 'full_blackout'
                                      ? 'Full Blackout'
                                      : `${activeOcrCount}/${totalOcrCount} OCR fields`}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {isEmbeddedImg && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setCurrentPage(m.pageIndex);
                                setActiveImageModalId(m.id);
                              }}
                              className="px-2 py-0.5 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold flex items-center gap-1 shadow-2xs transition-colors"
                              title="Open full-size local image & inspect OCR redactions"
                            >
                              <Eye size={10} />
                              <span>OCR / View</span>
                            </button>
                          )}
                          <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-white border border-slate-200">
                            {m.selected ? 'Will Redact' : 'Excluded'}
                          </span>
                          {isManual && (
                            <button
                              onClick={(e) => handleRemoveManualMatch(m.id, e)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                              title="Delete drawn image/area box"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {sidebarTab === 'style' && (
            /* 3. Dedicated Redact Style Tab */
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Lock size={14} className="text-rose-600" />
                  <span>3. Replacement Style</span>
                </span>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Choose how sensitive text and images are sanitized when exporting the redacted PDF.
                </p>

                {/* Mode Radios */}
                <div className="grid grid-cols-3 gap-1.5 text-xs pt-1">
                  <button
                    onClick={() => setRedactionOptions(prev => ({ ...prev, mode: 'replacement_text' }))}
                    className={`py-2.5 px-2 rounded-xl border font-medium text-center transition-all ${
                      redactionOptions.mode === 'replacement_text'
                        ? 'bg-rose-50 border-rose-300 text-rose-900 font-bold shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Text Badge
                  </button>

                  <button
                    onClick={() => setRedactionOptions(prev => ({ ...prev, mode: 'blackout' }))}
                    className={`py-2.5 px-2 rounded-xl border font-medium text-center transition-all ${
                      redactionOptions.mode === 'blackout'
                        ? 'bg-rose-50 border-rose-300 text-rose-900 font-bold shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Solid Blackout
                  </button>

                  <button
                    onClick={() => setRedactionOptions(prev => ({ ...prev, mode: 'whiteout' }))}
                    className={`py-2.5 px-2 rounded-xl border font-medium text-center transition-all ${
                      redactionOptions.mode === 'whiteout'
                        ? 'bg-rose-50 border-rose-300 text-rose-900 font-bold shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Whiteout
                  </button>
                </div>

                {/* Custom Replacement Text Input */}
                {redactionOptions.mode === 'replacement_text' && (
                  <div className="space-y-3 pt-2">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-slate-600 block">
                        Replacement Label:
                      </label>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={redactionOptions.replacementText}
                          onChange={(e) => setRedactionOptions(prev => ({ ...prev, replacementText: e.target.value }))}
                          placeholder="e.g. [CONFIDENTIAL]"
                          className="flex-1 px-3 py-1.5 text-xs font-mono font-bold bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-2xs"
                        />
                        <button
                          onClick={() => setRedactionOptions(prev => ({ ...prev, replacementText: '[CONFIDENTIAL]' }))}
                          className="px-2.5 py-1.5 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-mono font-semibold"
                          title="Reset to [CONFIDENTIAL]"
                        >
                          Reset
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[11px] font-semibold text-slate-600 block">Badge Theme:</span>
                      <div className="grid grid-cols-3 gap-1.5">
                        <button
                          onClick={() => setRedactionOptions(prev => ({ ...prev, boxColor: 'dark_slate', textColor: 'white' }))}
                          className={`py-1.5 px-2 text-xs rounded-lg border transition-all ${
                            redactionOptions.boxColor === 'dark_slate'
                              ? 'bg-slate-900 text-white border-slate-900 font-bold shadow-2xs'
                              : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          Dark Slate
                        </button>
                        <button
                          onClick={() => setRedactionOptions(prev => ({ ...prev, boxColor: 'red_tint', textColor: 'red' }))}
                          className={`py-1.5 px-2 text-xs rounded-lg border transition-all ${
                            redactionOptions.boxColor === 'red_tint'
                              ? 'bg-rose-100 text-rose-800 border-rose-300 font-bold shadow-2xs'
                              : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          Red Tint
                        </button>
                        <button
                          onClick={() => setRedactionOptions(prev => ({ ...prev, boxColor: 'black', textColor: 'white' }))}
                          className={`py-1.5 px-2 text-xs rounded-lg border transition-all ${
                            redactionOptions.boxColor === 'black'
                              ? 'bg-black text-white border-black font-bold shadow-2xs'
                              : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          Black
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Live Stamp Preview Card */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  Live Stamp Preview
                </span>
                <div className="p-4 bg-white rounded-lg border border-slate-200 flex items-center justify-center">
                  {redactionOptions.mode === 'blackout' ? (
                    <div className="w-40 h-7 bg-neutral-950 rounded-xs" />
                  ) : redactionOptions.mode === 'whiteout' ? (
                    <div className="w-40 h-7 bg-white border border-dashed border-slate-300 rounded-xs flex items-center justify-center text-[10px] text-slate-400">
                      (Erased / Whiteout)
                    </div>
                  ) : (
                    <div
                      className={`px-3 py-1 rounded font-mono text-xs font-bold border ${
                        redactionOptions.boxColor === 'red_tint'
                          ? 'bg-rose-50 text-rose-800 border-rose-500'
                          : redactionOptions.boxColor === 'black'
                          ? 'bg-black text-white border-neutral-800'
                          : 'bg-slate-900 text-white border-slate-700'
                      }`}
                    >
                      {redactionOptions.replacementText || '[CONFIDENTIAL]'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </aside>

        {/* Center PDF Preview Canvas */}
        <main className="flex-1 flex flex-col bg-slate-200/80 overflow-hidden min-h-0">
          
          {/* Canvas Toolbar */}
          <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 shadow-2xs shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 truncate max-w-xs">
                {fileName}
              </span>
              {isScanning && (
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-[10px] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                  <span>
                    {ocrStatusText ||
                      `Scanning ${scanProgress ? `page ${scanProgress.current}/${scanProgress.total}` : '...'}`}
                  </span>
                </div>
              )}
              {!isScanning && ocrStatusText && (
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-indigo-50 text-indigo-800 border border-indigo-200 rounded-full text-[10px] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
                  <span>{ocrStatusText}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Draw Image / Area Blackout Toggle */}
              <button
                onClick={() => setIsDrawMode(prev => !prev)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-bold transition-all ${
                  isDrawMode
                    ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
                title="Click and drag on the PDF page to blackout images, photos, signatures, or any region"
              >
                <ImageOff size={14} />
                <span>{isDrawMode ? 'Drawing Image Blackout (Active)' : 'Draw Image / Area Blackout'}</span>
              </button>

              {manualMatches.length > 0 && (
                <button
                  onClick={() => setManualMatches([])}
                  className="text-[11px] font-semibold text-rose-600 hover:underline"
                  title="Remove all manually drawn blackout boxes"
                >
                  Clear Boxes ({manualMatches.length})
                </button>
              )}

              {/* Page Navigation with Editable Page Input */}
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
                <button
                  disabled={currentPage <= 0}
                  onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                  className="p-1 rounded hover:bg-white disabled:opacity-30 transition-colors"
                  title="Previous Page"
                >
                  <ChevronLeft size={14} />
                </button>
                <div className="flex items-center gap-1 px-1 font-mono font-semibold text-slate-700">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={pageInput}
                    onChange={(e) => setPageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.currentTarget.blur();
                        handlePageInputCommit();
                      }
                    }}
                    onBlur={handlePageInputCommit}
                    className="w-9 text-center py-0.5 bg-white border border-slate-300 rounded text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    title="Type page number and press Enter"
                  />
                  <span>/ {numPages}</span>
                </div>
                <button
                  disabled={currentPage >= numPages - 1}
                  onClick={() => setCurrentPage(p => Math.min(numPages - 1, p + 1))}
                  className="p-1 rounded hover:bg-white disabled:opacity-30 transition-colors"
                  title="Next Page"
                >
                  <ChevronRight size={14} />
                </button>
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
                <button
                  onClick={() => setZoomScale(z => Math.max(0.6, z - 0.2))}
                  className="p-1 rounded hover:bg-white transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut size={14} />
                </button>
                <span className="px-1.5 font-mono text-[11px] font-semibold text-slate-600">
                  {Math.round(zoomScale * 100)}%
                </span>
                <button
                  onClick={() => setZoomScale(z => Math.min(2.5, z + 0.2))}
                  className="p-1 rounded hover:bg-white transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Draw Mode Banner */}
          {isDrawMode && (
            <div className="bg-indigo-600 text-white px-4 py-1.5 text-xs font-medium flex items-center justify-between shadow-2xs">
              <span>
                <strong>Image / Area Blackout Mode:</strong> Click and drag a rectangle over any image, photo, logo, signature, or custom region on the PDF page below.
              </span>
              <button
                onClick={() => setIsDrawMode(false)}
                className="px-2 py-0.5 bg-indigo-700 hover:bg-indigo-800 rounded text-[11px] font-bold"
              >
                Done Drawing
              </button>
            </div>
          )}

          {/* Subtle helper tip for Quick Custom Regex Rule */}
          {!isDrawMode && (
            <div className="bg-amber-50/90 border-b border-amber-200/80 px-4 py-1 text-[11px] text-amber-900 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-1.5">
                <Wand2 size={12} className="text-amber-600 shrink-0" />
                <span>
                  <strong>Quick Custom Regex:</strong> Highlight any text directly on the PDF preview below to open the visual pattern picker and add it as a rule.
                </span>
              </div>
              {quickRegexPopup && (
                <button
                  onClick={() => {
                    setQuickRegexPopup(null);
                    window.getSelection()?.removeAllRanges();
                  }}
                  className="text-amber-700 hover:text-amber-950 font-bold underline"
                >
                  Close Picker
                </button>
              )}
            </div>
          )}

          {/* Document Viewport with Overlays */}
          <div ref={containerRef} className="flex-1 overflow-auto p-6 flex justify-center items-start">
            <div
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={(e) => {
                if (isDrawMode) {
                  handleCanvasMouseUp();
                } else {
                  handleTextSelectionMouseUp(e.currentTarget);
                }
              }}
              onMouseLeave={() => {
                if (isDrawMode) handleCanvasMouseUp();
              }}
              className={`relative bg-white shadow-2xl rounded-sm border border-slate-300 ${
                isDrawMode ? 'cursor-crosshair select-none' : ''
              }`}
            >
              
              {/* PDF Background Canvas */}
              <canvas ref={canvasRef} className="block select-none pointer-events-none" />

              {/* Selectable Transparent PDF Text Layer for Highlighting Sample Text */}
              {renderedViewport && !isDrawMode && (
                <div
                  className="absolute inset-0 z-10 overflow-hidden"
                  style={{ userSelect: 'text', WebkitUserSelect: 'text' }}
                >
                  {pageTextItems.map((item, idx) => {
                    const left = item.x * zoomScale;
                    const top = renderedViewport.height - item.y * zoomScale - item.height * zoomScale;
                    const width = item.width * zoomScale;
                    const height = item.height * zoomScale;
                    const fontSize = item.fontSize * zoomScale;

                    return (
                      <span
                        key={idx}
                        style={{
                          position: 'absolute',
                          left: `${left}px`,
                          top: `${top}px`,
                          width: `${width}px`,
                          height: `${height}px`,
                          fontSize: `${fontSize}px`,
                          lineHeight: 1,
                          whiteSpace: 'pre',
                          transformOrigin: 'left bottom'
                        }}
                        className="text-transparent selection:bg-amber-400/45 selection:text-transparent cursor-text font-sans"
                      >
                        {item.str}
                      </span>
                    );
                  })}
                </div>
              )}

              {/* Live Dragging Preview Box */}
              {isDrawMode && dragBox && (
                <div
                  style={{
                    position: 'absolute',
                    left: `${Math.min(dragBox.startX, dragBox.currX)}px`,
                    top: `${Math.min(dragBox.startY, dragBox.currY)}px`,
                    width: `${Math.abs(dragBox.currX - dragBox.startX)}px`,
                    height: `${Math.abs(dragBox.currY - dragBox.startY)}px`,
                  }}
                  className="bg-indigo-600/30 border-2 border-dashed border-indigo-600 pointer-events-none flex items-center justify-center z-30"
                >
                  <span className="text-[10px] font-bold text-white bg-indigo-700 px-1.5 py-0.5 rounded shadow-2xs">
                    Release to Blackout
                  </span>
                </div>
              )}

              {/* Interactive Redaction Highlight Overlays */}
              {renderedViewport && currentPageMatches.map(m => {
                // PDF coordinates: (0,0) is bottom-left
                // HTML Canvas coordinates: (0,0) is top-left
                // scale factor from PDF points to Canvas pixels: zoomScale
                const left = m.x * zoomScale;
                const top = (renderedViewport.height - (m.y * zoomScale)) - (m.height * zoomScale);
                const width = m.width * zoomScale;
                const height = m.height * zoomScale;
                const isManual = m.id.startsWith('manual-');
                const isEmbeddedImg = m.ruleId === 'embedded_images';
                const isPartialImage =
                  isEmbeddedImg &&
                  m.selected &&
                  m.imageMode === 'partial' &&
                  Boolean(m.redactedImageDataUrl);
                const activeOcrCount = (m.subBoxes || []).filter(b => b.selected).length;

                return (
                  <div
                    key={m.id}
                    onClick={(e) => {
                      if (isDrawMode) return;
                      e.stopPropagation();
                      if (isEmbeddedImg) {
                        setActiveImageModalId(m.id);
                      } else {
                        handleToggleMatch(m.id);
                      }
                    }}
                    style={{
                      position: 'absolute',
                      left: `${left}px`,
                      top: `${top}px`,
                      width: `${Math.max(width, 24)}px`,
                      height: `${Math.max(height, 12)}px`,
                    }}
                    className={`z-20 transition-all flex items-center justify-center select-none group border-2 ${
                      isDrawMode ? 'pointer-events-none' : 'cursor-pointer'
                    } ${
                      isPartialImage
                        ? 'bg-white border-indigo-600 shadow-md ring-2 ring-indigo-500/20'
                        : m.selected
                        ? isManual || isEmbeddedImg
                          ? 'bg-slate-900/75 border-indigo-600 shadow-sm'
                          : 'bg-rose-500/25 border-rose-600 shadow-sm'
                        : 'bg-slate-400/20 border-slate-400/50 hover:bg-rose-400/30'
                    }`}
                    title={
                      isEmbeddedImg
                        ? `${m.matchedText} — Click to open Local Full-Size View & edit OCR redactions`
                        : `${m.ruleName}: "${m.matchedText}" — Click to ${m.selected ? 'exclude' : 'redact'}`
                    }
                  >
                    {/* Live Sanitized Readable Image Preview (Sensitive fields inside image redacted via OCR) */}
                    {isPartialImage && m.redactedImageDataUrl && (
                      <img
                        src={m.redactedImageDataUrl}
                        alt="Sanitized Embedded Image Preview"
                        className="w-full h-full object-contain bg-slate-50 pointer-events-none select-none"
                      />
                    )}

                    {/* Top-left OCR / Local Popup badge for embedded images */}
                    {isEmbeddedImg && !isDrawMode && (
                      <div className="absolute -top-6 left-0 flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-700 text-white text-[9px] font-bold shadow-md whitespace-nowrap">
                        <ScanText size={10} />
                        <span>
                          {m.selected
                            ? m.imageMode === 'full_blackout'
                              ? 'Full Image Blackout • Click to Edit'
                              : `OCR Redacted (${activeOcrCount}) • Click to Popup`
                            : 'Image Excluded • Click to Inspect'}
                        </span>
                      </div>
                    )}

                    {/* Quick Include/Exclude toggle button in top-right corner for embedded images */}
                    {isEmbeddedImg && !isDrawMode && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleMatch(m.id);
                        }}
                        className={`absolute -top-2.5 -right-2.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold shadow-md opacity-0 group-hover:opacity-100 transition-opacity ${
                          m.selected
                            ? 'bg-slate-900 text-white hover:bg-rose-600'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700'
                        }`}
                        title={m.selected ? 'Exclude this image from redaction' : 'Include this image in redaction'}
                      >
                        {m.selected ? 'Exclude' : 'Include'}
                      </button>
                    )}

                    {/* Delete button on hover for manual boxes */}
                    {isManual && !isDrawMode && (
                      <button
                        onClick={(e) => handleRemoveManualMatch(m.id, e)}
                        className="absolute -top-2.5 -right-2.5 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-700"
                        title="Remove blackout box"
                      >
                        <X size={11} />
                      </button>
                    )}

                    {/* Visual Stamp preview for non-partial-image boxes */}
                    {m.selected && !isPartialImage && (
                      <span
                        className={`text-[9px] font-bold px-1 py-0.2 rounded shadow-2xs truncate ${
                          isManual || isEmbeddedImg
                            ? 'text-white bg-slate-900 border border-slate-700'
                            : 'text-rose-900 bg-rose-100'
                        }`}
                      >
                        {redactionOptions.mode === 'replacement_text'
                          ? redactionOptions.replacementText
                          : redactionOptions.mode === 'whiteout'
                          ? '[WHITEOUT]'
                          : '[BLACKOUT]'}
                      </span>
                    )}
                  </div>
                );
              })}

              {/* Quick Custom Regex Floating Bubble / Popover */}
              {quickRegexPopup && renderedViewport && (
                <div
                  onMouseDown={(e) => e.stopPropagation()}
                  onMouseUp={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    position: 'absolute',
                    left: `${Math.max(12, Math.min(quickRegexPopup.x - 210, renderedViewport.width - 432))}px`,
                    top: `${Math.max(12, Math.min(quickRegexPopup.y, renderedViewport.height - 260))}px`,
                    width: '420px',
                    maxWidth: 'calc(100% - 24px)'
                  }}
                  className="z-50 bg-white rounded-2xl border border-slate-300 shadow-2xl p-3.5 space-y-3 text-slate-800 animate-in fade-in zoom-in-95 duration-150"
                >
                  {/* Popover Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-1.5">
                      <Wand2 size={14} className="text-amber-500" />
                      <span className="text-xs font-bold text-slate-900">
                        Pick one that you want.
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Scope Toggle */}
                      <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[10px]">
                        <button
                          onClick={() => setQuickRegexScope('selectedOnly')}
                          className={`px-1.5 py-0.5 rounded transition-all ${
                            quickRegexScope === 'selectedOnly'
                              ? 'bg-white text-slate-900 font-bold shadow-2xs'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                          title="Generate regex for only the clicked bars"
                        >
                          Selected Only
                        </button>
                        <button
                          onClick={() => setQuickRegexScope('fullLine')}
                          className={`px-1.5 py-0.5 rounded transition-all ${
                            quickRegexScope === 'fullLine'
                              ? 'bg-white text-slate-900 font-bold shadow-2xs'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                          title="Include surrounding literal characters"
                        >
                          Full Sample
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          setQuickRegexPopup(null);
                          window.getSelection()?.removeAllRanges();
                        }}
                        className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                        title="Cancel"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Multi-Tier Interactive Visual Selector */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 overflow-x-auto space-y-1.5">
                    {/* Sample Character Line */}
                    <div className="font-mono text-xs text-slate-900 tracking-wider whitespace-pre select-none pb-1.5 border-b border-slate-200/80 flex">
                      {Array.from(quickRegexPopup.text).map((char, charIdx) => {
                        const isSelectedChar = quickRegexSelectedList.some(
                          s => charIdx >= s.start && charIdx < s.end
                        );
                        const isHoveredChar =
                          quickRegexHoveredId &&
                          quickRegexSuggestions.find(
                            s => s.id === quickRegexHoveredId && charIdx >= s.start && charIdx < s.end
                          );

                        return (
                          <span
                            key={charIdx}
                            style={{ width: '0.58rem', textAlign: 'center' }}
                            className={`inline-block transition-colors rounded-xs ${
                              isHoveredChar
                                ? 'bg-amber-300 font-bold text-slate-950'
                                : isSelectedChar
                                ? 'bg-amber-200 text-amber-950 font-bold'
                                : ''
                            }`}
                          >
                            {char === ' ' ? ' ' : char}
                          </span>
                        );
                      })}
                    </div>

                    {/* Multi-Tier Stacked Bars */}
                    <div className="space-y-1.5 pt-6 pb-1 relative min-h-[68px]">
                      {quickRegexByTier.map((tierSuggestions, tierIdx) => (
                        <div
                          key={tierIdx}
                          className="relative h-5 flex items-center select-none"
                          style={{ minWidth: `${quickRegexPopup.text.length * 0.58}rem` }}
                        >
                          {tierSuggestions.map(sugg => {
                            const isSelected = quickRegexSelectedIds.includes(sugg.id);
                            const isHovered = quickRegexHoveredId === sugg.id;
                            const leftPos = sugg.start * 0.58;
                            const barWidth = (sugg.end - sugg.start) * 0.58;
                            const bubbleStyle = getBubbleStyle(sugg.color);
                            const isNearLeft = leftPos < 4;
                            const isNearRight =
                              leftPos + barWidth > quickRegexPopup.text.length * 0.58 - 6;

                            return (
                              <div
                                key={sugg.id}
                                style={{
                                  position: 'absolute',
                                  left: `${leftPos}rem`,
                                  width: `${Math.max(barWidth - 0.06, 0.48)}rem`
                                }}
                                onMouseEnter={() => setQuickRegexHoveredId(sugg.id)}
                                onMouseLeave={() => setQuickRegexHoveredId(null)}
                                onClick={() => handleToggleQuickRegexSuggestion(sugg)}
                                className={`h-4 rounded cursor-pointer transition-all flex items-center justify-center px-1 text-[9px] font-bold text-white shadow-2xs select-none ${
                                  sugg.color
                                } ${
                                  isSelected
                                    ? 'ring-2 ring-slate-950 scale-[1.02] z-20 brightness-110'
                                    : 'opacity-80 hover:opacity-100 hover:scale-[1.01] z-10'
                                }`}
                              >
                                <span className="truncate pointer-events-none">
                                  {barWidth > 2.2 ? sugg.name : ''}
                                </span>

                                {/* Hover Tooltip Bubble */}
                                {isHovered && (
                                  <div
                                    className={`absolute bottom-full mb-1.5 z-50 pointer-events-none whitespace-nowrap rounded-lg px-2 py-1 text-[10px] shadow-md border flex items-center gap-1.5 ${
                                      bubbleStyle.bg
                                    } ${
                                      isNearLeft
                                        ? 'left-0'
                                        : isNearRight
                                        ? 'right-0'
                                        : 'left-1/2 -translate-x-1/2'
                                    }`}
                                  >
                                    <span className="font-bold">{sugg.name}</span>
                                    <code className={`px-1 py-0.2 rounded font-mono ${bubbleStyle.code}`}>
                                      {sugg.regexSnippet}
                                    </code>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Generated Regex Preview & Rule Name Input */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2 bg-slate-900 text-amber-300 px-2.5 py-1.5 rounded-lg font-mono text-[11px] overflow-x-auto">
                      <span className="truncate">/{quickRegexGeneratedPattern}/g</span>
                      <span className="text-[9px] uppercase font-sans font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 shrink-0">
                        {quickRegexSelectedList.length === 0
                          ? 'Exact Match'
                          : `${quickRegexSelectedList.length} selected`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={quickRegexRuleName}
                        onChange={(e) => setQuickRegexRuleName(e.target.value)}
                        placeholder="Optional rule name (e.g. Server Port)..."
                        className="flex-1 px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        onClick={() => {
                          setQuickRegexPopup(null);
                          window.getSelection()?.removeAllRanges();
                        }}
                        className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleConfirmQuickRegex}
                        className="px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
                      >
                        OK
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

        </main>

      </div>

      {/* Local Full-Size Image & In-Image OCR Redactor Popup Modal */}
      {activeImageModalMatch && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !modalPanState && !modalDragBox) {
              setActiveImageModalId(null);
            }
          }}
        >
          <div
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-6xl h-[92vh] flex flex-col overflow-hidden text-slate-800"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-xl bg-indigo-600/30 border border-indigo-400/30 text-indigo-300 shrink-0">
                  <FileImage size={18} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm sm:text-base font-bold truncate">
                      {activeImageModalMatch.matchedText} — Page {activeImageModalMatch.pageIndex + 1}
                    </h2>
                  </div>
                  <p className="text-[11px] text-slate-300 truncate">
                    Keep image readable while redacting sensitive fields via OCR • Saved locally inside exported PDF
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleRescanSingleImageOcr(activeImageModalMatch)}
                  disabled={Boolean(ocrStatusText)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  title="Re-run Tesseract OCR text detection on this image"
                >
                  <ScanText size={13} className="text-indigo-400" />
                  <span>{ocrStatusText ? 'Scanning OCR...' : 'Re-Scan OCR'}</span>
                </button>
                <button
                  onClick={() => setActiveImageModalId(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Close Popup"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body: Left Interactive Full-Size Image Canvas + Right OCR Controls */}
            <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
              {/* Left Column: Fixed Top Control Bar + Scrollable/Pannable Image Viewport */}
              <div className="flex-1 flex flex-col bg-slate-900/95 min-w-0 min-h-0 overflow-hidden">
                {/* Fixed Non-Scrolling Toolbar */}
                <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-300 shrink-0 z-20">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Hand Move vs Add Redact Manually Mode Toggle */}
                    <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-lg p-0.5">
                      <button
                        onClick={() => setModalInteractionMode('pan')}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1.5 transition-all ${
                          modalInteractionMode === 'pan'
                            ? 'bg-indigo-600 text-white shadow-2xs'
                            : 'text-slate-300 hover:text-white hover:bg-slate-700'
                        }`}
                        title="Hand Tool: Click and drag anywhere on the image to pan/move around"
                      >
                        <Hand size={13} />
                        <span>Move (Hand)</span>
                      </button>
                      <button
                        onClick={() =>
                          setModalInteractionMode(m => (m === 'draw_redact' ? 'pan' : 'draw_redact'))
                        }
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1.5 transition-all ${
                          modalInteractionMode === 'draw_redact'
                            ? 'bg-rose-600 text-white shadow-2xs ring-2 ring-rose-400/50'
                            : 'text-slate-300 hover:text-white hover:bg-slate-700'
                        }`}
                        title="Draw a custom redaction box manually on the image"
                      >
                        <PlusSquare size={13} />
                        <span>Add Redact Manually</span>
                      </button>
                    </div>
                    <span className="text-slate-400 hidden xl:inline">
                      {modalInteractionMode === 'pan'
                        ? 'Drag anywhere to move • Click any OCR box to toggle'
                        : 'Click & drag on image to draw a custom redaction box'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 font-mono">
                    {/* Interactive Image Zoom Controls */}
                    <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-lg px-1.5 py-0.5">
                      <button
                        onClick={() =>
                          setModalImageZoom(z => Math.max(0.5, Number((z - 0.25).toFixed(2))))
                        }
                        className="p-1 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors"
                        title="Zoom Out (-25%)"
                      >
                        <ZoomOut size={13} />
                      </button>
                      <button
                        onClick={() => setModalImageZoom(1.0)}
                        className="px-1.5 py-0.5 text-[10px] font-bold text-amber-300 hover:bg-slate-700 rounded transition-colors"
                        title="Reset to 100% Fit View"
                      >
                        {Math.round(modalImageZoom * 100)}%
                      </button>
                      <button
                        onClick={() =>
                          setModalImageZoom(z => Math.min(4.0, Number((z + 0.25).toFixed(2))))
                        }
                        className="p-1 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors"
                        title="Zoom In (+25%)"
                      >
                        <ZoomIn size={13} />
                      </button>
                      {activeImageModalMatch.imagePixelWidth &&
                        activeImageModalMatch.imagePixelWidth > 680 && (
                          <button
                            onClick={() => {
                              const natRatio = Number(
                                (activeImageModalMatch.imagePixelWidth! / 680).toFixed(2)
                              );
                              setModalImageZoom(z => (Math.abs(z - natRatio) < 0.1 ? 1.0 : Math.min(4.0, natRatio)));
                            }}
                            className="ml-0.5 px-1.5 py-0.5 text-[9px] font-sans font-bold uppercase rounded bg-indigo-600/40 hover:bg-indigo-600/70 text-indigo-200 border border-indigo-400/30 transition-colors"
                            title="Toggle 1:1 Native Pixel Size for inspecting small text"
                          >
                            1:1 Native
                          </button>
                        )}
                    </div>

                    {activeImageModalMatch.imagePixelWidth && activeImageModalMatch.imagePixelHeight && (
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-emerald-300 border border-slate-700">
                        {activeImageModalMatch.imagePixelWidth}×{activeImageModalMatch.imagePixelHeight}px
                      </span>
                    )}
                    <span className="text-indigo-300">
                      {(activeImageModalMatch.subBoxes || []).filter(b => b.selected).length} of{' '}
                      {(activeImageModalMatch.subBoxes || []).length} redacted
                    </span>
                  </div>
                </div>

                {/* Scrollable & Hand-Pannable Image Viewport */}
                <div
                  ref={modalViewportRef}
                  onMouseDown={(e) => {
                    if (modalInteractionMode === 'pan') {
                      handleModalImageMouseDown(e);
                    }
                  }}
                  className={`flex-1 overflow-auto p-4 sm:p-6 min-h-0 select-none ${
                    modalInteractionMode === 'pan'
                      ? modalPanState
                        ? 'cursor-grabbing'
                        : 'cursor-grab'
                      : ''
                  }`}
                >
                  {activeImageModalMatch.originalImageDataUrl ? (
                    <div className="w-fit mx-auto pb-6">
                      <div
                        onMouseDown={(e) => {
                          if (modalInteractionMode === 'draw_redact') {
                            handleModalImageMouseDown(e);
                          }
                        }}
                        onMouseMove={(e) => {
                          if (modalInteractionMode === 'draw_redact') {
                            handleModalImageMouseMove(e);
                          }
                        }}
                        onMouseUp={(e) => {
                          if (modalInteractionMode === 'draw_redact') {
                            handleModalImageMouseUp(e, activeImageModalMatch);
                          }
                        }}
                        onMouseLeave={() => {
                          if (modalInteractionMode === 'draw_redact') {
                            setModalDragBox(null);
                          }
                        }}
                        className={`relative inline-block bg-white rounded-lg shadow-2xl border-2 border-slate-700 select-none shrink-0 ${
                          modalInteractionMode === 'pan'
                            ? modalPanState
                              ? 'cursor-grabbing'
                              : 'cursor-grab'
                            : 'cursor-crosshair'
                        }`}
                      >
                        <img
                          src={activeImageModalMatch.originalImageDataUrl}
                          alt="Full-Size Extracted PDF Image"
                          draggable={false}
                          style={{
                            width: activeImageModalMatch.imagePixelWidth
                              ? `${Math.round(Math.min(activeImageModalMatch.imagePixelWidth, 680) * modalImageZoom)}px`
                              : `${Math.round(680 * modalImageZoom)}px`,
                            maxWidth: 'none',
                            height: 'auto',
                            maxHeight: 'none'
                          }}
                          className="block h-auto pointer-events-none select-none rounded-md"
                        />

                      {/* Full Blackout Mode Overlay */}
                      {activeImageModalMatch.imageMode === 'full_blackout' && (
                        <div className="absolute inset-0 bg-neutral-950/90 flex flex-col items-center justify-center text-white p-4 text-center">
                          <ImageOff size={28} className="text-rose-500 mb-2" />
                          <span className="text-xs font-bold uppercase tracking-wider">
                            Full Image Blackout Mode
                          </span>
                          <span className="text-[11px] text-slate-400 mt-1">
                            Switch to &ldquo;Keep Image Readable (OCR)&rdquo; on the right to redact only specific fields inside the image.
                          </span>
                        </div>
                      )}

                      {/* Interactive OCR & Custom Sub-Boxes */}
                      {activeImageModalMatch.imageMode !== 'full_blackout' &&
                        (activeImageModalMatch.subBoxes || []).map((box) => {
                          return (
                            <div
                              key={box.id}
                              onMouseDown={(e) => {
                                if (modalInteractionMode === 'draw_redact') {
                                  e.stopPropagation();
                                }
                              }}
                              onMouseUp={(e) => {
                                if (modalInteractionMode === 'draw_redact') {
                                  e.stopPropagation();
                                }
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (modalPanMovedRef.current) return;
                                handleToggleImageSubBox(activeImageModalMatch.id, box.id);
                              }}
                            style={{
                              position: 'absolute',
                              left: `${box.xRatio * 100}%`,
                              top: `${box.yRatio * 100}%`,
                              width: `${box.wRatio * 100}%`,
                              height: `${box.hRatio * 100}%`
                            }}
                            className={`group transition-all flex items-center justify-center cursor-pointer rounded-xs border overflow-hidden ${
                              box.selected
                                ? redactionOptions.mode === 'blackout'
                                  ? 'bg-neutral-950 border-rose-500 text-white shadow-2xs'
                                  : redactionOptions.mode === 'whiteout'
                                  ? 'bg-white border-slate-400 text-slate-700 shadow-2xs'
                                  : redactionOptions.boxColor === 'red_tint'
                                  ? 'bg-rose-100 border-rose-600 text-rose-900 shadow-2xs'
                                  : redactionOptions.boxColor === 'white'
                                  ? 'bg-white border-slate-400 text-slate-800 shadow-2xs'
                                  : redactionOptions.boxColor === 'black'
                                  ? 'bg-black border-slate-700 text-white shadow-2xs'
                                  : 'bg-slate-900 border-indigo-400 text-white shadow-2xs'
                                : box.fieldType === 'input_value'
                                ? 'bg-indigo-500/15 border-dashed border-indigo-400 hover:bg-rose-500/25 hover:border-rose-400'
                                : 'bg-emerald-500/12 border-dashed border-emerald-400/80 hover:bg-rose-500/25 hover:border-rose-400'
                            }`}
                            title={`${box.ruleName}: "${box.label}"${
                              box.pairedLabel ? ` (Input for ${box.pairedLabel})` : ''
                            } — Click to ${box.selected ? 'keep readable' : 'redact'}`}
                          >
                            {box.selected && (
                              <span className="text-[8px] sm:text-[9px] leading-none font-mono font-bold px-0.5 truncate pointer-events-none tracking-tight">
                                {redactionOptions.mode === 'replacement_text'
                                  ? redactionOptions.replacementText
                                  : redactionOptions.mode === 'whiteout'
                                  ? '[ERASED]'
                                  : '[REDACTED]'}
                              </span>
                            )}

                            {/* Delete button on hover */}
                            <button
                              onClick={(e) =>
                                handleDeleteImageSubBox(activeImageModalMatch.id, box.id, e)
                              }
                              className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-xs"
                              title="Remove this OCR box"
                            >
                              <X size={9} />
                            </button>
                          </div>
                        );
                      })}

                    {/* Live Drag Box for Manual In-Image Redaction */}
                    {modalDragBox && (
                      <div
                        style={{
                          position: 'absolute',
                          left: `${Math.min(modalDragBox.startX, modalDragBox.currX)}px`,
                          top: `${Math.min(modalDragBox.startY, modalDragBox.currY)}px`,
                          width: `${Math.abs(modalDragBox.currX - modalDragBox.startX)}px`,
                          height: `${Math.abs(modalDragBox.currY - modalDragBox.startY)}px`
                        }}
                        className="bg-rose-500/30 border-2 border-dashed border-rose-400 pointer-events-none flex items-center justify-center"
                      >
                        <span className="text-[9px] font-bold bg-rose-600 text-white px-1.5 py-0.5 rounded">
                          Redact Field
                        </span>
                      </div>
                    )}
                    </div>
                  </div>
                ) : (
                  <div className="p-8 rounded-xl bg-slate-800 text-slate-300 text-xs flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                    <span>Extracting high-resolution image &amp; running OCR...</span>
                  </div>
                )}
                </div>
              </div>

              {/* Right: OCR Fields Inspector & Local PDF Storage Settings */}
              <div className="w-full lg:w-96 bg-white border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col min-h-0 overflow-hidden shrink-0">
                <div className="p-4 border-b border-slate-200 space-y-3 bg-slate-50/70">
                  {/* Image Redaction Mode Toggle */}
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                      Image Sanitization Mode
                    </span>
                    <div className="grid grid-cols-2 gap-1.5 text-xs">
                      <button
                        onClick={() => handleChangeImageMode(activeImageModalMatch.id, 'partial')}
                        className={`py-2 px-2.5 rounded-xl border font-bold text-center transition-all ${
                          activeImageModalMatch.imageMode !== 'full_blackout'
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-900 shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        Keep Readable (OCR)
                      </button>
                      <button
                        onClick={() =>
                          handleChangeImageMode(activeImageModalMatch.id, 'full_blackout')
                        }
                        className={`py-2 px-2.5 rounded-xl border font-bold text-center transition-all ${
                          activeImageModalMatch.imageMode === 'full_blackout'
                            ? 'bg-rose-50 border-rose-300 text-rose-900 shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        Full Image Blackout
                      </button>
                    </div>
                  </div>

                  {/* Method C + Option 2: External URL Stripping & Clickable Local Full-Size View */}
                  <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                        <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                        <span>Method C: External Link Sanitized</span>
                      </div>
                      <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[9px] font-bold">
                        Stripped
                      </span>
                    </div>
                    {activeImageModalMatch.linkedUri ? (
                      <div className="text-[10px] font-mono text-slate-500 bg-slate-50 p-1.5 rounded border border-slate-200 truncate flex items-center gap-1">
                        <ExternalLink size={10} className="text-rose-500 shrink-0" />
                        <span className="line-through truncate">
                          {activeImageModalMatch.linkedUri}
                        </span>
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-500">
                        Any underlying web/server URL annotation on this image is automatically removed on export.
                      </p>
                    )}

                    <label className="pt-1.5 border-t border-slate-100 flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={activeImageModalMatch.createLocalFullSizePage !== false}
                        onChange={() => handleToggleLocalFullSizePage(activeImageModalMatch.id)}
                        className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5 shrink-0"
                      />
                      <div className="text-[11px] leading-snug">
                        <span className="font-bold text-slate-800 block">
                          Option 2: Save Clickable Full-Size View Locally in PDF
                        </span>
                        <span className="text-slate-500 text-[10px]">
                          Embeds the full-size redacted image as a local page inside the PDF and links this thumbnail to it (100% offline).
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* OCR Detected Text Fields List */}
                <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-1.5 bg-white shrink-0">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <ScanText size={14} className="text-indigo-600" />
                      <span>
                        OCR Detected Fields ({(activeImageModalMatch.subBoxes || []).length})
                      </span>
                    </span>
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <button
                        onClick={() => handleRedactOnlyInputValues(activeImageModalMatch.id)}
                        className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 font-bold transition-colors"
                        title="Redact all detected Form Input Values while keeping Form Labels readable"
                      >
                        Redact Inputs Only
                      </button>
                      <button
                        onClick={() => handleSetAllImageSubBoxes(activeImageModalMatch.id, true)}
                        className="text-indigo-600 hover:underline font-semibold"
                      >
                        All
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        onClick={() => handleSetAllImageSubBoxes(activeImageModalMatch.id, false)}
                        className="text-slate-500 hover:underline font-semibold"
                      >
                        None
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
                    {(activeImageModalMatch.subBoxes || []).length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                        No OCR regions yet. Click &amp; drag directly on the image on the left to redact any region.
                      </div>
                    ) : (
                      (activeImageModalMatch.subBoxes || []).map((box) => (
                        <div
                          key={box.id}
                          onClick={() =>
                            handleToggleImageSubBox(activeImageModalMatch.id, box.id)
                          }
                          className={`p-2 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
                            box.selected
                              ? 'bg-rose-50/70 border-rose-200 text-slate-900'
                              : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0 pr-2">
                            <input
                              type="checkbox"
                              checked={box.selected}
                              onChange={() => {}}
                              className="rounded text-rose-600 focus:ring-rose-500 h-3.5 w-3.5 shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono font-bold truncate text-slate-900">
                                  {box.label}
                                </span>
                                {box.fieldType && (
                                  <span
                                    className={`text-[9px] font-bold uppercase px-1.2 py-0.2 rounded shrink-0 ${
                                      box.fieldType === 'input_value'
                                        ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                                        : box.fieldType === 'label'
                                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                        : 'bg-slate-200 text-slate-700'
                                    }`}
                                  >
                                    {box.fieldType === 'input_value'
                                      ? 'Input Value'
                                      : box.fieldType === 'label'
                                      ? 'Form Label'
                                      : 'Header/Note'}
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-500 block truncate">
                                {box.pairedLabel
                                  ? `Paired with Label: "${box.pairedLabel}" • ${box.ruleName}`
                                  : box.ruleName}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <span
                              className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                                box.selected
                                  ? 'bg-rose-100 text-rose-800 border-rose-200'
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              }`}
                            >
                              {box.selected ? 'Redacted' : 'Readable'}
                            </span>
                            <button
                              onClick={(e) =>
                                handleDeleteImageSubBox(activeImageModalMatch.id, box.id, e)
                              }
                              className="p-1 text-slate-400 hover:text-rose-600 rounded"
                              title="Remove box"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
                  <span className="text-[11px] text-slate-500">
                    Changes apply automatically to PDF preview &amp; export
                  </span>
                  <button
                    onClick={() => setActiveImageModalId(null)}
                    className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PdfRedactor;

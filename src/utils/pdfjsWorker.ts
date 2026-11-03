import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Served with the app instead of from a CDN: same origin, works offline,
// and always matches the installed pdfjs-dist version
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

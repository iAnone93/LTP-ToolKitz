import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: true,
    hmr: process.env.DISABLE_HMR !== 'true',
  },
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    dedupe: ['react', 'react-dom', 'react-router-dom'],
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'tesseract.js'],
    exclude: ['pdfjs-dist'] // Prevents optimization issues with pdfjs worker
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('pdfjs-dist')) {
              return 'vendor-pdfjs';
            }
            if (id.includes('tesseract')) {
              return 'vendor-ocr';
            }
            if (id.includes('pdf-lib') || id.includes('@pdf-lib')) {
              return 'vendor-pdflib';
            }
            if (id.includes('xlsx')) {
              return 'vendor-xlsx';
            }
            if (id.includes('docx') || id.includes('mammoth')) {
              return 'vendor-docx';
            }
            if (id.includes('jspdf')) {
              return 'vendor-jspdf';
            }
            if (id.includes('ajv') || id.includes('jsonrepair')) {
              return 'vendor-json';
            }
            if (id.includes('react-diff-viewer') || id.includes('/diff/')) {
              return 'vendor-diff';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            if (id.includes('react-dom') || id.includes('react-router') || id.includes('/react/')) {
              return 'vendor-react';
            }
          }
        }
      }
    }
  }
});
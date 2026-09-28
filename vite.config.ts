import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  optimizeDeps: {
    exclude: ['pdfjs-dist'] // Prevents optimization issues with pdfjs worker
  },
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('pdf-lib') || id.includes('pdfjs-dist')) {
              return 'vendor-pdf';
            }
            if (id.includes('xlsx') || id.includes('docx') || id.includes('jspdf')) {
              return 'vendor-office';
            }
            if (id.includes('ajv') || id.includes('jsonrepair')) {
              return 'vendor-json';
            }
          }
        }
      }
    }
  }
});
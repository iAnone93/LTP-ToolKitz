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
        manualChunks: {
          'vendor-pdf': ['pdf-lib', 'pdfjs-dist'],
          'vendor-office': ['xlsx', 'docx', 'jspdf'],
          'vendor-json': ['ajv', 'ajv-formats', 'jsonrepair']
        }
      }
    }
  }
});
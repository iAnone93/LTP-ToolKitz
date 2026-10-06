
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const PdfTablePlacer = lazy(() => import('./pages/PdfTablePlacer'));
const JsonFormatter = lazy(() => import('./pages/JsonFormatter'));
const JsonSchemaBuilder = lazy(() => import('./pages/JsonSchemaBuilder'));
const DocumentConverter = lazy(() => import('./pages/DocumentConverter'));
const JsonCompare = lazy(() => import('./pages/JsonCompare'));
const PdfMerge = lazy(() => import('./pages/PdfMerge'));
const Base64Converter = lazy(() => import('./pages/Base64Converter'));
const RegexLiveTester = lazy(() => import('./pages/RegexLiveTester'));
const PdfRedactor = lazy(() => import('./pages/PdfRedactor'));
const DataCompare = lazy(() => import('./pages/DataCompare'));

const LoadingFallback: React.FC = () => (
  <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
    <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3"></div>
    <p className="text-xs font-semibold text-slate-500 tracking-wide uppercase">Loading toolkit component...</p>
  </div>
);

const App: React.FC = () => {
  const baseUrl = (import.meta as any).env?.BASE_URL || '/';
  return (
    <Router basename={baseUrl}>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/pdf-table-placer" element={<PdfTablePlacer />} />
          <Route path="/pdf-merge" element={<PdfMerge />} />
          <Route path="/json-formatter" element={<JsonFormatter />} />
          <Route path="/json-schema-builder" element={<JsonSchemaBuilder />} />
          <Route path="/document-converter" element={<DocumentConverter />} />
          <Route path="/json-compare" element={<JsonCompare />} />
          <Route path="/base64-converter" element={<Base64Converter />} />
          <Route path="/regex-live-tester" element={<RegexLiveTester />} />
          <Route path="/pdf-redactor" element={<PdfRedactor />} />
          <Route path="/data-compare" element={<DataCompare />} />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default App;


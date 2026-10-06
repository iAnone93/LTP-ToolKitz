import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Code, 
  FileJson, 
  FileOutput, 
  Wrench, 
  ArrowRight, 
  GitCompare, 
  Layers, 
  Search,
  CheckCircle2,
  SlidersHorizontal,
  X,
  Binary,
  Flame,
  ShieldAlert
} from 'lucide-react';

type ToolCategory = 'all' | 'pdf' | 'json' | 'utilities';

interface ToolItem {
  id: string;
  name: string;
  category: 'pdf' | 'json' | 'utilities';
  categoryLabel: string;
  badge?: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  cardBg: string;
  borderColor: string;
  hoverBorder: string;
  accentColor: string;
  available: boolean;
  features: string[];
}

const CATEGORIES: { id: ToolCategory; label: string; icon: React.ReactNode; countDescription?: string }[] = [
  { id: 'all', label: 'All Tools', icon: <SlidersHorizontal size={16} /> },
  { id: 'pdf', label: 'PDF Tools', icon: <Layers size={16} /> },
  { id: 'json', label: 'JSON Tools', icon: <Code size={16} /> },
  { id: 'utilities', label: 'Other Utilities', icon: <Wrench size={16} /> },
];

const tools: ToolItem[] = [
  // PDF Suite
  {
    id: 'pdf-table-placer',
    name: 'PDF Sign & Table Placer',
    category: 'pdf',
    categoryLabel: 'PDF Suite',
    badge: 'Popular',
    description: 'Visually place, resize, and embed customized tables or signature blocks into existing PDF documents.',
    icon: <FileText className="w-7 h-7 text-indigo-600" />,
    path: '/pdf-table-placer',
    cardBg: 'bg-white',
    borderColor: 'border-slate-200',
    hoverBorder: 'hover:border-indigo-400 hover:shadow-indigo-50/50',
    accentColor: 'text-indigo-600',
    available: true,
    features: ['Drag & drop placement', 'Custom table headers', 'Signature stamping', 'Live canvas preview']
  },
  {
    id: 'pdf-merge',
    name: 'PDF Merge & Reorder',
    category: 'pdf',
    categoryLabel: 'PDF Suite',
    badge: 'New in v2.1',
    description: 'Combine multiple PDF files into a single unified document with intuitive drag-and-drop reordering.',
    icon: <Layers className="w-7 h-7 text-purple-600" />,
    path: '/pdf-merge',
    cardBg: 'bg-white',
    borderColor: 'border-slate-200',
    hoverBorder: 'hover:border-purple-400 hover:shadow-purple-50/50',
    accentColor: 'text-purple-600',
    available: true,
    features: ['Quick first/last sorting', 'Live PDF preview modal', 'Lossless page stitching', 'Drag-to-reorder']
  },
  {
    id: 'pdf-redactor',
    name: 'PDF Sensitive Data Redactor',
    category: 'pdf',
    categoryLabel: 'PDF Suite',
    badge: 'OCR + PII Sanitizer',
    description: 'Automatically detect & redact sensitive PDF text and in-image form inputs via dual-pass OCR, with full-resolution image extraction and local PDF attachments.',
    icon: <ShieldAlert className="w-7 h-7 text-rose-600" />,
    path: '/pdf-redactor',
    cardBg: 'bg-white',
    borderColor: 'border-slate-200',
    hoverBorder: 'hover:border-rose-400 hover:shadow-rose-50/50',
    accentColor: 'text-rose-600',
    available: true,
    features: ['Auto In-Image OCR & Form Input Redaction', 'Full-resolution uncropped image preview', 'Auto PII & custom regex detection', 'Local full-size PDF attachment page']
  },

  // JSON Suite
  {
    id: 'json-formatter',
    name: 'JSON Formatter & Validator',
    category: 'json',
    categoryLabel: 'JSON Suite',
    description: 'Format, beautify, minify, and validate JSON payloads with color-coded syntax and line counters.',
    icon: <Code className="w-7 h-7 text-emerald-600" />,
    path: '/json-formatter',
    cardBg: 'bg-white',
    borderColor: 'border-slate-200',
    hoverBorder: 'hover:border-emerald-400 hover:shadow-emerald-50/50',
    accentColor: 'text-emerald-600',
    available: true,
    features: ['Syntax error detection', 'Minify & beautify', 'One-click copy', 'Key/Value statistics']
  },
  {
    id: 'json-schema-builder',
    name: 'JSON Schema Builder',
    category: 'json',
    categoryLabel: 'JSON Suite',
    description: 'Visually design, edit, and export draft-compliant JSON schemas for API testing and contracts.',
    icon: <FileJson className="w-7 h-7 text-sky-600" />,
    path: '/json-schema-builder',
    cardBg: 'bg-white',
    borderColor: 'border-slate-200',
    hoverBorder: 'hover:border-sky-400 hover:shadow-sky-50/50',
    accentColor: 'text-sky-600',
    available: true,
    features: ['Visual field tree', 'Type validation rules', 'Schema export (Draft 7/2020)', 'Nested properties']
  },
  {
    id: 'json-compare',
    name: 'JSON Diff & Compare',
    category: 'json',
    categoryLabel: 'JSON Suite',
    description: 'Compare two JSON objects side-by-side with clear additions, removals, and structural diff highlights.',
    icon: <GitCompare className="w-7 h-7 text-rose-600" />,
    path: '/json-compare',
    cardBg: 'bg-white',
    borderColor: 'border-slate-200',
    hoverBorder: 'hover:border-rose-400 hover:shadow-rose-50/50',
    accentColor: 'text-rose-600',
    available: true,
    features: ['Side-by-side diff view', 'Inline value differences', 'Deep key matching', 'Summary statistics']
  },

  // Other Utilities Suite
  {
    id: 'data-compare',
    name: 'Data Compare & Multi-Diff',
    category: 'utilities',
    categoryLabel: 'Other Utilities',
    badge: 'New in v2.1',
    description: 'Compare code (Groovy for Katalon, SQL, Python, Java, JS), text paragraphs, spreadsheets (Excel/CSV), and PDF revisions side-by-side.',
    icon: <GitCompare className="w-7 h-7 text-indigo-600" />,
    path: '/data-compare',
    cardBg: 'bg-white',
    borderColor: 'border-slate-200',
    hoverBorder: 'hover:border-indigo-400 hover:shadow-indigo-50/50',
    accentColor: 'text-indigo-600',
    available: true,
    features: ['Groovy (Katalon), SQL & Code scripts', 'Excel (.xlsx) & CSV cell-level diff', 'PDF document revision comparison', 'Word-level & line-level visual highlights']
  },
  {
    id: 'regex-live-tester',
    name: 'Regex Live Tester & Builder',
    category: 'utilities',
    categoryLabel: 'Other Utilities',
    badge: 'Experimental',
    description: 'Test regular expressions in real-time with visual group highlights, search-and-replace, and an interactive click-to-match pattern synthesizer.',
    icon: <Flame className="w-7 h-7 text-amber-500" />,
    path: '/regex-live-tester',
    cardBg: 'bg-white',
    borderColor: 'border-slate-200',
    hoverBorder: 'hover:border-amber-400 hover:shadow-amber-50/50',
    accentColor: 'text-amber-600',
    available: true,
    features: ['Live match highlighting', 'Interactive pattern synthesizer', 'Group inspector table', 'Multi-language code generator']
  },
  {
    id: 'base64-converter',
    name: 'Base64 Encoder / Decoder',
    category: 'utilities',
    categoryLabel: 'Other Utilities',
    description: 'Convert strings, images, and documents (PDF, Word, Excel) to Base64 and reconstruct them back into downloadable files.',
    icon: <Binary className="w-7 h-7 text-emerald-600" />,
    path: '/base64-converter',
    cardBg: 'bg-white',
    borderColor: 'border-slate-200',
    hoverBorder: 'hover:border-emerald-400 hover:shadow-emerald-50/50',
    accentColor: 'text-emerald-600',
    available: true,
    features: ['Images, PDFs, Word & Excel files', 'Magic-byte auto-detection & preview', 'Data URI, HTML img & CSS formats', 'URL-Safe & Basic Auth helper']
  },
  {
    id: 'document-converter',
    name: 'Document Converter',
    category: 'utilities',
    categoryLabel: 'Other Utilities',
    description: 'Convert document formats between PDF, Word, Excel, and structured plain-text files quickly.',
    icon: <FileOutput className="w-7 h-7 text-amber-600" />,
    path: '/document-converter',
    cardBg: 'bg-white',
    borderColor: 'border-slate-200',
    hoverBorder: 'hover:border-amber-400 hover:shadow-amber-50/50',
    accentColor: 'text-amber-600',
    available: true,
    features: ['Multi-format support', 'Local client processing', 'Fast batch conversion', 'Clean layout preservation']
  },
  {
    id: 'more-tools',
    name: 'More Utilities',
    category: 'utilities',
    categoryLabel: 'In Pipeline',
    badge: 'Coming Soon',
    description: 'Additional automated QA and workflow utilities are being built to simplify daily productivity.',
    icon: <Wrench className="w-7 h-7 text-slate-400" />,
    path: '#',
    cardBg: 'bg-slate-50/70',
    borderColor: 'border-dashed border-slate-300',
    hoverBorder: '',
    accentColor: 'text-slate-500',
    available: false,
    features: ['CSV to JSON Transformer', 'Regex live tester', 'UUID & Hash generator']
  }
];

const LandingPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<ToolCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTools = useMemo(() => {
    return tools.filter((tool) => {
      const matchesCategory = activeCategory === 'all' || tool.category === activeCategory;
      const matchesSearch = 
        searchQuery.trim() === '' ||
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.features.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const pdfTools = useMemo(() => tools.filter(t => t.category === 'pdf'), []);
  const jsonTools = useMemo(() => tools.filter(t => t.category === 'json'), []);
  const utilitiesTools = useMemo(() => tools.filter(t => t.category === 'utilities'), []);

  const getCategoryCount = (category: ToolCategory) => {
    if (category === 'all') return tools.filter(t => t.available).length;
    return tools.filter(t => t.category === category && t.available).length;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-3.5 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-sm shadow-indigo-100">
              <Wrench size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">ian's Toolkit</h1>
                <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md border border-slate-200">
                  v2.1
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Productivity suite for PDF, JSON & other utilities</p>
            </div>
          </div>

          {/* Quick Category Anchors */}
          <nav className="hidden md:flex items-center space-x-1 text-xs font-medium text-slate-600">
            <button
              onClick={() => { setActiveCategory('pdf'); setSearchQuery(''); }}
              className="px-3 py-1.5 rounded-lg hover:bg-slate-100 hover:text-indigo-600 transition-colors flex items-center gap-1.5"
            >
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              PDF Tools
            </button>
            <button
              onClick={() => { setActiveCategory('json'); setSearchQuery(''); }}
              className="px-3 py-1.5 rounded-lg hover:bg-slate-100 hover:text-emerald-600 transition-colors flex items-center gap-1.5"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              JSON Tools
            </button>
            <button
              onClick={() => { setActiveCategory('utilities'); setSearchQuery(''); }}
              className="px-3 py-1.5 rounded-lg hover:bg-slate-100 hover:text-amber-600 transition-colors flex items-center gap-1.5"
            >
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              Other Utilities
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="bg-gradient-to-b from-white to-slate-50 border-b border-slate-200/80 pt-12 pb-10 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
            Essential Tools for Smooth Work!
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mb-8">
            High-performance browser utilities organized for fast document handling, PDF management, JSON manipulation, and other daily utilities.
          </p>

          {/* Search & Filter Controls */}
          <div className="max-w-xl mx-auto flex flex-col sm:flex-row gap-3 items-center">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tools by name, feature, or keyword..."
                className="w-full pl-10 pr-9 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-xs transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  title="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              const count = getCategoryCount(cat.id);
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {cat.icon}
                  <span>{cat.label}</span>
                  <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${
                    isActive ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        {searchQuery.trim() !== '' || activeCategory !== 'all' ? (
          /* Filtered View */
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {activeCategory === 'all' 
                    ? `Search results for "${searchQuery}"` 
                    : CATEGORIES.find(c => c.id === activeCategory)?.label}
                </h3>
                <p className="text-xs text-slate-500">
                  Showing {filteredTools.length} {filteredTools.length === 1 ? 'utility' : 'utilities'}
                </p>
              </div>
              {(activeCategory !== 'all' || searchQuery !== '') && (
                <button
                  onClick={() => { setActiveCategory('all'); setSearchQuery(''); }}
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
                >
                  Reset filters
                </button>
              )}
            </div>

            {filteredTools.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto">
                <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Search size={22} />
                </div>
                <h4 className="text-base font-bold text-slate-800 mb-1">No matching tools found</h4>
                <p className="text-xs text-slate-500 mb-4">Try searching with a different term or clear the filter.</p>
                <button
                  onClick={() => { setActiveCategory('all'); setSearchQuery(''); }}
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800"
                >
                  Show all tools
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTools.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Default Reorganized Sectional View */
          <div className="space-y-12">
            {/* Section 1: PDF Tools */}
            <section id="pdf-tools" className="scroll-mt-20">
              <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 text-purple-700 rounded-lg border border-purple-100">
                    <Layers size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-slate-900">PDF Suite</h3>
                      <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                        {pdfTools.length} Tools
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">Edit, stitch, stamp, and organize PDF documents in-browser</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pdfTools.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </div>
            </section>

            {/* Section 2: JSON Tools */}
            <section id="json-tools" className="scroll-mt-20">
              <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100">
                    <Code size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-slate-900">JSON Suite</h3>
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                        3 Tools
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">Format, validate, compare, and build contracts for API payloads</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jsonTools.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </div>
            </section>

            {/* Section 3: Other Utilities */}
            <section id="other-utilities" className="scroll-mt-20">
              <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-50 text-amber-700 rounded-lg border border-amber-100">
                    <Wrench size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-slate-900">Other Utilities</h3>
                      <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                        {utilitiesTools.length} Utilities
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">Document conversion and additional daily productivity tools</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {utilitiesTools.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-200 bg-white py-6 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">LTP-ToolKitz</span>
            <span>·</span>
            <span>ian's Toolkit</span>
            <span>·</span>
            <span>v2.1</span>
          </div>
          <div>
            Fast, secure, client-side tools — no files or data uploaded to external servers.
          </div>
        </div>
      </footer>
    </div>
  );
};

interface ToolCardProps {
  tool: ToolItem;
}

const ToolCard: React.FC<ToolCardProps> = ({ tool }) => {
  if (!tool.available) {
    return (
      <div 
        className={`flex flex-col p-6 rounded-2xl border-2 ${tool.borderColor} ${tool.cardBg} transition-all`}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center">
            {tool.icon}
          </div>
          {tool.badge && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-200 text-slate-600">
              {tool.badge}
            </span>
          )}
        </div>
        <h4 className="text-lg font-bold text-slate-600 mb-1.5">
          {tool.name}
        </h4>
        <p className="text-xs text-slate-500 mb-4 flex-1">
          {tool.description}
        </p>
        <div className="pt-3 border-t border-slate-200/70">
          <p className="text-[11px] font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Planned Features</p>
          <ul className="space-y-1">
            {tool.features.map((feat, idx) => (
              <li key={idx} className="text-xs text-slate-500 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                {feat}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <Link 
      to={tool.path}
      className={`group flex flex-col p-6 rounded-2xl border-2 ${tool.borderColor} ${tool.cardBg} ${tool.hoverBorder} shadow-xs hover:shadow-md transition-all duration-200`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-14 h-14 rounded-xl bg-slate-50 group-hover:bg-white group-hover:shadow-sm border border-slate-100 flex items-center justify-center transition-all">
          {tool.icon}
        </div>
        {tool.badge && (
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
            {tool.badge}
          </span>
        )}
      </div>

      <div className="text-[11px] font-semibold tracking-wider uppercase text-slate-400 mb-1">
        {tool.categoryLabel}
      </div>

      <h4 className="text-lg font-bold text-slate-900 mb-1.5 group-hover:text-indigo-600 transition-colors">
        {tool.name}
      </h4>

      <p className="text-xs text-slate-600 mb-4 flex-1 leading-relaxed">
        {tool.description}
      </p>

      {/* Feature Highlights */}
      <div className="pt-3 border-t border-slate-100 mb-5">
        <ul className="space-y-1">
          {tool.features.slice(0, 3).map((feat, idx) => (
            <li key={idx} className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
              <span>{feat}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-center justify-between text-xs font-semibold text-indigo-600 pt-2 border-t border-slate-100 group-hover:text-indigo-700">
        <span>Launch Tool</span>
        <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
};

export default LandingPage;


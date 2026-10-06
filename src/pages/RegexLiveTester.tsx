import React, { useState, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Sparkles, 
  Copy, 
  Check, 
  Code2, 
  BookOpen, 
  Replace, 
  AlertTriangle, 
  Play, 
  CheckCircle2, 
  Flame,
  Wand2,
  Trash2,
  HelpCircle,
  RotateCcw,
  Info,
  ShieldAlert
} from 'lucide-react';
import { 
  POPULAR_REGEX_PRESETS, 
  CODE_SNIPPET_TEMPLATES, 
  REGEX_CHEATSHEET_CATEGORIES 
} from '../utils/regexPresets';
import { generateMultiTierSuggestions, escapeRegex } from '../utils/regexGenerator';
import { RegexMatchItem, TokenSuggestion } from '../types/regex';

type ActiveTab = 'tester' | 'builder' | 'replace' | 'code' | 'cheatsheet';

const SAMPLE_STARTERS = [
  { label: '📧 Email Addresses', presetId: 'email' },
  { label: '🕒 ISO Timestamp', presetId: 'iso-timestamp' },
  { label: '📅 ISO Dates', presetId: 'iso-date' },
  { label: '🔗 Web URLs', presetId: 'url' },
  { label: '🖥️ IPv4 Addresses', presetId: 'ipv4' },
  { label: '🔢 Numbers & Decimals', presetId: 'digits-only' }
];

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

// Smart string pattern detector for test strings
const detectStringType = (text: string) => {
  const trimmed = text.trim();
  if (!trimmed) return null;

  // ISO timestamp (with T, e.g. 2020-03-12T13:34:56.123Z)
  if (/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(trimmed)) {
    return {
      name: 'ISO Timestamp',
      pattern: '\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d+)?(?:Z|[+-]\\d{2}:?\\d{2})?',
      description: 'Matches ISO 8601 date and time timestamps (e.g. 2020-03-12T13:34:56.123Z)'
    };
  }

  // ISO date (YYYY-MM-DD)
  if (/\b\d{4}-\d{2}-\d{2}\b/.test(trimmed)) {
    return {
      name: 'ISO Date',
      pattern: '\\d{4}-\\d{2}-\\d{2}',
      description: 'Matches standard calendar dates (YYYY-MM-DD)'
    };
  }

  // IPv4 Address
  if (/\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/.test(trimmed)) {
    return {
      name: 'IPv4 Address',
      pattern: '\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b',
      description: 'Matches standard 4-octet IPv4 addresses'
    };
  }

  // Email
  if (/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(trimmed)) {
    return {
      name: 'Email Address',
      pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
      description: 'Matches standard email addresses'
    };
  }

  // URL
  if (/https?:\/\/[^\s]+/.test(trimmed)) {
    return {
      name: 'Web URL',
      pattern: 'https?:\\/\\/(?:localhost|(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,}|\\d{1,3}(?:\\.\\d{1,3}){3})(?::\\d+)?(?:\\/[^\\s]*)?',
      description: 'Matches HTTP/HTTPS web links and paths'
    };
  }

  // Pure Number or Decimal
  if (/^[-+]?\d*\.?\d+(?:[eE][-+]?\\d+)?$/.test(trimmed)) {
    return {
      name: 'Number / Decimal',
      pattern: '[-+]?\\d*\\.?\\d+',
      description: 'Matches numeric integers, decimals, or floats'
    };
  }

  return null;
};

const RegexLiveTester: React.FC = () => {
  // Regex Expression & Flags
  const [pattern, setPattern] = useState<string>('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}');
  const [flags, setFlags] = useState<{ g: boolean; i: boolean; m: boolean; s: boolean }>({
    g: true,
    i: false,
    m: false,
    s: false,
  });

  // Test String Input
  const [testString, setTestString] = useState<string>(
    `Welcome to the live regex testing and pattern synthesis lab!\n` +
    `Contact the support team at help@toolkitz.dev or billing-issues@corp.company.org.\n` +
    `For legacy accounts, reach out to admin_user99@system.local or info@sample.co.id.\n` +
    `Invalid email samples: bad_address@, @missingusername.com, not-an-email.`
  );

  // Substitution string
  const [replacementPattern, setReplacementPattern] = useState<string>('[$&]');

  // Active Workspace Tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('tester');

  // Selected language for code snippet tab
  const [selectedLang, setSelectedLang] = useState<string>('javascript');

  // Builder sample string and selected suggestions (Visual Multi-Tier Selection)
  const [builderSample, setBuilderSample] = useState<string>(
    `2020-03-12T13:34:56.123Z INFO [org.example.Class]: This is a #simple #logline containing a 'value'.`
  );
  
  // Set of selected suggestion IDs
  const [selectedSuggestionIds, setSelectedSuggestionIds] = useState<string[]>([]);
  // Hovered suggestion ID for interactive preview highlight
  const [hoveredSuggestionId, setHoveredSuggestionId] = useState<string | null>(null);

  // Builder output mode: 'selectedOnly' (default) vs 'fullLine'
  const [builderScope, setBuilderScope] = useState<'selectedOnly' | 'fullLine'>('selectedOnly');

  // UI feedback states
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedRegex, setCopiedRegex] = useState(false);

  // Sync scroll between textarea and highlight overlay
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (textareaRef.current && backdropRef.current) {
      backdropRef.current.scrollTop = textareaRef.current.scrollTop;
      backdropRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  // Compile RegExp with safety guard
  const { compiledRegex, regexError, matches } = useMemo(() => {
    const flagString = Object.entries(flags)
      .filter(([_, enabled]) => enabled)
      .map(([f]) => f)
      .join('');

    if (!pattern) {
      return { compiledRegex: null, regexError: null, matches: [] };
    }

    try {
      const reg = new RegExp(pattern, flagString);
      const allMatches: RegexMatchItem[] = [];

      if (flags.g) {
        let match: RegExpExecArray | null;
        let iterationCount = 0;
        const maxIterations = 5000; // Safeguard against ReDoS catastrophic loops

        while ((match = reg.exec(testString)) !== null && iterationCount < maxIterations) {
          iterationCount++;
          const matchIndex = match.index;
          const fullMatch = match[0];
          const groups = match.slice(1).map((grp, i) => ({
            groupIndex: i + 1,
            match: grp || '',
            start: matchIndex,
            end: matchIndex + (grp ? grp.length : 0)
          }));

          allMatches.push({
            matchIndex: allMatches.length,
            fullMatch,
            start: matchIndex,
            end: matchIndex + fullMatch.length,
            groups
          });

          // Prevent infinite zero-width match loop (e.g. `^`, `\b`)
          if (match[0].length === 0) {
            reg.lastIndex++;
          }
        }
      } else {
        const match = reg.exec(testString);
        if (match) {
          allMatches.push({
            matchIndex: 0,
            fullMatch: match[0],
            start: match.index,
            end: match.index + match[0].length,
            groups: match.slice(1).map((grp, i) => ({
              groupIndex: i + 1,
              match: grp || '',
              start: match.index,
              end: match.index + (grp ? grp.length : 0)
            }))
          });
        }
      }

      return {
        compiledRegex: reg,
        regexError: null,
        matches: allMatches
      };
    } catch (err: any) {
      return {
        compiledRegex: null,
        regexError: err.message || 'Invalid regular expression syntax',
        matches: []
      };
    }
  }, [pattern, flags, testString]);

  // Compute live substitution preview
  const substitutionResult = useMemo(() => {
    if (!compiledRegex || regexError) return testString;
    try {
      return testString.replace(compiledRegex, replacementPattern);
    } catch (e: any) {
      return `Replacement Error: ${e.message}`;
    }
  }, [testString, compiledRegex, regexError, replacementPattern]);

  // All multi-tiered suggestion spans for builderSample
  const allSuggestions = useMemo(() => {
    return generateMultiTierSuggestions(builderSample);
  }, [builderSample]);

  // Total number of tiers (layers) calculated
  const maxTier = useMemo(() => {
    return allSuggestions.reduce((acc, curr) => Math.max(acc, curr.tier), 0);
  }, [allSuggestions]);

  // Group suggestions by tier for easy rendering in stacked rows
  const suggestionsByTier = useMemo(() => {
    const tiers: TokenSuggestion[][] = Array.from({ length: maxTier + 1 }, () => []);
    allSuggestions.forEach(s => {
      tiers[s.tier].push(s);
    });
    return tiers;
  }, [allSuggestions, maxTier]);

  // Selected token suggestions list, ordered by start position
  const selectedSuggestions = useMemo(() => {
    return allSuggestions
      .filter(s => selectedSuggestionIds.includes(s.id))
      .sort((a, b) => a.start - b.start);
  }, [allSuggestions, selectedSuggestionIds]);

  // Toggle suggestion selection with overlap management
  const handleToggleSuggestion = (suggestion: TokenSuggestion) => {
    setSelectedSuggestionIds(prev => {
      if (prev.includes(suggestion.id)) {
        return prev.filter(id => id !== suggestion.id);
      } else {
        // If selecting a span that overlaps with an already selected span, deselect the conflicting ones
        const conflictingIds = allSuggestions
          .filter(s => prev.includes(s.id))
          .filter(s => !(s.end <= suggestion.start || s.start >= suggestion.end))
          .map(s => s.id);

        const filtered = prev.filter(id => !conflictingIds.includes(id));
        return [...filtered, suggestion.id];
      }
    });
  };

  // Synthesize regular expression
  const generatedBuilderPattern = useMemo(() => {
    if (!builderSample) return '';
    if (selectedSuggestions.length === 0) {
      return '';
    }

    if (builderScope === 'selectedOnly') {
      // If only 1 item is selected, output just that item's snippet!
      if (selectedSuggestions.length === 1) {
        return selectedSuggestions[0].regexSnippet;
      }

      // If multiple items are selected, connect them with flexible gap or literals
      const sorted = [...selectedSuggestions].sort((a, b) => a.start - b.start);
      let result = '';
      for (let i = 0; i < sorted.length; i++) {
        if (i > 0) {
          const prev = sorted[i - 1];
          const curr = sorted[i];
          const gap = builderSample.substring(prev.end, curr.start);
          if (gap.length > 0) {
            if (/^\s+$/.test(gap)) {
              result += '\\s+';
            } else {
              result += escapeRegex(gap);
            }
          }
        }
        result += sorted[i].regexSnippet;
      }
      return result;
    } else {
      // Full line structure: includes leading and trailing literals
      let result = '';
      let cursor = 0;
      const sorted = [...selectedSuggestions].sort((a, b) => a.start - b.start);
      sorted.forEach(sugg => {
        if (sugg.start > cursor) {
          result += escapeRegex(builderSample.substring(cursor, sugg.start));
        }
        result += sugg.regexSnippet;
        cursor = sugg.end;
      });
      if (cursor < builderSample.length) {
        result += escapeRegex(builderSample.substring(cursor));
      }
      return result;
    }
  }, [builderSample, selectedSuggestions, builderScope]);

  // Apply Generated Builder Pattern to Tester
  const applyBuilderPatternToTester = () => {
    if (!generatedBuilderPattern) return;
    setPattern(generatedBuilderPattern);
    if (builderScope === 'selectedOnly' && selectedSuggestions.length === 1) {
      setTestString(selectedSuggestions[0].text);
    } else {
      setTestString(builderSample);
    }
    setActiveTab('tester');
  };

  // Flag toggle helper
  const toggleFlag = (flagKey: 'g' | 'i' | 'm' | 's') => {
    setFlags(prev => ({ ...prev, [flagKey]: !prev[flagKey] }));
  };

  // Copy code helper
  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Copy regex helper
  const handleCopyRegex = () => {
    const fullExp = `/${pattern}/${Object.entries(flags).filter(([_, e]) => e).map(([f]) => f).join('')}`;
    navigator.clipboard.writeText(fullExp);
    setCopiedRegex(true);
    setTimeout(() => setCopiedRegex(false), 2000);
  };

  // Smart detect suggestion for the active test string
  const detectedSuggestion = useMemo(() => {
    return detectStringType(testString);
  }, [testString]);

  const handleAutoDetectForTestString = () => {
    if (detectedSuggestion) {
      setPattern(detectedSuggestion.pattern);
    } else {
      setBuilderSample(testString);
      setSelectedSuggestionIds([]);
      setActiveTab('builder');
    }
  };

  // Render Highlighted HTML overlay behind textarea
  const renderedHighlightOverlay = useMemo(() => {
    if (!pattern || regexError || matches.length === 0) {
      return testString;
    }

    const segments: React.ReactNode[] = [];
    let lastIndex = 0;

    matches.forEach((m, idx) => {
      // Unmatched leading slice
      if (m.start > lastIndex) {
        segments.push(testString.substring(lastIndex, m.start));
      }

      // Matched slice: purely transparent text with background highlight so no double-vision ghosting occurs
      segments.push(
        <mark
          key={`match-${idx}`}
          className="bg-amber-300/85 text-transparent rounded-xs m-0 p-0 select-none inline"
        >
          {m.fullMatch}
        </mark>
      );

      lastIndex = m.end;
    });

    // Unmatched trailing slice
    if (lastIndex < testString.length) {
      segments.push(testString.substring(lastIndex));
    }

    // Trailing newline render fix for textarea sync
    if (testString.endsWith('\n')) {
      segments.push('\n ');
    }

    return segments;
  }, [testString, matches, pattern, regexError]);

  return (
    <div className="h-screen bg-slate-50 flex flex-col text-slate-800 overflow-hidden">
      
      {/* Top Application Header */}
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
                <Flame size={19} className="text-amber-500 fill-amber-500" />
                <span>Regex Live Tester & Builder</span>
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
                Visual Studio
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Visual multi-tier pattern builder + real-time live tester & Katalon Groovy code generator
            </p>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCopyRegex}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-all"
            title="Copy compiled RegExp"
          >
            {copiedRegex ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
            <span>{copiedRegex ? 'Copied!' : 'Copy Regex'}</span>
          </button>
        </div>
      </header>

      {/* Main Studio Body */}
      <main className="flex-1 flex flex-col overflow-hidden min-h-0">
        
        {/* Top Expression Bar */}
        <section className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 shrink-0 shadow-2xs">
          <div className="flex flex-col gap-2">
            
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
              {/* Regex Slashes & Input Field */}
              <div className="flex-1 flex items-center bg-slate-900 text-amber-300 rounded-xl px-3.5 py-2 border border-slate-800 shadow-inner group focus-within:ring-2 focus-within:ring-amber-500/50">
                <span className="text-slate-500 font-mono text-base font-bold select-none pr-1.5">/</span>
                <input
                  type="text"
                  value={pattern}
                  onChange={(e) => setPattern(e.target.value)}
                  placeholder="e.g. \d+ for numbers, or click a Starter below..."
                  className="flex-1 bg-transparent text-white font-mono text-sm focus:outline-none placeholder-slate-500"
                  spellCheck={false}
                />
                <span className="text-slate-500 font-mono text-base font-bold select-none pl-1.5">/</span>
                <span className="text-amber-400 font-mono text-xs font-semibold select-none pl-1">
                  {Object.entries(flags).filter(([_, e]) => e).map(([f]) => f).join('') || ''}
                </span>
              </div>

              {/* Flag Toggles */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start md:self-auto shrink-0">
                <button
                  onClick={() => toggleFlag('g')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all flex items-center gap-1 ${
                    flags.g 
                      ? 'bg-amber-500 text-white font-bold shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                  }`}
                  title="Global: Find all matches instead of stopping at the first one"
                >
                  <span className="font-mono font-bold">g</span>
                  <span className="text-[10px] hidden sm:inline">All</span>
                </button>

                <button
                  onClick={() => toggleFlag('i')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all flex items-center gap-1 ${
                    flags.i 
                      ? 'bg-amber-500 text-white font-bold shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                  }`}
                  title="Case Insensitive: Match both UPPERCASE and lowercase"
                >
                  <span className="font-mono font-bold">i</span>
                  <span className="text-[10px] hidden sm:inline">No-case</span>
                </button>

                <button
                  onClick={() => toggleFlag('m')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all flex items-center gap-1 ${
                    flags.m 
                      ? 'bg-amber-500 text-white font-bold shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                  }`}
                  title="Multiline: ^ and $ match beginning and end of each line"
                >
                  <span className="font-mono font-bold">m</span>
                  <span className="text-[10px] hidden sm:inline">Lines</span>
                </button>

                <button
                  onClick={() => toggleFlag('s')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all flex items-center gap-1 ${
                    flags.s 
                      ? 'bg-amber-500 text-white font-bold shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                  }`}
                  title="DotAll: . matches newlines as well"
                >
                  <span className="font-mono font-bold">s</span>
                  <span className="text-[10px] hidden sm:inline">DotAll</span>
                </button>
              </div>

              {/* Status pill & Match counter */}
              <div className="flex items-center gap-2 self-start md:self-auto shrink-0 text-xs">
                {regexError ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg font-medium">
                    <AlertTriangle size={14} className="text-rose-500 shrink-0" />
                    <span className="truncate max-w-[180px]" title={regexError}>Invalid regex</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg font-mono">
                    <CheckCircle2 size={13} className="text-emerald-600" />
                    <span><strong>{matches.length}</strong> {matches.length === 1 ? 'match' : 'matches'}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Starter Pills for Beginners */}
            <div className="flex items-center gap-1.5 overflow-x-auto pt-1 text-xs">
              <span className="text-[11px] font-semibold text-slate-400 shrink-0">Quick Starters:</span>
              {SAMPLE_STARTERS.map((starter) => {
                const preset = POPULAR_REGEX_PRESETS.find(p => p.id === starter.presetId);
                if (!preset) return null;
                return (
                  <button
                    key={starter.presetId}
                    onClick={() => {
                      setPattern(preset.pattern);
                      setTestString(preset.sample);
                      setActiveTab('tester');
                    }}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-amber-50 hover:text-amber-900 hover:border-amber-300 border border-slate-200 rounded-lg text-slate-600 text-xs shrink-0 transition-colors"
                  >
                    {starter.label}
                  </button>
                );
              })}
            </div>

          </div>
        </section>

        {/* Feature Navigation Tabs */}
        <section className="bg-slate-100/70 border-b border-slate-200 px-4 sm:px-6 pt-2 flex items-center justify-between overflow-x-auto gap-4 shrink-0">
          <div className="flex items-center gap-1">
            
            <button
              onClick={() => setActiveTab('tester')}
              className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 border-t border-x ${
                activeTab === 'tester'
                  ? 'bg-white text-slate-900 border-slate-200 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-200/50'
              }`}
            >
              <Play size={13} className={activeTab === 'tester' ? 'text-amber-500' : ''} />
              <span>1. Live Tester</span>
              {matches.length > 0 && (
                <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded-full text-[10px] font-mono">
                  {matches.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('builder')}
              className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 border-t border-x ${
                activeTab === 'builder'
                  ? 'bg-white text-slate-900 border-slate-200 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-200/50'
              }`}
            >
              <Wand2 size={13} className={activeTab === 'builder' ? 'text-amber-500' : ''} />
              <span>2. Pattern Builder</span>
              <span className="px-1.5 py-0.2 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-[9px] uppercase tracking-wider font-semibold">
                Visual Tiers
              </span>
            </button>

            <button
              onClick={() => setActiveTab('replace')}
              className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 border-t border-x ${
                activeTab === 'replace'
                  ? 'bg-white text-slate-900 border-slate-200 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-200/50'
              }`}
            >
              <Replace size={13} className={activeTab === 'replace' ? 'text-amber-500' : ''} />
              <span>3. Substitution</span>
            </button>

            <button
              onClick={() => setActiveTab('code')}
              className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 border-t border-x ${
                activeTab === 'code'
                  ? 'bg-white text-slate-900 border-slate-200 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-200/50'
              }`}
            >
              <Code2 size={13} className={activeTab === 'code' ? 'text-amber-500' : ''} />
              <span>4. Code Snippets</span>
            </button>

            <button
              onClick={() => setActiveTab('cheatsheet')}
              className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 border-t border-x ${
                activeTab === 'cheatsheet'
                  ? 'bg-white text-slate-900 border-slate-200 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-200/50'
              }`}
            >
              <BookOpen size={13} className={activeTab === 'cheatsheet' ? 'text-amber-500' : ''} />
              <span>5. Cheatsheet</span>
            </button>

          </div>

          <div className="text-[11px] text-slate-500 hidden md:flex items-center gap-2 pb-1">
            <span>Current Expression:</span>
            <code className="bg-white px-2 py-0.5 rounded border border-slate-200 font-mono text-slate-700">
              /{pattern || '...'}/{Object.entries(flags).filter(([_, e]) => e).map(([f]) => f).join('')}
            </code>
          </div>
        </section>

        {/* Workspace Canvas & Split View */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          
          {/* Main Working Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 h-full">

            {/* TAB: LIVE TESTER */}
            {activeTab === 'tester' && (
              <div className="space-y-5">
                
                {/* Visual match explainer */}
                <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Info size={15} className="text-amber-600 shrink-0" />
                    <span>Text matched by your pattern is automatically highlighted with <mark className="bg-amber-300 px-1 py-0.2 rounded font-semibold text-slate-900">yellow highlights</mark> below.</span>
                  </div>
                </div>

                {/* Input Text Area with Overlay */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <span>Test String (Type or Paste Text Below)</span>
                    </label>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleAutoDetectForTestString}
                        className="text-xs font-semibold text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
                        title="Auto-detect pattern for this text"
                      >
                        <Sparkles size={12} className="text-amber-600" />
                        <span>Auto-Detect Regex</span>
                      </button>

                      <button
                        onClick={() => setTestString('')}
                        className="text-xs text-slate-500 hover:text-rose-600 flex items-center gap-1 transition-colors px-2 py-1"
                      >
                        <Trash2 size={12} />
                        <span>Clear text</span>
                      </button>
                    </div>
                  </div>

                  <div className="relative border border-slate-300 rounded-xl bg-white shadow-2xs overflow-hidden h-60 focus-within:ring-2 focus-within:ring-amber-500/50 focus-within:border-amber-500">
                    <div 
                      ref={backdropRef}
                      className="absolute inset-0 p-3 font-mono text-sm leading-6 tracking-normal whitespace-pre-wrap break-words overflow-hidden pointer-events-none text-transparent select-none m-0 border-0"
                      style={{ tabSize: 2 }}
                      aria-hidden="true"
                    >
                      {renderedHighlightOverlay}
                    </div>

                    <textarea
                      ref={textareaRef}
                      value={testString}
                      onChange={(e) => setTestString(e.target.value)}
                      onScroll={handleScroll}
                      placeholder="Type or paste sample text here to test against your regular expression..."
                      className="relative z-10 w-full h-full p-3 font-mono text-sm leading-6 tracking-normal text-slate-800 bg-transparent resize-none focus:outline-none whitespace-pre-wrap break-words m-0 border-0"
                      style={{ tabSize: 2 }}
                      spellCheck={false}
                    />
                  </div>
                </div>

                {/* Match Results Summary */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <span>Matched Results</span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-mono">
                        {matches.length} found
                      </span>
                    </h3>
                  </div>

                  {matches.length === 0 ? (
                    <div className="p-8 bg-white border border-dashed border-slate-200 rounded-xl text-center flex flex-col items-center justify-center">
                      <AlertTriangle size={26} className="text-amber-500 mb-2" />
                      <span className="text-slate-800 font-bold text-sm mb-1">No Matches Found in Test String</span>
                      <p className="text-xs text-slate-500 max-w-md mb-3 leading-relaxed">
                        The current active regex pattern in the top bar <code className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-800 font-mono font-semibold">/{pattern}/</code> did not match anything in your test string.
                      </p>

                      {/* Smart Auto-Detection Helper Card */}
                      {detectedSuggestion ? (
                        <div className="w-full max-w-md p-3.5 bg-amber-50/90 border border-amber-200 rounded-xl text-left mb-4 shadow-2xs">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 mb-1">
                            <Sparkles size={14} className="text-amber-600 shrink-0" />
                            <span>Auto-Detected: {detectedSuggestion.name}</span>
                          </div>
                          <p className="text-[11px] text-amber-800 mb-3 leading-relaxed">
                            {detectedSuggestion.description}
                          </p>
                          <button
                            onClick={() => setPattern(detectedSuggestion.pattern)}
                            className="w-full px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg transition-colors shadow-2xs flex items-center justify-center gap-2"
                          >
                            <span>⚡ Apply Regex for {detectedSuggestion.name}:</span>
                            <code className="bg-amber-600/60 px-1.5 py-0.5 rounded font-mono text-[11px]">
                              {detectedSuggestion.pattern}
                            </code>
                          </button>
                        </div>
                      ) : null}

                      <div className="flex flex-wrap items-center justify-center gap-2.5">
                        <button
                          onClick={() => {
                            setBuilderSample(testString);
                            setSelectedSuggestionIds([]);
                            setActiveTab('builder');
                          }}
                          className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                        >
                          <Wand2 size={13} className="text-amber-400" />
                          <span>Open in Pattern Builder to Extract</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                      <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                        {matches.map((m) => (
                          <div key={m.matchIndex} className="p-3 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-mono text-[11px] font-bold shrink-0">
                                #{m.matchIndex + 1}
                              </span>
                              <span className="font-mono text-xs font-semibold text-slate-900 bg-slate-100 px-2 py-1 rounded border border-slate-200 break-all select-all">
                                {m.fullMatch}
                              </span>
                            </div>

                            <div className="flex items-center gap-3 shrink-0 text-slate-400 text-[11px] font-mono">
                              <span>Position: {m.start} → {m.end}</span>
                              <span>({m.fullMatch.length} chars)</span>
                              {m.groups.length > 0 && (
                                <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-[10px] font-bold">
                                  {m.groups.length} {m.groups.length === 1 ? 'group' : 'groups'}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* TAB: VISUAL MULTI-TIER PATTERN BUILDER */}
            {activeTab === 'builder' && (
              <div className="space-y-6">
                
                {/* Header Explainer */}
                <div className="p-4 bg-gradient-to-r from-amber-50 via-orange-50 to-indigo-50 border border-amber-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles size={18} className="text-amber-600" />
                      <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                        Interactive Pattern Builder
                      </h3>
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-md">
                      Interactive Visual Tiers
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Paste any text or log line below. The tool breaks it down into clickable visual patterns stacked under each character. Click any highlighted segment to match that portion!
                  </p>
                </div>

                {/* Step 1: Input text */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      1. Sample Text Input
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          setBuilderSample("2020-03-12T13:34:56.123Z INFO [org.example.Class]: This is a #simple #logline containing a 'value'.");
                          setSelectedSuggestionIds([]);
                        }}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        Reset to Sample Logline
                      </button>
                      <button
                        onClick={() => setSelectedSuggestionIds([])}
                        className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
                      >
                        <RotateCcw size={11} />
                        <span>Clear selections</span>
                      </button>
                    </div>
                  </div>

                  <input
                    type="text"
                    value={builderSample}
                    onChange={(e) => {
                      setBuilderSample(e.target.value);
                      setSelectedSuggestionIds([]);
                    }}
                    placeholder="Enter sample log line, URL or string..."
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs"
                  />
                </div>

                {/* Step 2: Multi-Tier Visual Canvas */}
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                      <span>2. Click the marked parts that are interesting for you</span>
                    </label>

                    <div className="flex items-center gap-2">
                      {/* Scope Toggle */}
                      <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px]">
                        <button
                          onClick={() => setBuilderScope('selectedOnly')}
                          className={`px-2 py-0.5 rounded-md transition-all font-medium ${
                            builderScope === 'selectedOnly'
                              ? 'bg-white text-slate-900 shadow-2xs font-bold'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                          title="Generate regex targeting only the selected segments (e.g. timestamp only)"
                        >
                          Selected Only
                        </button>
                        <button
                          onClick={() => setBuilderScope('fullLine')}
                          className={`px-2 py-0.5 rounded-md transition-all font-medium ${
                            builderScope === 'fullLine'
                              ? 'bg-white text-slate-900 shadow-2xs font-bold'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                          title="Preserve full line structure including unselected literals"
                        >
                          Full Line
                        </button>
                      </div>

                      {selectedSuggestionIds.length > 0 && (
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                          {selectedSuggestionIds.length} rule{selectedSuggestionIds.length > 1 ? 's' : ''} applied
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Multi-Layer Visual Card */}
                  <div className="bg-white border border-slate-300 rounded-2xl p-5 shadow-xs overflow-x-auto space-y-2">
                    
                    {/* Character Line (Top monospace string with 1ch per letter precision) */}
                    <div className="font-mono text-sm text-slate-900 tracking-wider whitespace-pre select-none pb-2 border-b border-slate-100 flex">
                      {Array.from(builderSample).map((char, charIdx) => {
                        const isSelectedChar = selectedSuggestions.some(s => charIdx >= s.start && charIdx < s.end);
                        const isHoveredChar = hoveredSuggestionId && allSuggestions.find(s => s.id === hoveredSuggestionId && charIdx >= s.start && charIdx < s.end);

                        return (
                          <span 
                            key={charIdx} 
                            style={{ width: '0.62rem', textAlign: 'center' }}
                            className={`inline-block transition-colors ${
                              isHoveredChar
                                ? 'bg-amber-200 font-bold text-slate-950'
                                : isSelectedChar 
                                  ? 'bg-amber-100 text-amber-950 font-bold' 
                                  : ''
                            }`}
                          >
                            {char === ' ' ? ' ' : char}
                          </span>
                        );
                      })}
                    </div>

                    {/* Multi-Tier Stacked Bars with Beautiful Matching-Color Information Bubble */}
                    <div className="space-y-2 pt-8 pb-2 overflow-x-auto relative min-h-[90px]">
                      {suggestionsByTier.map((tierSuggestions, tierIdx) => (
                        <div key={tierIdx} className="relative h-6 flex items-center select-none" style={{ minWidth: `${builderSample.length * 0.62}rem` }}>
                          {tierSuggestions.map(sugg => {
                            const isSelected = selectedSuggestionIds.includes(sugg.id);
                            const isHovered = hoveredSuggestionId === sugg.id;
                            const leftPos = sugg.start * 0.62;
                            const barWidth = (sugg.end - sugg.start) * 0.62;
                            const bubbleStyle = getBubbleStyle(sugg.color);
                            const isNearLeft = leftPos < 6;
                            const isNearRight = leftPos + barWidth > (builderSample.length * 0.62 - 8);

                            return (
                              <div
                                key={sugg.id}
                                style={{
                                  position: 'absolute',
                                  left: `${leftPos}rem`,
                                  width: `${Math.max(barWidth, 0.62)}rem`
                                }}
                                className="h-5 flex items-center"
                              >
                                <button
                                  type="button"
                                  onClick={() => handleToggleSuggestion(sugg)}
                                  onMouseEnter={() => setHoveredSuggestionId(sugg.id)}
                                  onMouseLeave={() => setHoveredSuggestionId(null)}
                                  className={`w-full h-full rounded-sm text-[10px] font-sans font-bold flex items-center justify-center transition-all px-1 shadow-2xs border ${
                                    isSelected
                                      ? 'bg-emerald-500 text-white border-emerald-600 ring-2 ring-emerald-400/60 z-20'
                                      : isHovered
                                        ? 'bg-amber-400 text-slate-950 border-amber-500 scale-105 z-20'
                                        : `${sugg.color} text-white/95 border-black/10 hover:opacity-90`
                                  }`}
                                >
                                  <span className="truncate block pointer-events-none">
                                    {barWidth > 2.5 ? sugg.name : ''}
                                  </span>
                                </button>

                                {/* Beautified Information Bubble whose background color matches the highlight */}
                                {isHovered && (
                                  <div
                                    style={{
                                      position: 'absolute',
                                      bottom: 'calc(100% + 7px)',
                                      left: isNearLeft ? '0px' : isNearRight ? 'auto' : '50%',
                                      right: isNearRight ? '0px' : 'auto',
                                      transform: (!isNearLeft && !isNearRight) ? 'translateX(-50%)' : 'none'
                                    }}
                                    className={`z-50 pointer-events-none whitespace-nowrap px-3 py-1.5 rounded-xl border shadow-xl flex items-center gap-2 text-xs font-sans animate-in fade-in zoom-in-95 duration-100 ${bubbleStyle.bg}`}
                                  >
                                    <span className="font-bold tracking-tight">{sugg.name}</span>
                                    <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-semibold ${bubbleStyle.badge}`}>
                                      [{sugg.start}:{sugg.end}]
                                    </span>
                                    <span className="opacity-80 font-mono text-[11px]">→</span>
                                    <code className={`px-1.5 py-0.5 rounded-md font-mono text-[11px] font-bold ${bubbleStyle.code}`}>
                                      {sugg.regexSnippet}
                                    </code>
                                    {/* Bubble Tail */}
                                    <div 
                                      style={{
                                        position: 'absolute',
                                        top: '100%',
                                        left: isNearLeft ? `${Math.min(barWidth * 0.5 * 16, 24)}px` : isNearRight ? 'auto' : '50%',
                                        right: isNearRight ? `${Math.min(barWidth * 0.5 * 16, 24)}px` : 'auto',
                                        transform: (!isNearLeft && !isNearRight) ? 'translateX(-50%)' : 'none'
                                      }}
                                      className={`w-0 h-0 border-x-[5px] border-x-transparent border-t-[6px] ${bubbleStyle.arrow}`} 
                                    />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500"></span>
                          <span>Selected Rule</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-xs bg-amber-500"></span>
                          <span>Timestamp</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-xs bg-indigo-600"></span>
                          <span>Date</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-xs bg-amber-600"></span>
                          <span>Numbers</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-xs bg-purple-600"></span>
                          <span>IP/Host</span>
                        </span>
                      </div>
                      <span className="italic">
                        Click on marked suggestions to select or replace them.
                      </span>
                    </div>

                  </div>
                </div>

                {/* Step 3: Selected Suggestions Inspector Card */}
                {selectedSuggestions.length > 0 && (
                  <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-2xs">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                      Active Applied Rules ({selectedSuggestions.length})
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {selectedSuggestions.map((sugg) => (
                        <div key={sugg.id} className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between">
                          <div className="min-w-0 pr-2">
                            <span className="font-bold text-xs text-emerald-950 block truncate">
                              {sugg.name}
                            </span>
                            <code className="text-[11px] font-mono text-emerald-700 bg-white/70 px-1 py-0.5 rounded">
                              {sugg.regexSnippet}
                            </code>
                          </div>
                          <button
                            onClick={() => handleToggleSuggestion(sugg)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                            title="Remove this rule"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Generated Regular Expression Output Bar */}
                <div className="p-4 bg-white border border-slate-300 rounded-2xl shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Synthesized Regular Expression
                      </h4>
                      <span className="text-[11px] text-slate-400">
                        {builderScope === 'selectedOnly' 
                          ? 'Targeting selected elements only (flexible match)' 
                          : 'Matching entire line structure including literals'}
                      </span>
                    </div>

                    <button
                      onClick={applyBuilderPatternToTester}
                      disabled={!generatedBuilderPattern}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <Play size={13} />
                      <span>Test This in Live Tester</span>
                    </button>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-xl font-mono text-amber-300 text-sm break-all border border-slate-800 select-all flex items-center justify-between">
                    <span>{generatedBuilderPattern ? `/${generatedBuilderPattern}/g` : '// Click segments above to build regex'}</span>
                    {generatedBuilderPattern && (
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`/${generatedBuilderPattern}/g`);
                          setCopiedRegex(true);
                          setTimeout(() => setCopiedRegex(false), 2000);
                        }}
                        className="text-xs text-slate-400 hover:text-white ml-2 shrink-0 flex items-center gap-1"
                      >
                        <Copy size={12} />
                        <span>{copiedRegex ? 'Copied' : 'Copy'}</span>
                      </button>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* TAB: SUBSTITUTION (Search & Replace) */}
            {activeTab === 'replace' && (
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Replace With
                    </label>
                    <span className="text-[11px] text-slate-400">
                      Tip: Use <code className="text-indigo-600 font-bold font-mono">$&</code> for the matched word, or <code className="text-indigo-600 font-bold font-mono">$1</code> for Group 1.
                    </span>
                  </div>
                  <input
                    type="text"
                    value={replacementPattern}
                    onChange={(e) => setReplacementPattern(e.target.value)}
                    placeholder="Enter replacement string, e.g. [$1] or [CENSORED]"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Result Preview
                    </label>
                    <button
                      onClick={() => handleCopyCode(substitutionResult)}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                    >
                      <Copy size={12} />
                      <span>Copy Result</span>
                    </button>
                  </div>

                  <div className="p-4 bg-slate-900 text-slate-100 rounded-xl font-mono text-sm whitespace-pre-wrap break-words min-h-[160px] border border-slate-800 overflow-auto select-all">
                    {substitutionResult}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: MULTI-LANGUAGE CODE GENERATOR */}
            {activeTab === 'code' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Select Target Programming Language
                  </span>
                  <button
                    onClick={() => {
                      const template = CODE_SNIPPET_TEMPLATES.find(c => c.id === selectedLang);
                      if (template) {
                        const code = template.generate(
                          pattern, 
                          Object.entries(flags).filter(([_, e]) => e).map(([f]) => f).join(''),
                          testString.split('\n')[0] || 'sample text'
                        );
                        handleCopyCode(code);
                      }
                    }}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    {copiedCode ? <Check size={13} /> : <Copy size={13} />}
                    <span>{copiedCode ? 'Copied Code!' : 'Copy Code Snippet'}</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {CODE_SNIPPET_TEMPLATES.map((tmpl) => (
                    <button
                      key={tmpl.id}
                      onClick={() => setSelectedLang(tmpl.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        selectedLang === tmpl.id
                          ? 'bg-slate-900 text-amber-400 shadow-xs'
                          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      {tmpl.label}
                    </button>
                  ))}
                </div>

                <div className="p-4 bg-slate-950 text-slate-200 rounded-2xl font-mono text-xs whitespace-pre overflow-x-auto border border-slate-800 shadow-inner">
                  {(() => {
                    const template = CODE_SNIPPET_TEMPLATES.find(c => c.id === selectedLang);
                    if (!template) return '// Select a language above';
                    return template.generate(
                      pattern, 
                      Object.entries(flags).filter(([_, e]) => e).map(([f]) => f).join(''),
                      testString.split('\n')[0] || 'sample text'
                    );
                  })()}
                </div>
              </div>
            )}

            {/* TAB: CHEATSHEET */}
            {activeTab === 'cheatsheet' && (
              <div className="space-y-4">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Quick Regex Reference Guide
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {REGEX_CHEATSHEET_CATEGORIES.map((cat, i) => (
                    <div key={i} className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-3">
                      <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
                        {cat.title}
                      </h4>
                      <div className="space-y-1.5">
                        {cat.items.map((item, idx) => (
                          <div 
                            key={idx} 
                            onClick={() => setPattern(prev => prev + item.code)}
                            className="flex items-center justify-between p-1.5 hover:bg-amber-50/60 rounded-lg cursor-pointer transition-colors group"
                            title="Click to insert into pattern"
                          >
                            <code className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded group-hover:bg-amber-100 group-hover:text-amber-900 transition-colors">
                              {item.code}
                            </code>
                            <span className="text-xs text-slate-600 truncate max-w-[200px]">
                              {item.desc}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Right Preset Sidebar */}
          <aside className="w-80 bg-white border-l border-slate-200 p-4 overflow-y-auto hidden xl:flex flex-col space-y-5 shrink-0 h-full">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Common Templates
              </span>
              <h3 className="text-sm font-bold text-slate-900">
                Preset Library
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Click any template to auto-fill common patterns and test them instantly.
              </p>
            </div>

            <div className="space-y-2">
              {POPULAR_REGEX_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => {
                    setPattern(preset.pattern);
                    setTestString(preset.sample);
                    setActiveTab('tester');
                  }}
                  className="w-full text-left p-2.5 bg-slate-50 hover:bg-amber-50/50 hover:border-amber-300 border border-slate-200 rounded-xl transition-all group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-slate-800 group-hover:text-amber-800">
                      {preset.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Use</span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {preset.description}
                  </p>
                </button>
              ))}
            </div>

            {/* Quick Tips Box */}
            <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl space-y-1.5 text-[11px] text-amber-950 mt-auto">
              <span className="font-bold flex items-center gap-1 text-amber-900">
                <HelpCircle size={13} className="text-amber-600" />
                <span>Beginner Tip</span>
              </span>
              <p className="text-amber-900/80 leading-relaxed">
                Not sure how to write a regex? In <strong>2. Pattern Builder</strong>, click on the stacked colored blocks under your sample text to pick how you want each section matched.
              </p>
            </div>

            {/* PDF Redaction Link */}
            <Link
              to="/pdf-redactor"
              className="p-3 bg-gradient-to-r from-rose-50 to-orange-50 border border-rose-200 rounded-xl space-y-1 block hover:border-rose-300 transition-colors group shadow-2xs"
            >
              <span className="font-bold flex items-center gap-1.5 text-xs text-rose-900 group-hover:text-rose-700">
                <ShieldAlert size={14} className="text-rose-600" />
                <span>PDF Data Redactor</span>
              </span>
              <p className="text-[11px] text-rose-800/80 leading-relaxed">
                Scan PDF documents for emails, phone numbers, or credit cards and replace them with [CONFIDENTIAL] →
              </p>
            </Link>
          </aside>

        </div>

      </main>
    </div>
  );
};

export default RegexLiveTester;

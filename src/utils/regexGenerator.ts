import { TokenSuggestion, InteractiveChunk } from '../types/regex';

export function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Generate multi-tiered token suggestion spans matching overlapping granularities
 * (whole timestamp vs year vs month, full word vs characters, ip octets vs full IP, etc.).
 */
export function generateMultiTierSuggestions(text: string): TokenSuggestion[] {
  if (!text) return [];

  const suggestions: TokenSuggestion[] = [];
  let idCounter = 0;

  const add = (
    name: string,
    category: TokenSuggestion['category'],
    color: string,
    regexSnippet: string,
    start: number,
    end: number,
    description: string
  ) => {
    if (start >= end || start < 0 || end > text.length) return;
    suggestions.push({
      id: `sugg-${idCounter++}`,
      name,
      category,
      color,
      regexSnippet,
      start,
      end,
      text: text.substring(start, end),
      description,
      tier: 0
    });
  };

  // 1. Literal single characters or spaces (Base Tier 0)
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === ' ') {
      add('Space', 'whitespace', 'bg-slate-400', '\\s', i, i + 1, 'Single whitespace character');
    } else if (/[a-zA-Z]/.test(char)) {
      add(`Char '${char}'`, 'literal', 'bg-blue-400', escapeRegex(char), i, i + 1, `Literal character '${char}'`);
    } else if (/\d/.test(char)) {
      add(`Digit '${char}'`, 'number', 'bg-amber-400', '\\d', i, i + 1, `Single decimal digit`);
    } else {
      add(`Symbol '${char}'`, 'symbol', 'bg-rose-400', escapeRegex(char), i, i + 1, `Literal punctuation/symbol '${char}'`);
    }
  }

  // 2. Whitespace chunks
  let match: RegExpExecArray | null;
  const wsRegex = /\s+/g;
  while ((match = wsRegex.exec(text)) !== null) {
    if (match[0].length > 1) {
      add('Whitespace', 'whitespace', 'bg-slate-500', '\\s+', match.index, match.index + match[0].length, 'Multiple whitespace characters');
    }
  }

  // 3. Numbers & Decimals
  const numRegex = /\b\d+(?:\.\d+)?\b/g;
  while ((match = numRegex.exec(text)) !== null) {
    const val = match[0];
    if (val.includes('.')) {
      add('Decimal Number', 'number', 'bg-amber-500', '[-+]?\\d*\\.?\\d+', match.index, match.index + val.length, 'Floating point decimal number');
    } else {
      add(`Number (${val.length} digits)`, 'number', 'bg-amber-600', `\\d{${val.length}}`, match.index, match.index + val.length, `Exact ${val.length} digits`);
      add('Any Number (\\d+)', 'number', 'bg-amber-500', '\\d+', match.index, match.index + val.length, 'One or more digits');
    }
  }

  // 4. Words & Identifiers
  const wordRegex = /\b[a-zA-Z_][a-zA-Z0-9_]*\b/g;
  while ((match = wordRegex.exec(text)) !== null) {
    const word = match[0];
    if (word.length > 1) {
      add(`Word "${word}"`, 'word', 'bg-emerald-500', '[a-zA-Z]+', match.index, match.index + word.length, 'Sequence of letters');
      add(`Exact "${word}"`, 'literal', 'bg-teal-600', escapeRegex(word), match.index, match.index + word.length, `Exact literal "${word}"`);
    }
  }

  // 5. ISO Timestamps / Dates (e.g. 2020-03-12T13:34:56.123Z or 2020-03-12T13:34:56Z)
  const isoRegex = /\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?)?/g;
  while ((match = isoRegex.exec(text)) !== null) {
    const dateStr = match[0];
    if (dateStr.includes('T')) {
      add('ISO Timestamp', 'date', 'bg-amber-500', '\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d+)?(?:Z|[+-]\\d{2}:?\\d{2})?', match.index, match.index + dateStr.length, 'Full ISO 8601 Timestamp');
    }
    // Also add sub-dates
    add('Date YYYY-MM-DD', 'date', 'bg-indigo-600', '\\d{4}-\\d{2}-\\d{2}', match.index, match.index + 10, 'Standard ISO calendar date');
  }

  // 6. IP Addresses (and IP:Port combinations)
  const ipPortRegex = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d{1,5}\b/g;
  while ((match = ipPortRegex.exec(text)) !== null) {
    add('IPv4 + Port', 'ip', 'bg-indigo-600', '\\d{1,3}(?:\\.\\d{1,3}){3}:\\d{1,5}', match.index, match.index + match[0].length, 'IPv4 address with port number');
  }

  const ipRegex = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g;
  while ((match = ipRegex.exec(text)) !== null) {
    add('IPv4 Address', 'ip', 'bg-purple-600', '\\d{1,3}(?:\\.\\d{1,3}){3}', match.index, match.index + match[0].length, 'IPv4 address (4 octets)');
  }

  // 7. Bracketed / Quoted substrings (e.g. [org.example.Class] or 'value')
  const bracketRegex = /\[[^\]]+\]|\'[^\']+\'|\"[^\"]+\"/g;
  while ((match = bracketRegex.exec(text)) !== null) {
    const raw = match[0];
    add(`Enclosed ${raw[0]}...${raw[raw.length - 1]}`, 'symbol', 'bg-cyan-600', escapeRegex(raw[0]) + '.*?' + escapeRegex(raw[raw.length - 1]), match.index, match.index + raw.length, `Matches enclosed content between ${raw[0]} and ${raw[raw.length - 1]}`);
  }

  // 8. URLs (including localhost and IP endpoints)
  const urlRegex = /https?:\/\/(?:localhost|(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}|\d{1,3}(?:\.\d{1,3}){3})(?::\d+)?(?:\/[^\s]*)?/g;
  while ((match = urlRegex.exec(text)) !== null) {
    add('Web URL', 'symbol', 'bg-blue-600', 'https?:\\/\\/(?:localhost|(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,}|\\d{1,3}(?:\\.\\d{1,3}){3})(?::\\d+)?(?:\\/[^\\s]*)?', match.index, match.index + match[0].length, 'HTTP or HTTPS Web URL');
  }

  // 8. Assign Tiers (Multi-tier stacked layout algorithm so overlapping bars stack nicely without collision)
  // Sort suggestions by start position ascending, then by span length descending
  suggestions.sort((a, b) => {
    if (a.start !== b.start) return a.start - b.start;
    return (b.end - b.start) - (a.end - a.start);
  });

  const tierOccupancy: number[] = []; // tierOccupancy[tierIndex] = nextAvailableIndex

  suggestions.forEach(sugg => {
    let placedTier = 0;
    while (true) {
      if ((tierOccupancy[placedTier] ?? -1) <= sugg.start) {
        sugg.tier = placedTier;
        tierOccupancy[placedTier] = sugg.end;
        break;
      }
      placedTier++;
    }
  });

  return suggestions;
}

export const generateOlafSuggestions = generateMultiTierSuggestions;

/**
 * Standard segment chunking (fallback helper)
 */
export function segmentSampleText(text: string): InteractiveChunk[] {
  if (!text) return [];

  const regex = /(\d{4}-\d{2}-\d{2}|\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b|https?:\/\/[^\s]+|[-+]?\d*\.?\d+|[a-zA-Z0-9_]+|\s+|[^\w\s]+)/g;
  const chunks: InteractiveChunk[] = [];
  let match: RegExpExecArray | null;
  let chunkIdx = 0;

  while ((match = regex.exec(text)) !== null) {
    const chunkText = match[0];
    const start = match.index;
    const end = start + chunkText.length;
    const isWhitespace = /^\s+$/.test(chunkText);
    const isDigit = /^\d+$/.test(chunkText);

    const suggestedTypes: InteractiveChunk['suggestedTypes'] = [
      {
        label: `Exact "${chunkText}"`,
        description: 'Matches literal string',
        regexSnippet: escapeRegex(chunkText)
      }
    ];

    if (isWhitespace) {
      suggestedTypes.push({
        label: 'Whitespace (\\s+)',
        description: 'Any spaces or tabs',
        regexSnippet: '\\s+'
      });
    } else if (isDigit) {
      suggestedTypes.push({
        label: 'Digits (\\d+)',
        description: 'One or more digits',
        regexSnippet: '\\d+'
      });
    } else {
      suggestedTypes.push({
        label: 'Word (\\w+)',
        description: 'Word characters',
        regexSnippet: '\\w+'
      });
    }

    chunks.push({
      id: `chunk-${chunkIdx++}`,
      text: chunkText,
      start,
      end,
      suggestedTypes
    });
  }

  return chunks;
}

export interface RegexMatchGroup {
  groupIndex: number;
  groupName?: string;
  match: string;
  start: number;
  end: number;
}

export interface RegexMatchItem {
  matchIndex: number;
  fullMatch: string;
  start: number;
  end: number;
  groups: RegexMatchGroup[];
}

export interface RegexTokenPreset {
  id: string;
  name: string;
  category: 'common' | 'web' | 'numbers' | 'formatting' | 'dates';
  pattern: string;
  flags: string;
  description: string;
  sample: string;
}

export interface TokenSuggestion {
  id: string;
  name: string;
  category: 'literal' | 'number' | 'date' | 'word' | 'ip' | 'url' | 'whitespace' | 'symbol' | 'wildcard';
  color: string; // Tailwind color class or hex
  description: string;
  regexSnippet: string;
  start: number;
  end: number;
  text: string;
  tier: number; // Stacking row index under the text (like Olaf Neumann's tiers)
}

export interface InteractiveChunk {
  id: string;
  text: string;
  start: number;
  end: number;
  suggestedTypes: {
    label: string;
    description: string;
    regexSnippet: string;
  }[];
  selectedTypeIndex?: number;
}

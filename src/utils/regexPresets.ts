import { RegexTokenPreset } from '../types/regex';

export const POPULAR_REGEX_PRESETS: RegexTokenPreset[] = [
  {
    id: 'email',
    name: 'Email Address',
    category: 'web',
    pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
    flags: 'g',
    description: 'Matches standard RFC-compliant email addresses',
    sample: 'Contact support@example.com or admin.team@company.org for details.'
  },
  {
    id: 'url',
    name: 'URL / Web Address',
    category: 'web',
    pattern: 'https?:\\/\\/(?:localhost|(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,}|\\d{1,3}(?:\\.\\d{1,3}){3})(?::\\d+)?(?:\\/[^\\s]*)?',
    flags: 'g',
    description: 'Matches HTTP and HTTPS URLs with domains, localhost, IPs, ports, and query parameters',
    sample: 'Check https://toolkitz.dev/api/v1?query=test or http://localhost:3000/dashboard'
  },
  {
    id: 'ipv4',
    name: 'IPv4 Address',
    category: 'web',
    pattern: '\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b',
    flags: 'g',
    description: 'Matches valid IPv4 addresses (0.0.0.0 to 255.255.255.255)',
    sample: 'Server running at 192.168.1.1 and backup at 10.0.0.254'
  },
  {
    id: 'uuid',
    name: 'UUID / GUID',
    category: 'common',
    pattern: '[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}',
    flags: 'gi',
    description: 'Standard 8-4-4-4-12 hex UUID format (v1, v4)',
    sample: 'Transaction ID: 123e4567-e89b-12d3-a456-426614174000 completed.'
  },
  {
    id: 'iso-date',
    name: 'ISO 8601 Date',
    category: 'dates',
    pattern: '\\d{4}-\\d{2}-\\d{2}(?:T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d+)?(?:Z|[+-]\\d{2}:?\\d{2})?)?',
    flags: 'g',
    description: 'Matches ISO dates such as 2026-09-28 or full ISO timestamps',
    sample: 'Created at 2026-09-28T09:45:00Z, updated at 2026-09-28'
  },
  {
    id: 'iso-timestamp',
    name: 'ISO Timestamp',
    category: 'dates',
    pattern: '\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d+)?(?:Z|[+-]\\d{2}:?\\d{2})?',
    flags: 'g',
    description: 'Matches ISO 8601 timestamps with optional milliseconds and timezone',
    sample: '2020-03-12T13:34:56.123Z INFO [org.example.Class]: Process completed successfully.'
  },
  {
    id: 'digits-only',
    name: 'Integer / Float Numbers',
    category: 'numbers',
    pattern: '[-+]?\\d*\\.?\\d+(?:[eE][-+]?\\d+)?',
    flags: 'g',
    description: 'Matches positive or negative integers, decimals, and scientific notation',
    sample: 'The price dropped from +149.99 to 99.50 with a -5% discount. Constant: 6.022e23'
  },
  {
    id: 'hex-color',
    name: 'Hex Color Code',
    category: 'formatting',
    pattern: '#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\\b',
    flags: 'g',
    description: 'Matches 3, 6, or 8-digit hexadecimal colors',
    sample: 'Background: #ffffff; Accent: #4f46e5; Shadow: #00000033; Short: #abc;'
  },
  {
    id: 'semver',
    name: 'Semantic Version (SemVer)',
    category: 'common',
    pattern: 'v?(?:0|[1-9]\\d*)\\.(?:0|[1-9]\\d*)\\.(?:0|[1-9]\\d*)(?:-[a-zA-Z0-9.-]+)?(?:\\+[a-zA-Z0-9.-]+)?',
    flags: 'g',
    description: 'Matches semantic versions like v2.0.0 or 1.0.0-beta.1',
    sample: 'Upgraded from v1.9.4-rc.2 to 2.0.0+2026'
  },
  {
    id: 'phone-number',
    name: 'Phone Number (International)',
    category: 'common',
    pattern: '\\+?\\d{1,4}?[-.\\s]?\\(?\\d{1,4}?\\)?[-.\\s]?\\d{1,4}[-.\\s]?\\d{1,9}',
    flags: 'g',
    description: 'Matches standard telephone formats with country code and dashes',
    sample: 'Call +1 (555) 234-5678 or international office at +62 812-3456-7890'
  }
];

export const CODE_SNIPPET_TEMPLATES = [
  {
    id: 'javascript',
    label: 'JavaScript / TypeScript',
    lang: 'javascript',
    generate: (pattern: string, flags: string, sample: string) => {
      return `// JavaScript / TypeScript regex match
const regex = /${pattern}/${flags};
const str = \`${sample.replace(/`/g, '\\`')}\`;

// 1. Check if matches
const isMatch = regex.test(str);
console.log("Matched:", isMatch);

// 2. Iterate all matches
let match;
while ((match = regex.exec(str)) !== null) {
  console.log(\`Found "\${match[0]}" at position \${match.index}\`);
}`;
    }
  },
  {
    id: 'python',
    label: 'Python (re module)',
    lang: 'python',
    generate: (pattern: string, flags: string, sample: string) => {
      const flagList: string[] = [];
      if (flags.includes('i')) flagList.push('re.IGNORECASE');
      if (flags.includes('m')) flagList.push('re.MULTILINE');
      if (flags.includes('s')) flagList.push('re.DOTALL');
      const flagArg = flagList.length > 0 ? `, ${flagList.join(' | ')}` : '';

      return `# Python (re module) regex match
import re

pattern = r"${pattern}"
text = """${sample.replace(/"""/g, '\\"\\"\\"')}"""

# 1. Find all occurrences
matches = re.finditer(pattern, text${flagArg})
for match in matches:
    print(f"Match: '{match.group()}' at indices {match.span()}")
    # Groups: match.groups()`;
    }
  },
  {
    id: 'golang',
    label: 'Go (regexp)',
    lang: 'go',
    generate: (pattern: string, flags: string, sample: string) => {
      let finalPattern = pattern;
      if (flags.includes('i')) finalPattern = '(?i)' + finalPattern;
      if (flags.includes('m')) finalPattern = '(?m)' + finalPattern;
      if (flags.includes('s')) finalPattern = '(?s)' + finalPattern;

      return `// Go (regexp package)
package main

import (
	"fmt"
	"regexp"
)

func main() {
	pattern := \`${finalPattern}\`
	re := regexp.MustCompile(pattern)
	text := \`${sample.replace(/`/g, '` + "`" + `')}\`

	matches := re.FindAllString(text, -1)
	for i, m := range matches {
		fmt.Printf("Match %d: %s\\n", i+1, m)
	}
}`;
    }
  },
  {
    id: 'php',
    label: 'PHP (preg_match_all)',
    lang: 'php',
    generate: (pattern: string, flags: string, sample: string) => {
      return `<?php
// PHP preg_match_all
$pattern = '/${pattern.replace(/\//g, '\\/')}/${flags}';
$text = "${sample.replace(/"/g, '\\"')}";

if (preg_match_all($pattern, $text, $matches, PREG_OFFSET_CAPTURE)) {
    foreach ($matches[0] as $match) {
        echo "Match: " . $match[0] . " at offset " . $match[1] . "\\n";
    }
}`;
    }
  },
  {
    id: 'java',
    label: 'Java (java.util.regex)',
    lang: 'java',
    generate: (pattern: string, flags: string, sample: string) => {
      const flagList: string[] = [];
      if (flags.includes('i')) flagList.push('Pattern.CASE_INSENSITIVE');
      if (flags.includes('m')) flagList.push('Pattern.MULTILINE');
      if (flags.includes('s')) flagList.push('Pattern.DOTALL');
      const flagArg = flagList.length > 0 ? `, ${flagList.join(' | ')}` : '';

      return `// Java Pattern & Matcher
import java.util.regex.Pattern;
import java.util.regex.Matcher;

public class RegexDemo {
    public static void main(String[] args) {
        String regex = "${pattern.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}";
        String text = "${sample.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}";

        Pattern pattern = Pattern.compile(regex${flagArg});
        Matcher matcher = pattern.matcher(text);

        while (matcher.find()) {
            System.out.println("Match: " + matcher.group() + " at [" + matcher.start() + ", " + matcher.end() + "]");
        }
    }
}`;
    }
  },
  {
    id: 'groovy',
    label: 'Groovy (Katalon Studio)',
    lang: 'groovy',
    generate: (pattern: string, flags: string, sample: string) => {
      // In Groovy slashy strings ~/.../, backslashes don't need excessive escaping
      // Katalon uses =~ (find / matcher) or ==~ (exact match)
      const flagPrefix = flags.replace('g', '');
      const flagInline = flagPrefix ? `(?${flagPrefix})` : '';

      return `// Groovy / Katalon Studio Test Case Script
import com.kms.katalon.core.util.KeywordUtil

String text = '''${sample.replace(/'''/g, "\\'\\'\\'")}'''
// Groovy pattern operator (slashy string with inline flags)
def regex = ~/${flagInline}${pattern}/

// 1. Find operator (=~) creates a java.util.regex.Matcher
def matcher = (text =~ regex)

if (matcher.find()) {
    KeywordUtil.logInfo("Pattern matched successfully!")
    
    // Reset and iterate through all occurrences
    matcher.reset()
    int matchCount = 0
    while (matcher.find()) {
        matchCount++
        KeywordUtil.logInfo("Match #\${matchCount}: \${matcher.group()} (at indices \${matcher.start()}-\${matcher.end()})")
        
        // Access captured groups if any
        if (matcher.groupCount() > 0) {
            (1..matcher.groupCount()).each { groupIndex ->
                KeywordUtil.logInfo("  - Group \${groupIndex}: \${matcher.group(groupIndex)}")
            }
        }
    }
} else {
    KeywordUtil.markWarning("No match found for pattern: \${regex}")
}

// 2. Quick boolean check (exact full string match using ==~)
boolean isExactMatch = (text ==~ regex)
println "Exact match: " + isExactMatch`;
    }
  }
];

export const REGEX_CHEATSHEET_CATEGORIES = [
  {
    title: 'Character Classes',
    items: [
      { code: '.', desc: 'Any character except newline (unless "s" flag)' },
      { code: '\\d', desc: 'Any digit [0-9]' },
      { code: '\\D', desc: 'Any non-digit [^0-9]' },
      { code: '\\w', desc: 'Word character [a-zA-Z0-9_]' },
      { code: '\\W', desc: 'Non-word character' },
      { code: '\\s', desc: 'Whitespace (space, tab, newline)' },
      { code: '\\S', desc: 'Non-whitespace' },
      { code: '[abc]', desc: 'Any of a, b, or c' },
      { code: '[^abc]', desc: 'Not a, b, or c' },
      { code: '[a-z]', desc: 'Character between a and z' }
    ]
  },
  {
    title: 'Anchors & Boundaries',
    items: [
      { code: '^', desc: 'Start of string (or line in "m" mode)' },
      { code: '$', desc: 'End of string (or line in "m" mode)' },
      { code: '\\b', desc: 'Word boundary' },
      { code: '\\B', desc: 'Non-word boundary' }
    ]
  },
  {
    title: 'Quantifiers',
    items: [
      { code: '*', desc: '0 or more times (greedy)' },
      { code: '+', desc: '1 or more times (greedy)' },
      { code: '?', desc: '0 or 1 time (optional)' },
      { code: '{3}', desc: 'Exactly 3 times' },
      { code: '{2,5}', desc: 'Between 2 and 5 times' },
      { code: '{2,}', desc: '2 or more times' },
      { code: '*?', desc: '0 or more times (lazy / non-greedy)' },
      { code: '+?', desc: '1 or more times (lazy)' }
    ]
  },
  {
    title: 'Groups & Lookaround',
    items: [
      { code: '(abc)', desc: 'Capture group 1' },
      { code: '(?:abc)', desc: 'Non-capturing group' },
      { code: '(?<name>abc)', desc: 'Named capture group' },
      { code: 'a|b', desc: 'Match a OR b' },
      { code: '(?=abc)', desc: 'Positive lookahead' },
      { code: '(?!abc)', desc: 'Negative lookahead' },
      { code: '(?<=abc)', desc: 'Positive lookbehind' },
      { code: '(?<!abc)', desc: 'Negative lookbehind' }
    ]
  }
];

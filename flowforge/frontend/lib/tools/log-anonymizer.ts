/**
 * lib/tools/log-anonymizer.ts
 * Replaces sensitive data in log text with safe placeholders.
 */

export interface AnonymizeOptions {
  emails?:      boolean;
  ipv4?:        boolean;
  ipv6?:        boolean;
  uuids?:       boolean;
  creditCards?: boolean;
  phones?:      boolean;
  jwts?:        boolean;
  customPatterns?: Array<{ name: string; pattern: string }>; // user-defined regex strings
  strategy?: 'placeholder' | 'hash' | 'redact';
  // placeholder: [EMAIL], hash: [a3f2b1...], redact: ████████
}

interface RedactRule {
  name:    string;
  pattern: RegExp;
}

const RULES: RedactRule[] = [
  { name: 'EMAIL',        pattern: /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g },
  { name: 'JWT',          pattern: /eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_\-]+/g },
  { name: 'CREDIT_CARD',  pattern: /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|6(?:011|5[0-9]{2})[0-9]{12})\b/g },
  { name: 'UUID',         pattern: /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi },
  { name: 'IPV6',         pattern: /([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::(?:[0-9a-fA-F]{1,4}:){0,6}[0-9a-fA-F]{1,4}/g },
  { name: 'IPV4',         pattern: /\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\b/g },
  { name: 'PHONE',        pattern: /(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g },
];

// Simple non-crypto hash for the 'hash' strategy (deterministic, consistent)
function simpleHash(str: string): string {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(31, h) + str.charCodeAt(i) | 0;
  }
  return Math.abs(h).toString(16).slice(0, 8);
}

function makeReplacement(matched: string, name: string, strategy: 'placeholder' | 'hash' | 'redact'): string {
  switch (strategy) {
    case 'placeholder': return `[${name}]`;
    case 'hash':        return `[${name}:${simpleHash(matched)}]`;
    case 'redact':      return '█'.repeat(Math.min(matched.length, 12));
  }
}

// Which built-in rules to apply based on options
const RULE_FLAGS: Record<string, keyof AnonymizeOptions> = {
  EMAIL:       'emails',
  JWT:         'jwts',
  CREDIT_CARD: 'creditCards',
  UUID:        'uuids',
  IPV6:        'ipv6',
  IPV4:        'ipv4',
  PHONE:       'phones',
};

export function anonymize(text: string, opts: AnonymizeOptions = {}): {
  result: string;
  counts: Record<string, number>;
} {
  const strategy = opts.strategy ?? 'placeholder';
  const counts: Record<string, number> = {};
  let result = text;

  // Apply built-in rules
  for (const rule of RULES) {
    const flag = RULE_FLAGS[rule.name] as keyof AnonymizeOptions;
    // Default all to true if not specified
    const enabled = opts[flag] !== false;
    if (!enabled) continue;

    counts[rule.name] = 0;
    result = result.replace(rule.pattern, (matched) => {
      counts[rule.name]++;
      return makeReplacement(matched, rule.name, strategy);
    });
  }

  // Apply custom patterns
  for (const custom of (opts.customPatterns ?? [])) {
    try {
      const re = new RegExp(custom.pattern, 'g');
      counts[custom.name] = 0;
      result = result.replace(re, (matched) => {
        counts[custom.name]++;
        return makeReplacement(matched, custom.name.toUpperCase(), strategy);
      });
    } catch {
      // Invalid regex — skip silently
    }
  }

  return { result, counts };
}
/**
 * lib/tools/json-to-zod.ts
 * Pure function — no React, no side effects, fully testable.
 * Converts a parsed JSON value into a Zod schema string.
 */

export interface ZodOptions {
  strict?: boolean;          // z.object().strict() — reject unknown keys
  makeOptional?: boolean;    // wrap all fields in .optional()
  inferSpecialTypes?: boolean; // detect email, url, uuid, datetime
}

// ── Type detection helpers ─────────────────────────────────────────────────

const EMAIL_RE   = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_RE     = /^https?:\/\/[^\s]+$/;
const UUID_RE    = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?)?$/;

function detectStringType(value: string, infer: boolean): string {
  if (!infer) return 'z.string()';
  if (EMAIL_RE.test(value))   return 'z.string().email()';
  if (URL_RE.test(value))     return 'z.string().url()';
  if (UUID_RE.test(value))    return 'z.string().uuid()';
  if (ISO_DATE_RE.test(value)) return 'z.string().datetime()';
  return 'z.string()';
}

// ── Core recursive converter ───────────────────────────────────────────────

function convertValue(value: unknown, opts: ZodOptions, depth: number): string {
  const pad = '  '.repeat(depth);

  if (value === null)           return 'z.null()';
  if (typeof value === 'boolean') return 'z.boolean()';
  if (typeof value === 'number')  return Number.isInteger(value) ? 'z.number().int()' : 'z.number()';
  if (typeof value === 'string')  return detectStringType(value, opts.inferSpecialTypes ?? true);

  if (Array.isArray(value)) {
    if (value.length === 0) return 'z.array(z.unknown())';
    // Sample first item to determine array element type
    const elementType = convertValue(value[0], opts, depth);
    // Check if all items share same type (best-effort)
    const allSame = value.every(v => typeof v === typeof value[0]);
    return allSame
      ? `z.array(${elementType})`
      : `z.array(z.union([${[...new Set(value.map(v => convertValue(v, opts, depth)))].join(', ')}]))`;
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return 'z.object({})';

    const innerPad = '  '.repeat(depth + 1);
    const fields = entries
      .map(([k, v]) => {
        const safeName = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k) ? k : `"${k}"`;
        let schema = convertValue(v, opts, depth + 1);
        if (opts.makeOptional) schema += '.optional()';
        return `${innerPad}${safeName}: ${schema},`;
      })
      .join('\n');

    const closing = opts.strict ? `\n${pad}}).strict()` : `\n${pad}})`
    return `z.object({\n${fields}${closing}`;
  }

  return 'z.unknown()';
}

// ── Public API ─────────────────────────────────────────────────────────────

export function jsonToZod(json: string, opts: ZodOptions = {}): string {
  const parsed = JSON.parse(json); // throws on invalid JSON
  const schema = convertValue(parsed, opts, 0);

  return [
    `import { z } from 'zod';`,
    ``,
    `export const Schema = ${schema};`,
    ``,
    `export type Schema = z.infer<typeof Schema>;`,
  ].join('\n');
}
/**
 * lib/tools/curl-parser.ts
 * Parses a curl command string and outputs Fetch, Axios, or XHR TypeScript/JS code.
 */

export type OutputFormat = 'fetch' | 'axios' | 'xhr';

export interface CurlOptions {
  format: OutputFormat;
  typescript?: boolean;
  includeErrorHandling?: boolean;
}

interface ParsedCurl {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: string;
  isJson: boolean;
  username?: string;
  password?: string;
}

// ── Parser ─────────────────────────────────────────────────────────────────

export function parseCurl(curlStr: string): ParsedCurl {
  // Normalize: collapse line continuations, trim
  const normalized = curlStr
    .replace(/\\\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const result: ParsedCurl = {
    method: 'GET',
    url: '',
    headers: {},
    isJson: false,
  };

  // Tokenize respecting quoted strings
  const tokens = tokenize(normalized);
  let i = 0;

  while (i < tokens.length) {
    const token = tokens[i];

    if (token === 'curl') { i++; continue; }

    // URL — first bare token that looks like a URL
    if ((token.startsWith('http://') || token.startsWith('https://')) && !result.url) {
      result.url = token; i++; continue;
    }

    // -X / --request
    if (token === '-X' || token === '--request') {
      result.method = tokens[++i]?.toUpperCase() ?? 'GET'; i++; continue;
    }

    // -H / --header
    if (token === '-H' || token === '--header') {
      const header = tokens[++i] ?? '';
      const colonIdx = header.indexOf(':');
      if (colonIdx > -1) {
        const key = header.slice(0, colonIdx).trim();
        const val = header.slice(colonIdx + 1).trim();
        result.headers[key] = val;
        if (key.toLowerCase() === 'content-type' && val.includes('json')) result.isJson = true;
      }
      i++; continue;
    }

    // -d / --data / --data-raw / --data-binary
    if (['-d', '--data', '--data-raw', '--data-binary'].includes(token)) {
      const raw = tokens[++i] ?? '';
      result.body = raw;
      if (result.method === 'GET') result.method = 'POST';
      // Auto-detect JSON body
      try { JSON.parse(raw); result.isJson = true; } catch {}
      i++; continue;
    }

    // -u / --user
    if (token === '-u' || token === '--user') {
      const creds = tokens[++i] ?? '';
      const [u, p] = creds.split(':');
      result.username = u;
      result.password = p;
      i++; continue;
    }

    // --compressed / -L / --location / -v / --verbose / -s / --silent — skip
    if (['--compressed', '-L', '--location', '-v', '--verbose', '-s', '--silent', '-k', '--insecure'].includes(token)) {
      i++; continue;
    }

    // Bare URL (without http prefix in some curl shortcuts)
    if (!result.url && !token.startsWith('-')) {
      result.url = token.startsWith('http') ? token : `https://${token}`;
    }

    i++;
  }

  // Add Authorization header for basic auth
  if (result.username) {
    const encoded = btoa(`${result.username}:${result.password ?? ''}`);
    result.headers['Authorization'] = `Basic ${encoded}`;
  }

  return result;
}

function tokenize(str: string): string[] {
  const tokens: string[] = [];
  let current = '';
  let inSingle = false;
  let inDouble = false;

  for (let i = 0; i < str.length; i++) {
    const c = str[i];
    if (c === "'" && !inDouble) { inSingle = !inSingle; continue; }
    if (c === '"' && !inSingle) { inDouble = !inDouble; continue; }
    if (c === ' ' && !inSingle && !inDouble) {
      if (current) { tokens.push(current); current = ''; }
      continue;
    }
    current += c;
  }
  if (current) tokens.push(current);
  return tokens;
}

// ── Code generators ────────────────────────────────────────────────────────

function headersToString(headers: Record<string, string>, indent = '  '): string {
  const entries = Object.entries(headers);
  if (!entries.length) return '{}';
  const lines = entries.map(([k, v]) => `${indent}  '${k}': '${v}',`);
  return `{\n${lines.join('\n')}\n${indent}}`;
}

function generateFetch(p: ParsedCurl, ts: boolean, errorHandling: boolean): string {
  const hasBody = p.body !== undefined;
  const bodyStr = p.isJson
    ? `JSON.stringify(${p.body})`
    : `'${p.body}'`;

  const optionLines = [
    `  method: '${p.method}',`,
    Object.keys(p.headers).length ? `  headers: ${headersToString(p.headers)},` : '',
    hasBody ? `  body: ${bodyStr},` : '',
  ].filter(Boolean).join('\n');

  const resType = ts ? ': Response' : '';
  const dataType = ts ? ': unknown' : '';

  if (errorHandling) {
    return `async function fetchData()${ts ? ': Promise<unknown>' : ''} {
  try {
    const response${resType} = await fetch('${p.url}', {
${optionLines}
    });

    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }

    const data${dataType} = await response.json();
    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}

fetchData();`;
  }

  return `const response = await fetch('${p.url}', {
${optionLines}
});
const data = await response.json();
console.log(data);`;
}

function generateAxios(p: ParsedCurl, ts: boolean, errorHandling: boolean): string {
  const hasBody = p.body !== undefined;

  const configLines = [
    `  method: '${p.method.toLowerCase()}',`,
    `  url: '${p.url}',`,
    Object.keys(p.headers).length ? `  headers: ${headersToString(p.headers)},` : '',
    hasBody ? `  data: ${p.isJson ? p.body : `'${p.body}'`},` : '',
  ].filter(Boolean).join('\n');

  if (errorHandling) {
    return `import axios${ts ? ', { AxiosError }' : ''} from 'axios';

async function fetchData()${ts ? ': Promise<unknown>' : ''} {
  try {
    const { data } = await axios({
${configLines}
    });
    return data;
  } catch (error${ts ? ': unknown' : ''}) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error:', error.response?.data);
    }
    throw error;
  }
}

fetchData();`;
  }

  return `import axios from 'axios';

const { data } = await axios({
${configLines}
});
console.log(data);`;
}

function generateXHR(p: ParsedCurl, ts: boolean): string {
  const hasBody = p.body !== undefined;
  const headers = Object.entries(p.headers)
    .map(([k, v]) => `xhr.setRequestHeader('${k}', '${v}');`)
    .join('\n  ');

  return `const xhr = new XMLHttpRequest();
xhr.open('${p.method}', '${p.url}');
${headers ? `  ${headers}` : ''}
xhr.onload = function () {
  if (xhr.status >= 200 && xhr.status < 300) {
    const data${ts ? ': unknown' : ''} = JSON.parse(xhr.responseText);
    console.log(data);
  } else {
    console.error('Request failed:', xhr.status);
  }
};
xhr.onerror = function () {
  console.error('Network error');
};
${hasBody ? `xhr.send(${p.isJson ? `JSON.stringify(${p.body})` : `'${p.body}'`});` : 'xhr.send();'}`;
}

// ── Public API ─────────────────────────────────────────────────────────────

export function convertCurl(curlStr: string, opts: CurlOptions): string {
  const parsed = parseCurl(curlStr);
  const ts = opts.typescript ?? true;
  const errors = opts.includeErrorHandling ?? true;

  switch (opts.format) {
    case 'fetch': return generateFetch(parsed, ts, errors);
    case 'axios': return generateAxios(parsed, ts, errors);
    case 'xhr':   return generateXHR(parsed, ts);
  }
}
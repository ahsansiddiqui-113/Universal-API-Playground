/**
 * pyodide.worker.ts
 * Web Worker that runs Python code via Pyodide (WebAssembly).
 * Place in: frontend/app/tool/code-runner/pyodide.worker.ts
 *
 * Usage from the main thread:
 *   const worker = new Worker(new URL('./pyodide.worker.ts', import.meta.url));
 *   worker.postMessage({ type: 'run', code: 'print("hello")' });
 *   worker.onmessage = (e) => { ... }
 */

// ── Type declarations for self inside a Worker ─────────────────────────────

declare const self: Worker & typeof globalThis;

// ── Message types ──────────────────────────────────────────────────────────

export type WorkerIncoming =
  | { type: 'run'; code: string; timeout?: number }
  | { type: 'interrupt' };

export type WorkerOutgoing =
  | { type: 'stdout';   data: string }
  | { type: 'stderr';   data: string }
  | { type: 'done';     executionTime: number }
  | { type: 'error';    message: string }
  | { type: 'loading' }
  | { type: 'ready' }
  | { type: 'timeout' };

// ── State ──────────────────────────────────────────────────────────────────

let pyodide: any = null;
let loading = false;
let currentTimeout: ReturnType<typeof setTimeout> | null = null;

// ── Pyodide loader ─────────────────────────────────────────────────────────

async function loadPyodideRuntime(): Promise<void> {
  if (pyodide) return;
  if (loading) return;

  loading = true;
  send({ type: 'loading' });

  try {
    // Import Pyodide from CDN
    importScripts('https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js');

    pyodide = await (self as any).loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/',
    });

    // Redirect stdout / stderr to postMessage
    await pyodide.runPythonAsync(`
import sys
import io

class _PostMessageStream(io.TextIOBase):
    def __init__(self, stream_type):
        self._type = stream_type
    def write(self, text):
        if text:
            import js
            js.postMessage({'type': self._type, 'data': text})
        return len(text)
    def flush(self):
        pass

sys.stdout = _PostMessageStream('stdout')
sys.stderr = _PostMessageStream('stderr')
    `);

    send({ type: 'ready' });
  } catch (err) {
    send({ type: 'error', message: `Failed to load Python runtime: ${(err as Error).message}` });
  } finally {
    loading = false;
  }
}

// ── Code runner ────────────────────────────────────────────────────────────

async function runCode(code: string, timeout = 10_000): Promise<void> {
  // Ensure Pyodide is loaded
  if (!pyodide) {
    await loadPyodideRuntime();
    if (!pyodide) return; // loading failed
  }

  const start = performance.now();

  // Set up timeout — Pyodide doesn't support true interruption easily,
  // so we use a flag checked between statements via a custom hook
  let timedOut = false;
  currentTimeout = setTimeout(() => {
    timedOut = true;
    send({ type: 'timeout' });
    // Attempt to interrupt Pyodide's execution via keyboard interrupt
    if (pyodide?.checkInterrupt) {
      pyodide.setInterruptBuffer(new Int32Array(1).fill(2)); // SIGINT
    }
  }, timeout);

  try {
    await pyodide.runPythonAsync(code);

    if (!timedOut) {
      const executionTime = Math.round(performance.now() - start);
      send({ type: 'done', executionTime });
    }
  } catch (err: unknown) {
    if (!timedOut) {
      const message = (err as Error).message ?? String(err);
      // Strip Pyodide internal traceback noise for cleaner output
      const clean = message.replace(/File "<exec>",\s*/g, '').trim();
      send({ type: 'stderr', data: clean });
      send({ type: 'done', executionTime: Math.round(performance.now() - start) });
    }
  } finally {
    if (currentTimeout) {
      clearTimeout(currentTimeout);
      currentTimeout = null;
    }
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────

function send(msg: WorkerOutgoing): void {
  self.postMessage(msg);
}

// ── Message handler ────────────────────────────────────────────────────────

self.onmessage = async (event: MessageEvent<WorkerIncoming>) => {
  const msg = event.data;

  switch (msg.type) {
    case 'run':
      await runCode(msg.code, msg.timeout ?? 10_000);
      break;

    case 'interrupt':
      if (currentTimeout) {
        clearTimeout(currentTimeout);
        currentTimeout = null;
      }
      send({ type: 'done', executionTime: 0 });
      break;

    default:
      send({ type: 'error', message: `Unknown message type: ${(msg as any).type}` });
  }
};

// Pre-load Pyodide as soon as the worker starts so it's ready immediately
loadPyodideRuntime();

function importScripts(arg0: string) {
    throw new Error("Function not implemented.");
}

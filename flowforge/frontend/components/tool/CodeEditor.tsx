'use client';

import { useEffect, useRef, useState } from 'react';

type Language = 'javascript' | 'typescript' | 'python' | 'html' | 'css' | 'json' | 'dart' | 'plaintext';
type Theme = 'dark' | 'light';

interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language?: Language;
  theme?: Theme;
  readOnly?: boolean;
  height?: string;
  fontSize?: number;
  placeholder?: string;
  onRun?: () => void;          // triggered on Ctrl/Cmd + Enter
  minimap?: boolean;
  lineNumbers?: boolean;
  wordWrap?: boolean;
}

// We load Monaco lazily to avoid SSR issues
let monacoLoaded = false;
let monacoLoadPromise: Promise<void> | null = null;

function loadMonaco(): Promise<void> {
  if (monacoLoaded) return Promise.resolve();
  if (monacoLoadPromise) return monacoLoadPromise;

  monacoLoadPromise = new Promise((resolve, reject) => {
    // Load Monaco from CDN via require config
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/monaco-editor@0.44.0/min/vs/loader.js';
    script.onload = () => {
      (window as any).require.config({
        paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.44.0/min/vs' },
      });
      (window as any).require(['vs/editor/editor.main'], () => {
        monacoLoaded = true;
        resolve();
      });
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });

  return monacoLoadPromise;
}

export default function CodeEditor({
  value,
  onChange,
  language = 'javascript',
  theme = 'dark',
  readOnly = false,
  height = '100%',
  fontSize = 13,
  placeholder,
  onRun,
  minimap = false,
  lineNumbers = true,
  wordWrap = false,
}: CodeEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef    = useRef<any>(null);
  const valueRef     = useRef(value);
  const [ready, setReady] = useState(false);

  // Keep valueRef in sync so the effect closure isn't stale
  valueRef.current = value;

  useEffect(() => {
    let destroyed = false;

    loadMonaco().then(() => {
      if (destroyed || !containerRef.current) return;

      const monaco = (window as any).monaco;

      // Define custom dark theme matching the app's gray-950 palette
      monaco.editor.defineTheme('flowforge-dark', {
        base: 'vs-dark',
        inherit: true,
        rules: [],
        colors: {
          'editor.background':           '#0a0a0a',
          'editor.foreground':           '#d1d5db',
          'editorLineNumber.foreground': '#374151',
          'editorLineNumber.activeForeground': '#6b7280',
          'editor.selectionBackground':  '#374151',
          'editor.inactiveSelectionBackground': '#1f2937',
          'editorCursor.foreground':     '#818cf8',
          'editor.lineHighlightBackground': '#111111',
          'editorIndentGuide.background': '#1f2937',
          'editorGutter.background':     '#0a0a0a',
        },
      });

      monaco.editor.defineTheme('flowforge-light', {
        base: 'vs',
        inherit: true,
        rules: [],
        colors: {
          'editor.background':           '#ffffff',
          'editor.foreground':           '#111827',
          'editorLineNumber.foreground': '#9ca3af',
          'editorCursor.foreground':     '#4f46e5',
        },
      });

      const editor = monaco.editor.create(containerRef.current, {
        value: valueRef.current,
        language,
        theme: theme === 'dark' ? 'flowforge-dark' : 'flowforge-light',
        readOnly,
        fontSize,
        fontFamily: '"JetBrains Mono", "Fira Code", "Cascadia Code", Consolas, monospace',
        fontLigatures: true,
        lineNumbers: lineNumbers ? 'on' : 'off',
        minimap:  { enabled: minimap },
        wordWrap: wordWrap ? 'on' : 'off',
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 2,
        insertSpaces: true,
        renderWhitespace: 'none',
        bracketPairColorization: { enabled: true },
        guides: { bracketPairs: false, indentation: false },
        overviewRulerLanes: 0,
        hideCursorInOverviewRuler: true,
        scrollbar: {
          verticalScrollbarSize: 6,
          horizontalScrollbarSize: 6,
        },
        padding: { top: 16, bottom: 16 },
        suggest: { showWords: false },
        quickSuggestions: { other: false, comments: false, strings: false },
        parameterHints: { enabled: false },
        hover: { enabled: false },
        contextmenu: false,
      });

      editorRef.current = editor;

      // onChange handler
      editor.onDidChangeModelContent(() => {
        const val = editor.getValue();
        if (onChange) onChange(val);
      });

      // Ctrl/Cmd + Enter → onRun
      if (onRun) {
        editor.addCommand(
          monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
          onRun,
        );
      }

      setReady(true);
    });

    return () => {
      destroyed = true;
      if (editorRef.current) {
        editorRef.current.dispose();
        editorRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync external value changes into editor (without resetting cursor)
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const current = editor.getValue();
    if (current !== value) {
      const model = editor.getModel();
      if (model) {
        model.pushEditOperations(
          [],
          [{ range: model.getFullModelRange(), text: value }],
          () => null,
        );
      }
    }
  }, [value]);

  // Sync language changes
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const monaco = (window as any).monaco;
    if (!monaco) return;
    const model = editor.getModel();
    if (model) monaco.editor.setModelLanguage(model, language);
  }, [language]);

  // Sync theme changes
  useEffect(() => {
    const monaco = (window as any).monaco;
    if (!monaco) return;
    monaco.editor.setTheme(theme === 'dark' ? 'flowforge-dark' : 'flowforge-light');
  }, [theme]);

  return (
    <div style={{ height, position: 'relative', overflow: 'hidden' }}>
      {/* Placeholder shown before Monaco loads */}
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-950">
          <div className="flex items-center gap-2 text-gray-600 text-sm font-mono">
            <svg className="w-4 h-4 animate-spin text-indigo-500" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Loading editor…
          </div>
        </div>
      )}
      {/* Placeholder text overlay (shown when value is empty and editor ready) */}
      {ready && !value && placeholder && (
        <div
          className="absolute top-4 left-14 text-gray-700 text-sm font-mono pointer-events-none select-none z-10"
          style={{ fontSize, fontFamily: '"JetBrains Mono", monospace' }}
        >
          {placeholder}
        </div>
      )}
      <div ref={containerRef} style={{ height: '100%', width: '100%' }} />
    </div>
  );
}
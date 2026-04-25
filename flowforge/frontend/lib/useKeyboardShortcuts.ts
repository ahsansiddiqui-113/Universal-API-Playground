import { useEffect } from 'react';

export interface KeyboardShortcutConfig {
  key: string; // 'k', 'Enter', '?', etc.
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  callback: (e: KeyboardEvent) => void;
  preventDefault?: boolean; // default: true
}

/**
 * Hook to register keyboard shortcuts
 * Handles cross-platform shortcuts (Cmd on Mac, Ctrl on Windows/Linux)
 *
 * Example:
 * useKeyboardShortcuts([
 *   {
 *     key: 'k',
 *     metaKey: true, // Cmd+K on Mac, Ctrl+K on Windows
 *     callback: (e) => openSearch(),
 *   },
 * ]);
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcutConfig[]) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = shortcut.ctrlKey ? e.ctrlKey : true;
        const metaMatch = shortcut.metaKey ? e.metaKey : true;
        const shiftMatch = shortcut.shiftKey !== undefined ? e.shiftKey === shortcut.shiftKey : true;
        const altMatch = shortcut.altKey !== undefined ? e.altKey === shortcut.altKey : true;

        if (keyMatch && ctrlMatch && metaMatch && shiftMatch && altMatch) {
          if (shortcut.preventDefault !== false) {
            e.preventDefault();
          }
          shortcut.callback(e);
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}

/**
 * Platform-aware shortcut helper
 * Automatically uses Cmd on Mac, Ctrl on Windows/Linux
 */
export function createShortcut(
  key: string,
  callback: (e: KeyboardEvent) => void,
  options?: {
    shift?: boolean;
    alt?: boolean;
    preventDefault?: boolean;
  }
): KeyboardShortcutConfig {
  const isMac = typeof window !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);

  return {
    key,
    metaKey: isMac,
    ctrlKey: !isMac,
    shiftKey: options?.shift,
    altKey: options?.alt,
    callback,
    preventDefault: options?.preventDefault !== false,
  };
}

/**
 * Common shortcuts for FlowForge
 */
export const COMMON_SHORTCUTS = {
  SEARCH: createShortcut('k', () => {}, { preventDefault: true }),
  HELP: createShortcut('?', () => {}, { preventDefault: true }),
  RUN: createShortcut('Enter', () => {}, { shift: false, preventDefault: true }),
  COPY: createShortcut('c', () => {}, { shift: true, preventDefault: true }),
  CLEAR: createShortcut('l', () => {}, { shift: true, preventDefault: true }),
};

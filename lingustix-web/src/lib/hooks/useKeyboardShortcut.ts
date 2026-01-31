import { useEffect, useCallback } from 'react';

type KeyHandler = (event: KeyboardEvent) => void;

interface KeyCombo {
  key: string;
  modifiers?: {
    meta?: boolean;
    ctrl?: boolean;
    alt?: boolean;
    shift?: boolean;
  };
}

export function useKeyboardShortcut(
  keyCombo: KeyCombo,
  handler: KeyHandler,
  enabled = true
): void {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      const { key, modifiers = {} } = keyCombo;
      const { meta = false, ctrl = false, alt = false, shift = false } = modifiers;

      // Check if key matches (case-insensitive)
      const keyMatches = event.key.toLowerCase() === key.toLowerCase();

      // Check modifiers - metaKey for Mac, ctrlKey for Windows/Linux
      const metaOrCtrl = meta || ctrl;
      const modifiersMatch =
        (metaOrCtrl ? event.metaKey || event.ctrlKey : !event.metaKey && !event.ctrlKey) &&
        (alt ? event.altKey : !event.altKey) &&
        (shift ? event.shiftKey : !event.shiftKey);

      if (keyMatches && modifiersMatch) {
        event.preventDefault();
        handler(event);
      }
    },
    [keyCombo, handler, enabled]
  );

  useEffect(() => {
    if (enabled) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown, enabled]);
}

import { useState, useCallback } from 'react';

const STORAGE_KEY = 'graphite-word-wrap';

export function useWordWrap() {
  const [wordWrap, setWordWrap] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const toggleWordWrap = useCallback(() => {
    setWordWrap(prev => {
      const next = !prev;
      try { localStorage.setItem(STORAGE_KEY, String(next)); } catch {}
      return next;
    });
  }, []);

  return { wordWrap, toggleWordWrap };
}

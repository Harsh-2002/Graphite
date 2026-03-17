import { useState, useMemo, useCallback, useEffect } from 'react';

export interface FindMatch {
  start: number;
  end: number;
}

export function useFindReplace(code: string, onChange: (code: string) => void) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [replaceTerm, setReplaceTerm] = useState('');
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [showReplace, setShowReplace] = useState(false);

  const matches = useMemo<FindMatch[]>(() => {
    if (!searchTerm) return [];
    const results: FindMatch[] = [];
    const lower = code.toLowerCase();
    const term = searchTerm.toLowerCase();
    let pos = 0;
    while ((pos = lower.indexOf(term, pos)) !== -1) {
      results.push({ start: pos, end: pos + term.length });
      pos += 1;
    }
    return results;
  }, [code, searchTerm]);

  // Reset to first match when search term changes
  useEffect(() => {
    setCurrentMatchIndex(0);
  }, [searchTerm]);

  // Clamp index when matches shrink
  const effectiveIndex = matches.length === 0 ? 0 : Math.min(currentMatchIndex, matches.length - 1);

  const open = useCallback(() => setIsOpen(true), []);

  const close = useCallback(() => {
    setIsOpen(false);
    setSearchTerm('');
    setReplaceTerm('');
    setShowReplace(false);
  }, []);

  const next = useCallback(() => {
    if (matches.length === 0) return;
    setCurrentMatchIndex(prev => (prev + 1) % matches.length);
  }, [matches.length]);

  const prev = useCallback(() => {
    if (matches.length === 0) return;
    setCurrentMatchIndex(prev => (prev - 1 + matches.length) % matches.length);
  }, [matches.length]);

  const replaceOne = useCallback(() => {
    if (matches.length === 0) return;
    const idx = Math.min(currentMatchIndex, matches.length - 1);
    const match = matches[idx];
    const newCode = code.slice(0, match.start) + replaceTerm + code.slice(match.end);
    onChange(newCode);
  }, [matches, currentMatchIndex, code, replaceTerm, onChange]);

  const replaceAll = useCallback(() => {
    if (matches.length === 0 || !searchTerm) return;
    const escaped = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'gi');
    const newCode = code.replace(regex, replaceTerm);
    onChange(newCode);
  }, [matches.length, searchTerm, code, replaceTerm, onChange]);

  return {
    isOpen,
    searchTerm,
    replaceTerm,
    matches,
    currentMatchIndex: effectiveIndex,
    showReplace,
    setSearchTerm,
    setReplaceTerm,
    setShowReplace,
    open,
    close,
    next,
    prev,
    replaceOne,
    replaceAll,
  };
}

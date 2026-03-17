import React, { useRef, useEffect } from 'react';
import { ChevronUp, ChevronDown, X, ChevronRight } from 'lucide-react';
import type { UIClasses } from '../types/theme';

interface FindReplaceBarProps {
  searchTerm: string;
  replaceTerm: string;
  matchCount: number;
  currentMatchIndex: number;
  showReplace: boolean;
  onSearchChange: (term: string) => void;
  onReplaceChange: (term: string) => void;
  onToggleReplace: () => void;
  onNext: () => void;
  onPrev: () => void;
  onReplaceOne: () => void;
  onReplaceAll: () => void;
  onClose: () => void;
  ui: UIClasses;
}

export function FindReplaceBar({
  searchTerm,
  replaceTerm,
  matchCount,
  currentMatchIndex,
  showReplace,
  onSearchChange,
  onReplaceChange,
  onToggleReplace,
  onNext,
  onPrev,
  onReplaceOne,
  onReplaceAll,
  onClose,
  ui,
}: FindReplaceBarProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      onPrev();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      onNext();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  const handleReplaceKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  const matchLabel = matchCount === 0
    ? searchTerm ? 'No results' : ''
    : `${currentMatchIndex + 1} of ${matchCount}`;

  return (
    <div className={`absolute top-0 left-0 right-0 z-20 border-b shadow-sm ${ui.panelBg} ${ui.panelBorder}`}>
      {/* Search row */}
      <div className="flex items-center gap-1 px-2 py-1.5">
        <button
          onClick={onToggleReplace}
          className={`p-1 rounded transition-all duration-150 cursor-pointer hover:opacity-80 ${ui.btnSecondary} border-0`}
          title={showReplace ? 'Hide replace' : 'Show replace'}
        >
          <ChevronRight
            size={14}
            className={`transition-transform duration-150 ${showReplace ? 'rotate-90' : ''}`}
          />
        </button>
        <input
          ref={searchInputRef}
          type="text"
          value={searchTerm}
          onChange={e => onSearchChange(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          placeholder="Find"
          className={`flex-1 min-w-0 px-2 py-1 text-xs rounded border outline-none ${ui.editorBg} ${ui.panelBorder} ${ui.editorText}`}
          spellCheck={false}
        />
        <span className={`text-[10px] min-w-[4rem] text-center select-none ${ui.previewTitle}`}>
          {matchLabel}
        </span>
        <button
          onClick={onPrev}
          disabled={matchCount === 0}
          className={`p-1 rounded transition-all duration-150 cursor-pointer hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed ${ui.btnSecondary} border-0`}
          title="Previous match (Shift+Enter)"
        >
          <ChevronUp size={14} />
        </button>
        <button
          onClick={onNext}
          disabled={matchCount === 0}
          className={`p-1 rounded transition-all duration-150 cursor-pointer hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed ${ui.btnSecondary} border-0`}
          title="Next match (Enter)"
        >
          <ChevronDown size={14} />
        </button>
        <button
          onClick={onClose}
          className={`p-1 rounded transition-all duration-150 cursor-pointer hover:opacity-80 ${ui.btnSecondary} border-0`}
          title="Close (Escape)"
        >
          <X size={14} />
        </button>
      </div>

      {/* Replace row */}
      {showReplace && (
        <div className="flex items-center gap-1 px-2 pb-1.5">
          {/* Spacer to align with search input */}
          <div className="w-[22px] shrink-0" />
          <input
            type="text"
            value={replaceTerm}
            onChange={e => onReplaceChange(e.target.value)}
            onKeyDown={handleReplaceKeyDown}
            placeholder="Replace"
            className={`flex-1 min-w-0 px-2 py-1 text-xs rounded border outline-none ${ui.editorBg} ${ui.panelBorder} ${ui.editorText}`}
            spellCheck={false}
          />
          <button
            onClick={onReplaceOne}
            disabled={matchCount === 0}
            className={`px-2 py-1 text-[11px] font-medium rounded border transition-all duration-150 cursor-pointer hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed ${ui.btnSecondary}`}
            title="Replace"
          >
            Replace
          </button>
          <button
            onClick={onReplaceAll}
            disabled={matchCount === 0}
            className={`px-2 py-1 text-[11px] font-medium rounded border transition-all duration-150 cursor-pointer hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed ${ui.btnSecondary}`}
            title="Replace all"
          >
            All
          </button>
        </div>
      )}
    </div>
  );
}

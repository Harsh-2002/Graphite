import React, { useRef, useMemo, useEffect } from 'react';
import { Highlight, themes } from 'prism-react-renderer';
import type { UIClasses } from '../types/theme';
import { useFindReplace } from '../hooks/useFindReplace';
import { FindReplaceBar } from './FindReplaceBar';
import '../utils/prismMermaid'; // registers the mermaid grammar

interface EditorProps {
  code: string;
  onChange: (code: string) => void;
  ui: UIClasses;
  isDark: boolean;
  errorLine?: number | null;
  wordWrap?: boolean;
}

export function Editor({ code, onChange, ui, isDark, errorLine, wordWrap }: EditorProps) {
  const lineRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);
  const searchHighlightRef = useRef<HTMLPreElement>(null);
  const lines = code.split('\n');

  const theme = useMemo(() => (isDark ? themes.vsDark : themes.vsLight), [isDark]);

  const findReplace = useFindReplace(code, onChange);

  // Cmd+F / Ctrl+F to open find bar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        findReplace.open();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [findReplace.open]);

  // Scroll to current match
  useEffect(() => {
    if (!findReplace.isOpen || findReplace.matches.length === 0 || !textRef.current) return;
    const match = findReplace.matches[findReplace.currentMatchIndex];
    if (!match) return;
    const linesBefore = code.slice(0, match.start).split('\n').length - 1;
    textRef.current.scrollTop = linesBefore * 24; // 24px line height (leading-6)
  }, [findReplace.currentMatchIndex, findReplace.matches, findReplace.isOpen, code]);

  // Search highlight segments
  const searchSegments = useMemo(() => {
    if (!findReplace.isOpen || findReplace.matches.length === 0) return null;
    const segments: { text: string; type: 'normal' | 'match' | 'current' }[] = [];
    let lastEnd = 0;
    findReplace.matches.forEach((match, i) => {
      if (match.start > lastEnd) {
        segments.push({ text: code.slice(lastEnd, match.start), type: 'normal' });
      }
      segments.push({
        text: code.slice(match.start, match.end),
        type: i === findReplace.currentMatchIndex ? 'current' : 'match',
      });
      lastEnd = match.end;
    });
    if (lastEnd < code.length) {
      segments.push({ text: code.slice(lastEnd), type: 'normal' });
    }
    return segments;
  }, [code, findReplace.isOpen, findReplace.matches, findReplace.currentMatchIndex]);

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    const { scrollTop, scrollLeft } = e.currentTarget;
    if (lineRef.current) lineRef.current.scrollTop = scrollTop;
    if (highlightRef.current) {
      highlightRef.current.scrollTop = scrollTop;
      highlightRef.current.scrollLeft = scrollLeft;
    }
    if (searchHighlightRef.current) {
      searchHighlightRef.current.scrollTop = scrollTop;
      searchHighlightRef.current.scrollLeft = scrollLeft;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const updated = code.substring(0, start) + '  ' + code.substring(end);
      onChange(updated);

      requestAnimationFrame(() => {
        if (textRef.current) {
          textRef.current.selectionStart = textRef.current.selectionEnd = start + 2;
        }
      });
    }
  };

  const wrapClass = wordWrap ? 'whitespace-pre-wrap break-words' : 'whitespace-pre';

  return (
    <div className={`flex h-full w-full relative ${ui.editorBg} font-mono text-[13px] sm:text-[13px] leading-6 overflow-hidden transition-colors duration-200`}>
      {/* Find & Replace Bar */}
      {findReplace.isOpen && (
        <FindReplaceBar
          searchTerm={findReplace.searchTerm}
          replaceTerm={findReplace.replaceTerm}
          matchCount={findReplace.matches.length}
          currentMatchIndex={findReplace.currentMatchIndex}
          showReplace={findReplace.showReplace}
          onSearchChange={findReplace.setSearchTerm}
          onReplaceChange={findReplace.setReplaceTerm}
          onToggleReplace={() => findReplace.setShowReplace(!findReplace.showReplace)}
          onNext={findReplace.next}
          onPrev={findReplace.prev}
          onReplaceOne={findReplace.replaceOne}
          onReplaceAll={findReplace.replaceAll}
          onClose={findReplace.close}
          ui={ui}
        />
      )}

      {/* Line numbers */}
      <div
        ref={lineRef}
        className={`w-10 sm:w-12 shrink-0 text-right pr-2 sm:pr-3 py-4 select-none overflow-hidden border-r ${ui.editorLineNum} transition-colors duration-200`}
      >
        {lines.map((_, i) => (
          <div
            key={i}
            className={`leading-6 ${errorLine === i + 1 ? 'bg-red-500/20 text-red-400' : ''}`}
          >
            {i + 1}
          </div>
        ))}
      </div>

      {/* Code area: highlight layer + search highlight + textarea overlay */}
      <div className="relative flex-1 overflow-hidden">
        {/* Syntax-highlighted underlay */}
        <Highlight theme={theme} code={code} language="mermaid">
          {({ tokens, getLineProps, getTokenProps }) => (
            <pre
              ref={highlightRef}
              className={`absolute inset-0 p-4 m-0 overflow-hidden pointer-events-none ${wrapClass} leading-6 bg-transparent`}
              aria-hidden
            >
              {tokens.map((line, i) => (
                <div
                  key={i}
                  {...getLineProps({ line })}
                  style={{}}
                  className={errorLine === i + 1 ? 'bg-red-500/10' : ''}
                >
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token })} />
                  ))}
                </div>
              ))}
            </pre>
          )}
        </Highlight>

        {/* Search match highlight layer */}
        {searchSegments && (
          <pre
            ref={searchHighlightRef}
            className={`absolute inset-0 p-4 m-0 overflow-hidden pointer-events-none ${wrapClass} leading-6 bg-transparent text-transparent`}
            aria-hidden
          >
            {searchSegments.map((seg, i) =>
              seg.type === 'normal' ? (
                <span key={i}>{seg.text}</span>
              ) : (
                <mark
                  key={i}
                  className={`text-transparent ${
                    seg.type === 'current' ? 'bg-yellow-500/60' : 'bg-yellow-300/30'
                  } rounded-sm`}
                >
                  {seg.text}
                </mark>
              )
            )}
          </pre>
        )}

        {/* Transparent textarea for input */}
        <textarea
          ref={textRef}
          value={code}
          onChange={e => onChange(e.target.value)}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          className={`absolute inset-0 p-4 w-full h-full bg-transparent text-transparent caret-current resize-none outline-none ${wrapClass} leading-6 z-10 text-[16px] sm:text-[13px]`}
          style={{ caretColor: isDark ? '#d4d4d8' : '#27272a' }}
          spellCheck={false}
          wrap={wordWrap ? 'soft' : 'off'}
          placeholder="Enter Mermaid syntax..."
          autoCapitalize="off"
          autoCorrect="off"
        />
      </div>
    </div>
  );
}

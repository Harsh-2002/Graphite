import React, { useRef, useMemo } from 'react';
import { Highlight, themes } from 'prism-react-renderer';
import type { UIClasses } from '../types/theme';
import '../utils/prismMermaid'; // registers the mermaid grammar

interface EditorProps {
  code: string;
  onChange: (code: string) => void;
  ui: UIClasses;
  isDark: boolean;
}

export function Editor({ code, onChange, ui, isDark }: EditorProps) {
  const lineRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);
  const lines = code.split('\n');

  const theme = useMemo(() => (isDark ? themes.vsDark : themes.vsLight), [isDark]);

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    const { scrollTop, scrollLeft } = e.currentTarget;
    if (lineRef.current) lineRef.current.scrollTop = scrollTop;
    if (highlightRef.current) {
      highlightRef.current.scrollTop = scrollTop;
      highlightRef.current.scrollLeft = scrollLeft;
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

  return (
    <div className={`flex h-full w-full ${ui.editorBg} font-mono text-[13px] sm:text-[13px] leading-6 overflow-hidden transition-colors duration-200`}>
      {/* Line numbers */}
      <div
        ref={lineRef}
        className={`w-10 sm:w-12 shrink-0 text-right pr-2 sm:pr-3 py-4 select-none overflow-hidden border-r ${ui.editorLineNum} transition-colors duration-200`}
      >
        {lines.map((_, i) => (
          <div key={i} className="leading-6">{i + 1}</div>
        ))}
      </div>

      {/* Code area: highlight layer + textarea overlay */}
      <div className="relative flex-1 overflow-hidden">
        {/* Syntax-highlighted underlay */}
        <Highlight theme={theme} code={code} language="mermaid">
          {({ tokens, getLineProps, getTokenProps }) => (
            <pre
              ref={highlightRef}
              className="absolute inset-0 p-4 m-0 overflow-hidden pointer-events-none whitespace-pre leading-6 bg-transparent"
              aria-hidden
            >
              {tokens.map((line, i) => (
                <div key={i} {...getLineProps({ line })} style={{}}>
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token })} />
                  ))}
                </div>
              ))}
            </pre>
          )}
        </Highlight>

        {/* Transparent textarea for input */}
        <textarea
          ref={textRef}
          value={code}
          onChange={e => onChange(e.target.value)}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          className="absolute inset-0 p-4 w-full h-full bg-transparent text-transparent caret-current resize-none outline-none whitespace-pre leading-6 z-10 text-[16px] sm:text-[13px]"
          style={{ caretColor: isDark ? '#d4d4d8' : '#27272a' }}
          spellCheck={false}
          wrap="off"
          placeholder="Enter Mermaid syntax..."
          autoCapitalize="off"
          autoCorrect="off"
        />
      </div>
    </div>
  );
}

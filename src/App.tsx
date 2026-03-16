import { useState, useEffect, useCallback, useMemo } from 'react';
import { renderMermaidSVG, THEMES as BM_THEMES } from 'beautiful-mermaid';
import { Copy, Code, Check, AlertCircle } from 'lucide-react';
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels';

import { useTheme } from './hooks/useTheme';
import { useMobile } from './hooks/useMobile';
import { svgToPng } from './utils/svgToPng';
import { Editor } from './components/Editor';
import { DarkModeToggle } from './components/DarkModeToggle';
import { ThemeSelector } from './components/ThemeSelector';
import { DiagramThemeDropdown, isDiagramThemeDark } from './components/DiagramThemeDropdown';
import { ExportDropdown } from './components/ExportDropdown';

const DEFAULT_MERMAID = `graph TD
    A[Christmas] -->|Get money| B(Go shopping)
    B --> C{Let me think}
    C -->|One| D[Laptop]
    C -->|Two| E[iPhone]
    C -->|Three| F[Car]`;

export default function App() {
  const { themeId, setThemeId, isDark, toggleDark, ui, mermaidColors } = useTheme();
  const isMobile = useMobile();

  const [code, setCode] = useState(DEFAULT_MERMAID);
  const [svgContent, setSvgContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [diagramTheme, setDiagramTheme] = useState('auto');
  const [copied, setCopied] = useState(false);

  // Render SVG whenever inputs change
  useEffect(() => {
    if (!code.trim()) {
      setSvgContent('');
      setError(null);
      return;
    }

    try {
      const colors =
        diagramTheme === 'auto' ? mermaidColors : BM_THEMES[diagramTheme];

      const svg = renderMermaidSVG(code, {
        transparent: true,
        bg: 'transparent',
        fg: colors.fg,
        line: colors.line,
        border: colors.border,
        surface: colors.surface,
        accent: colors.accent,
        font: 'ui-sans-serif, system-ui, sans-serif',
      });
      setSvgContent(svg);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to render diagram');
    }
  }, [code, mermaidColors, diagramTheme]);

  const getActiveColors = useCallback(() => {
    return diagramTheme === 'auto' ? mermaidColors : BM_THEMES[diagramTheme];
  }, [diagramTheme, mermaidColors]);

  const handleCopyPNG = async () => {
    if (!svgContent) return;
    try {
      const blob = await svgToPng(svgContent, 3, isDark, getActiveColors());
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy PNG:', err);
    }
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportPNG = async () => {
    if (!svgContent) return;
    try {
      const blob = await svgToPng(svgContent, 3, isDark, getActiveColors());
      downloadBlob(blob, 'graphite-diagram.png');
    } catch (err) {
      console.error('Failed to export PNG:', err);
    }
  };

  const handleExportSVG = () => {
    if (!svgContent) return;
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    downloadBlob(blob, 'graphite-diagram.svg');
  };

  // Determine the preview card bg: if a specific diagram theme is selected,
  // use its bg color so it always looks correct regardless of light/dark mode.
  const diagramCardStyle = useMemo(() => {
    if (diagramTheme === 'auto') return {};
    const bmTheme = BM_THEMES[diagramTheme] as { bg?: string } | undefined;
    if (bmTheme?.bg) return { backgroundColor: bmTheme.bg };
    return {};
  }, [diagramTheme]);

  // For the "Auto" label, show the current UI theme name
  const autoLabel = useMemo(() => {
    const themeName = { zinc: 'Graphite', blue: 'Ocean', emerald: 'Forest', violet: 'Lavender', orange: 'Sunset' }[themeId];
    return `${themeName} ${isDark ? 'Dark' : 'Light'}`;
  }, [themeId, isDark]);

  // Does the selected diagram theme have a dark bg? Used to pick card border/text color.
  const diagramIsDark = diagramTheme === 'auto' ? isDark : (isDiagramThemeDark(diagramTheme) ?? isDark);

  return (
    <div
      className={`h-screen w-screen flex flex-col overflow-hidden font-sans transition-colors duration-200 ${ui.appBg} ${ui.appText} ${ui.selection}`}
    >
      <PanelGroup direction={isMobile ? 'vertical' : 'horizontal'}>
        {/* Editor Panel */}
        <Panel defaultSize="40%" minSize="35%" className={`flex flex-col ${ui.panelBg} relative z-10 transition-colors duration-200`}>
          {/* Editor Header */}
          <div className={`h-12 border-b ${ui.panelBorder} flex items-center px-4 justify-between shrink-0 transition-colors duration-200`}>
            <div className="flex items-center gap-2.5 font-semibold text-sm tracking-tight">
              <div className={`w-6 h-6 rounded-md ${ui.iconBg} ${ui.iconText} flex items-center justify-center`}>
                <Code size={14} strokeWidth={2.5} />
              </div>
              Graphite
            </div>
            <div className="flex items-center gap-3">
              <ThemeSelector themeId={themeId} onSelect={setThemeId} />
              <div className={`w-px h-4 ${ui.panelBorder} border-l`} />
              <DarkModeToggle isDark={isDark} onToggle={toggleDark} ui={ui} />
            </div>
          </div>

          {/* Editor Body */}
          <div className="flex-1 overflow-hidden">
            <Editor code={code} onChange={setCode} ui={ui} isDark={isDark} />
          </div>
        </Panel>

        {/* Resize Handle */}
        <PanelResizeHandle
          className={`${isMobile ? 'h-1.5' : 'w-1.5'} ${ui.resizeHandle} transition-colors duration-200 z-20`}
        />

        {/* Preview Panel */}
        <Panel defaultSize="60%" minSize="55%" className={`flex flex-col ${ui.previewBg} relative z-0 transition-colors duration-200`}>
          {/* Preview Header */}
          <div className={`h-12 border-b ${ui.panelBorder} flex items-center px-4 justify-between shrink-0 ${ui.previewHeaderBg} transition-colors duration-200`}>
            <span className={`text-xs font-medium uppercase tracking-wider ${ui.previewTitle} transition-colors duration-200`}>
              Preview
            </span>
            <div className="flex items-center gap-2">
              <DiagramThemeDropdown value={diagramTheme} onChange={setDiagramTheme} ui={ui} autoLabel={autoLabel} />
              <button
                onClick={handleCopyPNG}
                disabled={!svgContent}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium border rounded-lg transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${ui.btnSecondary}`}
              >
                {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
              <ExportDropdown
                disabled={!svgContent}
                onExportPNG={handleExportPNG}
                onExportSVG={handleExportSVG}
                ui={ui}
              />
            </div>
          </div>

          {/* Preview Body */}
          <div className="flex-1 overflow-auto p-6 flex items-center justify-center relative">
            {/* Dot pattern */}
            <div
              className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }}
            />

            <div className="min-h-full min-w-full flex items-center justify-center p-4">
              {!code.trim() ? (
                <div className={`flex flex-col items-center justify-center text-center max-w-xs opacity-60 ${ui.previewTitle}`}>
                  <Code size={40} strokeWidth={1} className="mb-4 opacity-40" />
                  <p className="text-sm">Write Mermaid syntax in the editor to see your diagram here.</p>
                </div>
              ) : error ? (
                <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 px-5 py-4 rounded-xl max-w-lg w-full z-10 flex gap-3 items-start">
                  <AlertCircle className="shrink-0 mt-0.5" size={16} />
                  <div>
                    <h3 className="font-semibold mb-1 text-sm">Syntax Error</h3>
                    <p className="text-xs font-mono whitespace-pre-wrap break-words opacity-80 leading-relaxed">
                      {error}
                    </p>
                  </div>
                </div>
              ) : (
                <div
                  className={`border shadow-lg rounded-2xl p-8 transition-all duration-200 z-10 flex items-center justify-center ${
                    diagramTheme === 'auto'
                      ? `${ui.panelBg} ${ui.panelBorder}`
                      : diagramIsDark
                        ? 'border-white/10'
                        : 'border-black/10'
                  }`}
                  style={diagramTheme !== 'auto' ? diagramCardStyle : undefined}
                  dangerouslySetInnerHTML={{ __html: svgContent }}
                />
              )}
            </div>
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
}

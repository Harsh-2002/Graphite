import { useState, useEffect, useCallback, useMemo } from 'react';
import { renderMermaidSVG, THEMES as BM_THEMES } from 'beautiful-mermaid';
import lzString from 'lz-string';
import { Copy, Code, Check, AlertCircle, Settings, Download, Image, FileCode, ChevronRight, Link, Maximize2, Minimize2 } from 'lucide-react';
import { useTheme } from './hooks/useTheme';
import { useMobile } from './hooks/useMobile';
import { svgToPng, wrapSvgWithCard } from './utils/svgToPng';
import { parseErrorLine } from './utils/parseErrorLine';
import { Editor } from './components/Editor';
import { DarkModeToggle } from './components/DarkModeToggle';
import { ThemeSelector } from './components/ThemeSelector';
import { DiagramThemeDropdown, isDiagramThemeDark } from './components/DiagramThemeDropdown';
import { ExportDropdown } from './components/ExportDropdown';
import { TemplateDropdown } from './components/TemplateDropdown';
import { ZoomablePreview } from './components/ZoomablePreview';
import { MobileTabBar } from './components/MobileTabBar';
import { MobileBottomSheet } from './components/MobileBottomSheet';
import type { MobileTab } from './components/MobileTabBar';

const DEFAULT_MERMAID = `graph TD
    A[Christmas] -->|Get money| B(Go shopping)
    B --> C{Let me think}
    C -->|One| D[Laptop]
    C -->|Two| E[iPhone]
    C -->|Three| F[Car]`;

const STORAGE_KEY_CODE = 'graphite-code';

// --- Feature 1: localStorage persistence ---
function loadStoredCode(): string {
  // Feature 2: URL hash takes priority
  try {
    const hash = window.location.hash.slice(1);
    if (hash) {
      // Try lz-string first, fall back to old btoa(encodeURIComponent()) format
      const decoded = lzString.decompressFromEncodedURIComponent(hash);
      if (decoded) return decoded;
      return decodeURIComponent(atob(hash));
    }
  } catch {}

  try {
    const stored = localStorage.getItem(STORAGE_KEY_CODE);
    if (stored !== null) return stored;
  } catch {}

  return DEFAULT_MERMAID;
}

export default function App() {
  const { themeId, setThemeId, isDark, toggleDark, theme, ui, mermaidColors } = useTheme();
  const isMobile = useMobile();

  const [code, setCode] = useState(loadStoredCode);
  const [svgContent, setSvgContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [errorLine, setErrorLine] = useState<number | null>(null);
  const [diagramTheme, setDiagramTheme] = useState('auto');
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>('editor');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [exportSheetOpen, setExportSheetOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // --- Feature 1: Debounced localStorage persistence ---
  useEffect(() => {
    const timeout = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY_CODE, code);
      } catch {}
    }, 500);
    return () => clearTimeout(timeout);
  }, [code]);

  // --- Feature 2: Debounced URL hash update ---
  useEffect(() => {
    const timeout = setTimeout(() => {
      try {
        const hash = lzString.compressToEncodedURIComponent(code);
        history.replaceState(null, '', '#' + hash);
      } catch {}
    }, 500);
    return () => clearTimeout(timeout);
  }, [code]);

  // --- Feature 2: Share button handler ---
  const handleShareLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  // --- Feature 4: Escape key exits fullscreen ---
  useEffect(() => {
    if (!isFullscreen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFullscreen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isFullscreen]);

  // Dynamic theme-color meta tag for browser chrome (Android status bar, iOS Safari)
  useEffect(() => {
    const accentHex = isDark ? theme.accentHex.dark : theme.accentHex.light;
    let meta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'theme-color';
      document.head.appendChild(meta);
    }
    meta.content = accentHex;
  }, [theme, isDark]);

  // Render SVG whenever inputs change
  useEffect(() => {
    if (!code.trim()) {
      setSvgContent('');
      setError(null);
      setErrorLine(null);
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
      setErrorLine(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to render diagram';
      setError(msg);
      setErrorLine(parseErrorLine(msg, code));
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
      setExportSheetOpen(false);
    } catch (err) {
      console.error('Failed to export PNG:', err);
    }
  };

  const handleExportSVG = () => {
    if (!svgContent) return;
    const wrapped = wrapSvgWithCard(svgContent, isDark, getActiveColors());
    const blob = new Blob([wrapped], { type: 'image/svg+xml;charset=utf-8' });
    downloadBlob(blob, 'graphite-diagram.svg');
    setExportSheetOpen(false);
  };

  const diagramCardStyle = useMemo(() => {
    if (diagramTheme === 'auto') return {};
    const bmTheme = BM_THEMES[diagramTheme] as { bg?: string } | undefined;
    if (bmTheme?.bg) return { backgroundColor: bmTheme.bg };
    return {};
  }, [diagramTheme]);

  const autoLabel = useMemo(() => {
    const themeName = { zinc: 'Graphite', blue: 'Ocean', emerald: 'Forest', violet: 'Lavender', orange: 'Sunset' }[themeId];
    return `${themeName} ${isDark ? 'Dark' : 'Light'}`;
  }, [themeId, isDark]);

  const diagramIsDark = diagramTheme === 'auto' ? isDark : (isDiagramThemeDark(diagramTheme) ?? isDark);

  // Diagram card (used in both zoom and non-zoom paths)
  const diagramCard = svgContent ? (
    <div
      className={`border shadow-lg rounded-2xl p-4 sm:p-8 transition-all duration-200 z-10 flex items-center justify-center ${
        diagramTheme === 'auto'
          ? `${ui.panelBg} ${ui.panelBorder}`
          : diagramIsDark
            ? 'border-white/10'
            : 'border-black/10'
      }`}
      style={diagramTheme !== 'auto' ? diagramCardStyle : undefined}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  ) : null;

  // Preview content for non-zoom paths (empty state, error state, mobile)
  const previewInner = (
    <div className="min-h-full min-w-full flex items-center justify-center p-2 sm:p-4">
      {!code.trim() ? (
        <div className={`flex flex-col items-center justify-center text-center max-w-xs opacity-60 ${ui.previewTitle}`}>
          <Code size={40} strokeWidth={1} className="mb-4 opacity-40" />
          <p className="text-sm">Write Mermaid syntax in the editor to see your diagram here.</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 px-4 sm:px-5 py-3 sm:py-4 rounded-xl max-w-lg w-full z-10 flex gap-3 items-start">
          <AlertCircle className="shrink-0 mt-0.5" size={16} />
          <div>
            <h3 className="font-semibold mb-1 text-sm">Syntax Error</h3>
            <p className="text-xs font-mono whitespace-pre-wrap break-words opacity-80 leading-relaxed">
              {error}
            </p>
          </div>
        </div>
      ) : (
        diagramCard
      )}
    </div>
  );

  // Wrap with zoom/pan for desktop, or plain for mobile / error / empty states
  const previewContent = (
    <div className="flex-1 overflow-hidden relative">
      {/* Dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />

      {!isMobile && svgContent && !error ? (
        <ZoomablePreview svgContent={svgContent} ui={ui}>
          <div className="p-6">
            {diagramCard}
          </div>
        </ZoomablePreview>
      ) : (
        <div className="h-full w-full overflow-auto p-4 sm:p-6 flex items-center justify-center">
          {previewInner}
        </div>
      )}
    </div>
  );

  // --- MOBILE LAYOUT ---
  if (isMobile) {
    return (
      <div
        className={`h-[100dvh] w-screen flex flex-col overflow-hidden font-sans transition-colors duration-200 ${ui.appBg} ${ui.appText} ${ui.selection}`}
      >
        {/* Mobile Header - matches browser chrome color for seamless blend */}
        <div className={`shrink-0 safe-area-top ${ui.mobileToolbarBg} transition-colors duration-200`}>
          <div className={`h-14 border-b ${ui.mobileToolbarBorder} flex items-center px-4 justify-between`}>
            <div className="flex items-center gap-2.5 font-semibold text-[15px] tracking-tight">
              <div className={`w-7 h-7 rounded-lg ${ui.iconBg} ${ui.iconText} flex items-center justify-center`}>
                <Code size={15} strokeWidth={2.5} />
              </div>
              Graphite
            </div>
            <div className="flex items-center gap-2">
              {/* Editor-mode actions */}
              {mobileTab === 'editor' && (
                <TemplateDropdown onSelect={setCode} currentCode={code} ui={ui} />
              )}
              {/* Preview-mode actions */}
              {mobileTab === 'preview' && svgContent && (
                <>
                  <button
                    onClick={handleShareLink}
                    className={`h-9 flex items-center gap-1.5 px-3 text-xs font-medium border rounded-xl transition-all duration-150 active:scale-95 ${ui.btnSecondary}`}
                  >
                    {linkCopied ? <Check size={14} className="text-emerald-500" /> : <Link size={14} />}
                    {linkCopied ? 'Copied!' : 'Share'}
                  </button>
                  <button
                    onClick={handleCopyPNG}
                    className={`h-9 flex items-center gap-1.5 px-3 text-xs font-medium border rounded-xl transition-all duration-150 active:scale-95 ${ui.btnSecondary}`}
                  >
                    {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                  <button
                    onClick={() => setExportSheetOpen(true)}
                    className={`h-9 w-9 flex items-center justify-center rounded-xl transition-all duration-150 active:scale-95 shadow-sm ${ui.btnPrimary}`}
                  >
                    <Download size={16} />
                  </button>
                </>
              )}
              <button
                onClick={() => setSettingsOpen(true)}
                className={`h-9 w-9 flex items-center justify-center rounded-xl transition-all duration-150 active:scale-95 ${ui.btnSecondary} border`}
                aria-label="Settings"
              >
                <Settings size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {mobileTab === 'editor' ? (
            <div key="editor" className={`flex-1 overflow-hidden animate-fade-in ${ui.panelBg}`}>
              <Editor code={code} onChange={setCode} ui={ui} isDark={isDark} errorLine={errorLine} />
            </div>
          ) : (
            <div key="preview" className={`flex-1 flex flex-col overflow-hidden animate-fade-in ${ui.previewBg}`}>
              {previewContent}
            </div>
          )}
        </div>

        {/* Mobile Bottom Tab Bar */}
        <MobileTabBar activeTab={mobileTab} onTabChange={setMobileTab} ui={ui} />

        {/* Settings Bottom Sheet */}
        <MobileBottomSheet
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          title="Settings"
          ui={ui}
        >
          <div className="space-y-6">
            {/* Color Theme */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Color Theme</p>
                <span className={`text-xs ${ui.previewTitle}`}>{theme.name}</span>
              </div>
              <div className={`flex items-center justify-between rounded-2xl p-4 border ${ui.panelBorder} ${ui.previewBg}`}>
                <ThemeSelector themeId={themeId} onSelect={setThemeId} large />
              </div>
            </div>

            {/* Dark Mode */}
            <div className={`flex items-center justify-between rounded-2xl p-4 border ${ui.panelBorder} ${ui.previewBg}`}>
              <div>
                <p className="text-sm font-medium">Dark Mode</p>
                <p className={`text-xs mt-0.5 ${ui.previewTitle}`}>
                  {isDark ? 'Currently on' : 'Currently off'}
                </p>
              </div>
              <DarkModeToggle isDark={isDark} onToggle={toggleDark} ui={ui} />
            </div>

            {/* Diagram Theme */}
            <div className="space-y-3">
              <p className="text-sm font-medium">Diagram Theme</p>
              <DiagramThemeDropdown
                value={diagramTheme}
                onChange={(v) => { setDiagramTheme(v); }}
                ui={ui}
                autoLabel={autoLabel}
              />
            </div>
          </div>
        </MobileBottomSheet>

        {/* Export Bottom Sheet */}
        <MobileBottomSheet
          open={exportSheetOpen}
          onClose={() => setExportSheetOpen(false)}
          title="Export Diagram"
          ui={ui}
        >
          <div className="space-y-3">
            <button
              onClick={handleExportPNG}
              className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-left border transition-all active:scale-[0.98] active:opacity-80 ${ui.panelBorder} ${ui.previewBg} ${ui.dropdownText}`}
            >
              <div className={`w-11 h-11 rounded-xl ${ui.btnPrimary} flex items-center justify-center shrink-0`}>
                <Image size={20} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">PNG Image</p>
                <p className={`text-xs mt-0.5 ${ui.previewTitle}`}>High-resolution 3x scale</p>
              </div>
              <ChevronRight size={16} className="opacity-30" />
            </button>
            <button
              onClick={handleExportSVG}
              className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-left border transition-all active:scale-[0.98] active:opacity-80 ${ui.panelBorder} ${ui.previewBg} ${ui.dropdownText}`}
            >
              <div className={`w-11 h-11 rounded-xl ${ui.btnSecondary} border flex items-center justify-center shrink-0`}>
                <FileCode size={20} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">SVG Vector</p>
                <p className={`text-xs mt-0.5 ${ui.previewTitle}`}>Scalable vector graphic</p>
              </div>
              <ChevronRight size={16} className="opacity-30" />
            </button>
          </div>
        </MobileBottomSheet>
      </div>
    );
  }

  // --- DESKTOP LAYOUT ---
  return (
    <div
      className={`h-screen w-screen flex flex-col overflow-hidden font-sans transition-colors duration-200 ${ui.appBg} ${ui.appText} ${ui.selection}`}
    >
      <div className="flex-1 flex flex-row overflow-hidden">
        {/* Editor Panel — hidden in fullscreen */}
        {!isFullscreen && (
          <>
            <div className={`w-[35%] shrink-0 flex flex-col ${ui.panelBg} relative z-10 transition-colors duration-200`}>
              {/* Editor Header */}
              <div className={`h-12 border-b ${ui.panelBorder} flex items-center px-4 justify-between shrink-0 transition-colors duration-200`}>
                <div className="flex items-center gap-2.5 font-semibold text-sm tracking-tight">
                  <div className={`w-6 h-6 rounded-md ${ui.iconBg} ${ui.iconText} flex items-center justify-center`}>
                    <Code size={14} strokeWidth={2.5} />
                  </div>
                  Graphite
                </div>
                <div className="flex items-center gap-2">
                  <TemplateDropdown onSelect={setCode} currentCode={code} ui={ui} />
                  <div className={`w-px h-4 ${ui.panelBorder} border-l`} />
                  <ThemeSelector themeId={themeId} onSelect={setThemeId} />
                  <div className={`w-px h-4 ${ui.panelBorder} border-l`} />
                  <DarkModeToggle isDark={isDark} onToggle={toggleDark} ui={ui} />
                </div>
              </div>

              {/* Editor Body */}
              <div className="flex-1 overflow-hidden">
                <Editor code={code} onChange={setCode} ui={ui} isDark={isDark} errorLine={errorLine} />
              </div>
            </div>

            {/* Static Border */}
            <div className={`w-px ${ui.panelBorder} border-l transition-colors duration-200`} />
          </>
        )}

        {/* Preview Panel */}
        <div className={`flex-1 flex flex-col ${ui.previewBg} relative z-0 transition-colors duration-200`}>
          {/* Preview Header */}
          <div className={`h-12 border-b ${ui.panelBorder} flex items-center px-4 justify-between shrink-0 ${ui.previewHeaderBg} transition-colors duration-200`}>
            <span className={`text-xs font-medium uppercase tracking-wider ${ui.previewTitle} transition-colors duration-200`}>
              Preview
            </span>
            <div className="flex items-center gap-2">
              <DiagramThemeDropdown value={diagramTheme} onChange={setDiagramTheme} ui={ui} autoLabel={autoLabel} />
              <button
                onClick={handleShareLink}
                disabled={!svgContent}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium border rounded-lg transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${ui.btnSecondary}`}
              >
                {linkCopied ? <Check size={12} className="text-emerald-500" /> : <Link size={12} />}
                {linkCopied ? 'Copied' : 'Share'}
              </button>
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
              <button
                onClick={() => setIsFullscreen(prev => !prev)}
                className={`flex items-center gap-1.5 p-1.5 text-xs font-medium border rounded-lg transition-all duration-150 cursor-pointer ${ui.btnSecondary}`}
                title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen preview'}
              >
                {isFullscreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
              </button>
            </div>
          </div>

          {/* Preview Body */}
          {previewContent}
        </div>
      </div>
    </div>
  );
}

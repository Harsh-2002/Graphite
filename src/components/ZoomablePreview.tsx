import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Minus, Plus, RotateCcw, Monitor, Sun, Moon } from 'lucide-react';
import { useZoomPan, MIN_SCALE } from '../hooks/useZoomPan';
import type { UIClasses } from '../types/theme';

interface ZoomablePreviewProps {
  children: React.ReactNode;
  svgContent: string;
  ui: UIClasses;
  /** Compact zoom controls for mobile */
  compact?: boolean;
  /** Preview background override: null=auto, 'light', 'dark' */
  previewBg: 'light' | 'dark' | null;
  /** Cycle preview background: auto → light → dark → auto */
  onCyclePreviewBg: () => void;
}

export function ZoomablePreview({ children, svgContent, ui, compact, previewBg, onCyclePreviewBg }: ZoomablePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { scale, translateX, translateY, onMouseDown, zoomIn, zoomOut, setTransform } = useZoomPan(containerRef);
  const [isPanning, setIsPanning] = useState(false);

  // Fit content to viewport with 90% padding
  const fitToViewport = useCallback(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) {
      setTransform({ scale: 1, translateX: 0, translateY: 0 });
      return;
    }
    const vw = container.clientWidth;
    const vh = container.clientHeight;
    const cw = content.offsetWidth;
    const ch = content.offsetHeight;
    if (cw === 0 || ch === 0) {
      setTransform({ scale: 1, translateX: 0, translateY: 0 });
      return;
    }
    const optimalScale = Math.min(vw / cw, vh / ch) * 0.9;
    const s = Math.max(MIN_SCALE, Math.min(2, optimalScale));
    setTransform({
      scale: s,
      translateX: (vw - cw * s) / 2,
      translateY: (vh - ch * s) / 2,
    });
  }, [setTransform]);

  // Fit when diagram changes
  useEffect(() => {
    const frame = requestAnimationFrame(() => fitToViewport());
    return () => cancelAnimationFrame(frame);
  }, [svgContent, fitToViewport]);

  // Fit when container resizes (e.g. fullscreen toggle)
  // Skip the initial fire — the svgContent effect handles first render
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let skipFirst = true;
    const observer = new ResizeObserver(() => {
      if (skipFirst) { skipFirst = false; return; }
      fitToViewport();
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [fitToViewport]);

  // Track panning state for cursor (desktop only)
  useEffect(() => {
    if (compact) return;
    const handleMouseDown = () => setIsPanning(true);
    const handleMouseUp = () => setIsPanning(false);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [compact]);

  const zoomPercent = Math.round(scale * 100);

  const PreviewBgIcon = previewBg === null ? Monitor : previewBg === 'light' ? Sun : Moon;
  const previewBgTitle = previewBg === null ? 'Background: Auto' : previewBg === 'light' ? 'Background: Light' : 'Background: Dark';

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      {/* Zoomable/pannable canvas */}
      <div
        ref={containerRef}
        className="flex-1 overflow-hidden touch-none"
        onMouseDown={compact ? undefined : onMouseDown}
        style={compact ? undefined : { cursor: isPanning ? 'grabbing' : 'grab' }}
      >
        <div
          ref={contentRef}
          style={{
            transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
            transformOrigin: '0 0',
            display: 'inline-block',
          }}
        >
          {children}
        </div>
      </div>

      {/* Zoom controls */}
      <div className={`shrink-0 flex justify-center ${compact ? 'py-1.5' : 'py-2'} pointer-events-none`}>
        <div className={`pointer-events-auto flex items-center gap-0.5 px-1.5 py-1 rounded-xl border ${ui.panelBg} ${ui.panelBorder} shadow-sm`}>
          <button
            onClick={zoomOut}
            className={`${compact ? 'p-1' : 'p-1.5'} rounded-lg transition-all duration-150 cursor-pointer hover:opacity-80 active:scale-90 ${ui.btnSecondary} border-0`}
            title="Zoom out"
          >
            <Minus size={compact ? 12 : 14} />
          </button>
          <span className={`${compact ? 'text-[10px] min-w-[3rem]' : 'text-[11px] min-w-[3.5rem]'} font-mono font-medium px-1.5 text-center select-none opacity-80`}>
            {zoomPercent}%
          </span>
          <button
            onClick={zoomIn}
            className={`${compact ? 'p-1' : 'p-1.5'} rounded-lg transition-all duration-150 cursor-pointer hover:opacity-80 active:scale-90 ${ui.btnSecondary} border-0`}
            title="Zoom in"
          >
            <Plus size={compact ? 12 : 14} />
          </button>
          <button
            onClick={fitToViewport}
            className={`${compact ? 'p-1' : 'p-1.5'} rounded-lg transition-all duration-150 cursor-pointer hover:opacity-80 active:scale-90 ${ui.btnSecondary} border-0`}
            title="Fit to viewport"
          >
            <RotateCcw size={compact ? 12 : 14} />
          </button>
          <button
            onClick={onCyclePreviewBg}
            className={`${compact ? 'p-1' : 'p-1.5'} rounded-lg transition-all duration-150 cursor-pointer hover:opacity-80 active:scale-90 ${ui.btnSecondary} border-0`}
            title={previewBgTitle}
          >
            <PreviewBgIcon size={compact ? 12 : 14} />
          </button>
        </div>
      </div>
    </div>
  );
}

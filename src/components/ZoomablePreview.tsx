import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Minus, Plus, RotateCcw } from 'lucide-react';
import { useZoomPan } from '../hooks/useZoomPan';
import type { UIClasses } from '../types/theme';

interface ZoomablePreviewProps {
  children: React.ReactNode;
  svgContent: string;
  ui: UIClasses;
  /** Compact zoom controls for mobile */
  compact?: boolean;
}

export function ZoomablePreview({ children, svgContent, ui, compact }: ZoomablePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { scale, translateX, translateY, onMouseDown, zoomIn, zoomOut, setTransform } = useZoomPan(containerRef);
  const scaleRef = useRef(scale);
  scaleRef.current = scale;
  const [isPanning, setIsPanning] = useState(false);

  // Center content in viewport, preserving current scale
  const defaultScale = compact ? 0.8 : 1;
  const centerContent = useCallback((resetScale?: boolean) => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) {
      setTransform({ scale: defaultScale, translateX: 0, translateY: 0 });
      return;
    }
    const vw = container.clientWidth;
    const vh = container.clientHeight;
    const cw = content.offsetWidth;
    const ch = content.offsetHeight;
    const s = resetScale ? defaultScale : scaleRef.current;
    setTransform({
      scale: s,
      translateX: (vw - cw * s) / 2,
      translateY: (vh - ch * s) / 2,
    });
  }, [setTransform, defaultScale]);

  // Re-center at 1x when diagram changes
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      centerContent(true);
    });
    return () => cancelAnimationFrame(frame);
  }, [svgContent, centerContent]);

  // Re-center (keeping zoom level) when container resizes (e.g. fullscreen toggle)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      centerContent();
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [centerContent]);

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
            onClick={() => centerContent(true)}
            className={`${compact ? 'p-1' : 'p-1.5'} rounded-lg transition-all duration-150 cursor-pointer hover:opacity-80 active:scale-90 ${ui.btnSecondary} border-0`}
            title="Reset zoom"
          >
            <RotateCcw size={compact ? 12 : 14} />
          </button>
        </div>
      </div>
    </div>
  );
}

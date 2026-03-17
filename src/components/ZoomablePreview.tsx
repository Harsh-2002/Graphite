import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Minus, Plus, RotateCcw } from 'lucide-react';
import { useZoomPan } from '../hooks/useZoomPan';
import type { UIClasses } from '../types/theme';

interface ZoomablePreviewProps {
  children: React.ReactNode;
  svgContent: string;
  ui: UIClasses;
}

export function ZoomablePreview({ children, svgContent, ui }: ZoomablePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { scale, translateX, translateY, onMouseDown, zoomIn, zoomOut, setTransform } = useZoomPan(containerRef);
  const scaleRef = useRef(scale);
  scaleRef.current = scale;
  const [isPanning, setIsPanning] = useState(false);

  // Center content in viewport, preserving current scale
  const centerContent = useCallback((resetScale?: boolean) => {
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
    const s = resetScale ? 1 : scaleRef.current;
    setTransform({
      scale: s,
      translateX: (vw - cw * s) / 2,
      translateY: (vh - ch * s) / 2,
    });
  }, [setTransform]);

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

  // Track panning state for cursor
  useEffect(() => {
    const handleMouseDown = () => setIsPanning(true);
    const handleMouseUp = () => setIsPanning(false);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const zoomPercent = Math.round(scale * 100);

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      {/* Zoomable/pannable canvas */}
      <div
        ref={containerRef}
        className="flex-1 overflow-hidden"
        onMouseDown={onMouseDown}
        style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
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

      {/* Always-visible zoom controls — pinned to bottom */}
      <div className="shrink-0 flex justify-center py-2 pointer-events-none">
        <div className={`pointer-events-auto flex items-center gap-0.5 px-1.5 py-1 rounded-xl border ${ui.panelBg} ${ui.panelBorder} shadow-sm`}>
          <button
            onClick={zoomOut}
            className={`p-1.5 rounded-lg transition-all duration-150 cursor-pointer hover:opacity-80 ${ui.btnSecondary} border-0`}
            title="Zoom out"
          >
            <Minus size={14} />
          </button>
          <span className="text-[11px] font-mono font-medium px-2 min-w-[3.5rem] text-center select-none opacity-80">
            {zoomPercent}%
          </span>
          <button
            onClick={zoomIn}
            className={`p-1.5 rounded-lg transition-all duration-150 cursor-pointer hover:opacity-80 ${ui.btnSecondary} border-0`}
            title="Zoom in"
          >
            <Plus size={14} />
          </button>
          <button
            onClick={centerContent}
            className={`p-1.5 rounded-lg transition-all duration-150 cursor-pointer hover:opacity-80 ${ui.btnSecondary} border-0`}
            title="Reset zoom"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useRef, useCallback, useEffect } from 'react';

interface ZoomPanState {
  scale: number;
  translateX: number;
  translateY: number;
}

const MIN_SCALE = 0.1;
const MAX_SCALE = 5;

export function useZoomPan(containerRef: React.RefObject<HTMLDivElement | null>) {
  const [state, setState] = useState<ZoomPanState>({ scale: 1, translateX: 0, translateY: 0 });
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

  // Wheel zoom toward cursor
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const cursorX = e.clientX - rect.left;
      const cursorY = e.clientY - rect.top;

      setState(prev => {
        const zoomFactor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
        const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev.scale * zoomFactor));
        const ratio = newScale / prev.scale;

        return {
          scale: newScale,
          translateX: cursorX - ratio * (cursorX - prev.translateX),
          translateY: cursorY - ratio * (cursorY - prev.translateY),
        };
      });
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [containerRef]);

  // Pan handlers
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    isPanning.current = true;
    panStart.current = {
      x: e.clientX,
      y: e.clientY,
      tx: state.translateX,
      ty: state.translateY,
    };
  }, [state.translateX, state.translateY]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isPanning.current) return;
      const dx = e.clientX - panStart.current.x;
      const dy = e.clientY - panStart.current.y;
      setState(prev => ({
        ...prev,
        translateX: panStart.current.tx + dx,
        translateY: panStart.current.ty + dy,
      }));
    };

    const handleMouseUp = () => {
      isPanning.current = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const zoomIn = useCallback(() => {
    setState(prev => {
      const el = containerRef.current;
      if (!el) return prev;
      const rect = el.getBoundingClientRect();
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const newScale = Math.min(MAX_SCALE, prev.scale * 1.2);
      const ratio = newScale / prev.scale;
      return {
        scale: newScale,
        translateX: cx - ratio * (cx - prev.translateX),
        translateY: cy - ratio * (cy - prev.translateY),
      };
    });
  }, [containerRef]);

  const zoomOut = useCallback(() => {
    setState(prev => {
      const el = containerRef.current;
      if (!el) return prev;
      const rect = el.getBoundingClientRect();
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const newScale = Math.max(MIN_SCALE, prev.scale / 1.2);
      const ratio = newScale / prev.scale;
      return {
        scale: newScale,
        translateX: cx - ratio * (cx - prev.translateX),
        translateY: cy - ratio * (cy - prev.translateY),
      };
    });
  }, [containerRef]);

  const setTransform = useCallback((t: ZoomPanState) => {
    setState(t);
  }, []);

  return {
    scale: state.scale,
    translateX: state.translateX,
    translateY: state.translateY,
    isPanning: isPanning.current,
    onMouseDown,
    zoomIn,
    zoomOut,
    setTransform,
  };
}

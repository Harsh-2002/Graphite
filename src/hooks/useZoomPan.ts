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

  // Mouse pan handlers
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

  // Touch: pinch-to-zoom + one-finger pan
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let lastTouchDist = 0;
    let lastTouchMid = { x: 0, y: 0 };
    let touchPanStart = { x: 0, y: 0, tx: 0, ty: 0 };
    let isTouchPanning = false;

    const getTouchDist = (t1: Touch, t2: Touch) =>
      Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);

    const getTouchMid = (t1: Touch, t2: Touch, rect: DOMRect) => ({
      x: (t1.clientX + t2.clientX) / 2 - rect.left,
      y: (t1.clientY + t2.clientY) / 2 - rect.top,
    });

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const rect = el.getBoundingClientRect();
        lastTouchDist = getTouchDist(e.touches[0], e.touches[1]);
        lastTouchMid = getTouchMid(e.touches[0], e.touches[1], rect);
        isTouchPanning = false;
      } else if (e.touches.length === 1) {
        isTouchPanning = true;
        setState(prev => {
          touchPanStart = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY,
            tx: prev.translateX,
            ty: prev.translateY,
          };
          return prev;
        });
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const rect = el.getBoundingClientRect();
        const newDist = getTouchDist(e.touches[0], e.touches[1]);
        const newMid = getTouchMid(e.touches[0], e.touches[1], rect);

        if (lastTouchDist > 0) {
          const zoomFactor = newDist / lastTouchDist;

          setState(prev => {
            const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev.scale * zoomFactor));
            const ratio = newScale / prev.scale;
            // Zoom toward pinch midpoint + pan with midpoint movement
            const dx = newMid.x - lastTouchMid.x;
            const dy = newMid.y - lastTouchMid.y;
            return {
              scale: newScale,
              translateX: newMid.x - ratio * (newMid.x - prev.translateX) + dx,
              translateY: newMid.y - ratio * (newMid.y - prev.translateY) + dy,
            };
          });
        }

        lastTouchDist = newDist;
        lastTouchMid = newMid;
      } else if (e.touches.length === 1 && isTouchPanning) {
        e.preventDefault();
        const dx = e.touches[0].clientX - touchPanStart.x;
        const dy = e.touches[0].clientY - touchPanStart.y;
        setState(prev => ({
          ...prev,
          translateX: touchPanStart.tx + dx,
          translateY: touchPanStart.ty + dy,
        }));
      }
    };

    const handleTouchEnd = () => {
      lastTouchDist = 0;
      isTouchPanning = false;
    };

    el.addEventListener('touchstart', handleTouchStart, { passive: false });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('touchend', handleTouchEnd);
    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, [containerRef]);

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

import { RefObject, useEffect, useRef } from 'react';

interface UseConstantAutoScrollParams {
  listRef: RefObject<{ scrollToOffset: (params: { offset: number; animated?: boolean }) => void } | null>;
  enabled: boolean;
  speed: number;
  mode: 'once' | 'loop';
  direction: 'up' | 'down';
  getMaxOffset: () => number;
  onAutoScrollEnd?: () => void;
}

export function useConstantAutoScroll({
  listRef,
  enabled,
  speed,
  mode,
  direction,
  getMaxOffset,
  onAutoScrollEnd,
}: UseConstantAutoScrollParams): void {
  const offsetRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number | null>(null);
  const wasEnabledRef = useRef(false);

  useEffect(() => {
    if (!enabled) {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }

      lastFrameTimeRef.current = null;
      wasEnabledRef.current = false;

      return;
    }

    if (!wasEnabledRef.current) {
      const maxOffset = getMaxOffset();

      if (direction === 'up') {
        offsetRef.current = maxOffset;
        listRef.current?.scrollToOffset({ offset: maxOffset, animated: false });
      } else {
        offsetRef.current = 0;
        listRef.current?.scrollToOffset({ offset: 0, animated: false });
      }

      wasEnabledRef.current = true;
    }

    const tick = (time: number): void => {
      if (lastFrameTimeRef.current === null) {
        lastFrameTimeRef.current = time;
        rafRef.current = requestAnimationFrame(tick);

        return;
      }

      const deltaSeconds = (time - lastFrameTimeRef.current) / 1000;
      lastFrameTimeRef.current = time;

      const maxOffset = getMaxOffset();

      if (maxOffset <= 0) {
        rafRef.current = requestAnimationFrame(tick);

        return;
      }

      const delta = speed * deltaSeconds;

      if (direction === 'up') {
        offsetRef.current -= delta;

        if (offsetRef.current <= 0) {
          if (mode === 'loop') {
            offsetRef.current = maxOffset;
            listRef.current?.scrollToOffset({ offset: maxOffset, animated: false });
          } else {
            offsetRef.current = 0;
            listRef.current?.scrollToOffset({ offset: 0, animated: false });
            onAutoScrollEnd?.();
            rafRef.current = null;
            lastFrameTimeRef.current = null;

            return;
          }
        } else {
          listRef.current?.scrollToOffset({ offset: offsetRef.current, animated: false });
        }
      } else {
        offsetRef.current += delta;

        if (offsetRef.current >= maxOffset) {
          if (mode === 'loop') {
            offsetRef.current = 0;
            listRef.current?.scrollToOffset({ offset: 0, animated: false });
          } else {
            offsetRef.current = maxOffset;
            listRef.current?.scrollToOffset({ offset: maxOffset, animated: false });
            onAutoScrollEnd?.();
            rafRef.current = null;
            lastFrameTimeRef.current = null;

            return;
          }
        } else {
          listRef.current?.scrollToOffset({ offset: offsetRef.current, animated: false });
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }

      lastFrameTimeRef.current = null;
    };
  }, [enabled, speed, mode, direction, getMaxOffset, listRef, onAutoScrollEnd]);
}

export function useScrollMetricsRef(): {
  maxOffsetRef: RefObject<number>;
  updateScrollMetrics: (contentHeight: number, containerHeight: number) => void;
} {
  const maxOffsetRef = useRef(0);

  const updateScrollMetrics = (contentHeight: number, containerHeight: number): void => {
    maxOffsetRef.current = Math.max(0, contentHeight - containerHeight);
  };

  return { maxOffsetRef, updateScrollMetrics };
}

import { createContext, PropsWithChildren, ReactNode, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { MarkdownEngine } from '@open-webui-react-native/mobile/shared/features/markdown-view';

export interface MarkdownBenchmarkContextValue {
  markdownEngine: MarkdownEngine;
  autoScrollEnabled: boolean;
  setAutoScrollEnabled: (enabled: boolean) => void;
  autoScrollSpeed: number;
  setAutoScrollSpeed: (speed: number) => void;
  scrollToTop: () => void;
  registerScrollToTop: (handler: () => void) => () => void;
}

const DEFAULT_SPEED = 500;
const MIN_SPEED = 500;
const MAX_SPEED = 5000;

const defaultContextValue: MarkdownBenchmarkContextValue = {
  markdownEngine: 'nitro',
  autoScrollEnabled: false,
  setAutoScrollEnabled: () => undefined,
  autoScrollSpeed: DEFAULT_SPEED,
  setAutoScrollSpeed: () => undefined,
  scrollToTop: () => undefined,
  registerScrollToTop: () => () => undefined,
};

const MarkdownBenchmarkContext = createContext<MarkdownBenchmarkContextValue>(defaultContextValue);

export function MarkdownBenchmarkProvider({ children }: PropsWithChildren): ReactNode {
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(false);
  const [autoScrollSpeed, setAutoScrollSpeedState] = useState(DEFAULT_SPEED);
  const scrollToTopRef = useRef<(() => void) | null>(null);

  const scrollToTop = useCallback(() => {
    scrollToTopRef.current?.();
  }, []);

  const registerScrollToTop = useCallback((handler: () => void) => {
    scrollToTopRef.current = handler;

    return () => {
      if (scrollToTopRef.current === handler) {
        scrollToTopRef.current = null;
      }
    };
  }, []);

  const setAutoScrollSpeed = useCallback((speed: number) => {
    setAutoScrollSpeedState(Math.min(MAX_SPEED, Math.max(MIN_SPEED, speed)));
  }, []);

  const value = useMemo(
    (): MarkdownBenchmarkContextValue => ({
      markdownEngine: 'nitro',
      autoScrollEnabled,
      setAutoScrollEnabled,
      autoScrollSpeed,
      setAutoScrollSpeed,
      scrollToTop,
      registerScrollToTop,
    }),
    [autoScrollEnabled, autoScrollSpeed, setAutoScrollSpeed, scrollToTop, registerScrollToTop],
  );

  if (!__DEV__) {
    return children;
  }

  return <MarkdownBenchmarkContext.Provider value={value}>{children}</MarkdownBenchmarkContext.Provider>;
}

export function useMarkdownBenchmark(): MarkdownBenchmarkContextValue {
  const context = useContext(MarkdownBenchmarkContext);

  if (!__DEV__) {
    return defaultContextValue;
  }

  return context;
}

export { DEFAULT_SPEED, MAX_SPEED, MIN_SPEED };

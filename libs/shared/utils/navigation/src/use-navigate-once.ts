import { router } from 'expo-router';
import { useCallback, useRef } from 'react';

type NavigateArgs =
  | string
  | {
      pathname: string;
      params?: Record<string, any>;
    };

export function useNavigateOnce(delay: number = 700): (to: NavigateArgs) => void {
  const isNavigating = useRef(false);

  return useCallback(
    (to: NavigateArgs) => {
      if (isNavigating.current) return;

      isNavigating.current = true;

      if (typeof to === 'object') {
        router.push({
          pathname: to.pathname,
          params: to.params,
        });
      } else {
        router.push(to);
      }

      setTimeout(() => {
        isNavigating.current = false;
      }, delay);
    },
    [delay],
  );
}

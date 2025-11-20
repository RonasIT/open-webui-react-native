import { QueryCacheNotifyEvent } from '@tanstack/react-query';
import { useEffect } from 'react';
import { queryClient } from '../query-client';

export interface UseSubscribeToQueryCacheArgs {
  queryKey: ReadonlyArray<unknown>;
  eventType: QueryCacheNotifyEvent['type'];
  onQueryChange: () => void;
}

export const useSubscribeToQueryCache = ({
  queryKey,
  eventType,
  onQueryChange,
}: UseSubscribeToQueryCacheArgs): void => {
  const queryKeyStringify = JSON.stringify(queryKey);

  useEffect(() => {
    const subscription = queryClient.getQueryCache().subscribe((e) => {
      if (e.type === eventType && JSON.stringify(e.query.queryKey) === queryKeyStringify) {
        onQueryChange();
      }
    });

    return () => {
      subscription();
    };
  }, [queryKeyStringify, eventType, onQueryChange]);
};

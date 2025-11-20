import { Query, QueryKey } from '@tanstack/react-query';
import {
  queryClientConfig,
  queriesState$,
  queryClient,
} from '@open-web-ui-mobile-client-react-native/shared/data-access/query-client';

// NOTE: Guarantees a refetch on the first mount and further depends on staleTime
export const refetchOnMountWithStaleCheck = <
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  query: Query<TQueryFnData, TError, TData, TQueryKey>,
  staleTime: number = queryClientConfig.refetchOnMountTimeout,
): boolean => {
  const { queryKey, state } = query;
  const isRefetched = queriesState$.hasBeenRefetched(queryKey);
  const isStale = Date.now() - state.dataUpdatedAt > staleTime;

  if (!isRefetched || isStale) {
    // NOTE: By default refetch works with all cached pages
    queryClient.setQueryData(queryKey, (oldData: any) => {
      if (!oldData || !('pages' in oldData)) return oldData;

      return {
        pages: oldData.pages.slice(0, 1),
        pageParams: oldData.pageParams.slice(0, 1),
      };
    });

    queryClient.refetchQueries({ queryKey });
    if (!isRefetched) queriesState$.markAsRefetched(queryKey);
  }

  return false;
};

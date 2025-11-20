import { onlineManager, QueryClient } from '@tanstack/react-query';
import { queryClientConfig } from './config';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: queryClientConfig.gcTime,
      refetchOnMount: (query) => {
        // NOTE: Prevent refetching data on every screen mount
        if (query.meta?.shouldThrottleRefetch) {
          return Date.now() - query.state.dataUpdatedAt > queryClientConfig.refetchOnMountTimeout;
        }

        return onlineManager.isOnline();
      },
      meta: {
        // NOTE: By default persist all queries, we can disable specific queries
        persist: true,
      },
    },
  },
});

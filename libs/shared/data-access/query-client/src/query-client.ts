import { onlineManager, QueryClient } from '@tanstack/react-query';
import { HttpStatusCode, isAxiosError } from 'axios';
import { queryClientConfig } from './config';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: queryClientConfig.gcTime,
      // NOTE: A 401 is not transient, and every retry would trigger its own session check and error toast
      retry: (failureCount, error) =>
        !(isAxiosError(error) && error.response?.status === HttpStatusCode.Unauthorized) && failureCount < 3,
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

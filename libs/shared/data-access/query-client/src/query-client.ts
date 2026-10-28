import { MutationCache, onlineManager, QueryClient } from '@tanstack/react-query';
import { HttpStatusCode, isAxiosError } from 'axios';
import { queryClientConfig } from './config';

export const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    // NOTE: Safety net for offline mode, which is read-only: UI guards block writes with a toast, this catches
    // any missed one. The cache-level onMutate runs before the mutation's own onMutate, so throwing here skips
    // optimistic updates and the request itself, instead of pausing the write until reconnect.
    onMutate: () => {
      if (!onlineManager.isOnline()) {
        throw new Error('Mutations are disabled in offline mode');
      }
    },
  }),
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

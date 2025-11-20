import { observable, Observable } from '@legendapp/state';
import { QueryKey } from '@tanstack/react-query';

interface QueryState {
  refetchedQueries: Record<string, boolean>;
  hasBeenRefetched: (queryKey: QueryKey) => boolean;
  markAsRefetched: (queryKey: QueryKey) => void;
}

export const queriesState$: Observable<QueryState> = observable<QueryState>({
  refetchedQueries: {},
  hasBeenRefetched: (queryKey) => {
    const key = JSON.stringify(queryKey);

    return queriesState$.refetchedQueries[key].get() === true;
  },
  markAsRefetched: (queryKey) => {
    const key = JSON.stringify(queryKey);
    queriesState$.refetchedQueries[key].set(true);
  },
});

import { debounce } from 'lodash';
import { useCallback, useEffect, useState } from 'react';

interface UseDebouncedQueryArgs {
  delay?: number;
  initialValue?: string;
}

interface UseDebouncedQueryResult {
  query: string;
  setQuery: (newQuery: string) => void;
  debouncedQuery: string;
}

export const useDebouncedQuery = ({
  delay = 1000,
  initialValue = '',
}: UseDebouncedQueryArgs = {}): UseDebouncedQueryResult => {
  const [query, setQuery] = useState(initialValue);
  const [debouncedQuery, setDebouncedQuery] = useState(initialValue);

  const debounceQuery = useCallback(
    debounce((newQuery) => {
      setDebouncedQuery(newQuery);
    }, delay),
    [],
  );

  useEffect(() => {
    debounceQuery(query);
  }, [query, debounceQuery]);

  const setTrimmedQuery = (newQuery: string): void => setQuery(newQuery.trimStart());

  return { query, setQuery: setTrimmedQuery, debouncedQuery };
};

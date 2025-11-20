import { BaseEntity, PaginationRequest, PaginationResponse } from '@ronas-it/rtkq-entity-api';
import { useQuery, useQueryClient, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { EntityPromiseService } from '../entity-service';
import { QueriesKeys } from '../utils';

export interface UseSearchParams<
  TEntity extends BaseEntity,
  TSearchRequest extends Record<string, any> = PaginationRequest,
> extends Omit<UseQueryOptions<PaginationResponse<TEntity>, AxiosError>, 'queryKey' | 'queryFn'> {
  entityService: EntityPromiseService<TEntity, TSearchRequest>;
  queriesKeys: QueriesKeys;
  searchRequest?: TSearchRequest;
}

export function useSearch<TEntity extends BaseEntity, TSearchRequest extends Record<string, any> = PaginationRequest>({
  entityService,
  queriesKeys,
  searchRequest,
  ...restParams
}: UseSearchParams<TEntity, TSearchRequest>): UseQueryResult<PaginationResponse<TEntity>, AxiosError> {
  const queryClient = useQueryClient();
  const queryKey = queriesKeys.search(searchRequest).queryKey;

  return useQuery<PaginationResponse<TEntity>, AxiosError>({
    queryKey,
    queryFn: async () => {
      const res = await entityService.search(searchRequest as TSearchRequest);
      res.data.forEach((item) => {
        queryClient.setQueryData(queriesKeys.get(item.id).queryKey, item);
      });

      return res;
    },
    ...restParams,
  });
}

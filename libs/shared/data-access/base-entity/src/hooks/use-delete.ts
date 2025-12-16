import { BaseEntity, EntityRequest, PaginationResponse } from '@ronas-it/rtkq-entity-api';
import {
  InfiniteData,
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQueryClient,
} from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { EntityPromiseService } from '../entity-service';
import { QueriesKeys } from '../utils';

export interface UseDeleteParams<
  TEntity extends BaseEntity,
  TEntityRequest extends EntityRequest = EntityRequest,
> extends Omit<UseMutationOptions<void, AxiosError, string | number, unknown>, 'mutationFn'> {
  entityService: EntityPromiseService<TEntity>;
  entityRequest?: TEntityRequest;
  queriesKeys: QueriesKeys;
}

export function useDelete<TEntity extends BaseEntity, TEntityRequest extends EntityRequest = EntityRequest>({
  entityService,
  entityRequest,
  queriesKeys,
  ...restParams
}: UseDeleteParams<TEntity, TEntityRequest>): UseMutationResult<void, AxiosError, string | number> {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError, string | number, unknown>({
    mutationFn: (id) => entityService.delete(id),
    onSuccess: (_, id) => {
      const queryCache = queryClient.getQueryCache();

      const searchInfiniteLiveQueries = queryCache.findAll({ queryKey: queriesKeys.searchInfinite().queryKey });
      searchInfiniteLiveQueries?.forEach(({ queryKey }) => {
        queryClient.setQueryData<InfiniteData<PaginationResponse<TEntity>, unknown>>(queryKey, (prev) => {
          return {
            ...prev,
            pages: prev?.pages.map((page) => {
              return {
                ...page,
                data: page.data.filter((item) => item.id !== id),
              };
            }),
          } as InfiniteData<PaginationResponse<TEntity>, unknown>;
        });
      });

      const searchLiveQueries = queryCache.findAll({ queryKey: queriesKeys.search().queryKey });
      searchLiveQueries?.forEach(({ queryKey }) => {
        queryClient.setQueryData<PaginationResponse<TEntity>>(queryKey, (prev) =>
          prev ? { ...prev, data: prev.data.filter((item) => item.id !== id) } : prev,
        );
      });
    },
    ...restParams,
  });
}

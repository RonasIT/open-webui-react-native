import { BaseEntity, EntityPartial, EntityRequest, PaginationResponse } from '@ronas-it/rtkq-entity-api';
import {
  InfiniteData,
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQueryClient,
} from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { merge } from 'lodash-es';
import { EntityPromiseService } from '../entity-service';
import { QueriesKeys } from '../utils';

export interface UseUpdateParams<
  TEntity extends BaseEntity,
  TEntityRequest extends EntityRequest = EntityRequest,
> extends Omit<UseMutationOptions<EntityPartial<TEntity>, AxiosError, EntityPartial<TEntity>, unknown>, 'mutationFn'> {
  entityService: EntityPromiseService<TEntity>;
  queriesKeys: QueriesKeys;
  entityRequest?: TEntityRequest;
}

export function useUpdate<TEntity extends BaseEntity, TEntityRequest extends EntityRequest = EntityRequest>({
  entityService,
  queriesKeys,
  entityRequest,
  ...restParams
}: UseUpdateParams<TEntity, TEntityRequest>): UseMutationResult<
  EntityPartial<TEntity>,
  AxiosError,
  EntityPartial<TEntity>
> {
  const queryClient = useQueryClient();

  return useMutation<EntityPartial<TEntity>, AxiosError, EntityPartial<TEntity>, unknown>({
    mutationFn: (params) => entityService.update(params),
    onSuccess: (_, variables) => {
      const queryCache = queryClient.getQueryCache();

      const searchInfiniteLiveQueries = queryCache.findAll({ queryKey: queriesKeys.searchInfinite().queryKey });
      searchInfiniteLiveQueries?.forEach(({ queryKey }) => {
        queryClient.setQueryData<InfiniteData<PaginationResponse<TEntity>, unknown>>(queryKey, (prev) => {
          return {
            ...prev,
            pages: prev?.pages.map((page) => {
              return {
                ...page,
                data: page.data.map((item) => (item.id === variables.id ? merge(item, variables) : item)),
              };
            }),
          } as InfiniteData<PaginationResponse<TEntity>, unknown>;
        });
      });

      const searchLiveQueries = queryCache.findAll({ queryKey: queriesKeys.search().queryKey });
      searchLiveQueries?.forEach(({ queryKey }) => {
        queryClient.setQueryData<PaginationResponse<TEntity>>(queryKey, (prev) =>
          prev
            ? { ...prev, data: prev.data.map((item) => (item.id === variables.id ? merge(item, variables) : item)) }
            : prev,
        );
      });

      const getLiveQueries = queryCache.findAll({ queryKey: queriesKeys.get(variables.id).queryKey });
      getLiveQueries?.forEach(({ queryKey }) => {
        queryClient.setQueryData<EntityPartial<TEntity>>(queryKey, (prev) =>
          prev && prev.id === variables.id ? merge({}, prev, variables) : prev,
        );
      });
    },
    ...restParams,
  });
}

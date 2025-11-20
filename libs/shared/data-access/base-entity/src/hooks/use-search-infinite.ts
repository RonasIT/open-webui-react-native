import { BaseEntity, PaginationRequest, PaginationResponse } from '@ronas-it/rtkq-entity-api';
import {
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  UseInfiniteQueryResult,
  useQueryClient,
  InfiniteData,
} from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { omit } from 'lodash';
import { EntityPromiseService } from '../entity-service';
import { QueriesKeys } from '../utils';

export interface UseSearchInfiniteParams<
  TEntity extends BaseEntity,
  TSearchRequest extends PaginationRequest = PaginationRequest,
> extends Omit<
    UseInfiniteQueryOptions<PaginationResponse<TEntity>, AxiosError>,
    'queryKey' | 'queryFn' | 'getNextPageParam' | 'getPreviousPageParam'
  > {
  entityService: EntityPromiseService<TEntity, TSearchRequest>;
  searchRequest?: TSearchRequest;
  queriesKeys: QueriesKeys;
}

export function useSearchInfinite<
  TEntity extends BaseEntity,
  TSearchRequest extends PaginationRequest = PaginationRequest,
>({
  entityService,
  searchRequest,
  queriesKeys,
  ...restParams
}: UseSearchInfiniteParams<TEntity, TSearchRequest>): UseInfiniteQueryResult<
  InfiniteData<PaginationResponse<TEntity>>,
  AxiosError
> {
  const queryClient = useQueryClient();

  return useInfiniteQuery<PaginationResponse<TEntity>, AxiosError>({
    ...queriesKeys.searchInfinite(omit(searchRequest, 'page')),
    queryFn: async ({ pageParam = 1 }) => {
      const actualRequest = {
        ...searchRequest,
        page: pageParam,
      } as TSearchRequest;

      const response = await entityService.search(actualRequest);

      response.data.forEach((item) => {
        queryClient.setQueryData(queriesKeys.get(item.id).queryKey, item);
      });

      return response;
    },
    getNextPageParam: (lastPage) => {
      const { pagination } = lastPage || {};
      if (!pagination || pagination.currentPage >= pagination.lastPage) return undefined;

      return pagination.currentPage + 1;
    },
    getPreviousPageParam: (firstPage) => {
      const { pagination } = firstPage || {};
      if (!pagination || pagination.currentPage <= 1) return undefined;

      return pagination.currentPage - 1;
    },
    ...restParams,
  });
}

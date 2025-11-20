import { createQueryKeys, QueryKeyFactoryResult, QueryFactorySchema } from '@lukemorales/query-key-factory';
import { BaseEntity, EntityRequest, PaginationRequest } from '@ronas-it/rtkq-entity-api';
import { compact } from 'lodash-es';

export type QueriesSchema = { [query: string]: null | ((...args: Array<any>) => Array<any>) };

export type QueriesKeys = ReturnType<typeof createQueryKeys>;

// NOTE: Logic for typing custom queries
export function createQueriesKeys<
  TEntity extends BaseEntity<string | number>,
  TQuery extends QueryFactorySchema = QueryFactorySchema,
  TSearchRequest extends PaginationRequest = PaginationRequest,
  TEntityRequest extends EntityRequest = EntityRequest,
>(entityName: string, queries?: TQuery): typeof result {
  const result = createQueryKeys(entityName, {
    get: (id: TEntity['id'], entityRequest: TEntityRequest) => [id, entityRequest],
    search: (request: TSearchRequest) => compact([request]) as [TSearchRequest],
    searchInfinite: (request: TSearchRequest) => compact([request]) as [TSearchRequest],
    ...queries,
  }) as QueryKeyFactoryResult<
    string,
    {
      get: (id: TEntity['id'], entityRequest?: TEntityRequest) => [TEntity['id'], TEntityRequest];
      search: (request?: TSearchRequest) => [TSearchRequest];
      searchInfinite: (request?: TSearchRequest) => [TSearchRequest];
    }
  > &
    QueryKeyFactoryResult<string, TQuery>;

  return result;
}

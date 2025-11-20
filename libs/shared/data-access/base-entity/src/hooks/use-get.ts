import { BaseEntity, EntityRequest } from '@ronas-it/rtkq-entity-api';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { UseQueryOptions } from '@tanstack/react-query/src/types';
import { AxiosError } from 'axios';
import { EntityPromiseService } from '../entity-service';
import { QueriesKeys } from '../utils';

export interface UseGetParams<TEntity extends BaseEntity, TEntityRequest extends EntityRequest = EntityRequest>
  extends Omit<UseQueryOptions<TEntity, AxiosError>, 'queryKey' | 'queryFn'> {
  entityService: EntityPromiseService<TEntity>;
  id: TEntity['id'];
  queriesKeys: QueriesKeys;
  entityRequest?: TEntityRequest;
}

export function useGet<TEntity extends BaseEntity, TEntityRequest extends EntityRequest = EntityRequest>({
  entityService,
  id,
  queriesKeys,
  entityRequest,
  ...restParams
}: UseGetParams<TEntity, TEntityRequest>): UseQueryResult<TEntity, AxiosError> {
  return useQuery<TEntity, AxiosError>({
    ...queriesKeys.get(id, entityRequest),
    queryFn: () => entityService.get(id, entityRequest),
    ...restParams,
  });
}

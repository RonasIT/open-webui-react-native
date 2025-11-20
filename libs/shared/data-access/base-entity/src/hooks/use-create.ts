import { BaseEntity, EntityRequest } from '@ronas-it/rtkq-entity-api';
import { useMutation, UseMutationResult } from '@tanstack/react-query';
import { UseMutationOptions } from '@tanstack/react-query/src/types';
import { AxiosError } from 'axios';
import { EntityPromiseService } from '../entity-service';
import { QueriesKeys } from '../utils';

export interface UseCreateParams<TEntity extends BaseEntity, TEntityRequest extends EntityRequest = EntityRequest>
  extends Omit<UseMutationOptions<TEntity, AxiosError, TEntity, unknown>, 'mutationFn'> {
  entityService: EntityPromiseService<TEntity>;
  entityRequest?: TEntityRequest;
  queriesKeys: QueriesKeys;
}

export function useCreate<TEntity extends BaseEntity, TEntityRequest extends EntityRequest = EntityRequest>({
  entityService,
  entityRequest,
  queriesKeys,
  ...restParams
}: UseCreateParams<TEntity, TEntityRequest>): UseMutationResult<TEntity, AxiosError, TEntity> {
  return useMutation<TEntity, AxiosError, TEntity>({
    mutationFn: (params) => entityService.create(params),
    ...restParams,
  });
}

import {
  BaseEntity,
  EntityPartial,
  EntityRequest,
  PaginationRequest,
  PaginationResponse,
} from '@ronas-it/rtkq-entity-api';
import { UseQueryOptions, UseMutationOptions, UseInfiniteQueryOptions } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ClassConstructor } from 'class-transformer';
import { omit } from 'lodash-es';
import { EntityPromiseService } from './entity-service';
import {
  useSearchInfinite,
  useCreate,
  useDelete,
  useGet,
  useSearch,
  useUpdate,
  UseGetParams,
  UseSearchParams,
  UseSearchInfiniteParams,
  UseCreateParams,
  UseUpdateParams,
  UseDeleteParams,
} from './hooks';
import { QueriesKeys } from './utils';

type HookEnhancements<TEntity extends BaseEntity> = {
  useGet?: Partial<UseQueryOptions<TEntity, AxiosError>>;
  useSearch?: Partial<UseQueryOptions<PaginationResponse<TEntity>, AxiosError>>;
  useSearchInfinite?: Partial<UseInfiniteQueryOptions<PaginationResponse<TEntity>, AxiosError>>;
  useCreate?: Partial<UseMutationOptions<TEntity, AxiosError, TEntity>>;
  useUpdate?: Partial<UseMutationOptions<EntityPartial<TEntity>, AxiosError, EntityPartial<TEntity>>>;
  useDelete?: Partial<UseMutationOptions<void, AxiosError, string | number>>;
};

type Endpoint = 'get' | 'search' | 'searchInfinite' | 'create' | 'update' | 'delete';

type EndpointToHookMap = {
  get: 'useGet';
  search: 'useSearch';
  searchInfinite: 'useSearchInfinite';
  create: 'useCreate';
  update: 'useUpdate';
  delete: 'useDelete';
};

type MapEndpointsToHooks<T extends ReadonlyArray<Endpoint>> = {
  [K in keyof T]: T[K] extends Endpoint ? EndpointToHookMap[T[K]] : never;
}[number];

export interface CreateEntityApiOptions<
  TEntity extends BaseEntity,
  TSearchRequest extends Record<string, any> = PaginationRequest,
  TEntityRequest extends EntityRequest = EntityRequest,
  TEntityService extends EntityPromiseService<TEntity, TSearchRequest, TEntityRequest> = EntityPromiseService<
    TEntity,
    TSearchRequest,
    TEntityRequest
  >,
  TOmitEndpoints extends Readonly<Array<Endpoint>> = never,
> {
  entitySearchRequestConstructor?: ClassConstructor<TSearchRequest>;
  entityGetRequestConstructor?: ClassConstructor<TEntityRequest>;
  entityService: TEntityService;
  queriesKeys: QueriesKeys;
  enhanceHooks?: HookEnhancements<TEntity>;
  omitEndpoints?: TOmitEndpoints;
}

export interface EntityApi<
  TEntity extends BaseEntity,
  TSearchRequest extends PaginationRequest = PaginationRequest,
  TEntityRequest extends EntityRequest = EntityRequest,
> {
  useGet: (
    params: Omit<UseGetParams<TEntity, TEntityRequest>, 'entityService' | 'queriesKeys'>,
  ) => ReturnType<typeof useGet<TEntity, TEntityRequest>>;
  useSearch: (
    params?: Omit<UseSearchParams<TEntity, TSearchRequest>, 'entityService' | 'queriesKeys'>,
  ) => ReturnType<typeof useSearch<TEntity, TSearchRequest>>;
  useSearchInfinite: (
    params?: Omit<
      UseSearchInfiniteParams<TEntity, TSearchRequest>,
      'entityService' | 'queriesKeys' | 'initialPageParam'
    > & { initialPageParam?: number },
  ) => ReturnType<typeof useSearchInfinite<TEntity, TSearchRequest>>;
  useCreate: (
    params: Omit<UseCreateParams<TEntity, TEntityRequest>, 'entityService' | 'queriesKeys'>,
  ) => ReturnType<typeof useCreate<TEntity, TEntityRequest>>;
  useUpdate: (
    params?: Omit<UseUpdateParams<TEntity, TEntityRequest>, 'entityService' | 'queriesKeys'>,
  ) => ReturnType<typeof useUpdate<TEntity, TEntityRequest>>;
  useDelete: (params?: UseDeleteParams<TEntity, TEntityRequest>) => ReturnType<typeof useDelete>;
}

export function createEntityApi<
  TEntity extends BaseEntity,
  TSearchRequest extends PaginationRequest = PaginationRequest,
  TEntityRequest extends EntityRequest = EntityRequest,
  TEntityService extends EntityPromiseService<TEntity, TSearchRequest, TEntityRequest> = EntityPromiseService<
    TEntity,
    TSearchRequest,
    TEntityRequest
  >,
  TOmitEndpoints extends Readonly<Array<Endpoint>> = never,
>(
  options: CreateEntityApiOptions<TEntity, TSearchRequest, TEntityRequest, TEntityService, TOmitEndpoints>,
): Omit<EntityApi<TEntity, TSearchRequest, TEntityRequest>, MapEndpointsToHooks<TOmitEndpoints>> {
  const { entityService, queriesKeys, enhanceHooks = {}, omitEndpoints = [] } = options;
  const commonProps = { entityService, queriesKeys };

  const api: EntityApi<TEntity, TSearchRequest, TEntityRequest> = {
    useGet: (params) => useGet({ ...commonProps, ...params, ...enhanceHooks.useGet }),
    useSearch: (params) => useSearch({ ...commonProps, ...params, ...enhanceHooks.useSearch }),
    useSearchInfinite: (params) =>
      useSearchInfinite({ ...commonProps, initialPageParam: 1, ...params, ...enhanceHooks.useSearchInfinite }),
    useCreate: (params) => useCreate({ ...commonProps, ...params, ...enhanceHooks.useCreate }),
    useUpdate: (params) => useUpdate({ ...commonProps, ...params, ...enhanceHooks.useUpdate }),
    useDelete: (params) => useDelete({ ...commonProps, ...params, ...enhanceHooks.useDelete }),
  };

  const endpointToHookMap: EndpointToHookMap = {
    get: 'useGet',
    search: 'useSearch',
    searchInfinite: 'useSearchInfinite',
    create: 'useCreate',
    update: 'useUpdate',
    delete: 'useDelete',
  };

  const hookNamesToOmit = omitEndpoints.map((endpoint) => endpointToHookMap[endpoint]);

  return omit(api, hookNamesToOmit) as Omit<
    EntityApi<TEntity, TSearchRequest, TEntityRequest>,
    MapEndpointsToHooks<TOmitEndpoints>
  >;
}

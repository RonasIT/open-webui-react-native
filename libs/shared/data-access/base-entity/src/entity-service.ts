import { ApiService } from '@ronas-it/axios-api-client';
import {
  BaseEntity,
  createEntityInstance,
  EntityPartial,
  EntityRequest,
  PaginationRequest,
  PaginationResponse,
} from '@ronas-it/rtkq-entity-api';
import { ClassConstructor, instanceToPlain, plainToInstance } from 'class-transformer';
import { isUndefined, omitBy } from 'lodash';

export abstract class EntityPromiseService<
  TEntity extends BaseEntity,
  TSearchRequest extends Record<string, any> = PaginationRequest,
  TEntityRequest extends EntityRequest = EntityRequest,
> {
  protected endpoint: string;
  protected entityConstructor: ClassConstructor<TEntity>;
  protected entitySearchRequestConstructor: ClassConstructor<TSearchRequest>;
  protected entityGetRequestConstructor: ClassConstructor<TEntityRequest>;
  protected apiService: () => ApiService;

  constructor(options: {
    endpoint: string;
    entityConstructor: ClassConstructor<TEntity>;
    entitySearchRequestConstructor?: ClassConstructor<TSearchRequest>;
    entityGetRequestConstructor?: ClassConstructor<EntityRequest>;
    apiService: () => ApiService;
  }) {
    this.endpoint = options.endpoint;
    this.entityConstructor = options.entityConstructor;
    this.entitySearchRequestConstructor =
      options.entitySearchRequestConstructor || (PaginationRequest as ClassConstructor<any>);
    this.apiService = options.apiService;
    this.entityGetRequestConstructor = options.entityGetRequestConstructor || (EntityRequest as ClassConstructor<any>);
  }

  public async create(params: TEntity): Promise<TEntity> {
    const request = createEntityInstance(this.entityConstructor, params, {
      fromInstancePartial: true,
    });
    const response = await this.apiService().post<BaseEntity>(this.endpoint, instanceToPlain(request));

    return createEntityInstance<TEntity>(this.entityConstructor, response);
  }

  public async search(params: TSearchRequest): Promise<PaginationResponse<TEntity>> {
    const request = new this.entitySearchRequestConstructor(omitBy<TSearchRequest>(params, isUndefined));
    const response = await this.apiService().get<PaginationResponse<BaseEntity>>(
      this.endpoint,
      instanceToPlain<TSearchRequest>(request),
    );
    const { data, ...pagination } = plainToInstance(PaginationResponse, response);

    return {
      ...pagination,
      data: data.map((item) => createEntityInstance<TEntity>(this.entityConstructor, item)),
    } as PaginationResponse<TEntity>;
  }

  public async get(id: TEntity['id'], params?: TEntityRequest): Promise<TEntity> {
    const request = new this.entityGetRequestConstructor(omitBy<TEntityRequest>(params, isUndefined));
    const response = await this.apiService().get<BaseEntity>(
      `${this.endpoint}/${id}`,
      instanceToPlain<TEntityRequest>(request),
    );

    return createEntityInstance<TEntity>(this.entityConstructor, response);
  }

  public async update(params: EntityPartial<TEntity>): Promise<TEntity> {
    const updatedEntity = createEntityInstance(this.entityConstructor, params, {
      fromInstancePartial: true,
    }) as TEntity;
    const request: BaseEntity = instanceToPlain(updatedEntity) as BaseEntity;
    const response = await this.apiService().put<void | BaseEntity>(`${this.endpoint}/${request.id}`, request);

    return response ? createEntityInstance<TEntity>(this.entityConstructor, response) : updatedEntity;
  }

  public async delete(id: string | number): Promise<void> {
    return this.apiService().delete(`${this.endpoint}/${id}`);
  }

  protected notImplementedMethod(methodName: keyof EntityPromiseService<TEntity>): () => never {
    return () => {
      throw new Error(`Cannot call "${methodName}" - API method is not implemented.`);
    };
  }
}

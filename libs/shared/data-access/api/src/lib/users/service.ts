import { instanceToPlain, plainToInstance } from 'class-transformer';
import { getApiService, RequestOptions } from '@open-webui-react-native/shared/data-access/api-client';
import { EntityPromiseService } from '@open-webui-react-native/shared/data-access/base-entity';
import { ModelControlChoices } from '../ai-models/models/model-control-choices';
import { usersApiConfig } from './config';
import { SearchUsersRequest, SearchUsersResponse, UiParams, UiSettings, User, UserInfo, UserSettings } from './models';

export class UsersService extends EntityPromiseService<User> {
  constructor() {
    super({
      endpoint: usersApiConfig.versionedRoute,
      entityConstructor: User,
      apiService: getApiService,
    });
  }

  public async searchUsers(params: SearchUsersRequest): Promise<SearchUsersResponse> {
    const request = instanceToPlain<SearchUsersRequest>(new SearchUsersRequest(params));

    const response = await getApiService().get<SearchUsersResponse>(`${usersApiConfig.versionedRoute}/search`, request);

    return plainToInstance(SearchUsersResponse, response, {
      excludeExtraneousValues: true,
      enableImplicitConversion: true,
    });
  }

  public async getUserInfo(id: string): Promise<UserInfo> {
    const response = await getApiService().get<UserInfo>(`${usersApiConfig.versionedRoute}/${id}/info`);

    return plainToInstance(UserInfo, response, {
      excludeExtraneousValues: true,
      enableImplicitConversion: true,
    });
  }

  public async getUserSettings(requestOptions?: RequestOptions): Promise<UserSettings> {
    const response: UserSettings = await getApiService().get(
      `${usersApiConfig.versionedRoute}${usersApiConfig.route}/settings`,
      undefined,
      requestOptions,
    );

    return plainToInstance(UserSettings, response);
  }

  // NOTE: Without the admin's default interface settings merged in.
  public async getRawUserSettings(): Promise<UserSettings | null> {
    const response: UserSettings | null = await getApiService().get(
      `${usersApiConfig.versionedRoute}${usersApiConfig.route}/settings`,
      { raw: true },
    );

    return plainToInstance(UserSettings, response);
  }

  // NOTE: The backend replaces `ui.params` whole, so it is built from fresh raw settings.
  public async updateModelControlChoices(
    modelId: string,
    updateChoices: (choices: ModelControlChoices) => ModelControlChoices,
  ): Promise<UiParams> {
    const params = (await this.getRawUserSettings())?.ui?.params;
    const choices = updateChoices(params?.modelControls?.[modelId] ?? {});
    const updatedParams = new UiParams({ ...params, modelControls: { ...params?.modelControls, [modelId]: choices } });

    await this.updateUserSettings(new UserSettings({ ui: new UiSettings({ params: updatedParams }) }));

    return updatedParams;
  }

  // NOTE: Sends a patch: `ui` fields that are left out stay unchanged on the backend.
  public async updateUserSettings(settings: UserSettings): Promise<UserSettings> {
    await getApiService().post(
      `${usersApiConfig.versionedRoute}${usersApiConfig.route}/settings/update`,
      instanceToPlain(settings),
    );

    return settings;
  }
}

export const usersService = new UsersService();

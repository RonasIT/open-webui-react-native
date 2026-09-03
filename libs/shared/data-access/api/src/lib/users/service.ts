import { instanceToPlain, plainToInstance } from 'class-transformer';
import { getApiService } from '@open-webui-react-native/shared/data-access/api-client';
import { EntityPromiseService } from '@open-webui-react-native/shared/data-access/base-entity';
import { usersApiConfig } from './config';
import { SearchUsersRequest, SearchUsersResponse, User, UserInfo, UserSettings } from './models';

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

  public async getUserSettings(): Promise<UserSettings> {
    const response: UserSettings = await getApiService().get(
      `${usersApiConfig.versionedRoute}${usersApiConfig.route}/settings`,
    );

    return plainToInstance(UserSettings, response);
  }

  public async updateUserSettings(settings: UserSettings): Promise<UserSettings> {
    await getApiService().post(
      `${usersApiConfig.versionedRoute}${usersApiConfig.route}/settings/update`,
      instanceToPlain(settings),
    );

    return settings;
  }
}

export const usersService = new UsersService();

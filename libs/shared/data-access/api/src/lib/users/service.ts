import { plainToInstance } from 'class-transformer';
import { getApiService } from '@open-web-ui-mobile-client-react-native/shared/data-access/api-client';
import { EntityPromiseService } from '@open-web-ui-mobile-client-react-native/shared/data-access/base-entity';
import { usersApiConfig } from './config';
import { User, UserSettings } from './models';

export class UsersService extends EntityPromiseService<User> {
  constructor() {
    super({
      endpoint: usersApiConfig.versionedRoute,
      entityConstructor: User,
      apiService: getApiService,
    });
  }

  public async getUserSettings(): Promise<UserSettings> {
    const response: UserSettings = await getApiService().get(
      `${usersApiConfig.versionedRoute}${usersApiConfig.route}/settings`,
    );

    return plainToInstance(UserSettings, response);
  }
}

export const usersService = new UsersService();

import { instanceToPlain, plainToInstance } from 'class-transformer';
import { getApiService } from '@open-webui-react-native/shared/data-access/api-client';
import { groupsApiConfig } from './config';
import { GetGroupsRequest, Group } from './models';

class GroupsService {
  public async getGroups(params: GetGroupsRequest = {}): Promise<Array<Group>> {
    const request = instanceToPlain<GetGroupsRequest>(new GetGroupsRequest(params));

    const response = await getApiService().get<Array<Group>>(`${groupsApiConfig.route}/`, request);

    return response.map((item) =>
      plainToInstance(Group, item, {
        excludeExtraneousValues: true,
        enableImplicitConversion: true,
      }),
    );
  }
}

export const groupsService = new GroupsService();

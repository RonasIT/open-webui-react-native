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

  // NOTE: `GET /groups/` returns only the groups a non-admin belongs to, so a folder shared with
  // another group would render its raw id. This resolves those names one by one, the way the web
  // client does. The endpoint answers 401 for a group that no longer exists — hence
  // `skipUnauthorized`, without which an orphaned grant would sign the user out.
  public async getGroupInfo(id: string): Promise<Group> {
    const response = await getApiService().get<Group>(`${groupsApiConfig.route}/id/${id}/info`, {
      skipToast: true,
      skipUnauthorized: true,
    });

    return plainToInstance(Group, response, {
      excludeExtraneousValues: true,
      enableImplicitConversion: true,
    });
  }
}

export const groupsService = new GroupsService();

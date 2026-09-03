export const groupsApiConfig = {
  route: 'v1/groups',
  getGroupsQueryKey: (share: boolean): Array<string | boolean> => ['groups', 'get', share],
};

export const usersApiConfig = {
  versionedRoute: 'v1/users',
  route: '/user',
  getUserSettingsQueryKey: ['user-settings'],
  searchUsersQueryKeyPrefix: ['users', 'search'],
  searchUsersQueryKey: (query: string): Array<string> => ['users', 'search', query],
  getUserInfoQueryKey: (id: string): Array<string> => ['users', 'info', id],
  // NOTE: `GET v1/users/search` is capped at 30 items per page by the backend.
  usersPerPage: 30,
};

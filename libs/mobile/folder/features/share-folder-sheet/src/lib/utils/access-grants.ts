import { AccessGrant, AccessPermission, PrincipalType } from '@open-webui-react-native/shared/data-access/api';

// NOTE: The web client grants write by default and always pairs it with read.
const PERMISSIONS_BY_LEVEL: Record<AccessPermission, Array<AccessPermission>> = {
  [AccessPermission.READ]: [AccessPermission.READ],
  [AccessPermission.WRITE]: [AccessPermission.READ, AccessPermission.WRITE],
};

const createGrants = (
  principalType: PrincipalType,
  principalId: string,
  permission: AccessPermission,
): Array<AccessGrant> =>
  PERMISSIONS_BY_LEVEL[permission].map((item) => new AccessGrant({ principalType, principalId, permission: item }));

export const addAccessGrants = (
  grants: Array<AccessGrant>,
  { groupIds, userIds }: { groupIds: Array<string>; userIds: Array<string> },
): Array<AccessGrant> => {
  const principals = [
    ...groupIds.map((principalId) => ({ principalType: PrincipalType.GROUP, principalId })),
    ...userIds.map((principalId) => ({ principalType: PrincipalType.USER, principalId })),
  ];

  return [
    ...grants,
    ...principals.flatMap(({ principalType, principalId }) =>
      createGrants(principalType, principalId, AccessPermission.WRITE),
    ),
  ];
};

export const updateAccessPermission = (
  grants: Array<AccessGrant>,
  principalType: PrincipalType,
  principalId: string,
  permission: AccessPermission,
): Array<AccessGrant> => {
  let hasReplaced = false;

  return grants.flatMap((grant) => {
    if (grant.principalType !== principalType || grant.principalId !== principalId) {
      return grant;
    }

    if (hasReplaced) {
      return [];
    }

    hasReplaced = true;

    return createGrants(principalType, principalId, permission);
  });
};

export const removeAccessGrants = (
  grants: Array<AccessGrant>,
  principalType: PrincipalType,
  principalId: string,
): Array<AccessGrant> =>
  grants.filter((grant) => !(grant.principalType === principalType && grant.principalId === principalId));

import {
  AccessGrant,
  AccessPermission,
  Group,
  PrincipalType,
  UserInfo,
} from '@open-webui-react-native/shared/data-access/api';
import { AccessListItem } from '../types';

interface BuildAccessListArgs {
  grants: Array<AccessGrant>;
  groups: Array<Group>;
  users: Array<UserInfo>;
}

const getPrincipalName = (
  { principalType, principalId }: AccessGrant,
  groups: Array<Group>,
  users: Array<UserInfo>,
): string => {
  const principals = principalType === PrincipalType.GROUP ? groups : users;

  return principals.find((principal) => principal.id === principalId)?.name ?? principalId;
};

export const buildAccessList = ({ grants, groups, users }: BuildAccessListArgs): Array<AccessListItem> => {
  const items: Array<AccessListItem> = [];

  grants.forEach((grant) => {
    if (grant.principalType === PrincipalType.ANYONE) {
      return;
    }

    const existing = items.find((item) => item.id === grant.principalId && item.principalType === grant.principalType);

    if (existing) {
      if (grant.permission === AccessPermission.WRITE) {
        existing.permission = AccessPermission.WRITE;
      }

      return;
    }

    items.push({
      id: grant.principalId,
      name: getPrincipalName(grant, groups, users),
      principalType: grant.principalType,
      permission: grant.permission,
    });
  });

  return items;
};

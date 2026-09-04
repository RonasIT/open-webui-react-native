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
  unknownName: string;
}

// NOTE: A principal can stay unresolved when it has been deleted while the grant outlived it — the
// backend cleans up neither. Its row is kept so that the access list does not hide anybody who still
// has access and so that the grant can be revoked from here, but a raw uuid is no name to show.
const getPrincipalName = (
  { principalType, principalId }: AccessGrant,
  { groups, users, unknownName }: Omit<BuildAccessListArgs, 'grants'>,
): string => {
  const principals = principalType === PrincipalType.GROUP ? groups : users;

  return principals.find((principal) => principal.id === principalId)?.name ?? unknownName;
};

export const buildAccessList = ({ grants, ...principals }: BuildAccessListArgs): Array<AccessListItem> => {
  const items: Array<AccessListItem> = [];

  grants.forEach((grant) => {
    // NOTE: `anyone:*` and `user:*` are visibility grants rather than participants — the web client
    // renders them as the folder's visibility and keeps them out of the access list as well.
    if (grant.principalType === PrincipalType.ANYONE || grant.principalId === '*') {
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
      name: getPrincipalName(grant, principals),
      principalType: grant.principalType,
      permission: grant.permission,
    });
  });

  return items;
};

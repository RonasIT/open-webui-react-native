import { AccessPermission, PrincipalType } from '@open-webui-react-native/shared/data-access/api';

export interface AccessListItem {
  id: string;
  name: string;
  principalType: PrincipalType;
  permission: AccessPermission;
}

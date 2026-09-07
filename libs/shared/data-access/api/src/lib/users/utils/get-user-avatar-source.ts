import { appStorageService } from '@open-webui-react-native/shared/data-access/storage';
import { getApiUrl } from '@open-webui-react-native/shared/utils/config';
import { usersApiConfig } from '../config';

export interface UserAvatarSource {
  uri: string;
  headers: Record<string, string>;
}

// NOTE: Neither the user search nor `users/{id}/info` returns `profile_image_url`, so the avatar is
// read from the image endpoint by id — the same way the web client builds it. The endpoint requires
// the bearer token and always answers with an image: the default grey avatar when the user has none.
export const getUserAvatarSource = (userId: string): UserAvatarSource => ({
  uri: `${getApiUrl()}/api/${usersApiConfig.versionedRoute}/${userId}/profile/image`,
  headers: { Authorization: `Bearer ${appStorageService.token.get() ?? ''}` },
});

import { getApiUrl } from '@open-webui-react-native/shared/utils/config';

import { getServerImageSource, ServerImageSource } from '../../files/utils/get-server-image-source';
import { usersApiConfig } from '../config';

// NOTE: Neither the user search nor `users/{id}/info` returns `profile_image_url`, so the avatar is
// read from the image endpoint by id — the same way the web client builds it. The endpoint requires
// the bearer token and always answers with an image: the default grey avatar when the user has none.
export const getUserAvatarSource = (userId: string): ServerImageSource =>
  getServerImageSource(`${getApiUrl()}/api/${usersApiConfig.versionedRoute}/${userId}/profile/image`);

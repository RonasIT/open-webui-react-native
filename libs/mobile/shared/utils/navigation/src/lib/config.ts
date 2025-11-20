import { getLinkWithParamsGenerator } from '@open-web-ui-mobile-client-react-native/shared/utils/navigation';
import { ChatScreenParams, FolderScreenParams } from './types';

const slug = '[id]';

const prefixes = {
  chat: 'chat',
  folder: 'folder',
};

const groups = {
  auth: '(auth)',
  main: '(main)',
};

export const navigationConfig = {
  auth: {
    root: groups.auth,
    signIn: 'sign-in',
  },
  main: {
    root: groups.main,
    chat: {
      index: prefixes.chat,
      create: 'create',
      archivedChats: 'archived-chats',
      searchArchivedChats: 'search-archived-chats',
      list: 'list',
      search: 'search',
      upsertFolder: 'upsert-folder',
      view: getLinkWithParamsGenerator<ChatScreenParams>(`${prefixes.chat}/${slug}`),
    },
    folder: {
      index: prefixes.folder,
      view: getLinkWithParamsGenerator<FolderScreenParams>(`${prefixes.folder}/${slug}`),
    },
  },
};

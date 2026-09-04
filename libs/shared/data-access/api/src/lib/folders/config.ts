const folderChatListQueryKeyPrefix = ['folders', 'chat-list'];
const folderChatsQueryKeyPrefix = ['folders', 'chats'];

export const foldersApiConfig = {
  route: 'v1/folders',
  chatsRoute: 'v1/chats',
  createFolderQueryKey: ['folders', 'create'],
  updateFolderQueryKey: ['folders', 'update'],
  updateFolderAccessQueryKey: ['folders', 'update-access'],
  deleteFolderQueryKey: ['folders', 'delete'],
  getFoldersQueryKey: ['folders', 'get'],
  getSharedFoldersQueryKey: ['folders', 'shared'],
  // NOTE: Folder sharing — `/folders/shared`, `/folders/{id}/shared/chats` and the access endpoints —
  // arrived in Open WebUI 0.10.0. Nothing in `/api/config` distinguishes 0.9 from 0.10 (its
  // `enable_folders` flag is about folders themselves and has been there since 0.7.0), so the server
  // version is the only signal.
  sharingMinVersion: '0.10.0',
  getFolderChatListQueryKeyPrefix: folderChatListQueryKeyPrefix,
  getFolderChatListQueryKey: (folderId: string): Array<string> => [...folderChatListQueryKeyPrefix, folderId],
  getFolderChatsQueryKeyPrefix: folderChatsQueryKeyPrefix,
  getFolderChatsQueryKey: (folderId: string): Array<string> => [...folderChatsQueryKeyPrefix, folderId],
  getFolderQueryKey: (folderId: string): Array<string> => ['folders', 'folder', folderId],
  // NOTE: 'v1/folders/{id}/shared/chats' is capped at 10 items per page by the backend; a larger
  // value makes the infinite query stop after the first page.
  chatsPerPage: 10,
};

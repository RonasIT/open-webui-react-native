const folderChatListQueryKeyPrefix = ['folders', 'chat-list'];
const folderChatsQueryKeyPrefix = ['folders', 'chats'];

export const foldersApiConfig = {
  route: 'v1/folders',
  chatsRoute: 'v1/chats',
  createFolderQueryKey: ['folders', 'create'],
  updateFolderQueryKey: ['folders', 'update'],
  deleteFolderQueryKey: ['folders', 'delete'],
  getFoldersQueryKey: ['folders', 'get'],
  getFolderChatListQueryKeyPrefix: folderChatListQueryKeyPrefix,
  getFolderChatListQueryKey: (folderId: string): Array<string> => [...folderChatListQueryKeyPrefix, folderId],
  getFolderChatsQueryKeyPrefix: folderChatsQueryKeyPrefix,
  getFolderChatsQueryKey: (folderId: string): Array<string> => [...folderChatsQueryKeyPrefix, folderId],
  getFolderQueryKey: (folderId: string): Array<string> => ['folders', 'folder', folderId],
  chatsPerPage: 60,
};

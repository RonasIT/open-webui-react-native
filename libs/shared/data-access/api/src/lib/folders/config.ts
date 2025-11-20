export const foldersApiConfig = {
  route: 'v1/folders',
  chatsRoute: 'v1/chats',
  createFolderQueryKey: ['folders', 'create'],
  updateFolderQueryKey: ['folders', 'update'],
  deleteFolderQueryKey: ['folders', 'delete'],
  getFoldersQueryKey: ['folders', 'get'],
  getFolderChatListQueryKey: (folderId: string): Array<string> => ['folders', 'chat-list', folderId],
  getFolderChatsQueryKey: (folderId: string): Array<string> => ['folders', 'chats', folderId],
  getFolderQueryKey: (folderId: string): Array<string> => ['folders', 'folder', folderId],
  chatsPerPage: 60,
};

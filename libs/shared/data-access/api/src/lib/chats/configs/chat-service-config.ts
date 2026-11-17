const versionedRoute = 'v1/chats';

export const chatServiceConfig = {
  versionedRoute,
  listRoute: `${versionedRoute}/`,
  pinnedListRoute: `${versionedRoute}/pinned`,
  getChatRoute: (id: string): string => `${versionedRoute}/${id}`,
  route: '/chat',
  getChatListQueryKey: ['chat-list'],
  getPinnedChatListQueryKey: ['pinned-chat-list'],
  searchChatsQueryKey: ['search-chats'],
  getAllArchivedChatsQueryKey: ['archived-chats-list-all'],
  chatsPerPage: 60,
};

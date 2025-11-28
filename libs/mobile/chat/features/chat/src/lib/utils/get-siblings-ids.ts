import { History } from '@open-webui-react-native/shared/data-access/api';

export const getSiblingsIds = (history: History, messageId: string): Array<string> =>
  history.messages[messageId].parentId
    ? (history.messages[history.messages?.[messageId]?.parentId]?.childrenIds ?? [])
    : (Object.values(history.messages)
        .filter((message) => message.parentId === null)
        .map((message) => message.id) ?? []);

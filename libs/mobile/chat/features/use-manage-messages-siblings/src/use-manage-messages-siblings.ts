import { get, indexOf, last, max, min, values } from 'lodash-es';
import { useCallback } from 'react';
import {
  History as ChatHistory,
  createMessagesList,
  Message,
  patchChatWithSelectedMessages,
} from '@open-webui-react-native/shared/data-access/api';

export interface UseSiblingMessagesReturn {
  showPreviousSibling: (message: Message) => void;
  showNextSibling: (message: Message) => void;
  getSiblingsInfo: (message: Message) => {
    siblings: Array<string>;
    currentIndex: number;
    hasSiblings: boolean;
  };
}

export function useManageMessageSiblings(chatId: string, history?: ChatHistory): UseSiblingMessagesReturn {
  const findLastDescendant = useCallback(
    (messageId: string): string => {
      if (!history?.messages) return messageId;

      let currentId = messageId;
      let childrenIds = get(history.messages[currentId], 'childrenIds', []);

      while (childrenIds.length) {
        currentId = last(childrenIds) as string;
        childrenIds = get(history.messages[currentId], 'childrenIds', []);
      }

      return currentId;
    },
    [history],
  );

  const navigateSibling = useCallback(
    (message: Message, direction: 'prev' | 'next') => {
      if (!history?.messages) return;

      const isPrev = direction === 'prev';
      const siblings = getOrderedSiblingIds(message.parentId ?? null);

      const currentIndex = indexOf(siblings, message.id);
      const targetIndex = isPrev ? max([currentIndex - 1, 0]) : min([currentIndex + 1, siblings.length - 1]);
      const targetId = siblings[targetIndex!];

      if (targetId === message.id) return;

      const newCurrentId = findLastDescendant(targetId);
      const newMessages = createMessagesList(history, newCurrentId);
      patchChatWithSelectedMessages(chatId, newCurrentId, newMessages);
    },
    [history, findLastDescendant, chatId],
  );

  const getSiblingsInfo = useCallback(
    (message: Message) => {
      if (!history?.messages) return { siblings: [], currentIndex: -1, hasSiblings: false };

      const siblings = getOrderedSiblingIds(message.parentId ?? null);

      const currentIndex = indexOf(siblings, message.id);

      return {
        siblings,
        currentIndex,
        hasSiblings: siblings.length > 1,
      };
    },
    [history],
  );

  const getOrderedSiblingIds = useCallback(
    (parentId: string | null): Array<string> => {
      if (!history?.messages) return [];

      return values(history.messages)
        .filter((msg) => msg.parentId === parentId)
        .sort(
          (a, b) => (a.timestamp !== b.timestamp ? a.timestamp - b.timestamp : a.id.localeCompare(b.id)), // safety fallback
        )
        .map((msg) => msg.id);
    },
    [history],
  );

  return {
    showPreviousSibling: (msg) => navigateSibling(msg, 'prev'),
    showNextSibling: (msg) => navigateSibling(msg, 'next'),
    getSiblingsInfo,
  };
}

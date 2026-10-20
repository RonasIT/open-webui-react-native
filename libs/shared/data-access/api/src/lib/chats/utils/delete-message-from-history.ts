import { last } from 'lodash-es';
import { History, Message } from '../models';

// NOTE: Same algorithm as the backend and the web client: the message
// and its direct replies are removed, their replies are re-attached to the message's parent, and the branch
// that follows the parent's last child becomes current.
export const deleteMessageFromHistory = (history: History, messageId: string): History => {
  const message = history.messages[messageId];

  if (!message) {
    return history;
  }

  const messages = { ...history.messages };
  const parentId = message.parentId ?? null;
  const childIds = (message.childrenIds ?? []).filter((id) => messages[id]);
  const grandchildIds = childIds.flatMap((id) =>
    (messages[id].childrenIds ?? []).filter((childId) => messages[childId]),
  );

  if (parentId && messages[parentId]) {
    const parent = messages[parentId];
    const parentChildIds = (parent.childrenIds ?? []).filter((id) => id !== messageId);

    messages[parentId] = new Message({ ...parent, childrenIds: [...parentChildIds, ...grandchildIds] });
  }

  grandchildIds.forEach((id) => {
    messages[id] = new Message({ ...messages[id], parentId });
  });

  [messageId, ...childIds].forEach((id) => delete messages[id]);

  let currentId = parentId;
  let nextIds = parentId
    ? (messages[parentId]?.childrenIds ?? [])
    : Object.keys(messages).filter((id) => !messages[id].parentId);
  const visitedIds = new Set<string>();

  while (nextIds.length && !visitedIds.has(last(nextIds) as string)) {
    currentId = last(nextIds) as string;
    visitedIds.add(currentId);
    nextIds = messages[currentId]?.childrenIds ?? [];
  }

  return new History({ messages, currentId: (currentId && messages[currentId] ? currentId : null) as string });
};

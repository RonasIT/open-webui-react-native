import { observe } from '@legendapp/state';
import { onlineManager } from '@tanstack/react-query';
import { HttpStatusCode, isAxiosError } from 'axios';
import { AppState, type AppStateStatus } from 'react-native';
import { authState$ } from '@open-webui-react-native/shared/data-access/auth';
import { MessageSource } from '@open-webui-react-native/shared/data-access/common';
import { Message } from '../models';
import { handleCompletedChat } from './handle-completed-chat';

interface PendingCompletedChatSave {
  message: string;
  sources?: Array<MessageSource>;
  output?: Message['output'];
}

const pendingByChatId = new Map<string, PendingCompletedChatSave>();

let isListening = false;
let isFlushing = false;
let retryTimer: ReturnType<typeof setTimeout> | undefined;

const isSessionGone = (error: unknown): boolean =>
  isAxiosError(error) && error.response?.status === HttpStatusCode.Unauthorized;

const canFlush = (): boolean =>
  authState$.isAuthenticated.get() && onlineManager.isOnline() && AppState.currentState === 'active';

const queuePending = (chatId: string, pending: PendingCompletedChatSave): void => {
  pendingByChatId.set(chatId, pending);
  ensureRetryListeners();
  scheduleRetry();
};

const scheduleRetry = (): void => {
  if (retryTimer !== undefined || pendingByChatId.size === 0) {
    return;
  }

  // NOTE: A 520 or short blip while already active still needs another attempt; foreground/online
  // listeners alone only fire on a transition.
  retryTimer = setTimeout(() => {
    retryTimer = undefined;
    void flushPendingCompletedChatSaves();
  }, 2_000);
};

const ensureRetryListeners = (): void => {
  if (isListening) {
    return;
  }

  isListening = true;

  // NOTE: Drop queued saves on logout so a later sign-in cannot POST another account's chat id.
  observe(() => {
    if (!authState$.isAuthenticated.get()) {
      pendingByChatId.clear();
    }
  });

  AppState.addEventListener('change', (status: AppStateStatus) => {
    if (status === 'active') {
      void flushPendingCompletedChatSaves();
    }
  });

  onlineManager.subscribe((isOnline) => {
    if (isOnline) {
      void flushPendingCompletedChatSaves();
    }
  });
};

const flushPendingCompletedChatSaves = async (): Promise<void> => {
  if (isFlushing || pendingByChatId.size === 0) {
    return;
  }

  if (!authState$.isAuthenticated.get()) {
    pendingByChatId.clear();

    return;
  }

  if (!canFlush()) {
    return;
  }

  isFlushing = true;

  try {
    for (const [chatId, pending] of [...pendingByChatId]) {
      if (!canFlush()) {
        break;
      }

      try {
        const result = await handleCompletedChat(pending.message, chatId, pending.sources, pending.output);

        if (result === 'not-ready') {
          scheduleRetry();
          break;
        }

        pendingByChatId.delete(chatId);
      } catch (error) {
        if (isSessionGone(error)) {
          pendingByChatId.delete(chatId);
          continue;
        }

        scheduleRetry();
        break;
      }
    }
  } finally {
    isFlushing = false;
  }
};

// NOTE: Never rejects. The socket completion handler is fire-and-forget; a failed POST must not
// become an unhandled rejection, and the same payload is retried when the app is active and online.
export const persistCompletedChat = async (
  message: string,
  chatId: string,
  sources?: Array<MessageSource>,
  output?: Message['output'],
): Promise<void> => {
  if (!authState$.isAuthenticated.get()) {
    pendingByChatId.clear();

    return;
  }

  try {
    const result = await handleCompletedChat(message, chatId, sources, output);

    if (result === 'saved' || result === 'skipped') {
      pendingByChatId.delete(chatId);

      return;
    }

    queuePending(chatId, { message, sources, output });
  } catch (error) {
    if (isSessionGone(error)) {
      pendingByChatId.delete(chatId);

      return;
    }

    queuePending(chatId, { message, sources, output });
  }
};

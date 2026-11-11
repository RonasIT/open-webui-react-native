import * as Sentry from '@sentry/react-native';
import { onlineManager } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { AppState } from 'react-native';
import { chatService, foldersService, GetChatListRequest } from '@open-webui-react-native/shared/data-access/api';
import { authState$ } from '@open-webui-react-native/shared/data-access/auth';
import { localDbService } from '@open-webui-react-native/shared/data-access/local-db';

const concurrency = 2;
// NOTE: What gets stored locally is decided by chatService and foldersService; the sync only drives
// them in the background and removes the chats the server no longer lists.
// NOTE: No default timeout: a hung request would keep isRunning set and block every later sync.
const background = { timeout: 30 * 1000 };
const chatListBackground = { timeout: 60 * 1000 };
const completedRunSyncIntervalMs = 60 * 1000;

// NOTE: Request failures (offline, server error) are expected; anything else is a bug.
const captureUnexpectedError = (error: unknown, operation: string): void => {
  if (isAxiosError(error)) {
    return;
  }

  Sentry.withScope((scope) => {
    scope.setTag('chat-sync.operation', operation);
    Sentry.captureException(error);
  });
};

class ChatSyncService {
  private isRunning = false;
  private isRerunRequested = false;
  // NOTE: Set only when every stale chat was attempted (failed ones count), not when canContinue stopped the run.
  private lastCompletedRunAt = 0;

  // NOTE: Never rejects; a stopped or failed run is resumed by the next call (stale chats stay stale).
  public async sync(): Promise<void> {
    if (this.isRunning) {
      this.isRerunRequested = true;

      return;
    }

    if (!this.canRun()) {
      return;
    }

    this.isRunning = true;

    try {
      await this.run();
    } catch (error) {
      captureUnexpectedError(error, 'run');
    } finally {
      this.isRunning = false;
    }

    if (this.isRerunRequested) {
      this.isRerunRequested = false;
      await this.syncIfDue();
    }
  }

  // NOTE: Skipped within a minute after a completed run; a stopped run resumes right away.
  public async syncIfDue(): Promise<void> {
    if (Date.now() - this.lastCompletedRunAt < completedRunSyncIntervalMs) {
      return;
    }

    await this.sync();
  }

  private canRun(): boolean {
    return authState$.isAuthenticated.get() && onlineManager.isOnline() && AppState.currentState !== 'background';
  }

  private canContinue(generation: number): boolean {
    return generation === localDbService.getGeneration() && this.canRun();
  }

  private async run(): Promise<void> {
    const startedAt = Date.now();
    const generation = localDbService.getGeneration();

    // NOTE: Seconds, like created_at; chats created after this are not in the list yet and are kept.
    const listRequestedAt = Math.floor(Date.now() / 1000);
    // NOTE: Without `page` the server returns all non-archived chats. The services queue their writes,
    // and the DB runs them in order, so the deletion and the stale-chat read below see the fresh list.
    const [chats] = await Promise.all([
      chatService.fetchChatList(
        new GetChatListRequest({ includeFolders: true, includePinned: true }),
        chatListBackground,
      ),
      chatService.fetchPinnedChatList(background),
      foldersService.fetchFolders(background),
    ]);

    const maxCreatedAt = chats.reduce((max, chat) => Math.max(max, chat.created_at), listRequestedAt);
    const deletedCount = await localDbService.deleteChatsNotIn(
      chats.map(({ id }) => id),
      maxCreatedAt,
      generation,
    );

    // NOTE: Only saves requests: chatService would not store a chat with a streaming reply anyway.
    const activeChatIds = new Set(chats.filter(({ active }) => active).map(({ id }) => id));
    const staleChatIds = (await localDbService.getStaleChatIds()).filter((id) => !activeChatIds.has(id));
    let nextIndex = 0;
    let syncedCount = 0;
    let failedCount = 0;

    const syncNextChats = async (): Promise<void> => {
      while (nextIndex < staleChatIds.length && this.canContinue(generation)) {
        const id = staleChatIds[nextIndex++];

        try {
          await chatService.fetchChat(id, background);
          syncedCount++;
        } catch (error) {
          captureUnexpectedError(error, 'syncChat');
          failedCount++;
        }
      }
    };

    await Promise.all(Array.from({ length: concurrency }, syncNextChats));

    if (nextIndex === staleChatIds.length) {
      this.lastCompletedRunAt = Date.now();
    }

    if (__DEV__) {
      const sizeInBytes = await localDbService.getSizeInBytes();
      console.log(
        `[chat-sync] ${Date.now() - startedAt} ms, synced: ${syncedCount}, failed: ${failedCount}, ` +
          `deleted: ${deletedCount}, left: ${staleChatIds.length - nextIndex}, DB size: ${sizeInBytes} bytes`,
      );
    }
  }
}

export const chatSyncService = new ChatSyncService();

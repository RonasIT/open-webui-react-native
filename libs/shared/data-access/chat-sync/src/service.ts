import * as Sentry from '@sentry/react-native';
import { onlineManager } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { instanceToPlain } from 'class-transformer';
import { AppState } from 'react-native';
import {
  chatServiceConfig,
  foldersApiConfig,
  GetChatListRequest,
} from '@open-webui-react-native/shared/data-access/api';
import { getApiService } from '@open-webui-react-native/shared/data-access/api-client';
import { authState$ } from '@open-webui-react-native/shared/data-access/auth';
import {
  LocalChat,
  LocalChatListItem,
  localDbService,
  LocalFolder,
  ServerChatListItem,
} from '@open-webui-react-native/shared/data-access/local-db';

const concurrency = 2;
// NOTE: Background requests: a failure must not show a toast or reach Sentry.
const silentParams = { skipToast: true, skipSentryReport: true };
// NOTE: No default timeout: a hung request would keep isRunning set and block every later sync.
const requestOptions = { timeout: 30 * 1000 };
const chatListRequestOptions = { timeout: 60 * 1000 };
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
    const apiService = getApiService();
    const listRequest = instanceToPlain(new GetChatListRequest({ includeFolders: true, includePinned: true }), {
      exposeUnsetFields: false,
    });

    // NOTE: Seconds, like created_at; chats created after this are not in the list yet and are kept.
    const listRequestedAt = Math.floor(Date.now() / 1000);
    // NOTE: Without `page` the server returns all non-archived chats.
    const [chats, pinnedChats, folders] = await Promise.all([
      apiService.get<Array<ServerChatListItem>>(
        chatServiceConfig.listRoute,
        { ...listRequest, ...silentParams },
        chatListRequestOptions,
      ),
      apiService.get<Array<LocalChatListItem>>(chatServiceConfig.pinnedListRoute, silentParams, requestOptions),
      apiService.get<Array<LocalFolder>>(foldersApiConfig.listRoute, silentParams, requestOptions),
    ]);

    await localDbService.upsertChatListItems(chats, generation);
    await localDbService.setPinnedChatIds(
      pinnedChats.map(({ id }) => id),
      generation,
    );
    await localDbService.replaceFolders(folders, generation);
    const maxCreatedAt = chats.reduce((max, chat) => Math.max(max, chat.created_at), listRequestedAt);
    const deletedCount = await localDbService.deleteChatsNotIn(
      chats.map(({ id }) => id),
      maxCreatedAt,
      generation,
    );

    const activeChatIds = new Set(chats.filter(({ active }) => active).map(({ id }) => id));
    const staleChatIds = (await localDbService.getStaleChatIds()).filter((id) => !activeChatIds.has(id));
    let nextIndex = 0;
    let syncedCount = 0;
    let failedCount = 0;

    const syncNextChats = async (): Promise<void> => {
      while (nextIndex < staleChatIds.length && this.canContinue(generation)) {
        const id = staleChatIds[nextIndex++];

        try {
          const chat = await apiService.get<LocalChat>(
            chatServiceConfig.getChatRoute(id),
            silentParams,
            requestOptions,
          );
          await localDbService.upsertChat(chat, generation);
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

import { createEntityInstance, EntityPartial } from '@ronas-it/rtkq-entity-api';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { mapValues } from 'lodash-es';
import { getApiService } from '@open-webui-react-native/shared/data-access/api-client';
import { EntityPromiseService } from '@open-webui-react-native/shared/data-access/base-entity';
import { Role } from '@open-webui-react-native/shared/data-access/common';
import {
  LocalChat,
  LocalChatListItem,
  localDbService,
  ServerChatListItem,
} from '@open-webui-react-native/shared/data-access/local-db';
import { queryClient } from '@open-webui-react-native/shared/data-access/query-client';
import { authApiConfig } from '../auth/config';
import { SignInResponse } from '../auth/models/sign-in-response';
import { chatServiceConfig } from './configs';
import {
  ChatListItem,
  ChatResponse,
  CompleteChatRequest,
  CompleteChatResponse,
  CreateNewChatRequest,
  GetArchivedChatListRequest,
  GetChatListRequest,
  Message,
  MoveChatToFolderRequest,
  ResolveToolCallRequest,
  SearchChatListRequest,
  ShareChatResponse,
} from './models';
import { BackgroundRequestOptions, getBackgroundRequestConfig } from './utils/background-request';
import { prepareOutputForSave } from './utils/prepare-output-for-save';

// NOTE: Converts on a copy — the query cache must keep the parsed `output` shape.
const prepareChatForSave = (entity: ChatResponse): Record<string, unknown> => {
  const { chat } = entity;

  if (!chat) {
    return { ...entity };
  }

  const withSavableOutput = (message: Message): Message => ({
    ...message,
    output: prepareOutputForSave(message.output),
  });

  return {
    ...entity,
    chat: {
      ...chat,
      messages: chat.messages?.map(withSavableOutput),
      history: chat.history && {
        ...chat.history,
        messages: chat.history.messages && mapValues(chat.history.messages, withSavableOutput),
      },
    },
  };
};

// NOTE: Mirrors the backend `active` flag of the chat list: an assistant message with `done: false`
// is still streaming, and storing it would save a partial reply.
const isChatStreaming = (chat: LocalChat): boolean => {
  const messages = (chat.chat as { history?: { messages?: Record<string, { role?: string; done?: boolean }> } })
    ?.history?.messages;

  return Object.values(messages ?? {}).some(({ role, done }) => role === Role.ASSISTANT && done === false);
};

// NOTE: The single place deciding which chats are stored locally: every request that returns a chat goes
// through it, the background sync included. A chat from a folder shared with the user belongs to another
// user, and a chat with a reply still streaming is stored once the reply is complete.
export const saveChatLocally = (chat: LocalChat, generation: number): Promise<void> => {
  const profile = queryClient.getQueryData<SignInResponse>(authApiConfig.getProfileQueryKey);

  if (!profile || chat.user_id !== profile.id || isChatStreaming(chat)) {
    return Promise.resolve();
  }

  return localDbService.upsertChat(chat, generation);
};

export class ChatService extends EntityPromiseService<ChatResponse> {
  constructor() {
    super({
      endpoint: chatServiceConfig.versionedRoute,
      entityConstructor: ChatResponse,
      apiService: getApiService,
    });
  }

  public async get(id: string): Promise<ChatResponse> {
    const response = await this.fetchChat(id);

    return createEntityInstance<ChatResponse>(ChatResponse, response);
  }

  // NOTE: Raw server JSON; the background sync calls it directly, so the local DB rules stay in this service.
  public async fetchChat(id: string, background?: BackgroundRequestOptions): Promise<LocalChat> {
    const { params, options } = getBackgroundRequestConfig(background);
    const generation = localDbService.getGeneration();
    const response = await getApiService().get<LocalChat>(chatServiceConfig.getChatRoute(id), params, options);
    const saving = saveChatLocally(response, generation);

    // NOTE: The sync waits for the write so it does not outrun the DB queue; a screen does not.
    if (background) {
      await saving;
    }

    return response;
  }

  public async getChatList(params: GetChatListRequest): Promise<Array<ChatListItem>> {
    const response = await this.fetchChatList(params);

    const data = response.map((item) =>
      plainToInstance(ChatListItem, item, {
        excludeExtraneousValues: true,
        enableImplicitConversion: true,
      }),
    );

    return data;
  }

  // NOTE: Raw server JSON; the background sync calls it directly, so the local DB rules stay in this service.
  public async fetchChatList(
    params: GetChatListRequest,
    background?: BackgroundRequestOptions,
  ): Promise<Array<ServerChatListItem>> {
    const request = instanceToPlain(new GetChatListRequest(params), { exposeUnsetFields: false });
    const { params: backgroundParams, options } = getBackgroundRequestConfig(background);
    const generation = localDbService.getGeneration();
    const response = await getApiService().get<Array<ServerChatListItem>>(
      chatServiceConfig.listRoute,
      { ...request, ...backgroundParams },
      options,
    );
    void localDbService.upsertChatListItems(response, generation);

    return response;
  }

  public async getPinnedChatList(): Promise<Array<ChatListItem>> {
    const response = await this.fetchPinnedChatList();

    const data = response.map((item) =>
      plainToInstance(ChatListItem, item, {
        excludeExtraneousValues: true,
        enableImplicitConversion: true,
      }),
    );

    return data;
  }

  // NOTE: Raw server JSON; the background sync calls it directly, so the local DB rules stay in this service.
  public async fetchPinnedChatList(background?: BackgroundRequestOptions): Promise<Array<LocalChatListItem>> {
    const { params, options } = getBackgroundRequestConfig(background);
    const generation = localDbService.getGeneration();
    const response = await getApiService().get<Array<LocalChatListItem>>(
      chatServiceConfig.pinnedListRoute,
      params,
      options,
    );
    // NOTE: The default chat list excludes pinned chats, so their rows are created here.
    void localDbService.upsertChatListItems(response, generation);
    void localDbService.setPinnedChatIds(
      response.map((item) => item.id),
      generation,
    );

    return response;
  }

  public async searchChatList(params: SearchChatListRequest): Promise<Array<ChatListItem>> {
    const request = instanceToPlain<SearchChatListRequest>(params);
    const response = await getApiService().get<Array<ChatListItem>>(
      `${chatServiceConfig.versionedRoute}/search`,
      request,
    );

    const data = response.map((item) =>
      plainToInstance(ChatListItem, item, {
        excludeExtraneousValues: true,
        enableImplicitConversion: true,
      }),
    );

    return data;
  }

  public async update(params: EntityPartial<ChatResponse>): Promise<ChatResponse> {
    const updatedEntity = createEntityInstance(ChatResponse, params, {
      fromInstancePartial: true,
    });

    const generation = localDbService.getGeneration();
    const response = await getApiService().post<LocalChat>(
      `${this.endpoint}/${updatedEntity.id}`,
      prepareChatForSave(updatedEntity),
    );
    void saveChatLocally(response, generation);

    return createEntityInstance<ChatResponse>(ChatResponse, response);
  }

  public async updateChatFolder(params: MoveChatToFolderRequest): Promise<ChatResponse> {
    const request = instanceToPlain<MoveChatToFolderRequest>(new MoveChatToFolderRequest(params));

    const generation = localDbService.getGeneration();
    const response = await getApiService().post<LocalChat>(`${this.endpoint}/${request.id}/folder`, request);
    void saveChatLocally(response, generation);

    return createEntityInstance<ChatResponse>(ChatResponse, response);
  }

  public async pinChat(chatId: string): Promise<ChatResponse> {
    const generation = localDbService.getGeneration();
    // NOTE: The response carries the toggled `pinned`, so the local row stays consistent with the pinned list.
    const response = await getApiService().post<LocalChat>(`${this.endpoint}/${chatId}/pin`);
    void saveChatLocally(response, generation);

    return createEntityInstance<ChatResponse>(ChatResponse, response);
  }

  public async cloneChat({ chatId, title }: { chatId: string; title: string }): Promise<ChatResponse> {
    const generation = localDbService.getGeneration();
    const response = await getApiService().post<LocalChat>(`${this.endpoint}/${chatId}/clone`, { title });
    void saveChatLocally(response, generation);

    return createEntityInstance<ChatResponse>(ChatResponse, response);
  }

  public async createNewChat(params: CreateNewChatRequest): Promise<ChatResponse> {
    const request = instanceToPlain<CreateNewChatRequest>(params);

    const generation = localDbService.getGeneration();
    const response = await getApiService().post<LocalChat>(`${chatServiceConfig.versionedRoute}/new`, request);
    void saveChatLocally(response, generation);

    return createEntityInstance(ChatResponse, response);
  }

  public async delete(id: string): Promise<void> {
    const generation = localDbService.getGeneration();
    await super.delete(id);
    void localDbService.deleteChat(id, generation);
  }

  public async completeChat(params: CompleteChatRequest): Promise<CompleteChatResponse> {
    const request = instanceToPlain<CompleteChatRequest>(params);

    const response = await getApiService().post<CompleteChatResponse>(
      `${chatServiceConfig.route}/completions`,
      request,
    );

    return plainToInstance(CompleteChatResponse, response);
  }

  public async resolveToolCall(chatId: string, messageId: string, params: ResolveToolCallRequest): Promise<void> {
    const request = instanceToPlain<ResolveToolCallRequest>(params);

    await getApiService().post<void>(
      `${chatServiceConfig.versionedRoute}/${chatId}/messages/${messageId}/resolve`,
      request,
    );
  }

  public async deleteMessage(chatId: string, messageId: string): Promise<ChatResponse> {
    const generation = localDbService.getGeneration();
    const response = await getApiService().delete<LocalChat>(
      `${chatServiceConfig.versionedRoute}/${chatId}/messages/${messageId}`,
    );
    void saveChatLocally(response, generation);

    return createEntityInstance<ChatResponse>(ChatResponse, response);
  }

  public async shareChat(chatId: string): Promise<ShareChatResponse> {
    const response = await getApiService().post<ShareChatResponse>(
      `${chatServiceConfig.versionedRoute}/${chatId}/share`,
    );

    return plainToInstance(ShareChatResponse, response);
  }

  public async deleteShareChatLink(chatId: string): Promise<void> {
    await getApiService().delete<void>(`${chatServiceConfig.versionedRoute}/${chatId}/share`);
  }

  public async archiveChat(chatId: string): Promise<ChatResponse> {
    const generation = localDbService.getGeneration();
    const response = await getApiService().post<LocalChat>(`${chatServiceConfig.versionedRoute}/${chatId}/archive`);

    // NOTE: The endpoint toggles the flag (unarchive too); archived chats are not part of the synced list.
    if (response.archived) {
      void localDbService.deleteChat(chatId, generation);
    } else {
      void saveChatLocally(response, generation);
    }

    return createEntityInstance<ChatResponse>(ChatResponse, response);
  }

  public async getArchivedChatList(params: GetArchivedChatListRequest): Promise<Array<ChatListItem>> {
    const instance = new GetArchivedChatListRequest(params);
    const request = instanceToPlain<GetArchivedChatListRequest>(instance);

    const response = await getApiService().get<Array<ChatListItem>>(
      `${chatServiceConfig.versionedRoute}/archived`,
      request,
    );

    const data = response.map((item) =>
      plainToInstance(ChatListItem, item, {
        excludeExtraneousValues: true,
        enableImplicitConversion: true,
      }),
    );

    return data;
  }

  public async getAllArchivedChats(): Promise<Array<ChatListItem>> {
    const response = await getApiService().get<Array<ChatListItem>>(`${chatServiceConfig.versionedRoute}/all/archived`);

    return response.map((item) =>
      plainToInstance(ChatListItem, item, {
        excludeExtraneousValues: true,
        enableImplicitConversion: true,
      }),
    );
  }

  // NOTE: Archived chats are not part of the synced list, so they leave the local DB like deleted ones.
  public async archiveAllChats(): Promise<void> {
    const generation = localDbService.getGeneration();
    await getApiService().post<void>(`${chatServiceConfig.versionedRoute}/archive/all`);
    void localDbService.deleteAllChats(generation);
  }

  public async deleteAllChats(): Promise<void> {
    const generation = localDbService.getGeneration();
    await getApiService().delete<void>(`${chatServiceConfig.versionedRoute}/`);
    void localDbService.deleteAllChats(generation);
  }
}

export const chatService = new ChatService();

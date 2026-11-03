import { createEntityInstance, EntityPartial } from '@ronas-it/rtkq-entity-api';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { mapValues } from 'lodash-es';
import { getApiService } from '@open-webui-react-native/shared/data-access/api-client';
import { EntityPromiseService } from '@open-webui-react-native/shared/data-access/base-entity';
import { LocalChat, LocalChatListItem, localDbService } from '@open-webui-react-native/shared/data-access/local-db';
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

// NOTE: A chat from a folder shared with the user belongs to another user and is not stored locally.
const saveOwnChatLocally = (chat: LocalChat, generation: number): void => {
  const profile = queryClient.getQueryData<SignInResponse>(authApiConfig.getProfileQueryKey);

  if (profile && chat.user_id === profile.id) {
    void localDbService.upsertChat(chat, generation);
  }
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
    const generation = localDbService.getGeneration();
    const response = await getApiService().get<LocalChat>(chatServiceConfig.getChatRoute(id));
    saveOwnChatLocally(response, generation);

    return createEntityInstance<ChatResponse>(ChatResponse, response);
  }

  public async getChatList(params: GetChatListRequest): Promise<Array<ChatListItem>> {
    const request = instanceToPlain(new GetChatListRequest(params), { exposeUnsetFields: false });
    const generation = localDbService.getGeneration();
    const response = await getApiService().get<Array<LocalChatListItem>>(chatServiceConfig.listRoute, request);
    void localDbService.upsertChatListItems(response, generation);

    const data = response.map((item) =>
      plainToInstance(ChatListItem, item, {
        excludeExtraneousValues: true,
        enableImplicitConversion: true,
      }),
    );

    return data;
  }

  public async getPinnedChatList(): Promise<Array<ChatListItem>> {
    const generation = localDbService.getGeneration();
    const response = await getApiService().get<Array<LocalChatListItem>>(chatServiceConfig.pinnedListRoute);
    // NOTE: The default chat list excludes pinned chats, so their rows are created here.
    void localDbService.upsertChatListItems(response, generation);
    void localDbService.setPinnedChatIds(
      response.map((item) => item.id),
      generation,
    );

    const data = response.map((item) =>
      plainToInstance(ChatListItem, item, {
        excludeExtraneousValues: true,
        enableImplicitConversion: true,
      }),
    );

    return data;
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
    saveOwnChatLocally(response, generation);

    return createEntityInstance<ChatResponse>(ChatResponse, response);
  }

  public async updateChatFolder(params: MoveChatToFolderRequest): Promise<ChatResponse> {
    const request = instanceToPlain<MoveChatToFolderRequest>(new MoveChatToFolderRequest(params));

    const generation = localDbService.getGeneration();
    const response = await getApiService().post<LocalChat>(`${this.endpoint}/${request.id}/folder`, request);
    saveOwnChatLocally(response, generation);

    return createEntityInstance<ChatResponse>(ChatResponse, response);
  }

  public async pinChat(chatId: string): Promise<ChatResponse> {
    const generation = localDbService.getGeneration();
    // NOTE: The response carries the toggled `pinned`, so the local row stays consistent with the pinned list.
    const response = await getApiService().post<LocalChat>(`${this.endpoint}/${chatId}/pin`);
    saveOwnChatLocally(response, generation);

    return createEntityInstance<ChatResponse>(ChatResponse, response);
  }

  public async cloneChat({ chatId, title }: { chatId: string; title: string }): Promise<ChatResponse> {
    const generation = localDbService.getGeneration();
    const response = await getApiService().post<LocalChat>(`${this.endpoint}/${chatId}/clone`, { title });
    saveOwnChatLocally(response, generation);

    return createEntityInstance<ChatResponse>(ChatResponse, response);
  }

  public async createNewChat(params: CreateNewChatRequest): Promise<ChatResponse> {
    const request = instanceToPlain<CreateNewChatRequest>(params);

    const generation = localDbService.getGeneration();
    const response = await getApiService().post<LocalChat>(`${chatServiceConfig.versionedRoute}/new`, request);
    saveOwnChatLocally(response, generation);

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
    saveOwnChatLocally(response, generation);

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
      saveOwnChatLocally(response, generation);
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

  public async archiveAllChats(): Promise<void> {
    await getApiService().post<void>(`${chatServiceConfig.versionedRoute}/archive/all`);
  }

  public async deleteAllChats(): Promise<void> {
    await getApiService().delete<void>(`${chatServiceConfig.versionedRoute}/`);
  }
}

export const chatService = new ChatService();

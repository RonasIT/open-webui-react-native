import { createEntityInstance, EntityPartial } from '@ronas-it/rtkq-entity-api';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { mapValues } from 'lodash-es';
import { getApiService } from '@open-webui-react-native/shared/data-access/api-client';
import { EntityPromiseService } from '@open-webui-react-native/shared/data-access/base-entity';
import { LocalChat, LocalChatListItem, localDbService } from '@open-webui-react-native/shared/data-access/local-db';
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
    const response = await getApiService().get<LocalChat>(`${this.endpoint}/${id}`);
    void localDbService.upsertChat(response, generation);

    return createEntityInstance<ChatResponse>(ChatResponse, response);
  }

  public async getChatList(params: GetChatListRequest): Promise<Array<ChatListItem>> {
    const request = instanceToPlain(new GetChatListRequest(params), { exposeUnsetFields: false });
    const generation = localDbService.getGeneration();
    const response = await getApiService().get<Array<LocalChatListItem>>(
      `${chatServiceConfig.versionedRoute}/`,
      request,
    );
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
    const response = await getApiService().get<Array<LocalChatListItem>>(`${chatServiceConfig.versionedRoute}/pinned`);
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
    void localDbService.upsertChat(response, generation);

    return createEntityInstance<ChatResponse>(ChatResponse, response);
  }

  public async updateChatFolder(params: MoveChatToFolderRequest): Promise<ChatResponse> {
    const request = instanceToPlain<MoveChatToFolderRequest>(new MoveChatToFolderRequest(params));

    const generation = localDbService.getGeneration();
    const response = await getApiService().post<LocalChat>(`${this.endpoint}/${request.id}/folder`, request);
    void localDbService.upsertChat(response, generation);

    return createEntityInstance<ChatResponse>(ChatResponse, response);
  }

  public async pinChat(chatId: string): Promise<ChatResponse> {
    const generation = localDbService.getGeneration();
    // NOTE: The response carries the toggled `pinned`, so the local row stays consistent with the pinned list.
    const response = await getApiService().post<LocalChat>(`${this.endpoint}/${chatId}/pin`);
    void localDbService.upsertChat(response, generation);

    return createEntityInstance<ChatResponse>(ChatResponse, response);
  }

  public async cloneChat({ chatId, title }: { chatId: string; title: string }): Promise<ChatResponse> {
    const generation = localDbService.getGeneration();
    const response = await getApiService().post<LocalChat>(`${this.endpoint}/${chatId}/clone`, { title });
    void localDbService.upsertChat(response, generation);

    return createEntityInstance<ChatResponse>(ChatResponse, response);
  }

  public async createNewChat(params: CreateNewChatRequest): Promise<ChatResponse> {
    const request = instanceToPlain<CreateNewChatRequest>(params);

    const generation = localDbService.getGeneration();
    const response = await getApiService().post<LocalChat>(`${chatServiceConfig.versionedRoute}/new`, request);
    void localDbService.upsertChat(response, generation);

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
    void localDbService.upsertChat(response, generation);

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
    void (response.archived
      ? localDbService.deleteChat(chatId, generation)
      : localDbService.upsertChat(response, generation));

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

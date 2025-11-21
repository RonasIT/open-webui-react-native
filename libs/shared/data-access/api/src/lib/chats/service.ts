import { createEntityInstance, EntityPartial } from '@ronas-it/rtkq-entity-api';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { getApiService } from '@open-webui-react-native/shared/data-access/api-client';
import { EntityPromiseService } from '@open-webui-react-native/shared/data-access/base-entity';
import { chatServiceConfig } from './configs';
import {
  ChatListItem,
  ChatResponse,
  CompleteChatRequest,
  CompleteChatResponse,
  CompletedChat,
  CreateNewChatRequest,
  GetArchivedChatListRequest,
  GetChatListRequest,
  SearchChatListRequest,
  ShareChatResponse,
} from './models';

export class ChatService extends EntityPromiseService<ChatResponse> {
  constructor() {
    super({
      endpoint: chatServiceConfig.versionedRoute,
      entityConstructor: ChatResponse,
      apiService: getApiService,
    });
  }

  public async getChatList(params: GetChatListRequest): Promise<Array<ChatListItem>> {
    const request = instanceToPlain<GetChatListRequest>(params);
    const response = await getApiService().get<Array<ChatListItem>>(`${chatServiceConfig.versionedRoute}/`, request);

    const data = response.map((item) =>
      plainToInstance(ChatListItem, item, {
        excludeExtraneousValues: true,
        enableImplicitConversion: true,
      }),
    );

    return data;
  }

  public async getPinnedChatList(): Promise<Array<ChatListItem>> {
    const response = await getApiService().get<Array<ChatListItem>>(`${chatServiceConfig.versionedRoute}/pinned`);

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

    const response = await getApiService().post<ChatResponse>(`${this.endpoint}/${updatedEntity.id}`, updatedEntity);

    return createEntityInstance<ChatResponse>(ChatResponse, response);
  }

  public async pinChat(chatId: string): Promise<ChatResponse> {
    const response = await getApiService().post<ChatResponse>(`${this.endpoint}/${chatId}/pin`);

    return createEntityInstance<ChatResponse>(ChatResponse, response);
  }

  public async cloneChat({ chatId, title }: { chatId: string; title: string }): Promise<ChatResponse> {
    const response = await getApiService().post<ChatResponse>(`${this.endpoint}/${chatId}/clone`, { title });

    return createEntityInstance<ChatResponse>(ChatResponse, response);
  }

  public async createNewChat(params: CreateNewChatRequest): Promise<ChatResponse> {
    const request = instanceToPlain<CreateNewChatRequest>(params);

    const response = await getApiService().post<ChatResponse>(`${chatServiceConfig.versionedRoute}/new`, request);

    return createEntityInstance(ChatResponse, response);
  }

  public async completeChat(params: CompleteChatRequest): Promise<CompleteChatResponse> {
    const request = instanceToPlain<CompleteChatRequest>(params);

    const response = await getApiService().post<CompleteChatResponse>(
      `${chatServiceConfig.route}/completions`,
      request,
    );

    return plainToInstance(CompleteChatResponse, response);
  }

  public async handleCompletedChat(params: CompletedChat): Promise<CompletedChat> {
    const request = instanceToPlain<CompletedChat>(params);

    const response = await getApiService().post<CompletedChat>(`${chatServiceConfig.route}/completed`, request);

    return plainToInstance(CompletedChat, response);
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
    const response = await getApiService().post<ChatResponse>(`${chatServiceConfig.versionedRoute}/${chatId}/archive`);

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
}

export const chatService = new ChatService();

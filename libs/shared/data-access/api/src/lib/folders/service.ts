import { instanceToPlain, plainToInstance } from 'class-transformer';
import { getApiService } from '@open-webui-react-native/shared/data-access/api-client';
import { EntityPromiseService } from '@open-webui-react-native/shared/data-access/base-entity';
import { ChatListItem } from '../chats/models/chat-list-item';
import { ChatResponse } from '../chats/models/chat-response';
import { foldersApiConfig } from './config';
import {
  CreateFolderRequest,
  FolderListItem,
  FolderResponse,
  GetFolderChatListRequest,
  SharedFolderChatsResponse,
  UpdateFolderRequest,
} from './models';

class FoldersService extends EntityPromiseService<FolderResponse> {
  constructor() {
    super({
      endpoint: foldersApiConfig.route,
      entityConstructor: FolderResponse,
      apiService: getApiService,
    });
  }

  public async createFolder(params: CreateFolderRequest): Promise<FolderListItem> {
    const request = instanceToPlain<CreateFolderRequest>(new CreateFolderRequest(params));

    const response = await getApiService().post<FolderListItem>(`${foldersApiConfig.route}/`, request);

    return plainToInstance(FolderListItem, response);
  }

  public async updateFolder(params: UpdateFolderRequest): Promise<FolderResponse> {
    // Backend forbids extra fields in the body (`id` is passed via URL only)
    const { id, ...request } = instanceToPlain<UpdateFolderRequest>(new UpdateFolderRequest(params));

    const response = await getApiService().post<FolderResponse>(
      `${foldersApiConfig.route}/${params.id}/update`,
      request,
    );

    return plainToInstance(FolderResponse, response);
  }

  public async getFolders(): Promise<Array<FolderListItem>> {
    const response = await getApiService().get<Array<FolderListItem>>(`${foldersApiConfig.route}/`);

    return response.map((item) => plainToInstance(FolderListItem, item));
  }

  public async getFolderChatList({ folderId, page }: GetFolderChatListRequest): Promise<Array<ChatListItem>> {
    const response = await getApiService().get<SharedFolderChatsResponse>(
      `${foldersApiConfig.route}/${folderId}/shared/chats`,
      { page },
    );

    return (
      plainToInstance(SharedFolderChatsResponse, response, {
        excludeExtraneousValues: true,
        enableImplicitConversion: true,
      }).chats ?? []
    );
  }

  public async getFolderChats(id: string): Promise<Array<ChatResponse>> {
    const response = await getApiService().get<Array<ChatResponse>>(`${foldersApiConfig.chatsRoute}/folder/${id}`);

    return response.map((item) => plainToInstance(ChatResponse, item));
  }
}

export const foldersService = new FoldersService();

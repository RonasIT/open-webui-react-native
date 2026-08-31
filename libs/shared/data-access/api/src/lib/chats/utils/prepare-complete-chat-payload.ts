import { uniqBy } from 'lodash-es';
import { AttachedFile, FileType, Role } from '@open-webui-react-native/shared/data-access/common';
import { queryClient } from '@open-webui-react-native/shared/data-access/query-client';
import { appConfigurationApiConfig } from '../../app-configuration/config';
import { Configuration } from '../../app-configuration/models';
import { usersApiConfig } from '../../users/config';
import { UserSettings } from '../../users/models';
import { chatQueriesKeys } from '../chat-queries-keys';
import { backgroundTasksConfig } from '../configs';
import { ChatGenerationOption, ToolApprovalMode } from '../enums';
import {
  ChatMessage,
  ChatMessageContent,
  ChatResponse,
  CompleteChatParams,
  CompleteChatRequest,
  Features,
  Message,
} from '../models';
import { toolApprovalState$ } from '../state';

export interface PrepareCompleteChatPayloadArgs {
  chatId: string;
  messageId: string;
  messages: Array<Message>;
  sessionId: string;
  model: string;
  generationOptions?: Array<ChatGenerationOption>;
  // The parent user message of the assistant turn being generated. The backend uses it to
  // link the assistant's parentId; omitting it orphans the user message (drops from the branch).
  userMessage?: Message;
  // Set only for "Continue Response": id of the existing assistant message to keep and extend.
  assistantMessageId?: string;
}

export function prepareCompleteChatPayload({
  chatId,
  messageId,
  messages,
  sessionId,
  model,
  generationOptions,
  userMessage,
  assistantMessageId,
}: PrepareCompleteChatPayloadArgs): CompleteChatRequest {
  const userSettings = queryClient.getQueryData<UserSettings>(usersApiConfig.getUserSettingsQueryKey);
  const chatResponse = queryClient.getQueryData<ChatResponse>(chatQueriesKeys.get(chatId).queryKey);

  // NOTE: The backend re-saves the assistant placeholder on every completion and takes its parentId
  // from `user_message` — omitting it persists the turn with `parentId: null`, overwriting the link
  // the client just saved. A completed turn hides this (handleCompletedChat rewrites the history at
  // the end), but a turn that never completes — one paused on tool approval — stays orphaned, and
  // `.../resolve` then answers 409 "Tool call parent message is missing". Derived from the cache
  // instead of being threaded through all six completion entry points.
  const assistantMessage = chatResponse?.chat.history.messages[messageId];
  const resolvedUserMessage =
    userMessage ??
    (assistantMessage?.parentId ? chatResponse?.chat.history.messages[assistantMessage.parentId] : undefined);

  // NOTE: `tool_approval_mode` exists only on Open WebUI 0.11.1+. Older backends do not recognise it
  // and forward the whole `params` object to the model provider, which rejects the request with
  // "Unknown parameter: 'tool_approval_mode'" — so the param is sent only when the server
  // advertises the feature, and only when it actually changes behaviour (`ask`).
  const configuration = queryClient.getQueryData<Configuration>(appConfigurationApiConfig.getConfigQueryKey);
  const toolApprovalMode = toolApprovalState$.mode.peek();
  const isToolApprovalSupported = configuration?.features?.enableToolPermissions === true;
  const params =
    isToolApprovalSupported && toolApprovalMode === ToolApprovalMode.ASK
      ? new CompleteChatParams({ toolApprovalMode })
      : undefined;

  const prepareChatMessages = (): Array<ChatMessage> => {
    const chatSystemPrompt = (chatResponse?.chat.params?.system as string | undefined)?.trim();
    const globalSystemPrompt = userSettings?.ui.system?.trim();
    // The user's default system prompt (Settings > General). Prepended to every completion
    // request rather than persisted into chat history, since the full history is resent each call.
    // Chat system prompt overrides the global system prompt.
    const systemPrompt = chatSystemPrompt || globalSystemPrompt;
    const systemMessage = systemPrompt
      ? [
          new ChatMessage({
            role: Role.SYSTEM,
            content: [new ChatMessageContent({ type: 'text', text: systemPrompt })],
          }),
        ]
      : [];

    const historyMessages = messages.map((message) => {
      const content: Array<ChatMessageContent> = [];

      if (message.content) {
        content.push(new ChatMessageContent({ type: 'text', text: message.content }));
      }

      if (message.files && message.files.length > 0) {
        content.push(
          ...message.files.reduce<Array<ChatMessageContent>>(
            (acc, file) =>
              file.type === FileType.IMAGE && message.role !== Role.ASSISTANT
                ? [
                    ...acc,
                    new ChatMessageContent({
                      type: 'image_url',
                      imageUrl: { url: file.url },
                    }),
                  ]
                : acc,
            [],
          ),
        );
      }

      return new ChatMessage({
        role: message.role,
        content,
      });
    });

    return [...systemMessage, ...historyMessages];
  };

  // Only files should be included in `files` field
  const files = uniqBy(
    messages.flatMap((msg) => msg.files ?? []).filter((file): file is AttachedFile => file.type === FileType.FILE),
    'id',
  );

  const request = new CompleteChatRequest({
    backgroundTasks: backgroundTasksConfig,
    features: new Features({
      codeInterpreter: generationOptions?.includes(ChatGenerationOption.CODE_INTERPRETER),
      imageGeneration: generationOptions?.includes(ChatGenerationOption.IMAGE_GENERATION),
      webSearch: (userSettings?.ui.webSearch ?? false) || generationOptions?.includes(ChatGenerationOption.WEB_SEARCH),
    }),
    params,
    stream: true,
    model,
    messages: prepareChatMessages(),
    chatId,
    id: messageId,
    sessionId,
    files,
    userMessage: resolvedUserMessage,
    parentId: resolvedUserMessage?.parentId ?? null,
    assistantMessageId,
  });

  return request;
}

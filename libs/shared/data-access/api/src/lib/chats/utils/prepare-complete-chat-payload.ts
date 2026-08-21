import { uniqBy } from 'lodash-es';
import { AttachedFile, FileType, Role } from '@open-webui-react-native/shared/data-access/common';
import { queryClient } from '@open-webui-react-native/shared/data-access/query-client';
import { usersApiConfig } from '../../users/config';
import { UserSettings } from '../../users/models';
import { backgroundTasksConfig } from '../configs';
import { ChatGenerationOption } from '../enums';
import { ChatMessage, ChatMessageContent, CompleteChatRequest, Features, Message } from '../models';

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
  const prepareChatMessages = (): Array<ChatMessage> => {
    // The user's default system prompt (Settings > General). Prepended to every completion
    // request rather than persisted into chat history, since the full history is resent each call.
    const systemPrompt = queryClient
      .getQueryData<UserSettings>(usersApiConfig.getUserSettingsQueryKey)
      ?.ui.system?.trim();
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
      webSearch: generationOptions?.includes(ChatGenerationOption.WEB_SEARCH),
    }),
    stream: true,
    model,
    messages: prepareChatMessages(),
    chatId,
    id: messageId,
    sessionId,
    files,
    userMessage,
    parentId: userMessage?.parentId ?? null,
    assistantMessageId,
  });

  return request;
}

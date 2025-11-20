import { uniqBy } from 'lodash-es';
import { AttachedFile, FileType, Role } from '@open-web-ui-mobile-client-react-native/shared/data-access/common';
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
}

export function prepareCompleteChatPayload({
  chatId,
  messageId,
  messages,
  sessionId,
  model,
  generationOptions,
}: PrepareCompleteChatPayloadArgs): CompleteChatRequest {
  const prepareChatMessages = (): Array<ChatMessage> => {
    return messages.map((message) => {
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
    }),
    stream: true,
    model,
    messages: prepareChatMessages(),
    chatId,
    id: messageId,
    sessionId,
    files,
  });

  return request;
}

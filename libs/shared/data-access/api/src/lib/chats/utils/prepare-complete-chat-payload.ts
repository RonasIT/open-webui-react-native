import { uniq } from 'lodash-es';
import { FileType, Role } from '@open-webui-react-native/shared/data-access/common';
import { queryClient } from '@open-webui-react-native/shared/data-access/query-client';
import { modelsApiConfig } from '../../ai-models/config';
import { AIModel } from '../../ai-models/models';
import { getModelControlChoices } from '../../ai-models/utils/get-model-control-choices';
import { isModelControlsAvailable } from '../../ai-models/utils/is-model-controls-available';
import { splitStaleModelControlChoices } from '../../ai-models/utils/split-stale-model-control-choices';
import { appConfigurationApiConfig } from '../../app-configuration/config';
import { Configuration } from '../../app-configuration/models';
import { isServerVersionAtLeast } from '../../app-configuration/utils/is-server-version-at-least';
import { toolsApiConfig } from '../../tools/config';
import { Tool } from '../../tools/models';
import { usersApiConfig } from '../../users/config';
import { UserSettings } from '../../users/models';
import { chatQueriesKeys } from '../chat-queries-keys';
import { ChatGenerationOption, ToolApprovalMode } from '../enums';
import {
  BackgroundTasks,
  ChatMessage,
  ChatMessageContent,
  ChatResponse,
  CompleteChatParams,
  CompleteChatRequest,
  Features,
  Message,
} from '../models';
import { chatSelectionState$, getChatSelectionForModel, toolApprovalState$ } from '../state';
import { getAvailableGenerationOptions } from './get-available-generation-options';
import { getCompletionFiles } from './get-completion-files';
import { removeStaleModelControlChoices } from './remove-stale-model-control-choices';
import { resolveDefaultGenerationOptions } from './resolve-default-generation-options';
import { resolveDefaultToolIds } from './resolve-default-tool-ids';

export interface PrepareCompleteChatPayloadArgs {
  chatId: string;
  messageId: string;
  messages: Array<Message>;
  sessionId: string;
  model: string;
  // Added on top of the chat's current selection (or the model defaults), e.g. voice mode sends
  // `voice` together with the web search / image generation toggles, as the web client does.
  generationOptions?: Array<ChatGenerationOption>;
  // The parent user message of the assistant turn being generated. The backend uses it to
  // link the assistant's parentId; omitting it orphans the user message (drops from the branch).
  userMessage?: Message;
  // Set only for "Continue Response": id of the existing assistant message to keep and extend.
  assistantMessageId?: string;
  // Set only for guided regeneration: the instruction the backend appends as the last user turn.
  regenerationPrompt?: string;
  // Set only for guided regeneration: the assistant message the instruction revises.
  regenerationMessageId?: string;
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
  regenerationPrompt,
  regenerationMessageId,
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
  const shouldSendToolApprovalMode = isToolApprovalSupported && toolApprovalMode === ToolApprovalMode.ASK;

  const cachedModel = queryClient
    .getQueryData<Array<AIModel>>(modelsApiConfig.getModelsQueryKey)
    ?.find(({ id }) => id === model);

  let completionModelControls: CompleteChatParams['modelControls'];

  if (cachedModel && userSettings && isModelControlsAvailable(cachedModel)) {
    const choices = getModelControlChoices(userSettings, model);
    const { validChoices, staleControlKeys } = splitStaleModelControlChoices(cachedModel, choices);

    if (staleControlKeys.length > 0) {
      removeStaleModelControlChoices({ model: cachedModel, staleControlKeys });
    }

    if (Object.keys(validChoices).length > 0) {
      completionModelControls = { [model]: validChoices };
    }
  }

  const params =
    shouldSendToolApprovalMode || completionModelControls
      ? new CompleteChatParams({
          toolApprovalMode: shouldSendToolApprovalMode ? toolApprovalMode : undefined,
          modelControls: completionModelControls,
        })
      : undefined;

  // The backend resolves tools only from `tool_ids` — it applies neither the model's nor the user's
  // defaults — so the client has to send them, exactly as the web interface does. Tools and
  // generation options are read from the shared selection rather than threaded through every
  // completion entry point, so that a follow-up, a regenerate, an edit and a queued message all use
  // what the chat is actually set up with. An empty tools array would be sent as `tool_ids: []`, so
  // it collapses to `undefined` instead.
  const selection = getChatSelectionForModel(chatSelectionState$[chatId].peek(), model);
  const resolvedToolIds =
    selection.toolIds ??
    resolveDefaultToolIds({
      model: cachedModel,
      tools: queryClient.getQueryData<Array<Tool>>(toolsApiConfig.getToolsQueryKey),
      uiSettings: userSettings?.ui,
    });
  const availableGenerationOptions = getAvailableGenerationOptions(cachedModel, configuration);
  const resolvedGenerationOptions = uniq([
    ...(selection.generationOptions ??
      resolveDefaultGenerationOptions({ model: cachedModel, availableOptions: availableGenerationOptions })),
    ...(generationOptions ?? []),
  ]);

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

    const historyMessages = messages.flatMap((message) => {
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

      // NOTE: Drop the empty assistant placeholder. A temporary chat is not in the DB, so 0.10
      // sends this array to the model and to follow-up generation. A blank assistant turn is what
      // comes back as "None". The web client filters the same way (`content.trim()` / `output`).
      if (message.role === Role.ASSISTANT && content.length === 0) {
        return [];
      }

      return [
        new ChatMessage({
          role: message.role,
          content,
        }),
      ];
    });

    return [...systemMessage, ...historyMessages];
  };

  const files = getCompletionFiles(messages);

  const historyMessagesCount = Object.keys(chatResponse?.chat.history.messages ?? {}).length;
  const isFirstExchange = historyMessagesCount > 0 && historyMessagesCount <= 2;

  const request = new CompleteChatRequest({
    backgroundTasks: new BackgroundTasks({
      followUpGeneration: true,
      titleGeneration: isFirstExchange,
      tagsGeneration: isFirstExchange,
    }),
    features: new Features({
      codeInterpreter: resolvedGenerationOptions.includes(ChatGenerationOption.CODE_INTERPRETER),
      imageGeneration: resolvedGenerationOptions.includes(ChatGenerationOption.IMAGE_GENERATION),
      webSearch:
        (Boolean(userSettings?.ui.webSearch) && availableGenerationOptions.includes(ChatGenerationOption.WEB_SEARCH)) ||
        resolvedGenerationOptions.includes(ChatGenerationOption.WEB_SEARCH),
      voice: resolvedGenerationOptions.includes(ChatGenerationOption.VOICE),
      // NOTE: Without it the backend skips saved memories and memory tools. Same rule as the web client.
      memory: userSettings?.ui.memory ?? configuration?.features?.enableMemories ?? false,
    }),
    params,
    toolIds: resolvedToolIds.length > 0 ? resolvedToolIds : undefined,
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
    regenerationPrompt,
    // NOTE: Open WebUI before 0.12.4 does not know the field and forwards it to the provider; remove with 0.12.3 support.
    regenerationMessageId: isServerVersionAtLeast('0.12.4') ? regenerationMessageId : undefined,
  });

  return request;
}

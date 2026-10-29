import { useSelector } from '@legendapp/state/react';
import { Fragment, ReactElement, useMemo } from 'react';
import { FollowUpsList } from '@open-webui-react-native/mobile/chat/features/follow-ups-list';
import { MessageVersionControls } from '@open-webui-react-native/mobile/chat/features/message-version-controls';
import { SourceCitationModal } from '@open-webui-react-native/mobile/chat/features/source-citation-modal';
import { prepareTextWithCitations, useCitations } from '@open-webui-react-native/mobile/chat/features/use-citations';
import { UseSiblingMessagesReturn } from '@open-webui-react-native/mobile/chat/features/use-manage-messages-siblings';
import { SourceCitationItem } from '@open-webui-react-native/mobile/chat/ui/source-citation-item';
import {
  AttachedImageWithIndex,
  ImagePreviewModal,
  useImagePreview,
} from '@open-webui-react-native/mobile/shared/features/image-preview-modal';
import { AppMarkdownView } from '@open-webui-react-native/mobile/shared/features/markdown-view';
import { colors } from '@open-webui-react-native/mobile/shared/ui/styles';
import { AppText, Icon, View } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import {
  AskUserDraftAnswers,
  buildAskUserAnswers,
  chatApi,
  getPendingToolCall,
  Message,
  modelsApi,
  parseAskUserPrompt,
  ResolveToolCallRequest,
  ToolCallResolveAction,
} from '@open-webui-react-native/shared/data-access/api';
import { appState$ } from '@open-webui-react-native/shared/data-access/app-state';
import { FileType } from '@open-webui-react-native/shared/data-access/common';
import { withOfflineGuard } from '@open-webui-react-native/shared/features/network';
import { formatDateTime } from '@open-webui-react-native/shared/utils/date';
import { resolveServerUrl } from '@open-webui-react-native/shared/utils/files';
import { buildMessageRows, parseResponseMessageContent } from '../../utils';
import { ChatImagesGroup } from '../images';
import { ReasoningCard } from '../reasoning-card';
import { SkeletonMessage } from '../skeleton-message';
import { ToolCallCard } from '../tool-call-card';
import { AskUserCard, ToolApprovalCard } from './components';

interface ChatAiMessageProps {
  message: Message;
  chatId: string;
  onEditPress: () => void;
  isLast: boolean;
  isResponseGenerating: boolean;
  isSkeleton: boolean;
  onFollowUpPress: (text: string) => void;
  isEditing?: boolean;
  onPreviousSibling?: UseSiblingMessagesReturn['showPreviousSibling'];
  onNextSibling?: UseSiblingMessagesReturn['showNextSibling'];
  getSiblingsInfo?: UseSiblingMessagesReturn['getSiblingsInfo'];
}

export function ChatAiMessage({
  message,
  chatId,
  isEditing,
  onNextSibling,
  onPreviousSibling,
  getSiblingsInfo,
  isLast,
  isResponseGenerating,
  isSkeleton,
  onFollowUpPress,
}: ChatAiMessageProps): ReactElement {
  const {
    content: text,
    model: modelId,
    modelName: aiModelName,
    files,
    sources,
    done: isMessageDone,
    socketStatusData,
    timestamp,
    followUps,
    error: messageError,
  } = message;

  const isOfflineMode = useSelector(appState$.isOfflineMode);

  // NOTE: Mirrors the web app — `modelName` is a client-only snapshot the backend never guarantees
  // (older chats, imports, or continued responses can lack it entirely), so it's a fallback rather
  // than the source of truth. The live models list, keyed by the (always-present) model id, is.
  const { data: models } = modelsApi.useGetModels();
  const displayModelName = models?.find((model) => model.id === modelId)?.name ?? aiModelName ?? modelId;

  const { citations, selectedCitation, sourceCitationModalRef, handleCitationPress, handleInlineCitationPress } =
    useCitations(sources);

  const attachedImages = useMemo(
    () =>
      (files ?? []).reduce(
        (acc, file, index) =>
          file.type === FileType.IMAGE && file.url
            ? [...acc, { type: file.type, url: resolveServerUrl(file.url), index }]
            : acc,
        [] as Array<AttachedImageWithIndex>,
      ),
    [files],
  );

  const { handleImagePress, handleAllPhotosPress, selectedImageIndex, isPreviewVisible, handleCloseImagePress } =
    useImagePreview();

  // NOTE: Failures surface through the api-client error interceptor's toast, so no onError here.
  const { mutate: resolveToolCall, isPending: isResolvingToolCall } = chatApi.useResolveToolCall();

  const { detailsBlocks, messageContent } = parseResponseMessageContent(text);
  // NOTE: Offline the stream is gone, so reasoning still in progress will not finish.
  const rows = buildMessageRows(message, detailsBlocks, Boolean(isMessageDone) || isOfflineMode);
  const textWithCitations = prepareTextWithCitations(messageContent, citations);
  const hasFollowUps = Array.isArray(followUps) && followUps.length > 0;
  const pendingToolCall = getPendingToolCall(message);
  // NOTE: An `ask_user` call is a pause too, but it carries questions in its arguments and expects
  // answers instead of an approval — the backend rejects `approve` for it with 400.
  const askUserPrompt = pendingToolCall?.isAskUser ? parseAskUserPrompt(pendingToolCall.toolArguments) : undefined;

  const resolvePendingToolCall = withOfflineGuard(
    (action: ToolCallResolveAction, draftAnswers?: AskUserDraftAnswers): void => {
      if (!pendingToolCall) {
        return;
      }

      resolveToolCall({
        chatId,
        messageId: message.id,
        request: new ResolveToolCallRequest({
          callId: pendingToolCall.callId,
          action,
          answers: draftAnswers && buildAskUserAnswers(draftAnswers),
        }),
      });
    },
  );

  const handleFollowUpPress = withOfflineGuard(onFollowUpPress);

  return (
    <View>
      <View className='flex-row justify-between'>
        <AppText className='text-sm-sm sm:text-sm font-medium'>{displayModelName}</AppText>
        <AppText className='text-sm-sm sm:text-sm text-text-secondary'>
          {formatDateTime(timestamp, 'chat-relative-time')}
        </AppText>
      </View>
      {!!socketStatusData?.description && (
        <AppText className='mt-4 text-text-secondary'>{socketStatusData.description}</AppText>
      )}
      {!!messageError?.content && (
        <View className='mt-8 flex-row items-center gap-8 rounded-xl bg-background-secondary px-12 py-10'>
          <Icon name='alert' className='size-20 shrink-0 color-status-danger' />
          <AppText selectable className='text-sm-sm sm:text-sm min-w-0 flex-1 text-text-secondary'>
            {messageError.content}
          </AppText>
        </View>
      )}
      {pendingToolCall && !pendingToolCall.isAskUser && (
        <View className='mt-8'>
          <ToolApprovalCard
            toolName={pendingToolCall.toolName}
            toolArguments={pendingToolCall.toolArguments}
            isResolving={isResolvingToolCall}
            areActionsInactive={isOfflineMode}
            onAllowPress={() => resolvePendingToolCall(ToolCallResolveAction.APPROVE)}
            onDenyPress={() => resolvePendingToolCall(ToolCallResolveAction.REJECT)}
          />
        </View>
      )}
      {pendingToolCall && askUserPrompt && (
        <View className='mt-8'>
          <AskUserCard
            // NOTE: Keyed by call so the draft answers reset when a new question arrives instead of
            // carrying over from the previous one.
            key={pendingToolCall.callId}
            prompt={askUserPrompt}
            isResolving={isResolvingToolCall}
            areActionsInactive={isOfflineMode}
            onSubmit={(answers) => resolvePendingToolCall(ToolCallResolveAction.ANSWER, answers)}
            onDenyPress={() => resolvePendingToolCall(ToolCallResolveAction.REJECT)}
          />
        </View>
      )}
      {rows.length > 0 && (
        <View className='mt-8 gap-8'>
          {rows.map((row) =>
            row.type === 'reasoning' ? (
              <ReasoningCard key={row.reasoning.key} reasoning={row.reasoning} />
            ) : (
              <ToolCallCard key={row.toolCall.key} toolCall={row.toolCall} />
            ),
          )}
        </View>
      )}
      {messageContent ? (
        <Fragment>
          <ChatImagesGroup
            images={attachedImages}
            onImagePress={handleImagePress}
            onShowAllImages={handleAllPhotosPress}
            isAlignLeft
            contentFit='contain'
            containerClassName='mt-8'
          />
          <AppMarkdownView
            isContentReady={isMessageDone}
            onCitationPress={handleInlineCitationPress}
            textColor={isEditing ? colors.brandPrimary : undefined}>
            {textWithCitations}
          </AppMarkdownView>
          {citations && (
            <View className='flex-row flex-wrap space-x-12 space-y-6'>
              {citations.map((citation, index) => (
                <SourceCitationItem
                  key={index}
                  onPress={() => handleCitationPress(citation)}
                  fileName={citation.source.name}
                  index={index}
                />
              ))}
            </View>
          )}
          {selectedCitation && <SourceCitationModal citation={selectedCitation} modalRef={sourceCitationModalRef} />}
          <ImagePreviewModal
            initialIndex={selectedImageIndex}
            images={attachedImages}
            visible={isPreviewVisible}
            onClosePress={handleCloseImagePress}
          />
          {message.parentId && (
            <MessageVersionControls
              message={message}
              onNextSibling={onNextSibling}
              onPreviousSibling={onPreviousSibling}
              getSiblingsInfo={getSiblingsInfo}
            />
          )}
        </Fragment>
      ) : (
        isSkeleton && <SkeletonMessage />
      )}
      {!isResponseGenerating && isLast && hasFollowUps && (
        <FollowUpsList
          followUps={followUps}
          onPress={handleFollowUpPress}
          isInactive={isOfflineMode}
          containerClassName='mt-12'
        />
      )}
    </View>
  );
}

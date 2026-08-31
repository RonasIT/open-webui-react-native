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
  parseAskUserPrompt,
  ResolveToolCallRequest,
  ToolCallResolveAction,
} from '@open-webui-react-native/shared/data-access/api';
import { FileType } from '@open-webui-react-native/shared/data-access/common';
import { getApiUrl } from '@open-webui-react-native/shared/utils/config';
import { formatDateTime } from '@open-webui-react-native/shared/utils/date';
import { parseResponseMessageContent } from '../../utils';
import { ChatImagesGroup } from '../images';
import { SkeletonMessage } from '../skeleton-message';
import { ToolOutputBottomSheet } from '../tool-output-bottom-sheet';
import { AskUserCard, ToolApprovalCard } from './components';

interface ChatAiMessageProps {
  message: Message;
  chatId: string;
  onEditPress: () => void;
  isLast: boolean;
  isResponseGenerating: boolean;
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
  onFollowUpPress,
}: ChatAiMessageProps): ReactElement {
  const {
    content: text,
    modelName: aiModelName,
    files,
    sources,
    done: isMessageDone,
    socketStatusData,
    timestamp,
    followUps,
    error: messageError,
  } = message;

  const apiUrl = getApiUrl();

  const { citations, selectedCitation, sourceCitationModalRef, handleCitationPress, handleInlineCitationPress } =
    useCitations(sources);

  const attachedImages = useMemo(
    () =>
      (files ?? []).reduce(
        (acc, file, index) =>
          file.type === FileType.IMAGE ? [...acc, { type: file.type, url: `${apiUrl}${file.url}`, index }] : acc,
        [] as Array<AttachedImageWithIndex>,
      ),
    [apiUrl, files],
  );

  const { handleImagePress, handleAllPhotosPress, selectedImageIndex, isPreviewVisible, handleCloseImagePress } =
    useImagePreview();

  // NOTE: Failures surface through the api-client error interceptor's toast, so no onError here.
  const { mutate: resolveToolCall, isPending: isResolvingToolCall } = chatApi.useResolveToolCall();

  const { toolsData, messageContent } = parseResponseMessageContent(text);
  const textWithCitations = prepareTextWithCitations(messageContent, citations);
  const hasFollowUps = Array.isArray(followUps) && followUps.length > 0;
  const pendingToolCall = getPendingToolCall(message);
  // NOTE: An `ask_user` call is a pause too, but it carries questions in its arguments and expects
  // answers instead of an approval — the backend rejects `approve` for it with 400.
  const askUserPrompt = pendingToolCall?.isAskUser ? parseAskUserPrompt(pendingToolCall.toolArguments) : undefined;

  const resolvePendingToolCall = (action: ToolCallResolveAction, draftAnswers?: AskUserDraftAnswers): void => {
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
  };

  return (
    <View>
      <View className='flex-row justify-between'>
        <AppText className='text-sm-sm sm:text-sm font-medium'>{aiModelName}</AppText>
        <AppText className='text-sm-sm sm:text-sm text-text-secondary'>
          {formatDateTime(timestamp, 'chat-relative-time')}
        </AppText>
      </View>
      {socketStatusData && <AppText className='mt-4 text-text-secondary'>{socketStatusData.description}</AppText>}
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
            onSubmit={(answers) => resolvePendingToolCall(ToolCallResolveAction.ANSWER, answers)}
            onDenyPress={() => resolvePendingToolCall(ToolCallResolveAction.REJECT)}
          />
        </View>
      )}
      {text ? (
        <Fragment>
          {toolsData.length > 0 && (
            <View className='mt-8 gap-8'>
              {toolsData.map((tool, index) => (
                <ToolOutputBottomSheet
                  key={tool.id ?? `${tool.toolName}-${index}`}
                  toolName={tool.toolName}
                  input={tool.input}
                  output={tool.output}
                />
              ))}
            </View>
          )}
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
        // NOTE: A turn paused on tool approval, or one that failed before producing any text, has
        // no body of its own — the card above is the body. A skeleton there reads as "still
        // generating", which is exactly what neither state is.
        !pendingToolCall && !messageError?.content && <SkeletonMessage />
      )}
      {!isResponseGenerating && isLast && hasFollowUps && (
        <FollowUpsList
          followUps={followUps}
          onPress={onFollowUpPress}
          containerClassName='mt-12' />
      )}
    </View>
  );
}

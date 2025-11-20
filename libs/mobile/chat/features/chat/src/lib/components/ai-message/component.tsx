import { Fragment, ReactElement, useMemo } from 'react';
import { MessageVersionControls } from '@open-web-ui-mobile-client-react-native/mobile/chat/features/message-version-controls';
import { SourceCitationModal } from '@open-web-ui-mobile-client-react-native/mobile/chat/features/source-citation-modal';
import {
  prepareTextWithCitations,
  useCitations,
} from '@open-web-ui-mobile-client-react-native/mobile/chat/features/use-citations';
import { UseSiblingMessagesReturn } from '@open-web-ui-mobile-client-react-native/mobile/chat/features/use-manage-messages-siblings';
import { SourceCitationItem } from '@open-web-ui-mobile-client-react-native/mobile/chat/ui/source-citation-item';
import {
  AttachedImageWithIndex,
  ImagePreviewModal,
  useImagePreview,
} from '@open-web-ui-mobile-client-react-native/mobile/shared/features/image-preview-modal';
import { AppMarkdownView } from '@open-web-ui-mobile-client-react-native/mobile/shared/features/markdown-view';
import { colors } from '@open-web-ui-mobile-client-react-native/mobile/shared/ui/styles';
import { AppText, View } from '@open-web-ui-mobile-client-react-native/mobile/shared/ui/ui-kit';
import { Message } from '@open-web-ui-mobile-client-react-native/shared/data-access/api';
import { FileType } from '@open-web-ui-mobile-client-react-native/shared/data-access/common';
import { getApiUrl } from '@open-web-ui-mobile-client-react-native/shared/utils/config';
import { formatDateTime } from '@open-web-ui-mobile-client-react-native/shared/utils/date';
import { ChatImagesGroup } from '../images';
import { SkeletonMessage } from '../skeleton-message';

interface ChatAiMessageProps {
  message: Message;
  onEditPress: () => void;
  isEditing?: boolean;
  onPreviousSibling?: UseSiblingMessagesReturn['showPreviousSibling'];
  onNextSibling?: UseSiblingMessagesReturn['showNextSibling'];
  getSiblingsInfo?: UseSiblingMessagesReturn['getSiblingsInfo'];
}

export function ChatAiMessage({
  message,
  isEditing,
  onNextSibling,
  onPreviousSibling,
  getSiblingsInfo,
}: ChatAiMessageProps): ReactElement {
  const {
    content: text,
    modelName: aiModelName,
    files,
    sources,
    done: isMessageDone,
    socketStatusData,
    timestamp,
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
    [files],
  );

  const { handleImagePress, handleAllPhotosPress, selectedImageIndex, isPreviewVisible, handleCloseImagePress } =
    useImagePreview();

  const textWithCitations = prepareTextWithCitations(text, citations);

  return (
    <View>
      <View className='flex-row justify-between'>
        <AppText className='text-sm-sm sm:text-sm font-medium'>{aiModelName}</AppText>
        <AppText className='text-sm-sm sm:text-sm text-text-secondary'>
          {formatDateTime(timestamp, 'chat-relative-time')}
        </AppText>
      </View>
      {socketStatusData && <AppText className='mt-4 text-text-secondary'>{socketStatusData.description}</AppText>}
      {text ? (
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
          <MessageVersionControls
            message={message}
            onNextSibling={onNextSibling}
            onPreviousSibling={onPreviousSibling}
            getSiblingsInfo={getSiblingsInfo}
          />
        </Fragment>
      ) : (
        <SkeletonMessage />
      )}
    </View>
  );
}

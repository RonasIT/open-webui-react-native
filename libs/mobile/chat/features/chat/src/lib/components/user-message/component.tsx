import { ReactElement, useMemo } from 'react';
import { LayoutChangeEvent } from 'react-native';
import { AttachedFileItem } from '@open-webui-react-native/mobile/chat/features/attached-file-item';
import { MessageVersionControls } from '@open-webui-react-native/mobile/chat/features/message-version-controls';
import { UseSiblingMessagesReturn } from '@open-webui-react-native/mobile/chat/features/use-manage-messages-siblings';
import {
  ImagePreviewModal,
  useImagePreview,
} from '@open-webui-react-native/mobile/shared/features/image-preview-modal';
import { AppMarkdownView } from '@open-webui-react-native/mobile/shared/features/markdown-view';
import { cn, colors, screenWidth, spacings } from '@open-webui-react-native/mobile/shared/ui/styles';
import { AppText, View } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { Message } from '@open-webui-react-native/shared/data-access/api';
import { AttachedFile, FileType } from '@open-webui-react-native/shared/data-access/common';
import { formatDateTime } from '@open-webui-react-native/shared/utils/date';
import { deepMemo } from '@open-webui-react-native/shared/utils/deep-memo';
import { ChatImagesGroup } from '../images';

interface ChatUserMessageProps {
  message: Message;
  className?: string;
  onLayoutChange?: (event: LayoutChangeEvent) => void;
  isEditing?: boolean;
  onPreviousSibling?: UseSiblingMessagesReturn['showPreviousSibling'];
  onNextSibling?: UseSiblingMessagesReturn['showNextSibling'];
  getSiblingsInfo?: UseSiblingMessagesReturn['getSiblingsInfo'];
}

const codeBlockWidth = (screenWidth - spacings.screenHorizontalOffset) * 0.9;

function ChatUserMessageComponent({
  message,
  className,
  onLayoutChange,
  isEditing,
  onPreviousSibling,
  onNextSibling,
  getSiblingsInfo,
}: ChatUserMessageProps): ReactElement {
  const { files, content: text, timestamp } = message;

  const attachedFiles = useMemo(
    () => (files?.filter((file) => file.type === FileType.FILE) as Array<AttachedFile>) ?? [],
    [files],
  );

  const attachedImages = useMemo(
    () => (files ?? []).filter((file) => file.type === FileType.IMAGE).map((file, index) => ({ ...file, index })),
    [files],
  );

  const { handleImagePress, handleAllPhotosPress, selectedImageIndex, isPreviewVisible, handleCloseImagePress } =
    useImagePreview();

  return (
    <View className='gap-4'>
      <AppText className='text-sm-sm sm:text-sm text-text-secondary self-end'>
        {formatDateTime(timestamp, 'chat-relative-time')}
      </AppText>
      <View className='gap-6'>
        {attachedFiles.map((file, index) => (
          <AttachedFileItem
            key={index}
            file={file.file}
            className='max-w-[70%] self-end' />
        ))}
        <ChatImagesGroup
          images={attachedImages}
          shouldHideSkeleton
          onImagePress={handleImagePress}
          onShowAllImages={handleAllPhotosPress}
        />
        <View className='flex-row-reverse' onLayout={onLayoutChange}>
          {!!text && (
            <View className={cn('bg-background-secondary px-12 py-8 rounded-xl max-w-[90%]', className)}>
              <AppMarkdownView textColor={isEditing ? colors.brandPrimary : undefined} codeBlockWidth={codeBlockWidth}>
                {text}
              </AppMarkdownView>
            </View>
          )}
        </View>
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
      </View>
    </View>
  );
}

//NOTE It is necessary to avoid a jump when re-rendering a component due to a change in the reference of files prop value
export const ChatUserMessage = deepMemo(ChatUserMessageComponent);

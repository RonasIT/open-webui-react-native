import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { ReactElement } from 'react';
import {
  ImagePreviewModal,
  useImagePreview,
} from '@open-webui-react-native/mobile/shared/features/image-preview-modal';
import { cn } from '@open-webui-react-native/mobile/shared/ui/styles';
import { AppPressable, AppText, Icon, IconName, View } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { ToolCallState } from '@open-webui-react-native/shared/data-access/api';
import { ToolCallView } from '../../utils';
import { ChatImagesGroup } from '../images';
import { ToolCallFileRow, ToolOutputBottomSheet } from './components';

interface ToolCallCardProps {
  toolCall: ToolCallView;
}

interface StateAppearance {
  iconName: IconName;
  iconClassName: string;
  labelKey: string;
}

const stateAppearances: Record<ToolCallState, StateAppearance> = {
  [ToolCallState.PREPARING]: {
    iconName: 'tools',
    iconClassName: 'color-text-secondary',
    labelKey: 'TEXT_PREPARING_PREFIX',
  },
  [ToolCallState.EXECUTING]: {
    iconName: 'tools',
    iconClassName: 'color-text-secondary',
    labelKey: 'TEXT_EXECUTING_PREFIX',
  },
  [ToolCallState.COMPLETED]: {
    iconName: 'tick',
    iconClassName: 'color-emerald-500',
    labelKey: 'TEXT_VIEW_RESULT_PREFIX',
  },
  [ToolCallState.FAILED]: {
    iconName: 'alert',
    iconClassName: 'color-status-danger',
    labelKey: 'TEXT_FAILED_PREFIX',
  },
  [ToolCallState.REJECTED]: {
    iconName: 'close',
    iconClassName: 'color-text-secondary',
    labelKey: 'TEXT_REJECTED_PREFIX',
  },
};

export function ToolCallCard({ toolCall }: ToolCallCardProps): ReactElement {
  const translate = useTranslation('CHAT.AI_MESSAGE.TOOL_CALL_CARD');

  const { handleImagePress, handleAllPhotosPress, selectedImageIndex, isPreviewVisible, handleCloseImagePress } =
    useImagePreview();

  const { toolName, state, input, output, images, files } = toolCall;
  const { iconName, iconClassName, labelKey } = stateAppearances[state];
  // A call still running, or one the user denied, has nothing to show inside yet.
  const hasDetails = Boolean(input || output);

  const renderRow = (onPress?: () => void): ReactElement => (
    <AppPressable
      onPress={onPress}
      disabled={!onPress}
      className={cn(
        'flex-row items-center gap-8 rounded-xl bg-background-secondary px-12 py-10',
        Boolean(onPress) && 'active:opacity-70',
      )}>
      <Icon name={iconName} className={cn('size-20 shrink-0', iconClassName)} />
      <View className='min-w-0 flex-1 flex-row flex-wrap items-center'>
        <AppText className='text-sm-sm sm:text-sm text-text-secondary'>{translate(labelKey)} </AppText>
        <AppText className='text-sm-sm sm:text-sm font-mono font-semibold text-text-primary'>{toolName}</AppText>
      </View>
      {!!onPress && <Icon name='chevronDown' className='size-16 shrink-0 color-text-secondary' />}
    </AppPressable>
  );

  return (
    <View className='gap-8'>
      {hasDetails ? (
        <ToolOutputBottomSheet
          toolName={toolName}
          input={input}
          output={output}
          renderTrigger={({ onPress }) => renderRow(onPress)}
        />
      ) : (
        renderRow()
      )}
      <ChatImagesGroup
        images={images}
        onImagePress={handleImagePress}
        onShowAllImages={handleAllPhotosPress}
        isAlignLeft
        contentFit='contain'
      />
      {files.map((file) => (
        <ToolCallFileRow key={file.key} file={file} />
      ))}
      {images.length > 0 && (
        <ImagePreviewModal
          initialIndex={selectedImageIndex}
          images={images}
          visible={isPreviewVisible}
          onClosePress={handleCloseImagePress}
        />
      )}
    </View>
  );
}

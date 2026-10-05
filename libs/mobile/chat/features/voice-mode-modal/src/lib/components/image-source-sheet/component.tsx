import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { ReactElement, useRef } from 'react';
import { ImagePickerSource } from '@open-webui-react-native/mobile/shared/data-access/image-picker-service';
import { ActionsBottomSheet, ActionSheetItemProps, IconButton } from '@open-webui-react-native/mobile/shared/ui/ui-kit';

export interface ImageSourceSheetProps {
  onSelectSource: (source: ImagePickerSource) => void;
}

export function ImageSourceSheet({ onSelectSource }: ImageSourceSheetProps): ReactElement {
  const translate = useTranslation('CHAT.VOICE_MODE_MODAL.IMAGE_SOURCE_SHEET');
  const sheetRef = useRef<BottomSheetModal>(null);

  const handleSelectSource = (source: ImagePickerSource): void => {
    sheetRef.current?.close();
    onSelectSource(source);
  };

  const actions: Array<ActionSheetItemProps> = [
    {
      title: translate('TEXT_TAKE_PHOTO'),
      iconName: 'camera',
      onPress: () => handleSelectSource(ImagePickerSource.CAMERA),
    },
    {
      title: translate('TEXT_CHOOSE_FROM_GALLERY'),
      iconName: 'gallery',
      onPress: () => handleSelectSource(ImagePickerSource.GALLERY),
    },
  ];

  const renderTrigger = ({ onPress }: { onPress: () => void }): ReactElement => (
    <IconButton
      iconName='camera'
      onPress={onPress}
      className='w-40 h-40 bg-background-secondary rounded-full' />
  );

  return <ActionsBottomSheet
    ref={sheetRef}
    renderTrigger={renderTrigger}
    actions={actions} />;
}

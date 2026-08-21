import { ReactElement } from 'react';
import { AppPressable, AppText, Icon, View } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { ImageData } from '@open-webui-react-native/shared/data-access/common';

export interface AttachmentRowProps {
  attachment: ImageData;
  onRemove: () => void;
}

export function AttachmentRow({ attachment, onRemove }: AttachmentRowProps): ReactElement {
  const fileName = attachment.fileName ?? attachment.uri.split('/').pop();

  return (
    <View className='pt-8 gap-12 flex-row items-center justify-between'>
      <View className='gap-12 flex-row items-center flex-1'>
        <Icon name='attachmentRound' />
        <AppText className='text-sm-sm sm:text-sm flex-shrink' numberOfLines={2}>
          {fileName}
        </AppText>
      </View>
      <AppPressable
        className='bg-brand-secondary-transparent w-[28px] h-[28px] rounded-full items-center justify-center'
        onPress={onRemove}>
        <Icon name='close' className='color-brand-secondary' />
      </AppPressable>
    </View>
  );
}

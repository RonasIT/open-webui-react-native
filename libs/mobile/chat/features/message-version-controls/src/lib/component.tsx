import { ReactElement } from 'react';
import { UseSiblingMessagesReturn } from '@open-web-ui-mobile-client-react-native/mobile/chat/features/use-manage-messages-siblings';
import { AppText, IconButton, View } from '@open-web-ui-mobile-client-react-native/mobile/shared/ui/ui-kit';
import { Message } from '@open-web-ui-mobile-client-react-native/shared/data-access/api';
import { FeatureID, isFeatureEnabled } from '@open-web-ui-mobile-client-react-native/shared/utils/feature-flag';

interface MessageVersionControlsProps {
  message: Message;
  onPreviousSibling?: UseSiblingMessagesReturn['showPreviousSibling'];
  onNextSibling?: UseSiblingMessagesReturn['showNextSibling'];
  getSiblingsInfo?: UseSiblingMessagesReturn['getSiblingsInfo'];
}

export function MessageVersionControls({
  message,
  onNextSibling,
  onPreviousSibling,
  getSiblingsInfo,
}: MessageVersionControlsProps): ReactElement | null {
  const siblingInfo = getSiblingsInfo?.(message) ?? {
    siblings: [],
    currentIndex: -1,
    hasSiblings: false,
  };

  if (!isFeatureEnabled(FeatureID.EDIT_MESSAGE) || !siblingInfo.hasSiblings) {
    return null;
  }

  return (
    <View className='flex-row self-end gap-10 items-center justify-center'>
      <IconButton
        iconName='chevronLeft'
        className='p-0'
        iconProps={{ className: 'color-text-secondary' }}
        onPress={() => onPreviousSibling?.(message)}
      />
      <AppText className='text-sm-sm sm:text-sm text-text-secondary'>
        {siblingInfo.currentIndex + 1}/{siblingInfo.siblings.length}
      </AppText>
      <IconButton
        iconName='chevronRight'
        className='p-0'
        iconProps={{ className: 'color-text-secondary' }}
        onPress={() => onNextSibling?.(message)}
      />
    </View>
  );
}

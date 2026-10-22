import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import * as Clipboard from 'expo-clipboard';
import { ReactElement, ReactNode } from 'react';
import { cn } from '@open-webui-react-native/mobile/shared/ui/styles';
import { View, AppText, TouchableHighlight } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { ToastService } from '@open-webui-react-native/shared/utils/toast-service';

interface CodeBlockHeaderProps {
  content: string;
  title?: string;
  actions?: ReactNode;
  className?: string;
}

/**
 * Code block header: an optional title on the left, `actions` and the Copy button on the right.
 */
export function CodeBlockHeader({ content, title, actions, className }: CodeBlockHeaderProps): ReactElement {
  const translate = useTranslation('SHARED.CODE_BLOCK');

  const handleCopy = async (): Promise<void> => {
    await Clipboard.setStringAsync(content);
    ToastService.showSuccess(translate('TEXT_COPIED_TO_CLIPBOARD'));
  };

  return (
    <View className={cn('flex-row items-center', className)}>
      {title && <AppText className='text-sm-sm sm:text-sm'>{title}</AppText>}
      <View className='flex-row items-center gap-4 ml-auto'>
        {actions}
        <TouchableHighlight
          className='p-4 rounded-lg'
          underlayColorClassName='color-background-tertiary'
          accessibilityRole='button'
          accessibilityLabel={translate('TEXT_COPY')}
          onPress={handleCopy}>
          <AppText className='text-sm-sm sm:text-sm'>{translate('TEXT_COPY')}</AppText>
        </TouchableHighlight>
      </View>
    </View>
  );
}

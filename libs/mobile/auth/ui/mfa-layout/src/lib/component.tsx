import { PropsWithChildren, ReactElement } from 'react';
import { AppKeyboardAwareScrollView, AppText, View } from '@open-webui-react-native/mobile/shared/ui/ui-kit';

interface MfaLayoutProps {
  title: string;
  description: string;
}

export function MfaLayout({ title, description, children }: PropsWithChildren<MfaLayoutProps>): ReactElement {
  return (
    <AppKeyboardAwareScrollView
      className='flex-1'
      contentContainerClassName='px-content-offset pt-32 pb-16'
      keyboardShouldPersistTaps='handled'
      bottomOffset={16}>
      <AppText className='text-h2-sm sm:text-h2 font-medium mb-24'>{title}</AppText>
      <View className='gap-24'>
        <AppText className='text-md-sm sm:text-md'>{description}</AppText>
        {children}
      </View>
    </AppKeyboardAwareScrollView>
  );
}

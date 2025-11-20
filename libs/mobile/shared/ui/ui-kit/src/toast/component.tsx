import { ReactElement } from 'react';
import Toast, { ToastConfig } from 'react-native-toast-message';
import { AppText } from '../text';
import { View } from '../view';

export function AppToast(): ReactElement {
  const toastConfig: ToastConfig = {
    info: ({ text1, props }): ReactElement => {
      return (
        <View className='w-full px-24' {...props}>
          <View className='w-full bg-background-secondary rounded-2xl py-16 px-24'>
            <AppText className='text-md-sm sm:text-md' adjustsFontSizeToFit>
              {text1}
            </AppText>
          </View>
        </View>
      );
    },
    error: ({ text1, props }): ReactElement => {
      return (
        <View className='w-full px-24' {...props}>
          <View className='w-full bg-status-danger-light rounded-2xl py-16 px-24'>
            <AppText className='text-md-sm sm:text-md text-status-error' adjustsFontSizeToFit>
              {text1}
            </AppText>
          </View>
        </View>
      );
    },
    success: ({ text1, props }): ReactElement => {
      return (
        <View className='w-full px-24' {...props}>
          <View className='w-full bg-status-success-light rounded-2xl py-16 px-24'>
            <AppText className='text-md-sm sm:text-md text-status-success' adjustsFontSizeToFit>
              {text1}
            </AppText>
          </View>
        </View>
      );
    },
  };

  return (
    <View className='absolute top-safe-offset-16 bot-0 left-0 right-0 w-full'>
      <Toast config={toastConfig} />
    </View>
  );
}

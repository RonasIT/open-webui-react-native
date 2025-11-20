import { ReactElement } from 'react';
import { Rect } from 'react-content-loader/native';
import { colors, useColorScheme } from '@open-web-ui-mobile-client-react-native/mobile/shared/ui/styles';
import { AppContentLoader, View } from '@open-web-ui-mobile-client-react-native/mobile/shared/ui/ui-kit';

export function ImageSkeleton(): ReactElement {
  const { isDarkColorScheme } = useColorScheme();

  return (
    <View className='h-[200] w-full'>
      <View className='h-[200] w-full absolute'>
        <AppContentLoader
          speed={1}
          backgroundColor={isDarkColorScheme ? colors.gray700 : colors.skeletonBackground}
          foregroundColor={isDarkColorScheme ? colors.gray500 : colors.skeletonHighlight}>
          <Rect
            x='0'
            y='0'
            rx='8'
            ry='8'
            width={'100%'}
            height={'100%'} />
        </AppContentLoader>
      </View>
    </View>
  );
}

import { ReactElement } from 'react';
import { Rect } from 'react-content-loader/native';
import { colors, useColorScheme } from '@open-web-ui-mobile-client-react-native/mobile/shared/ui/styles';
import { AppContentLoader } from '@open-web-ui-mobile-client-react-native/mobile/shared/ui/ui-kit';

export function SkeletonMessage(): ReactElement {
  const { isDarkColorScheme } = useColorScheme();

  return (
    <AppContentLoader
      className='flex-1 h-[80px] my-8'
      speed={1}
      viewBox='0 0 400 80'
      backgroundColor={isDarkColorScheme ? colors.gray700 : colors.skeletonBackground}
      foregroundColor={isDarkColorScheme ? colors.gray500 : colors.skeletonHighlight}>
      <Rect
        x='0'
        y='0'
        rx='8'
        ry='8'
        width='340'
        height='12' />
      <Rect
        x='0'
        y='20'
        rx='8'
        ry='8'
        width='260'
        height='12' />
      <Rect
        x='276'
        y='20'
        rx='8'
        ry='8'
        width='112'
        height='12' />
      <Rect
        x='0'
        y='40'
        rx='8'
        ry='8'
        width='85'
        height='12' />
      <Rect
        x='97'
        y='40'
        rx='8'
        ry='8'
        width='178'
        height='12' />
      <Rect
        x='287'
        y='40'
        rx='8'
        ry='8'
        width='85'
        height='12' />
      <Rect
        x='0'
        y='60'
        rx='8'
        ry='8'
        width='400'
        height='12' />
    </AppContentLoader>
  );
}

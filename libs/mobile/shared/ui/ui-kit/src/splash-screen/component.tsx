import { ReactElement } from 'react';
import { useColorScheme } from '@open-webui-react-native/mobile/shared/ui/styles';
import { Images } from '../assets';
import { AppImage } from '../image';
import { AppScreen } from '../screen';

export function AppSplashScreen(): ReactElement {
  const { isDarkColorScheme } = useColorScheme();

  return (
    <AppScreen scrollDisabled className='justify-center items-center'>
      <AppImage source={isDarkColorScheme ? Images.aiLogoDark : Images.aiLogo} className='w-[100px] h-[100px]' />
    </AppScreen>
  );
}

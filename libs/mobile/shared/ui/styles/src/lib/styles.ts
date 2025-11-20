import { Dimensions } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { createStyles } from './extended-stylesheet';
import { spacings } from './variables';

const smallScreenWidth = 375;
const mediumScreenWidth = 390;
const smallScreenHeight = 812;
export const screenWidth = Dimensions.get('window').width;
export const screenHeight = Dimensions.get('window').height;
export const isSmallScreen = screenWidth < smallScreenWidth;
export const isMediumScreen = screenWidth < mediumScreenWidth;
export const isSmallScreenHeight = screenHeight <= smallScreenHeight;
export const rem = isMediumScreen ? 14 : 16;
export const headerVerticalPadding = 0.625 * rem;

EStyleSheet.build({
  $rem: rem,
  $screenWidth: screenWidth,
});

export const commonStyle = createStyles({
  container: {
    paddingHorizontal: spacings.contentOffset,
  },
  fullFlex: {
    flex: 1,
  },
  fullWidth: {
    width: '100%',
  },
});

export const getResponsiveWidth = (width: number) => screenWidth * (width / 100);
export const getResponsiveHeight = (height: number) => screenHeight * (height / 100);

import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { ReactElement, useMemo } from 'react';
import { Citation } from '@open-web-ui-mobile-client-react-native/mobile/chat/features/use-citations';
import { cn } from '@open-web-ui-mobile-client-react-native/mobile/shared/ui/styles';
import {
  AppModal,
  AppModalProps,
  AppScrollView,
  AppText,
  View,
} from '@open-web-ui-mobile-client-react-native/mobile/shared/ui/ui-kit';
import { calculatePercentage, getRelevanceColor } from './utils';

interface SourceCitationModalProps extends AppModalProps {
  citation: Citation;
}

// TODO: Implement file downloading by pressing filename, related task: https://app.clickup.com/t/24336023/PRD-1825
export const SourceCitationModal = ({ citation, ...modalProps }: SourceCitationModalProps): ReactElement => {
  const translate = useTranslation('CHAT.SOURCE_CITATION_MODAL');

  const relevancePercentage = useMemo(
    () => citation?.distances?.[0] && calculatePercentage(citation?.distances?.[0]),
    [citation.distances],
  );

  return (
    <AppModal {...modalProps}>
      <View className='gap-8'>
        <AppText className='font-medium text-lg-sm sm:text-lg'>{translate('TEXT_CITATION')}</AppText>
        <View className='gap-4'>
          <AppText className='font-medium text-md-sm sm:text-md'>{translate('TEXT_SOURCE')}</AppText>
          <AppText className='text-md-sm sm:text-md'>{citation.source.name}</AppText>
        </View>
        {relevancePercentage && (
          <View className='gap-4'>
            <AppText className='font-medium text-md-sm sm:text-md'>{translate('TEXT_RELEVANCE')}</AppText>
            <AppText
              className={cn('rounded-md px-4 py-[2] self-start text-center', getRelevanceColor(relevancePercentage))}>
              {relevancePercentage}%
            </AppText>
          </View>
        )}
        <View className='gap-4'>
          <AppText className='font-medium text-md-sm sm:text-md'>{translate('TEXT_CONTENT')}</AppText>
          <AppScrollView className='max-h-[300]'>
            <AppText className='text-text-primary'>
              {citation.document || translate('TEXT_NO_PREVIEW_AVAILABLE')}
            </AppText>
          </AppScrollView>
        </View>
      </View>
    </AppModal>
  );
};

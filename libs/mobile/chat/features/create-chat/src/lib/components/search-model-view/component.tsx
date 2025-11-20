import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { ReactElement } from 'react';
import {
  AppPressable,
  AppText,
  FullScreenSearchModal,
  FullScreenSearchModalProps,
  Icon,
  View,
} from '@open-web-ui-mobile-client-react-native/mobile/shared/ui/ui-kit';
import { AIModel, modelsApi } from '@open-web-ui-mobile-client-react-native/shared/data-access/api';

type SearchModelViewProps = Omit<FullScreenSearchModalProps<AIModel>, 'searchPlaceholder' | 'data' | 'renderTrigger'>;

export function SearchModelView({ selectedItemId, ...props }: SearchModelViewProps): ReactElement {
  const translate = useTranslation('CHAT.CREATE_CHAT.SEARCH_MODEL_VIEW');

  const { data: models } = modelsApi.useGetModels();

  const selectedModelName = models?.find((model) => model.id === selectedItemId)?.name;

  const renderTrigger = ({ onPress }: { onPress: () => void }): ReactElement => (
    <AppPressable className='flex-row items-center px-content-offset' onPress={onPress}>
      <AppText numberOfLines={1} className='text-h1-sm sm:text-h1 font-medium mr-8 max-w-[90%]'>
        {selectedModelName || translate('TEXT_SELECT_A_MODEL')}
      </AppText>
      <Icon name='chevronDown' />
    </AppPressable>
  );

  return (
    <View className='pb-[51px] items-center'>
      <FullScreenSearchModal
        data={models || []}
        selectedItemId={selectedItemId}
        renderTrigger={renderTrigger}
        searchPlaceholder={translate('TEXT_SEARCH_MODEL')}
        {...props}
      />
    </View>
  );
}

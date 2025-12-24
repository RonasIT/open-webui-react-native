import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { shuffle, take } from 'lodash-es';
import { ReactElement, useMemo } from 'react';
import { cn } from '@open-webui-react-native/mobile/shared/ui/styles';
import { AppText, View } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { appConfigurationApi } from '@open-webui-react-native/shared/data-access/api';
import { SuggestionsItemProps, SuggestionItem } from './components';
import { suggestionsListConfig } from './config';

interface SuggestionsListProps {
  onPress: (content: string) => void;
  searchText?: string;
  containerClassName?: string;
}

export function SuggestionsList({
  onPress,
  searchText = '',
  containerClassName,
}: SuggestionsListProps): ReactElement | null {
  const translate = useTranslation('CHAT.CREATE_CHAT.SUGGESTIONS_LIST');
  const { data } = appConfigurationApi.useGetAppConfiguration();

  const allSuggestions: Array<SuggestionsItemProps> = useMemo(() => {
    if (!data?.defaultPromptSuggestions) return [];

    return data.defaultPromptSuggestions.map((item) => ({
      title: item.title[0],
      subtitle: item.title[1],
      content: item.content,
      onPress,
    }));
  }, [data, onPress]);

  const suggestions: Array<SuggestionsItemProps> = useMemo(() => {
    if (!searchText.trim()) {
      return take(shuffle(allSuggestions), suggestionsListConfig.itemsToShow);
    }

    const searchLower = searchText.toLowerCase();

    const filtered = allSuggestions.filter((suggestion) =>
      [suggestion.title, suggestion.subtitle, suggestion.content].some((text) =>
        text.toLowerCase().includes(searchLower),
      ),
    );

    if (filtered.length >= suggestionsListConfig.itemsToShow) {
      return filtered.slice(0, suggestionsListConfig.itemsToShow);
    }

    const existingTitles = new Set(filtered.map((s) => s.title));
    const additional = allSuggestions.filter((s) => !existingTitles.has(s.title));

    return [...filtered, ...take(additional, suggestionsListConfig.itemsToShow - filtered.length)];
  }, [allSuggestions, searchText]);

  if (suggestions.length === 0) return null;

  return (
    <View className={cn(containerClassName)}>
      <AppText className='text-text-secondary text-sm-sm sm:text-sm px-12 py-8'>{translate('TEXT_SUGGESTED')}</AppText>
      {suggestions.map((suggestion) => (
        <SuggestionItem key={suggestion.title} {...suggestion} />
      ))}
    </View>
  );
}

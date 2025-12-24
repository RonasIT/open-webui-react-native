import { ReactElement } from 'react';
import { AppPressable, AppText } from '@open-webui-react-native/mobile/shared/ui/ui-kit';

export interface SuggestionsItemProps {
  title: string;
  subtitle: string;
  content: string;
  onPress: (content: string) => void;
}

export function SuggestionItem({ title, subtitle, content, onPress }: SuggestionsItemProps): ReactElement {
  const handleItemPress = (): void => {
    onPress(content);
  };

  return (
    <AppPressable onPress={handleItemPress} className='active:opacity-1 active:bg-background-secondary p-12 rounded-lg'>
      <AppText className='font-medium align-middle leading-[26px]'>{title}</AppText>
      <AppText className='text-sm-sm sm:text-sm'>{subtitle}</AppText>
    </AppPressable>
  );
}

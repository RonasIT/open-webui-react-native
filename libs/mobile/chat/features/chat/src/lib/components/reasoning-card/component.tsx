import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { ReactElement, useState } from 'react';
import { AppMarkdownView } from '@open-webui-react-native/mobile/shared/features/markdown-view';
import { cn, colors, useColorScheme } from '@open-webui-react-native/mobile/shared/ui/styles';
import { AppPressable, AppSpinner, AppText, Icon, View } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { getReasoningLabel, ReasoningView } from '../../utils';

interface ReasoningCardProps {
  reasoning: ReasoningView;
}

export function ReasoningCard({ reasoning }: ReasoningCardProps): ReactElement {
  const translate = useTranslation('CHAT.AI_MESSAGE.REASONING_CARD');
  const [isExpanded, setIsExpanded] = useState(false);
  const { isDarkColorScheme } = useColorScheme();

  const { isDone, text } = reasoning;
  const { key: labelKey, count } = getReasoningLabel(reasoning);
  const hasText = Boolean(text);
  const textColor = isDarkColorScheme ? colors.darkTextSecondary : colors.textSecondary;

  const toggleExpanded = (): void => setIsExpanded((wasExpanded) => !wasExpanded);

  return (
    <View className='rounded-xl bg-background-secondary'>
      <AppPressable
        onPress={toggleExpanded}
        disabled={!hasText}
        accessibilityRole='button'
        accessibilityState={{ expanded: isExpanded, disabled: !hasText }}
        className={cn('flex-row items-center gap-8 px-12 py-10', hasText && 'active:opacity-70')}>
        {!isDone && <AppSpinner size='small' color={textColor} />}
        <AppText className='text-sm-sm sm:text-sm min-w-0 flex-1 text-text-secondary'>
          {translate(labelKey, { count })}
        </AppText>
        {hasText && (
          <Icon
            name='chevronDown'
            className={cn('size-16 shrink-0 color-text-secondary', isExpanded ? 'rotate-180' : 'rotate-0')}
          />
        )}
      </AppPressable>
      {isExpanded && hasText && (
        <View
          className='mx-12 mb-12 border-l-2 pl-10'
          style={{ borderColor: isDarkColorScheme ? colors.gray500 : colors.textTertiary }}>
          <AppMarkdownView isContentReady={isDone} textColor={textColor}>
            {text}
          </AppMarkdownView>
        </View>
      )}
    </View>
  );
}

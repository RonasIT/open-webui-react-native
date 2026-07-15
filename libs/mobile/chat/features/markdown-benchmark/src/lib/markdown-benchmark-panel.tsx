import { ReactElement, useState } from 'react';
import { Switch } from 'react-native';
import { AppPressable, AppText, View } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { MAX_SPEED, MIN_SPEED, useMarkdownBenchmark } from './markdown-benchmark-context';

function PanelButton({ label, onPress }: { label: string; onPress: () => void }): ReactElement {
  return (
    <AppPressable className='py-6 px-8 rounded-md bg-background-tertiary items-center' onPress={onPress}>
      <AppText className='text-xs font-medium text-text-primary'>{label}</AppText>
    </AppPressable>
  );
}

export function MarkdownBenchmarkPanel(): ReactElement | null {
  const [isExpanded, setIsExpanded] = useState(false);

  const { autoScrollEnabled, setAutoScrollEnabled, autoScrollSpeed, setAutoScrollSpeed, scrollToTop } =
    useMarkdownBenchmark();

  if (!__DEV__) {
    return null;
  }

  const toggleExpanded = (): void => setIsExpanded((value) => !value);
  const decreaseSpeed = (): void => setAutoScrollSpeed(autoScrollSpeed - 25);
  const increaseSpeed = (): void => setAutoScrollSpeed(autoScrollSpeed + 25);

  return (
    <View pointerEvents='box-none' className='absolute bottom-[150] right-16 left-16 z-50'>
      <View className='bg-background-secondary border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden'>
        <AppPressable className='flex-row items-center justify-between p-12' onPress={toggleExpanded}>
          <AppText className='text-xs font-semibold text-text-secondary'>Markdown benchmark</AppText>
          <AppText className='text-xs text-text-secondary'>{isExpanded ? '▲' : '▼'}</AppText>
        </AppPressable>

        {isExpanded && (
          <View className='px-12 pb-12 gap-10 border-t border-gray-200 dark:border-gray-700 pt-10'>
            <View className='flex-row items-center justify-between'>
              <AppText className='text-xs text-text-primary'>Auto-scroll ↑</AppText>
              <Switch value={autoScrollEnabled} onValueChange={setAutoScrollEnabled} />
            </View>

            <View className='flex-row items-center justify-between gap-8'>
              <AppText className='text-xs text-text-primary'>Speed</AppText>
              <View className='flex-row items-center gap-8'>
                <PanelButton label='−' onPress={decreaseSpeed} />
                <AppText className='text-xs text-text-primary min-w-[40] text-center'>{autoScrollSpeed}</AppText>
                <PanelButton label='+' onPress={increaseSpeed} />
              </View>
            </View>
            <AppText className='text-[10px] text-text-secondary text-center'>
              {MIN_SPEED}–{MAX_SPEED} px/s
            </AppText>

            <PanelButton label='Scroll to top' onPress={scrollToTop} />
          </View>
        )}
      </View>
    </View>
  );
}

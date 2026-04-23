import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { Fragment, ReactElement, ReactNode, useRef } from 'react';
import {
  AppBottomSheet,
  AppPressable,
  AppSafeAreaView,
  AppText,
  Icon,
  SheetHeader,
  View,
} from '@open-webui-react-native/mobile/shared/ui/ui-kit';

export interface ToolOutputBottomSheetProps {
  toolName: string;
  input?: string;
  output: string;
}

export function ToolOutputBottomSheet({ toolName, input, output }: ToolOutputBottomSheetProps): ReactElement {
  const translate = useTranslation('CHAT.AI_MESSAGE.TOOL_OUTPUT_SHEET');
  const sheetRef = useRef<BottomSheetModal>(null);

  const renderTrigger = ({ onPress }: { onPress: () => void }): ReactNode => (
    <AppPressable
      onPress={onPress}
      className='flex-row items-center gap-8 rounded-xl bg-background-secondary px-12 py-10 active:opacity-70'>
      <Icon name='tick' className='size-20 shrink-0 color-emerald-500' />
      <View className='min-w-0 flex-1 flex-row flex-wrap items-center'>
        <AppText className='text-sm-sm sm:text-sm text-text-secondary'>{translate('TEXT_VIEW_RESULT_PREFIX')} </AppText>
        <AppText className='text-sm-sm sm:text-sm font-mono font-semibold text-text-primary'>{toolName}</AppText>
      </View>
      <Icon name='chevronDown' className='size-16 shrink-0 color-text-secondary' />
    </AppPressable>
  );

  return (
    <AppBottomSheet
      ref={sheetRef}
      isModal={true}
      isScrollable={true}
      snapPoints={['100%']}
      renderTrigger={renderTrigger}
      content={
        <View className='flex-1 bg-background-primary'>
          <SheetHeader title={toolName} onGoBack={() => sheetRef.current?.close()} />
          <BottomSheetScrollView className='flex-1' contentContainerClassName='pb-safe pt-8 android:pb-24'>
            <AppSafeAreaView edges={['bottom']}>
              {!!input && (
                <Fragment>
                  <AppText className='mb-8 text-xs font-medium uppercase tracking-wide text-text-secondary'>
                    {translate('TEXT_INPUT')}
                  </AppText>
                  <AppText selectable className='mb-16 text-sm-sm sm:text-sm font-mono text-text-primary'>
                    {input}
                  </AppText>
                </Fragment>
              )}
              <AppText className='mb-8 text-xs font-medium uppercase tracking-wide text-text-secondary'>
                {translate('TEXT_OUTPUT')}
              </AppText>
              <AppText selectable className='text-sm-sm sm:text-sm font-mono text-text-primary'>
                {output}
              </AppText>
            </AppSafeAreaView>
          </BottomSheetScrollView>
        </View>
      }
    />
  );
}

import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { ForwardedRef, ReactElement, useImperativeHandle, useMemo, useRef, useState } from 'react';
import {
  AppBottomSheet,
  AppBottomSheetKeyboardAwareScrollView,
  AppBottomSheetPropsType,
  AppPressable,
  AppSafeAreaView,
  AppText,
  Icon,
  SheetHeader,
  View,
} from '@open-webui-react-native/mobile/shared/ui/ui-kit';

export type SelectionSheetItem<T extends string = string> = {
  value: T;
  label: string;
};

export type SelectionSheetMethods = {
  present: () => void;
};

export type SelectionSheetRef = ForwardedRef<SelectionSheetMethods>;

export type SelectionSheetProps<T extends string = string> = Partial<Omit<AppBottomSheetPropsType, 'ref'>> & {
  title: string;
  items: ReadonlyArray<SelectionSheetItem<T>>;
  selectedValue: T;
  onConfirm: (value: T) => void;
  ref?: SelectionSheetRef;
};

export function SelectionSheet<T extends string = string>({
  title,
  items,
  selectedValue,
  onConfirm,
  ref,
  ...props
}: SelectionSheetProps<T>): ReactElement {
  const sheetRef = useRef<BottomSheetModal>(null);
  const [selectedId, setSelectedId] = useState<T>(selectedValue);

  const selectedLabel = useMemo(() => items.find((item) => item.value === selectedId)?.label, [items, selectedId]);

  const closeSheet = (): void => sheetRef.current?.close();

  useImperativeHandle(
    ref,
    () => ({
      present: () => {
        setSelectedId(selectedValue);
        sheetRef.current?.present();
      },
    }),
    [selectedValue],
  );

  const handleConfirmPress = (): void => {
    onConfirm(selectedId);
    closeSheet();
  };

  return (
    <AppBottomSheet
      {...props}
      isModal
      ref={sheetRef}
      isScrollable
      snapPoints={['100%']}
      content={
        <View className='flex-1 bg-background-primary'>
          <SheetHeader
            title={title}
            onGoBack={closeSheet}
            onConfirmPress={handleConfirmPress} />
          <AppBottomSheetKeyboardAwareScrollView>
            <AppSafeAreaView edges={['bottom']}>
              <View className='pb-16'>
                {items.map((item) => (
                  <AppPressable
                    key={item.value}
                    onPress={() => setSelectedId(item.value)}
                    className='flex-row items-center gap-16 py-16'>
                    <AppText numberOfLines={1} className='flex-1'>
                      {item.label}
                    </AppText>
                    {selectedId === item.value && <Icon name='checkedSmall' className='shrink-0' />}
                  </AppPressable>
                ))}
              </View>
              {/* Helps prevent empty bottom-space glitches on iOS keyboards */}
              {!!selectedLabel && <View />}
            </AppSafeAreaView>
          </AppBottomSheetKeyboardAwareScrollView>
        </View>
      }
    />
  );
}

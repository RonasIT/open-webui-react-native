import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { Fragment, PropsWithChildren, ReactElement } from 'react';
import { useWindowDimensions } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomInset } from '@open-webui-react-native/mobile/shared/utils/use-bottom-inset';
import { AppBottomSheet, AppBottomSheetModalProps, AppBottomSheetProps } from '../bottom-sheet';
import { AppText } from '../text';
import { View } from '../view';
import { ActionSheetItem, ActionSheetItemProps } from './components';

// NOTE: `key` is needed when titles may repeat, e.g. labels set by an admin; defaults to the title.
export type ActionsBottomSheetAction = ActionSheetItemProps & { key?: string };

export type ActionsBottomSheetProps = PropsWithChildren<Partial<AppBottomSheetProps>> &
  Partial<AppBottomSheetModalProps> & {
    actions: Array<ActionsBottomSheetAction>;
    withSeparator?: boolean;
    areActionsDisabled?: boolean;
    areActionsInactive?: boolean;
    onClose?: () => void;
    closeButtonText?: string;
    title?: string;
    description?: string;
    ref?: React.RefObject<BottomSheetModal | null>;
  };

// NOTE: Cancel button (64) + its top margin (16) + a gap above the card (24).
const reservedHeight = 104;

export function ActionsBottomSheet({
  renderTrigger,
  actions,
  withSeparator,
  areActionsDisabled,
  areActionsInactive,
  onClose,
  closeButtonText,
  title,
  description,
  ref,
  ...restProps
}: ActionsBottomSheetProps): ReactElement {
  const translate = useTranslation('SHARED.COMMON.ACTIONS_BOTTOM_SHEET');
  const { height: windowHeight } = useWindowDimensions();
  const { top } = useSafeAreaInsets();
  const bottomInset = useBottomInset();

  // NOTE: A long list scrolls inside the card, so Cancel always stays on screen.
  const cardMaxHeight = windowHeight - top - bottomInset - reservedHeight;

  const handleSheetClose = (): void => {
    onClose?.();
    ref?.current?.close();
  };

  const renderActionComponent = ({
    key,
    disabled,
    isLoading,
    isInactive,
    ...action
  }: ActionsBottomSheetAction): ReactElement => (
    <ActionSheetItem
      key={key ?? action.title}
      disabled={areActionsDisabled || disabled || isLoading}
      isInactive={areActionsInactive || isInactive}
      isLoading={isLoading}
      {...action}
    />
  );

  return (
    <AppBottomSheet
      ref={ref}
      renderTrigger={renderTrigger}
      withoutBackground
      className='pt-[0px]'
      enablePanDownToClose={false}
      // NOTE: The sheet does not move by content drags, so the list below gets the scroll gesture.
      enableContentPanningGesture={false}
      content={
        <Fragment>
          <View style={{ maxHeight: cardMaxHeight }} className='rounded-2xl overflow-hidden'>
            {(title || description) && (
              <View className='bg-background-primary px-24 py-20 gap-4'>
                {title && <AppText className='text-sm-sm sm:text-sm'>{title}</AppText>}
                {description && <AppText className='text-sm-sm sm:text-sm text-text-secondary'>{description}</AppText>}
              </View>
            )}
            <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
              {actions.map(renderActionComponent)}
            </ScrollView>
          </View>
          <ActionSheetItem
            isCentered
            title={closeButtonText || translate('BUTTON_CANCEL')}
            onPress={handleSheetClose}
            className='mt-16 rounded-2xl'
          />
        </Fragment>
      }
      {...restProps}
    />
  );
}

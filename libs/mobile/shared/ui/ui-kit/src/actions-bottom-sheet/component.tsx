import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { Fragment, PropsWithChildren, ReactElement } from 'react';
import { AppBottomSheet, AppBottomSheetModalProps, AppBottomSheetProps } from '../bottom-sheet';
import { AppText } from '../text';
import { View } from '../view';
import { ActionSheetItem, ActionSheetItemProps } from './components';

export type ActionsBottomSheetProps = PropsWithChildren<Partial<AppBottomSheetProps>> &
  Partial<AppBottomSheetModalProps> & {
    actions: Array<ActionSheetItemProps>;
    title?: string;
    ref?: React.RefObject<BottomSheetModal | null>;
    withSeparator?: boolean;
    onClose?: () => void;
    areActionsDisabled?: boolean;
  };

export function ActionsBottomSheet({
  actions,
  title,
  renderTrigger,
  ref,
  withSeparator,
  onClose,
  areActionsDisabled,
  ...restProps
}: ActionsBottomSheetProps): ReactElement {
  const translate = useTranslation('SHARED.COMMON.ACTIONS_BOTTOM_SHEET');

  const handleSheetClose = (): void => {
    onClose?.();
    ref?.current?.close();
  };

  const renderActionComponent = ({ disabled, isLoading, ...action }: ActionSheetItemProps): ReactElement => (
    <ActionSheetItem
      key={action.title}
      disabled={areActionsDisabled || disabled || isLoading}
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
      content={
        <Fragment>
          <View className='rounded-2xl overflow-hidden'>
            {!!title && (
              <View className='bg-background-primary border-b border-background-tertiary px-24 pt-20 pb-14'>
                <AppText className='text-h3-sm sm:text-h3 font-medium text-center'>{title}</AppText>
              </View>
            )}
            {actions.map(renderActionComponent)}
          </View>
          <ActionSheetItem
            isCentered
            title={translate('BUTTON_CANCEL')}
            onPress={handleSheetClose}
            className='mt-16 rounded-2xl'
          />
        </Fragment>
      }
      {...restProps}
    />
  );
}

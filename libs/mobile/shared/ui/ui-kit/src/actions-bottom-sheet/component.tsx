import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { Fragment, PropsWithChildren, ReactElement } from 'react';
import { AppBottomSheet, AppBottomSheetModalProps, AppBottomSheetProps } from '../bottom-sheet';
import { View } from '../view';
import { ActionSheetItem, ActionSheetItemProps } from './components';

export type ActionsBottomSheetProps = PropsWithChildren<Partial<AppBottomSheetProps>> &
  Partial<AppBottomSheetModalProps> & {
    actions: Array<ActionSheetItemProps>;
    withSeparator?: boolean;
    areActionsDisabled?: boolean;
    onClose?: () => void;
    closeButtonText?: string;
    ref?: React.RefObject<BottomSheetModal | null>;
  };

export function ActionsBottomSheet({
  renderTrigger,
  actions,
  withSeparator,
  areActionsDisabled,
  onClose,
  closeButtonText,
  ref,
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
          <View className='rounded-2xl overflow-hidden'>{actions.map(renderActionComponent)}</View>
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

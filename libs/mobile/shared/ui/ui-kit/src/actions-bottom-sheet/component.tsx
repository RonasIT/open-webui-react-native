import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { Fragment, PropsWithChildren, ReactElement } from 'react';
import { AppBottomSheet, AppBottomSheetProps } from '../bottom-sheet';
import { View } from '../view';
import { ActionSheetItem, ActionSheetItemProps } from './components';

export type ActionsBottomSheetProps = PropsWithChildren<Partial<AppBottomSheetProps>> & {
  actions: Array<ActionSheetItemProps>;
  ref?: React.RefObject<TrueSheet | null>;
  withSeparator?: boolean;
  onClose?: () => void;
  areActionsDisabled?: boolean;
};

export function ActionsBottomSheet({
  actions,
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
    ref?.current?.dismiss();
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
      content={
        <Fragment>
          <View className='rounded-2xl overflow-hidden'>{actions.map(renderActionComponent)}</View>
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

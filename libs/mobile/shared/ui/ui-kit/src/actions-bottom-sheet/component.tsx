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
    withSeparator?: boolean;
    areActionsDisabled?: boolean;
    onClose?: () => void;
    closeButtonText?: string;
    title?: string;
    description?: string;
    ref?: React.RefObject<BottomSheetModal | null>;
  };

export function ActionsBottomSheet({
  renderTrigger,
  actions,
  withSeparator,
  areActionsDisabled,
  onClose,
  closeButtonText,
  title,
  description,
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
          <View className='rounded-2xl overflow-hidden'>
            {(title || description) && (
              <View className='bg-background-primary px-24 py-20 gap-8'>
                {title && <AppText className='text-md-sm sm:text-md font-medium'>{title}</AppText>}
                {description && <AppText className='text-sm-sm sm:text-sm text-text-secondary'>{description}</AppText>}
              </View>
            )}
            {actions.map(renderActionComponent)}
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

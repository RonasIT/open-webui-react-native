import { flatMap, uniqWith } from 'lodash';
import React, { ReactElement, useCallback, useMemo } from 'react';
import { cn } from '@open-webui-react-native/mobile/shared/ui/styles';
import {
  AppFlashList,
  AppFlashListProps,
  AppText,
  View,
  AppTextProps,
  AppBottomSheetFlashList,
} from '@open-webui-react-native/mobile/shared/ui/ui-kit';

export interface DateSectionListProps<TItem> extends Omit<AppFlashListProps<TItem>, 'ref'> {
  renderItem: (
    info: { item: TItem; index: number } & { isFirstInSection?: boolean } & { isLastInSection?: boolean },
  ) => ReactElement;
  transformSectionTitle: (item: TItem) => string;
  data: Array<TItem>;
  sectionTitleProps?: AppTextProps;
  accessoryTop?: ReactElement;
  inverted?: boolean;
  isInModal?: boolean;
  ref?: React.RefObject<React.FC<object>> | any;
}

export function DateSectionList<TItem>({
  data,
  renderItem,
  sectionTitleProps,
  transformSectionTitle,
  accessoryTop,
  inverted,
  isInModal,
  ...restProps
}: DateSectionListProps<TItem>): ReactElement {
  const ListComponent = isInModal ? AppBottomSheetFlashList : AppFlashList;

  const sectionedData = useMemo(() => {
    const formattedData: Array<ReactElement | TItem | string> = uniqWith(
      inverted
        ? flatMap(data, (item) => [item, transformSectionTitle(item)]).reverse()
        : flatMap(data, (item) => [transformSectionTitle(item), item]),
    );

    if (accessoryTop) {
      formattedData.unshift(accessoryTop);
    }

    return inverted ? formattedData.reverse() : formattedData;
  }, [data, transformSectionTitle, inverted, accessoryTop]);

  const renderListItem = useCallback(
    ({ item, index }: { item: TItem | string; index: number }) => {
      return (
        <View>
          {React.isValidElement(item) ? (
            item
          ) : typeof item === 'string' ? (
            <AppText className={cn('text-md-sm sm:text-sm text-text-secondary my-8 mx-16')} {...sectionTitleProps}>
              {item}
            </AppText>
          ) : (
            renderItem({
              item,
              index,
              isFirstInSection: typeof sectionedData[index - 1] === 'string',
              isLastInSection: typeof sectionedData[index + 1] === 'string' || index === sectionedData.length - 1,
            })
          )}
        </View>
      );
    },
    [sectionedData, renderItem, sectionTitleProps],
  );

  return <ListComponent
    data={sectionedData as Array<TItem>}
    renderItem={renderListItem}
    {...restProps} />;
}

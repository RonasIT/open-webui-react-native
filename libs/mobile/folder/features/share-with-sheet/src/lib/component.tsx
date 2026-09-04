import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { compact, xor } from 'lodash-es';
import { ForwardedRef, ReactElement, useImperativeHandle, useRef, useState } from 'react';
import { Keyboard } from 'react-native';
import { AccessRow } from '@open-webui-react-native/mobile/folder/ui/access-row';
import {
  AppBottomSheet,
  AppBottomSheetFlashList,
  AppBottomSheetPropsType,
  AppButton,
  AppSafeAreaView,
  AppSpinner,
  AppText,
  ListEmptyComponent,
  SearchInput,
  SheetHeader,
  View,
} from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import {
  AccessGrant,
  authApi,
  getUserAvatarSource,
  groupsApi,
  PrincipalType,
  usersApi,
} from '@open-webui-react-native/shared/data-access/api';
import { useDebouncedQuery } from '@open-webui-react-native/shared/utils/use-debounced-query';
import { ShareWithItemType } from './enums';
import { ShareWithListItem, ShareWithSelection } from './types';

export type ShareWithSheetMethods = {
  present: (grants: Array<AccessGrant>) => void;
};

export type ShareWithSheetRef = ForwardedRef<ShareWithSheetMethods>;

export type ShareWithSheetProps = Partial<Omit<AppBottomSheetPropsType, 'ref'>> & {
  onAdd: (selection: ShareWithSelection) => void;
  ref?: ShareWithSheetRef;
};

export function ShareWithSheet({ onAdd, ref, ...props }: ShareWithSheetProps): ReactElement {
  const translate = useTranslation('FOLDER.SHARE_WITH_SHEET');
  const sheetRef = useRef<BottomSheetModal>(null);

  const [grants, setGrants] = useState<Array<AccessGrant>>([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState<Array<string>>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<Array<string>>([]);

  const { query, setQuery, debouncedQuery } = useDebouncedQuery({ delay: 300 });

  const { data: profile } = authApi.useGetProfile();
  const { data: groups, isLoading: isGroupsLoading } = groupsApi.useGetGroups();
  const {
    data: users,
    isLoading: isUsersLoading,
    isFetchingNextPage,
    fetchNextPage,
  } = usersApi.useSearchUsers(debouncedQuery);

  const isLoading = isGroupsLoading || isUsersLoading;

  const hasGrant = (principalType: PrincipalType, principalId: string): boolean =>
    grants.some((grant) => grant.principalType === principalType && grant.principalId === principalId);

  // NOTE: Groups come unpaginated, so they are filtered by the query locally; users are searched by the backend.
  const availableGroups = (groups ?? []).filter(
    (group) => !hasGrant(PrincipalType.GROUP, group.id) && new RegExp(query, 'i').test(group.name),
  );
  const availableUsers = (users ?? []).filter(
    (user) => !hasGrant(PrincipalType.USER, user.id) && user.id !== profile?.id,
  );

  const items = compact<ShareWithListItem>([
    availableGroups.length &&
      ({
        type: ShareWithItemType.TITLE,
        id: 'groups-title',
        title: translate('TEXT_GROUPS'),
      } as const),
    ...availableGroups.map((group) => ({ type: ShareWithItemType.GROUP, id: group.id, name: group.name }) as const),
    availableUsers.length &&
      ({
        type: ShareWithItemType.TITLE,
        id: 'users-title',
        title: translate('TEXT_USERS'),
      } as const),
    ...availableUsers.map((user) => ({ type: ShareWithItemType.USER, id: user.id, name: user.name }) as const),
  ]);

  const closeModal = (): void => sheetRef.current?.close();

  const resetSelection = (): void => {
    setSelectedGroupIds([]);
    setSelectedUserIds([]);
    setQuery('');
  };

  useImperativeHandle(ref, () => {
    return {
      present: (grants: Array<AccessGrant>) => {
        setGrants(grants);
        resetSelection();
        sheetRef.current?.present();
      },
    };
  }, []);

  const handleAddPress = (): void => {
    onAdd({ groupIds: selectedGroupIds, userIds: selectedUserIds });
    closeModal();
  };

  const onCancelPress = (): void => {
    setQuery('');
    Keyboard.dismiss();
  };

  const renderItem = ({ item }: { item: ShareWithListItem }): ReactElement => {
    if (item.type === ShareWithItemType.TITLE) {
      return <AppText className='text-sm-sm sm:text-sm text-text-secondary py-10'>{item.title}</AppText>;
    }

    const isGroup = item.type === ShareWithItemType.GROUP;
    const selectedIds = isGroup ? selectedGroupIds : selectedUserIds;
    const setSelectedIds = isGroup ? setSelectedGroupIds : setSelectedUserIds;

    return (
      <AccessRow
        name={item.name}
        isGroup={isGroup}
        avatarSource={isGroup ? undefined : getUserAvatarSource(item.id)}
        hasCheckbox
        isSelected={selectedIds.includes(item.id)}
        onPress={() => setSelectedIds((prev) => xor(prev, [item.id]))}
      />
    );
  };

  return (
    <AppBottomSheet
      {...props}
      isModal={true}
      ref={sheetRef}
      isScrollable
      snapPoints={['100%']}
      stackBehavior='push'
      content={
        <View className='flex-1 bg-background-primary'>
          <SheetHeader title={translate('TEXT_SHARE_WITH')} onGoBack={closeModal} />
          <SearchInput
            value={query}
            onChangeText={setQuery}
            isInBottomSheet
            onCancel={onCancelPress}
            placeholder={translate('TEXT_SEARCH')}
          />
          {isLoading ? (
            <View className='flex-1'>
              <AppSpinner isFullScreen />
            </View>
          ) : (
            <AppBottomSheetFlashList
              data={items}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
              onEndReached={fetchNextPage}
              ListFooterComponent={isFetchingNextPage ? <AppSpinner /> : null}
              ListEmptyComponent={
                <ListEmptyComponent containerClassName='mt-16' description={translate('TEXT_NOBODY_TO_SHARE_WITH')} />
              }
            />
          )}
          <AppSafeAreaView edges={['bottom']} className='gap-10 pt-8'>
            <AppText className='text-sm-sm sm:text-sm text-text-secondary text-center'>
              {translate('TEXT_SELECTED_COUNT', {
                groupsCount: selectedGroupIds.length,
                usersCount: selectedUserIds.length,
              })}
            </AppText>
            <AppButton
              text={translate('BUTTON_ADD_SELECTED')}
              disabled={!selectedGroupIds.length && !selectedUserIds.length}
              onPress={handleAddPress}
            />
          </AppSafeAreaView>
        </View>
      }
    />
  );
}

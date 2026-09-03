import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { useQueries } from '@tanstack/react-query';
import { uniq } from 'lodash-es';
import { ForwardedRef, ReactElement, useImperativeHandle, useRef, useState } from 'react';
import {
  ShareWithSheet,
  ShareWithSheetMethods,
  ShareWithSelection,
} from '@open-webui-react-native/mobile/folder/features/share-with-sheet';
import { AccessRow } from '@open-webui-react-native/mobile/folder/ui/access-row';
import {
  ActionsBottomSheet,
  ActionSheetItemProps,
  AppBottomSheet,
  AppBottomSheetKeyboardAwareScrollView,
  AppBottomSheetPropsType,
  AppButton,
  AppSpinner,
  AppText,
  Icon,
  SheetHeader,
  View,
} from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import {
  AccessGrant,
  AccessPermission,
  FolderListItem,
  foldersApi,
  foldersApiConfig,
  groupsApi,
  getUserAvatarSource,
  PrincipalType,
  usersApiConfig,
  usersService,
} from '@open-webui-react-native/shared/data-access/api';
import { queryClient } from '@open-webui-react-native/shared/data-access/query-client';
import { AccessListItem } from './types';
import { addAccessGrants, buildAccessList, removeAccessGrants, updateAccessPermission } from './utils';

export type ShareFolderSheetMethods = {
  present: (folder: FolderListItem) => void;
};

export type ShareFolderSheetRef = ForwardedRef<ShareFolderSheetMethods>;

export type ShareFolderSheetProps = Partial<Omit<AppBottomSheetPropsType, 'ref'>> & {
  ref?: ShareFolderSheetRef;
};

export function ShareFolderSheet({ ref, ...props }: ShareFolderSheetProps): ReactElement {
  const translate = useTranslation('FOLDER.SHARE_FOLDER_SHEET');
  const sheetRef = useRef<BottomSheetModal>(null);
  const shareWithSheetRef = useRef<ShareWithSheetMethods>(null);
  const permissionSheetRef = useRef<BottomSheetModal>(null);

  const [folder, setFolder] = useState<FolderListItem | undefined>();
  const [editedGrants, setEditedGrants] = useState<Array<AccessGrant> | undefined>();
  const [permissionItem, setPermissionItem] = useState<AccessListItem | undefined>();

  const closeModal = (): void => sheetRef.current?.close();

  const folderId = folder?.id ?? '';
  const { data: groups } = groupsApi.useGetGroups();
  const { data: folderDetail, isLoading: isFolderLoading } = foldersApi.useGetFolder(folderId, {
    enabled: !!folderId,
  });
  const { mutate: updateFolderAccess, isPending: isAccessUpdating } = foldersApi.useUpdateFolderAccess({
    onSuccess: closeModal,
  });

  const grants = editedGrants ?? folderDetail?.accessGrants ?? [];

  // NOTE: Grants carry ids only, so every granted user is resolved by id — the same way the web client does it.
  const grantedUserIds = uniq(
    grants.filter((grant) => grant.principalType === PrincipalType.USER).map((grant) => grant.principalId),
  );
  const userQueries = useQueries({
    queries: grantedUserIds.map((id) => ({
      queryKey: usersApiConfig.getUserInfoQueryKey(id),
      queryFn: () => usersService.getUserInfo(id),
      staleTime: 5 * 60 * 1000, // 5 minutes
    })),
  });

  const users = userQueries.flatMap(({ data }) => (data ? [data] : []));
  const accessList = buildAccessList({ grants, groups: groups ?? [], users: users ?? [] });

  const present = (folder: FolderListItem): void => {
    setFolder(folder);
    setEditedGrants(undefined);
    sheetRef.current?.present();
    // NOTE: The query is mounted for as long as the sheet is, so reopening the same folder would
    // otherwise render the grants cached on the previous open — including ones revoked elsewhere.
    queryClient.invalidateQueries({ queryKey: foldersApiConfig.getFolderQueryKey(folder.id) });
  };

  useImperativeHandle(ref, () => {
    return {
      present,
    };
  }, []);

  const handleConfirmPress = (): void => {
    if (folder) {
      updateFolderAccess({ id: folder.id, accessGrants: grants });
    }
  };

  const handleAddPress = (): void => shareWithSheetRef.current?.present(grants);

  const handleAdd = (selection: ShareWithSelection): void => setEditedGrants(addAccessGrants(grants, selection));

  const handleRemove = (item: AccessListItem): void =>
    setEditedGrants(removeAccessGrants(grants, item.principalType, item.id));

  const handlePermissionPress = (item: AccessListItem): void => {
    setPermissionItem(item);
    permissionSheetRef.current?.present();
  };

  const handlePermissionSelect = (permission: AccessPermission): void => {
    if (permissionItem) {
      setEditedGrants(updateAccessPermission(grants, permissionItem.principalType, permissionItem.id, permission));
    }

    permissionSheetRef.current?.close();
  };

  const permissionActions: Array<ActionSheetItemProps> = [AccessPermission.WRITE, AccessPermission.READ].map(
    (permission) => ({
      title: permission === AccessPermission.WRITE ? translate('TEXT_WRITE') : translate('TEXT_READ'),
      iconName: 'tick',
      iconProps: {
        className: permissionItem?.permission === permission ? 'color-text-primary' : 'color-transparent',
      },
      onPress: () => handlePermissionSelect(permission),
    }),
  );

  return (
    <AppBottomSheet
      {...props}
      isModal={true}
      ref={sheetRef}
      isScrollable
      snapPoints={['100%']}
      content={
        <View className='flex-1 bg-background-primary'>
          <SheetHeader
            title={translate('TEXT_SHARE_FOLDER')}
            onGoBack={closeModal}
            onConfirmPress={handleConfirmPress}
            confirmButtonProps={{ isLoading: isAccessUpdating }}
          />
          {isFolderLoading ? (
            <View className='flex-1'>
              <AppSpinner isFullScreen />
            </View>
          ) : (
            <AppBottomSheetKeyboardAwareScrollView>
              <View className='gap-24 pt-8'>
                <View className='items-center gap-24'>
                  <View className='bg-background-secondary h-64 w-64 items-center justify-center rounded-full'>
                    <Icon name='folder' />
                  </View>
                  <AppText className='text-h3-sm sm:text-h3 font-medium'>{folder?.name}</AppText>
                </View>
                <View className='bg-background-secondary flex-row items-center gap-16 rounded-lg px-12 py-8'>
                  <Icon name='lock' />
                  <View className='flex-1'>
                    <AppText>{translate('TEXT_PRIVATE')}</AppText>
                    <AppText className='text-sm-sm sm:text-sm text-text-secondary'>
                      {translate('TEXT_PRIVATE_DESCRIPTION')}
                    </AppText>
                  </View>
                </View>
                <View className='gap-12'>
                  <View className='flex-row items-center gap-12'>
                    <AppText className='text-sm-sm sm:text-sm flex-1'>{translate('TEXT_ACCESS_LIST')}</AppText>
                    <AppButton
                      variant='outline'
                      size='sm'
                      iconName='plus'
                      text={translate('BUTTON_ADD')}
                      onPress={handleAddPress}
                      className='px-16 py-4'
                    />
                  </View>
                  <View>
                    {accessList.map((item) => (
                      <AccessRow
                        key={`${item.principalType}-${item.id}`}
                        name={item.name}
                        isGroup={item.principalType === PrincipalType.GROUP}
                        avatarSource={
                          item.principalType === PrincipalType.USER ? getUserAvatarSource(item.id) : undefined
                        }
                        permissionLabel={
                          item.permission === AccessPermission.WRITE ? translate('TEXT_WRITE') : translate('TEXT_READ')
                        }
                        onPermissionPress={() => handlePermissionPress(item)}
                        onRemove={() => handleRemove(item)}
                      />
                    ))}
                  </View>
                </View>
              </View>
            </AppBottomSheetKeyboardAwareScrollView>
          )}
          <ShareWithSheet ref={shareWithSheetRef} onAdd={handleAdd} />
          <ActionsBottomSheet
            ref={permissionSheetRef}
            stackBehavior='push'
            actions={permissionActions} />
        </View>
      }
    />
  );
}

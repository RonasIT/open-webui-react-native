import { useSelector } from '@legendapp/state/react';
import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { ReactElement, useRef } from 'react';
import { Alert } from 'react-native';
import {
  ContactSupportSheet,
  ContactSupportSheetMethods,
} from '@open-webui-react-native/mobile/settings/features/contact-support-sheet';
import { SettingsSection, SettingsSectionOption } from '@open-webui-react-native/mobile/settings/ui/section';
import { useLogout } from '@open-webui-react-native/mobile/shared/features/use-logout';
import { useSetSelectedModel } from '@open-webui-react-native/mobile/shared/features/use-set-selected-model';
import { Avatar, View } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { navigationConfig } from '@open-webui-react-native/mobile/shared/utils/navigation';
import {
  authApi,
  chatApi,
  modelsApi,
  UiSettings,
  UserSettings,
  usersApi,
  usersApiConfig,
} from '@open-webui-react-native/shared/data-access/api';
import { appState$ } from '@open-webui-react-native/shared/data-access/app-state';
import { queryClient } from '@open-webui-react-native/shared/data-access/query-client';
import { alertService } from '@open-webui-react-native/shared/utils/alert-service';
import {
  availableLanguages,
  availableMarkdownRenderers,
  LanguageCode,
  MarkdownRenderer,
} from '@open-webui-react-native/shared/utils/config';
import { FeatureID, isFeatureEnabled } from '@open-webui-react-native/shared/utils/feature-flag';
import { hapticFeedbackService } from '@open-webui-react-native/shared/utils/haptic-feedback-service';
import { useNavigateOnce } from '@open-webui-react-native/shared/utils/navigation';
import { storeReviewService } from '@open-webui-react-native/shared/utils/store-review-service';
import { ToastService } from '@open-webui-react-native/shared/utils/toast-service';
import {
  AppVersionFooter,
  ChangePasswordSheet,
  ChangePasswordSheetMethods,
  DefaultModelSheet,
  DefaultModelSheetMethods,
  DefaultSystemPromptSheet,
  DefaultSystemPromptSheetMethods,
  ProfileAvatarSheet,
  ProfileAvatarSheetMethods,
  ProfileNameSheet,
  ProfileNameSheetMethods,
  SelectionSheet,
  SelectionSheetMethods,
} from './components';
import { useExportAllChats } from './hooks';

// NOTE: Work in progress, not all features are implemented yet.
export function Settings(): ReactElement {
  const translate = useTranslation('APP.SETTINGS_SCREEN');
  const locale = useSelector(appState$.locale);
  const markdownRenderer = useSelector(appState$.markdownRenderer);
  const isHapticFeedbackEnabled = useSelector(appState$.isHapticFeedbackEnabled);
  const { logout } = useLogout();
  const navigateOnce = useNavigateOnce();

  const { data: profile, isError: isProfileError } = authApi.useGetProfile();
  const { isError: isModelsError } = modelsApi.useGetModels();
  const { data: settings, isError: isSettingsError } = usersApi.useGetUserSettings();
  const { mutate: updateUserSettings } = usersApi.useUpdateUserSettings({
    onError: () => ToastService.showError(),
  });
  const { modelId: defaultModelId, modelName: defaultModelName } = useSetSelectedModel();
  const { mutate: archiveAllChats, isPending: isArchivingAllChats } = chatApi.useArchiveAllChats({
    onError: () => ToastService.showError(),
  });
  const { mutate: deleteAllChats, isPending: isDeletingAllChats } = chatApi.useDeleteAllChats({
    onError: () => ToastService.showError(),
  });
  const { exportAllChats, isExporting: isExportingAllChats } = useExportAllChats();

  const profileAvatarSheetRef = useRef<ProfileAvatarSheetMethods>(null);
  const profileNameSheetRef = useRef<ProfileNameSheetMethods>(null);
  const defaultModelSheetRef = useRef<DefaultModelSheetMethods>(null);
  const defaultSystemPromptSheetRef = useRef<DefaultSystemPromptSheetMethods>(null);
  const changePasswordSheetRef = useRef<ChangePasswordSheetMethods>(null);
  const contactSupportSheetRef = useRef<ContactSupportSheetMethods>(null);
  const languageSheetRef = useRef<SelectionSheetMethods>(null);
  const markdownRendererSheetRef = useRef<SelectionSheetMethods>(null);

  const avatarSource = profile?.profileImageUrl ? { uri: profile.profileImageUrl } : undefined;
  const languageLabel = availableLanguages.find(({ code }) => code === locale)?.label;
  const markdownRendererOption = availableMarkdownRenderers.find(({ code }) => code === markdownRenderer);

  const isGeneralDataError = isSettingsError || isModelsError;
  const defaultModelValue = isGeneralDataError
    ? translate('TEXT_LOAD_ERROR')
    : (defaultModelName ?? translate('TEXT_NOT_SET'));
  const defaultSystemPromptValue = isSettingsError ? translate('TEXT_LOAD_ERROR') : settings?.ui.system;
  const profileNameValue = isProfileError ? translate('TEXT_LOAD_ERROR') : profile?.name;

  const isWebSearchAlwaysOnEnabled = settings?.ui.webSearch ?? false;
  const isMessageQueueEnabled = settings?.ui.enableMessageQueue ?? true;
  const isChatBubbleUIEnabled = settings?.ui.chatBubble ?? true;
  const isTemporaryChatByDefaultEnabled = settings?.ui.temporaryChatByDefault ?? false;
  const isUserMessageMarkdownEnabled = settings?.ui.renderMarkdownInUserMessages ?? true;

  const languageItems = availableLanguages.map(({ code, label }) => ({ value: code, label }));
  const markdownRendererItems = availableMarkdownRenderers.map(({ code, labelKey }) => ({
    value: code,
    label: translate(labelKey),
  }));

  const handleLanguageChange = (value: LanguageCode): void => {
    appState$.setLocale(value);
  };

  const handleDefaultModelChange = (modelId: string): void => {
    if (!settings) {
      return;
    }

    updateUserSettings(new UserSettings({ ui: new UiSettings({ ...settings.ui, models: [modelId] }) }));
  };

  const handleDefaultSystemPromptChange = (systemPrompt: string): void => {
    if (!settings) {
      return;
    }

    updateUserSettings(new UserSettings({ ui: new UiSettings({ ...settings.ui, system: systemPrompt }) }));
  };

  const handleMarkdownRendererChange = (value: MarkdownRenderer): void => {
    appState$.setMarkdownRenderer(value);
  };

  const createUiSettingToggleHandler =
    <K extends keyof UiSettings>(key: K) =>
    (value: UiSettings[K]): void => {
      // NOTE: Read the latest cached settings (not the `settings` render closure) so two rapid
      // toggle taps before a re-render don't clobber each other with a stale `ui` snapshot.
      const latestSettings = queryClient.getQueryData<UserSettings>(usersApiConfig.getUserSettingsQueryKey);

      if (!latestSettings) {
        return;
      }

      updateUserSettings(new UserSettings({ ui: new UiSettings({ ...latestSettings.ui, [key]: value }) }));
    };

  const handleArchivedChatsPress = (): void =>
    isFeatureEnabled(FeatureID.ARCHIVE_CHAT)
      ? navigateOnce(`${navigationConfig.main.chat.index}/${navigationConfig.main.chat.archivedChats}`)
      : ToastService.showFeatureNotImplemented();

  const handleRequestDeleteAccountPress = (): void => {
    Alert.alert(
      translate('TEXT_DELETE_ACCOUNT_TITLE'),
      translate('TEXT_DELETE_ACCOUNT_MESSAGE'),
      [
        { text: translate('BUTTON_DELETE_ACCOUNT'), style: 'destructive', onPress: handleDeleteAccountPress },
        { text: translate('BUTTON_DONT_DELETE'), style: 'cancel' },
      ],
      {
        userInterfaceStyle: 'dark',
      },
    );
  };

  const handleDeleteAccountPress = (): void => {
    hapticFeedbackService.trigger();
    ToastService.show(translate('TEXT_ACCOUNT_DELETION_REQUEST'));
  };

  const handleLogoutPress = (): void => {
    hapticFeedbackService.trigger();
    logout();
  };

  const handleRequestLogoutPress = (): void => {
    Alert.alert(
      translate('TEXT_LOGOUT_TITLE'),
      translate('TEXT_LOGOUT_MESSAGE'),
      [
        { text: translate('BUTTON_LOGOUT'), style: 'destructive', onPress: handleLogoutPress },
        { text: translate('BUTTON_CANCEL'), style: 'cancel' },
      ],
      {
        userInterfaceStyle: 'dark',
      },
    );
  };

  const createChatActionHandler = ({
    isPending,
    action,
    confirm,
  }: {
    isPending: boolean;
    action: () => void;
    confirm?: { title: string; message: string; confirmButtonStyle?: 'destructive' };
  }): (() => void) => {
    const guardedAction = (): void => {
      if (!isPending) {
        action();
      }
    };

    return (): void => {
      if (confirm) {
        alertService.confirm({ ...confirm, onConfirm: guardedAction });
      } else {
        guardedAction();
      }
    };
  };

  const handleArchiveAllChatsPress = createChatActionHandler({
    isPending: isArchivingAllChats,
    action: archiveAllChats,
    confirm: {
      title: translate('TEXT_ARCHIVE_ALL_CHATS_TITLE'),
      message: translate('TEXT_ARCHIVE_ALL_CHATS_MESSAGE'),
    },
  });

  const handleDeleteAllChatsPress = createChatActionHandler({
    isPending: isDeletingAllChats,
    action: deleteAllChats,
    confirm: {
      title: translate('TEXT_DELETE_ALL_CHATS_TITLE'),
      message: translate('TEXT_DELETE_ALL_CHATS_MESSAGE'),
      confirmButtonStyle: 'destructive',
    },
  });

  const handleExportAllChatsPress = createChatActionHandler({
    isPending: isExportingAllChats,
    action: exportAllChats,
  });

  const generalOptions: Array<SettingsSectionOption> = [
    {
      label: translate('TEXT_DEFAULT_MODEL'),
      value: defaultModelValue,
      onPress: () => defaultModelSheetRef.current?.present(),
    },
    {
      label: translate('TEXT_DEFAULT_SYSTEM_PROMPT'),
      value: defaultSystemPromptValue,
      onPress: () => defaultSystemPromptSheetRef.current?.present(),
    },
    {
      label: translate('TEXT_LANGUAGE'),
      value: languageLabel,
      onPress: () => languageSheetRef.current?.present(),
    },
  ];

  const profileOptions: Array<SettingsSectionOption> = [
    {
      label: translate('TEXT_PROFILE_NAME'),
      value: profileNameValue,
      onPress: () => profileNameSheetRef.current?.present(),
    },
    {
      label: translate('TEXT_AVATAR'),
      accessoryRight: <Avatar source={avatarSource} name={profile?.name} />,
      onPress: () => profileAvatarSheetRef.current?.present(),
    },
    {
      label: translate('TEXT_CHANGE_PASSWORD'),
      iconName: 'key',
      onPress: () => changePasswordSheetRef.current?.present(),
    },
    {
      type: 'action',
      label: translate('TEXT_DELETE_ACCOUNT'),
      iconName: 'trashCan',
      isDanger: true,
      onPress: handleRequestDeleteAccountPress,
    },
    {
      type: 'action',
      label: translate('TEXT_LOGOUT'),
      iconName: 'logout',
      isDanger: true,
      onPress: handleRequestLogoutPress,
    },
  ];

  const handleRateAppPress = (): void => {
    storeReviewService.openStoreReview();
  };

  const feedbackOptions: Array<SettingsSectionOption> = [
    {
      label: translate('TEXT_REPORT_A_BUG'),
      iconName: 'message',
      onPress: () => contactSupportSheetRef.current?.present(),
    },
    { label: translate('TEXT_RATE_APP'), iconName: 'star', onPress: handleRateAppPress },
  ];

  const chatsOptions: Array<SettingsSectionOption> = [
    { label: translate('TEXT_ARCHIVED_CHATS'), iconName: 'archive', onPress: handleArchivedChatsPress },
    { type: 'action', label: translate('TEXT_EXPORT_ALL_CHATS'), onPress: handleExportAllChatsPress },
    { type: 'action', label: translate('TEXT_ARCHIVE_ALL'), onPress: handleArchiveAllChatsPress },
    {
      type: 'action',
      label: translate('TEXT_DELETE_ALL'),
      isDanger: true,
      onPress: handleDeleteAllChatsPress,
    },
  ];

  const preferenceOptions: Array<SettingsSectionOption> = [
    {
      type: 'switch',
      label: translate('TEXT_ALWAYS_ON_WEB_SEARCH'),
      isEnabled: isWebSearchAlwaysOnEnabled,
      onValueChange: createUiSettingToggleHandler('webSearch'),
    },
    {
      type: 'switch',
      label: translate('TEXT_HAPTIC_FEEDBACK'),
      isEnabled: isHapticFeedbackEnabled,
      onValueChange: appState$.setHapticFeedbackEnabled,
    },
    {
      type: 'switch',
      label: translate('TEXT_ENABLE_MESSAGE_QUEUE'),
      isEnabled: isMessageQueueEnabled,
      onValueChange: createUiSettingToggleHandler('enableMessageQueue'),
    },
    {
      type: 'switch',
      label: translate('TEXT_CHAT_BUBBLE_UI'),
      isEnabled: isChatBubbleUIEnabled,
      onValueChange: createUiSettingToggleHandler('chatBubble'),
    },
    {
      type: 'switch',
      label: translate('TEXT_TEMPORARY_CHAT_BY_DEFAULT'),
      isEnabled: isTemporaryChatByDefaultEnabled,
      onValueChange: createUiSettingToggleHandler('temporaryChatByDefault'),
    },
    {
      type: 'switch',
      label: translate('TEXT_RENDER_MARKDOWN_IN_USER_MESSAGE'),
      isEnabled: isUserMessageMarkdownEnabled,
      onValueChange: createUiSettingToggleHandler('renderMarkdownInUserMessages'),
    },
    {
      label: translate('TEXT_MARKDOWN_RENDERER'),
      value: markdownRendererOption && translate(markdownRendererOption.labelKey),
      onPress: () => markdownRendererSheetRef.current?.present(),
    },
  ];

  return (
    <View className='pb-safe'>
      <View className='py-16 items-center justify-center'>
        <Avatar
          source={avatarSource}
          name={profile?.name}
          className='w-64 h-64'
          textClassName='text-h4-sm sm:text-h4'
        />
      </View>
      <SettingsSection title={translate('TEXT_SECTION_GENERAL')} options={generalOptions} />
      <SettingsSection title={translate('TEXT_SECTION_PROFILE')} options={profileOptions} />
      <SettingsSection title={translate('TEXT_SECTION_FEEDBACK')} options={feedbackOptions} />
      <SettingsSection title={translate('TEXT_SECTION_CHATS')} options={chatsOptions} />
      <SettingsSection options={preferenceOptions} />
      <AppVersionFooter />
      <ProfileAvatarSheet
        ref={profileAvatarSheetRef}
        name={profile?.name}
        imageUrl={profile?.profileImageUrl} />
      <ProfileNameSheet
        ref={profileNameSheetRef}
        name={profile?.name}
        avatarUrl={profile?.profileImageUrl} />
      <ChangePasswordSheet ref={changePasswordSheetRef} />
      <DefaultModelSheet
        ref={defaultModelSheetRef}
        selectedModelId={defaultModelId}
        onConfirm={handleDefaultModelChange}
      />
      <DefaultSystemPromptSheet
        ref={defaultSystemPromptSheetRef}
        systemPrompt={settings?.ui.system}
        onConfirm={handleDefaultSystemPromptChange}
      />
      <ContactSupportSheet ref={contactSupportSheetRef} />
      <SelectionSheet
        ref={languageSheetRef}
        title={translate('LANGUAGE_SHEET.TEXT_TITLE')}
        items={languageItems}
        selectedValue={locale}
        onConfirm={handleLanguageChange}
      />
      <SelectionSheet
        ref={markdownRendererSheetRef}
        title={translate('MARKDOWN_RENDERER_SHEET.TEXT_TITLE')}
        items={markdownRendererItems}
        selectedValue={markdownRenderer}
        onConfirm={handleMarkdownRendererChange}
      />
    </View>
  );
}

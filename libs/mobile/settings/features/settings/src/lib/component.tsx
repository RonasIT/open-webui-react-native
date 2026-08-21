import { useSelector } from '@legendapp/state/react';
import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { ReactElement, useRef, useState } from 'react';
import {
  ContactSupportSheet,
  ContactSupportSheetMethods,
} from '@open-webui-react-native/mobile/settings/features/contact-support-sheet';
import { SettingsSection, SettingsSectionOption } from '@open-webui-react-native/mobile/settings/ui/section';
import { useLogout } from '@open-webui-react-native/mobile/shared/features/use-logout';
import { Avatar, View } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { authApi, modelsApi } from '@open-webui-react-native/shared/data-access/api';
import { appState$ } from '@open-webui-react-native/shared/data-access/app-state';
import {
  availableLanguages,
  availableMarkdownRenderers,
  LanguageCode,
  MarkdownRenderer,
} from '@open-webui-react-native/shared/utils/config';
import { storeReviewService } from '@open-webui-react-native/shared/utils/store-review-service';
import { ToastService } from '@open-webui-react-native/shared/utils/toast-service';
import {
  ChangePasswordSheet,
  ChangePasswordSheetMethods,
  DefaultModelSheet,
  DefaultModelSheetMethods,
  ProfileAvatarSheet,
  ProfileAvatarSheetMethods,
  ProfileNameSheet,
  ProfileNameSheetMethods,
  SelectionSheet,
  SelectionSheetMethods,
} from './components';
import { SettingsToggles } from './types';

const initialToggles: SettingsToggles = {
  isWebSearchAlwaysOn: true,
  isHapticFeedbackEnabled: true,
  isMessageQueueEnabled: true,
  isChatBubbleUIEnabled: true,
  isTemporaryChatEnabled: true,
  isUserMessageMarkdownEnabled: true,
};

// NOTE: Work in progress, not all features are implemented yet.
export function Settings(): ReactElement {
  const translate = useTranslation('APP.SETTINGS_SCREEN');
  const locale = useSelector(appState$.locale);
  const markdownRenderer = useSelector(appState$.markdownRenderer);
  const { logout } = useLogout();

  const { data: profile } = authApi.useGetProfile();
  const { data: models } = modelsApi.useGetModels();

  const [toggles, setToggles] = useState(initialToggles);
  const [defaultModelId, setDefaultModelId] = useState<string>();

  const profileAvatarSheetRef = useRef<ProfileAvatarSheetMethods>(null);
  const profileNameSheetRef = useRef<ProfileNameSheetMethods>(null);
  const defaultModelSheetRef = useRef<DefaultModelSheetMethods>(null);
  const changePasswordSheetRef = useRef<ChangePasswordSheetMethods>(null);
  const contactSupportSheetRef = useRef<ContactSupportSheetMethods>(null);
  const languageSheetRef = useRef<SelectionSheetMethods>(null);
  const markdownRendererSheetRef = useRef<SelectionSheetMethods>(null);

  const createToggleHandler =
    (toggle: keyof SettingsToggles) =>
    (isEnabled: boolean): void =>
      setToggles((currentToggles) => ({ ...currentToggles, [toggle]: isEnabled }));

  const avatarSource = profile?.profileImageUrl ? { uri: profile.profileImageUrl } : undefined;
  const languageLabel = availableLanguages.find(({ code }) => code === locale)?.label;
  const markdownRendererOption = availableMarkdownRenderers.find(({ code }) => code === markdownRenderer);
  const defaultModelName = models?.find(({ id }) => id === defaultModelId)?.name;

  const languageItems = availableLanguages.map(({ code, label }) => ({ value: code, label }));
  const markdownRendererItems = availableMarkdownRenderers.map(({ code, labelKey }) => ({
    value: code,
    label: translate(labelKey),
  }));

  const generalOptions: Array<SettingsSectionOption> = [
    {
      label: translate('TEXT_DEFAULT_MODEL'),
      value: defaultModelName,
      onPress: () => defaultModelSheetRef.current?.present(),
    },
    { label: translate('TEXT_DEFAULT_SYSTEM_PROMPT'), onPress: ToastService.showFeatureNotImplemented },
    {
      label: translate('TEXT_LANGUAGE'),
      value: languageLabel,
      onPress: () => languageSheetRef.current?.present(),
    },
  ];

  const profileOptions: Array<SettingsSectionOption> = [
    {
      label: translate('TEXT_PROFILE_NAME'),
      value: profile?.name,
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
    { type: 'action', label: translate('TEXT_LOGOUT'), iconName: 'logout', isDanger: true, onPress: logout },
  ];

  const handleRateAppPress = (): void => {
    storeReviewService.openStoreReview();
  };

  const feedbackOptions: Array<SettingsSectionOption> = [
    {
      label: translate('TEXT_CONTACT_SUPPORT'),
      iconName: 'message',
      onPress: () => contactSupportSheetRef.current?.present(),
    },
    { label: translate('TEXT_RATE_APP'), iconName: 'star', onPress: handleRateAppPress },
  ];

  const chatsOptions: Array<SettingsSectionOption> = [
    { label: translate('TEXT_ARCHIVED_CHATS'), iconName: 'archive', onPress: ToastService.showFeatureNotImplemented },
    { type: 'action', label: translate('TEXT_EXPORT_ALL_CHATS'), onPress: ToastService.showFeatureNotImplemented },
    { type: 'action', label: translate('TEXT_ARCHIVE_ALL'), onPress: ToastService.showFeatureNotImplemented },
    {
      type: 'action',
      label: translate('TEXT_DELETE_ALL'),
      isDanger: true,
      onPress: ToastService.showFeatureNotImplemented,
    },
  ];

  const preferenceOptions: Array<SettingsSectionOption> = [
    {
      type: 'switch',
      label: translate('TEXT_ALWAYS_ON_WEB_SEARCH'),
      isEnabled: toggles.isWebSearchAlwaysOn,
      onValueChange: createToggleHandler('isWebSearchAlwaysOn'),
    },
    {
      type: 'switch',
      label: translate('TEXT_HAPTIC_FEEDBACK'),
      isEnabled: toggles.isHapticFeedbackEnabled,
      onValueChange: createToggleHandler('isHapticFeedbackEnabled'),
    },
    {
      type: 'switch',
      label: translate('TEXT_ENABLE_MESSAGE_QUEUE'),
      isEnabled: toggles.isMessageQueueEnabled,
      onValueChange: createToggleHandler('isMessageQueueEnabled'),
    },
    {
      type: 'switch',
      label: translate('TEXT_CHAT_BUBBLE_UI'),
      isEnabled: toggles.isChatBubbleUIEnabled,
      onValueChange: createToggleHandler('isChatBubbleUIEnabled'),
    },
    {
      type: 'switch',
      label: translate('TEXT_TEMPORARY_CHAT_BY_DEFAULT'),
      isEnabled: toggles.isTemporaryChatEnabled,
      onValueChange: createToggleHandler('isTemporaryChatEnabled'),
    },
    {
      type: 'switch',
      label: translate('TEXT_RENDER_MARKDOWN_IN_USER_MESSAGE'),
      isEnabled: toggles.isUserMessageMarkdownEnabled,
      onValueChange: createToggleHandler('isUserMessageMarkdownEnabled'),
    },
    {
      label: translate('TEXT_MARKDOWN_RENDERER'),
      value: markdownRendererOption && translate(markdownRendererOption.labelKey),
      onPress: () => markdownRendererSheetRef.current?.present(),
    },
  ];

  const handleLanguageChange = (value: LanguageCode): void => {
    appState$.setLocale(value);
  };

  const handleMarkdownRendererChange = (value: MarkdownRenderer): void => {
    appState$.setMarkdownRenderer(value);
  };

  return (
    <View className='pb-32'>
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
      <ProfileAvatarSheet
        ref={profileAvatarSheetRef}
        name={profile?.name}
        imageUrl={profile?.profileImageUrl} />
      <ProfileNameSheet ref={profileNameSheetRef} name={profile?.name} />
      <ChangePasswordSheet ref={changePasswordSheetRef} />
      <DefaultModelSheet
        ref={defaultModelSheetRef}
        selectedModelId={defaultModelId}
        onConfirm={setDefaultModelId} />
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

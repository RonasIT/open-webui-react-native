import { ReactElement, useState } from 'react';
import { colors } from '@open-webui-react-native/mobile/shared/ui/styles';
import {
  AppText,
  ExpoUiButton,
  ExpoUiCheckbox,
  ExpoUiCollapsible,
  ExpoUiDateTimePicker,
  ExpoUiMenu,
  ExpoUiPagerView,
  ExpoUiPicker,
  ExpoUiSegmentedControl,
  ExpoUiSlider,
  ExpoUiSwitch,
  View,
} from '@open-webui-react-native/mobile/shared/ui/ui-kit';

const FLAVOURS = [
  { label: 'Vanilla', value: 'vanilla' },
  { label: 'Chocolate', value: 'chocolate' },
  { label: 'Strawberry', value: 'strawberry' },
] as const;

const MENU_ACTIONS = [
  { id: 'copy', title: 'Copy' },
  { id: 'share', title: 'Share' },
  { id: 'delete', title: 'Delete', attributes: { destructive: true } },
];

const SEGMENTS = ['General', 'Advanced', 'Debug'];

type Flavour = (typeof FLAVOURS)[number]['value'];

export function ExpoUiControlsPreview(): ReactElement {
  const [accepted, setAccepted] = useState(false);
  const [isCollapsibleOpen, setIsCollapsibleOpen] = useState(false);
  const [flavour, setFlavour] = useState<Flavour>('chocolate');
  const [volume, setVolume] = useState(50);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [date, setDate] = useState(() => new Date());
  const [selectedMenuAction, setSelectedMenuAction] = useState('none');
  const [selectedSegmentIndex, setSelectedSegmentIndex] = useState(0);

  return (
    <View className='gap-8 p-16'>
      <ExpoUiButton
        variant='filled'
        label='Filled'
        onPress={() => {}} />
      <ExpoUiButton
        variant='outlined'
        label='Outlined'
        onPress={() => {}} />
      <ExpoUiButton
        variant='text'
        label='Text'
        onPress={() => {}} />

      <ExpoUiCheckbox
        label='I accept the terms'
        value={accepted}
        onValueChange={setAccepted} />

      <ExpoUiCollapsible
        isOpen={isCollapsibleOpen}
        onOpenChange={setIsCollapsibleOpen}
        label='About'>
        <AppText className='text-sm-sm text-text-primary'>
          A primitive that toggles visibility of its content via a labelled tappable header.
        </AppText>
      </ExpoUiCollapsible>

      <ExpoUiPicker<Flavour>
        selectedValue={flavour}
        onValueChange={setFlavour}
        appearance='wheel'>
        {FLAVOURS.map(({ label, value }) => (
          <ExpoUiPicker.Item
            key={value}
            label={label}
            value={value} />
        ))}
      </ExpoUiPicker>

      <AppText className='text-sm-sm text-text-primary'>{`Volume: ${volume}`}</AppText>
      <ExpoUiSlider
        value={volume}
        onValueChange={setVolume}
        min={0}
        max={100}
        step={10} />

      <ExpoUiSwitch
        label='Enable notifications'
        value={notificationsEnabled}
        onValueChange={setNotificationsEnabled} />

      <ExpoUiDateTimePicker
        value={date}
        mode='date'
        presentation='inline'
        accentColor={colors.brandPrimary}
        onValueChange={(_, selectedDate) => setDate(selectedDate)}
      />

      <ExpoUiMenu actions={MENU_ACTIONS} onPressAction={({ nativeEvent }) => setSelectedMenuAction(nativeEvent.event)}>
        <View className='rounded-xl bg-background-secondary p-12'>
          <AppText className='text-sm-sm text-text-primary'>Open menu</AppText>
          <AppText className='text-xs text-text-secondary'>{`Selected: ${selectedMenuAction}`}</AppText>
        </View>
      </ExpoUiMenu>

      <ExpoUiSegmentedControl
        values={SEGMENTS}
        selectedIndex={selectedSegmentIndex}
        tintColor={colors.brandPrimary}
        onChange={({ nativeEvent }) => setSelectedSegmentIndex(nativeEvent.selectedSegmentIndex)}
      />

      <ExpoUiPagerView style={{ height: 120 }} initialPage={0}>
        <View key='first' className='flex-1 items-center justify-center rounded-xl bg-background-secondary'>
          <AppText className='text-sm-sm text-text-primary'>First page</AppText>
        </View>
        <View key='second' className='flex-1 items-center justify-center rounded-xl bg-background-tertiary'>
          <AppText className='text-sm-sm text-text-primary'>Second page</AppText>
        </View>
      </ExpoUiPagerView>
    </View>
  );
}

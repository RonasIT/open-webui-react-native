import MenuView, {
  type MenuAction,
  type MenuComponentProps,
  type MenuComponentRef,
  type NativeActionEvent,
} from '@expo/ui/community/menu';
import { ReactElement, Ref } from 'react';

export type ExpoUiMenuProps = MenuComponentProps & {
  ref?: Ref<MenuComponentRef>;
};
export type ExpoUiMenuAction = MenuAction;
export type ExpoUiMenuRef = MenuComponentRef;
export type ExpoUiMenuActionEvent = NativeActionEvent;

export function ExpoUiMenu(props: ExpoUiMenuProps): ReactElement {
  return <MenuView {...props} />;
}

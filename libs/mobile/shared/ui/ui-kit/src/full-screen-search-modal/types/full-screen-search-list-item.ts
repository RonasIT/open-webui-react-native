import { IconName } from '../../icon';

export interface FullScreenSearchListItem {
  id: string;
  name: string;
  onPress?: (id: string) => void;
  iconName?: IconName;
  containerClassName?: string;
  iconClassName?: string;
  textClassName?: string;
}

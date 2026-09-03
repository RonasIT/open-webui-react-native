import { ShareWithItemType } from '../enums';

export type ShareWithListItem =
  | { type: ShareWithItemType.TITLE; id: string; title: string }
  | { type: ShareWithItemType.GROUP | ShareWithItemType.USER; id: string; name: string };

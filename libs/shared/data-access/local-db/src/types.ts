/* eslint-disable @typescript-eslint/naming-convention -- keys mirror the server JSON */
// NOTE: Plain server JSON: class-transformer instances do not round-trip the Dayjs fields.

export interface LocalChatListItem {
  id: string;
  title: string;
  created_at: number;
  updated_at: number;
  // NOTE: Omit to keep the stored folder, null to clear it.
  folder_id?: string | null;
}

export interface LocalChatSummary extends LocalChatListItem {
  folder_id: string | null;
  pinned: boolean;
  content_updated_at: number | null;
}

export interface LocalChat {
  id: string;
  title: string;
  created_at: number;
  updated_at: number;
  folder_id: string | null;
  pinned: boolean | null;
  [key: string]: unknown;
}

export interface LocalFolder {
  id: string;
  [key: string]: unknown;
}

export const localProfileKeys = ['id', 'email', 'name', 'role', 'profile_image_url', 'permissions'] as const;

export type LocalProfile = { id: string } & Partial<Record<(typeof localProfileKeys)[number], unknown>>;

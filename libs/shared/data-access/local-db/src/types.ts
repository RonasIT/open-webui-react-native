/* eslint-disable @typescript-eslint/naming-convention -- keys mirror the server JSON */
// NOTE: Plain server JSON (snake_case, unix seconds) — not class-transformer instances, which do not round-trip
// the Dayjs fields.

export interface LocalChatListItem {
  id: string;
  title: string;
  created_at: number;
  updated_at: number;
  // NOTE: Omit to keep the stored folder; `null` moves the chat out of its folder.
  folder_id?: string | null;
}

export interface LocalChatSummary extends LocalChatListItem {
  folder_id: string | null;
  pinned: boolean;
  // NOTE: `updated_at` of the stored full content; `null` — the content was never downloaded.
  content_updated_at: number | null;
}

export interface LocalChat {
  id: string;
  title: string;
  created_at: number;
  updated_at: number;
  folder_id: string | null;
  pinned: boolean;
  [key: string]: unknown;
}

export interface LocalFolder {
  id: string;
  [key: string]: unknown;
}

export const localProfileKeys = ['id', 'email', 'name', 'role', 'profile_image_url', 'permissions'] as const;

export type LocalProfile = { id: string } & Partial<Record<(typeof localProfileKeys)[number], unknown>>;

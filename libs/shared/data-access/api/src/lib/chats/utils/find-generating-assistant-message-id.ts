import { History } from '../models';

export function findGeneratingAssistantMessageId(history: History | undefined): string | null {
  return history?.lastAssistantMessage?.id ?? null;
}

import { Observable, observable } from '@legendapp/state';
import { FilterItem } from './types';

interface ArchivedChatsFilterState {
  selectedFilter: FilterItem | null;
}

export const archivedChatsFilterState$: Observable<ArchivedChatsFilterState> = observable<ArchivedChatsFilterState>({
  selectedFilter: null,
});

import { createContext, useContext } from 'react';
import type { MtCollectionEntry, MtCollectionProperty, MtCollectionView } from './MtCollection'; // or your types location
import type { MtCollectionQuickFilterState } from './MtCollectionEntryUtils';

/**
 * Context props for MtCollection.
 * We use context here as I don’t want to assume anything
 * about the structure of the views, layouts, or toolbars.
 */
interface MtCollectionContextProps<T extends MtCollectionEntry> {
  entries: T[];
  onAddEntry?: () => void | Promise<void>;
  views: MtCollectionView<T>[];
  viewTemplates: MtCollectionView<T>[];
  currentView: MtCollectionView<T> | null;
  showViewSettings: boolean;
  setShowViewSettings: (show: boolean) => void;
  viewSettingsPageId: string;
  setViewSettingsPageId: (pageId: string) => void;
  focusViewNameEditor: boolean;
  setFocusViewNameEditor: (focus: boolean) => void;
  openViewSettings: (pageId?: string, options?: { focusViewNameEditor?: boolean }) => void;
  properties: MtCollectionProperty[];
  setProperties: (properties: MtCollectionProperty[]) => void;
  setCurrentView: (view: MtCollectionView<T> | null) => void;
  addView: (view: MtCollectionView<T>) => void | Promise<void>;
  updateView: (viewId: string, patch: Partial<MtCollectionView<T>>) => void;
  deleteView: (viewId: string) => void | Promise<void>;
  reorderViews: (viewIds: string[]) => void | Promise<void>;
  hasCurrentViewUnsavedChanges: boolean;
  saveCurrentViewAsDefault: () => void | Promise<void>;
  revertCurrentViewToDefault: () => void;
  quickFilters: MtCollectionQuickFilterState;
  setQuickFilters: (patch: Partial<MtCollectionQuickFilterState>) => void;
  transientQuickFilters: MtCollectionQuickFilterState;
  setTransientQuickFilters: (patch: Partial<MtCollectionQuickFilterState>) => void;
  currentUserQuickFilter?: {
    assignee: string;
    label: string;
    avatarSrc?: string;
  };
  /** Set of selected entry IDs. */
  selectedIds: Set<string>;
  /** Toggle selection for a single entry by its id. */
  toggleSelected: (id: string) => void;
  /** Clear all selections. */
  clearSelection: () => void;
  /** Callback to delete selected entries (no confirmation). Only present when consumer provides it. */
  onDeleteEntries?: (ids: Set<string>) => void | Promise<void>;
}

export const MtCollectionContext = createContext<MtCollectionContextProps<any> | null>(null);

export function useMtCollection<T extends MtCollectionEntry>() {
  const context = useContext(MtCollectionContext);
  if (!context) throw new Error('useMtCollection must be used inside MtCollection');
  return context as MtCollectionContextProps<T>;
}

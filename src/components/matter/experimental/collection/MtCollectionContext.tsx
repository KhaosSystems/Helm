import { createContext, useContext } from 'react';
import type { MtCollectionEntry, MtCollectionProperty, MtCollectionView } from './MtCollection'; // or your types location

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
  hasCurrentViewUnsavedChanges: boolean;
  saveCurrentViewAsDefault: () => void | Promise<void>;
  revertCurrentViewToDefault: () => void;
}

export const MtCollectionContext = createContext<MtCollectionContextProps<any> | null>(null);

export function useMtCollection<T extends MtCollectionEntry>() {
  const context = useContext(MtCollectionContext);
  if (!context) throw new Error('useMtCollection must be used inside MtCollection');
  return context as MtCollectionContextProps<T>;
}

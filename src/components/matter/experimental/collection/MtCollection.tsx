/**
 * Generic data view component for Visualizing large collections of items in multiple formats.
 *
 * Classes:
 *  - MtCollectionEntry: Minimal interface for an item represented in the collection. All entries must have this.
 *  - MtCollectionView: Determines how a collection is filtered and sorted.
 *
 * Components:
 *  - MtCollection: Main top-level component.
 *  - MtCollectionLayout: Determines how the collection is visually structured. Examples include table, kanban, gallery, etc.
 *
 * Inspirations:
 *  - Notion databases
 *  - [MUI DataGrid](https://mui.com/x/react-data-grid/)
 */

import React, { ReactNode, useCallback, useEffect, useState } from 'react';
import { MtCollectionToolbar } from './MtCollectionToolbar';
import { MtCollectionContext } from './MtCollectionContext';
import { MtCollectionViewSettings } from './MtCollectionViewSettings';
import { MtCollectionSelectionToolbar } from './MtCollectionSelectionToolbar';
import type { MtCollectionAssigneeOption } from './MtCollectionEntryControls';
import type { MtCollectionQuickFilterState } from './MtCollectionEntryUtils';

/**
 * Minimal interface for an item represented in the collection.
 */
export interface MtCollectionEntry {
  id: any;
}

export interface MtCollectionDiscreteValueOption {
  value: string;
  label?: string;
  icon?: string;
  color?: string;
}

export interface MtCollectionProperty {
  id: string;
  label: string;
  groupable?: boolean;
  discreteValues?: Array<string | MtCollectionDiscreteValueOption>;
}

export interface MtCollectionViewSettingsState {
  visiblePropertyIds?: string[];
  [key: string]: unknown;
}

export interface MtCollectionLayoutSettingsProps<T extends MtCollectionEntry> {
  currentView: MtCollectionView<T>;
  properties: MtCollectionProperty[];
  viewSettings: MtCollectionViewSettingsState;
  setViewSettings: (settings: Partial<MtCollectionViewSettingsState>) => void;
  setCurrentView: (view: MtCollectionView<T> | null) => void;
}

export type MtCollectionLayoutComponent<T extends MtCollectionEntry = MtCollectionEntry> = React.FC<
  MtCollectionLayoutProps<T>
> & {
  SettingsMenu?: (props: MtCollectionLayoutSettingsProps<T>) => React.ReactElement | null;
  ToolbarActions?: React.ComponentType;
};

/**
 * Determines how a collection is filtered and sorted.
 * Views are meant to be stored in database and be selectable, and configurable by the user.
 */
export interface MtCollectionView<T extends MtCollectionEntry> {
  id: string;
  name: string;
  icon?: string;
  layout: MtCollectionLayoutComponent<T>;
  groupBy?: string | null;
  settings?: MtCollectionViewSettingsState;
  /** Custom entry renderer for this specific view. Overrides the collection-level renderEntry. */
  renderEntry?: MtCollectionEntryRenderer<T>;
}

type MtCollectionViewDefaultSnapshot = {
  name: string;
  icon?: string;
  groupBy?: string | null;
  settings?: MtCollectionViewSettingsState;
};

function buildViewDefaultSnapshot<T extends MtCollectionEntry>(
  view: MtCollectionView<T>,
): MtCollectionViewDefaultSnapshot {
  return {
    name: view.name,
    icon: view.icon,
    groupBy: view.groupBy ?? null,
    settings: view.settings,
  };
}

function areViewDefaultsEqual(
  left: MtCollectionViewDefaultSnapshot | undefined,
  right: MtCollectionViewDefaultSnapshot | undefined,
) {
  if (!left || !right) {
    return false;
  }

  return (
    left.name === right.name &&
    left.icon === right.icon &&
    (left.groupBy ?? null) === (right.groupBy ?? null) &&
    JSON.stringify(left.settings ?? {}) === JSON.stringify(right.settings ?? {})
  );
}

/**
 * Render prop for a single entry. Layouts delegate rendering to this component.
 */
export type MtCollectionEntryRenderer<T extends MtCollectionEntry> = React.ComponentType<{ entry: T }>;

/**
 * MtCollectionLayout determines how the collection is visually structured.
 */
export interface MtCollectionLayoutProps<T extends MtCollectionEntry> {
  entries: T[];
  groupBy?: string | null;
  properties?: MtCollectionProperty[];
  viewSettings?: MtCollectionViewSettingsState;
  /** Custom renderer for each entry. Layouts should fall back to their own default if omitted. */
  renderEntry?: MtCollectionEntryRenderer<T>;
  /** Optional assignee options for entry-level assignee controls. */
  assigneeOptions?: MtCollectionAssigneeOption[];
  /** Optional callback invoked when a layout updates an entry field. */
  onUpdateEntry?: (entry: T, patch: Partial<T>) => void | Promise<void>;
  /** When true, subtask expand/collapse and add-subtask controls are shown. */
  subtasksEnabled?: boolean;
  /** Called when the user clicks "+ Add subtask" for a parent entry. */
  onAddSubtask?: (parentEntry: T) => void | Promise<void>;
}

/**
 * Props for MtCollection component
 */
export interface MtCollectionProps<T extends MtCollectionEntry> {
  entries: T[];
  views: MtCollectionView<T>[];
  /** Optional template views used when creating new views from available layouts. */
  viewTemplates?: MtCollectionView<T>[];
  properties?: MtCollectionProperty[];
  /**  Undefined will render default toolbar, null will render no toolbar. */
  toolbar?: ReactNode | null;
  /** Default entry renderer applied to all views. View-level renderEntry takes precedence. */
  renderEntry?: MtCollectionEntryRenderer<T>;
  showViewSettings?: boolean;
  viewSettings?: ReactNode;
  className?: string;
  assigneeOptions?: MtCollectionAssigneeOption[];
  currentUserQuickFilter?: {
    assignee: string;
    label: string;
    avatarSrc?: string;
  };
  onUpdateEntry?: (entry: T, patch: Partial<T>) => void | Promise<void>;
  onAddEntry?: () => void | Promise<void>;
  /** When true, subtask expand/collapse and add-subtask controls are shown. */
  subtasksEnabled?: boolean;
  /** Called when the user clicks "+ Add subtask" for a parent entry. */
  onAddSubtask?: (parentEntry: T) => void | Promise<void>;
  /** Persist a view and optionally return its persisted id. */
  onSaveView?: (view: MtCollectionView<T>) => Promise<string | void>;
  /** Delete a persisted view. */
  onDeleteView?: (viewId: string) => Promise<void>;
  /** Bulk-delete entries by id. Called immediately with no confirmation dialog. */
  onDeleteEntries?: (ids: Set<string>) => void | Promise<void>;
  /** Persist a reordered list of view IDs. */
  onReorderViews?: (viewIds: string[]) => void | Promise<void>;
}

/**
 * MtCollection component: top-level collection container.
 */
export function MtCollection<T extends MtCollectionEntry>({
  entries,
  views,
  viewTemplates,
  properties = [{ id: 'id', label: 'ID' }],
  toolbar,
  renderEntry,
  showViewSettings = false,
  viewSettings = <MtCollectionViewSettings />,
  className,
  assigneeOptions,
  currentUserQuickFilter,
  onUpdateEntry,
  onAddEntry,
  subtasksEnabled,
  onAddSubtask,
  onSaveView,
  onDeleteView,
  onDeleteEntries,
  onReorderViews,
}: MtCollectionProps<T>) {
  const [viewState, setViewState] = useState<MtCollectionView<T>[]>(views);
  const [propertyState, setPropertyState] = useState<MtCollectionProperty[]>(properties);
  const [showViewSettingsState, setShowViewSettingsState] = useState(showViewSettings);
  const [viewSettingsPageId, setViewSettingsPageId] = useState<string>('root');
  const [focusViewNameEditor, setFocusViewNameEditor] = useState(false);
  const [currentViewId, setCurrentViewId] = useState<string | null>(views[0]?.id ?? null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [transientQuickFilters, setTransientQuickFiltersState] = useState<MtCollectionQuickFilterState>({});
  const [defaultViewState, setDefaultViewState] = useState<Record<string, MtCollectionViewDefaultSnapshot>>(
    Object.fromEntries(views.map((view) => [view.id, buildViewDefaultSnapshot(view)])),
  );

  useEffect(() => {
    setViewState(views);
    setDefaultViewState(Object.fromEntries(views.map((view) => [view.id, buildViewDefaultSnapshot(view)])));
    setCurrentViewId((previousViewId) =>
      views.some((view) => view.id === previousViewId) ? previousViewId : (views[0]?.id ?? null),
    );
  }, [views]);

  useEffect(() => {
    setPropertyState(properties);
  }, [properties]);

  const currentView = viewState.find((view) => view.id === currentViewId) ?? null;
  const currentViewQuickFilters = ((currentView?.settings?.quickFilters as MtCollectionQuickFilterState | undefined) ??
    {}) satisfies MtCollectionQuickFilterState;

  const setCurrentView = (nextView: MtCollectionView<T> | null) => {
    if (!nextView) {
      setCurrentViewId(null);
      return;
    }

    setViewState((prevViews) =>
      prevViews.map((view) =>
        view.id === nextView.id
          ? {
              ...view,
              ...nextView,
            }
          : view,
      ),
    );

    setCurrentViewId(nextView.id);
  };

  const addView = async (nextView: MtCollectionView<T>) => {
    if (onSaveView) {
      const persistedId = await onSaveView(nextView);
      if (persistedId) {
        setCurrentViewId(persistedId);
      }
      return;
    }

    setViewState((previousViews) => [...previousViews, nextView]);
    setDefaultViewState((previousDefaults) => ({
      ...previousDefaults,
      [nextView.id]: buildViewDefaultSnapshot(nextView),
    }));
    setCurrentViewId(nextView.id);
  };

  const updateView = (viewId: string, patch: Partial<MtCollectionView<T>>) => {
    setViewState((previousViews) =>
      previousViews.map((view) =>
        view.id === viewId
          ? {
              ...view,
              ...patch,
            }
          : view,
      ),
    );
  };

  const deleteView = async (viewId: string) => {
    await onDeleteView?.(viewId);

    setViewState((previousViews) => {
      const nextViews = previousViews.filter((view) => view.id !== viewId);

      if (nextViews.length === 0) {
        setCurrentViewId(null);
        return previousViews;
      }

      if (currentViewId === viewId) {
        setCurrentViewId(nextViews[0]?.id ?? null);
      }

      return nextViews;
    });

    setDefaultViewState((previousDefaults) => {
      const nextDefaults = { ...previousDefaults };
      delete nextDefaults[viewId];
      return nextDefaults;
    });
  };

  const reorderViews = async (viewIds: string[]) => {
    setViewState((previousViews) => {
      const viewMap = new Map(previousViews.map((view) => [view.id, view]));
      return viewIds.map((id) => viewMap.get(id)).filter(Boolean) as MtCollectionView<T>[];
    });
    await onReorderViews?.(viewIds);
  };

  const hasCurrentViewUnsavedChanges = (() => {
    if (!currentView) {
      return false;
    }

    const currentSnapshot = buildViewDefaultSnapshot(currentView);
    const defaultSnapshot = defaultViewState[currentView.id];

    if (!defaultSnapshot) {
      return false;
    }

    return !areViewDefaultsEqual(currentSnapshot, defaultSnapshot);
  })();

  const saveCurrentViewAsDefault = async () => {
    if (!currentView) {
      return;
    }

    const persistedId = await onSaveView?.(currentView);

    if (persistedId && persistedId !== currentView.id) {
      setViewState((previousViews) =>
        previousViews.map((view) =>
          view.id === currentView.id
            ? {
                ...view,
                id: persistedId,
              }
            : view,
        ),
      );

      setCurrentViewId((previousId) => (previousId === currentView.id ? persistedId : previousId));
    }

    setDefaultViewState((previousDefaults) => {
      const nextDefaults = { ...previousDefaults };
      const nextId = persistedId ?? currentView.id;

      if (persistedId && persistedId !== currentView.id) {
        delete nextDefaults[currentView.id];
      }

      nextDefaults[nextId] = buildViewDefaultSnapshot({
        ...currentView,
        id: nextId,
      });

      return nextDefaults;
    });
  };

  const revertCurrentViewToDefault = () => {
    if (!currentView) {
      return;
    }

    const defaultSnapshot = defaultViewState[currentView.id];
    if (!defaultSnapshot) {
      return;
    }

    updateView(currentView.id, {
      name: defaultSnapshot.name,
      icon: defaultSnapshot.icon,
      groupBy: defaultSnapshot.groupBy,
      settings: defaultSnapshot.settings,
    });
  };

  const setQuickFilters = useCallback(
    (patch: Partial<MtCollectionQuickFilterState>) => {
      if (!currentView) {
        return;
      }

      setCurrentView({
        ...currentView,
        settings: {
          ...(currentView.settings ?? {}),
          quickFilters: {
            ...currentViewQuickFilters,
            ...patch,
          },
        },
      });
    },
    [currentView, currentViewQuickFilters],
  );

  const setTransientQuickFilters = useCallback((patch: Partial<MtCollectionQuickFilterState>) => {
    setTransientQuickFiltersState((previousFilters) => ({
      ...previousFilters,
      ...patch,
    }));
  }, []);

  const toggleSelected = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const openViewSettings = (pageId = 'root', options?: { focusViewNameEditor?: boolean }) => {
    setViewSettingsPageId(pageId);
    setFocusViewNameEditor(Boolean(options?.focusViewNameEditor));
    setShowViewSettingsState(true);
  };

  const getDefaultVisiblePropertyIds = () => properties.map((property) => property.id);

  const currentViewSettings: MtCollectionViewSettingsState = {
    visiblePropertyIds: currentView?.settings?.visiblePropertyIds ?? getDefaultVisiblePropertyIds(),
    ...(currentView?.settings ?? {}),
    quickFilters: {
      ...currentViewQuickFilters,
      ...transientQuickFilters,
    },
  };

  const isViewSettingsOpen = Boolean(showViewSettingsState && currentView && viewSettings);

  return (
    <MtCollectionContext.Provider
      value={{
        entries,
        onAddEntry,
        views: viewState,
        viewTemplates: viewTemplates ?? views,
        currentView,
        setCurrentView,
        addView,
        updateView,
        deleteView,
        reorderViews,
        hasCurrentViewUnsavedChanges,
        saveCurrentViewAsDefault,
        revertCurrentViewToDefault,
        quickFilters: currentViewQuickFilters,
        setQuickFilters,
        transientQuickFilters,
        setTransientQuickFilters,
        currentUserQuickFilter,
        showViewSettings: showViewSettingsState,
        setShowViewSettings: setShowViewSettingsState,
        viewSettingsPageId,
        setViewSettingsPageId,
        focusViewNameEditor,
        setFocusViewNameEditor,
        openViewSettings,
        properties: propertyState,
        setProperties: setPropertyState,
        selectedIds,
        toggleSelected,
        clearSelection,
        onDeleteEntries,
      }}
    >
      <div
        className={`relative h-full min-h-0 flex flex-col border border-[#2A2A2A] bg-[#111111] rounded ${className}`}
      >
        {/* Toolbar rendering logic */}
        {toolbar === undefined && <MtCollectionToolbar /*<T>*/ />}
        {toolbar !== undefined &&
          toolbar !== null &&
          React.isValidElement(toolbar) &&
          React.cloneElement(toolbar as React.ReactElement)}

        {/* Layout */}
        <div className="flex-1 min-h-0 flex flex-row overflow-hidden">
          <div className="flex-1 min-w-0 min-h-0">
            {currentView ? (
              <currentView.layout
                entries={entries}
                groupBy={currentView.groupBy}
                properties={propertyState}
                viewSettings={currentViewSettings}
                renderEntry={currentView.renderEntry ?? renderEntry}
                assigneeOptions={assigneeOptions}
                onUpdateEntry={onUpdateEntry}
                subtasksEnabled={subtasksEnabled}
                onAddSubtask={onAddSubtask}
              />
            ) : (
              <div>No view selected</div>
            )}
          </div>
          <div
            className={`shrink-0 overflow-hidden transition-[width,opacity,transform] duration-200 ease-out ${isViewSettingsOpen ? 'border-l border-[#2A2A2A] opacity-100 translate-x-0' : 'border-l-0 opacity-0 translate-x-1'}`}
            style={{ width: isViewSettingsOpen ? '18.75rem' : '0rem' }}
          >
            {isViewSettingsOpen ? viewSettings : null}
          </div>
        </div>

        {/* Selection overlay toolbar — floats above content when entries are selected */}
        <MtCollectionSelectionToolbar />
      </div>
    </MtCollectionContext.Provider>
  );
}

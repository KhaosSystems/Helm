import { Circle, CircleCheckBig, DiamondPlus, Search, Settings, Users, X } from 'lucide-react';
import React from 'react';
import { MtButton } from '../../MtButton';
import { useMtCollection } from './MtCollectionContext';
import { MtDropdown, MtDropdownItem } from '../../MtDropdown';
import { MtPopover } from '../../MtPopover';
import { WithContextMenu } from '../../MtContextMenu';
import type { MtCollectionQuickFilterState } from './MtCollectionEntryUtils';
import { MtCollectionViewIcon } from './MtIconSelect';

export function MtCollectionToolbar /*<T extends MtCollectionEntry>*/() {
  const {
    views,
    currentView,
    setCurrentView,
    entries,
    addView,
    deleteView,
    openViewSettings,
    hasCurrentViewUnsavedChanges,
    saveCurrentViewAsDefault,
    revertCurrentViewToDefault,
  } = useMtCollection /*<T>*/();
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [isAddViewOpen, setIsAddViewOpen] = React.useState(false);
  const [templateLayoutName, setTemplateLayoutName] = React.useState<string>(views[0]?.layout?.name ?? '');
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const nextViewIdRef = React.useRef(views.length + 1);
  const availableLayouts = React.useMemo(() => {
    const seen = new Set<string>();
    const layouts: Array<{ id: string; name: string; templateView: (typeof views)[number] }> = [];

    views.forEach((view) => {
      const layoutName = view.layout?.name ?? 'Layout';
      if (seen.has(layoutName)) {
        return;
      }

      seen.add(layoutName);
      layouts.push({
        id: layoutName,
        name: layoutName,
        templateView: view,
      });
    });

    return layouts;
  }, [views]);

  const LayoutToolbarActions = currentView?.layout.ToolbarActions;

  const context = useMtCollection();

  const handleToggleViewSettings = () => {
    context.setShowViewSettings(!context.showViewSettings);
  };

  const viewSettings = currentView?.settings ?? {};
  const quickFilters = (viewSettings.quickFilters as MtCollectionQuickFilterState | undefined) ?? {};

  const getStatusValue = (entry: unknown) => {
    if (!entry || typeof entry !== 'object') {
      return '';
    }

    const statusValue = (entry as { status?: unknown }).status;
    if (typeof statusValue === 'string' || typeof statusValue === 'number') {
      return String(statusValue);
    }

    return '';
  };

  const getAssigneeValue = (entry: unknown) => {
    if (!entry || typeof entry !== 'object') {
      return '';
    }

    const assigneeValue = (entry as { assignee?: unknown }).assignee;

    if (typeof assigneeValue === 'string' || typeof assigneeValue === 'number') {
      return String(assigneeValue);
    }

    if (assigneeValue && typeof assigneeValue === 'object' && 'name' in assigneeValue) {
      const nameValue = (assigneeValue as { name?: unknown }).name;
      if (typeof nameValue === 'string') {
        return nameValue;
      }
    }

    return '';
  };

  const setQuickFilters = (patch: Partial<MtCollectionQuickFilterState>) => {
    if (!currentView) {
      return;
    }

    setCurrentView({
      ...currentView,
      settings: {
        ...(currentView.settings ?? {}),
        quickFilters: {
          ...quickFilters,
          ...patch,
        },
      },
    });
  };

  const statusOptions = Array.from(new Set(entries.map((entry) => getStatusValue(entry)).filter(Boolean))).sort();
  const assigneeOptions = Array.from(new Set(entries.map((entry) => getAssigneeValue(entry)).filter(Boolean))).sort();
  const hasQuickStatusFilter = (quickFilters.status?.length ?? 0) > 0;
  const hasQuickAssigneeFilter = (quickFilters.assignee?.length ?? 0) > 0;

  React.useEffect(() => {
    if (!templateLayoutName || !availableLayouts.some((layout) => layout.id === templateLayoutName)) {
      setTemplateLayoutName(availableLayouts[0]?.id ?? '');
    }
  }, [templateLayoutName, availableLayouts]);

  const createViewFromTemplate = (layoutId: string) => {
    const templateLayout = availableLayouts.find((layout) => layout.id === layoutId);
    const templateView = templateLayout?.templateView ?? currentView ?? views[0];

    if (!templateView) {
      return;
    }

    const baseName = templateView.layout?.name ?? 'View';
    const existingCount = views.filter((view) => view.name.startsWith(baseName)).length;
    const viewName = existingCount > 0 ? `${baseName} ${existingCount + 1}` : baseName;

    addView({
      id: `view-${nextViewIdRef.current++}`,
      name: viewName,
      icon: templateView.icon,
      layout: templateView.layout,
      groupBy: null,
      settings: {},
      renderEntry: templateView.renderEntry,
    });

    setIsAddViewOpen(false);
  };

  React.useEffect(() => {
    if (isSearchOpen) {
      searchInputRef.current?.focus();
    }
  }, [isSearchOpen]);

  const duplicateView = (viewId: string) => {
    const sourceView = views.find((view) => view.id === viewId);
    if (!sourceView) {
      return;
    }

    const existingCount = views.filter((view) => view.name.startsWith(sourceView.name)).length;
    const viewName = existingCount > 0 ? `${sourceView.name} ${existingCount + 1}` : `${sourceView.name} copy`;

    addView({
      ...sourceView,
      id: `view-${nextViewIdRef.current++}`,
      name: viewName,
    });
  };

  return (
    <div className="flex items-center border-b border-[#2A2A2A] h-11 px-4">
      {/** Views */}
      <div className="flex items-center gap-1.5">
        {views.length > 1 &&
          views.map((view) => (
            <WithContextMenu
              key={view.id}
              getContextMenuItems={() => [
                {
                  label: 'Rename',
                  onSelect: () => {
                    setCurrentView(view);
                    openViewSettings('root', { focusViewNameEditor: true });
                  },
                },
                {
                  label: 'Edit view',
                  onSelect: () => {
                    setCurrentView(view);
                    openViewSettings('root');
                  },
                },
                { label: '', separator: true },
                {
                  label: 'Delete view',
                  disabled: views.length <= 1,
                  onSelect: () => {
                    deleteView(view.id);
                  },
                },
                {
                  label: 'Duplicate view',
                  onSelect: () => duplicateView(view.id),
                },
                {
                  label: 'Copy link to view',
                  disabled: true,
                },
              ]}
            >
              {({ openMenu }) => (
                <MtButton
                  variant="ghost"
                  selected={view.id === currentView?.id}
                  className="h-auto min-h-0 items-center gap-2 border border-transparent px-2 py-1 text-sm text-text-muted hover:text-text-primary data-[selected]:border-[#8D8D8D] data-[selected]:text-text-primary"
                  onClick={(event) => {
                    if (view.id === currentView?.id) {
                      openMenu(event);
                      return;
                    }

                    setCurrentView(view);
                  }}
                  onContextMenu={(event) => {
                    setCurrentView(view);
                    openMenu(event);
                  }}
                >
                  <MtCollectionViewIcon iconId={view.icon} layoutName={view.layout?.name} />
                  <span>{view.name}</span>
                </MtButton>
              )}
            </WithContextMenu>
          ))}
        <div className="border-r border-[#2A2A2A] h-6"></div>
        <MtPopover
          open={isAddViewOpen}
          onOpenChange={setIsAddViewOpen}
          content={
            <div className="w-80 flex flex-col gap-2">
              <div className="text-sm text-text-primary">Add view</div>

              <div className="flex flex-col gap-2">
                {availableLayouts.map((layout) => (
                  <MtButton
                    key={layout.id}
                    variant="ghost"
                    selected={templateLayoutName === layout.id}
                    onClick={() => {
                      setTemplateLayoutName(layout.id);
                      createViewFromTemplate(layout.id);
                    }}
                    className="h-auto min-h-0 w-full justify-start rounded border border-[#2A2A2A] px-2 py-2 text-left transition-colors data-[selected]:border-[#8D8D8D] data-[selected]:bg-surface-popover hover:bg-surface-popover"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded border border-[#2A2A2A] bg-[#1A1A1A] flex items-center justify-center text-xs text-text-primary">
                        {layout.templateView.icon ? (
                          <MtCollectionViewIcon
                            iconId={layout.templateView.icon}
                            layoutName={layout.templateView.layout?.name}
                          />
                        ) : (
                          <Circle size={16} />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm text-text-primary truncate">{layout.name}</div>
                        <div className="text-xs text-text-muted truncate">Create from layout</div>
                      </div>
                    </div>
                  </MtButton>
                ))}
              </div>
            </div>
          }
        >
          <MtPopover.Trigger>
            <MtButton kind="icon" variant="ghost">
              <DiamondPlus size={16} stroke="#8D8D8D" />
            </MtButton>
          </MtPopover.Trigger>
        </MtPopover>
      </div>

      {/** Spacer */}
      <div className="flex-1" />

      {/** Actions */}
      <div className="flex items-center gap-1.5">
        {hasCurrentViewUnsavedChanges ? (
          <>
            <div className="flex items-center gap-1">
              <MtButton variant="accent" onClick={saveCurrentViewAsDefault}>
                Save view
              </MtButton>
              <MtButton kind="icon" variant="ghost" onClick={revertCurrentViewToDefault}>
                <X size={14} stroke="#8D8D8D" />
              </MtButton>
            </div>
            <div className="border-r border-[#2A2A2A] h-6"></div>
          </>
        ) : null}

        {LayoutToolbarActions ? <LayoutToolbarActions /> : null}
        <div className="border-r border-[#2A2A2A] h-6"></div>

        <div className="flex items-center gap-1">
          <MtDropdown
            title={<CircleCheckBig size={16} stroke="#8D8D8D" />}
            kind="icon"
            variant={hasQuickStatusFilter ? 'accent' : 'ghost'}
            showCaret={false}
          >
            <div className="w-44 p-1">
              <MtDropdownItem onSelect={() => setQuickFilters({ status: [] })}>All statuses</MtDropdownItem>
              {statusOptions.map((status) => (
                <MtDropdownItem
                  key={status}
                  onSelect={() => {
                    const currentValues = quickFilters.status ?? [];
                    const nextValues = currentValues.includes(status)
                      ? currentValues.filter((value) => value !== status)
                      : [...currentValues, status];
                    setQuickFilters({ status: nextValues });
                  }}
                >
                  {status}
                </MtDropdownItem>
              ))}
            </div>
          </MtDropdown>
          {hasQuickStatusFilter ? (
            <MtButton kind="icon" variant="ghost" onClick={() => setQuickFilters({ status: [] })}>
              <X size={14} stroke="#8D8D8D" />
            </MtButton>
          ) : null}
        </div>

        <div className="flex items-center gap-1">
          <MtDropdown
            title={<Users size={16} stroke="#8D8D8D" />}
            kind="icon"
            variant={hasQuickAssigneeFilter ? 'accent' : 'ghost'}
            showCaret={false}
          >
            <div className="w-44 p-1">
              <MtDropdownItem onSelect={() => setQuickFilters({ assignee: [] })}>All assignees</MtDropdownItem>
              {assigneeOptions.map((assignee) => (
                <MtDropdownItem
                  key={assignee}
                  onSelect={() => {
                    const currentValues = quickFilters.assignee ?? [];
                    const nextValues = currentValues.includes(assignee)
                      ? currentValues.filter((value) => value !== assignee)
                      : [...currentValues, assignee];
                    setQuickFilters({ assignee: nextValues });
                  }}
                >
                  {assignee}
                </MtDropdownItem>
              ))}
            </div>
          </MtDropdown>
          {hasQuickAssigneeFilter ? (
            <MtButton kind="icon" variant="ghost" onClick={() => setQuickFilters({ assignee: [] })}>
              <X size={14} stroke="#8D8D8D" />
            </MtButton>
          ) : null}
        </div>

        <div className="flex items-center gap-1">
          <MtButton kind="icon" variant="ghost" onClick={() => setIsSearchOpen((previous) => !previous)}>
            <Search size={16} stroke="#8D8D8D" />
          </MtButton>
          {isSearchOpen ? (
            <input
              ref={searchInputRef}
              value={quickFilters.search ?? ''}
              onChange={(event) => setQuickFilters({ search: event.target.value })}
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  setIsSearchOpen(false);
                }
              }}
              placeholder="Search entries..."
              className="w-56 rounded border border-[#2A2A2A] bg-transparent px-2 py-1 text-sm outline-none transition-all"
            />
          ) : null}
        </div>

        <div className="border-r border-[#2A2A2A] h-6"></div>
        <MtButton kind="icon" variant="ghost" onClick={handleToggleViewSettings}>
          <Settings size={16} stroke="#8D8D8D" />
        </MtButton>

        <MtButton onClick={() => undefined} variant="accent">
          + Add
        </MtButton>
      </div>
    </div>
  );
}

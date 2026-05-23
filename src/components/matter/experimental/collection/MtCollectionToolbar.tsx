import { Circle, CircleCheckBig, DiamondPlus, Search, Settings, Users, X } from 'lucide-react';
import React from 'react';
import { MtButton } from '../../MtButton';
import MtAvatar from '../../MtAvatar';
import { useMtCollection } from './MtCollectionContext';
import { MtDropdown, MtDropdownItem } from '../../MtDropdown';
import { MtPopover } from '../../MtPopover';
import { WithContextMenu } from '../../MtContextMenu';
import { MtCollectionViewIcon } from './MtIconSelect';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export function MtCollectionToolbar /*<T extends MtCollectionEntry>*/() {
  const {
    views,
    viewTemplates,
    currentView,
    setCurrentView,
    entries,
    onAddEntry,
    addView,
    deleteView,
    reorderViews,
    openViewSettings,
    hasCurrentViewUnsavedChanges,
    saveCurrentViewAsDefault,
    revertCurrentViewToDefault,
    quickFilters,
    setQuickFilters,
    transientQuickFilters,
    setTransientQuickFilters,
    currentUserQuickFilter,
  } = useMtCollection /*<T>*/();
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [isAddViewOpen, setIsAddViewOpen] = React.useState(false);
  const [templateLayoutName, setTemplateLayoutName] = React.useState<string>(
    viewTemplates[0]?.id ?? views[0]?.id ?? '',
  );
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const nextViewIdRef = React.useRef(views.length + 1);
  const availableLayouts = React.useMemo(() => {
    const seen = new Set<unknown>();
    const layouts: Array<{ id: string; name: string; templateView: (typeof views)[number] }> = [];

    (viewTemplates.length > 0 ? viewTemplates : views).forEach((view) => {
      const layoutKey = view.layout;
      if (seen.has(layoutKey)) {
        return;
      }

      seen.add(layoutKey);
      layouts.push({
        id: view.id,
        name: view.name || view.layout?.name || 'Layout',
        templateView: view,
      });
    });

    return layouts;
  }, [viewTemplates, views]);

  const LayoutToolbarActions = currentView?.layout.ToolbarActions;

  const context = useMtCollection();

  const handleToggleViewSettings = () => {
    context.setShowViewSettings(!context.showViewSettings);
  };

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

  const statusOptions = Array.from(new Set(entries.map((entry) => getStatusValue(entry)).filter(Boolean))).sort();
  const assigneeOptions = Array.from(new Set(entries.map((entry) => getAssigneeValue(entry)).filter(Boolean))).sort();
  const hasQuickStatusFilter = (quickFilters.status?.length ?? 0) > 0;
  const hasQuickAssigneeFilter = (quickFilters.assignee?.length ?? 0) > 0;
  const hasCurrentUserQuickFilter = Boolean(
    currentUserQuickFilter && transientQuickFilters.requiredAssignee === currentUserQuickFilter.assignee,
  );

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

    const baseName = templateLayout?.name ?? templateView.name ?? templateView.layout?.name ?? 'View';
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

  const viewIds = React.useMemo(() => views.map((view) => view.id), [views]);
  const dndSensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleViewDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = viewIds.indexOf(String(active.id));
    const newIndex = viewIds.indexOf(String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = arrayMove(viewIds, oldIndex, newIndex);
    void reorderViews(reordered);
  };

  return (
    <div className="flex items-center border-b border-[#2A2A2A] h-11 px-4">
      {/** Views */}
      <div className="flex items-center gap-1.5">
        <DndContext sensors={dndSensors} collisionDetection={closestCenter} onDragEnd={handleViewDragEnd}>
          <SortableContext items={viewIds} strategy={horizontalListSortingStrategy}>
            {views.length > 0 &&
              views.map((view) => (
                <SortableViewTab
                  key={view.id}
                  view={view}
                  isActive={view.id === currentView?.id}
                  onSelect={() => setCurrentView(view)}
                  onOpenMenu={() => {
                    setCurrentView(view);
                  }}
                  onRename={() => {
                    setCurrentView(view);
                    openViewSettings('root', { focusViewNameEditor: true });
                  }}
                  onEdit={() => {
                    setCurrentView(view);
                    openViewSettings('root');
                  }}
                  onDelete={views.length > 1 ? () => deleteView(view.id) : undefined}
                  onDuplicate={() => duplicateView(view.id)}
                />
              ))}
          </SortableContext>
        </DndContext>
        {views.length === 0 ? <span className="text-sm text-text-muted">No views</span> : null}
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

        {currentUserQuickFilter ? (
          <MtButton
            kind="icon"
            variant={hasCurrentUserQuickFilter ? 'accent' : 'ghost'}
            title={`Filter to ${currentUserQuickFilter.label}`}
            onClick={() =>
              setTransientQuickFilters({
                requiredAssignee: hasCurrentUserQuickFilter ? undefined : currentUserQuickFilter.assignee,
              })
            }
          >
            <MtAvatar
              size="xs"
              src={currentUserQuickFilter.avatarSrc}
              name={currentUserQuickFilter.label}
              className="pointer-events-none"
            />
          </MtButton>
        ) : null}

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

        <MtButton onClick={() => void onAddEntry?.()} variant="accent">
          + Add
        </MtButton>
      </div>
    </div>
  );
}

/** Sortable view tab — wraps a single view button with drag-and-drop via dnd-kit. */
function SortableViewTab({
  view,
  isActive,
  onSelect,
  onOpenMenu,
  onRename,
  onEdit,
  onDelete,
  onDuplicate,
}: {
  view: { id: string; name: string; icon?: string; layout?: unknown };
  isActive: boolean;
  onSelect: () => void;
  onOpenMenu: (event: React.MouseEvent) => void;
  onRename: () => void;
  onEdit: () => void;
  onDelete?: () => void;
  onDuplicate: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: view.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
  };

  const layoutName =
    view.layout && typeof view.layout === 'object' && 'name' in view.layout
      ? (view.layout as { name?: string }).name
      : undefined;

  return (
    <WithContextMenu
      getContextMenuItems={() => [
        { label: 'Rename', onSelect: onRename },
        { label: 'Edit view', onSelect: onEdit },
        { label: '', separator: true },
        { label: 'Delete view', disabled: !onDelete, onSelect: () => onDelete?.() },
        { label: 'Duplicate view', onSelect: onDuplicate },
        { label: 'Copy link to view', disabled: true },
      ]}
    >
      {({ openMenu }) => (
        <MtButton
          ref={setNodeRef}
          style={style}
          {...attributes}
          {...listeners}
          variant="ghost"
          selected={isActive}
          className="h-auto min-h-0 items-center gap-2 border border-transparent px-2 py-1 text-sm text-text-muted hover:text-text-primary data-[selected]:border-[#8D8D8D] data-[selected]:text-text-primary"
          onClick={(event) => {
            if (isActive) {
              openMenu(event);
              return;
            }
            onSelect();
          }}
          onContextMenu={(event) => {
            onOpenMenu(event);
            openMenu(event);
          }}
        >
          <MtCollectionViewIcon iconId={view.icon} layoutName={layoutName} />
          <span>{view.name}</span>
        </MtButton>
      )}
    </WithContextMenu>
  );
}

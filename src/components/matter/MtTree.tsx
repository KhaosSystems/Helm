import { ChevronRight } from 'lucide-react';
import { Children, isValidElement, ReactElement, ReactNode, useMemo, useState } from 'react';
import { MtButton } from './MtButton';

export interface MtTreeItem<TData = unknown> {
  id: string;
  label: ReactNode;
  icon?: ReactNode;
  trailing?: ReactNode;
  disabled?: boolean;
  data?: TData;
  children?: MtTreeItem<TData>[];
}

type MtTreeRenderState = {
  isSelected: boolean;
  isExpanded: boolean;
  hasChildren: boolean;
  depth: number;
};

export interface MtTreeChildItemProps<TData = unknown> {
  itemId: string;
  label: ReactNode;
  icon?: ReactNode;
  trailing?: ReactNode;
  disabled?: boolean;
  data?: TData;
  children?: ReactNode;
}

export interface MtTreeProps<TData = unknown> {
  items?: MtTreeItem<TData>[];
  children?: ReactNode;
  className?: string;
  selectedId?: string;
  defaultSelectedId?: string;
  onSelectedIdChange?: (id: string, item: MtTreeItem<TData> | null) => void;
  expandedIds?: string[];
  defaultExpandedIds?: string[];
  onExpandedIdsChange?: (ids: string[]) => void;
  onItemClick?: (item: MtTreeItem<TData>) => void;
  renderItem?: (item: MtTreeItem<TData>, state: MtTreeRenderState) => ReactNode;
  indentPx?: number;
  toggleOnItemClick?: boolean;
}

function MtTreeItemNode<TData = unknown>({ children }: MtTreeChildItemProps<TData>) {
  return <>{children}</>;
}

MtTreeItemNode.displayName = 'MtTreeItem';

function isMtTreeItemElement<TData>(node: ReactNode): node is ReactElement<MtTreeChildItemProps<TData>> {
  return isValidElement(node) && node.type === MtTreeItemNode;
}

function buildItemsFromChildren<TData>(children: ReactNode): MtTreeItem<TData>[] {
  const nodes: MtTreeItem<TData>[] = [];

  Children.forEach(children, (child) => {
    if (!isMtTreeItemElement<TData>(child)) {
      return;
    }

    const childItems = buildItemsFromChildren<TData>(child.props.children);
    nodes.push({
      id: child.props.itemId,
      label: child.props.label,
      icon: child.props.icon,
      trailing: child.props.trailing,
      disabled: child.props.disabled,
      data: child.props.data,
      children: childItems.length > 0 ? childItems : undefined,
    });
  });

  return nodes;
}

function flattenItems<TData>(items: MtTreeItem<TData>[]) {
  const all: MtTreeItem<TData>[] = [];

  const walk = (nodes: MtTreeItem<TData>[]) => {
    for (const node of nodes) {
      all.push(node);
      if (node.children?.length) {
        walk(node.children);
      }
    }
  };

  walk(items);
  return all;
}

function updateExpanded(previous: Set<string>, id: string, nextExpanded?: boolean) {
  const next = new Set(previous);
  const shouldExpand = nextExpanded ?? !next.has(id);

  if (shouldExpand) {
    next.add(id);
  } else {
    next.delete(id);
  }

  return next;
}

type MtTreeComponent = (<TData = unknown>(props: MtTreeProps<TData>) => ReactElement) & {
  Item: typeof MtTreeItemNode;
};

/**
 * See https://mui.com/x/react-tree-view/
 */
const MtTreeBase = <TData = unknown,>({
  items,
  children,
  className,
  selectedId,
  defaultSelectedId,
  onSelectedIdChange,
  expandedIds,
  defaultExpandedIds = [],
  onExpandedIdsChange,
  onItemClick,
  renderItem,
  indentPx = 14,
  toggleOnItemClick = true,
}: MtTreeProps<TData>) => {
  const isSelectedControlled = selectedId !== undefined;
  const isExpandedControlled = expandedIds !== undefined;

  const [internalSelectedId, setInternalSelectedId] = useState(defaultSelectedId ?? '');
  const [internalExpandedIds, setInternalExpandedIds] = useState<Set<string>>(new Set(defaultExpandedIds));

  const activeSelectedId = isSelectedControlled ? selectedId : internalSelectedId;
  const activeExpandedIds = useMemo(
    () => (isExpandedControlled ? new Set(expandedIds) : internalExpandedIds),
    [expandedIds, internalExpandedIds, isExpandedControlled],
  );

  const childItems = useMemo(() => buildItemsFromChildren<TData>(children), [children]);
  const resolvedItems = useMemo(() => {
    if (items?.length && childItems.length) {
      return [...items, ...childItems];
    }

    if (items?.length) {
      return items;
    }

    return childItems;
  }, [items, childItems]);

  const itemById = useMemo(() => {
    return new Map(flattenItems(resolvedItems).map((item) => [item.id, item]));
  }, [resolvedItems]);

  const setSelected = (id: string) => {
    const item = itemById.get(id) ?? null;
    if (!isSelectedControlled) {
      setInternalSelectedId(id);
    }
    onSelectedIdChange?.(id, item);
  };

  const setExpanded = (next: Set<string>) => {
    if (!isExpandedControlled) {
      setInternalExpandedIds(next);
    }
    onExpandedIdsChange?.(Array.from(next));
  };

  const toggleExpanded = (id: string, nextExpanded?: boolean) => {
    setExpanded(updateExpanded(activeExpandedIds, id, nextExpanded));
  };

  const renderNodes = (nodes: MtTreeItem<TData>[], depth: number) => {
    return (
      <ul role="group" className="flex flex-col gap-0.5">
        {nodes.map((node) => {
          const hasChildren = Boolean(node.children?.length);
          const isExpanded = hasChildren && activeExpandedIds.has(node.id);
          const isSelected = activeSelectedId === node.id;
          const renderState: MtTreeRenderState = {
            isSelected,
            isExpanded,
            hasChildren,
            depth,
          };

          return (
            <li key={node.id} role="none" className="flex flex-col">
              <MtButton
                variant="ghost"
                selected={isSelected}
                role="treeitem"
                aria-expanded={hasChildren ? isExpanded : undefined}
                aria-selected={isSelected}
                aria-disabled={node.disabled || undefined}
                disabled={node.disabled}
                onClick={() => {
                  onItemClick?.(node);
                  setSelected(node.id);
                  if (hasChildren && toggleOnItemClick) {
                    toggleExpanded(node.id);
                  }
                }}
                className="h-auto min-h-0 w-full items-center justify-start gap-1 py-1 pr-2 text-left"
                style={{ paddingLeft: `${depth * indentPx + 6}px` }}
              >
                {renderItem ? (
                  renderItem(node, renderState)
                ) : (
                  <>
                    <span className="inline-flex h-4 w-4 items-center justify-center text-text-muted">
                      {hasChildren ? (
                        <ChevronRight
                          onClick={(event) => {
                            event.stopPropagation();
                            toggleExpanded(node.id);
                          }}
                          className={`h-3.5 w-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                        />
                      ) : null}
                    </span>

                    {node.icon && (
                      <span className="inline-flex h-4 w-4 items-center justify-center text-text-primary">
                        {node.icon}
                      </span>
                    )}

                    <span className="truncate text-sm">{node.label}</span>
                    {node.trailing && <span className="ml-auto text-xs text-text-primary">{node.trailing}</span>}
                  </>
                )}
              </MtButton>

              {hasChildren && isExpanded && node.children ? renderNodes(node.children, depth + 1) : null}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div role="tree" className={`w-full ${className || ''}`}>
      {renderNodes(resolvedItems, 0)}
    </div>
  );
};

export const MtTree = MtTreeBase as MtTreeComponent;
MtTree.Item = MtTreeItemNode;

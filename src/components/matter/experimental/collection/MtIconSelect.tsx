import React from 'react';
import { Circle, Columns3, KanbanSquare, LayoutGrid, List, Table2, CalendarDays, Star } from 'lucide-react';
import { MtDropdown, MtDropdownItem } from '../../MtDropdown';

type MtIconOption = {
  id: string;
  label: string;
  icon: React.ReactNode;
};

const ICON_OPTIONS: MtIconOption[] = [
  { id: 'circle', label: 'Circle', icon: <Circle size={16} /> },
  { id: 'list', label: 'List', icon: <List size={16} /> },
  { id: 'table', label: 'Table', icon: <Table2 size={16} /> },
  { id: 'grid', label: 'Grid', icon: <LayoutGrid size={16} /> },
  { id: 'board', label: 'Board', icon: <KanbanSquare size={16} /> },
  { id: 'columns', label: 'Columns', icon: <Columns3 size={16} /> },
  { id: 'calendar', label: 'Calendar', icon: <CalendarDays size={16} /> },
  { id: 'star', label: 'Star', icon: <Star size={16} /> },
];

function getDefaultIconIdFromLayoutName(layoutName?: string) {
  const normalized = String(layoutName ?? '').toLowerCase();

  if (normalized.includes('list')) return 'list';
  if (normalized.includes('table')) return 'table';
  if (normalized.includes('grid')) return 'grid';
  if (normalized.includes('board') || normalized.includes('kanban')) return 'board';
  if (normalized.includes('gantt') || normalized.includes('timeline')) return 'calendar';

  return 'circle';
}

function getCollectionViewIcon(iconId?: string, layoutName?: string, size = 16) {
  const iconProps = { size };
  const resolvedIconId = iconId ?? getDefaultIconIdFromLayoutName(layoutName);

  const iconMap: Record<string, React.ReactNode> = {
    circle: <Circle {...iconProps} />,
    list: <List {...iconProps} />,
    table: <Table2 {...iconProps} />,
    grid: <LayoutGrid {...iconProps} />,
    board: <KanbanSquare {...iconProps} />,
    columns: <Columns3 {...iconProps} />,
    calendar: <CalendarDays {...iconProps} />,
    star: <Star {...iconProps} />,
  };

  return iconMap[resolvedIconId] ?? <Circle {...iconProps} />;
}

export function MtCollectionViewIcon({
  iconId,
  layoutName,
  size = 16,
}: {
  iconId?: string;
  layoutName?: string;
  size?: number;
}) {
  return <>{getCollectionViewIcon(iconId, layoutName, size)}</>;
}

export function MtIconSelect({
  value,
  layoutName,
  onChange,
}: {
  value?: string;
  layoutName?: string;
  onChange: (value: string) => void;
}) {
  return (
    <MtDropdown
      title={<MtCollectionViewIcon iconId={value} layoutName={layoutName} />}
      kind="icon"
      variant="ghost"
      showCaret={false}
    >
      <div className="w-44 p-1">
        {ICON_OPTIONS.map((option) => (
          <MtDropdownItem key={option.id} onSelect={() => onChange(option.id)}>
            <span className="flex items-center gap-2">
              {option.icon}
              {option.label}
            </span>
          </MtDropdownItem>
        ))}
      </div>
    </MtDropdown>
  );
}

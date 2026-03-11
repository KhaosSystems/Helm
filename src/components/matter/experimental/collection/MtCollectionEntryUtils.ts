import type { MtFilterGroup, MtFilterNode, MtFilterRule } from '../../MtFilter';
import type { MtSortRule } from '../../MtSort';

type MtCollectionLegacyFilterState = {
  query?: string;
  status?: string[];
  priority?: string[];
  assignee?: string[];
};

export type MtCollectionQuickFilterState = {
  status?: string[];
  assignee?: string[];
  requiredAssignee?: string;
  search?: string;
};

export type MtCollectionFilterState = MtFilterGroup | MtCollectionLegacyFilterState;

function isFilterGroup(filterState: MtCollectionFilterState): filterState is MtFilterGroup {
  return 'type' in filterState && filterState.type === 'group';
}

function isTruthyFilterValue(value: unknown) {
  if (value === null || value === undefined) {
    return false;
  }

  if (typeof value === 'string') {
    return value.trim().length > 0;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return true;
  }

  return false;
}

export function getCollectionEntryId(entry: any) {
  return String(entry?.identifier ?? entry?.key ?? entry?.id ?? '');
}

export function getCollectionEntrySummary(entry: any) {
  if (typeof entry?.summary === 'string') return entry.summary;
  if (typeof entry?.title === 'string') return entry.title;
  if (typeof entry?.name === 'string') return entry.name;
  return '';
}

export function getCollectionEntryPriority(entry: any) {
  return typeof entry?.priority === 'string' ? entry.priority : '';
}

export function getCollectionEntryAssignee(entry: any) {
  if (typeof entry?.assignee === 'string') return entry.assignee;
  if (typeof entry?.assignee?.name === 'string') return entry.assignee.name;
  return '';
}

export function getCollectionEntryType(entry: any) {
  return String(entry?.entryType ?? entry?.issueType ?? entry?.type ?? '');
}

export function toggleCollectionFilterValue(values: string[] | undefined, value: string) {
  const currentValues = values ?? [];
  return currentValues.includes(value)
    ? currentValues.filter((currentValue) => currentValue !== value)
    : [...currentValues, value];
}

export function getUniqueEntryValues(entries: any[], key: string) {
  const values = new Set<string>();

  entries.forEach((entry) => {
    const rawValue = entry?.[key as keyof typeof entry];
    if (rawValue === null || rawValue === undefined || rawValue === '') {
      return;
    }

    values.add(String(rawValue));
  });

  return Array.from(values).sort((left, right) =>
    left.localeCompare(right, undefined, {
      numeric: true,
      sensitivity: 'base',
    }),
  );
}

export function applyCollectionFilters(entries: any[], filterState: MtCollectionFilterState | undefined) {
  if (!filterState) {
    return entries;
  }

  if (isFilterGroup(filterState)) {
    return entries.filter((entry) => evaluateFilterGroup(entry, filterState));
  }

  const legacyFilterState = filterState;

  const query = String(legacyFilterState.query ?? '')
    .trim()
    .toLowerCase();
  const statusFilters = legacyFilterState.status ?? [];
  const priorityFilters = legacyFilterState.priority ?? [];
  const assigneeFilters = legacyFilterState.assignee ?? [];

  if (!query && statusFilters.length === 0 && priorityFilters.length === 0 && assigneeFilters.length === 0) {
    return entries;
  }

  return entries.filter((entry) => {
    const statusValue = String(entry?.status ?? '');
    const priorityValue = String(entry?.priority ?? '');
    const assigneeValue = String(entry?.assignee ?? '');

    if (statusFilters.length > 0 && !statusFilters.includes(statusValue)) {
      return false;
    }

    if (priorityFilters.length > 0 && !priorityFilters.includes(priorityValue)) {
      return false;
    }

    if (assigneeFilters.length > 0 && !assigneeFilters.includes(assigneeValue)) {
      return false;
    }

    if (!query) {
      return true;
    }

    const idText = getCollectionEntryId(entry).toLowerCase();
    const summaryText = getCollectionEntrySummary(entry).toLowerCase();

    return idText.includes(query) || summaryText.includes(query);
  });
}

function getEntryFieldValue(entry: any, field: string) {
  if (field === 'id') return getCollectionEntryId(entry);
  if (field === 'summary') return getCollectionEntrySummary(entry);
  if (field === 'type' || field === 'entryType' || field === 'issueType') return getCollectionEntryType(entry);
  const value = entry?.[field as keyof typeof entry];
  if (value === null || value === undefined) return undefined;
  return String(value);
}

function evaluateFilterRule(entry: any, rule: MtFilterRule): boolean {
  const rawValue = getEntryFieldValue(entry, rule.field);
  const normalized = String(rawValue ?? '').toLowerCase();
  const compare = String(rule.value ?? '').toLowerCase();

  switch (rule.operator) {
    case 'is':
      return normalized === compare;
    case 'is_not':
      return normalized !== compare;
    case 'contains':
      return normalized.includes(compare);
    case 'is_empty':
      return !rawValue;
    case 'is_not_empty':
      return !!rawValue;
    default:
      return true;
  }
}

function evaluateFilterNode(entry: any, node: MtFilterNode): boolean {
  if (node.type === 'rule') {
    return evaluateFilterRule(entry, node);
  }

  if (node.children.length === 0) return true;
  const results = node.children.map((child) => evaluateFilterNode(entry, child));
  return node.conjunction === 'AND' ? results.every(Boolean) : results.some(Boolean);
}

function evaluateFilterGroup(entry: any, group: MtFilterGroup): boolean {
  return evaluateFilterNode(entry, group);
}

export function getDefaultCollectionFilter(): MtFilterGroup {
  return {
    type: 'group',
    conjunction: 'AND',
    children: [
      {
        type: 'rule',
        field: 'summary',
        operator: 'contains',
        value: '',
      },
    ],
  };
}

export function getCollectionFilterRuleCount(filterState: MtCollectionFilterState | undefined) {
  if (!filterState) return 0;

  if (!isFilterGroup(filterState)) {
    return (
      (filterState.status?.length ?? 0) +
      (filterState.priority?.length ?? 0) +
      (filterState.assignee?.length ?? 0) +
      (filterState.query ? 1 : 0)
    );
  }

  const countRules = (node: MtFilterNode): number => {
    if (node.type === 'rule') return 1;
    return node.children.reduce((sum, child) => sum + countRules(child), 0);
  };

  return countRules(filterState);
}

export const COLLECTION_SORT_FIELDS = [
  { value: 'updated', label: 'Updated' },
  { value: 'priority', label: 'Priority' },
  { value: 'status', label: 'Status' },
  { value: 'type', label: 'Type' },
  { value: 'assignee', label: 'Assignee' },
  { value: 'summary', label: 'Summary' },
];

export const COLLECTION_FILTER_FIELDS = [
  { value: 'summary', label: 'Summary' },
  { value: 'status', label: 'Status' },
  { value: 'priority', label: 'Priority' },
  { value: 'type', label: 'Type' },
  { value: 'assignee', label: 'Assignee' },
  { value: 'id', label: 'ID' },
];

export const COLLECTION_FILTER_OPERATORS = [
  { value: 'is', label: 'is', requiresValue: true },
  { value: 'is_not', label: 'is not', requiresValue: true },
  { value: 'contains', label: 'contains', requiresValue: true },
  { value: 'is_empty', label: 'is empty', requiresValue: false },
  { value: 'is_not_empty', label: 'is not empty', requiresValue: false },
];

export function isCollectionFilterActive(filterState: MtCollectionFilterState | undefined) {
  if (!filterState) {
    return false;
  }

  if (!isFilterGroup(filterState)) {
    return (
      isTruthyFilterValue(filterState.query) ||
      (filterState.status?.length ?? 0) > 0 ||
      (filterState.priority?.length ?? 0) > 0 ||
      (filterState.assignee?.length ?? 0) > 0
    );
  }

  const isActiveNode = (node: MtFilterNode): boolean => {
    if (node.type === 'group') {
      return node.children.some((child) => isActiveNode(child));
    }

    if (node.operator === 'is_empty' || node.operator === 'is_not_empty') {
      return true;
    }

    return isTruthyFilterValue(node.value);
  };

  return isActiveNode(filterState);
}

export function applyCollectionSort(entries: any[], sortRules: MtSortRule[] | undefined, fallbackSortBy = 'updated') {
  const sorted = [...entries];

  const priorityRank: Record<string, number> = { high: 3, medium: 2, low: 1 };
  const statusRank: Record<string, number> = { backlog: 1, open: 2, 'in progress': 3, done: 4 };

  const resolveFieldValue = (entry: any, field: string) => {
    if (field === 'updated') return entry?.updatedAt ?? entry?.updated ?? entry?.id;
    if (field === 'type' || field === 'entryType' || field === 'issueType') return getCollectionEntryType(entry);
    return entry?.[field as keyof typeof entry];
  };

  const compareByField = (left: any, right: any, field: string) => {
    if (field === 'priority') {
      const leftValue = priorityRank[String(left?.priority ?? '').toLowerCase()] ?? 0;
      const rightValue = priorityRank[String(right?.priority ?? '').toLowerCase()] ?? 0;
      return rightValue - leftValue;
    }

    if (field === 'status') {
      const leftValue = statusRank[String(left?.status ?? '').toLowerCase()] ?? 0;
      const rightValue = statusRank[String(right?.status ?? '').toLowerCase()] ?? 0;
      return rightValue - leftValue;
    }

    const leftValue = resolveFieldValue(left, field);
    const rightValue = resolveFieldValue(right, field);

    const leftNumber = Number(leftValue);
    const rightNumber = Number(rightValue);

    if (!Number.isNaN(leftNumber) && !Number.isNaN(rightNumber)) {
      return rightNumber - leftNumber;
    }

    return String(rightValue ?? '').localeCompare(String(leftValue ?? ''), undefined, {
      numeric: true,
      sensitivity: 'base',
    });
  };

  sorted.sort((left, right) => {
    if (sortRules && sortRules.length > 0) {
      for (const rule of sortRules) {
        const comparison = compareByField(left, right, rule.property);
        if (comparison !== 0) {
          return rule.direction === 'desc' ? comparison : -comparison;
        }
      }
      return 0;
    }

    // Primary sort: manual position (higher = closer to top).
    // Items without a position (undefined/null) are treated as 0.
    const leftPos = typeof left?.position === 'number' ? left.position : 0;
    const rightPos = typeof right?.position === 'number' ? right.position : 0;
    if (leftPos !== rightPos) {
      return rightPos - leftPos;
    }

    // Secondary sort: fallback field (e.g. updated time)
    return compareByField(left, right, fallbackSortBy);
  });

  return sorted;
}

export function applyCollectionQuickFilters(entries: any[], quickFilters: MtCollectionQuickFilterState | undefined) {
  if (!quickFilters) {
    return entries;
  }

  const statusFilters = quickFilters.status ?? [];
  const assigneeFilters = quickFilters.assignee ?? [];
  const requiredAssignee = String(quickFilters.requiredAssignee ?? '');
  const search = String(quickFilters.search ?? '')
    .trim()
    .toLowerCase();

  if (statusFilters.length === 0 && assigneeFilters.length === 0 && !requiredAssignee && !search) {
    return entries;
  }

  return entries.filter((entry) => {
    const statusValue = String(entry?.status ?? '');
    const assigneeValue = String(entry?.assignee ?? '');

    if (statusFilters.length > 0 && !statusFilters.includes(statusValue)) {
      return false;
    }

    if (assigneeFilters.length > 0 && !assigneeFilters.includes(assigneeValue)) {
      return false;
    }

    if (requiredAssignee && assigneeValue !== requiredAssignee) {
      return false;
    }

    if (!search) {
      return true;
    }

    const idText = getCollectionEntryId(entry).toLowerCase();
    const summaryText = getCollectionEntrySummary(entry).toLowerCase();
    return idText.includes(search) || summaryText.includes(search);
  });
}

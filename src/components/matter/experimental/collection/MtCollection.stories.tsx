import type { Meta, StoryObj } from '@storybook/react-vite';

import { MtCollection, MtCollectionEntry, MtCollectionView } from './MtCollection';
import { MtCollectionGanttLayout } from './layouts/MtCollectionGanttLayout';
import { MtCollectionBoardLayout } from './layouts/MtCollectionBoardLayout';
import { MtCollectionTableLayout } from './layouts/MtCollectionTableLayout';
import { MtCollectionGridLayout } from './layouts/MtCollectionGridLayout';
import { MtCollectionListLayout } from './layouts/MtCollectionListLayout';
import { MtCollectionTaskListEntry } from './MtCollectionTaskListEntry';

interface MyEntry extends MtCollectionEntry {
  selected?: boolean;
  type?: 'user story' | 'bug' | 'docs' | 'feature' | 'task';
  status?: 'open' | 'in progress' | 'backlog' | 'done';
  priority?: 'low' | 'medium' | 'high';
  summary?: string;
  assignee?: string;
}

const entries: MyEntry[] = new Array(10).fill(null).map((_, i) => ({
  id: `PRJ-${i}`,
  name: `Entry ${i}`,
  type: i % 5 === 0 ? 'bug' : i % 5 === 1 ? 'docs' : i % 5 === 2 ? 'feature' : i % 5 === 3 ? 'task' : 'user story',
  status: i % 4 === 0 ? 'open' : i % 4 === 1 ? 'in progress' : i % 4 === 2 ? 'backlog' : 'done',
  priority: i % 3 === 0 ? 'low' : i % 3 === 1 ? 'medium' : 'high',
  summary: `This is the summary for entry ${i}.`,
}));

const properties = [
  { id: 'id', label: 'ID' },
  { id: 'type', label: 'Type' },
  { id: 'name', label: 'Name' },
  { id: 'status', label: 'Status', groupable: true },
  { id: 'priority', label: 'Priority', groupable: true },
];

const views: MtCollectionView<MyEntry>[] = [
  {
    id: 'list',
    name: 'List',
    layout: MtCollectionListLayout,
    groupBy: null,
  },
  { id: 'grid', name: 'Grid', layout: MtCollectionGridLayout },
  { id: 'table', name: 'Table', layout: MtCollectionTableLayout },
  { id: 'board', name: 'Board', layout: MtCollectionBoardLayout },
  { id: 'gantt', name: 'Gantt', layout: MtCollectionGanttLayout },
];

const meta = {
  title: 'Experimental/Collection',
  component: MtCollection,
  tags: ['autodocs'],
} satisfies Meta<typeof MtCollection>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    entries,
    views,
    properties,
  },
  render: (args) => (
    <div className="p-4">
      <MtCollection {...args} />
    </div>
  ),
};

export const WithoutToolbar: Story = {
  args: {
    entries,
    views,
    properties,
    toolbar: null,
  },
  render: (args) => (
    <div className="p-4">
      <MtCollection {...args} />
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Custom entry renderers — demonstrates dependency injection via renderEntry
// ---------------------------------------------------------------------------

/** Custom list row – must be exactly 44px tall (ENTRY_HEIGHT) for virtualizer. */
function CustomListEntry({ entry }: { entry: MyEntry }) {
  return (
    <MtCollectionTaskListEntry
      entry={entry}
      visiblePropertySet={new Set(['summary', 'id', 'type', 'status', 'priority', 'assignee'])}
      onSummaryChange={() => {}}
      onPriorityChange={() => {}}
      onStatusChange={() => {}}
      onIssueTypeChange={() => {}}
    />
  );
}

/**
 * Views with per-view custom entry renderers.
 * The list view renders a detailed row; the board view renders a card.
 * Other views fall back to their built-in defaults.
 */
const customViews: MtCollectionView<MyEntry>[] = [
  {
    id: 'list',
    name: 'List',
    layout: MtCollectionListLayout,
    renderEntry: CustomListEntry,
    groupBy: null,
  },
  { id: 'board', name: 'Board', layout: MtCollectionBoardLayout },
  { id: 'grid', name: 'Grid', layout: MtCollectionGridLayout },
  { id: 'table', name: 'Table', layout: MtCollectionTableLayout },
];

export const CustomEntryRenderers: Story = {
  args: {
    entries,
    views: customViews,
    properties,
  },
  render: (args) => (
    <div className="p-4">
      <MtCollection {...args} />
    </div>
  ),
};

export const LotsOfEntries: Story = {
  args: {
    entries: new Array(10000).fill(null).map((_, i) => ({
      id: String(i),
      name: `Entry ${i}`,
      status: i % 3 === 0 ? 'open' : i % 3 === 1 ? 'in progress' : 'backlog',
      priority: i % 3 === 0 ? 'low' : i % 3 === 1 ? 'medium' : 'high',
    })),
    views,
    properties,
  },
};

import type { Meta, StoryObj } from '@storybook/react-vite';
import { FileCode2, FileText, Folder } from 'lucide-react';
import { useState } from 'react';

import { MtTree, MtTreeItem } from './MtTree';

const meta = {
  title: 'Display/Tree',
  component: MtTree,
  tags: ['autodocs'],
} satisfies Meta<typeof MtTree>;

export default meta;

type Story = StoryObj<typeof meta>;

type DemoTreeData = {
  kind: 'folder' | 'file';
  path: string;
  size?: number;
};

const matterTreeItems: MtTreeItem<DemoTreeData>[] = [
  {
    id: 'src',
    label: 'src',
    icon: <Folder className="h-4 w-4" />,
    data: { kind: 'folder', path: 'src' },
    children: [
      {
        id: 'src-components',
        label: 'components',
        icon: <Folder className="h-4 w-4" />,
        data: { kind: 'folder', path: 'src/components' },
        children: [
          {
            id: 'src-components-MtButton',
            label: 'MtButton.tsx',
            icon: <FileCode2 className="h-4 w-4" />,
            data: { kind: 'file', path: 'src/components/matter/MtButton.tsx', size: 1380 },
          },
          {
            id: 'src-components-MtInput',
            label: 'MtInput.tsx',
            icon: <FileCode2 className="h-4 w-4" />,
            data: { kind: 'file', path: 'src/components/matter/MtInput.tsx', size: 1028 },
          },
          {
            id: 'src-components-MtTree',
            label: 'MtTree.tsx',
            icon: <FileCode2 className="h-4 w-4" />,
            trailing: 'new',
            data: { kind: 'file', path: 'src/components/matter/MtTree.tsx', size: 5180 },
          },
        ],
      },
      {
        id: 'src-pages',
        label: 'pages',
        icon: <Folder className="h-4 w-4" />,
        data: { kind: 'folder', path: 'src/pages' },
        children: [
          {
            id: 'src-pages-ComponentsPage',
            label: 'ComponentsPage.tsx',
            icon: <FileText className="h-4 w-4" />,
            data: { kind: 'file', path: 'src/pages/ComponentsPage.tsx', size: 32310 },
          },
        ],
      },
    ],
  },
  {
    id: 'README',
    label: 'README.md',
    icon: <FileText className="h-4 w-4" />,
    data: { kind: 'file', path: 'README.md', size: 8410 },
  },
];

export const Default: Story = {
  render: () => {
    const [selectedDeclarativeId, setSelectedDeclarativeId] = useState('grid-community');

    return (
      <div className="max-w-xl space-y-2">
        <MtTree
          selectedId={selectedDeclarativeId}
          onSelectedIdChange={(id) => setSelectedDeclarativeId(id)}
          defaultExpandedIds={['grid', 'pickers', 'charts', 'tree-view']}
        >
          <MtTree.Item itemId="grid" label="Data Grid">
            <MtTree.Item itemId="grid-community" label="@mui/x-data-grid" />
            <MtTree.Item itemId="grid-pro" label="@mui/x-data-grid-pro" />
            <MtTree.Item itemId="grid-premium" label="@mui/x-data-grid-premium" />
          </MtTree.Item>

          <MtTree.Item itemId="pickers" label="Date and Time Pickers">
            <MtTree.Item itemId="pickers-community" label="@mui/x-date-pickers" />
            <MtTree.Item itemId="pickers-pro" label="@mui/x-date-pickers-pro" />
          </MtTree.Item>

          <MtTree.Item itemId="charts" label="Charts">
            <MtTree.Item itemId="charts-community" label="@mui/x-charts" />
          </MtTree.Item>

          <MtTree.Item itemId="tree-view" label="Tree View">
            <MtTree.Item itemId="tree-view-community" label="@mui/x-tree-view" />
          </MtTree.Item>
        </MtTree>

        <p className="text-caption">Selected (declarative): {selectedDeclarativeId}</p>
      </div>
    );
  },
};

export const DataApi: Story = {
  render: () => {
    const [selectedId, setSelectedId] = useState('src-components-MtTree');
    const [selectedItem, setSelectedItem] = useState<MtTreeItem<DemoTreeData> | null>(null);

    return (
      <div className="max-w-xl space-y-2">
        <MtTree
          items={matterTreeItems}
          selectedId={selectedId}
          onSelectedIdChange={(id, item) => {
            setSelectedId(id);
            setSelectedItem(item);
          }}
          defaultExpandedIds={['src', 'src-components']}
          renderItem={(item, state) => (
            <>
              <span className="inline-flex h-4 w-4 items-center justify-center text-neutral-500">
                {state.hasChildren ? (
                  <span className={`h-2 w-2 rounded-full ${state.isExpanded ? 'bg-neutral-300' : 'bg-neutral-600'}`} />
                ) : null}
              </span>
              {item.icon && (
                <span className="inline-flex h-4 w-4 items-center justify-center text-neutral-400">{item.icon}</span>
              )}
              <span className="truncate text-sm">{item.label}</span>
              {item.data?.kind === 'file' && typeof item.data.size === 'number' && (
                <span className="ml-auto text-xs text-neutral-500">{item.data.size}b</span>
              )}
            </>
          )}
        />

        <p className="text-caption">Selected: {selectedId}</p>
        <p className="text-caption">Path: {selectedItem?.data?.path ?? '-'}</p>
      </div>
    );
  },
};

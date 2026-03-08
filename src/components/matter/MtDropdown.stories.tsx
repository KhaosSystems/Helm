import type { Meta, StoryObj } from '@storybook/react-vite';
import { Ellipsis } from 'lucide-react';

import { MtDropdown, MtDropdownItem } from './MtDropdown';

const meta = {
  title: 'Input/Dropdown',
  component: MtDropdown,
  tags: ['autodocs'],
  args: {
    title: 'Open dropdown',
    children: (
      <>
        <MtDropdownItem>Item 1</MtDropdownItem>
        <MtDropdownItem>Item 2</MtDropdownItem>
        <MtDropdownItem>Item 3</MtDropdownItem>
      </>
    ),
  },
} satisfies Meta<typeof MtDropdown>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
  args: {
    children: <></>,
  },
  render: () => (
    <div className="flex gap-6 p-4">
      <div className="flex w-56 flex-col gap-2">
        <small>medium (default)</small>
        <MtDropdown title="Open dropdown">
          <MtDropdownItem>Item 1</MtDropdownItem>
          <MtDropdownItem>Item 2</MtDropdownItem>
          <MtDropdownItem>Item 3</MtDropdownItem>
        </MtDropdown>
      </div>

      <div className="flex w-56 flex-col gap-2">
        <small>large</small>
        <MtDropdown title="Open dropdown" size="large">
          <MtDropdownItem>Item 1</MtDropdownItem>
          <MtDropdownItem>Item 2</MtDropdownItem>
          <MtDropdownItem>Item 3</MtDropdownItem>
        </MtDropdown>
      </div>
    </div>
  ),
};

export const Variants: Story = {
  args: {
    children: <></>,
  },
  render: () => (
    <div className="flex gap-6 p-4">
      <div className="flex w-56 flex-col gap-2">
        <small>default</small>
        <MtDropdown title="Open dropdown" variant="default">
          <MtDropdownItem>Item 1</MtDropdownItem>
          <MtDropdownItem>Item 2</MtDropdownItem>
          <MtDropdownItem>Item 3</MtDropdownItem>
        </MtDropdown>
      </div>

      <div className="flex w-56 flex-col gap-2">
        <small>ghost</small>
        <MtDropdown title="Open dropdown" variant="ghost">
          <MtDropdownItem>Item 1</MtDropdownItem>
          <MtDropdownItem>Item 2</MtDropdownItem>
          <MtDropdownItem>Item 3</MtDropdownItem>
        </MtDropdown>
      </div>
    </div>
  ),
};

export const IconKind: Story = {
  args: {
    children: <></>,
  },
  render: () => (
    <div className="flex gap-6 p-4">
      <div className="flex flex-col gap-2">
        <small>ghost</small>
        <MtDropdown title={<Ellipsis />} kind="icon" variant="ghost">
          <MtDropdownItem>Item 1</MtDropdownItem>
          <MtDropdownItem>Item 2</MtDropdownItem>
          <MtDropdownItem>Item 3</MtDropdownItem>
        </MtDropdown>
      </div>

      <div className="flex flex-col gap-2">
        <small>default</small>
        <MtDropdown title={<Ellipsis />} kind="icon" variant="default">
          <MtDropdownItem>Item 1</MtDropdownItem>
          <MtDropdownItem>Item 2</MtDropdownItem>
          <MtDropdownItem>Item 3</MtDropdownItem>
        </MtDropdown>
      </div>
    </div>
  ),
};

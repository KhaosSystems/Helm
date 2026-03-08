import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { MtCheckbox } from './MtCheckbox';

const meta = {
  title: 'Input/Checkbox',
  component: MtCheckbox,
  tags: ['autodocs'],
  args: {
    label: 'Receive production updates',
    description: 'Get notified about new features and updates to our production environment.',
    checked: false,
  },
} satisfies Meta<typeof MtCheckbox>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const [checked, setChecked] = useState(args.checked);
    return <MtCheckbox {...args} checked={checked} onChange={() => void setChecked((prev) => !prev)} />;
  },
};

export const AllStates: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);

    return (
      <div className="flex flex-col gap-4 p-4">
        <MtCheckbox
          label="Checkbox with description"
          description="This is a description for the checkbox."
          checked={checked}
          onChange={() => void setChecked((prev) => !prev)}
        />
        <MtCheckbox label="Checked" checked={true} />
        <MtCheckbox label="Unchecked" checked={false} />
        <MtCheckbox label="Intermediate" checked={false} intermediate />
        <MtCheckbox label="Invalid and unchecked" checked={false} invalid />
        <MtCheckbox label="Invalid and checked" checked={true} invalid />
        <MtCheckbox label="Disabled and unchecked" checked={false} disabled />
        <MtCheckbox label="Disabled and checked" checked={true} disabled />
      </div>
    );
  },
};

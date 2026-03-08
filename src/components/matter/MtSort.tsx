import { MtButton } from './MtButton';
import { MtDropdown } from './MtDropdown';
import { MtSelect, MtSelectItem } from './MtSelect';
import { ArrowDown, ArrowUp, ArrowUpDown, Plus, Trash2 } from 'lucide-react';

export type MtSortDirection = 'asc' | 'desc';

export type MtSortRule = {
  property: string;
  direction: MtSortDirection;
};

export type MtSortField = {
  value: string;
  label: string;
};

export type MtSortDropdownProps = {
  title?: string | React.ReactNode;
  value: MtSortRule[];
  onChange: (next: MtSortRule[]) => void;
  fields: MtSortField[];
  kind?: 'default' | 'icon';
  size?: 'medium' | 'large';
  variant?: 'default' | 'ghost' | 'accent';
  showCaret?: boolean;
};

const createRule = (fields: MtSortField[]): MtSortRule => ({
  property: fields[0]?.value ?? '',
  direction: 'asc',
});

export function MtSortDropdown({
  title = 'Sort',
  value,
  onChange,
  fields,
  kind = 'default',
  size = 'medium',
  variant = 'default',
  showCaret = true,
}: MtSortDropdownProps) {
  const updateRule = (index: number, patch: Partial<MtSortRule>) => {
    onChange(value.map((rule, idx) => (idx === index ? { ...rule, ...patch } : rule)));
  };

  const removeRule = (index: number) => {
    onChange(value.filter((_, idx) => idx !== index));
  };

  const addRule = () => {
    onChange([...value, createRule(fields)]);
  };

  const renderTriggerIcon = () => {
    if (value.length === 1) {
      return value[0].direction === 'desc' ? <ArrowDown className="h-4 w-4" /> : <ArrowUp className="h-4 w-4" />;
    }
    return <ArrowUpDown className="h-4 w-4" />;
  };

  return (
    <MtDropdown
      title={
        kind === 'icon' ? (
          <span className="inline-flex h-4 w-4 items-center justify-center text-neutral-300">
            {renderTriggerIcon()}
          </span>
        ) : (
          <span className="inline-flex items-center gap-2">
            <span className="inline-flex h-4 w-4 items-center justify-center text-neutral-400">
              {renderTriggerIcon()}
            </span>
            <span>{title}</span>
          </span>
        )
      }
      kind={kind}
      size={size}
      variant={variant}
      showCaret={showCaret}
    >
      <div className="w-105 max-w-[80vw] p-2 text-neutral-200">
        <div className="flex flex-col gap-2">
          {value.length === 0 && <div className="text-xs text-neutral-500">No sorting rules.</div>}
          {value.map((rule, index) => (
            <div
              key={`${rule.property}-${index}`}
              className="flex items-center gap-2 rounded-md border border-neutral-800/70 bg-neutral-950/40 px-2 py-1.5"
            >
              <MtSelect
                value={rule.property}
                onValueChange={(nextValue) => updateRule(index, { property: nextValue })}
                variant="ghost"
                size="medium"
                showCaret={false}
                className="text-xs"
              >
                {fields.map((field) => (
                  <MtSelectItem key={field.value} value={field.value}>
                    {field.label}
                  </MtSelectItem>
                ))}
              </MtSelect>

              <MtSelect
                value={rule.direction}
                onValueChange={(nextValue) =>
                  updateRule(index, {
                    direction: nextValue as MtSortDirection,
                  })
                }
                variant="ghost"
                size="medium"
                showCaret={false}
                className="text-xs"
              >
                <MtSelectItem value="asc">Ascending</MtSelectItem>
                <MtSelectItem value="desc">Descending</MtSelectItem>
              </MtSelect>

              <button
                type="button"
                className="ml-auto text-neutral-400 hover:text-neutral-200"
                onClick={() => removeRule(index)}
                aria-label="Delete sort rule"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-3 flex items-center gap-2 text-xs">
          <MtButton kind="icon" variant="ghost" className="text-neutral-400" onClick={addRule}>
            <Plus className="h-4 w-4" />
          </MtButton>
          <span className="text-neutral-500">Add sort</span>
        </div>
      </div>
    </MtDropdown>
  );
}

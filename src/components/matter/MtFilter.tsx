import { MtButton } from './MtButton';
import { MtDropdown } from './MtDropdown';
import { MtInput } from './MtInput';
import { MtSelect, MtSelectItem } from './MtSelect';
import { Ellipsis, ListFilter, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';

export type MtFilterConjunction = 'AND' | 'OR';

export type MtFilterRule = {
  type: 'rule';
  field: string;
  operator: string;
  value?: string | null;
};

export type MtFilterGroup = {
  type: 'group';
  conjunction: MtFilterConjunction;
  children: MtFilterNode[];
};

export type MtFilterNode = MtFilterRule | MtFilterGroup;

export type MtFilterField = {
  value: string;
  label: string;
  icon?: React.ReactNode;
};

export type MtFilterOperator = {
  value: string;
  label: string;
  requiresValue?: boolean;
};

export type MtFilterDropdownProps = {
  title?: string | React.ReactNode;
  value: MtFilterGroup;
  onChange: (next: MtFilterGroup) => void;
  fields: MtFilterField[];
  operators: MtFilterOperator[];
  advanced?: boolean;
  onAdvancedChange?: (next: boolean) => void;
  kind?: 'default' | 'icon';
  size?: 'medium' | 'large';
  variant?: 'default' | 'ghost' | 'accent';
  showCaret?: boolean;
};

const createRule = (fields: MtFilterField[], operators: MtFilterOperator[]) => {
  const field = fields[0]?.value ?? '';
  const operator = operators[0]?.value ?? '';
  return {
    type: 'rule',
    field,
    operator,
    value: null,
  } satisfies MtFilterRule;
};

const createGroup = (fields: MtFilterField[], operators: MtFilterOperator[]): MtFilterGroup => ({
  type: 'group',
  conjunction: 'AND',
  children: [createRule(fields, operators)],
});

const updateNodeAtPath = (
  root: MtFilterGroup,
  path: number[],
  updater: (node: MtFilterNode) => MtFilterNode,
): MtFilterGroup => {
  if (path.length === 0) {
    return updater(root) as MtFilterGroup;
  }

  const [index, ...rest] = path;
  const child = root.children[index];
  if (!child) return root;

  let nextChild: MtFilterNode = child;
  if (rest.length === 0) {
    nextChild = updater(child);
  } else if (child.type === 'group') {
    nextChild = updateNodeAtPath(child, rest, updater);
  }

  if (nextChild === child) return root;

  return {
    ...root,
    children: root.children.map((node, idx) => (idx === index ? nextChild : node)),
  };
};

const removeNodeAtPath = (root: MtFilterGroup, path: number[]): MtFilterGroup => {
  if (path.length === 0) return root;

  const [index, ...rest] = path;
  if (rest.length === 0) {
    return {
      ...root,
      children: root.children.filter((_, idx) => idx !== index),
    };
  }

  const child = root.children[index];
  if (!child || child.type !== 'group') return root;

  const nextChild = removeNodeAtPath(child, rest);
  return {
    ...root,
    children: root.children.map((node, idx) => (idx === index ? nextChild : node)),
  };
};

const ensureGroupHasChildren = (group: MtFilterGroup, fields: MtFilterField[], operators: MtFilterOperator[]) => {
  if (group.children.length > 0) return group;
  return { ...group, children: [createRule(fields, operators)] };
};

export function MtFilterDropdown({
  title = 'Filter',
  value,
  onChange,
  fields,
  operators,
  advanced,
  onAdvancedChange,
  kind = 'default',
  size = 'medium',
  variant = 'default',
  showCaret = true,
}: MtFilterDropdownProps) {
  const [localAdvanced, setLocalAdvanced] = useState(false);
  const isAdvanced = advanced ?? localAdvanced;
  const setAdvanced = onAdvancedChange ?? setLocalAdvanced;

  const operatorByValue = useMemo(() => {
    const map = new Map<string, MtFilterOperator>();
    operators.forEach((op) => map.set(op.value, op));
    return map;
  }, [operators]);

  const fieldByValue = useMemo(() => {
    const map = new Map<string, MtFilterField>();
    fields.forEach((field) => map.set(field.value, field));
    return map;
  }, [fields]);

  const updateRoot = (next: MtFilterGroup) => onChange(ensureGroupHasChildren(next, fields, operators));

  const ensureSimpleRule = () => {
    const first = value.children[0];
    if (first && first.type === 'rule') return first;
    return createRule(fields, operators);
  };

  const renderSimpleRule = () => {
    const rule = ensureSimpleRule();
    const operator = operatorByValue.get(rule.operator);
    const requiresValue = operator?.requiresValue ?? true;

    const fieldIcon = fieldByValue.get(rule.field)?.icon;

    return (
      <div className="flex items-center gap-2 rounded-md border border-border-default bg-surface-subtle px-2 py-1.5">
        <span className="inline-flex h-4 w-4 items-center justify-center">
          {fieldIcon || <ListFilter className="h-4 w-4" />}
        </span>
        <MtSelect
          value={rule.field}
          onValueChange={(nextValue) => {
            const nextRule = { ...rule, field: nextValue };
            updateRoot({
              ...value,
              conjunction: 'AND',
              children: [nextRule],
            });
          }}
          variant="ghost"
          size="medium"
          showCaret={false}
          className="text-xs"
        >
          {fields.map((field) => (
            <MtSelectItem key={field.value} value={field.value} icon={field.icon}>
              {field.label}
            </MtSelectItem>
          ))}
        </MtSelect>

        <MtSelect
          value={rule.operator}
          onValueChange={(nextValue) => {
            const nextRule = {
              ...rule,
              operator: nextValue,
              value: null,
            };
            updateRoot({
              ...value,
              conjunction: 'AND',
              children: [nextRule],
            });
          }}
          variant="ghost"
          size="medium"
          showCaret={false}
          className="text-xs"
        >
          {operators.map((op) => (
            <MtSelectItem key={op.value} value={op.value}>
              {op.label}
            </MtSelectItem>
          ))}
        </MtSelect>

        {requiresValue ? (
          <MtInput
            className="flex-1 w-full text-xs"
            placeholder="Value"
            value={rule.value ?? ''}
            onChange={(event) => {
              const nextRule = { ...rule, value: event.target.value };
              updateRoot({
                ...value,
                conjunction: 'AND',
                children: [nextRule],
              });
            }}
            variant="ghost"
          />
        ) : (
          <span className="text-xs">No value</span>
        )}
      </div>
    );
  };

  const renderRule = (rule: MtFilterRule, path: number[]) => {
    const operator = operatorByValue.get(rule.operator);
    const requiresValue = operator?.requiresValue ?? true;

    return (
      <div className="flex items-center gap-2 rounded-md border border-border-default bg-surface-subtle px-2 py-1.5">
        <MtSelect
          value={rule.field}
          onValueChange={(nextValue) => {
            updateRoot(
              updateNodeAtPath(value, path, (node) => ({
                ...(node as MtFilterRule),
                field: nextValue,
              })),
            );
          }}
          variant="ghost"
          size="medium"
          showCaret={false}
          className="text-xs"
        >
          {fields.map((field) => (
            <MtSelectItem key={field.value} value={field.value} icon={field.icon}>
              {field.label}
            </MtSelectItem>
          ))}
        </MtSelect>

        <MtSelect
          value={rule.operator}
          onValueChange={(nextValue) => {
            updateRoot(
              updateNodeAtPath(value, path, (node) => ({
                ...(node as MtFilterRule),
                operator: nextValue,
                value: null,
              })),
            );
          }}
          variant="ghost"
          size="medium"
          showCaret={false}
          className="text-xs"
        >
          {operators.map((op) => (
            <MtSelectItem key={op.value} value={op.value}>
              {op.label}
            </MtSelectItem>
          ))}
        </MtSelect>

        {requiresValue ? (
          <MtInput
            className="flex-1 w-full text-xs"
            placeholder="Value"
            value={rule.value ?? ''}
            onChange={(event) => {
              updateRoot(
                updateNodeAtPath(value, path, (node) => ({
                  ...(node as MtFilterRule),
                  value: event.target.value,
                })),
              );
            }}
            variant="ghost"
          />
        ) : (
          <span className="text-xs text-text-muted">No value</span>
        )}

        <button
          type="button"
          className="text-text-muted hover:text-text-default"
          onClick={() => updateRoot(removeNodeAtPath(value, path))}
          aria-label="Delete rule"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    );
  };

  const renderGroup = (group: MtFilterGroup, path: number[], isRoot = false) => {
    return (
      <div className="flex flex-col gap-2 rounded-lg border border-border-default bg-surface-subtle p-2">
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <span className="uppercase tracking-wide">{isRoot ? 'Where' : 'Group'}</span>
          <button
            type="button"
            className="rounded-md border border-border-default bg-surface-subtle px-2 py-1 text-xs text-text-primary"
            onClick={() => {
              updateRoot(
                updateNodeAtPath(value, path, (node) => ({
                  ...(node as MtFilterGroup),
                  conjunction: (node as MtFilterGroup).conjunction === 'AND' ? 'OR' : 'AND',
                })),
              );
            }}
          >
            {group.conjunction}
          </button>
          {!isRoot && (
            <button
              type="button"
              className="ml-auto text-text-muted hover:text-text-default"
              onClick={() => updateRoot(removeNodeAtPath(value, path))}
              aria-label="Delete group"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex flex-col gap-2">
          {group.children.map((child, index) => {
            const childPath = [...path, index];
            if (child.type === 'group') {
              return <div key={`group-${index}`}>{renderGroup(child, childPath)}</div>;
            }
            return <div key={`rule-${index}`}>{renderRule(child, childPath)}</div>;
          })}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <MtButton
            kind="icon"
            variant="ghost"
            className="text-text-muted"
            onClick={() => {
              updateRoot(
                updateNodeAtPath(value, path, (node) => ({
                  ...(node as MtFilterGroup),
                  children: [...(node as MtFilterGroup).children, createRule(fields, operators)],
                })),
              );
            }}
          >
            <Plus className="h-4 w-4" />
          </MtButton>
          <span className="text-text-primary">Add rule</span>

          <MtButton
            kind="icon"
            variant="ghost"
            className="text-text-muted"
            onClick={() => {
              updateRoot(
                updateNodeAtPath(value, path, (node) => ({
                  ...(node as MtFilterGroup),
                  children: [...(node as MtFilterGroup).children, createGroup(fields, operators)],
                })),
              );
            }}
          >
            <Plus className="h-4 w-4" />
          </MtButton>
          <span className="text-text-primary">Add group</span>
        </div>
      </div>
    );
  };

  const simpleFieldIcon = fieldByValue.get(ensureSimpleRule().field)?.icon;
  const triggerIcon = isAdvanced ? (
    <ListFilter className="h-4 w-4" />
  ) : (
    simpleFieldIcon || <ListFilter className="h-4 w-4" />
  );

  return (
    <MtDropdown
      title={
        kind === 'icon' ? (
          <span className="inline-flex h-4 w-4 items-center justify-center text-text-primary">{triggerIcon}</span>
        ) : (
          <span className="inline-flex items-center gap-2">
            <span className="inline-flex h-4 w-4 items-center justify-center text-text-primary">{triggerIcon}</span>
            <span>{title}</span>
          </span>
        )
      }
      kind={kind}
      size={size}
      variant={variant}
      showCaret={showCaret}
    >
      <div className="w-130 max-w-[80vw] p-2 text-text-primary">
        <div className="mb-2 flex items-center justify-between">
          <span className="flex items-center gap-2 text-xs uppercase tracking-wide text-text-muted">
            {isAdvanced && <ListFilter className="h-3.5 w-3.5" />}
            {isAdvanced ? 'Advanced' : 'Simple'} filter
          </span>
          <button
            type="button"
            className="text-text-muted hover:text-text-default"
            onClick={() => setAdvanced(!isAdvanced)}
            aria-label="Toggle filter type"
          >
            <Ellipsis className="h-4 w-4" />
          </button>
        </div>
        {isAdvanced ? renderGroup(value, [], true) : renderSimpleRule()}
      </div>
    </MtDropdown>
  );
}

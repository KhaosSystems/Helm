import { Check, Minus } from 'lucide-react';
import { InputHTMLAttributes } from 'react';

interface MtCheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  /** The label for the checkbox */
  label?: string;
  /** Marks the checkbox as invalid */
  invalid?: boolean;
  /** A description for the checkbox */
  description?: string;
  /** Sets the checkbox to an intermediate state. This is only a visual state and does not affect the value. */
  intermediate?: boolean;
  className?: string;
}

/**
 * TODO: Consider using `value` instead of `checked` to be more consistent with other input components. Not sure if it's better to be consistent with native checkboxes or with our other components. Maybe we can support both? If `value` is provided, it takes precedence over `checked`.
 */
export function MtCheckbox({
  label,
  checked,
  invalid = false,
  description,
  intermediate = false,
  disabled,
  onChange,
  className,
  ...inputProps
}: MtCheckboxProps) {
  const indicator = intermediate ? <Minus className="h-3 w-3" /> : <Check className="h-3 w-3" />;

  return (
    <label
      className={`inline-flex items-start gap-2.5 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'} ${className || ''}`}
    >
      <span className="relative inline-flex h-6 w-6 items-center justify-center rounded-md" aria-hidden>
        <input
          {...inputProps}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={onChange}
          className="absolute inset-0 m-0 h-full w-full cursor-inherit opacity-0"
        />

        <span
          className={`pointer-events-none inline-flex h-[14px] w-[14px] items-center justify-center rounded-[3px] text-[10px] transition-colors ${
            invalid
              ? 'border border-red-500 bg-red-500/15 text-status-danger'
              : checked || intermediate
                ? 'mt-surface-input-accent border border-input-accent-background-default text-white'
                : 'mt-surface-input-default text-transparent'
          } ${disabled ? 'opacity-45' : ''}`}
        >
          {(checked || intermediate) && indicator}
        </span>
      </span>

      {(label || description) && (
        <span className="flex min-w-0 flex-col">
          {label && (
            <span className={`text-sm leading-5 ${disabled ? '' : 'text-text-primary'}`}>{label}</span>
          )}
          {description ? <span className="text-xs text-text-muted">{description}</span> : null}
        </span>
      )}
    </label>
  );
}

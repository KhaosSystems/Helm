import { Search, X } from 'lucide-react';
import { ChangeEvent, InputHTMLAttributes, useRef, useState } from 'react';
import { MtButton } from './MtButton';

interface MtSearchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'variant' | 'type'> {
  size?: 'medium' | 'large';
  variant?: 'default' | 'ghost';
}

export function MtSearch({
  size = 'medium',
  variant = 'default',
  className,
  value: propValue,
  onChange,
  placeholder = 'Search',
  ...props
}: MtSearchProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [internalValue, setInternalValue] = useState('');

  const isControlled = propValue !== undefined;
  const value = isControlled ? String(propValue ?? '') : internalValue;

  const layoutClasses = {
    medium: 'mt-layout-input-medium',
    large: 'mt-layout-input-large',
  };

  const surfaceClasses = {
    default: 'mt-surface-input-default',
    ghost: 'mt-surface-input-ghost',
  };

  const iconSizeClass = size === 'large' ? 'h-4 w-4' : 'h-3.5 w-3.5';
  const baseClasses = 'w-fit flex items-center gap-2 rounded';

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) setInternalValue(event.target.value);
    onChange?.(event);
  };

  const clear = () => {
    if (isControlled) {
      onChange?.({ target: { value: '' } } as ChangeEvent<HTMLInputElement>);
    } else {
      setInternalValue('');
    }
    inputRef.current?.focus();
  };

  return (
    <div
      className={`relative pl-2 ${baseClasses} ${layoutClasses[size]} ${surfaceClasses[variant]} ${className || ''}`}
    >
      <Search className={`${iconSizeClass} shrink-0`} aria-hidden="true" />
      <input
        {...props}
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full min-w-24 bg-transparent outline-none"
      />
      {value.length > 0 && (
        <MtButton
          kind="icon"
          size={size}
          variant="ghost"
          onClick={clear}
          className="absolute right-2 shrink-0 w-5! h-5!"
          aria-label="Clear search"
        >
          <X className={iconSizeClass} />
        </MtButton>
      )}
    </div>
  );
}

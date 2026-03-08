import { forwardRef, InputHTMLAttributes } from 'react';

interface MtInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'variant'> {
  size?: 'medium' | 'large';
  variant?: 'default' | 'ghost';
  placeholder?: string;
}

/**
 * TODO: Make it possible to edit inputs by hovering and typing. No pressing.
 */
export const MtInput = forwardRef<HTMLInputElement, MtInputProps>(({ size, variant, className, ...props }, ref) => {
  const actualSize = size || 'medium';
  const layoutClasses = {
    medium: 'mt-layout-input-medium',
    large: 'mt-layout-input-large',
  };

  const actualvariant = variant || 'default';
  const surfaceClasses = {
    default: 'mt-surface-input-default',
    ghost: 'mt-surface-input-ghost',
  };

  const baseClasses = 'w-fit border rounded outline-none';

  return (
    <input
      {...props}
      ref={ref}
      className={`${baseClasses} ${layoutClasses[actualSize]} ${surfaceClasses[actualvariant]} ${className || ''}`}
    />
  );
});

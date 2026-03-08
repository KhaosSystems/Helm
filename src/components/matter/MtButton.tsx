import { ButtonHTMLAttributes, ReactNode } from 'react';
import React from 'react';

type MtButtonSurface = 'default' | 'accent' | 'ghost';

interface MtButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  type?: 'button' | 'submit' | 'reset';
  kind?: 'default' | 'icon';
  size?: 'medium' | 'large';
  variant?: MtButtonSurface;
}

/**
 * TODO copy how Grafana does variants and size lineups: https://developers.grafana.com/ui/latest/index.html?path=/story/inputs-button--examples
 */
const MtButtonBase = React.forwardRef<HTMLButtonElement, MtButtonProps>(
  ({ children, type = 'button', size = 'medium', variant = 'default', kind = 'default', className, ...props }, ref) => {
    const defaultLayoutClasses = {
      medium: 'mt-layout-input-medium w-fit',
      large: 'mt-layout-input-large w-fit',
    };

    const iconKindClasses = {
      medium: 'w-[24px] h-[24px] p-1 flex items-center justify-center', // 24x24
      large: 'w-[32px] h-[32px] p-1 flex items-center justify-center', // 32x32
    };

    const surfaceClasses: Record<MtButtonSurface, string> = {
      default: 'mt-surface-input-default',
      accent: 'mt-surface-input-accent',
      ghost: 'mt-surface-input-ghost',
    };

    const baseClasses =
      'flex items-center gap-2 rounded transition-all duration-150 focus:ring-offset-neutral-900 focus:outline-none';

    const layoutClasses = kind === 'icon' ? iconKindClasses[size] : defaultLayoutClasses[size];

    return (
      <button
        ref={ref}
        type={type}
        className={`${baseClasses} ${layoutClasses} ${surfaceClasses[variant]} ${className || ''}`}
        {...props}
      >
        {children}
      </button>
    );
  },
);

MtButtonBase.displayName = 'MtButton';

export const MtButton = MtButtonBase;

import { ButtonHTMLAttributes, ReactNode } from 'react';
import React from 'react';

import { MtTooltip } from './MtTooltip';

type MtButtonSurface = 'default' | 'accent' | 'ghost' | 'panel';

interface MtButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  type?: 'button' | 'submit' | 'reset';
  kind?: 'default' | 'icon';
  size?: 'small' | 'medium' | 'large';
  variant?: MtButtonSurface;
  selected?: boolean;
  tooltip?: ReactNode;
  tooltipVariant?: 'info' | 'error';
  tooltipSide?: 'top' | 'right' | 'bottom' | 'left';
  tooltipAlign?: 'start' | 'center' | 'end';
}

/**
 * TODO copy how Grafana does variants and size lineups: https://developers.grafana.com/ui/latest/index.html?path=/story/inputs-button--examples
 */
const MtButtonBase = React.forwardRef<HTMLButtonElement, MtButtonProps>(
  (
    {
      children,
      type = 'button',
      size = 'medium',
      variant = 'default',
      kind = 'default',
      selected = false,
      tooltip,
      tooltipVariant = 'info',
      tooltipSide = 'top',
      tooltipAlign = 'center',
      className,
      ...props
    },
    ref,
  ) => {
    const defaultLayoutClasses = {
      small: 'mt-layout-input-medium w-fit',
      medium: 'mt-layout-input-medium w-fit',
      large: 'mt-layout-input-large w-fit',
    };

    const iconKindClasses = {
      small: 'w-[18px] h-[18px] p-0.5 flex items-center justify-center', // 18x18
      medium: 'w-[24px] h-[24px] p-1 flex items-center justify-center', // 24x24
      large: 'w-[32px] h-[32px] p-1 flex items-center justify-center', // 32x32
    };

    const surfaceClasses: Record<MtButtonSurface, string> = {
      default: 'mt-surface-input-default',
      accent: 'mt-surface-input-accent',
      ghost: 'mt-surface-input-ghost',
      panel: 'mt-surface-input-panel',
    };

    const baseClasses = 'flex items-center gap-2 rounded transition-all duration-150';

    const layoutClasses = kind === 'icon' ? iconKindClasses[size] : defaultLayoutClasses[size];
    const button = (
      <button
        ref={ref}
        type={type}
        data-selected={selected ? 'true' : undefined}
        className={`${baseClasses} ${layoutClasses} ${surfaceClasses[variant]} ${className || ''}`}
        {...props}
      >
        {children}
      </button>
    );

    if (!tooltip) {
      return button;
    }

    return (
      <MtTooltip content={tooltip} variant={tooltipVariant} side={tooltipSide} align={tooltipAlign}>
        {button}
      </MtTooltip>
    );
  },
);

MtButtonBase.displayName = 'MtButton';

export const MtButton = MtButtonBase;

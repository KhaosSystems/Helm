import { useState } from 'react';
import type { ReactNode } from 'react';
import { CheckCircle2, CircleAlert, CircleX, Info, X } from 'lucide-react';
import { MtButton } from './MtButton';

export type MtAlertSeverity = 'success' | 'info' | 'warning' | 'error';

interface MtAlertProps {
  title: ReactNode;
  content: ReactNode;
  severity?: MtAlertSeverity;
  actions?: ReactNode;
  showCloseButton?: boolean;
  className?: string;
}

const severityConfig: Record<
  MtAlertSeverity,
  {
    icon: typeof CheckCircle2;
    iconClassName: string;
    borderClassName: string;
  }
> = {
  success: {
    icon: CheckCircle2,
    iconClassName: 'text-status-success',
    borderClassName: 'border-status-success',
  },
  info: {
    icon: Info,
    iconClassName: 'text-status-info',
    borderClassName: 'border-status-info',
  },
  warning: {
    icon: CircleAlert,
    iconClassName: 'text-status-warning',
    borderClassName: 'border-status-warning',
  },
  error: {
    icon: CircleX,
    iconClassName: 'text-status-danger',
    borderClassName: 'border-status-danger',
  },
};

export function MtAlert({
  title,
  content,
  severity = 'info',
  actions,
  showCloseButton = true,
  className,
}: MtAlertProps) {
  const [isVisible, setIsVisible] = useState(true);
  const { icon: Icon, iconClassName, borderClassName } = severityConfig[severity];

  if (!isVisible) {
    return null;
  }

  return (
    <div role="alert" className={`mt-surface-elevated p-3 border-2 ${borderClassName} ${className || ''}`}>
      <div className="flex items-start gap-3">
        <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${iconClassName}`} />

        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold">{title}</div>
          <div className="mt-1 text-sm">{content}</div>

          {actions && <div className="mt-3">{actions}</div>}
        </div>

        {showCloseButton && (
          <MtButton
            kind="icon"
            size="medium"
            variant="ghost"
            aria-label="Close alert"
            onClick={() => setIsVisible(false)}
            className="shrink-0"
          >
            <X className="h-4 w-4" />
          </MtButton>
        )}
      </div>
    </div>
  );
}

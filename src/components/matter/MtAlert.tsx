import type { ReactNode } from 'react';
import { CheckCircle2, CircleAlert, CircleX, Info } from 'lucide-react';

export type MtAlertSeverity = 'success' | 'info' | 'warning' | 'error';

interface MtAlertProps {
  title: ReactNode;
  content: ReactNode;
  severity?: MtAlertSeverity;
  actions?: ReactNode;
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

export function MtAlert({ title, content, severity = 'info', actions, className }: MtAlertProps) {
  const { icon: Icon, iconClassName, borderClassName } = severityConfig[severity];

  return (
    <div
      role="alert"
      className={`mt-surface-elevated p-3 border-2 ${borderClassName} ${className || ''}`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${iconClassName}`} />

        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold">{title}</div>
          <div className="mt-1 text-sm">{content}</div>

          {actions && <div className="mt-3">{actions}</div>}
        </div>
      </div>
    </div>
  );
}

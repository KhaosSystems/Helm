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
    backgroundClassName: string;
  }
> = {
  success: {
    icon: CheckCircle2,
    iconClassName: 'text-emerald-300',
    borderClassName: 'border-emerald-400/40',
    backgroundClassName: 'bg-emerald-500/10',
  },
  info: {
    icon: Info,
    iconClassName: 'text-blue-300',
    borderClassName: 'border-blue-400/40',
    backgroundClassName: 'bg-blue-500/10',
  },
  warning: {
    icon: CircleAlert,
    iconClassName: 'text-amber-300',
    borderClassName: 'border-amber-400/40',
    backgroundClassName: 'bg-amber-500/10',
  },
  error: {
    icon: CircleX,
    iconClassName: 'text-red-300',
    borderClassName: 'border-red-400/40',
    backgroundClassName: 'bg-red-500/10',
  },
};

export function MtAlert({ title, content, severity = 'info', actions, className }: MtAlertProps) {
  const { icon: Icon, iconClassName, borderClassName, backgroundClassName } = severityConfig[severity];

  return (
    <div
      role="alert"
      className={`rounded-xl border p-3 backdrop-blur-sm ${borderClassName} ${backgroundClassName} ${className || ''}`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${iconClassName}`} />

        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-neutral-100">{title}</div>
          <div className="mt-1 text-sm text-neutral-200">{content}</div>

          {actions && <div className="mt-3">{actions}</div>}
        </div>
      </div>
    </div>
  );
}

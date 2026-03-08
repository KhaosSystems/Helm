import { ReactNode } from 'react';

interface MtDividerProps {
  title?: string | ReactNode;
  className?: string;
}

export function MtDivider({ title, className }: MtDividerProps) {
  if (!title) {
    return (
      <div className={`my-4 ${className || ''}`}>
        <div className="h-px w-full bg-neutral-700/60" />
      </div>
    );
  }

  return (
    <div className={`my-4 flex items-center gap-3 ${className || ''}`}>
      <div className="h-px flex-1 bg-border-default" />
      <span className="text-xs uppercase tracking-wide text-neutral-500">{title}</span>
      <div className="h-px flex-1 bg-border-default" />
    </div>
  );
}

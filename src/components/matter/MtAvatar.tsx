import { HTMLAttributes, useMemo, useState } from 'react';

export type MtAvatarSize = 'xs' | 'sm' | 'md' | 'lg';

export interface MtAvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  name?: string;
  initials?: string;
  size?: MtAvatarSize;
}

const sizeClasses: Record<MtAvatarSize, string> = {
  xs: 'h-[18px] w-[18px] text-[9px]',
  sm: 'h-6 w-6 text-[10px]',
  md: 'h-8 w-8 text-xs',
  lg: 'h-10 w-10 text-sm',
};

function resolveInitials(input?: string): string {
  const cleaned = input?.trim();
  if (!cleaned) {
    return '?';
  }

  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase();
}

export default function MtAvatar({ src, alt, name, initials, size = 'sm', className, ...props }: MtAvatarProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  const fallbackInitials = useMemo(() => resolveInitials(initials ?? name ?? alt), [alt, initials, name]);

  const rootClasses = [
    'inline-flex rounded-full shrink-0 select-none items-center justify-center overflow-hidden bg-surface-popover text-white',
    sizeClasses[size],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClasses} title={alt ?? name} {...props}>
      {src && failedSrc !== src ? (
        <img
          src={src}
          alt={alt ?? name ?? 'Avatar'}
          className="h-full w-full object-cover"
          onError={() => setFailedSrc(src)}
        />
      ) : (
        <span aria-hidden="true" className="font-medium leading-none">
          {fallbackInitials}
        </span>
      )}
    </div>
  );
}

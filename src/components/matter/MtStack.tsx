interface MtStackProps {
  children: React.ReactNode;
  gap?: number;
  /**
   * I am not sure if it's better to make this direction='row' | 'column'. That is way more text, so i kinda like just row,
   * but when we start to want row-reverse and column-reverse it might be better to have a more explicit direction prop
   * instead of multiple booleans. Alternative is to have a reverse boolean.
   */
  row?: boolean;
  /** Mirrors https://tailwindcss.com/docs/align-items */
  align?: 'start' | 'end' | 'center' | 'baseline' | 'stretch';
  /** Mirrors https://tailwindcss.com/docs/justify-content */
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly' | 'stretch' | 'baseline' | 'normal';
  className?: string;
}

/**
 * Ref: https://mui.com/material-ui/react-stack/
 */
export default function MtStack({
  children,
  gap = 0,
  row = false,
  align,
  justify = 'start',
  className = '',
}: MtStackProps) {
  const resolvedAlign = align ?? (row ? 'center' : 'stretch');

  const alignClass = {
    start: 'items-start',
    end: 'items-end',
    center: 'items-center',
    baseline: 'items-baseline',
    stretch: 'items-stretch',
  }[resolvedAlign];

  const justifyClass = {
    start: 'justify-start',
    end: 'justify-end',
    center: 'justify-center',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly',
    stretch: 'justify-stretch',
    baseline: 'justify-baseline',
    normal: 'justify-normal',
  }[justify];

  return (
    <div
      className={`flex flex-1 ${alignClass} ${justifyClass} ${row ? 'flex-row' : 'flex-col'} ${className}`}
      style={{ gap: `${gap * 0.25}rem` }} // Tailwind's spacing scale is based on multiples of 0.25rem
    >
      {children}
    </div>
  );
}

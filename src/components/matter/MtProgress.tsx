interface MtProgressProps {
  value: number;
  max?: number;
  className?: string;
  barClassName?: string;
}

export function MtProgress({ value, max = 100, className, barClassName }: MtProgressProps) {
  const safeMax = max > 0 ? max : 100;
  const clamped = Math.min(Math.max(value, 0), safeMax);

  return (
    <progress
      className={`h-2 w-full overflow-hidden rounded-full appearance-none bg-surface-subtle [&::-webkit-progress-bar]:bg-surface-subtle [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-blue-500 [&::-webkit-progress-value]:transition-all [&::-webkit-progress-value]:duration-300 [&::-moz-progress-bar]:rounded-full [&::-moz-progress-bar]:bg-blue-500 ${className || ''} ${barClassName || ''}`}
      max={safeMax}
      value={clamped}
    />
  );
}

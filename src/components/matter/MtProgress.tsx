interface MtProgressProps {
  value: number;
  max?: number;
  className?: string;
  barClassName?: string;
}

export function MtProgress({ value, max = 100, className, barClassName }: MtProgressProps) {
  const clamped = Math.min(Math.max(value, 0), max);
  const percent = max > 0 ? (clamped / max) * 100 : 0;

  return (
    <div
      className={`h-2 w-full overflow-hidden rounded-full bg-neutral-700/50 ${className || ''}`}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={clamped}
    >
      <div
        className={`h-full rounded-full bg-blue-500 transition-[width] duration-300 ${barClassName || ''}`}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

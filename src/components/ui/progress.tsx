import * as React from 'react';
import { cn } from '@/lib/utils';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  indicatorClassName?: string;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, indicatorClassName, ...props }, ref) => {
    const clamped = Math.max(0, Math.min(100, value));
    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(clamped)}
        className={cn('relative h-2.5 w-full overflow-hidden rounded-full bg-stone-100', className)}
        {...props}
      >
        <div
          className={cn(
            'h-full rounded-full bg-primary transition-[width] duration-500 ease-out',
            indicatorClassName,
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>
    );
  },
);
Progress.displayName = 'Progress';

export { Progress };

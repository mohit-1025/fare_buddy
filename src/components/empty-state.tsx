import * as React from 'react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
  tone?: 'default' | 'success' | 'warning';
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  tone = 'default',
}: EmptyStateProps) {
  const toneClass =
    tone === 'success'
      ? 'bg-primary-soft text-primary-deep'
      : tone === 'warning'
        ? 'bg-warning-soft text-warning'
        : 'bg-secondary text-muted-foreground';

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/60 px-6 py-12 text-center',
        className,
      )}
    >
      <div className={cn('mb-4 grid h-14 w-14 place-items-center rounded-2xl', toneClass)}>
        {icon}
      </div>
      <h3 className="text-base font-bold">{title}</h3>
      <p className="mt-1.5 max-w-sm text-[13px] leading-relaxed text-muted-foreground">
        {description}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

import { cn } from '@/lib/utils';
import { ArrowUpRight } from 'lucide-react';

interface SavingsPillProps {
  amount: string;
  label?: string;
  className?: string;
  size?: 'sm' | 'md';
}

export function SavingsPill({ amount, label = 'You save', className, size = 'sm' }: SavingsPillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full bg-primary-soft font-bold text-primary-deep',
        size === 'sm' ? 'px-2.5 py-1 text-[11px]' : 'px-3.5 py-1.5 text-sm',
        className,
      )}
    >
      <ArrowUpRight className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} strokeWidth={2.6} />
      <span className="max-[420px]:hidden">{label}</span>
      <span className="tabular-nums">{amount}</span>
    </span>
  );
}

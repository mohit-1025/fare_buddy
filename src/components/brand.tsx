import { cn } from '@/lib/utils';

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 36 36"
      fill="none"
      aria-hidden="true"
      className={cn('h-9 w-9 shrink-0 shadow-soft', className)}
    >
      <rect x="2" y="2" width="32" height="32" rx="10" fill="#059669" />
      <path d="M12 12h12M12 18h8M12 24h10" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="23" cy="21" r="4" fill="#F59E0B" stroke="#ffffff" strokeWidth="1.5" />
    </svg>
  );
}

export function BrandWordmark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex min-w-0 flex-col leading-none">
      <span className="text-[18px] font-extrabold tracking-[-0.03em] text-foreground">
        Fare<span className="text-primary font-black">Buddy</span>
      </span>
      {!compact ? (
        <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          BIT Patna campus
        </span>
      ) : null}
    </div>
  );
}

export function BrandLockup({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <BrandMark />
      <BrandWordmark compact={compact} />
    </div>
  );
}

export function BrandLogoFull({ className }: { className?: string }) {
  return (
    <img
      src={`${import.meta.env.BASE_URL}farebuddy-logo.svg`}
      alt="FareBuddy Logo"
      className={cn('h-8 w-auto', className)}
    />
  );
}

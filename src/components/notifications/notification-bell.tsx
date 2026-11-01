import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  BellOff,
  CarTaxiFront,
  DraftingCompass,
  Sparkles,
  ShoppingCart,
} from 'lucide-react';
import { useNotifications } from '@/hooks/use-notifications';
import { cn } from '@/lib/utils';
import type { AppNotification, NotificationKind } from '@/lib/notifications';

const KIND_STYLES: Record<NotificationKind, { icon: typeof Bell; className: string }> = {
  cart: { icon: ShoppingCart, className: 'bg-primary-soft text-primary-deep' },
  ride: { icon: CarTaxiFront, className: 'bg-sky-50 text-sky-700' },
  gear: { icon: DraftingCompass, className: 'bg-amber-50 text-amber-700' },
  impact: { icon: Sparkles, className: 'bg-violet-50 text-violet-700' },
};

function relativeTime(iso: string) {
  const diffMinutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const hours = Math.floor(diffMinutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' }).format(new Date(iso));
}

function NotificationRow({
  notification,
  onSelect,
}: {
  notification: AppNotification;
  onSelect: () => void;
}) {
  const meta = KIND_STYLES[notification.kind];
  const Icon = meta.icon;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'flex w-full items-start gap-2.5 px-3.5 py-3 text-left transition-colors hover:bg-secondary/70 focus-visible:bg-secondary/70 focus-visible:outline-none',
        !notification.read && 'bg-primary-soft/25',
      )}
    >
      <span className={cn('mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full', meta.className)}>
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-start gap-1.5">
          <span
            className={cn(
              'text-[12.5px] leading-snug',
              notification.read ? 'font-semibold text-foreground/80' : 'font-bold text-foreground',
            )}
          >
            {notification.title}
          </span>
          {notification.read ? null : (
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
          )}
        </span>
        <span className="mt-0.5 block text-[11.5px] leading-snug text-muted-foreground">
          {notification.body}
        </span>
        <span className="mt-1 block text-[10px] font-bold uppercase tracking-wide text-muted-foreground/70">
          {relativeTime(notification.createdAt)}
        </span>
      </span>
    </button>
  );
}

export function NotificationBell({ className }: { className?: string }) {
  const { items, unreadCount, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = React.useState(false);
  const [, setTick] = React.useState(0);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      triggerRef.current?.focus();
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    const ticker = window.setInterval(() => setTick((value) => value + 1), 30_000);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
      window.clearInterval(ticker);
    };
  }, [open]);

  const openNotification = (notification: AppNotification) => {
    markRead(notification.id);
    setOpen(false);
    navigate(notification.href);
  };

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="relative grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <Bell className="h-[18px] w-[18px]" />
        {unreadCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 grid h-[17px] min-w-[17px] place-items-center rounded-full bg-destructive px-1 text-[10px] font-extrabold leading-none text-destructive-foreground ring-2 ring-background">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label="Notifications"
          className="absolute right-0 top-full z-[70] mt-2 w-[min(21rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-border bg-popover shadow-lift animate-in fade-in-0 zoom-in-95 slide-in-from-top-2"
        >
          <div className="flex items-center justify-between gap-2 border-b border-border/70 px-3.5 py-2.5">
            <span className="flex items-center gap-1.5">
              <span className="text-[13px] font-extrabold text-foreground">Notifications</span>
              {unreadCount > 0 ? (
                <span className="rounded-full bg-primary-soft px-1.5 py-0.5 text-[10px] font-bold text-primary-deep">
                  {unreadCount} new
                </span>
              ) : null}
            </span>
            <button
              type="button"
              onClick={markAllRead}
              disabled={unreadCount === 0}
              className="rounded-md px-1.5 py-1 text-[11px] font-bold text-primary-deep transition-colors hover:bg-secondary disabled:text-muted-foreground/60 disabled:hover:bg-transparent"
            >
              Mark all read
            </button>
          </div>

          {items.length === 0 ? (
            <div className="flex flex-col items-center gap-1.5 px-6 py-10 text-center">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-secondary text-muted-foreground">
                <BellOff className="h-5 w-5" />
              </span>
              <span className="text-[13px] font-bold text-foreground">You're all caught up</span>
              <span className="text-[11.5px] leading-snug text-muted-foreground">
                Pool updates, ride reminders and gear handoffs land here.
              </span>
            </div>
          ) : (
            <div className="max-h-[min(24rem,calc(100dvh-9rem))] divide-y divide-border/60 overflow-y-auto overscroll-contain">
              {items.map((notification) => (
                <NotificationRow
                  key={notification.id}
                  notification={notification}
                  onSelect={() => openNotification(notification)}
                />
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

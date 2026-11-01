export type NotificationKind = 'cart' | 'ride' | 'gear' | 'impact';

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  href: string;
  createdAt: string;
  read: boolean;
}

export type NewNotification = Pick<AppNotification, 'kind' | 'title' | 'body' | 'href'>;

const STORAGE_PREFIX = 'farebuddy:notifications:v1';
const NOTIFICATIONS_EVENT = 'farebuddy:notifications';
const MAX_NOTIFICATIONS = 30;

const storageKey = (userId: string) => `${STORAGE_PREFIX}:${userId}`;
const minutesAgo = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString();

function seedNotifications(): AppNotification[] {
  return [
    {
      id: 'seed-cart-threshold',
      kind: 'cart',
      title: 'Zepto pool is ₹12 from free delivery',
      body: 'The BH-2 Floor 3 pool locks in 9 minutes — one snack waives the ₹19 delivery fee.',
      href: '/cart',
      createdAt: minutesAgo(3),
      read: false,
    },
    {
      id: 'seed-ride-departure',
      kind: 'ride',
      title: 'Your Hatia ride leaves at 17:15',
      body: 'Meet at Main Gate 1. Two seats are still open if a friend wants in.',
      href: '/ride',
      createdAt: minutesAgo(38),
      read: false,
    },
    {
      id: 'seed-gear-claim',
      kind: 'gear',
      title: 'A junior claimed your mini-drafter',
      body: 'Handoff window 19:00–21:00 at BH-3 Room 216.',
      href: '/gear',
      createdAt: minutesAgo(150),
      read: false,
    },
    {
      id: 'seed-impact-month',
      kind: 'impact',
      title: 'You crossed ₹500 saved this month',
      body: 'Three pooled orders and two shared rides added up to ₹268 back in your pocket.',
      href: '/impact',
      createdAt: minutesAgo(60 * 26),
      read: true,
    },
  ];
}

const byNewest = (list: AppNotification[]) =>
  [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

function readStored(userId: string): AppNotification[] | null {
  try {
    const raw = window.localStorage.getItem(storageKey(userId));
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as AppNotification[]) : null;
  } catch {
    return null;
  }
}

function persist(userId: string, list: AppNotification[]) {
  try {
    window.localStorage.setItem(storageKey(userId), JSON.stringify(list));
  } catch {
    // Storage can be unavailable in private mode; the in-memory copy still works.
  }
}

function emit() {
  window.dispatchEvent(new CustomEvent(NOTIFICATIONS_EVENT));
}

export function loadNotifications(userId: string): AppNotification[] {
  const stored = readStored(userId);
  if (stored) return byNewest(stored);
  const seeded = seedNotifications();
  persist(userId, seeded);
  return byNewest(seeded);
}

export function addNotification(userId: string, input: NewNotification): AppNotification[] {
  const next = [
    {
      ...input,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      read: false,
    },
    ...loadNotifications(userId),
  ].slice(0, MAX_NOTIFICATIONS);
  persist(userId, next);
  emit();
  return next;
}

export function markNotificationRead(userId: string, id: string): AppNotification[] {
  const next = loadNotifications(userId).map((notification) =>
    notification.id === id ? { ...notification, read: true } : notification,
  );
  persist(userId, next);
  emit();
  return next;
}

export function markAllNotificationsRead(userId: string): AppNotification[] {
  const next = loadNotifications(userId).map((notification) =>
    notification.read ? notification : { ...notification, read: true },
  );
  persist(userId, next);
  emit();
  return next;
}

export function subscribeNotifications(userId: string, onChange: () => void): () => void {
  const key = storageKey(userId);
  const handler = (event: Event) => {
    if (event instanceof StorageEvent && event.key && event.key !== key) return;
    onChange();
  };
  window.addEventListener(NOTIFICATIONS_EVENT, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(NOTIFICATIONS_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}

import * as React from 'react';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Copy,
  Minus,
  MoveRight,
  Plus,
  QrCode,
  Share2,
  ShoppingBag,
  ShoppingCart,
  Trash2,
  Zap,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/auth-context';
import { DEMO_PROFILE_IDS } from '@/lib/demo-seed';
import { addNotification } from '@/lib/notifications';
import { contactFromProfile, recordPoolHost, recordPoolJoin } from '@/lib/requests';
import { cn } from '@/lib/utils';

export type PlatformKey = 'Blinkit' | 'Zepto' | 'Instamart';

export interface PoolItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  addedBy: string;
  hostel: string;
  room: string;
}

export interface PlatformPoolData {
  platform: string;
  tagline: string;
  hostId: string;
  hostName: string;
  hostHostel: string;
  hostRoom: string;
  hostPhone: string;
  hostUpi: string;
  threshold: number;
  deliveryFee: number;
  smallOrderFee: number;
  handlingFee: number;
  timerMinutes: number;
  timerSeconds: number;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  accentColor: string;
  items: PoolItem[];
}

export interface StorePool extends PlatformPoolData {
  id: string;
  custom?: boolean;
}

const OTHER_SERVICE = 'Other';
type CreateErrors = Partial<Record<'service' | 'threshold' | 'charges', string>>;

const DEFAULT_SERVICES: PlatformKey[] = ['Blinkit', 'Zepto', 'Instamart'];

const INITIAL_POOLS: StorePool[] = [
    {
      id: 'blinkit',
      platform: 'Blinkit',
      tagline: 'Late-Night Maggie, Munchies & Dairy',
      hostId: DEMO_PROFILE_IDS.aman,
      hostName: 'Aman Raj',
      hostHostel: 'BH-2',
      hostRoom: '214',
      hostPhone: '9876500011',
      hostUpi: 'amanraj@okhdfcbank',
      threshold: 149,
      deliveryFee: 35,
      smallOrderFee: 20,
      handlingFee: 4,
      timerMinutes: 7,
      timerSeconds: 42,
      badgeBg: 'bg-amber-50',
      badgeBorder: 'border-amber-200',
      badgeText: 'text-amber-900',
      accentColor: 'text-amber-800',
      items: [
        { id: 'b1', name: 'Maggi 2-Minute Noodles (Pack of 4)', price: 56, qty: 1, addedBy: 'Aman Raj', hostel: 'BH-2', room: '214' },
        { id: 'b2', name: 'Amul Taaza Toned Milk (500ml)', price: 28, qty: 1, addedBy: 'Aarav Sharma', hostel: 'BH-2', room: '312' },
      ],
    },
    {
      id: 'zepto',
      platform: 'Zepto',
      tagline: '10-Min Lightning Drinks & Protein Run',
      hostId: DEMO_PROFILE_IDS.kabir,
      hostName: 'Kabir Singh',
      hostHostel: 'BH-2',
      hostRoom: '318',
      hostPhone: '9876500003',
      hostUpi: 'kabir@oksbi',
      threshold: 149,
      deliveryFee: 30,
      smallOrderFee: 15,
      handlingFee: 4,
      timerMinutes: 11,
      timerSeconds: 15,
      badgeBg: 'bg-violet-50',
      badgeBorder: 'border-violet-200',
      badgeText: 'text-violet-900',
      accentColor: 'text-violet-800',
      items: [
        { id: 'z1', name: 'Monster Energy Drink Ultra White (350ml)', price: 110, qty: 1, addedBy: 'Kabir Singh', hostel: 'BH-2', room: '318' },
        { id: 'z2', name: 'Britannia 100% Whole Wheat Bread (400g)', price: 35, qty: 1, addedBy: 'Rohan Gupta', hostel: 'BH-2', room: '207' },
      ],
    },
    {
      id: 'instamart',
      platform: 'Instamart',
      tagline: 'Swiggy Instamart Hostel Feast & Treats',
      hostId: DEMO_PROFILE_IDS.riyaKumari,
      hostName: 'Riya Kumari',
      hostHostel: 'GH',
      hostRoom: '108',
      hostPhone: '9876500012',
      hostUpi: 'riya.k@icici',
      threshold: 199,
      deliveryFee: 40,
      smallOrderFee: 25,
      handlingFee: 5,
      timerMinutes: 3,
      timerSeconds: 20,
      badgeBg: 'bg-orange-50',
      badgeBorder: 'border-orange-200',
      badgeText: 'text-orange-900',
      accentColor: 'text-orange-800',
      items: [
        { id: 'i1', name: 'Haldiram Aloo Bhujia Namkeen (400g)', price: 98, qty: 1, addedBy: 'Riya Kumari', hostel: 'GH', room: '108' },
        { id: 'i2', name: 'Paper Boat Aamras Mango Juice (Pack of 2)', price: 60, qty: 1, addedBy: 'Ananya Rao', hostel: 'GH', room: '218' },
        { id: 'i3', name: 'Cadbury Dairy Milk Silk Chocolate (60g)', price: 75, qty: 1, addedBy: 'Meera Nair', hostel: 'GH', room: '309' },
      ],
    },
];

export function CartPoolPage() {
  const { profile } = useAuth();

  // Active Store Platform & Hostel Floor Filter
  const [selectedHostel] = React.useState<string>(profile?.hostel || 'BH-2');
  const [selectedFloor] = React.useState<string>('Floor 3');

  // Interactive QR Code Modal
  const [showQR, setShowQR] = React.useState(false);

  // Separate, independent cart state for EACH store to solve the "same cart" problem
  const [pools, setPools] = React.useState<StorePool[]>(INITIAL_POOLS);

  // Each store's pooling window closes on its own countdown
  const [deadlines, setDeadlines] = React.useState<Record<string, number>>(() => {
    const start = Date.now();
    return INITIAL_POOLS.reduce(
      (acc, pool) => ({
        ...acc,
        [pool.id]: start + (pool.timerMinutes * 60 + pool.timerSeconds) * 1000,
      }),
      {} as Record<string, number>,
    );
  });
  const [now, setNow] = React.useState(() => Date.now());

  React.useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const [activePoolId, setActivePoolId] = React.useState<string>(INITIAL_POOLS[0].id);

  const livePools = pools.filter((pool) => (deadlines[pool.id] ?? 0) > now);
  const secondsLeft = (id: string) =>
    Math.max(0, Math.ceil(((deadlines[id] ?? 0) - now) / 1000));
  const formatWindow = (id: string) => {
    const total = secondsLeft(id);
    return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
  };

  const currentPool =
    livePools.find((pool) => pool.id === activePoolId) ?? livePools[0] ?? null;

  // Stores whose list has closed — the create-pool dialog offers these again
  const closedServices = DEFAULT_SERVICES.filter(
    (service) => !livePools.some((pool) => pool.id === service.toLowerCase()),
  );

  const liveRef = React.useRef<string[]>(INITIAL_POOLS.map((pool) => pool.id));
  React.useEffect(() => {
    liveRef.current
      .filter((id) => !livePools.some((pool) => pool.id === id))
      .forEach((id) => {
        const name = pools.find((pool) => pool.id === id)?.platform ?? id;
        toast.info(`${name} pool window closed`, {
          description: `The ${name} cart was removed from the ${selectedHostel} ${selectedFloor} list.`,
        });
      });
    liveRef.current = livePools.map((pool) => pool.id);
  });

  // New Item Input State
  const [newItemName, setNewItemName] = React.useState('');
  const [newItemPrice, setNewItemPrice] = React.useState('');
  const [targetPoolId, setTargetPoolId] = React.useState<string>(INITIAL_POOLS[0].id);

  // Sync target pool when active tab changes if user hasn't explicitly changed it
  React.useEffect(() => {
    if (currentPool) setTargetPoolId(currentPool.id);
  }, [currentPool]);

  const addTarget = livePools.find((pool) => pool.id === targetPoolId) ?? livePools[0] ?? null;

  const currentTotal = currentPool
    ? currentPool.items.reduce((sum, item) => sum + item.price * item.qty, 0)
    : 0;
  const remaining = currentPool ? Math.max(0, currentPool.threshold - currentTotal) : 0;
  const isUnlocked = currentPool ? currentTotal >= currentPool.threshold : false;

  // Live pool status for the smart comparator — closed pools drop out of the page
  const poolMetrics = livePools.map((pool) => {
    const total = pool.items.reduce((sum, i) => sum + i.price * i.qty, 0);
    const rem = Math.max(0, pool.threshold - total);
    const percent = Math.min(100, Math.round((total / pool.threshold) * 100));
    const unlocked = total >= pool.threshold;
    return {
      pool,
      total,
      rem,
      percent,
      unlocked,
      itemCount: pool.items.length,
      peopleCount: new Set(pool.items.map((i) => i.addedBy)).size,
    };
  });

  // Find the smartest pool to recommend (closest to threshold or unlocked)
  const smartRecommendation = (() => {
    const unlocked = poolMetrics.find((p) => p.unlocked);
    if (unlocked) {
      return {
        bestId: unlocked.pool.id,
        message: `${unlocked.pool.platform} pool has hit its ₹${unlocked.pool.threshold} threshold! Free delivery is UNLOCKED for everyone.`,
        actionLabel: `View ${unlocked.pool.platform} Cart`,
      };
    }
    const closest = [...poolMetrics].sort((a, b) => a.rem - b.rem)[0];
    if (!closest) return null;
    return {
      bestId: closest.pool.id,
      message: `${closest.pool.platform} is closest to free delivery — only ₹${closest.rem} needed to waive all fees!`,
      actionLabel: `Join ${closest.pool.platform} Pool`,
    };
  })();

  // Create-pool dialog state
  const [createOpen, setCreateOpen] = React.useState(false);
  const [newService, setNewService] = React.useState<string>(closedServices[0] ?? OTHER_SERVICE);
  const [customService, setCustomService] = React.useState('');
  const [newThreshold, setNewThreshold] = React.useState('');
  const [newCharges, setNewCharges] = React.useState('');
  const [createErrors, setCreateErrors] = React.useState<CreateErrors>({});

  const openCreatePool = () => {
    setNewService(closedServices[0] ?? OTHER_SERVICE);
    setCustomService('');
    setNewThreshold('');
    setNewCharges('');
    setCreateErrors({});
    setCreateOpen(true);
  };

  const handleCreatePool = (event: React.FormEvent) => {
    event.preventDefault();
    if (!profile) return;

    const thresholdNum = Number(newThreshold);
    const chargesNum = Number(newCharges);
    const serviceName = newService === OTHER_SERVICE ? customService.trim() : newService;
    const nextErrors: CreateErrors = {};

    if (!serviceName) nextErrors.service = 'Enter the service name';
    else if (
      livePools.some(
        (pool) => pool.platform.toLowerCase() === serviceName.toLowerCase(),
      )
    )
      nextErrors.service = 'That store already has an active pool';
    if (!Number.isFinite(thresholdNum) || thresholdNum <= 0)
      nextErrors.threshold = 'Enter the minimum threshold';
    if (newCharges.trim() === '' || !Number.isFinite(chargesNum) || chargesNum < 0)
      nextErrors.charges = 'Enter the extra charges (0 for none)';

    setCreateErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const host = contactFromProfile(profile);
    const hostUpi =
      profile.upi_id ??
      `${(profile.full_name ?? 'hostel').toLowerCase().replace(/[^a-z0-9]/g, '')}@upi`;
    const windowMinutes = 15;
    const existing = closedServices.includes(serviceName as PlatformKey)
      ? pools.find((pool) => !pool.custom && pool.platform === serviceName)
      : undefined;
    const poolId = existing?.id ?? crypto.randomUUID();

    const reopened: StorePool = existing
      ? {
          ...existing,
          hostId: host.userId,
          hostName: host.name,
          hostHostel: host.hostel ?? selectedHostel,
          hostRoom: host.room ?? '',
          hostPhone: host.phone ?? '',
          hostUpi,
          threshold: Math.round(thresholdNum),
          deliveryFee: Math.round(chargesNum),
          smallOrderFee: 0,
          handlingFee: 0,
          timerMinutes: windowMinutes,
          timerSeconds: 0,
          items: [],
        }
      : {
          id: poolId,
          custom: true,
          platform: serviceName,
          tagline: `${serviceName} hostel pool`,
          hostId: host.userId,
          hostName: host.name,
          hostHostel: host.hostel ?? selectedHostel,
          hostRoom: host.room ?? '',
          hostPhone: host.phone ?? '',
          hostUpi,
          threshold: Math.round(thresholdNum),
          deliveryFee: Math.round(chargesNum),
          smallOrderFee: 0,
          handlingFee: 0,
          timerMinutes: windowMinutes,
          timerSeconds: 0,
          badgeBg: 'bg-slate-50',
          badgeBorder: 'border-slate-200',
          badgeText: 'text-slate-900',
          accentColor: 'text-slate-700',
          items: [],
        };

    setPools((prev) =>
      existing
        ? prev.map((pool) => (pool.id === existing.id ? reopened : pool))
        : [...prev, reopened],
    );
    setDeadlines((prev) => ({ ...prev, [poolId]: Date.now() + windowMinutes * 60_000 }));
    setActivePoolId(poolId);
    recordPoolHost({
      kind: 'cart',
      poolId,
      poolLabel: `${serviceName} floor pool`,
      detail: `${selectedHostel} · ${selectedFloor}`,
      href: '/cart',
      host,
    });
    toast.success(`${serviceName} pool opened`, {
      description: `₹${Math.round(thresholdNum)} threshold · ₹${Math.round(chargesNum)} extra charges · ${windowMinutes}:00 window`,
    });
    setCreateOpen(false);
  };

  // Handle adding an item to a specific platform cart
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addTarget) {
      toast.error('All pool windows have closed');
      return;
    }
    const priceNum = parseFloat(newItemPrice);
    if (!newItemName.trim() || isNaN(priceNum) || priceNum <= 0) {
      toast.error('Please enter a valid item name and positive price');
      return;
    }

    const newItem: PoolItem = {
      id: `${addTarget.id}-${Date.now()}`,
      name: newItemName.trim(),
      price: priceNum,
      qty: 1,
      addedBy: profile?.full_name || 'You',
      hostel: selectedHostel,
      room: profile?.room || '312',
    };

    const target = addTarget;
    setPools((prev) =>
      prev.map((pool) =>
        pool.id === target.id ? { ...pool, items: [...pool.items, newItem] } : pool,
      ),
    );

    setNewItemName('');
    setNewItemPrice('');
    toast.success(`Added "${newItem.name}" to ${target.platform} pool (+₹${newItem.price})`);
    if (profile?.id && target.hostId !== profile.id) {
      recordPoolJoin({
        kind: 'cart',
        poolId: target.id,
        poolLabel: `${target.platform} floor pool`,
        detail: `${selectedHostel} · ${selectedFloor}`,
        href: '/cart',
        host: {
          userId: target.hostId,
          name: target.hostName,
          phone: target.hostPhone,
          hostel: target.hostHostel,
          room: target.hostRoom,
        },
        member: contactFromProfile(profile),
      });
    }
    if (profile?.id) {
      addNotification(profile.id, {
        kind: 'cart',
        title: `Added to the ${target.platform} pool`,
        body: `${newItem.name} · ₹${newItem.price}. You'll be pinged when the pool locks.`,
        href: '/cart',
      });
    }
    setActivePoolId(target.id);
  };

  // Move an item from one store pool to another (Cart consolidation)
  const handleMoveItem = (itemId: string, sourceId: string, destId: string) => {
    if (sourceId === destId) return;

    const source = pools.find((pool) => pool.id === sourceId);
    const dest = pools.find((pool) => pool.id === destId);
    const itemToMove = source?.items.find((i) => i.id === itemId);
    if (!itemToMove || !dest) return;

    setPools((prev) =>
      prev.map((pool) => {
        if (pool.id === sourceId) {
          return { ...pool, items: pool.items.filter((i) => i.id !== itemId) };
        }
        if (pool.id === destId) {
          return { ...pool, items: [...pool.items, itemToMove] };
        }
        return pool;
      }),
    );

    toast.success(`Moved "${itemToMove.name}" to ${dest.platform} pool!`);
  };

  // Adjust item quantity
  const handleUpdateQty = (itemId: string, delta: number) => {
    if (!currentPool) return;
    const poolId = currentPool.id;
    setPools((prev) =>
      prev.map((pool) => {
        if (pool.id !== poolId) return pool;
        const updatedItems = pool.items
          .map((item) => {
            if (item.id === itemId) {
              const nextQty = item.qty + delta;
              return nextQty > 0 ? { ...item, qty: nextQty } : null;
            }
            return item;
          })
          .filter(Boolean) as PoolItem[];
        return { ...pool, items: updatedItems };
      }),
    );
  };

  // Remove an item
  const handleRemoveItem = (itemId: string) => {
    if (!currentPool) return;
    const poolId = currentPool.id;
    const item = currentPool.items.find((i) => i.id === itemId);
    setPools((prev) =>
      prev.map((pool) =>
        pool.id === poolId
          ? { ...pool, items: pool.items.filter((i) => i.id !== itemId) }
          : pool,
      ),
    );
    toast.info(`Removed "${item?.name}" from ${currentPool.platform} pool`);
  };

  // UPI payment payload
  const upiUri = currentPool
    ? `upi://pay?pa=${encodeURIComponent(currentPool.hostUpi)}&pn=${encodeURIComponent(currentPool.hostName)}&am=${encodeURIComponent(currentTotal)}&cu=INR`
    : '';

  return (
    <div className="page-stack font-sans text-slate-900">
      {/* 1. Page Header */}
      <PageHeader
        eyebrow="Module 01 · Cart Pool"
        title="Multi-Store Quick Commerce Pool"
        description="Pool Blinkit, Zepto, and Instamart orders across your hostel floor with independent carts, live threshold progress, and zero fee surcharges."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <span className="tag-hostel">
              {selectedHostel} • {selectedFloor}
            </span>
            <Badge variant="success" className="font-mono text-[11px] shadow-xs">
              ⚡ Postgres CDC Synced
            </Badge>
          </div>
        }
      />

      {/* 2. Smart Recommendation Banner (Solves Fragmented Carts Across Apps) */}
      {smartRecommendation ? (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-50 via-emerald-50/70 to-teal-50 p-4 text-emerald-950 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-600 text-white shadow-xs">
              <Zap className="h-5 w-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] font-extrabold uppercase tracking-wider text-emerald-800">
                  Floor Pool Intelligence
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-ping"></span>
              </div>
              <p className="text-[13px] font-bold text-slate-900 leading-snug">
                {smartRecommendation.message}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActivePoolId(smartRecommendation.bestId)}
            className="flex shrink-0 items-center gap-1.5 rounded-xl bg-emerald-700 px-3.5 py-2 font-mono text-[12px] font-bold text-white shadow-xs transition-all hover:bg-emerald-800 active:scale-[0.98]"
          >
            <span>{smartRecommendation.actionLabel}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : null}

      {/* 3. Multi-Store Dashboard Snapshot (3 Independent Live Carts) */}
      <div>
        <div className="mb-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-slate-600" />
            <h2 className="text-[14px] font-extrabold text-slate-900">
              Active Store Pools on {selectedHostel}
            </h2>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Tap a platform to inspect its separate cart &amp; items
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
          {poolMetrics.length === 0 ? (
            <div className="stitch-card col-span-full bg-white py-8 text-center">
              <p className="text-[13px] font-bold text-slate-700">All store pool windows have closed</p>
              <p className="mt-1 text-[11.5px] text-slate-500">
                Blinkit, Zepto, and Instamart carts are cleared from this floor list. Create a pool
                to reopen a store or start a custom service.
              </p>
              <button
                type="button"
                onClick={openCreatePool}
                className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2 font-mono text-[12px] font-bold text-white shadow-xs transition-all hover:bg-emerald-800 active:scale-[0.98]"
              >
                <Plus className="h-4 w-4" /> Create a pool
              </button>
            </div>
          ) : null}
          {poolMetrics.map((metric) => {
            const p = metric.pool;
            const isActive = currentPool?.id === p.id;

            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setActivePoolId(p.id)}
                className={cn(
                  'stitch-card relative flex flex-col justify-between text-left transition-all p-4',
                  isActive
                    ? 'border-2 border-emerald-600 bg-white shadow-md ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-slate-50/70 hover:bg-white hover:border-slate-300',
                )}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        'rounded-full px-2.5 py-0.5 font-mono text-[11px] font-extrabold uppercase',
                        p.badgeBg,
                        p.badgeText,
                        'border border-slate-200/60',
                      )}
                    >
                      {p.platform}
                    </span>
                    <span
                      className={cn(
                        'flex items-center gap-1 font-mono text-[11px] font-semibold',
                        secondsLeft(p.id) <= 60 ? 'text-red-600' : 'text-slate-500',
                      )}
                    >
                      <Clock className="h-3 w-3" /> {formatWindow(p.id)}
                    </span>
                  </div>

                  <div className="mt-3 flex items-baseline justify-between">
                    <div className="font-mono text-[18px] font-black text-slate-900">
                      ₹{metric.total}{' '}
                      <span className="text-[12px] font-normal text-slate-400">/ ₹{p.threshold}</span>
                    </div>
                    <span
                      className={cn(
                        'font-mono text-[11px] font-bold',
                        metric.unlocked ? 'text-emerald-700' : 'text-amber-700',
                      )}
                    >
                      {metric.unlocked ? '✓ Unlocked' : `₹${metric.rem} to free`}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-slate-200/80">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-500',
                        metric.unlocked ? 'bg-emerald-600' : 'bg-amber-500',
                      )}
                      style={{ width: `${metric.percent}%` }}
                    />
                  </div>
                </div>

                <div className="mt-3.5 flex items-center justify-between border-t border-slate-100 pt-2 text-[11px] text-slate-500">
                  <span>
                    <strong>{metric.itemCount}</strong> items • <strong>{metric.peopleCount}</strong> hostellers
                  </span>
                  <span className="font-bold text-emerald-800">
                    {isActive ? '● Active View' : 'Switch →'}
                  </span>
                </div>
              </button>
            );
          })}
          {poolMetrics.length > 0 && closedServices.length > 0 ? (
            <button
              type="button"
              onClick={openCreatePool}
              className="stitch-card flex min-h-[160px] flex-col items-center justify-center gap-1.5 border-2 border-dashed border-emerald-500/40 bg-emerald-50/40 p-4 text-center transition-all hover:bg-emerald-50 active:scale-[0.99]"
            >
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-emerald-700 shadow-xs">
                <Plus className="h-5 w-5" />
              </span>
              <span className="text-[13px] font-extrabold text-emerald-900">Create a pool</span>
              <span className="text-[11px] font-medium leading-snug text-emerald-800/80">
                {closedServices.length === 1
                  ? `${closedServices[0]} list is`
                  : `${closedServices.length} store lists are`}{' '}
                closed — reopen one or add a custom service.
              </span>
            </button>
          ) : null}
        </div>
      </div>

      {/* 4. Active Pool Inspector (Dedicated Items, Move Feature, Add Form & Split) */}
      {currentPool ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Store Line Items & Item Entry (8 cols) */}
        <div className="space-y-5 lg:col-span-8">
          <div className="stitch-card bg-white p-5 sm:p-6">
            {/* Header with store details */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-0.5 font-mono text-[11.5px] font-extrabold uppercase',
                      currentPool.badgeBg,
                      currentPool.badgeText,
                    )}
                  >
                    {currentPool.platform} Pool
                  </span>
                  <span className="tag-hostel">
                    Host: {currentPool.hostName} ({currentPool.hostHostel} #{currentPool.hostRoom})
                  </span>
                </div>
                <h3 className="mt-1.5 text-lg font-black text-slate-900">
                  {currentPool.tagline}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <span className="tag-timer">
                  <Clock className="h-3 w-3" /> {formatWindow(currentPool.id)} window left
                </span>
              </div>
            </div>

            {/* Threshold progress indicator */}
            <div className="my-4 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[13px] mb-2">
                <span className="font-extrabold text-slate-900">
                  Current Cart: ₹{currentTotal} / ₹{currentPool.threshold}
                </span>
                <span
                  className={cn(
                    'font-bold rounded-full px-2 py-0.5 text-xs',
                    isUnlocked ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900',
                  )}
                >
                  {isUnlocked
                    ? '🎉 Free Delivery Unlocked! Waives ₹35 fee'
                    : `₹${remaining} more needed to waive ₹${currentPool.deliveryFee} delivery fee`}
                </span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    isUnlocked ? 'bg-emerald-600' : 'bg-amber-500',
                  )}
                  style={{ width: `${Math.min(100, (currentTotal / currentPool.threshold) * 100)}%` }}
                />
              </div>
            </div>

            {/* Cart Line Items with Cross-Store Moving Support */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-[13px] font-extrabold text-slate-900 uppercase tracking-wider font-mono">
                  Items in {currentPool.platform} Cart ({currentPool.items.length})
                </h4>
                <span className="text-[11px] text-slate-500 font-medium">
                  Have an item in the wrong cart? Tap "Move" to transfer it.
                </span>
              </div>

              {currentPool.items.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center">
                  <ShoppingCart className="mx-auto h-8 w-8 text-slate-300" />
                  <p className="mt-2 text-[13px] font-bold text-slate-600">
                    No items in this {currentPool.platform} cart yet.
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Be the first to add an item below or transfer from another store pool!
                  </p>
                </div>
              ) : (
                currentPool.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-3.5 transition-all hover:bg-slate-50 hover:border-slate-300"
                  >
                    <div className="flex items-start gap-3">
                      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white font-mono text-[12px] font-bold text-slate-800 shadow-xs border border-slate-200/70">
                        x{item.qty}
                      </div>
                      <div>
                        <p className="text-[13.5px] font-bold text-slate-900 leading-tight">
                          {item.name}
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-500">
                          Added by <strong className="text-slate-700">{item.addedBy}</strong> ({item.hostel} #{item.room})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60">
                      {/* Price */}
                      <span className="font-mono text-[15px] font-black text-emerald-800">
                        ₹{item.price * item.qty}
                      </span>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-0.5 shadow-xs">
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(item.id, -1)}
                          className="grid h-6 w-6 place-items-center rounded-md hover:bg-slate-100 text-slate-600"
                          title="Decrease quantity"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="font-mono text-[11px] font-bold px-1.5">{item.qty}</span>
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(item.id, 1)}
                          className="grid h-6 w-6 place-items-center rounded-md hover:bg-slate-100 text-slate-600"
                          title="Increase quantity"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Cross-Store Move Menu */}
                      <div className="flex items-center gap-1">
                        {livePools
                          .filter((pool) => pool.id !== currentPool.id)
                          .map((target) => (
                            <button
                              key={target.id}
                              type="button"
                              onClick={() => handleMoveItem(item.id, currentPool.id, target.id)}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 font-mono text-[10.5px] font-bold text-slate-700 hover:bg-slate-100 transition-colors shadow-xs"
                              title={`Move this item to ${target.platform} cart`}
                            >
                              <MoveRight className="h-3 w-3 text-slate-400" />
                              <span>{target.platform}</span>
                            </button>
                          ))}
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="rounded-lg p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                        title="Delete item"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* 5. Add Item Form with Platform Selection */}
            <div className="mt-6 border-t border-slate-100 pt-5">
              <h4 className="mb-2.5 text-[13px] font-extrabold text-slate-900 flex items-center gap-2">
                <Plus className="h-4 w-4 text-emerald-700" /> Add Item to a Store Cart
              </h4>

              <form onSubmit={handleAddItem} className="space-y-3">
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-12">
                  {/* Target Platform selector */}
                  <div className="sm:col-span-3">
                    <label className="mb-1 block text-[11px] font-bold text-slate-600">Store</label>
                    <select
                      value={addTarget?.id ?? ''}
                      onChange={(e) => setTargetPoolId(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] font-bold text-slate-800 focus:border-emerald-600 focus:bg-white focus:outline-none"
                    >
                      {livePools.map((pool) => (
                        <option key={pool.id} value={pool.id}>
                          {pool.platform}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Item Name */}
                  <div className="sm:col-span-6">
                    <label className="mb-1 block text-[11px] font-bold text-slate-600">Item Name</label>
                    <input
                      type="text"
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      placeholder="e.g. Kurkure Chilli Chatka or Red Bull"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-[13px] text-slate-900 focus:border-emerald-600 focus:bg-white focus:outline-none"
                    />
                  </div>

                  {/* Price */}
                  <div className="sm:col-span-3">
                    <label className="mb-1 block text-[11px] font-bold text-slate-600">Price (₹)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 font-mono text-[13px] text-slate-400">₹</span>
                      <input
                        type="number"
                        value={newItemPrice}
                        onChange={(e) => setNewItemPrice(e.target.value)}
                        placeholder="Price"
                        min="1"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-7 pr-3 font-mono text-[13px] text-slate-900 focus:border-emerald-600 focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-700 px-5 py-2.5 font-mono text-[12.5px] font-bold text-white shadow-sm transition-all hover:bg-emerald-800 active:scale-[0.98]"
                  >
                    <Plus className="h-4 w-4" /> Add to {addTarget?.platform} Cart
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Right: Split Calculation, Host UPI & QR Modal (4 cols) */}
        <div className="space-y-5 lg:col-span-4">
          <div className="stitch-card bg-white p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-[15px] font-extrabold text-slate-900">
                {currentPool.platform} Split Summary
              </h3>
              <span className="tag-inr">₹0 Fee Mode</span>
            </div>
            <p className="mt-0.5 text-[12px] text-slate-500">
              Host: <strong className="text-slate-800">{currentPool.hostName}</strong> ({currentPool.hostHostel})
            </p>

            {/* Financial breakdown */}
            <div className="mt-4 space-y-2.5 rounded-xl border border-slate-200/80 bg-slate-50 p-3.5 font-mono text-[12px]">
              <div className="flex justify-between text-slate-600">
                <span>Items Subtotal:</span>
                <span className="font-bold text-slate-900">₹{currentTotal}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Delivery Fee:</span>
                <span className={cn('font-bold', isUnlocked ? 'text-emerald-700 line-through' : 'text-slate-900')}>
                  {isUnlocked ? '₹0.00' : `₹${currentPool.deliveryFee}.00`}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Small Order Surcharge:</span>
                <span className={cn('font-bold', isUnlocked ? 'text-emerald-700 line-through' : 'text-slate-900')}>
                  {isUnlocked ? '₹0.00' : `₹${currentPool.smallOrderFee}.00`}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Handling Fee:</span>
                <span className="font-bold text-slate-700">₹{currentPool.handlingFee}.00</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between text-[14px] font-black text-slate-900">
                <span>Total Cart Value:</span>
                <span className="text-emerald-800">₹{currentTotal + (isUnlocked ? currentPool.handlingFee : currentPool.deliveryFee + currentPool.smallOrderFee + currentPool.handlingFee)}</span>
              </div>
            </div>

            {/* Savings Callout */}
            {isUnlocked ? (
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-2.5 text-[11.5px] font-bold text-emerald-800">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>You saved ₹{currentPool.deliveryFee + currentPool.smallOrderFee} on delivery and small order fees!</span>
              </div>
            ) : (
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 p-2.5 text-[11.5px] font-bold text-amber-800">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                <span>Add ₹{remaining} more to waive ₹{currentPool.deliveryFee + currentPool.smallOrderFee} in fees.</span>
              </div>
            )}

            {/* Host UPI Details with QR toggle */}
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/80 p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-extrabold uppercase text-slate-500 font-mono">
                  Settlement Handle
                </span>
                <button
                  type="button"
                  onClick={() => setShowQR((v) => !v)}
                  className="flex items-center gap-1 font-mono text-[11px] font-bold text-emerald-700 hover:underline"
                >
                  <QrCode className="h-3.5 w-3.5" /> {showQR ? 'Hide QR' : 'Show QR'}
                </button>
              </div>
              <div className="flex items-center justify-between font-mono text-[12.5px] font-bold text-slate-900">
                <span>{currentPool.hostUpi}</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(currentPool.hostUpi);
                    toast.success('Host UPI ID copied to clipboard!');
                  }}
                  className="rounded p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition-colors"
                  title="Copy UPI"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Inline QR Popup */}
            {showQR && (
              <div className="mt-3 animate-fade-up rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm">
                <div className="mx-auto grid h-44 w-44 place-items-center rounded-xl border border-slate-100 bg-white p-2">
                  <QRCodeSVG value={upiUri} size={150} level="M" />
                </div>
                <p className="mt-2 text-[12px] font-bold text-slate-900">{currentPool.hostName}</p>
                <p className="font-mono text-[11px] text-slate-500">{currentPool.hostUpi}</p>
                <p className="mt-1 text-[10px] text-emerald-700 font-semibold">
                  Pre-configured for ₹{currentTotal} split settlement
                </p>
              </div>
            )}

            {/* Action Share to Hostel Group */}
            <button
              type="button"
              onClick={() => {
                const text = `🛒 *${currentPool.platform} Pool on ${selectedHostel} ${selectedFloor}*:\nTotal: ₹${currentTotal}/₹${currentPool.threshold} (${isUnlocked ? 'FREE DELIVERY UNLOCKED!' : `₹${remaining} needed`})\nItems: ${currentPool.items.map((i) => i.name).join(', ')}\nJoin before timer runs out!`;
                if (navigator.share) {
                  navigator.share({ title: `${currentPool.platform} Hostel Pool`, text });
                } else {
                  navigator.clipboard.writeText(text);
                  toast.success('Pool summary copied to clipboard! Share on WhatsApp.');
                }
              }}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 font-mono text-[12.5px] font-bold text-white shadow-sm transition-all hover:bg-slate-800 active:scale-[0.98]"
            >
              <Share2 className="h-4 w-4" /> Share Pool to Hostel Group
            </button>
          </div>
        </div>
        </div>
      ) : null}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create a floor pool</DialogTitle>
            <DialogDescription>
              Reopen a store whose list has closed on {selectedHostel} {selectedFloor}, or start a
              custom service. You host the pool and set the fee that is waived at the threshold.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreatePool} className="space-y-4" noValidate>
            <div>
              <Label htmlFor="create-service">Service</Label>
              <Select
                value={newService}
                onValueChange={(value) => {
                  setNewService(value);
                  setCreateErrors((current) => ({ ...current, service: undefined }));
                }}
              >
                <SelectTrigger id="create-service" className="mt-2">
                  <SelectValue placeholder="Pick a closed service" />
                </SelectTrigger>
                <SelectContent>
                  {closedServices.map((service) => (
                    <SelectItem key={service} value={service}>
                      {service} — list closed
                    </SelectItem>
                  ))}
                  <SelectItem value={OTHER_SERVICE}>Other service…</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newService === OTHER_SERVICE ? (
              <div>
                <Label htmlFor="create-custom-service">Service name</Label>
                <Input
                  id="create-custom-service"
                  className="mt-2"
                  placeholder="e.g. DMart Ready or BigBasket"
                  value={customService}
                  onChange={(event) => {
                    setCustomService(event.target.value);
                    setCreateErrors((current) => ({ ...current, service: undefined }));
                  }}
                  aria-invalid={Boolean(createErrors.service)}
                />
                {createErrors.service ? (
                  <p className="mt-1.5 text-[11.5px] font-semibold text-destructive">
                    {createErrors.service}
                  </p>
                ) : null}
              </div>
            ) : null}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="create-threshold">Minimum threshold (₹)</Label>
                <Input
                  id="create-threshold"
                  className="mt-2"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  placeholder="149"
                  value={newThreshold}
                  onChange={(event) => {
                    setNewThreshold(event.target.value);
                    setCreateErrors((current) => ({ ...current, threshold: undefined }));
                  }}
                  aria-invalid={Boolean(createErrors.threshold)}
                />
                {createErrors.threshold ? (
                  <p className="mt-1.5 text-[11.5px] font-semibold text-destructive">
                    {createErrors.threshold}
                  </p>
                ) : null}
              </div>
              <div>
                <Label htmlFor="create-charges">Extra charges (₹)</Label>
                <Input
                  id="create-charges"
                  className="mt-2"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  placeholder="30"
                  value={newCharges}
                  onChange={(event) => {
                    setNewCharges(event.target.value);
                    setCreateErrors((current) => ({ ...current, charges: undefined }));
                  }}
                  aria-invalid={Boolean(createErrors.charges)}
                />
                {createErrors.charges ? (
                  <p className="mt-1.5 text-[11.5px] font-semibold text-destructive">
                    {createErrors.charges}
                  </p>
                ) : null}
              </div>
            </div>

            <p className="text-[11.5px] leading-relaxed text-slate-500">
              The extra charges are waived for everyone once the pooled cart crosses the threshold.
              Your pool opens with a 15:00 window.
            </p>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create pool</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

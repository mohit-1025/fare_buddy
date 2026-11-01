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
import { useAuth } from '@/contexts/auth-context';
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
  platform: PlatformKey;
  tagline: string;
  hostName: string;
  hostHostel: string;
  hostRoom: string;
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

export function CartPoolPage() {
  const { profile } = useAuth();

  // Active Store Platform & Hostel Floor Filter
  const [activePlatform, setActivePlatform] = React.useState<PlatformKey>('Blinkit');
  const [selectedHostel] = React.useState<string>(profile?.hostel || 'BH-2');
  const [selectedFloor] = React.useState<string>('Floor 3');

  // Interactive QR Code Modal
  const [showQR, setShowQR] = React.useState(false);

  // Separate, independent cart state for EACH platform to solve the "same cart" problem
  const [pools, setPools] = React.useState<Record<PlatformKey, PlatformPoolData>>({
    Blinkit: {
      platform: 'Blinkit',
      tagline: 'Late-Night Maggie, Munchies & Dairy',
      hostName: 'Aman Raj',
      hostHostel: 'BH-2',
      hostRoom: '214',
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
    Zepto: {
      platform: 'Zepto',
      tagline: '10-Min Lightning Drinks & Protein Run',
      hostName: 'Kabir Singh',
      hostHostel: 'BH-2',
      hostRoom: '318',
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
    Instamart: {
      platform: 'Instamart',
      tagline: 'Swiggy Instamart Hostel Feast & Treats',
      hostName: 'Riya Kumari',
      hostHostel: 'GH',
      hostRoom: '108',
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
  });

  // New Item Input State
  const [newItemName, setNewItemName] = React.useState('');
  const [newItemPrice, setNewItemPrice] = React.useState('');
  const [targetPlatform, setTargetPlatform] = React.useState<PlatformKey>(activePlatform);

  // Sync target platform when active tab changes if user hasn't explicitly changed it
  React.useEffect(() => {
    setTargetPlatform(activePlatform);
  }, [activePlatform]);

  // Current Active Pool Data
  const currentPool = pools[activePlatform];
  const currentTotal = currentPool.items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const remaining = Math.max(0, currentPool.threshold - currentTotal);
  const isUnlocked = currentTotal >= currentPool.threshold;

  // Compute status for all 3 pools for the smart comparator
  const poolMetrics = React.useMemo(() => {
    return (Object.keys(pools) as PlatformKey[]).map((key) => {
      const p = pools[key];
      const total = p.items.reduce((sum, i) => sum + i.price * i.qty, 0);
      const rem = Math.max(0, p.threshold - total);
      const percent = Math.min(100, Math.round((total / p.threshold) * 100));
      const unlocked = total >= p.threshold;
      return {
        key,
        total,
        rem,
        percent,
        unlocked,
        itemCount: p.items.length,
        peopleCount: new Set(p.items.map((i) => i.addedBy)).size,
      };
    });
  }, [pools]);

  // Find the smartest pool to recommend (closest to threshold or unlocked)
  const smartRecommendation = React.useMemo(() => {
    const unlocked = poolMetrics.find((p) => p.unlocked);
    if (unlocked) {
      return {
        bestKey: unlocked.key,
        message: `${unlocked.key} pool has hit its ₹${pools[unlocked.key].threshold} threshold! Free delivery is UNLOCKED for everyone.`,
        actionLabel: `View ${unlocked.key} Cart`,
      };
    }
    const closest = [...poolMetrics].sort((a, b) => a.rem - b.rem)[0];
    return {
      bestKey: closest.key,
      message: `${closest.key} is closest to free delivery — only ₹${closest.rem} needed to waive all fees!`,
      actionLabel: `Join ${closest.key} Pool`,
    };
  }, [poolMetrics, pools]);

  // Handle adding an item to a specific platform cart
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(newItemPrice);
    if (!newItemName.trim() || isNaN(priceNum) || priceNum <= 0) {
      toast.error('Please enter a valid item name and positive price');
      return;
    }

    const newItem: PoolItem = {
      id: `${targetPlatform.toLowerCase()}-${Date.now()}`,
      name: newItemName.trim(),
      price: priceNum,
      qty: 1,
      addedBy: profile?.full_name || 'You',
      hostel: selectedHostel,
      room: profile?.room || '312',
    };

    setPools((prev) => ({
      ...prev,
      [targetPlatform]: {
        ...prev[targetPlatform],
        items: [...prev[targetPlatform].items, newItem],
      },
    }));

    setNewItemName('');
    setNewItemPrice('');
    toast.success(`Added "${newItem.name}" to ${targetPlatform} pool (+₹${newItem.price})`);
    setActivePlatform(targetPlatform);
  };

  // Move an item from one platform to another (Cart consolidation)
  const handleMoveItem = (itemId: string, sourcePlatform: PlatformKey, destPlatform: PlatformKey) => {
    if (sourcePlatform === destPlatform) return;

    const itemToMove = pools[sourcePlatform].items.find((i) => i.id === itemId);
    if (!itemToMove) return;

    setPools((prev) => ({
      ...prev,
      [sourcePlatform]: {
        ...prev[sourcePlatform],
        items: prev[sourcePlatform].items.filter((i) => i.id !== itemId),
      },
      [destPlatform]: {
        ...prev[destPlatform],
        items: [...prev[destPlatform].items, itemToMove],
      },
    }));

    toast.success(`Moved "${itemToMove.name}" to ${destPlatform} pool!`);
  };

  // Adjust item quantity
  const handleUpdateQty = (itemId: string, delta: number) => {
    setPools((prev) => {
      const updatedItems = prev[activePlatform].items
        .map((item) => {
          if (item.id === itemId) {
            const nextQty = item.qty + delta;
            return nextQty > 0 ? { ...item, qty: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as PoolItem[];

      return {
        ...prev,
        [activePlatform]: {
          ...prev[activePlatform],
          items: updatedItems,
        },
      };
    });
  };

  // Remove an item
  const handleRemoveItem = (itemId: string) => {
    const item = currentPool.items.find((i) => i.id === itemId);
    setPools((prev) => ({
      ...prev,
      [activePlatform]: {
        ...prev[activePlatform],
        items: prev[activePlatform].items.filter((i) => i.id !== itemId),
      },
    }));
    toast.info(`Removed "${item?.name}" from ${activePlatform} pool`);
  };

  // UPI payment payload
  const upiUri = `upi://pay?pa=${encodeURIComponent(currentPool.hostUpi)}&pn=${encodeURIComponent(currentPool.hostName)}&am=${encodeURIComponent(currentTotal)}&cu=INR`;

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
          onClick={() => setActivePlatform(smartRecommendation.bestKey)}
          className="flex shrink-0 items-center gap-1.5 rounded-xl bg-emerald-700 px-3.5 py-2 font-mono text-[12px] font-bold text-white shadow-xs transition-all hover:bg-emerald-800 active:scale-[0.98]"
        >
          <span>{smartRecommendation.actionLabel}</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

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
          {poolMetrics.map((metric) => {
            const p = pools[metric.key];
            const isActive = activePlatform === metric.key;

            return (
              <button
                key={metric.key}
                type="button"
                onClick={() => setActivePlatform(metric.key)}
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
                      {metric.key}
                    </span>
                    <span className="flex items-center gap-1 font-mono text-[11px] font-semibold text-slate-500">
                      <Clock className="h-3 w-3" /> {p.timerMinutes}:{String(p.timerSeconds).padStart(2, '0')}
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
        </div>
      </div>

      {/* 4. Active Pool Inspector (Dedicated Items, Move Feature, Add Form & Split) */}
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
                    {activePlatform} Pool
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
                  <Clock className="h-3 w-3" /> {currentPool.timerMinutes}:{String(currentPool.timerSeconds).padStart(2, '0')} window left
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
                  Items in {activePlatform} Cart ({currentPool.items.length})
                </h4>
                <span className="text-[11px] text-slate-500 font-medium">
                  Have an item in the wrong cart? Tap "Move" to transfer it.
                </span>
              </div>

              {currentPool.items.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center">
                  <ShoppingCart className="mx-auto h-8 w-8 text-slate-300" />
                  <p className="mt-2 text-[13px] font-bold text-slate-600">
                    No items in this {activePlatform} cart yet.
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
                        {(['Blinkit', 'Zepto', 'Instamart'] as PlatformKey[])
                          .filter((p) => p !== activePlatform)
                          .map((target) => (
                            <button
                              key={target}
                              type="button"
                              onClick={() => handleMoveItem(item.id, activePlatform, target)}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 font-mono text-[10.5px] font-bold text-slate-700 hover:bg-slate-100 transition-colors shadow-xs"
                              title={`Move this item to ${target} cart`}
                            >
                              <MoveRight className="h-3 w-3 text-slate-400" />
                              <span>{target}</span>
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
                      value={targetPlatform}
                      onChange={(e) => setTargetPlatform(e.target.value as PlatformKey)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] font-bold text-slate-800 focus:border-emerald-600 focus:bg-white focus:outline-none"
                    >
                      <option value="Blinkit">Blinkit</option>
                      <option value="Zepto">Zepto</option>
                      <option value="Instamart">Instamart</option>
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
                    <Plus className="h-4 w-4" /> Add to {targetPlatform} Cart
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
                {activePlatform} Split Summary
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
                const text = `🛒 *${activePlatform} Pool on ${selectedHostel} ${selectedFloor}*:\nTotal: ₹${currentTotal}/₹${currentPool.threshold} (${isUnlocked ? 'FREE DELIVERY UNLOCKED!' : `₹${remaining} needed`})\nItems: ${currentPool.items.map((i) => i.name).join(', ')}\nJoin before timer runs out!`;
                if (navigator.share) {
                  navigator.share({ title: `${activePlatform} Hostel Pool`, text });
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
    </div>
  );
}

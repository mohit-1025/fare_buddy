import * as React from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
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
import { addNotification } from '@/lib/notifications';
import {
  claimGearRequest,
  contactFromProfile,
  createGearRequest,
  loadRequests,
  subscribeRequests,
  type GearRequest,
  type RequestContact,
} from '@/lib/requests';
import { cn } from '@/lib/utils';

const GEAR_TAGS = ['ED / Drafting', 'Workshop', 'Lab Gear', 'Electronics', 'Other'] as const;
const CATEGORIES = ['All', ...GEAR_TAGS] as const;
const PRICE_CAP = 400;

type FormErrors = Partial<Record<'title' | 'originalPrice' | 'price', string>>;

function handoffLabel(contact: RequestContact) {
  const parts = [contact.hostel, contact.room ? `Room ${contact.room}` : null].filter(Boolean);
  return parts.length ? parts.join(' · ') : 'Campus handoff';
}

function phoneLabel(phone: string | null) {
  return phone ? `+91 ${phone}` : 'Phone not added';
}

export function GearBazaarPage() {
  const { profile } = useAuth();
  const [records, setRecords] = React.useState(() => loadRequests());
  const [selectedCategory, setSelectedCategory] = React.useState<string>('All');
  const [listOpen, setListOpen] = React.useState(false);
  const [title, setTitle] = React.useState('');
  const [originalPrice, setOriginalPrice] = React.useState('');
  const [demandedPrice, setDemandedPrice] = React.useState('');
  const [tag, setTag] = React.useState<string>(GEAR_TAGS[0]);
  const [errors, setErrors] = React.useState<FormErrors>({});

  React.useEffect(() => subscribeRequests(() => setRecords(loadRequests())), []);

  const gearRequests = records.filter((record): record is GearRequest => record.kind === 'gear');
  const ownListings = gearRequests.filter((item) => item.seller.userId === profile?.id);
  const availableItems = gearRequests.filter(
    (item) => item.status === 'available' && item.seller.userId !== profile?.id,
  );
  const filteredItems =
    selectedCategory === 'All'
      ? availableItems
      : availableItems.filter((item) => item.tag === selectedCategory);

  const resetForm = () => {
    setTitle('');
    setOriginalPrice('');
    setDemandedPrice('');
    setTag(GEAR_TAGS[0]);
    setErrors({});
  };

  const handleList = (event: React.FormEvent) => {
    event.preventDefault();
    if (!profile) return;

    const nextErrors: FormErrors = {};
    const mrp = Number(originalPrice);
    const asking = Number(demandedPrice);

    if (!title.trim()) nextErrors.title = 'Add the product name';
    if (!Number.isFinite(mrp) || mrp <= 0) {
      nextErrors.originalPrice = 'Enter the original price';
    }
    if (!Number.isFinite(asking) || asking <= 0) {
      nextErrors.price = 'Enter the price you want';
    } else if (Number.isFinite(mrp) && mrp > 0 && asking > mrp) {
      nextErrors.price = 'Demanded price cannot exceed the original price';
    } else if (asking > PRICE_CAP) {
      nextErrors.price = `Campus cap is ₹${PRICE_CAP} — lower the price`;
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    createGearRequest({
      seller: contactFromProfile(profile),
      title: title.trim(),
      tag,
      originalPrice: Math.round(mrp),
      price: Math.round(asking),
    });
    toast.success('Item listed on Gear Bazaar', {
      description: 'Pool-mates can now claim it from the feed.',
    });
    resetForm();
    setListOpen(false);
  };

  const handleClaim = (item: GearRequest) => {
    if (!profile) return;
    if (item.seller.userId === profile.id) {
      toast.error('You can’t claim your own listing');
      return;
    }
    const claimer = contactFromProfile(profile);
    const claimed = claimGearRequest(item.id, claimer);
    if (!claimed) {
      toast.error('This item is no longer available');
      return;
    }

    toast.success(`Claimed ${claimed.title}!`, {
      description: `Handoff with ${claimed.seller.name} · ${phoneLabel(claimed.seller.phone)}`,
    });
    addNotification(claimed.seller.userId, {
      kind: 'gear',
      title: `Your ${claimed.title} was claimed`,
      body: `${claimer.name} wants it · ${phoneLabel(claimer.phone)}. Handoff at ${handoffLabel(claimed.seller)}.`,
      href: '/requests',
    });
  };

  const ownListingCount = ownListings.length;

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Module 03 · Gear Bazaar"
        title="Gear Bazaar"
        description="Pass on drafters, lab aprons, and calculators to campus juniors at student-capped prices."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <span className="tag-timer">Capped ≤ ₹{PRICE_CAP}</span>
            <Badge variant="success" className="font-mono text-[11px]">
              Anti-Scalping Rule Active
            </Badge>
            <Button size="sm" onClick={() => setListOpen(true)}>
              <Plus className="h-3.5 w-3.5" />
              List an item
            </Button>
          </div>
        }
      />

      {/* Category Filter Pills */}
      <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              'whitespace-nowrap rounded-full px-3.5 py-1.5 font-mono text-[12px] font-bold transition-all',
              selectedCategory === cat
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50',
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {ownListingCount > 0 ? (
        <p className="text-[11.5px] text-slate-500">
          {ownListingCount === 1 ? '1 of your listings is' : `${ownListingCount} of your listings are`}{' '}
          tracked in{' '}
          <Link to="/requests" className="font-bold text-emerald-700 hover:underline">
            Requests
          </Link>{' '}
          — you can’t claim your own gear.
        </p>
      ) : null}

      {/* Gear Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
        {filteredItems.length === 0 ? (
          <div className="stitch-card col-span-full bg-white py-10 text-center">
            <p className="text-[13px] font-bold text-slate-700">No gear in this category right now</p>
            <p className="mt-1 text-[11.5px] text-slate-500">
              {ownListingCount > 0
                ? 'Your own listings stay out of the feed — track them under Requests.'
                : 'List something you no longer need and help a junior out.'}
            </p>
          </div>
        ) : null}
        {filteredItems.map((item) => (
          <div key={item.id} className="stitch-card flex flex-col justify-between bg-white">
            <div>
              <div className="flex items-center justify-between">
                <span className="tag-hostel">{item.tag}</span>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-800">
                  Save {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}%
                </span>
              </div>

              <h3 className="mt-3 text-[15px] font-black leading-snug text-slate-900">
                {item.title}
              </h3>
              <p className="mt-1 text-[11.5px] text-slate-500">
                Handoff: <strong className="text-slate-700">{handoffLabel(item.seller)}</strong>
              </p>

              {/* Price & MRP */}
              <div className="mt-4 flex items-baseline justify-between rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                <div>
                  <span className="font-mono text-[18px] font-black text-emerald-800">
                    ₹{item.price}
                  </span>
                  <span className="ml-2 font-mono text-[12px] text-slate-400 line-through">
                    ₹{item.originalPrice} MRP
                  </span>
                </div>
              </div>

              <p className="mt-3 text-[11.5px] text-slate-500">
                Seller: <strong className="text-slate-800">{item.seller.name}</strong> (
                {item.seller.hostel ?? 'Campus'})
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleClaim(item)}
              className="mt-5 flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-700 py-2.5 font-bold text-white shadow-sm transition-all text-[13px] hover:bg-emerald-800 active:scale-[0.99]"
            >
              Claim Item
            </button>
          </div>
        ))}
      </div>

      <Dialog
        open={listOpen}
        onOpenChange={(open) => {
          setListOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>List an item</DialogTitle>
            <DialogDescription>
              Campus-capped at ₹{PRICE_CAP}. Your phone number is shared when someone claims it.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleList} className="space-y-4" noValidate>
            <div>
              <Label htmlFor="gear-title">Product name</Label>
              <Input
                id="gear-title"
                className="mt-2"
                placeholder="e.g. Mini drafter with sheet tube"
                value={title}
                onChange={(event) => {
                  setTitle(event.target.value);
                  setErrors((current) => ({ ...current, title: undefined }));
                }}
                aria-invalid={Boolean(errors.title)}
              />
              {errors.title ? (
                <p className="mt-1.5 text-[11.5px] font-semibold text-destructive">{errors.title}</p>
              ) : null}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="gear-mrp">Original price (₹)</Label>
                <Input
                  id="gear-mrp"
                  className="mt-2"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  placeholder="650"
                  value={originalPrice}
                  onChange={(event) => {
                    setOriginalPrice(event.target.value);
                    setErrors((current) => ({ ...current, originalPrice: undefined }));
                  }}
                  aria-invalid={Boolean(errors.originalPrice)}
                />
                {errors.originalPrice ? (
                  <p className="mt-1.5 text-[11.5px] font-semibold text-destructive">
                    {errors.originalPrice}
                  </p>
                ) : null}
              </div>
              <div>
                <Label htmlFor="gear-price">Demanded price (₹)</Label>
                <Input
                  id="gear-price"
                  className="mt-2"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={PRICE_CAP}
                  placeholder="250"
                  value={demandedPrice}
                  onChange={(event) => {
                    setDemandedPrice(event.target.value);
                    setErrors((current) => ({ ...current, price: undefined }));
                  }}
                  aria-invalid={Boolean(errors.price)}
                />
                {errors.price ? (
                  <p className="mt-1.5 text-[11.5px] font-semibold text-destructive">
                    {errors.price}
                  </p>
                ) : null}
              </div>
            </div>

            <div>
              <Label htmlFor="gear-tag">Tag</Label>
              <Select value={tag} onValueChange={setTag}>
                <SelectTrigger id="gear-tag" className="mt-2">
                  <SelectValue placeholder="Pick a tag" />
                </SelectTrigger>
                <SelectContent>
                  {GEAR_TAGS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setListOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Post listing</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

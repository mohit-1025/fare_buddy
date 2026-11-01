import * as React from 'react';
import {
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Compass,
  DraftingCompass,
  Filter,
  Flame,
  Plus,
  ShieldCheck,
  Sparkles,
  Tag,
} from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface GearItem {
  id: string;
  title: string;
  category: 'ED / Drafting' | 'Workshop' | 'Lab Gear' | 'Electronics';
  price: number;
  mrp: number;
  condition: 'Like New' | 'Good' | 'Functional';
  sellerName: string;
  sellerHostel: string;
  handoffLocation: string;
  claimed: boolean;
}

export function GearBazaarPage() {
  const [selectedCategory, setSelectedCategory] = React.useState<string>('All');
  const [items, setItems] = React.useState<GearItem[]>([
    {
      id: '1',
      title: 'Omega Engineering Mini-Drafter',
      category: 'ED / Drafting',
      price: 250,
      mrp: 650,
      condition: 'Like New',
      sellerName: 'Aman Raj',
      sellerHostel: 'BH2',
      handoffLocation: 'BH2 Lobby',
      claimed: false,
    },
    {
      id: '2',
      title: 'Workshop Safety Goggles & Apron Set',
      category: 'Workshop',
      price: 150,
      mrp: 380,
      condition: 'Good',
      sellerName: 'Rohan Gupta',
      sellerHostel: 'BH1',
      handoffLocation: 'BH1 Common Room',
      claimed: false,
    },
    {
      id: '3',
      title: 'Casio fx-991EX ClassWiz Scientific Calculator',
      category: 'Electronics',
      price: 390,
      mrp: 1250,
      condition: 'Good',
      sellerName: 'Riya Kumari',
      sellerHostel: 'GH',
      handoffLocation: 'GH Security Gate',
      claimed: false,
    },
    {
      id: '4',
      title: 'Engineering Physics & Chemistry Lab Manual Set',
      category: 'Lab Gear',
      price: 120,
      mrp: 300,
      condition: 'Functional',
      sellerName: 'Aarav Sharma',
      sellerHostel: 'BH2',
      handoffLocation: 'BH2 Room 214',
      claimed: false,
    },
  ]);

  const categories = ['All', 'ED / Drafting', 'Workshop', 'Lab Gear', 'Electronics'] as const;

  const filteredItems = selectedCategory === 'All'
    ? items
    : items.filter((item) => item.category === selectedCategory);

  const handleClaim = (id: string) => {
    setItems((prev) =>
      prev.map((i) => {
        if (i.id === id) {
          toast.success(`Claimed ${i.title}! Host notified for handoff at ${i.handoffLocation}.`);
          return { ...i, claimed: true };
        }
        return i;
      }),
    );
  };

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Module 03 · Gear Bazaar"
        title="Gear Bazaar"
        description="Pass on drafters, lab aprons, and calculators to campus juniors at student-capped prices."
        actions={
          <div className="flex items-center gap-2">
            <span className="tag-timer">Capped ≤ ₹400</span>
            <Badge variant="success" className="font-mono text-[11px]">
              Anti-Scalping Rule Active
            </Badge>
          </div>
        }
      />

      {/* Category Filter Pills */}
      <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
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

      {/* Gear Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className={cn(
              'stitch-card flex flex-col justify-between bg-white',
              item.claimed && 'opacity-65',
            )}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="tag-hostel">{item.category}</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10.5px] font-semibold text-slate-600">
                  {item.condition}
                </span>
              </div>

              <h3 className="mt-3 text-[15px] font-black leading-snug text-slate-900">
                {item.title}
              </h3>
              <p className="mt-1 text-[11.5px] text-slate-500">
                Handoff: <strong className="text-slate-700">{item.handoffLocation}</strong>
              </p>

              {/* Price & MRP */}
              <div className="mt-4 flex items-baseline justify-between rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                <div>
                  <span className="font-mono text-[18px] font-black text-emerald-800">
                    ₹{item.price}
                  </span>
                  <span className="ml-2 font-mono text-[12px] text-slate-400 line-through">
                    ₹{item.mrp} MRP
                  </span>
                </div>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-800">
                  Save {Math.round(((item.mrp - item.price) / item.mrp) * 100)}%
                </span>
              </div>

              <p className="mt-3 text-[11.5px] text-slate-500">
                Seller: <strong className="text-slate-800">{item.sellerName}</strong> ({item.sellerHostel})
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleClaim(item.id)}
              disabled={item.claimed}
              className={cn(
                'mt-5 flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 font-bold transition-all text-[13px]',
                item.claimed
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-700 text-white shadow-sm hover:bg-emerald-800 active:scale-[0.99]',
              )}
            >
              {item.claimed ? 'Claimed' : 'Claim Item'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  CarTaxiFront,
  Check,
  DraftingCompass,
  FlaskConical,
  Loader2,
  RefreshCw,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth-context';
import { backend } from '@/lib/backend';
import type { Profile } from '@/lib/types';
import { initials } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { cn } from '@/lib/utils';

export const OPEN_DEMO_TOOLS_EVENT = 'farebuddy:open-demo-tools';

const QUICK_LINKS = [
  { to: '/cart', label: 'Cart Pool', icon: ShoppingCart },
  { to: '/ride', label: 'Ride Pool', icon: CarTaxiFront },
  { to: '/gear', label: 'Gear Bazaar', icon: DraftingCompass },
  { to: '/hub', label: 'Campus Hub', icon: ShieldCheck },
  { to: '/impact', label: 'Impact', icon: BarChart3 },
];

interface DemoToolsDockProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  showTrigger: boolean;
}

export function DemoToolsDock({ open, onOpenChange, showTrigger }: DemoToolsDockProps) {
  const { profile, actAs, seedDemoData } = useAuth();
  const navigate = useNavigate();
  const [profiles, setProfiles] = React.useState<Profile[]>([]);
  const [loadingProfiles, setLoadingProfiles] = React.useState(false);
  const [seeding, setSeeding] = React.useState(false);
  const [switching, setSwitching] = React.useState<string | null>(null);

  const loadProfiles = React.useCallback(async () => {
    setLoadingProfiles(true);
    try {
      const next = await backend.demo.listProfiles();
      setProfiles(next);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not load demo students');
    } finally {
      setLoadingProfiles(false);
    }
  }, []);

  React.useEffect(() => {
    if (open) void loadProfiles();
  }, [open, loadProfiles]);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await seedDemoData();
      await loadProfiles();
      toast.success('Demo data planted', {
        description: 'Hostel 7 pool, Hatia ride, and 6 gear listings are ready.',
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not seed demo data');
    } finally {
      setSeeding(false);
    }
  };

  const handleSwitch = async (student: Profile) => {
    if (student.id === profile?.id) return;
    setSwitching(student.id);
    try {
      await actAs(student.id);
      toast.success(`Now acting as ${student.full_name ?? 'a hosteller'}`, {
        description: 'All actions will be saved to this student.',
      });
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not switch student');
    } finally {
      setSwitching(null);
    }
  };

  return (
    <>
      {showTrigger ? (
        <button
          type="button"
          onClick={() => onOpenChange(true)}
          className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] right-4 z-30 inline-flex items-center gap-1.5 rounded-full bg-stone-900 px-3.5 py-2.5 text-[11px] font-bold text-white shadow-lift transition-transform hover:scale-[1.02] active:scale-[0.98] lg:bottom-6 lg:right-6"
        >
          <FlaskConical className="h-3.5 w-3.5 text-emerald-300" />
          Demo tools
        </button>
      ) : null}

      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent
          title="Demo tools"
          description="Judge-ready controls for two users in one browser."
        >
          <div className="space-y-5">
            <div className="flex items-start gap-2.5 rounded-xl border border-warning/20 bg-warning-soft px-3.5 py-3">
              <FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
              <p className="text-[11.5px] leading-relaxed text-warning">
                <span className="font-extrabold">Local demo mode.</span> No Supabase keys detected,
                so accounts and pools live in this browser.
              </p>
            </div>

            <section className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary-deep">
                    <RefreshCw className={cn('h-4 w-4', seeding && 'animate-spin')} />
                  </span>
                  <div>
                    <h3 className="text-[13px] font-extrabold">Seed demo data</h3>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                      Rebuilds the Hostel 7 pool (₹80 to go), Hatia 17:15 ride (2/4 seats), and 6
                      gear listings.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {['Hostel 7 · ₹69/₹149', 'Hatia · 2/4', '6 gear items', '2 live students'].map(
                  (item) => (
                    <span
                      key={item}
                      className="rounded-full bg-secondary px-2.5 py-1 text-[10px] font-bold text-muted-foreground"
                    >
                      {item}
                    </span>
                  ),
                )}
              </div>
              <Button className="mt-3 w-full" size="sm" onClick={handleSeed} disabled={seeding}>
                {seeding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                {seeding ? 'Planting demo data…' : 'Seed / reset demo data'}
              </Button>
              <p className="mt-2 text-center text-[10px] text-muted-foreground">
                Replaces local demo changes. Your custom sign-ups stay untouched.
              </p>
            </section>

            <section>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-[13px] font-extrabold">Act as a student</h3>
                </div>
                <Badge variant="muted">{profiles.length || '—'} students</Badge>
              </div>
              <div className="mt-2.5 space-y-1.5">
                {loadingProfiles ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="flex items-center gap-3 rounded-xl border border-border p-2.5">
                      <Skeleton className="h-9 w-9 rounded-full" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-3 w-28" />
                        <Skeleton className="h-2.5 w-40" />
                      </div>
                    </div>
                  ))
                ) : (
                  profiles.map((student) => {
                    const isCurrent = student.id === profile?.id;
                    const isBusy = switching === student.id;
                    return (
                      <button
                        key={student.id}
                        type="button"
                        onClick={() => handleSwitch(student)}
                        disabled={isCurrent || Boolean(switching) || seeding}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition-colors',
                          isCurrent
                            ? 'border-primary/25 bg-primary-soft/60'
                            : 'border-border bg-card hover:bg-secondary/70',
                          isBusy && 'opacity-80',
                        )}
                      >
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="text-[10px]">
                            {initials(student.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[12.5px] font-bold">
                            {student.full_name ?? 'Incomplete profile'}
                          </p>
                          <p className="truncate text-[10.5px] text-muted-foreground">
                            {student.hostel ?? '—'}
                            {student.wing ? ` · ${student.wing}` : ''}
                            {student.email ? ` · ${student.email}` : ''}
                          </p>
                        </div>
                        {isCurrent ? (
                          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-card px-2 py-1 text-[9px] font-extrabold uppercase tracking-wide text-primary-deep">
                            <Check className="h-2.5 w-2.5" /> Current
                          </span>
                        ) : isBusy ? (
                          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" />
                        ) : (
                          <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </section>

            <Separator />

            <section>
              <h3 className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-muted-foreground">
                Jump to a module
              </h3>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {QUICK_LINKS.map((link) => (
                  <button
                    key={link.to}
                    type="button"
                    onClick={() => {
                      onOpenChange(false);
                      navigate(link.to);
                    }}
                    className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5 text-left text-[12px] font-bold transition-colors hover:bg-secondary"
                  >
                    <link.icon className="h-4 w-4 text-primary" />
                    {link.label}
                  </button>
                ))}
              </div>
            </section>

            <p className="pb-1 text-center text-[10px] leading-relaxed text-muted-foreground">
              Seeded accounts use password <span className="font-bold">farebuddy</span>. Never
              available when Supabase is connected.
            </p>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}

import * as React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  BarChart3,
  CarTaxiFront,
  DraftingCompass,
  FlaskConical,
  ShieldCheck,
  ShoppingCart,
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { DEMO_PROFILE_IDS } from '@/lib/demo-seed';
import { useSavings } from '@/hooks/use-savings';
import { useDemoToolsSetting } from '@/hooks/use-demo-tools-setting';
import { inr } from '@/lib/format';
import { cn } from '@/lib/utils';
import { BrandLockup } from '@/components/brand';
import { ProfileMenu } from '@/components/layout/profile-menu';
import { SavingsPill } from '@/components/savings-pill';
import { DemoToolsDock, OPEN_DEMO_TOOLS_EVENT } from '@/components/demo/demo-tools-dock';

const NAV_ITEMS = [
  { to: '/cart', label: 'Cart Pool', icon: ShoppingCart, emoji: '🛒' },
  { to: '/ride', label: 'Ride Pool', icon: CarTaxiFront, emoji: '🛺' },
  { to: '/gear', label: 'Gear Bazaar', icon: DraftingCompass, emoji: '📐' },
  { to: '/hub', label: 'Campus Hub', icon: ShieldCheck, emoji: '🏛️' },
  { to: '/impact', label: 'Impact', icon: BarChart3, emoji: '📊' },
] as const;

function DemoBanner() {
  const { profile } = useAuth();
  if (!profile || profile.id === DEMO_PROFILE_IDS.aarav) return null;
  if (!Object.values(DEMO_PROFILE_IDS).includes(profile.id as (typeof DEMO_PROFILE_IDS)[keyof typeof DEMO_PROFILE_IDS])) {
    return null;
  }

  return (
    <div className="border-b border-warning/20 bg-warning-soft lg:rounded-none">
      <div className="page-container flex h-9 items-center justify-between gap-3 text-[11px] font-semibold text-warning">
        <span className="flex min-w-0 items-center gap-1.5">
          <FlaskConical className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">
            Demo view · Acting as <span className="font-extrabold">{profile.full_name}</span>
            {profile.hostel ? ` · ${profile.hostel}` : ''}
          </span>
        </span>
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent(OPEN_DEMO_TOOLS_EVENT))}
          className="shrink-0 rounded-full bg-warning/10 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide hover:bg-warning/15"
        >
          Switch
        </button>
      </div>
    </div>
  );
}

export function AppShell() {
  const savings = useSavings();
  const demoSetting = useDemoToolsSetting();
  const [isDemoDockOpen, setDemoDockOpen] = React.useState(false);

  React.useEffect(() => {
    const open = () => setDemoDockOpen(true);
    window.addEventListener(OPEN_DEMO_TOOLS_EVENT, open);
    return () => window.removeEventListener(OPEN_DEMO_TOOLS_EVENT, open);
  }, []);

  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-40 hidden border-b border-border/70 bg-background/85 backdrop-blur-xl lg:block">
        <div className="page-container flex h-16 items-center justify-between gap-6">
          <NavLink to="/cart" className="shrink-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <BrandLockup />
          </NavLink>

          <nav className="flex items-center gap-1" aria-label="Primary">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[13px] font-semibold transition-colors',
                    isActive
                      ? 'bg-primary-soft text-primary-deep'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-3">
            <SavingsPill amount={inr(savings.total)} label="You save" />
            <div className="h-6 w-px bg-border" />
            <ProfileMenu />
          </div>
        </div>
      </header>

      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-xl lg:hidden">
        <div className="flex h-14 items-center justify-between gap-2 px-4">
          <NavLink to="/cart" className="min-w-0 rounded-lg">
            <BrandLockup />
          </NavLink>
          <div className="flex shrink-0 items-center gap-2">
            <SavingsPill amount={inr(savings.total)} label="You save" />
            <ProfileMenu />
          </div>
        </div>
      </header>

      <DemoBanner />

      <main className="page-container">
        <div className="bottom-nav-space pt-5 lg:pb-14 lg:pt-8">
          <Outlet />
        </div>
      </main>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-card/95 backdrop-blur-xl pb-safe lg:hidden"
        aria-label="Main navigation"
      >
        <div className="mx-auto grid max-w-lg grid-cols-5 px-1.5 pt-1.5">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-1 rounded-xl pb-2 pt-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  isActive ? 'text-primary-deep' : 'text-muted-foreground',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      'grid h-8 w-12 place-items-center rounded-full transition-colors',
                      isActive ? 'bg-primary-soft' : 'bg-transparent',
                    )}
                  >
                    <item.icon className="h-[18px] w-[18px]" strokeWidth={isActive ? 2.5 : 2} />
                  </span>
                  <span className="text-[10px] font-bold leading-none">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {demoSetting.configured ? (
        <DemoToolsDock
          open={isDemoDockOpen}
          onOpenChange={setDemoDockOpen}
          showTrigger={demoSetting.enabled}
        />
      ) : null}
    </div>
  );
}

import type { ReactNode } from 'react';
import { BadgeCheck, CarTaxiFront, MailCheck, ShieldCheck, Users } from 'lucide-react';
import { BrandLockup, BrandMark } from '@/components/brand';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

function PreviewCards() {
  return (
    <div className="relative mt-10 h-[310px] w-full max-w-[420px]">
      <div className="absolute left-0 top-0 w-[300px] rotate-[-2deg] rounded-2xl border border-white/60 bg-white p-4 text-stone-900 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.55)]">
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-amber-400 px-2.5 py-1 text-[10px] font-extrabold text-amber-950">
            Blinkit
          </span>
          <span className="text-[11px] font-semibold text-stone-500">BH-2 · Floor 3</span>
        </div>
        <p className="mt-3 text-[13px] font-bold">Late-night Maggi run</p>
        <div className="mt-2 flex items-baseline justify-between text-[11px] font-semibold text-stone-500">
          <span>₹72 / ₹149</span>
          <span className="font-bold text-emerald-700">₹77 to go</span>
        </div>
        <Progress value={(72 / 149) * 100} className="mt-2 h-2 bg-stone-100" />
        <div className="mt-3 flex items-center justify-between">
          <div className="flex -space-x-2">
            {['AS', 'RV', 'KS'].map((initials) => (
              <Avatar key={initials} className="h-6 w-6 border-2 border-white">
                <AvatarFallback className="bg-emerald-100 text-[9px]">{initials}</AvatarFallback>
              </Avatar>
            ))}
            <span className="grid h-6 w-6 place-items-center rounded-full border-2 border-white bg-stone-900 text-[9px] font-bold text-white">
              +2
            </span>
          </div>
          <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">
            Fees split ₹28/head
          </span>
        </div>
      </div>

      <div className="absolute right-0 top-[132px] w-[292px] rotate-[2.5deg] rounded-2xl border border-white/10 bg-[#0b3b31] p-4 text-white shadow-[0_24px_60px_-24px_rgba(0,0,0,0.65)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-white/10">
              <CarTaxiFront className="h-4 w-4 text-emerald-300" />
            </span>
            <div>
              <p className="text-[12px] font-bold leading-none">Hatia · HTE</p>
              <p className="mt-1 text-[10px] text-emerald-100/70">17:15–17:30 · Main Gate</p>
            </div>
          </div>
          <span className="rounded-full bg-emerald-400/15 px-2 py-1 text-[10px] font-bold text-emerald-300">
            3/4 seats
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between rounded-xl bg-white/5 px-3 py-2.5">
          <div>
            <p className="text-[9px] uppercase tracking-wider text-emerald-100/60">Solo vs shared</p>
            <p className="text-[13px] font-bold">
              <span className="text-white/50 line-through">₹350</span> ₹88 each
            </p>
          </div>
          <span className="rounded-full bg-emerald-400 px-2.5 py-1 text-[10px] font-extrabold text-emerald-950">
            Save ₹262
          </span>
        </div>
      </div>

      <div className="absolute bottom-0 left-6 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white backdrop-blur-md">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-white text-emerald-700">
          <BadgeCheck className="h-4 w-4" />
        </span>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-emerald-100/60">This month</p>
          <p className="text-[15px] font-extrabold">You save ₹268</p>
        </div>
      </div>
    </div>
  );
}

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-[#04231d] text-white lg:flex lg:flex-col lg:p-12 xl:p-16">
        <div className="pointer-events-none absolute -right-28 -top-28 h-[26rem] w-[26rem] rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 h-[24rem] w-[24rem] rounded-full bg-amber-300/10 blur-3xl" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
            backgroundSize: '34px 34px',
          }}
        />

        <div className="relative flex items-center gap-2.5">
          <BrandMark className="h-10 w-10 rounded-xl" />
          <div className="leading-none">
            <p className="text-lg font-extrabold tracking-[-0.03em]">
              Fare<span className="text-emerald-400">Buddy</span>
            </p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-100/60">
              BIT Patna campus
            </p>
          </div>
        </div>

        <div className="relative mt-14 max-w-[460px]">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-emerald-100/80">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            Student ID verified · campus only
          </div>
          <h1 className="text-balance text-[40px] font-extrabold leading-[1.08] tracking-[-0.04em] xl:text-[46px]">
            Split the fees.
            <br />
            <span className="text-emerald-400">Keep the friendships.</span>
          </h1>
          <p className="mt-4 max-w-[400px] text-[15px] leading-relaxed text-emerald-50/70">
            Pool late-night orders, share autos to the station, and pass on lab gear — all with
            your hostel mates across the road.
          </p>
        </div>

        <PreviewCards />

        <div className="relative mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 pt-8 text-[11px] font-semibold text-emerald-100/60">
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" /> 1,200+ hostellers
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MailCheck className="h-3.5 w-3.5" /> UPI settlements
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CarTaxiFront className="h-3.5 w-3.5" /> Live seat updates
          </span>
        </div>
      </aside>

      <main className="relative flex min-h-dvh flex-col bg-background">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-primary-soft/40 to-transparent lg:hidden" />
        <header className="relative flex items-center justify-between px-5 pb-2 pt-[calc(1.25rem+env(safe-area-inset-top,0px))] lg:hidden">
          <BrandLockup />
          <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-2.5 py-1 text-[10px] font-bold text-primary-deep">
            <ShieldCheck className="h-3 w-3" />
            BIT Patna
          </span>
        </header>

        <div className="relative flex flex-1 items-center justify-center px-5 py-8 lg:px-12">
          <div className="w-full max-w-[430px] animate-fade-up">{children}</div>
        </div>

        <footer className="relative px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] pt-2 text-center lg:px-12">
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Only valid BIT Patna student IDs can join. Verified on the client and at the database.
          </p>
        </footer>
      </main>
    </div>
  );
}

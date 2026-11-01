import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BadgeCheck,
  Building2,
  Check,
  Copy,
  Download,
  FlaskConical,
  Landmark,
  LogOut,
  Phone,
  ReceiptIndianRupee,
  ShieldCheck,
  Smartphone,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth-context';
import { useSavings } from '@/hooks/use-savings';
import { useDemoToolsSetting } from '@/hooks/use-demo-tools-setting';
import { useInstallPrompt } from '@/hooks/use-install-prompt';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { initials, inr } from '@/lib/format';
import { OPEN_DEMO_TOOLS_EVENT } from '@/components/demo/demo-tools-dock';
import { HOSTELS } from '@/lib/constants';

function Detail({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-border/80 bg-secondary/40 px-3 py-2.5">
      <span className="mt-0.5 text-muted-foreground [&_svg]:h-4 [&_svg]:w-4">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
          {label}
        </p>
        <p className="truncate text-[12.5px] font-bold">{value}</p>
      </div>
    </div>
  );
}

export function SettingsPage() {
  const { profile, user, signOut, isDemo } = useAuth();
  const savings = useSavings();
  const demoTools = useDemoToolsSetting();
  const install = useInstallPrompt();
  const navigate = useNavigate();

  const hostelLabel = HOSTELS.find((hostel) => hostel.value === profile?.hostel)?.label;

  const handleCopyUpi = async () => {
    if (!profile?.upi_id) {
      toast.error('Add a UPI ID from your profile first');
      return;
    }
    try {
      await navigator.clipboard.writeText(profile.upi_id);
      toast.success('UPI ID copied');
    } catch {
      toast.error('Clipboard blocked by the browser');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login', { replace: true });
      toast.success('Signed out');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not sign out');
    }
  };

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Your account"
        title="Settings"
        description="Your hostel identity, demo controls, and how FareBuddy is connected."
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <section className="surface overflow-hidden">
            <div className="flex flex-col gap-4 bg-gradient-to-br from-primary-soft/60 via-card to-card p-5 sm:flex-row sm:items-center">
              <Avatar className="h-16 w-16 border-4 border-white shadow-soft">
                <AvatarFallback className="bg-primary-soft text-lg text-primary-deep">
                  {initials(profile?.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-extrabold tracking-[-0.02em]">
                    {profile?.full_name}
                  </h2>
                  <Badge variant="success">
                    <BadgeCheck className="h-3 w-3" />
                    Verified student
                  </Badge>
                </div>
                <p className="mt-0.5 break-all text-[12.5px] text-muted-foreground">{user?.email}</p>
                <p className="mt-1.5 text-[11.5px] font-semibold text-muted-foreground">
                  {hostelLabel ?? profile?.hostel} · {profile?.wing}
                  {profile?.room ? ` · Room ${profile.room}` : ''}
                </p>
              </div>
            </div>
            <div className="grid gap-2 p-5 sm:grid-cols-2">
              <Detail
                icon={<Building2 />}
                label="Hostel"
                value={hostelLabel ?? profile?.hostel ?? '—'}
              />
              <Detail icon={<Sparkles />} label="Floor" value={profile?.wing ?? '—'} />
              <Detail
                icon={<Smartphone />}
                label="Room"
                value={profile?.room ? profile.room : 'Not added'}
              />
              <Detail
                icon={<Phone />}
                label="Phone"
                value={profile?.phone ? `+91 ${profile.phone}` : 'Not added'}
              />
              <div className="flex items-start justify-between gap-2 rounded-xl border border-border/80 bg-secondary/40 px-3 py-2.5">
                <div className="flex min-w-0 items-start gap-2.5">
                  <Landmark className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                      UPI ID
                    </p>
                    <p className="truncate text-[12.5px] font-bold">{profile?.upi_id ?? '—'}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => void handleCopyUpi()}
                  className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg text-muted-foreground hover:bg-card hover:text-foreground"
                  aria-label="Copy UPI ID"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 border-t border-border/70 bg-secondary/20 px-5 py-3 text-[11px] text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              Locked to your verified BIT Patna student ID.
            </div>
          </section>

          <section className="surface p-5">
            <h2 className="text-[15px] font-extrabold tracking-[-0.01em]">Preferences</h2>
            <p className="mt-0.5 text-[12px] text-muted-foreground">
              Small switches, fewer surprises during a demo.
            </p>

            <div className="mt-4 space-y-1">
              <div className="flex items-center justify-between gap-4 rounded-xl px-1 py-3">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-warning-soft text-warning">
                    <FlaskConical className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="text-[13px] font-bold">Demo tools</p>
                      {isDemo ? (
                        <Badge variant="warning">Local demo</Badge>
                      ) : (
                        <Badge variant="muted">Offline only</Badge>
                      )}
                    </div>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                      {demoTools.configured
                        ? 'Show a floating drawer to seed data and act as another student.'
                        : 'Only available in local demo mode, without Supabase keys.'}
                    </p>
                    {demoTools.configured && demoTools.enabled ? (
                      <button
                        type="button"
                        onClick={() => window.dispatchEvent(new CustomEvent(OPEN_DEMO_TOOLS_EVENT))}
                        className="mt-1 text-[11px] font-bold text-primary hover:underline"
                      >
                        Open demo tools
                      </button>
                    ) : null}
                  </div>
                </div>
                <Switch
                  checked={demoTools.enabled}
                  disabled={!demoTools.configured}
                  onCheckedChange={(value) => {
                    demoTools.setEnabled(value);
                    toast.success(value ? 'Demo tools visible' : 'Demo tools hidden', {
                      description: value
                        ? 'Look for the floating button above the tab bar.'
                        : 'Turn it back on here anytime.',
                    });
                  }}
                  aria-label="Show demo tools"
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between gap-4 rounded-xl px-1 py-3">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary-deep">
                    <Download className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="text-[13px] font-bold">Install FareBuddy</p>
                      {install.installed ? <Badge variant="success">Installed</Badge> : null}
                    </div>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                      {install.installed
                        ? 'You’re running the full-screen app version.'
                        : install.canInstall
                          ? 'Add it to your home screen for a full-screen, offline-ready app.'
                          : 'Use your browser menu → “Add to Home Screen” on mobile.'}
                    </p>
                  </div>
                </div>
                {install.canInstall && !install.installed ? (
                  <Button size="sm" variant="outline" onClick={() => void install.install()}>
                    Install
                  </Button>
                ) : null}
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-4">
          <section className="relative overflow-hidden rounded-2xl bg-[#052e27] p-5 text-white shadow-lift">
            <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-400/20 blur-2xl" />
            <div className="relative flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold text-emerald-200">
                <TrendingUp className="h-3 w-3" />
                Your savings
              </span>
              <ReceiptIndianRupee className="h-4 w-4 text-emerald-300" />
            </div>
            <p className="relative mt-4 text-3xl font-extrabold tracking-[-0.03em]">
              {inr(savings.total)}
            </p>
            <p className="relative mt-0.5 text-[11px] text-emerald-100/70">
              Since you joined FareBuddy
            </p>
            <div className="relative mt-4 space-y-2 border-t border-white/10 pt-3 text-[11.5px]">
              <div className="flex items-center justify-between">
                <span className="text-emerald-100/70">Pooled order fees</span>
                <span className="font-bold">{inr(savings.pooledOrders)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-emerald-100/70">Shared station rides</span>
                <span className="font-bold">{inr(savings.rides)}</span>
              </div>
            </div>
            {savings.total === 0 ? (
              <p className="relative mt-3 rounded-lg bg-white/5 px-2.5 py-2 text-[10.5px] leading-relaxed text-emerald-100/70">
                Your first pooled order will show up here.
              </p>
            ) : null}
          </section>

          <section className="surface p-5">
            <h2 className="text-[15px] font-extrabold tracking-[-0.01em]">About FareBuddy</h2>
            <div className="mt-3 space-y-3 text-[12px]">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <p className="leading-relaxed text-muted-foreground">
                  <span className="font-bold text-foreground">Student-only.</span> Emails are
                  validated on the client and enforced by a Postgres trigger.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <Landmark className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <p className="leading-relaxed text-muted-foreground">
                  <span className="font-bold text-foreground">Direct settlements.</span> FareBuddy
                  never holds money — dues go straight to the host’s UPI.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <p className="leading-relaxed text-muted-foreground">
                  <span className="font-bold text-foreground">
                    {isDemo ? 'Local demo mode.' : 'Supabase connected.'}
                  </span>{' '}
                  {isDemo
                    ? 'Your data lives in this browser and is safe to explore.'
                    : 'Realtime pools, auth, and storage are ready.'}
                </p>
              </div>
            </div>
            <Separator className="my-4" />
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Version 0.1.0 · Foundation</span>
              <span className="font-semibold">BIT Patna</span>
            </div>
          </section>

          <Button variant="outline" className="w-full text-destructive" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}

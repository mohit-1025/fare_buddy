import type { LucideIcon } from 'lucide-react';
import { ArrowUpRight, Check, FlaskConical, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { OPEN_DEMO_TOOLS_EVENT } from '@/components/demo/demo-tools-dock';

interface ModuleScaffoldProps {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  heroTitle: string;
  heroDescription: string;
  features: string[];
  seedFacts: string[];
  footerNote: string;
}

export function ModuleScaffold({
  eyebrow,
  title,
  description,
  icon: Icon,
  heroTitle,
  heroDescription,
  features,
  seedFacts,
  footerNote,
}: ModuleScaffoldProps) {
  const { isDemo } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        actions={
          <Badge variant="warning" className="px-3 py-1.5 text-[10px]">
            <Sparkles className="h-3 w-3" />
            Next build
          </Badge>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
        <section className="relative overflow-hidden rounded-3xl bg-[#04231d] p-6 text-white shadow-lift sm:p-8">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-1/3 h-52 w-52 rounded-full bg-amber-300/10 blur-3xl" />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
              backgroundSize: '30px 30px',
            }}
          />

          <div className="relative flex items-start justify-between gap-4">
            <span className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/10 text-emerald-300">
              <Icon className="h-6 w-6" />
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-200/80">
              {eyebrow.split('·')[0]?.trim()}
            </span>
          </div>

          <h2 className="relative mt-6 max-w-md text-balance text-[28px] font-extrabold leading-[1.12] tracking-[-0.035em] sm:text-[32px]">
            {heroTitle}
          </h2>
          <p className="relative mt-3 max-w-lg text-[13.5px] leading-relaxed text-emerald-50/70">
            {heroDescription}
          </p>

          <div className="relative mt-6 grid gap-2 sm:grid-cols-2">
            {features.map((feature) => (
              <div
                key={feature}
                className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-[12px] font-medium leading-snug text-emerald-50/85"
              >
                <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-emerald-400 text-emerald-950">
                  <Check className="h-2.5 w-2.5" strokeWidth={3} />
                </span>
                {feature}
              </div>
            ))}
          </div>

          <div className="relative mt-6 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10.5px] font-semibold text-emerald-100/70">
            <Sparkles className="h-3 w-3 text-emerald-300" />
            Flows arrive in the next module build
          </div>
        </section>

        <section className="surface flex flex-col p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="eyebrow">Demo seed</p>
              <h3 className="mt-1 text-[15px] font-extrabold">Ready for the walkthrough</h3>
            </div>
            <Badge variant="success">Planted</Badge>
          </div>

          <ul className="mt-4 space-y-2.5">
            {seedFacts.map((fact) => (
              <li key={fact} className="flex items-start gap-2.5 text-[12px] leading-snug">
                <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-primary-soft text-primary-deep">
                  <Check className="h-2.5 w-2.5" strokeWidth={3} />
                </span>
                <span className="text-muted-foreground">{fact}</span>
              </li>
            ))}
          </ul>

          <div className="mt-auto pt-5">
            {isDemo ? (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => window.dispatchEvent(new CustomEvent(OPEN_DEMO_TOOLS_EVENT))}
              >
                <FlaskConical className="h-3.5 w-3.5" />
                Open demo tools
              </Button>
            ) : (
              <Button variant="outline" size="sm" className="w-full" onClick={() => navigate('/settings')}>
                <ArrowUpRight className="h-3.5 w-3.5" />
                Review connection settings
              </Button>
            )}
            <p className="mt-2.5 text-center text-[10px] leading-relaxed text-muted-foreground">
              {footerNote}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

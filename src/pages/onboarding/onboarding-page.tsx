import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  Loader2,
  QrCode,
  Sparkles,
  UserRound,
  Wallet,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth-context';
import { BrandLockup } from '@/components/brand';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FLOOR_SUGGESTIONS, HOSTELS } from '@/lib/constants';
import { normalizePhone, validateName, validatePhone, validateUpi } from '@/lib/validation';
import { cn } from '@/lib/utils';

type FieldErrors = Partial<
  Record<'full_name' | 'phone' | 'hostel' | 'wing' | 'room' | 'upi_id', string>
>;

const STEPS = [
  {
    title: 'Your details',
    caption: 'How pool-mates reach you',
    icon: UserRound,
  },
  {
    title: 'Hostel details',
    caption: 'Find pools on your floor',
    icon: Building2,
  },
  {
    title: 'UPI for settlements',
    caption: 'Get paid back instantly',
    icon: Wallet,
  },
] as const;

function FieldError({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-1.5 flex items-start gap-1.5 text-[11.5px] font-semibold leading-snug text-destructive">
      <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" />
      {children}
    </p>
  );
}

export function OnboardingPage() {
  const { profile, user, completeOnboarding } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = React.useState(0);
  const [fullName, setFullName] = React.useState(profile?.full_name ?? '');
  const [phone, setPhone] = React.useState(profile?.phone ?? '');
  const [hostel, setHostel] = React.useState(profile?.hostel ?? '');
  const [wing, setWing] = React.useState(profile?.wing ?? '');
  const [room, setRoom] = React.useState(profile?.room ?? '');
  const [upi, setUpi] = React.useState(profile?.upi_id ?? '');
  const [errors, setErrors] = React.useState<FieldErrors>({});
  const [submitting, setSubmitting] = React.useState(false);

  const currentStep = STEPS[step];
  const StepIcon = currentStep.icon;

  const validateStep = () => {
    const next: FieldErrors = {};
    if (step === 0) {
      const nameError = validateName(fullName);
      if (nameError) next.full_name = nameError;
      const phoneError = validatePhone(phone);
      if (phoneError) next.phone = phoneError;
    }
    if (step === 1) {
      if (!hostel) next.hostel = 'Pick your hostel';
      if (!wing.trim()) next.wing = 'Pick your floor';
      if (!room.trim()) next.room = 'Add your room number';
    }
    if (step === 2) {
      const upiError = validateUpi(upi);
      if (upiError) next.upi_id = upiError;
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const goNext = () => {
    if (!validateStep()) return;
    if (step < STEPS.length - 1) {
      setStep((value) => value + 1);
      return;
    }
    void finish();
  };

  const finish = async () => {
    if (!validateStep()) return;
    setSubmitting(true);
    try {
      const saved = await completeOnboarding({
        full_name: fullName.trim(),
        hostel,
        wing: wing.trim(),
        room: room.trim(),
        phone: normalizePhone(phone),
        upi_id: upi.trim(),
      });
      toast.success(`Welcome to FareBuddy, ${saved.full_name?.split(' ')[0] ?? 'hosteller'}!`, {
        description: 'Your profile is ready. Time to save.',
      });
      navigate('/cart', { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not save your profile.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    goNext();
  };

  const upiValid = !validateUpi(upi);
  const upiUri = `upi://pay?pa=${encodeURIComponent(upi.trim())}&pn=${encodeURIComponent(fullName.trim() || 'FareBuddy')}&cu=INR`;

  return (
    <div className="min-h-dvh bg-background">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-primary-soft/50 via-background to-background" />

      <header className="relative mx-auto flex w-full max-w-3xl items-center justify-between px-5 pb-4 pt-[calc(1.25rem+env(safe-area-inset-top,0px))] sm:px-8">
        <BrandLockup />
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-bold text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Hosteller setup
        </span>
      </header>

      <main className="relative mx-auto w-full max-w-3xl px-5 pb-[calc(2rem+env(safe-area-inset-bottom,0px))] sm:px-8">
        <div className="mx-auto max-w-xl">
          <div className="mb-6 text-center sm:text-left">
            <p className="eyebrow">One-time setup</p>
            <h1 className="mt-2 text-[28px] font-extrabold leading-tight tracking-[-0.035em] sm:text-[32px]">
              Let’s set up your hostel identity
            </h1>
            <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
              This keeps pools local to your block and makes settlements one scan away.
            </p>
          </div>

          <div className="mb-5">
            <div className="mb-2 flex items-center justify-between text-[11px] font-bold text-muted-foreground">
              <span>
                Step {step + 1} of {STEPS.length} · {currentStep.title}
              </span>
              <span className="text-primary">{Math.round(((step + 1) / STEPS.length) * 100)}%</span>
            </div>
            <Progress value={((step + 1) / STEPS.length) * 100} />
            <div className="mt-3 flex items-center gap-1.5">
              {STEPS.map((item, index) => (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => {
                    if (index < step) {
                      setStep(index);
                      setErrors({});
                    }
                  }}
                  disabled={index > step}
                  className={cn(
                    'h-1.5 flex-1 rounded-full transition-colors',
                    index <= step ? 'bg-primary' : 'bg-stone-200',
                  )}
                  aria-label={`Step ${index + 1}: ${item.title}`}
                />
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate className="surface p-5 sm:p-7">
            <div className="flex items-start gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary-deep">
                <StepIcon className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-extrabold tracking-[-0.02em]">{currentStep.title}</h2>
                <p className="text-[12px] text-muted-foreground">{currentStep.caption}</p>
              </div>
            </div>

            <div key={step} className="mt-6 animate-fade-up">
              {step === 0 ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="full-name">Full name</Label>
                    <Input
                      id="full-name"
                      className="mt-2"
                      placeholder="e.g. Aarav Sharma"
                      autoComplete="name"
                      value={fullName}
                      onChange={(event) => {
                        setFullName(event.target.value);
                        setErrors((current) => ({ ...current, full_name: undefined }));
                      }}
                      aria-invalid={Boolean(errors.full_name)}
                    />
                    {errors.full_name ? (
                      <FieldError>{errors.full_name}</FieldError>
                    ) : (
                      <p className="mt-1.5 text-[11px] text-muted-foreground">
                        Use the name your batchmates will recognise in a pool.
                      </p>
                    )}
                  </div>
                  <div className="rounded-xl border border-border bg-secondary/50 px-3.5 py-3">
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
                      College email · verified
                    </p>
                    <p className="mt-1 break-all text-[13px] font-bold">{user?.email}</p>
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone number</Label>
                    <Input
                      id="phone"
                      className="mt-2"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      maxLength={10}
                      placeholder="10-digit mobile number"
                      value={phone}
                      onChange={(event) => {
                        setPhone(event.target.value);
                        setErrors((current) => ({ ...current, phone: undefined }));
                      }}
                      aria-invalid={Boolean(errors.phone)}
                    />
                    {errors.phone ? (
                      <FieldError>{errors.phone}</FieldError>
                    ) : (
                      <p className="mt-1.5 text-[11px] text-muted-foreground">
                        Shown to the other side when you claim gear or join a pool.
                      </p>
                    )}
                  </div>
                </div>
              ) : null}

              {step === 1 ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="hostel">Hostel</Label>
                    <Select
                      value={hostel || undefined}
                      onValueChange={(value) => {
                        setHostel(value);
                        setErrors((current) => ({ ...current, hostel: undefined }));
                      }}
                    >
                      <SelectTrigger id="hostel" className="mt-2" aria-invalid={Boolean(errors.hostel)}>
                        <SelectValue placeholder="Pick your hostel" />
                      </SelectTrigger>
                      <SelectContent>
                        {HOSTELS.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            <span className="font-bold">{item.short}</span>
                            <span className="ml-2 text-muted-foreground">{item.label}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.hostel ? <FieldError>{errors.hostel}</FieldError> : null}
                  </div>

                  <div>
                    <Label htmlFor="wing">Floor</Label>
                    <Input
                      id="wing"
                      className="mt-2"
                      placeholder="e.g. Floor 3"
                      value={wing}
                      onChange={(event) => {
                        setWing(event.target.value);
                        setErrors((current) => ({ ...current, wing: undefined }));
                      }}
                      aria-invalid={Boolean(errors.wing)}
                    />
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {FLOOR_SUGGESTIONS.map((floor) => (
                        <button
                          key={floor}
                          type="button"
                          onClick={() => {
                            setWing(floor);
                            setErrors((current) => ({ ...current, wing: undefined }));
                          }}
                          className={cn(
                            'rounded-full border px-2.5 py-1 text-[10.5px] font-semibold transition-colors',
                            wing === floor
                              ? 'border-primary bg-primary-soft text-primary-deep'
                              : 'border-border bg-card text-muted-foreground hover:bg-secondary',
                          )}
                        >
                          {floor}
                        </button>
                      ))}
                    </div>
                    {errors.wing ? <FieldError>{errors.wing}</FieldError> : null}
                  </div>

                  <div>
                    <Label htmlFor="room">Room number</Label>
                    <Input
                      id="room"
                      className="mt-2"
                      inputMode="numeric"
                      maxLength={8}
                      placeholder="e.g. 312"
                      value={room}
                      onChange={(event) => {
                        setRoom(event.target.value);
                        setErrors((current) => ({ ...current, room: undefined }));
                      }}
                      aria-invalid={Boolean(errors.room)}
                    />
                    {errors.room ? (
                      <FieldError>{errors.room}</FieldError>
                    ) : (
                      <p className="mt-1.5 text-[11px] text-muted-foreground">
                        Used by verified students for hostel handoffs.
                      </p>
                    )}
                  </div>
                </div>
              ) : null}

              {step === 2 ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="upi">UPI ID</Label>
                    <Input
                      id="upi"
                      className="mt-2"
                      placeholder="yourname@okhdfcbank"
                      autoCapitalize="none"
                      autoComplete="off"
                      spellCheck={false}
                      value={upi}
                      onChange={(event) => {
                        setUpi(event.target.value);
                        setErrors((current) => ({ ...current, upi_id: undefined }));
                      }}
                      aria-invalid={Boolean(errors.upi_id)}
                    />
                    {errors.upi_id ? (
                      <FieldError>{errors.upi_id}</FieldError>
                    ) : (
                      <p className="mt-1.5 text-[11px] text-muted-foreground">
                        Used to build a UPI QR and pay link for your settlements. No card details,
                        ever.
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-4 rounded-2xl border border-border bg-secondary/40 p-4">
                    <div className="grid h-[92px] w-[92px] shrink-0 place-items-center rounded-xl border border-border bg-white p-2">
                      {upiValid ? (
                        <QRCodeSVG value={upiUri} size={76} level="M" bgColor="#ffffff" fgColor="#1c1917" />
                      ) : (
                        <QrCode className="h-9 w-9 text-stone-300" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-muted-foreground">
                        Settlement preview
                      </p>
                      <p className="mt-1 truncate text-sm font-bold">
                        {upiValid ? upi.trim() : 'Scan-ready UPI QR'}
                      </p>
                      <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                        {upiValid
                          ? 'Looks good. Pool-mates can scan and pay you directly.'
                          : 'Your QR appears here once your UPI ID is valid.'}
                      </p>
                      {upiValid ? (
                        <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-bold text-primary-deep">
                          <Check className="h-3 w-3" /> Ready to receive
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border bg-card p-3.5">
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
                      Quick check
                    </p>
                    <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5 text-[12px]">
                      <div className="min-w-0">
                        <dt className="text-muted-foreground">Name</dt>
                        <dd className="truncate font-bold">{fullName || '—'}</dd>
                      </div>
                      <div className="min-w-0">
                        <dt className="text-muted-foreground">Hostel</dt>
                        <dd className="truncate font-bold">
                          {hostel ? `${hostel}${room ? ` · ${room}` : ''}` : '—'}
                        </dd>
                      </div>
                      <div className="min-w-0">
                        <dt className="text-muted-foreground">Phone</dt>
                        <dd className="truncate font-bold">{phone ? normalizePhone(phone) : '—'}</dd>
                      </div>
                      <div className="min-w-0">
                        <dt className="text-muted-foreground">Floor</dt>
                        <dd className="truncate font-bold">{wing || '—'}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="mt-7 flex items-center gap-2">
              {step > 0 ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setStep((value) => Math.max(0, value - 1));
                    setErrors({});
                  }}
                  disabled={submitting}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              ) : (
                <span className="text-[11px] text-muted-foreground">Takes under a minute.</span>
              )}
              <Button type="submit" className="ml-auto min-w-[132px]" disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {submitting ? 'Saving…' : step === STEPS.length - 1 ? 'Start saving' : 'Continue'}
                {!submitting ? <ArrowRight className="h-4 w-4" /> : null}
              </Button>
            </div>
          </form>

          <p className="mt-4 text-center text-[11px] leading-relaxed text-muted-foreground">
            Verified BIT Patna students can see it to settle up directly. FareBuddy never holds money.
          </p>
        </div>
      </main>
    </div>
  );
}

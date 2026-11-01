import * as React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  LogIn,
  Mail,
  MailCheck,
  ShieldCheck,
  Sparkles,
  UserPlus,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth-context';
import { AuthLayout } from '@/components/auth/auth-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DEMO_ACCOUNTS } from '@/lib/constants';
import {
  normalizeEmail,
  validatePassword,
  validateStudentEmail,
} from '@/lib/validation';
import { cn } from '@/lib/utils';

type AuthMode = 'login' | 'signup';
type AuthMethod = 'password' | 'magic';
type VerifyState = { type: 'magic' | 'signup'; email: string } | null;

function FieldError({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-1.5 flex items-start gap-1.5 text-[11.5px] font-semibold leading-snug text-destructive">
      <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" />
      {children}
    </p>
  );
}

export function AuthPage({ mode }: { mode: AuthMode }) {
  const { signIn, signUp, sendMagicLink, isDemo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state as { from?: string } | null)?.from ?? '/';

  const [method, setMethod] = React.useState<AuthMethod>('password');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [errors, setErrors] = React.useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [demoBusy, setDemoBusy] = React.useState<string | null>(null);
  const [verify, setVerify] = React.useState<VerifyState>(null);

  const isSignup = mode === 'signup';

  const resetMessages = () => {
    setErrors({});
    setFormError(null);
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setErrors((current) => ({ ...current, email: undefined }));
    setFormError(null);
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setErrors((current) => ({ ...current, password: undefined }));
    setFormError(null);
  };

  const validate = () => {
    const nextErrors: { email?: string; password?: string } = {};
    const emailError = validateStudentEmail(email);
    if (emailError) nextErrors.email = emailError;
    if (method === 'password') {
      if (isSignup) {
        const passwordError = validatePassword(password);
        if (passwordError) nextErrors.password = passwordError;
      } else if (!password) {
        nextErrors.password = 'Enter your password';
      }
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    resetMessages();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const normalized = normalizeEmail(email);

      if (method === 'magic') {
        const result = await sendMagicLink(normalized);
        if (result.needsEmailConfirmation) {
          setVerify({ type: 'magic', email: normalized });
          toast.success('Magic link sent — check your inbox');
          return;
        }
        toast.success('Signed in with magic link', {
          description: isDemo ? 'Demo mode signed you in instantly.' : undefined,
        });
        navigate(result.isNewAccount ? '/onboarding' : redirectTo, { replace: true });
        return;
      }

      if (isSignup) {
        const result = await signUp(normalized, password);
        if (result.needsEmailConfirmation) {
          setVerify({ type: 'signup', email: normalized });
          toast.success('Account created — confirm your email to continue');
          return;
        }
        toast.success('Student account created', {
          description: 'One quick setup step and you’re in.',
        });
        navigate(result.isNewAccount ? '/onboarding' : redirectTo, { replace: true });
        return;
      }

      await signIn(normalized, password);
      toast.success('Welcome back to campus');
      navigate(redirectTo, { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong. Try again.';
      setFormError(message);
      if (message.toLowerCase().includes('student id')) {
        setErrors((current) => ({ ...current, email: message }));
      }
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!verify) return;
    setSubmitting(true);
    try {
      if (verify.type === 'signup') {
        await signUp(verify.email, password);
      } else {
        await sendMagicLink(verify.email);
      }
      toast.success('Sent again — check your inbox');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not resend right now.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoLogin = async (account: keyof typeof DEMO_ACCOUNTS) => {
    setDemoBusy(account);
    setFormError(null);
    try {
      const credentials = DEMO_ACCOUNTS[account];
      await signIn(credentials.email, credentials.password);
      toast.success(`Signed in as ${credentials.name}`, {
        description: 'Use Demo tools to switch students anytime.',
      });
      navigate(redirectTo, { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not enter demo mode.';
      setFormError(message);
      toast.error(message);
    } finally {
      setDemoBusy(null);
    }
  };

  if (verify) {
    return (
      <AuthLayout>
        <div className="surface p-6 text-center sm:p-8">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-primary-soft text-primary-deep">
            <MailCheck className="h-8 w-8" />
          </div>
          <h1 className="mt-5 text-[26px] font-extrabold tracking-[-0.03em]">
            {verify.type === 'signup' ? 'Confirm your email' : 'Check your inbox'}
          </h1>
          <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
            We sent {verify.type === 'signup' ? 'a confirmation link' : 'a magic sign-in link'} to
          </p>
          <p className="mt-1 break-all text-sm font-bold">{verify.email}</p>
          <div className="mt-5 rounded-xl bg-secondary/70 px-4 py-3 text-left text-[12px] leading-relaxed text-muted-foreground">
            <span className="font-semibold text-foreground">One campus, one inbox.</span> Open the
            link on this device. It expires in about an hour — check spam if it hides.
          </div>
          <Button className="mt-6 w-full" onClick={handleResend} disabled={submitting}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {submitting ? 'Sending…' : 'Resend email'}
          </Button>
          <Button
            variant="ghost"
            className="mt-2 w-full"
            onClick={() => {
              setVerify(null);
              setMethod('password');
            }}
          >
            Use another sign-in method
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="surface overflow-hidden">
        <div className="border-b border-border/70 bg-gradient-to-br from-primary-soft/70 via-card to-card px-5 pb-5 pt-6 sm:px-7">
          <div className="mb-4 flex items-center justify-between">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-[0_10px_20px_-10px_hsl(160_84%_30%_/_0.8)]">
              {isSignup ? <UserPlus className="h-5 w-5" /> : <LogIn className="h-5 w-5" />}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-card/80 px-2.5 py-1 text-[10px] font-bold text-primary-deep">
              <ShieldCheck className="h-3 w-3" />
              Student-only
            </span>
          </div>
          <h1 className="text-[26px] font-extrabold leading-tight tracking-[-0.03em]">
            {isSignup ? 'Create your campus account' : 'Welcome back'}
          </h1>
          <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
            {isSignup
              ? 'Use your BIT Patna email so only your batchmates get in.'
              : 'Sign in to join pools, split rides, and save with your hostel.'}
          </p>
        </div>

        <div className="p-5 sm:p-7">
          {/* Quick link to Stitch Campus Hub & Sandbox */}
          <div className="mb-5 flex flex-wrap items-center justify-between gap-2.5 rounded-2xl border border-emerald-500/20 bg-emerald-50/70 p-3 text-emerald-950">
            <div className="flex items-center gap-2 text-[12px] font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600"></span>
              </span>
              <span>BIT Patna Hub &amp; Live DDL Architecture</span>
            </div>
            <Link
              to="/hub-preview"
              className="inline-flex items-center gap-1 rounded-full bg-emerald-700 px-3 py-1 font-mono text-[11px] font-bold text-white shadow-xs transition-colors hover:bg-emerald-800"
            >
              Explore Hub <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <Tabs value={method} onValueChange={(value) => setMethod(value as AuthMethod)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="password">
                <Lock className="h-3.5 w-3.5" />
                Password
              </TabsTrigger>
              <TabsTrigger value="magic">
                <Sparkles className="h-3.5 w-3.5" />
                Magic link
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-4">
            <div>
              <Label htmlFor="email">College email</Label>
              <div className="relative mt-2">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  spellCheck={false}
                  placeholder="btech15001.24@bitmesra.ac.in"
                  className="pl-10"
                  value={email}
                  onChange={(event) => handleEmailChange(event.target.value)}
                  onBlur={() => {
                    if (!email) return;
                    const message = validateStudentEmail(email);
                    if (message) setErrors((current) => ({ ...current, email: message }));
                  }}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby="email-help"
                />
              </div>
              {errors.email ? (
                <FieldError>{errors.email}</FieldError>
              ) : (
                <p id="email-help" className="mt-1.5 text-[11px] text-muted-foreground">
                  Format: <span className="font-semibold">btech15XXX.YY@bitmesra.ac.in</span>
                </p>
              )}
            </div>

            {method === 'password' ? (
              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  {!isSignup ? (
                    <button
                      type="button"
                      onClick={() => setMethod('magic')}
                      className="text-[11px] font-bold text-primary hover:underline"
                    >
                      Forgot password?
                    </button>
                  ) : null}
                </div>
                <div className="relative mt-2">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={isSignup ? 'new-password' : 'current-password'}
                    placeholder={isSignup ? 'At least 8 characters' : 'Your password'}
                    className="pl-10 pr-11"
                    value={password}
                    onChange={(event) => handlePasswordChange(event.target.value)}
                    aria-invalid={Boolean(errors.password)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground hover:bg-secondary"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password ? (
                  <FieldError>{errors.password}</FieldError>
                ) : (
                  <p className="mt-1.5 text-[11px] text-muted-foreground">
                    {isSignup ? '8+ characters. Keep it campus-friendly.' : 'Use the password you signed up with.'}
                  </p>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-primary/25 bg-primary-soft/40 px-3.5 py-3 text-[12px] leading-relaxed text-primary-deep">
                <span className="font-bold">No password needed.</span> We’ll email you a secure
                one-tap sign-in link{isDemo ? ' — instantly in demo mode.' : '.'}
              </div>
            )}

            {formError ? (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/5 px-3.5 py-3 text-[12px] font-semibold leading-relaxed text-destructive"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {formError}
              </div>
            ) : null}

            <Button type="submit" size="lg" className="w-full" disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {submitting
                ? method === 'magic'
                  ? 'Sending link…'
                  : isSignup
                    ? 'Creating account…'
                    : 'Signing in…'
                : method === 'magic'
                  ? 'Email me a magic link'
                  : isSignup
                    ? 'Create my account'
                    : 'Sign in'}
              {!submitting ? <ArrowRight className="h-4 w-4" /> : null}
            </Button>
          </form>

          {isDemo && !isSignup && method === 'password' ? (
            <div className="mt-5 rounded-2xl border border-dashed border-primary/30 bg-primary-soft/40 p-3.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-primary-deep">
                  Demo access
                </p>
                <span className="rounded-full bg-card px-2 py-0.5 text-[10px] font-bold text-primary-deep">
                  Local · no login needed
                </span>
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-primary-deep/80">
                No Supabase keys detected. Jump in as a seeded hosteller — data stays in this
                browser.
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 bg-card text-[12px]"
                  onClick={() => handleDemoLogin('student1')}
                  disabled={Boolean(demoBusy)}
                >
                  {demoBusy === 'student1' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                  Aarav · BH-2
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 bg-card text-[12px]"
                  onClick={() => handleDemoLogin('student2')}
                  disabled={Boolean(demoBusy)}
                >
                  {demoBusy === 'student2' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                  Riya · GH
                </Button>
              </div>
            </div>
          ) : null}

          <div className="mt-5 border-t border-border/80 pt-4 text-center text-[12px] text-muted-foreground">
            {isSignup ? (
              <>
                Already have an account?{' '}
                <Link to="/login" className="font-bold text-primary hover:underline">
                  Sign in
                </Link>
              </>
            ) : (
              <>
                New to FareBuddy?{' '}
                <Link to="/signup" className="font-bold text-primary hover:underline">
                  Create your account
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      <div className={cn('mt-4 flex items-center justify-center gap-1.5 text-[10.5px] font-semibold text-muted-foreground')}>
        <ShieldCheck className="h-3.5 w-3.5 text-primary" />
        Student IDs are re-checked by the database — no workarounds.
      </div>
    </AuthLayout>
  );
}

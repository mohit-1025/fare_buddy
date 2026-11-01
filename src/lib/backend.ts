import {
  loadDemoDatabase,
  resetDemoDatabase,
  saveDemoDatabase,
  setDemoSessionUserId,
  getDemoSessionUserId,
  subscribeDemoEvents,
  notifyDemoAuthChanged,
} from './demo-store';
import { DEMO_PROFILE_IDS } from './demo-seed';
import { isDemoMode, supabase } from './supabase';
import { STUDENT_EMAIL_RE, UPI_RE, normalizeEmail, validatePassword } from './validation';
import type { OnboardingPayload, Profile } from './types';

export interface SessionUser {
  id: string;
  email: string;
}

export interface AuthActionResult {
  user: SessionUser | null;
  needsEmailConfirmation: boolean;
  isNewAccount?: boolean;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function requireSupabase() {
  if (!supabase) {
    throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }
  return supabase;
}

function friendlyAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('invalid login credentials')) return 'Incorrect email or password.';
  if (lower.includes('email not confirmed')) return 'Confirm your email first — check your inbox.';
  if (lower.includes('rate limit') || lower.includes('too many')) {
    return 'Too many attempts. Wait a minute and try again.';
  }
  if (lower.includes('user already registered')) return 'This email is already registered. Sign in instead.';
  if (lower.includes('student id') || lower.includes('database error')) {
    return 'Registration restricted to valid BIT Patna student IDs';
  }
  return message;
}

function assertStudentEmail(email: string) {
  if (!STUDENT_EMAIL_RE.test(normalizeEmail(email))) {
    throw new Error('Registration restricted to valid BIT Patna student IDs');
  }
}

const emptyProfile = (id: string, email: string): Profile => ({
  id,
  email,
  full_name: null,
  hostel: null,
  wing: null,
  room: null,
  upi_id: null,
  created_at: new Date().toISOString(),
});

export const isDemoBackend = isDemoMode;

export const backend = {
  isDemo: isDemoMode,

  auth: {
    async getSession(): Promise<SessionUser | null> {
      if (isDemoMode) {
        const db = loadDemoDatabase();
        const userId = getDemoSessionUserId();
        const user = db.users.find((candidate) => candidate.id === userId);
        const profile = db.profiles.find((candidate) => candidate.id === userId);
        if (!user) return null;
        return { id: user.id, email: profile?.email ?? user.email };
      }

      const client = requireSupabase();
      const { data, error } = await client.auth.getSession();
      if (error) throw new Error(error.message);
      const user = data.session?.user;
      return user ? { id: user.id, email: user.email ?? '' } : null;
    },

    async signIn(email: string, password: string): Promise<AuthActionResult> {
      const normalized = normalizeEmail(email);

      if (isDemoMode) {
        await sleep(350);
        const db = loadDemoDatabase();
        const user = db.users.find((candidate) => candidate.email === normalized);
        if (!user) {
          throw new Error('No FareBuddy account for this email yet. Create one first.');
        }
        if (user.password !== password) {
          throw new Error('Incorrect password. Try your BIT Patna onboarding password.');
        }
        setDemoSessionUserId(user.id);
        return { user: { id: user.id, email: user.email }, needsEmailConfirmation: false };
      }

      const client = requireSupabase();
      const { data, error } = await client.auth.signInWithPassword({
        email: normalized,
        password,
      });
      if (error) throw new Error(friendlyAuthError(error.message));
      return {
        user: data.user ? { id: data.user.id, email: data.user.email ?? normalized } : null,
        needsEmailConfirmation: false,
      };
    },

    async signUp(email: string, password: string): Promise<AuthActionResult> {
      const normalized = normalizeEmail(email);
      assertStudentEmail(normalized);
      const passwordError = validatePassword(password);
      if (passwordError) throw new Error(passwordError);

      if (isDemoMode) {
        await sleep(450);
        const db = loadDemoDatabase();
        if (db.users.some((candidate) => candidate.email === normalized)) {
          throw new Error('This email is already registered. Sign in instead.');
        }
        const id = crypto.randomUUID();
        db.users.push({
          id,
          email: normalized,
          password,
          created_at: new Date().toISOString(),
        });
        db.profiles.push(emptyProfile(id, normalized));
        saveDemoDatabase(db);
        setDemoSessionUserId(id);
        return {
          user: { id, email: normalized },
          needsEmailConfirmation: false,
          isNewAccount: true,
        };
      }

      const client = requireSupabase();
      const { data, error } = await client.auth.signUp({
        email: normalized,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}${import.meta.env.BASE_URL}`,
        },
      });
      if (error) throw new Error(friendlyAuthError(error.message));
      return {
        user: data.session?.user
          ? { id: data.session.user.id, email: data.session.user.email ?? normalized }
          : null,
        needsEmailConfirmation: !data.session,
        isNewAccount: Boolean(data.user && !data.session),
      };
    },

    async sendMagicLink(email: string): Promise<AuthActionResult> {
      const normalized = normalizeEmail(email);
      assertStudentEmail(normalized);

      if (isDemoMode) {
        await sleep(450);
        const db = loadDemoDatabase();
        const existing = db.users.find((candidate) => candidate.email === normalized);
        if (existing) {
          setDemoSessionUserId(existing.id);
          return {
            user: { id: existing.id, email: existing.email },
            needsEmailConfirmation: false,
          };
        }
        const id = crypto.randomUUID();
        db.users.push({
          id,
          email: normalized,
          password: '',
          created_at: new Date().toISOString(),
        });
        db.profiles.push(emptyProfile(id, normalized));
        saveDemoDatabase(db);
        setDemoSessionUserId(id);
        return {
          user: { id, email: normalized },
          needsEmailConfirmation: false,
          isNewAccount: true,
        };
      }

      const client = requireSupabase();
      const { error } = await client.auth.signInWithOtp({
        email: normalized,
        options: {
          emailRedirectTo: `${window.location.origin}${import.meta.env.BASE_URL}`,
          shouldCreateUser: true,
        },
      });
      if (error) throw new Error(friendlyAuthError(error.message));
      return { user: null, needsEmailConfirmation: true };
    },

    async signOut(): Promise<void> {
      if (isDemoMode) {
        setDemoSessionUserId(null);
        return;
      }
      const client = requireSupabase();
      const { error } = await client.auth.signOut();
      if (error) throw new Error(error.message);
    },

    onChange(callback: (user: SessionUser | null) => void): () => void {
      if (isDemoMode) {
        return subscribeDemoEvents(() => {
          const db = loadDemoDatabase();
          const userId = getDemoSessionUserId();
          const user = db.users.find((candidate) => candidate.id === userId);
          const profile = db.profiles.find((candidate) => candidate.id === userId);
          callback(user ? { id: user.id, email: profile?.email ?? user.email } : null);
        });
      }
      const client = requireSupabase();
      const { data } = client.auth.onAuthStateChange((_event, session) => {
        const user = session?.user;
        callback(user ? { id: user.id, email: user.email ?? '' } : null);
      });
      return () => data.subscription.unsubscribe();
    },
  },

  profiles: {
    async get(userId: string): Promise<Profile | null> {
      if (isDemoMode) {
        const db = loadDemoDatabase();
        return db.profiles.find((profile) => profile.id === userId) ?? null;
      }
      const client = requireSupabase();
      const { data, error } = await client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return (data as Profile | null) ?? null;
    },

    async save(userId: string, email: string, payload: OnboardingPayload): Promise<Profile> {
      if (!UPI_RE.test(payload.upi_id.trim())) {
        throw new Error('That UPI ID doesn’t look right (e.g. name@okhdfcbank)');
      }

      if (isDemoMode) {
        const db = loadDemoDatabase();
        const index = db.profiles.findIndex((profile) => profile.id === userId);
        const next: Profile =
          index >= 0
            ? { ...db.profiles[index], email, ...payload }
            : { ...emptyProfile(userId, email), ...payload };
        if (index >= 0) {
          db.profiles[index] = next;
        } else {
          db.profiles.push(next);
        }
        saveDemoDatabase(db);
        notifyDemoAuthChanged();
        return next;
      }

      const client = requireSupabase();
      const { data, error } = await client
        .from('profiles')
        .upsert(
          {
            id: userId,
            email,
            full_name: payload.full_name,
            hostel: payload.hostel,
            wing: payload.wing,
            room: payload.room,
            upi_id: payload.upi_id.trim(),
          },
          { onConflict: 'id' },
        )
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as Profile;
    },
  },

  demo: {
    async seed(keepUserId?: string | null): Promise<void> {
      if (!isDemoMode) {
        throw new Error('Seed data is only available in local demo mode.');
      }
      await sleep(500);
      const previous = keepUserId ?? getDemoSessionUserId();
      const db = resetDemoDatabase();
      const activeId = db.users.some((user) => user.id === previous)
        ? previous
        : DEMO_PROFILE_IDS.aarav;
      setDemoSessionUserId(activeId);
      notifyDemoAuthChanged();
    },

    async listProfiles(): Promise<Profile[]> {
      if (!isDemoMode) return [];
      const db = loadDemoDatabase();
      return [...db.profiles].sort((a, b) => (a.full_name ?? '').localeCompare(b.full_name ?? ''));
    },

    async actAs(userId: string): Promise<void> {
      if (!isDemoMode) {
        throw new Error('Acting as another student requires local demo mode.');
      }
      const db = loadDemoDatabase();
      const user = db.users.find((candidate) => candidate.id === userId);
      if (!user) throw new Error('That demo student does not exist. Re-seed demo data.');
      setDemoSessionUserId(user.id);
    },
  },
};

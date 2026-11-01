import * as React from 'react';
import { toast } from 'sonner';
import {
  backend,
  type AuthActionResult,
  type SessionUser,
} from '@/lib/backend';
import type { OnboardingPayload, Profile } from '@/lib/types';

interface AuthContextValue {
  user: SessionUser | null;
  profile: Profile | null;
  loading: boolean;
  isDemo: boolean;
  onboardingComplete: boolean;
  signIn: (email: string, password: string) => Promise<AuthActionResult>;
  signUp: (email: string, password: string) => Promise<AuthActionResult>;
  sendMagicLink: (email: string) => Promise<AuthActionResult>;
  signOut: () => Promise<void>;
  completeOnboarding: (payload: OnboardingPayload) => Promise<Profile>;
  refresh: () => Promise<void>;
  actAs: (userId: string) => Promise<void>;
  seedDemoData: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function isProfileComplete(profile: Profile | null | undefined) {
  return Boolean(profile?.full_name && profile.hostel && profile.wing && profile.upi_id);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<SessionUser | null>(null);
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let active = true;

    const loadFor = async (sessionUser: SessionUser | null) => {
      if (!sessionUser) {
        if (active) {
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
        return;
      }
      try {
        const nextProfile = await backend.profiles.get(sessionUser.id);
        if (active) {
          setUser(sessionUser);
          setProfile(nextProfile);
          setLoading(false);
        }
      } catch (error) {
        if (active) {
          setUser(sessionUser);
          setProfile(null);
          setLoading(false);
          toast.error(error instanceof Error ? error.message : 'Could not load your profile');
        }
      }
    };

    const boot = async () => {
      try {
        const session = await backend.auth.getSession();
        await loadFor(session);
      } catch (error) {
        if (active) {
          setLoading(false);
          toast.error(error instanceof Error ? error.message : 'Could not restore your session');
        }
      }
    };

    void boot();

    const unsubscribe = backend.auth.onChange((sessionUser) => {
      void loadFor(sessionUser);
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const applyResult = React.useCallback(async (result: AuthActionResult) => {
    if (result.user) {
      const nextProfile = await backend.profiles.get(result.user.id);
      setUser(result.user);
      setProfile(nextProfile);
      setLoading(false);
    }
    return result;
  }, []);

  const signIn = React.useCallback(
    async (email: string, password: string) => applyResult(await backend.auth.signIn(email, password)),
    [applyResult],
  );

  const signUp = React.useCallback(
    async (email: string, password: string) => applyResult(await backend.auth.signUp(email, password)),
    [applyResult],
  );

  const sendMagicLink = React.useCallback(
    async (email: string) => applyResult(await backend.auth.sendMagicLink(email)),
    [applyResult],
  );

  const signOut = React.useCallback(async () => {
    await backend.auth.signOut();
    setUser(null);
    setProfile(null);
  }, []);

  const completeOnboarding = React.useCallback(
    async (payload: OnboardingPayload) => {
      if (!user) throw new Error('Your session expired. Sign in again.');
      const nextProfile = await backend.profiles.save(user.id, user.email, payload);
      setProfile(nextProfile);
      return nextProfile;
    },
    [user],
  );

  const refresh = React.useCallback(async () => {
    const session = await backend.auth.getSession();
    if (!session) {
      setUser(null);
      setProfile(null);
      return;
    }
    const nextProfile = await backend.profiles.get(session.id);
    setUser(session);
    setProfile(nextProfile);
  }, []);

  const actAs = React.useCallback(async (userId: string) => {
    await backend.demo.actAs(userId);
    const session = await backend.auth.getSession();
    if (!session) throw new Error('Could not switch demo student.');
    const nextProfile = await backend.profiles.get(session.id);
    setUser(session);
    setProfile(nextProfile);
  }, []);

  const seedDemoData = React.useCallback(async () => {
    await backend.demo.seed(user?.id);
    await refresh();
  }, [refresh, user?.id]);

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      loading,
      isDemo: backend.isDemo,
      onboardingComplete: isProfileComplete(profile),
      signIn,
      signUp,
      sendMagicLink,
      signOut,
      completeOnboarding,
      refresh,
      actAs,
      seedDemoData,
    }),
    [
      user,
      profile,
      loading,
      signIn,
      signUp,
      sendMagicLink,
      signOut,
      completeOnboarding,
      refresh,
      actAs,
      seedDemoData,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}

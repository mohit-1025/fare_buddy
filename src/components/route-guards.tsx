import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth-context';
import { FullScreenLoader } from '@/components/full-screen-loader';

export function PublicOnlyRoute() {
  const { user, loading, onboardingComplete } = useAuth();
  if (loading) return <FullScreenLoader label="Checking your session…" />;
  if (user) return <Navigate to={onboardingComplete ? '/cart' : '/onboarding'} replace />;
  return <Outlet />;
}

export function OnboardingRoute() {
  const { user, loading, onboardingComplete } = useAuth();
  if (loading) return <FullScreenLoader label="Loading your profile…" />;
  if (!user) return <Navigate to="/login" state={{ from: '/onboarding' }} replace />;
  if (onboardingComplete) return <Navigate to="/cart" replace />;
  return <Outlet />;
}

export function ProtectedRoute() {
  const { user, loading, onboardingComplete } = useAuth();
  const location = useLocation();
  if (loading) return <FullScreenLoader />;
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  if (!onboardingComplete) return <Navigate to="/onboarding" replace />;
  return <Outlet />;
}

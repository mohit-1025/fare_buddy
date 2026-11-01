import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/layout/app-shell';
import { ProtectedRoute, PublicOnlyRoute, OnboardingRoute } from '@/components/route-guards';
import { AuthPage } from '@/pages/auth/auth-page';
import { OnboardingPage } from '@/pages/onboarding/onboarding-page';
import { CartPoolPage } from '@/pages/cart/cart-pool-page';
import { RidePoolPage } from '@/pages/ride/ride-pool-page';
import { GearBazaarPage } from '@/pages/gear/gear-bazaar-page';
import { RequestsPage } from '@/pages/requests/requests-page';
import { ImpactPage } from '@/pages/impact/impact-page';
import { SettingsPage } from '@/pages/settings/settings-page';
import { CampusHubPage } from '@/pages/hub/campus-hub-page';
import { NotFoundPage } from '@/pages/not-found-page';

export default function App() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<AuthPage key="login" mode="login" />} />
        <Route path="/signup" element={<AuthPage key="signup" mode="signup" />} />
      </Route>

      <Route element={<OnboardingRoute />}>
        <Route path="/onboarding" element={<OnboardingPage />} />
      </Route>

      {/* Direct preview of Stitch Campus Hub and Architecture */}
      <Route path="/hub-preview" element={<CampusHubPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/" element={<Navigate to="/cart" replace />} />
          <Route path="/cart" element={<CartPoolPage />} />
          <Route path="/ride" element={<RidePoolPage />} />
          <Route path="/gear" element={<GearBazaarPage />} />
          <Route path="/requests" element={<RequestsPage />} />
          <Route path="/hub" element={<CampusHubPage />} />
          <Route path="/impact" element={<ImpactPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

import * as React from 'react';
import { loadDemoDatabase, subscribeDemoEvents } from '@/lib/demo-store';
import { computeSavings } from '@/lib/savings';
import type { SavingsBreakdown } from '@/lib/types';
import { useAuth } from '@/contexts/auth-context';

const EMPTY_SAVINGS: SavingsBreakdown = { pooledOrders: 0, rides: 0, gear: 0, total: 0 };

export function useSavings() {
  const { user, isDemo } = useAuth();
  const [savings, setSavings] = React.useState<SavingsBreakdown>(EMPTY_SAVINGS);

  const refresh = React.useCallback(() => {
    if (!user) {
      setSavings(EMPTY_SAVINGS);
      return;
    }
    if (isDemo) {
      const db = loadDemoDatabase();
      setSavings(computeSavings(db, user.id));
      return;
    }
    setSavings(EMPTY_SAVINGS);
  }, [isDemo, user]);

  React.useEffect(() => {
    refresh();
    if (!isDemo) return;
    return subscribeDemoEvents(refresh);
  }, [isDemo, refresh]);

  return savings;
}

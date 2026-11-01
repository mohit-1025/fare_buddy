import * as React from 'react';
import { isDemoMode } from '@/lib/supabase';

const KEY = 'farebuddy:settings:demo-tools';
const EVENT = 'farebuddy:settings-changed';

function readInitial() {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw === null) return isDemoMode;
    return raw === 'true';
  } catch {
    return isDemoMode;
  }
}

export function useDemoToolsSetting() {
  const [enabled, setEnabledState] = React.useState(readInitial);

  React.useEffect(() => {
    const sync = () => setEnabledState(readInitial());
    const storage = (event: StorageEvent) => {
      if (event.key === KEY) sync();
    };
    window.addEventListener(EVENT, sync);
    window.addEventListener('storage', storage);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener('storage', storage);
    };
  }, []);

  const setEnabled = React.useCallback((value: boolean) => {
    try {
      window.localStorage.setItem(KEY, String(value));
    } catch {
      // ignore storage failures
    }
    window.dispatchEvent(new CustomEvent(EVENT));
    setEnabledState(value);
  }, []);

  return {
    enabled: isDemoMode && enabled,
    configured: isDemoMode,
    setEnabled,
  };
}

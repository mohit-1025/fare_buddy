import { createDemoDatabase, DEMO_DB_VERSION } from './demo-seed';
import type { DemoDatabase } from './types';

const DB_KEY = 'farebuddy:demo-db:v1';
const SESSION_KEY = 'farebuddy:demo-session:v1';
export const DEMO_DATA_EVENT = 'farebuddy:demo-data';
export const DEMO_AUTH_EVENT = 'farebuddy:demo-auth';

function canUseStorage() {
  try {
    return typeof window !== 'undefined' && Boolean(window.localStorage);
  } catch {
    return false;
  }
}

/**
 * Keeps the demo lively when it is opened hours later: pushes expired open-pool
 * timers and past ride windows forward. Historical rows are left untouched.
 */
function reviveDemoWindows(db: DemoDatabase) {
  let changed = false;
  const now = Date.now();

  for (const pool of db.delivery_pools) {
    if (pool.status !== 'open') continue;
    if (new Date(pool.expires_at).getTime() <= now) {
      pool.expires_at = new Date(now + 8 * 60_000).toISOString();
      changed = true;
    }
  }

  for (const pool of db.ride_pools) {
    if (pool.status !== 'open') continue;
    if (new Date(pool.departure_end).getTime() <= now) {
      const start = new Date(pool.departure_start);
      const end = new Date(pool.departure_end);
      while (start.getTime() <= now) {
        start.setDate(start.getDate() + 1);
        end.setDate(end.getDate() + 1);
      }
      pool.departure_start = start.toISOString();
      pool.departure_end = end.toISOString();
      changed = true;
    }
  }

  return changed;
}

function persist(db: DemoDatabase) {
  try {
    window.localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch {
    // Storage can be unavailable in private mode; the in-memory copy still works.
  }
}

function readRawDatabase(): DemoDatabase | null {
  if (!canUseStorage()) return null;
  const raw = window.localStorage.getItem(DB_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as DemoDatabase;
    if (parsed.version === DEMO_DB_VERSION && Array.isArray(parsed.profiles)) {
      return parsed;
    }
  } catch {
    // fall through
  }
  return null;
}

export function loadDemoDatabase(): DemoDatabase {
  if (!canUseStorage()) return createDemoDatabase();

  const existing = readRawDatabase();
  if (existing) {
    if (reviveDemoWindows(existing)) persist(existing);
    return existing;
  }

  const db = createDemoDatabase();
  persist(db);
  return db;
}

export function saveDemoDatabase(db: DemoDatabase) {
  persist(db);
  window.dispatchEvent(new CustomEvent(DEMO_DATA_EVENT));
}

export function resetDemoDatabase(seedUserId?: string | null) {
  const existing = readRawDatabase();
  const db = createDemoDatabase();

  if (existing) {
    const seededUserIds = new Set(db.users.map((user) => user.id));
    const seededProfileIds = new Set(db.profiles.map((profile) => profile.id));
    const customUsers = existing.users.filter((user) => !seededUserIds.has(user.id));
    const customProfiles = existing.profiles.filter(
      (profile) => !seededProfileIds.has(profile.id),
    );
    db.users.push(...customUsers);
    db.profiles.push(...customProfiles);
  }

  persist(db);
  if (seedUserId && db.users.some((user) => user.id === seedUserId)) {
    setDemoSessionUserId(seedUserId);
  }
  window.dispatchEvent(new CustomEvent(DEMO_DATA_EVENT));
  return db;
}

export function getDemoSessionUserId(): string | null {
  if (!canUseStorage()) return null;
  return window.localStorage.getItem(SESSION_KEY);
}

export function setDemoSessionUserId(userId: string | null) {
  if (!canUseStorage()) return;
  if (userId) {
    window.localStorage.setItem(SESSION_KEY, userId);
  } else {
    window.localStorage.removeItem(SESSION_KEY);
  }
  window.dispatchEvent(new CustomEvent(DEMO_AUTH_EVENT));
}

export function notifyDemoAuthChanged() {
  window.dispatchEvent(new CustomEvent(DEMO_AUTH_EVENT));
}

export function subscribeDemoEvents(onChange: () => void) {
  const dataHandler = () => onChange();
  const authHandler = () => onChange();
  const storageHandler = (event: StorageEvent) => {
    if (event.key === DB_KEY || event.key === SESSION_KEY) onChange();
  };
  window.addEventListener(DEMO_DATA_EVENT, dataHandler);
  window.addEventListener(DEMO_AUTH_EVENT, authHandler);
  window.addEventListener('storage', storageHandler);
  return () => {
    window.removeEventListener(DEMO_DATA_EVENT, dataHandler);
    window.removeEventListener(DEMO_AUTH_EVENT, authHandler);
    window.removeEventListener('storage', storageHandler);
  };
}

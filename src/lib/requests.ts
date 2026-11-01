import type { Profile } from './types';

export type RequestKind = 'gear' | 'cart' | 'ride';

export interface RequestContact {
  userId: string;
  name: string;
  phone: string | null;
  hostel: string | null;
  room: string | null;
}

export interface GearRequest {
  id: string;
  kind: 'gear';
  seller: RequestContact;
  title: string;
  tag: string;
  originalPrice: number;
  price: number;
  status: 'available' | 'claimed';
  claimedBy: RequestContact | null;
  createdAt: string;
  claimedAt: string | null;
}

export interface PoolRequest {
  id: string;
  kind: 'cart' | 'ride';
  poolId: string;
  poolLabel: string;
  detail: string;
  href: string;
  host: RequestContact;
  members: RequestContact[];
  createdAt: string;
  updatedAt: string;
}

export type RequestRecord = GearRequest | PoolRequest;

const STORAGE_KEY = 'farebuddy:requests:v1';
const REQUESTS_EVENT = 'farebuddy:requests';

const nowIso = () => new Date().toISOString();
const minutesAgo = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString();
const clockIn = (minutes: number) => {
  const date = new Date(Date.now() + minutes * 60_000);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

export function contactFromProfile(profile: Profile): RequestContact {
  return {
    userId: profile.id,
    name: profile.full_name ?? 'Hosteller',
    phone: profile.phone,
    hostel: profile.hostel,
    room: profile.room,
  };
}

export const SEED_CONTACTS = {
  aarav: {
    userId: '11111111-1111-4111-8111-111111111111',
    name: 'Aarav Sharma',
    phone: '9876500001',
    hostel: 'BH-2',
    room: '312',
  },
  kabir: {
    userId: '33333333-3333-4333-8333-333333333333',
    name: 'Kabir Singh',
    phone: '9876500003',
    hostel: 'BH-1',
    room: '207',
  },
  ananya: {
    userId: '44444444-4444-4444-8444-444444444444',
    name: 'Ananya Rao',
    phone: '9876500004',
    hostel: 'GH',
    room: '218',
  },
  meera: {
    userId: '66666666-6666-4666-8666-666666666666',
    name: 'Meera Nair',
    phone: '9876500006',
    hostel: 'GH',
    room: '309',
  },
  aman: {
    userId: '99999911-9999-4999-8999-999999999911',
    name: 'Aman Raj',
    phone: '9876500011',
    hostel: 'BH-2',
    room: '214',
  },
  riyaKumari: {
    userId: '99999922-9999-4999-8999-999999999922',
    name: 'Riya Kumari',
    phone: '9876500012',
    hostel: 'GH',
    room: '108',
  },
  rohan: {
    userId: '99999933-9999-4999-8999-999999999933',
    name: 'Rohan Gupta',
    phone: '9876500013',
    hostel: 'BH-2',
    room: '207',
  },
  dev: {
    userId: '55555555-5555-4555-8555-555555555555',
    name: 'Dev Patel',
    phone: '9876500005',
    hostel: 'BH-3',
    room: '401',
  },
  kunal: {
    userId: '99999944-9999-4999-8999-999999999944',
    name: 'Kunal Singh',
    phone: '9876500014',
    hostel: 'BH-1',
    room: '311',
  },
} satisfies Record<string, RequestContact>;

function seedRidePools(): PoolRequest[] {
  return [
    {
      id: 'pool-ride-ride-seed-patna',
      kind: 'ride',
      poolId: 'ride-seed-patna',
      poolLabel: 'Ride to Patna Junction (PNBE)',
      detail: `${clockIn(45)} · Main Gate 1 Security Booth`,
      href: '/ride',
      host: SEED_CONTACTS.aman,
      members: [SEED_CONTACTS.aarav, SEED_CONTACTS.kabir],
      createdAt: minutesAgo(32),
      updatedAt: minutesAgo(12),
    },
    {
      id: 'pool-ride-ride-seed-danapur',
      kind: 'ride',
      poolId: 'ride-seed-danapur',
      poolLabel: 'Ride to Danapur Railway Station (DNR)',
      detail: `${clockIn(95)} · ICICI Gate`,
      href: '/ride',
      host: SEED_CONTACTS.riyaKumari,
      members: [SEED_CONTACTS.ananya, SEED_CONTACTS.meera, SEED_CONTACTS.rohan],
      createdAt: minutesAgo(34),
      updatedAt: minutesAgo(16),
    },
    {
      id: 'pool-ride-ride-seed-airport',
      kind: 'ride',
      poolId: 'ride-seed-airport',
      poolLabel: 'Ride to Jay Prakash Narayan Airport (PAT)',
      detail: `${clockIn(160)} · Main Gate 1`,
      href: '/ride',
      host: SEED_CONTACTS.kunal,
      members: [SEED_CONTACTS.dev],
      createdAt: minutesAgo(36),
      updatedAt: minutesAgo(18),
    },
  ];
}

function seedRequests(): RequestRecord[] {
  return [
    {
      id: 'gear-seed-mini-drafter',
      kind: 'gear',
      seller: SEED_CONTACTS.aman,
      title: 'Omega Engineering Mini-Drafter',
      tag: 'ED / Drafting',
      originalPrice: 650,
      price: 250,
      status: 'available',
      claimedBy: null,
      createdAt: minutesAgo(35),
      claimedAt: null,
    },
    {
      id: 'gear-seed-goggles',
      kind: 'gear',
      seller: SEED_CONTACTS.rohan,
      title: 'Workshop Safety Goggles & Apron Set',
      tag: 'Workshop',
      originalPrice: 380,
      price: 150,
      status: 'available',
      claimedBy: null,
      createdAt: minutesAgo(95),
      claimedAt: null,
    },
    {
      id: 'gear-seed-calculator',
      kind: 'gear',
      seller: SEED_CONTACTS.riyaKumari,
      title: 'Casio fx-991EX ClassWiz Scientific Calculator',
      tag: 'Electronics',
      originalPrice: 1250,
      price: 390,
      status: 'available',
      claimedBy: null,
      createdAt: minutesAgo(180),
      claimedAt: null,
    },
    {
      id: 'gear-seed-lab-manuals',
      kind: 'gear',
      seller: SEED_CONTACTS.aarav,
      title: 'Engineering Physics & Chemistry Lab Manual Set',
      tag: 'Lab Gear',
      originalPrice: 300,
      price: 120,
      status: 'available',
      claimedBy: null,
      createdAt: minutesAgo(300),
      claimedAt: null,
    },
    {
      id: 'pool-cart-blinkit',
      kind: 'cart',
      poolId: 'blinkit',
      poolLabel: 'Blinkit floor pool',
      detail: 'BH-2 · Floor 3',
      href: '/cart',
      host: SEED_CONTACTS.aman,
      members: [SEED_CONTACTS.aarav],
      createdAt: minutesAgo(11),
      updatedAt: minutesAgo(6),
    },
    {
      id: 'pool-cart-zepto',
      kind: 'cart',
      poolId: 'zepto',
      poolLabel: 'Zepto floor pool',
      detail: 'BH-2 · Floor 2',
      href: '/cart',
      host: SEED_CONTACTS.kabir,
      members: [SEED_CONTACTS.rohan],
      createdAt: minutesAgo(9),
      updatedAt: minutesAgo(4),
    },
    {
      id: 'pool-cart-instamart',
      kind: 'cart',
      poolId: 'instamart',
      poolLabel: 'Instamart floor pool',
      detail: 'GH · Floor 1',
      href: '/cart',
      host: SEED_CONTACTS.riyaKumari,
      members: [SEED_CONTACTS.ananya, SEED_CONTACTS.meera],
      createdAt: minutesAgo(7),
      updatedAt: minutesAgo(2),
    },
    ...seedRidePools(),
  ];
}

const byNewest = (list: RequestRecord[]) =>
  [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

function readStored(): RequestRecord[] | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as RequestRecord[]) : null;
  } catch {
    return null;
  }
}

function persist(list: RequestRecord[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // Storage can be unavailable in private mode; the in-memory copy still works.
  }
}

function emit() {
  window.dispatchEvent(new CustomEvent(REQUESTS_EVENT));
}

export function loadRequests(): RequestRecord[] {
  const stored = readStored();
  if (!stored) {
    const seeded = seedRequests();
    persist(seeded);
    return byNewest(seeded);
  }

  const missingRides = seedRidePools().filter(
    (pool) => !stored.some((record) => record.id === pool.id),
  );
  if (missingRides.length) {
    const merged = [...stored, ...missingRides];
    persist(merged);
    return byNewest(merged);
  }
  return byNewest(stored);
}

export function createGearRequest(input: {
  seller: RequestContact;
  title: string;
  tag: string;
  originalPrice: number;
  price: number;
}): GearRequest {
  const record: GearRequest = {
    id: crypto.randomUUID(),
    kind: 'gear',
    seller: input.seller,
    title: input.title,
    tag: input.tag,
    originalPrice: input.originalPrice,
    price: input.price,
    status: 'available',
    claimedBy: null,
    createdAt: nowIso(),
    claimedAt: null,
  };
  persist([record, ...loadRequests()]);
  emit();
  return record;
}

export function claimGearRequest(id: string, claimer: RequestContact): GearRequest | null {
  const list = loadRequests();
  const target = list.find((record): record is GearRequest => record.kind === 'gear' && record.id === id);
  if (!target || target.status === 'claimed' || target.seller.userId === claimer.userId) return null;

  const updated: GearRequest = {
    ...target,
    status: 'claimed',
    claimedBy: claimer,
    claimedAt: nowIso(),
  };
  persist(list.map((record) => (record.id === id ? updated : record)));
  emit();
  return updated;
}

export function recordPoolHost(input: {
  kind: 'cart' | 'ride';
  poolId: string;
  poolLabel: string;
  detail: string;
  href: string;
  host: RequestContact;
}): PoolRequest {
  const id = `pool-${input.kind}-${input.poolId}`;
  const list = loadRequests();
  const existing = list.find((record): record is PoolRequest => record.id === id);
  const timestamp = nowIso();

  const next: PoolRequest = {
    id,
    kind: input.kind,
    poolId: input.poolId,
    poolLabel: input.poolLabel,
    detail: input.detail,
    href: input.href,
    host: input.host,
    members: existing?.members ?? [],
    createdAt: existing?.createdAt ?? timestamp,
    updatedAt: timestamp,
  };
  persist(existing ? list.map((record) => (record.id === id ? next : record)) : [next, ...list]);
  emit();
  return next;
}

export function recordPoolJoin(input: {
  kind: 'cart' | 'ride';
  poolId: string;
  poolLabel: string;
  detail: string;
  href: string;
  host: RequestContact;
  member: RequestContact;
}): PoolRequest | null {
  if (input.host.userId === input.member.userId) return null;

  const id = `pool-${input.kind}-${input.poolId}`;
  const list = loadRequests();
  const existing = list.find((record): record is PoolRequest => record.id === id);
  const timestamp = nowIso();

  if (existing) {
    const alreadyJoined = existing.members.some((member) => member.userId === input.member.userId);
    const next: PoolRequest = {
      ...existing,
      poolLabel: input.poolLabel,
      detail: input.detail,
      href: input.href,
      host: input.host,
      members: alreadyJoined
        ? existing.members.map((member) =>
            member.userId === input.member.userId ? input.member : member,
          )
        : [...existing.members, input.member],
      updatedAt: timestamp,
    };
    persist(list.map((record) => (record.id === id ? next : record)));
    emit();
    return next;
  }

  const created: PoolRequest = {
    id,
    kind: input.kind,
    poolId: input.poolId,
    poolLabel: input.poolLabel,
    detail: input.detail,
    href: input.href,
    host: input.host,
    members: [input.member],
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  persist([created, ...list]);
  emit();
  return created;
}

export function subscribeRequests(onChange: () => void): () => void {
  const handler = (event: Event) => {
    if (event instanceof StorageEvent && event.key && event.key !== STORAGE_KEY) return;
    onChange();
  };
  window.addEventListener(REQUESTS_EVENT, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(REQUESTS_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}

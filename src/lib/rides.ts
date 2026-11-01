import { SEED_CONTACTS, type RequestContact } from './requests';

export interface RidePool {
  id: string;
  destination: string;
  distance: string;
  note: string;
  meetingPoint: string;
  departureTime: string;
  departureAt?: string;
  totalFare: number;
  farePerSeat: number;
  totalSeats: number;
  hostId: string;
  hostName: string;
  hostHostel: string;
  hostPhone: string;
  members: RequestContact[];
  createdAt: string;
}

export const RAILWAY_STATIONS = [
  {
    value: 'Patna Junction (PNBE)',
    distance: '11.4 km corridor',
    note: 'Catching Vande Bharat / Rajdhani Express',
  },
  {
    value: 'Danapur Railway Station (DNR)',
    distance: '14.0 km corridor',
    note: 'Evening Intercity Express departure',
  },
  {
    value: 'Rajendra Nagar Terminal (RJPB)',
    distance: '9.6 km corridor',
    note: 'Rajdhani / Sampoorna Kranti halt',
  },
] as const;

export const AIRPORTS = [
  {
    value: 'Jay Prakash Narayan Airport (PAT)',
    distance: '16.5 km corridor',
    note: 'Terminal 1 check-in before 21:00',
  },
] as const;

export const OTHER_DESTINATION = 'Other';
export const MEETING_POINTS = [
  'Main Gate 1 Security Booth',
  'Main Gate 1',
  'ICICI Gate',
  'Hostel Block Gate',
] as const;

const STORAGE_KEY = 'farebuddy:rides:v1';
const RIDES_EVENT = 'farebuddy:rides';

const nowIso = () => new Date().toISOString();
const minutesAgo = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString();

const clockTime = (date: Date) =>
  `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

const laterToday = (minutes: number) => new Date(Date.now() + minutes * 60_000);

export function isDepartureTimeInPast(time: string, now = new Date()): boolean {
  const [hours, minutes] = time.split(':').map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return true;
  const candidate = new Date(now);
  candidate.setHours(hours, minutes, 0, 0);
  return candidate.getTime() <= now.getTime();
}

export function isRideDeparted(ride: RidePool, now = Date.now()): boolean {
  if (ride.departureAt) {
    const departure = new Date(ride.departureAt).getTime();
    return Number.isFinite(departure) && departure <= now;
  }
  const [hours, minutes] = ride.departureTime.split(':').map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return false;
  const departure = new Date(ride.createdAt);
  departure.setHours(hours, minutes, 0, 0);
  return departure.getTime() <= now;
}

function seedRides(): RidePool[] {
  const patnaDeparture = laterToday(45);
  const danapurDeparture = laterToday(95);
  const airportDeparture = laterToday(160);
  return [
    {
      id: 'ride-seed-patna',
      destination: RAILWAY_STATIONS[0].value,
      distance: RAILWAY_STATIONS[0].distance,
      note: RAILWAY_STATIONS[0].note,
      meetingPoint: 'Main Gate 1 Security Booth',
      departureTime: clockTime(patnaDeparture),
      departureAt: patnaDeparture.toISOString(),
      totalFare: 160,
      farePerSeat: 40,
      totalSeats: 4,
      hostId: SEED_CONTACTS.aman.userId,
      hostName: SEED_CONTACTS.aman.name,
      hostHostel: SEED_CONTACTS.aman.hostel,
      hostPhone: SEED_CONTACTS.aman.phone,
      members: [SEED_CONTACTS.aarav, SEED_CONTACTS.kabir],
      createdAt: minutesAgo(32),
    },
    {
      id: 'ride-seed-danapur',
      destination: RAILWAY_STATIONS[1].value,
      distance: RAILWAY_STATIONS[1].distance,
      note: RAILWAY_STATIONS[1].note,
      meetingPoint: 'ICICI Gate',
      departureTime: clockTime(danapurDeparture),
      departureAt: danapurDeparture.toISOString(),
      totalFare: 200,
      farePerSeat: 50,
      totalSeats: 4,
      hostId: SEED_CONTACTS.riyaKumari.userId,
      hostName: SEED_CONTACTS.riyaKumari.name,
      hostHostel: SEED_CONTACTS.riyaKumari.hostel,
      hostPhone: SEED_CONTACTS.riyaKumari.phone,
      members: [SEED_CONTACTS.ananya, SEED_CONTACTS.meera, SEED_CONTACTS.rohan],
      createdAt: minutesAgo(34),
    },
    {
      id: 'ride-seed-airport',
      destination: AIRPORTS[0].value,
      distance: AIRPORTS[0].distance,
      note: AIRPORTS[0].note,
      meetingPoint: 'Main Gate 1',
      departureTime: clockTime(airportDeparture),
      departureAt: airportDeparture.toISOString(),
      totalFare: 380,
      farePerSeat: 95,
      totalSeats: 4,
      hostId: SEED_CONTACTS.kunal.userId,
      hostName: SEED_CONTACTS.kunal.name,
      hostHostel: SEED_CONTACTS.kunal.hostel,
      hostPhone: SEED_CONTACTS.kunal.phone,
      members: [SEED_CONTACTS.dev],
      createdAt: minutesAgo(36),
    },
  ];
}

function readStored(): RidePool[] | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as RidePool[]) : null;
  } catch {
    return null;
  }
}

function persist(list: RidePool[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // Storage can be unavailable in private mode; the in-memory copy still works.
  }
}

function emit() {
  window.dispatchEvent(new CustomEvent(RIDES_EVENT));
}

export function loadRides(): RidePool[] {
  const stored = readStored();
  if (stored) return stored;
  const seeded = seedRides();
  persist(seeded);
  return seeded;
}

export function createRide(input: {
  host: RequestContact;
  destination: string;
  distance: string;
  note: string;
  meetingPoint: string;
  departureTime: string;
  totalFare: number;
  totalSeats: number;
}): RidePool {
  const departureAt = new Date();
  const [hours, minutes] = input.departureTime.split(':').map(Number);
  departureAt.setHours(hours, minutes, 0, 0);

  const ride: RidePool = {
    id: crypto.randomUUID(),
    destination: input.destination,
    distance: input.distance,
    note: input.note,
    meetingPoint: input.meetingPoint,
    departureTime: input.departureTime,
    departureAt: departureAt.toISOString(),
    totalFare: input.totalFare,
    farePerSeat: Math.ceil(input.totalFare / input.totalSeats),
    totalSeats: input.totalSeats,
    hostId: input.host.userId,
    hostName: input.host.name,
    hostHostel: input.host.hostel ?? 'BIT Patna',
    hostPhone: input.host.phone ?? '',
    members: [],
    createdAt: nowIso(),
  };
  persist([ride, ...loadRides()]);
  emit();
  return ride;
}

export function joinRide(id: string, member: RequestContact): RidePool | null {
  const list = loadRides();
  const target = list.find((ride) => ride.id === id);
  if (!target) return null;
  if (target.hostId === member.userId) return null;
  if (target.members.some((existing) => existing.userId === member.userId)) return target;
  if (target.members.length >= target.totalSeats) return null;

  const updated: RidePool = { ...target, members: [...target.members, member] };
  persist(list.map((ride) => (ride.id === id ? updated : ride)));
  emit();
  return updated;
}

export function subscribeRides(onChange: () => void): () => void {
  const handler = (event: Event) => {
    if (event instanceof StorageEvent && event.key && event.key !== STORAGE_KEY) return;
    onChange();
  };
  window.addEventListener(RIDES_EVENT, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(RIDES_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}

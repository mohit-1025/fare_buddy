import { DEMO_PASSWORD, SEEDED_HUBS } from './constants';
import type {
  DeliveryPool,
  DeliveryPoolItem,
  DemoDatabase,
  DemoUserRecord,
  GearListing,
  Profile,
  RidePool,
  RidePoolMember,
} from './types';

export const DEMO_DB_VERSION = 1;

const nowIso = () => new Date().toISOString();

function minutesFromNow(minutes: number) {
  return new Date(Date.now() + minutes * 60_000).toISOString();
}

function daysAgo(days: number, extraMinutes = 0) {
  return new Date(Date.now() - days * 86_400_000 - extraMinutes * 60_000).toISOString();
}

/** Builds a UTC ISO timestamp for a wall-clock time in Asia/Kolkata. */
export function atIST(hours: number, minutes: number, dayOffset = 0) {
  const ist = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  ist.setDate(ist.getDate() + dayOffset);
  const year = ist.getFullYear();
  const month = String(ist.getMonth() + 1).padStart(2, '0');
  const day = String(ist.getDate()).padStart(2, '0');
  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');
  return new Date(`${year}-${month}-${day}T${hh}:${mm}:00+05:30`).toISOString();
}

function upcomingIST(hours: number, minutes: number) {
  const today = atIST(hours, minutes, 0);
  if (new Date(today).getTime() > Date.now() + 10 * 60_000) return today;
  return atIST(hours, minutes, 1);
}

export const DEMO_PROFILE_IDS = {
  aarav: '11111111-1111-4111-8111-111111111111',
  riya: '22222222-2222-4222-8222-222222222222',
  kabir: '33333333-3333-4333-8333-333333333333',
  ananya: '44444444-4444-4444-8444-444444444444',
  dev: '55555555-5555-4555-8555-555555555555',
  meera: '66666666-6666-4666-8666-666666666666',
  ishaan: '77777777-7777-4777-8777-777777777777',
  naina: '88888888-8888-4888-8888-888888888888',
  aman: '99999911-9999-4999-8999-999999999911',
  riyaKumari: '99999922-9999-4999-8999-999999999922',
  rohan: '99999933-9999-4999-8999-999999999933',
  kunal: '99999944-9999-4999-8999-999999999944',
} as const;

const seedProfiles: Array<Omit<Profile, 'created_at'> & { created_at?: string }> = [
  {
    id: DEMO_PROFILE_IDS.aarav,
    email: 'btech15001.24@bitmesra.ac.in',
    full_name: 'Aarav Sharma',
    hostel: 'BH-2',
    wing: 'Floor 3',
    room: '312',
    phone: '9876500001',
    upi_id: 'aarav@okhdfcbank',
  },
  {
    id: DEMO_PROFILE_IDS.riya,
    email: 'btech15042.24@bitmesra.ac.in',
    full_name: 'Riya Verma',
    hostel: 'GH',
    wing: 'Floor 1',
    room: '104',
    phone: '9876500002',
    upi_id: 'riya@okaxis',
  },
  {
    id: DEMO_PROFILE_IDS.kabir,
    email: 'btech15017.24@bitmesra.ac.in',
    full_name: 'Kabir Singh',
    hostel: 'BH-1',
    wing: 'Floor 2',
    room: '207',
    phone: '9876500003',
    upi_id: 'kabir@oksbi',
  },
  {
    id: DEMO_PROFILE_IDS.ananya,
    email: 'btech15008.24@bitmesra.ac.in',
    full_name: 'Ananya Rao',
    hostel: 'GH',
    wing: 'Floor 2',
    room: '218',
    phone: '9876500004',
    upi_id: 'ananya@okicici',
  },
  {
    id: DEMO_PROFILE_IDS.dev,
    email: 'btech15033.23@bitmesra.ac.in',
    full_name: 'Dev Patel',
    hostel: 'BH-3',
    wing: 'Floor 4',
    room: '401',
    phone: '9876500005',
    upi_id: 'dev@okhdfcbank',
  },
  {
    id: DEMO_PROFILE_IDS.meera,
    email: 'btech15060.23@bitmesra.ac.in',
    full_name: 'Meera Nair',
    hostel: 'GH',
    wing: 'Floor 3',
    room: '309',
    phone: '9876500006',
    upi_id: 'meera@okhdfcbank',
  },
  {
    id: DEMO_PROFILE_IDS.ishaan,
    email: 'btech15021.22@bitmesra.ac.in',
    full_name: 'Ishaan Gupta',
    hostel: 'BH-3',
    wing: 'Floor 2',
    room: '216',
    phone: '9876500007',
    upi_id: 'ishaan@oksbi',
  },
  {
    id: DEMO_PROFILE_IDS.naina,
    email: 'btech15055.22@bitmesra.ac.in',
    full_name: 'Naina Joseph',
    hostel: 'GH',
    wing: 'Floor 4',
    room: '402',
    phone: '9876500008',
    upi_id: 'naina@okaxis',
  },
  {
    id: DEMO_PROFILE_IDS.aman,
    email: 'btech15072.24@bitmesra.ac.in',
    full_name: 'Aman Raj',
    hostel: 'BH-2',
    wing: 'Floor 3',
    room: '214',
    phone: '9876500011',
    upi_id: 'amanraj@okhdfcbank',
  },
  {
    id: DEMO_PROFILE_IDS.riyaKumari,
    email: 'btech15088.24@bitmesra.ac.in',
    full_name: 'Riya Kumari',
    hostel: 'GH',
    wing: 'Floor 1',
    room: '108',
    phone: '9876500012',
    upi_id: 'riya.k@icici',
  },
  {
    id: DEMO_PROFILE_IDS.rohan,
    email: 'btech15064.24@bitmesra.ac.in',
    full_name: 'Rohan Gupta',
    hostel: 'BH-2',
    wing: 'Floor 2',
    room: '207',
    phone: '9876500013',
    upi_id: 'rohan@oksbi',
  },
  {
    id: DEMO_PROFILE_IDS.kunal,
    email: 'btech15029.23@bitmesra.ac.in',
    full_name: 'Kunal Singh',
    hostel: 'BH-1',
    wing: 'Floor 3',
    room: '311',
    phone: '9876500014',
    upi_id: 'kunal@okicici',
  },
];

export function createSeedAccounts(): { users: DemoUserRecord[]; profiles: Profile[] } {
  const users: DemoUserRecord[] = seedProfiles.map((profile) => ({
    id: profile.id,
    email: profile.email,
    password: DEMO_PASSWORD,
    created_at: daysAgo(120),
  }));

  const profiles: Profile[] = seedProfiles.map((profile) => ({
    ...profile,
    created_at: profile.created_at ?? daysAgo(120),
  }));

  return { users, profiles };
}

function sumItems(items: DeliveryPoolItem[]) {
  return items.reduce((total, item) => total + item.price * item.qty, 0);
}

export function createSeedItems(): DeliveryPoolItem[] {
  return [
    {
      id: 'e1000000-0000-4000-8000-000000000001',
      pool_id: 'd1000000-0000-4000-8000-000000000001',
      user_id: DEMO_PROFILE_IDS.riya,
      item_name: 'Maggi noodles (2-pack)',
      price: 14,
      qty: 2,
      paid: false,
      created_at: minutesFromNow(-6),
    },
    {
      id: 'e1000000-0000-4000-8000-000000000002',
      pool_id: 'd1000000-0000-4000-8000-000000000001',
      user_id: DEMO_PROFILE_IDS.riya,
      item_name: 'Amul Taaza milk (1L)',
      price: 29,
      qty: 1,
      paid: false,
      created_at: minutesFromNow(-5),
    },
    {
      id: 'e1000000-0000-4000-8000-000000000003',
      pool_id: 'd1000000-0000-4000-8000-000000000001',
      user_id: DEMO_PROFILE_IDS.ananya,
      item_name: 'Parle-G biscuits',
      price: 12,
      qty: 1,
      paid: false,
      created_at: minutesFromNow(-4),
    },
    {
      id: 'e1000000-0000-4000-8000-000000000004',
      pool_id: 'd1000000-0000-4000-8000-000000000002',
      user_id: DEMO_PROFILE_IDS.aarav,
      item_name: 'Protein bars (pack of 2)',
      price: 40,
      qty: 2,
      paid: false,
      created_at: minutesFromNow(-8),
    },
    {
      id: 'e1000000-0000-4000-8000-000000000005',
      pool_id: 'd1000000-0000-4000-8000-000000000002',
      user_id: DEMO_PROFILE_IDS.riya,
      item_name: 'Face wash',
      price: 44,
      qty: 1,
      paid: false,
      created_at: minutesFromNow(-7),
    },
    {
      id: 'e1000000-0000-4000-8000-000000000006',
      pool_id: 'd1000000-0000-4000-8000-000000000003',
      user_id: DEMO_PROFILE_IDS.aarav,
      item_name: 'Monthly snack haul',
      price: 120,
      qty: 1,
      paid: true,
      created_at: daysAgo(3, 40),
    },
    {
      id: 'e1000000-0000-4000-8000-000000000007',
      pool_id: 'd1000000-0000-4000-8000-000000000003',
      user_id: DEMO_PROFILE_IDS.riya,
      item_name: 'Stationery + soap refill',
      price: 120,
      qty: 1,
      paid: true,
      created_at: daysAgo(3, 38),
    },
  ];
}

function createSeedPools(items: DeliveryPoolItem[]): DeliveryPool[] {
  const poolAItems = items.filter((item) => item.pool_id === 'd1000000-0000-4000-8000-000000000001');
  const poolBItems = items.filter((item) => item.pool_id === 'd1000000-0000-4000-8000-000000000002');
  const poolCItems = items.filter((item) => item.pool_id === 'd1000000-0000-4000-8000-000000000003');

  return [
    {
      id: 'd1000000-0000-4000-8000-000000000001',
      host_id: DEMO_PROFILE_IDS.riya,
      hostel: 'BH-7',
      wing: 'Floor 2',
      platform: 'Blinkit',
      threshold: 149,
      delivery_fee: 25,
      small_order_fee: 20,
      handling_fee: 10,
      current_total: sumItems(poolAItems),
      status: 'open',
      expires_at: minutesFromNow(8),
      created_at: minutesFromNow(-11),
    },
    {
      id: 'd1000000-0000-4000-8000-000000000002',
      host_id: DEMO_PROFILE_IDS.aarav,
      hostel: 'BH-2',
      wing: 'Floor 3',
      platform: 'Zepto',
      threshold: 149,
      delivery_fee: 19,
      small_order_fee: 15,
      handling_fee: 10,
      current_total: sumItems(poolBItems),
      status: 'open',
      expires_at: minutesFromNow(10),
      created_at: minutesFromNow(-9),
    },
    {
      id: 'd1000000-0000-4000-8000-000000000003',
      host_id: DEMO_PROFILE_IDS.aarav,
      hostel: 'BH-2',
      wing: 'Floor 3',
      platform: 'Blinkit',
      threshold: 199,
      delivery_fee: 25,
      small_order_fee: 20,
      handling_fee: 10,
      current_total: sumItems(poolCItems),
      status: 'settled',
      expires_at: daysAgo(3, 20),
      created_at: daysAgo(3, 45),
    },
  ];
}

function createSeedRidePools(): { pools: RidePool[]; members: RidePoolMember[] } {
  const hatiaStart = upcomingIST(17, 15);
  const hatiaEnd = new Date(new Date(hatiaStart).getTime() + 15 * 60_000).toISOString();
  const rncStart = daysAgo(3, 300);
  const rncEnd = new Date(new Date(rncStart).getTime() + 15 * 60_000).toISOString();

  const pools: RidePool[] = [
    {
      id: 'f1000000-0000-4000-8000-000000000001',
      hub_id: SEEDED_HUBS[1].id,
      host_id: DEMO_PROFILE_IDS.kabir,
      departure_start: hatiaStart,
      departure_end: hatiaEnd,
      max_seats: 4,
      booked_seats: 2,
      meeting_point: 'Main Gate',
      whatsapp_link: 'https://chat.whatsapp.com/demo-hatia-pool',
      status: 'open',
      created_at: minutesFromNow(-35),
    },
    {
      id: 'f1000000-0000-4000-8000-000000000002',
      hub_id: SEEDED_HUBS[0].id,
      host_id: DEMO_PROFILE_IDS.aarav,
      departure_start: rncStart,
      departure_end: rncEnd,
      max_seats: 4,
      booked_seats: 4,
      meeting_point: 'ICICI Gate',
      whatsapp_link: null,
      status: 'completed',
      created_at: daysAgo(3, 360),
    },
  ];

  const members: RidePoolMember[] = [
    {
      id: '91000000-0000-4000-8000-000000000001',
      ride_pool_id: pools[0].id,
      user_id: DEMO_PROFILE_IDS.kabir,
      joined_at: minutesFromNow(-35),
    },
    {
      id: '91000000-0000-4000-8000-000000000002',
      ride_pool_id: pools[0].id,
      user_id: DEMO_PROFILE_IDS.ananya,
      joined_at: minutesFromNow(-28),
    },
    {
      id: '91000000-0000-4000-8000-000000000003',
      ride_pool_id: pools[1].id,
      user_id: DEMO_PROFILE_IDS.aarav,
      joined_at: daysAgo(3, 360),
    },
    {
      id: '91000000-0000-4000-8000-000000000004',
      ride_pool_id: pools[1].id,
      user_id: DEMO_PROFILE_IDS.riya,
      joined_at: daysAgo(3, 355),
    },
    {
      id: '91000000-0000-4000-8000-000000000005',
      ride_pool_id: pools[1].id,
      user_id: DEMO_PROFILE_IDS.kabir,
      joined_at: daysAgo(3, 350),
    },
    {
      id: '91000000-0000-4000-8000-000000000006',
      ride_pool_id: pools[1].id,
      user_id: DEMO_PROFILE_IDS.dev,
      joined_at: daysAgo(3, 340),
    },
  ];

  return { pools, members };
}

const seedGearListings: GearListing[] = [
  {
    id: 'c1000000-0000-4000-8000-000000000001',
    seller_id: DEMO_PROFILE_IDS.ishaan,
    title: 'Mini drafter + sheet tube bundle',
    category: 'ED/Drafting',
    description:
      'Complete first-year ED kit — mini drafter, sheet tube, French curves and an eraser shield. Kept in the original cover.',
    price: 260,
    condition: 'Like new',
    seller_hostel: 'BH-3',
    seller_room: '216',
    handoff_window: '19:00–21:00',
    photo_url: null,
    claimed_by: null,
    claimed: false,
    created_at: minutesFromNow(-130),
  },
  {
    id: 'c1000000-0000-4000-8000-000000000002',
    seller_id: DEMO_PROFILE_IDS.naina,
    title: 'Drawing board clips (12) + set squares',
    category: 'ED/Drafting',
    description: 'All clips present, no rust. Two set squares included. Perfect for ED lab submissions.',
    price: 90,
    condition: 'Good',
    seller_hostel: 'GH',
    seller_room: '402',
    handoff_window: '18:30–20:00',
    photo_url: null,
    claimed_by: null,
    claimed: false,
    created_at: minutesFromNow(-240),
  },
  {
    id: 'c1000000-0000-4000-8000-000000000003',
    seller_id: DEMO_PROFILE_IDS.ishaan,
    title: 'Workshop apron + clear goggles',
    category: 'Workshop',
    description: 'Washer-friendly apron, size L. Goggles are scratch-free with the original strap.',
    price: 180,
    condition: 'Good',
    seller_hostel: 'BH-3',
    seller_room: '216',
    handoff_window: '19:00–21:00',
    photo_url: null,
    claimed_by: null,
    claimed: false,
    created_at: minutesFromNow(-300),
  },
  {
    id: 'c1000000-0000-4000-8000-000000000004',
    seller_id: DEMO_PROFILE_IDS.naina,
    title: 'Lab uniform — 2 sets (M/L), washed',
    category: 'Workshop',
    description: 'Both sets freshly washed. One has a tiny ink mark on the sleeve, otherwise spotless.',
    price: 150,
    condition: 'Used',
    seller_hostel: 'GH',
    seller_room: '402',
    handoff_window: '17:00–19:00',
    photo_url: null,
    claimed_by: null,
    claimed: false,
    created_at: minutesFromNow(-420),
  },
  {
    id: 'c1000000-0000-4000-8000-000000000005',
    seller_id: DEMO_PROFILE_IDS.dev,
    title: 'Breadboard + 65 jumper wires kit',
    category: 'Electronics',
    description: '830-point breadboard with a sorted jumper box and a spare pair of tweezers. Tested working.',
    price: 320,
    condition: 'Like new',
    seller_hostel: 'BH-3',
    seller_room: '401',
    handoff_window: '20:00–22:00',
    photo_url: null,
    claimed_by: null,
    claimed: false,
    created_at: minutesFromNow(-80),
  },
  {
    id: 'c1000000-0000-4000-8000-000000000006',
    seller_id: DEMO_PROFILE_IDS.naina,
    title: 'Analog multimeter (working)',
    category: 'Other',
    description: 'Reliable analog multimeter for workshop labs. Probes included; reads accurately.',
    price: 250,
    condition: 'Good',
    seller_hostel: 'GH',
    seller_room: '402',
    handoff_window: '18:00–20:30',
    photo_url: null,
    claimed_by: null,
    claimed: false,
    created_at: minutesFromNow(-520),
  },
];

export function createDemoDatabase(): DemoDatabase {
  const { users, profiles } = createSeedAccounts();

  const delivery_pool_items = createSeedItems();
  const delivery_pools = createSeedPools(delivery_pool_items);
  const { pools: ride_pools, members: ride_pool_members } = createSeedRidePools();

  return {
    version: DEMO_DB_VERSION,
    seeded_at: nowIso(),
    users,
    profiles,
    delivery_pools,
    delivery_pool_items,
    hubs: SEEDED_HUBS.map((hub) => ({ ...hub })),
    ride_pools,
    ride_pool_members,
    gear_listings: seedGearListings.map((listing) => ({ ...listing })),
  };
}

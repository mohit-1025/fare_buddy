/**
 * Seeds a Supabase project with FareBuddy demo students and pools.
 *
 * Usage:
 *   SUPABASE_URL=https://xxx.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=... \
 *   node scripts/seed-supabase.mjs
 *
 * Run the migration first. This script only replaces the fixed demo rows it
 * owns (delivery pools, ride pools, gear listings) and leaves other campus
 * data untouched. All demo accounts use the password "farebuddy".
 */
import { createClient } from '@supabase/supabase-js';

for (const file of ['.env.local', '.env']) {
  try {
    process.loadEnvFile(file);
  } catch {
    // file not present — fall back to the shell environment
  }
}

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    'Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY.\n' +
      'Find them in Supabase → Project Settings → API. Never expose the service role key in the browser.',
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const PASSWORD = 'farebuddy';
const DEMO_EMAILS = {
  aarav: 'btech15001.24@bitmesra.ac.in',
  riya: 'btech15042.24@bitmesra.ac.in',
  kabir: 'btech15017.24@bitmesra.ac.in',
  ananya: 'btech15008.24@bitmesra.ac.in',
  dev: 'btech15033.23@bitmesra.ac.in',
  meera: 'btech15060.23@bitmesra.ac.in',
  ishaan: 'btech15021.22@bitmesra.ac.in',
  naina: 'btech15055.22@bitmesra.ac.in',
};

const PROFILES = [
  { key: 'aarav', full_name: 'Aarav Sharma', hostel: 'BH-2', wing: 'Floor 3', room: '312', upi_id: 'aarav@okhdfcbank' },
  { key: 'riya', full_name: 'Riya Verma', hostel: 'GH', wing: 'Floor 1', room: '104', upi_id: 'riya@okaxis' },
  { key: 'kabir', full_name: 'Kabir Singh', hostel: 'BH-1', wing: 'Floor 2', room: '207', upi_id: 'kabir@oksbi' },
  { key: 'ananya', full_name: 'Ananya Rao', hostel: 'GH', wing: 'Floor 2', room: '218', upi_id: 'ananya@okicici' },
  { key: 'dev', full_name: 'Dev Patel', hostel: 'BH-3', wing: 'Floor 4', room: '401', upi_id: 'dev@okhdfcbank' },
  { key: 'meera', full_name: 'Meera Nair', hostel: 'GH', wing: 'Floor 3', room: '309', upi_id: 'meera@okhdfcbank' },
  { key: 'ishaan', full_name: 'Ishaan Gupta', hostel: 'BH-3', wing: 'Floor 2', room: '216', upi_id: 'ishaan@oksbi' },
  { key: 'naina', full_name: 'Naina Joseph', hostel: 'GH', wing: 'Floor 4', room: '402', upi_id: 'naina@okaxis' },
];

const HUBS = [
  { id: 'a1000000-0000-4000-8000-000000000001', code: 'RNC', name: 'Ranchi Jn', distance_km: 16, solo_fare: 320 },
  { id: 'a1000000-0000-4000-8000-000000000002', code: 'HTE', name: 'Hatia', distance_km: 24, solo_fare: 350 },
  { id: 'a1000000-0000-4000-8000-000000000003', code: 'TIS', name: 'Tatisilwai / Namkum', distance_km: 10, solo_fare: 180 },
  { id: 'a1000000-0000-4000-8000-000000000004', code: 'IXR', name: 'Birsa Munda Airport', distance_km: 21, solo_fare: 450 },
];

const POOL_A = 'd1000000-0000-4000-8000-000000000001';
const POOL_B = 'd1000000-0000-4000-8000-000000000002';
const POOL_C = 'd1000000-0000-4000-8000-000000000003';
const RIDE_HATIA = 'f1000000-0000-4000-8000-000000000001';
const RIDE_RNC = 'f1000000-0000-4000-8000-000000000002';

const minutesFromNow = (minutes) => new Date(Date.now() + minutes * 60_000).toISOString();
const daysAgo = (days, extraMinutes = 0) =>
  new Date(Date.now() - days * 86_400_000 - extraMinutes * 60_000).toISOString();

function atIST(hours, minutes, dayOffset = 0) {
  const ist = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  ist.setDate(ist.getDate() + dayOffset);
  const date = `${ist.getFullYear()}-${String(ist.getMonth() + 1).padStart(2, '0')}-${String(
    ist.getDate(),
  ).padStart(2, '0')}`;
  return new Date(`${date}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00+05:30`).toISOString();
}

function upcomingIST(hours, minutes) {
  const today = atIST(hours, minutes, 0);
  return new Date(today).getTime() > Date.now() + 10 * 60_000 ? today : atIST(hours, minutes, 1);
}

async function findExistingUsers() {
  const byEmail = new Map();
  let page = 1;
  for (;;) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    for (const user of data.users) {
      if (user.email) byEmail.set(user.email.toLowerCase(), user);
    }
    if (data.users.length < 1000) break;
    page += 1;
  }
  return byEmail;
}

async function main() {
  console.log('FareBuddy → Supabase demo seed');

  const { error: hubError } = await supabase.from('hubs').upsert(HUBS, { onConflict: 'code' });
  if (hubError) throw hubError;

  const existing = await findExistingUsers();
  const ids = {};

  for (const profile of PROFILES) {
    const email = DEMO_EMAILS[profile.key];
    let user = existing.get(email);
    if (!user) {
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password: PASSWORD,
        email_confirm: true,
        user_metadata: { full_name: profile.full_name },
      });
      if (error) throw new Error(`Could not create ${email}: ${error.message}`);
      user = data.user;
      console.log(`created auth user ${email}`);
    } else {
      console.log(`reusing auth user ${email}`);
    }
    ids[profile.key] = user.id;
  }

  const { error: profileError } = await supabase.from('profiles').upsert(
    PROFILES.map((profile) => ({
      id: ids[profile.key],
      email: DEMO_EMAILS[profile.key],
      full_name: profile.full_name,
      hostel: profile.hostel,
      wing: profile.wing,
      room: profile.room,
      upi_id: profile.upi_id,
    })),
    { onConflict: 'id' },
  );
  if (profileError) throw profileError;

  console.log('clearing previous demo rows');
  const { error: clearPoolsError } = await supabase
    .from('delivery_pools')
    .delete()
    .in('id', [POOL_A, POOL_B, POOL_C]);
  if (clearPoolsError) throw clearPoolsError;

  const { error: clearRidesError } = await supabase
    .from('ride_pools')
    .delete()
    .in('id', [RIDE_HATIA, RIDE_RNC]);
  if (clearRidesError) throw clearRidesError;

  const gearIds = Array.from({ length: 6 }, (_, index) => `c1000000-0000-4000-8000-00000000000${index + 1}`);
  const { error: clearGearError } = await supabase
    .from('gear_listings')
    .delete()
    .in('id', gearIds);
  if (clearGearError) throw clearGearError;

  console.log('seeding delivery pools');
  const { error: poolError } = await supabase.from('delivery_pools').insert([
    {
      id: POOL_A,
      host_id: ids.riya,
      hostel: 'BH-7',
      wing: 'Floor 2',
      platform: 'Blinkit',
      threshold: 149,
      delivery_fee: 25,
      small_order_fee: 20,
      handling_fee: 10,
      status: 'open',
      expires_at: minutesFromNow(8),
      created_at: minutesFromNow(-11),
    },
    {
      id: POOL_B,
      host_id: ids.aarav,
      hostel: 'BH-2',
      wing: 'Floor 3',
      platform: 'Zepto',
      threshold: 149,
      delivery_fee: 19,
      small_order_fee: 15,
      handling_fee: 10,
      status: 'open',
      expires_at: minutesFromNow(10),
      created_at: minutesFromNow(-9),
    },
    {
      id: POOL_C,
      host_id: ids.aarav,
      hostel: 'BH-2',
      wing: 'Floor 3',
      platform: 'Blinkit',
      threshold: 199,
      delivery_fee: 25,
      small_order_fee: 20,
      handling_fee: 10,
      status: 'settled',
      expires_at: daysAgo(3, 20),
      created_at: daysAgo(3, 45),
    },
  ]);
  if (poolError) throw poolError;

  const { error: itemsError } = await supabase.from('delivery_pool_items').insert([
    {
      id: 'e1000000-0000-4000-8000-000000000001',
      pool_id: POOL_A,
      user_id: ids.riya,
      item_name: 'Maggi noodles (2-pack)',
      price: 14,
      qty: 2,
      created_at: minutesFromNow(-6),
    },
    {
      id: 'e1000000-0000-4000-8000-000000000002',
      pool_id: POOL_A,
      user_id: ids.riya,
      item_name: 'Amul Taaza milk (1L)',
      price: 29,
      qty: 1,
      created_at: minutesFromNow(-5),
    },
    {
      id: 'e1000000-0000-4000-8000-000000000003',
      pool_id: POOL_A,
      user_id: ids.ananya,
      item_name: 'Parle-G biscuits',
      price: 12,
      qty: 1,
      created_at: minutesFromNow(-4),
    },
    {
      id: 'e1000000-0000-4000-8000-000000000004',
      pool_id: POOL_B,
      user_id: ids.aarav,
      item_name: 'Protein bars (pack of 2)',
      price: 40,
      qty: 2,
      created_at: minutesFromNow(-8),
    },
    {
      id: 'e1000000-0000-4000-8000-000000000005',
      pool_id: POOL_B,
      user_id: ids.riya,
      item_name: 'Face wash',
      price: 44,
      qty: 1,
      created_at: minutesFromNow(-7),
    },
    {
      id: 'e1000000-0000-4000-8000-000000000006',
      pool_id: POOL_C,
      user_id: ids.aarav,
      item_name: 'Monthly snack haul',
      price: 120,
      qty: 1,
      paid: true,
      created_at: daysAgo(3, 40),
    },
    {
      id: 'e1000000-0000-4000-8000-000000000007',
      pool_id: POOL_C,
      user_id: ids.riya,
      item_name: 'Stationery + soap refill',
      price: 120,
      qty: 1,
      paid: true,
      created_at: daysAgo(3, 38),
    },
  ]);
  if (itemsError) throw itemsError;

  console.log('seeding ride pools');
  const hatiaStart = upcomingIST(17, 15);
  const hatiaEnd = new Date(new Date(hatiaStart).getTime() + 15 * 60_000).toISOString();
  const rncStart = daysAgo(3, 300);
  const rncEnd = new Date(new Date(rncStart).getTime() + 15 * 60_000).toISOString();

  const { error: rideError } = await supabase.from('ride_pools').insert([
    {
      id: RIDE_HATIA,
      hub_id: HUBS[1].id,
      host_id: ids.kabir,
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
      id: RIDE_RNC,
      hub_id: HUBS[0].id,
      host_id: ids.aarav,
      departure_start: rncStart,
      departure_end: rncEnd,
      max_seats: 4,
      booked_seats: 4,
      meeting_point: 'ICICI Gate',
      status: 'completed',
      created_at: daysAgo(3, 360),
    },
  ]);
  if (rideError) throw rideError;

  const { error: memberError } = await supabase.from('ride_pool_members').upsert(
    [
      { ride_pool_id: RIDE_HATIA, user_id: ids.kabir },
      { ride_pool_id: RIDE_HATIA, user_id: ids.ananya },
      { ride_pool_id: RIDE_RNC, user_id: ids.aarav },
      { ride_pool_id: RIDE_RNC, user_id: ids.riya },
      { ride_pool_id: RIDE_RNC, user_id: ids.kabir },
      { ride_pool_id: RIDE_RNC, user_id: ids.dev },
    ],
    { onConflict: 'ride_pool_id,user_id', ignoreDuplicates: true },
  );
  if (memberError) throw memberError;

  console.log('seeding gear bazaar');
  const { error: gearError } = await supabase.from('gear_listings').insert([
    {
      id: gearIds[0],
      seller_id: ids.ishaan,
      title: 'Mini drafter + sheet tube bundle',
      category: 'ED/Drafting',
      description: 'Complete first-year ED kit — mini drafter, sheet tube, French curves and an eraser shield.',
      price: 260,
      condition: 'Like new',
      seller_hostel: 'BH-3',
      seller_room: '216',
      handoff_window: '19:00–21:00',
      created_at: minutesFromNow(-130),
    },
    {
      id: gearIds[1],
      seller_id: ids.naina,
      title: 'Drawing board clips (12) + set squares',
      category: 'ED/Drafting',
      description: 'All clips present, no rust. Two set squares included.',
      price: 90,
      condition: 'Good',
      seller_hostel: 'GH',
      seller_room: '402',
      handoff_window: '18:30–20:00',
      created_at: minutesFromNow(-240),
    },
    {
      id: gearIds[2],
      seller_id: ids.ishaan,
      title: 'Workshop apron + clear goggles',
      category: 'Workshop',
      description: 'Washer-friendly apron, size L. Goggles are scratch-free with the original strap.',
      price: 180,
      condition: 'Good',
      seller_hostel: 'BH-3',
      seller_room: '216',
      handoff_window: '19:00–21:00',
      created_at: minutesFromNow(-300),
    },
    {
      id: gearIds[3],
      seller_id: ids.naina,
      title: 'Lab uniform — 2 sets (M/L), washed',
      category: 'Workshop',
      description: 'Both sets freshly washed. One has a tiny ink mark on the sleeve.',
      price: 150,
      condition: 'Used',
      seller_hostel: 'GH',
      seller_room: '402',
      handoff_window: '17:00–19:00',
      created_at: minutesFromNow(-420),
    },
    {
      id: gearIds[4],
      seller_id: ids.dev,
      title: 'Breadboard + 65 jumper wires kit',
      category: 'Electronics',
      description: '830-point breadboard with a sorted jumper box. Tested working.',
      price: 320,
      condition: 'Like new',
      seller_hostel: 'BH-3',
      seller_room: '401',
      handoff_window: '20:00–22:00',
      created_at: minutesFromNow(-80),
    },
    {
      id: gearIds[5],
      seller_id: ids.naina,
      title: 'Analog multimeter (working)',
      category: 'Other',
      description: 'Reliable analog multimeter for workshop labs. Probes included.',
      price: 250,
      condition: 'Good',
      seller_hostel: 'GH',
      seller_room: '402',
      handoff_window: '18:00–20:30',
      created_at: minutesFromNow(-520),
    },
  ]);
  if (gearError) throw gearError;

  console.log('\nDone. Demo accounts (password: farebuddy):');
  for (const profile of PROFILES) {
    console.log(`  ${DEMO_EMAILS[profile.key]}  —  ${profile.full_name} (${profile.hostel})`);
  }
  console.log('\nHatia ride window:', new Date(hatiaStart).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
}

main().catch((error) => {
  console.error('\nSeed failed:', error.message ?? error);
  process.exit(1);
});

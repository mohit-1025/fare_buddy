export const HOSTELS = [
  { value: 'BH-1', label: 'Boys Hostel 1', short: 'BH-1' },
  { value: 'BH-2', label: 'Boys Hostel 2', short: 'BH-2' },
  { value: 'BH-3', label: 'Boys Hostel 3', short: 'BH-3' },
  { value: 'GH', label: 'Girls Hostel', short: 'GH' },
] as const;

export type HostelCode = (typeof HOSTELS)[number]['value'];

export const FLOOR_SUGGESTIONS = ['Ground Floor', 'Floor 1', 'Floor 2', 'Floor 3', 'Floor 4'];

export const PLATFORMS = [
  { value: 'Blinkit', label: 'Blinkit', className: 'bg-amber-400 text-amber-950' },
  { value: 'Zepto', label: 'Zepto', className: 'bg-violet-600 text-white' },
  { value: 'Instamart', label: 'Instamart', className: 'bg-orange-500 text-white' },
] as const;

export type Platform = (typeof PLATFORMS)[number]['value'];
export const PLATFORM_VALUES = PLATFORMS.map((p) => p.value) as readonly Platform[];

export const MEETING_POINTS = ['Main Gate', 'ICICI Gate'] as const;
export type MeetingPoint = (typeof MEETING_POINTS)[number];

export const GEAR_CATEGORIES = [
  { value: 'ED/Drafting', label: 'ED / Drafting', emoji: '📐' },
  { value: 'Workshop', label: 'Workshop', emoji: '🥽' },
  { value: 'Electronics', label: 'Electronics', emoji: '🔌' },
  { value: 'Other', label: 'Other', emoji: '📦' },
] as const;

export type GearCategory = (typeof GEAR_CATEGORIES)[number]['value'];
export const GEAR_CATEGORY_VALUES = GEAR_CATEGORIES.map((c) => c.value) as readonly GearCategory[];

export const GEAR_CONDITIONS = ['Like new', 'Good', 'Used'] as const;
export type GearCondition = (typeof GEAR_CONDITIONS)[number];

export const GEAR_PRICE_CAP = 400;
export const DEFAULT_THRESHOLD = 149;
export const MAX_RIDE_SEATS = 4;

export const SEEDED_HUBS = [
  {
    id: 'a1000000-0000-4000-8000-000000000001',
    code: 'RNC',
    name: 'Ranchi Jn',
    distance_km: 16,
    solo_fare: 320,
  },
  {
    id: 'a1000000-0000-4000-8000-000000000002',
    code: 'HTE',
    name: 'Hatia',
    distance_km: 24,
    solo_fare: 350,
  },
  {
    id: 'a1000000-0000-4000-8000-000000000003',
    code: 'TIS',
    name: 'Tatisilwai / Namkum',
    distance_km: 10,
    solo_fare: 180,
  },
  {
    id: 'a1000000-0000-4000-8000-000000000004',
    code: 'IXR',
    name: 'Birsa Munda Airport',
    distance_km: 21,
    solo_fare: 450,
  },
] as const;

export const IMPACT_BASELINE = {
  savings: 86700,
  rides: 408,
  orders: 261,
  gear: 96,
};

export const DEMO_ACCOUNTS = {
  student1: {
    email: 'btech15001.24@bitmesra.ac.in',
    password: 'farebuddy',
    name: 'Aarav Sharma',
  },
  student2: {
    email: 'btech15042.24@bitmesra.ac.in',
    password: 'farebuddy',
    name: 'Riya Verma',
  },
};

export const DEMO_PASSWORD = 'farebuddy';

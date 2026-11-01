export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  hostel: string | null;
  wing: string | null;
  room: string | null;
  upi_id: string | null;
  created_at: string;
}

export interface OnboardingPayload {
  full_name: string;
  hostel: string;
  wing: string;
  room: string | null;
  upi_id: string;
}

export type DeliveryPoolStatus = 'open' | 'locked' | 'ordered' | 'settled';

export interface DeliveryPool {
  id: string;
  host_id: string;
  hostel: string;
  wing: string;
  platform: string;
  threshold: number;
  delivery_fee: number;
  small_order_fee: number;
  handling_fee: number;
  current_total: number;
  status: DeliveryPoolStatus;
  expires_at: string;
  created_at: string;
}

export interface DeliveryPoolItem {
  id: string;
  pool_id: string;
  user_id: string;
  item_name: string;
  price: number;
  qty: number;
  paid: boolean;
  created_at: string;
}

export interface Hub {
  id: string;
  code: string;
  name: string;
  distance_km: number;
  solo_fare: number;
}

export type RidePoolStatus = 'open' | 'full' | 'completed' | 'cancelled';

export interface RidePool {
  id: string;
  hub_id: string;
  host_id: string;
  departure_start: string;
  departure_end: string;
  max_seats: number;
  booked_seats: number;
  meeting_point: string;
  whatsapp_link: string | null;
  status: RidePoolStatus;
  created_at: string;
}

export interface RidePoolMember {
  id: string;
  ride_pool_id: string;
  user_id: string;
  joined_at: string;
}

export interface GearListing {
  id: string;
  seller_id: string;
  title: string;
  category: string;
  description: string;
  price: number;
  condition: string;
  seller_hostel: string;
  seller_room: string | null;
  handoff_window: string;
  photo_url: string | null;
  claimed_by: string | null;
  claimed: boolean;
  created_at: string;
}

export interface DemoUserRecord {
  id: string;
  email: string;
  password: string;
  created_at: string;
}

export interface DemoDatabase {
  version: number;
  seeded_at: string;
  users: DemoUserRecord[];
  profiles: Profile[];
  delivery_pools: DeliveryPool[];
  delivery_pool_items: DeliveryPoolItem[];
  hubs: Hub[];
  ride_pools: RidePool[];
  ride_pool_members: RidePoolMember[];
  gear_listings: GearListing[];
}

export interface SavingsBreakdown {
  pooledOrders: number;
  rides: number;
  gear: number;
  total: number;
}

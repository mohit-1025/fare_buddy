import { ceilShare } from './format';
import type {
  DeliveryPool,
  DeliveryPoolItem,
  DemoDatabase,
  SavingsBreakdown,
} from './types';

export function poolFeeTotal(pool: Pick<DeliveryPool, 'delivery_fee' | 'small_order_fee' | 'handling_fee'>) {
  return pool.delivery_fee + pool.small_order_fee + pool.handling_fee;
}

export function isFeeWaived(
  pool: Pick<DeliveryPool, 'current_total' | 'threshold'>,
) {
  return pool.threshold > 0 && pool.current_total >= pool.threshold;
}

export function poolParticipantIds(items: Pick<DeliveryPoolItem, 'user_id'>[]) {
  return Array.from(new Set(items.map((item) => item.user_id)));
}

export function surchargePerHead(
  pool: Pick<DeliveryPool, 'delivery_fee' | 'small_order_fee' | 'handling_fee' | 'threshold' | 'current_total'>,
  participantCount: number,
) {
  if (isFeeWaived(pool)) return 0;
  return ceilShare(poolFeeTotal(pool), Math.max(participantCount, 1));
}

export function amountToThreshold(pool: Pick<DeliveryPool, 'current_total' | 'threshold'>) {
  return Math.max(0, pool.threshold - pool.current_total);
}

export function computeSavings(db: DemoDatabase, userId: string): SavingsBreakdown {
  let pooledOrders = 0;
  for (const pool of db.delivery_pools) {
    if (!['ordered', 'settled'].includes(pool.status)) continue;
    if (!isFeeWaived(pool)) continue;
    const items = db.delivery_pool_items.filter((item) => item.pool_id === pool.id);
    const participants = poolParticipantIds(items);
    if (!participants.includes(userId)) continue;
    pooledOrders += ceilShare(poolFeeTotal(pool), participants.length);
  }

  let rides = 0;
  for (const pool of db.ride_pools) {
    if (pool.status !== 'completed') continue;
    const memberIds = db.ride_pool_members
      .filter((member) => member.ride_pool_id === pool.id)
      .map((member) => member.user_id);
    if (!memberIds.includes(userId)) continue;
    const hub = db.hubs.find((h) => h.id === pool.hub_id);
    if (!hub) continue;
    const riders = Math.max(1, Math.min(memberIds.length, pool.max_seats));
    rides += Math.max(0, hub.solo_fare - ceilShare(hub.solo_fare, riders));
  }

  return {
    pooledOrders,
    rides,
    gear: 0,
    total: pooledOrders + rides,
  };
}

export function liveImpactTotals(db: DemoDatabase) {
  const waivedSavings = db.delivery_pools.reduce((sum, pool) => {
    if (!['locked', 'ordered', 'settled'].includes(pool.status) || !isFeeWaived(pool)) return sum;
    return sum + poolFeeTotal(pool);
  }, 0);

  const rideSavings = db.ride_pools.reduce((sum, pool) => {
    if (!['full', 'completed'].includes(pool.status)) return sum;
    const hub = db.hubs.find((h) => h.id === pool.hub_id);
    if (!hub) return sum;
    const riders = Math.max(1, Math.min(pool.booked_seats, pool.max_seats));
    return sum + Math.max(0, hub.solo_fare - ceilShare(hub.solo_fare, riders));
  }, 0);

  return {
    pooledSavings: waivedSavings,
    rideSavings,
    orders: db.delivery_pools.filter((pool) => ['ordered', 'settled'].includes(pool.status)).length,
    rides: db.ride_pools.filter((pool) => ['full', 'completed'].includes(pool.status)).length,
    gear: db.gear_listings.filter((listing) => listing.claimed).length,
  };
}

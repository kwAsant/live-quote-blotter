import type { Rfq } from './../../mock-api/types';

/**
 * Checks if an RFQ's expiry date is strictly before today's calendar date in UTC.
 * Today's date is inclusive (not expired).
 */
export const isRfqExpired = (expiryDateStr: string, referenceDateUtc: Date = new Date()): boolean => {
  // 1. Extract the UTC year, month, and day for "today" to eliminate timezone shifts
  const utcYear = referenceDateUtc.getUTCFullYear();
  const utcMonth = referenceDateUtc.getUTCMonth(); // 0-indexed
  const utcDay = referenceDateUtc.getUTCDate();
  
  const todayUtcMidnight = new Date(Date.UTC(utcYear, utcMonth, utcDay));

  // 2. Parse the incoming YYYY-MM-DD expiry string at UTC midnight
  const [year, month, day] = expiryDateStr.split('-').map(Number);
  const expiryDateMidnight = new Date(Date.UTC(year, month - 1, day));

  // 3. Strictly before check
  return expiryDateMidnight.getTime() < todayUtcMidnight.getTime();
};

/**
 * Determines if an RFQ is genuinely tradeable/actionable by a trader.
 * Definition: Must be 'Open' or 'Quoted', must have a valid price, and must not be expired.
 */
export const isTradeable = (rfq: Rfq, referenceDateUtc: Date = new Date()): boolean => {
  // 1. Check status constraints
  const hasValidStatus = rfq.status === 'Open' || rfq.status === 'Quoted';
  if (!hasValidStatus) return false;

  // 2. Check price availability (Traders cannot accept a quote if there's no price yet)
  const hasPrice = rfq.direction === 'Buy' ? rfq.offer !== undefined : rfq.bid !== undefined; // changed from "best" parameters to these
  if (!hasPrice) return false;

  // 3. Check expiry constraints
  const expired = isRfqExpired(rfq.expiry, referenceDateUtc);
  if (expired) return false;

  return true;
};

/**
 * Determines if a price quote is stale (older than 30 seconds).
 */
export const isPriceStale = (lastUpdatedIso: string, maxAgeMs: number = 30000, referenceDate: Date = new Date()): boolean => {
  const lastUpdatedTime = new Date(lastUpdatedIso).getTime();
  const currentTime = referenceDate.getTime();
  
  return (currentTime - lastUpdatedTime) > maxAgeMs;
};
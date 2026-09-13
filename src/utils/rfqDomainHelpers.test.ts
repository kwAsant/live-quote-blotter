import type { Rfq } from '../../mock-api';
import { isRfqExpired, isTradeable, isPriceStale } from './rfqDomainHelpers';

describe('rfqDomainHelpers', () => {
    // We use June 16, 2026, 12:00 PM UTC for predictable testing
    const mockToday = new Date('2026-06-16T12:00:00Z');

    describe('isRfqExpired', () => {
        test('returns true if expiry is strictly before today UTC (Yesterday)', () => {
            expect(isRfqExpired('2026-06-15', mockToday)).toBe(true);
        });

        test('returns false if expiry is exactly today UTC (Inclusive)', () => {
            expect(isRfqExpired('2026-06-16', mockToday)).toBe(false);
        });

        test('returns false if expiry is in the future (Tomorrow)', () => {
            expect(isRfqExpired('2026-06-17', mockToday)).toBe(false);
        });
    });

    describe('isTradeable', () => {
        // A base RFQ template to reuse across tests
        const baseRfq: Rfq = {
            id: 'rfq_123',
            currencyPair: 'EUR/USD',
            direction: 'Buy',
            notional: 1000000,
            expiry: '2026-06-17', // Future date
            status: 'Quoted',
            offer: 1.0850,
            bid: 1.0845,
            lastUpdated: '2026-06-16T11:59:50Z',
            sequenceNumber: 1,
        };

        test('returns true for a valid, priced, non-expired open quote', () => {
            expect(isTradeable(baseRfq, mockToday)).toBe(true);
        });

        test('returns false if status is Accepted, Rejected, or Expired', () => {
            expect(isTradeable({ ...baseRfq, status: 'Accepted' }, mockToday)).toBe(false);
            expect(isTradeable({ ...baseRfq, status: 'Rejected' }, mockToday)).toBe(false);
            expect(isTradeable({ ...baseRfq, status: 'Expired' }, mockToday)).toBe(false);
        });

        test('returns false if direction is Buy but \'offer\' is missing (undefined)', () => {
            const missingOfferRfq: Rfq = { ...baseRfq, direction: 'Buy' };
            delete missingOfferRfq.offer; // Force the `offer` parameter to be completely missing

            expect(isTradeable(missingOfferRfq, mockToday)).toBe(false);
        });

        test('returns false if direction is Sell but \'bid\' is missing (undefined)', () => {
            const missingBidRfq: Rfq = { ...baseRfq, direction: 'Sell' };
            delete missingBidRfq.bid; // Force the `bid` parameter to be completely missing

            expect(isTradeable(missingBidRfq, mockToday)).toBe(false);
        });

        test('returns false if the RFQ date has expired', () => {
            expect(isTradeable({ ...baseRfq, expiry: '2026-06-15' }, mockToday)).toBe(false);
        });
    });

    describe('isPriceStale', () => {
        const lastUpdated = '2026-06-16T12:00:00.000Z';
        const maxAgeMs = 30000; // 30 seconds

        test.each([
            { elapsed: '0 seconds from the last updated time', liveTime: '2026-06-16T12:00:00.000Z', expected: false },
            { elapsed: '10 seconds from the last updated time', liveTime: '2026-06-16T12:00:10.000Z', expected: false },
            { elapsed: '29.999 seconds from the last updated time (boundary check)', liveTime: '2026-06-16T12:00:29.999Z', expected: false },
            { elapsed: '30.000 seconds from the last updated time (boundary check)', liveTime: '2026-06-16T12:00:30.000Z', expected: false },
            { elapsed: '30.001 seconds from the last updated time (boundary check)', liveTime: '2026-06-16T12:00:30.001Z', expected: true  },
            { elapsed: '45 seconds from the last updated time',    liveTime: '2026-06-16T12:00:45.000Z', expected: true  },
        ])('returns $expected when elapsed time is $elapsed', ({ liveTime, expected }) => {
            expect(isPriceStale(lastUpdated, maxAgeMs, new Date(liveTime))).toBe(expected);
        });
    });
});
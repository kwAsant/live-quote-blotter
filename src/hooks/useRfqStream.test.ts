/**
 * @jest-environment jsdom
 */
import { renderHook, act, waitFor } from '@testing-library/react';
import { useRfqStream } from './useRfqStream';
import { fetchRfqs, subscribeToQuoteUpdates } from '../../mock-api';
import type { Rfq, QuoteUpdate } from '../../mock-api';

jest.mock('../../mock-api');

const mockedFetchRfqs = fetchRfqs as jest.MockedFunction<typeof fetchRfqs>;
const mockedSubscribe = subscribeToQuoteUpdates as jest.MockedFunction<
  typeof subscribeToQuoteUpdates
>;

const baseRfq: Rfq = {
  id: 'rfq_1',
  currencyPair: 'EUR/USD',
  direction: 'Buy',
  notional: 1000000,
  expiry: '2026-12-31',
  status: 'Quoted',
  offer: 1.0850,
  bid: 1.0845,
  lastUpdated: '2026-06-21T13:59:55.000Z',
  sequenceNumber: 1,
};

describe('useRfqStream', () => {
  let pushUpdate: (update: QuoteUpdate) => void;

  beforeEach(() => {
    jest.useFakeTimers(); 
    
    jest.clearAllMocks();
    mockedFetchRfqs.mockResolvedValue([baseRfq]);
    mockedSubscribe.mockImplementation((cb) => {
      pushUpdate = cb;
      return jest.fn(); 
    });
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers(); 
    });
    jest.useRealTimers();        
  });

  test('5. A successful accept (status update pushed via the stream) updates the RFQ', async () => {
    const { result } = renderHook(() => useRfqStream());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.rfqs[0].status).toBe('Quoted');

    act(() => {
      pushUpdate({
        rfqId: 'rfq_1',
        status: 'Accepted',
        lastUpdated: '2026-06-21T14:00:01.000Z',
        sequenceNumber: 2,
      });
    });

    await waitFor(() => expect(result.current.rfqs[0].status).toBe('Accepted'));
  });

  test('bonus: ignores updates with a stale or duplicate sequence number', async () => {
    const { result } = renderHook(() => useRfqStream());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      pushUpdate({
        rfqId: 'rfq_1',
        status: 'Accepted',
        lastUpdated: '2026-06-21T14:00:01.000Z',
        sequenceNumber: 1, // same as existing — must be ignored
      });
    });

    expect(result.current.rfqs[0].status).toBe('Quoted');
  });
});
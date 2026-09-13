/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BlotterApp } from './BlotterApp';
import { useRfqStream } from '../../hooks/useRfqStream';
import { acceptQuote } from '../../../mock-api/index';
import type { Rfq } from '../../../mock-api/types';

// Mock the data-fetching hook so these tests focus purely on BlotterApp's
// own behaviour (filtering, sorting, the accept workflow UI), independent
// of useRfqStream's internal fetch/subscribe logic.
jest.mock('../../hooks/useRfqStream');
jest.mock('../../../mock-api/index', () => ({
  acceptQuote: jest.fn(),
}));

const mockedUseRfqStream = jest.mocked(useRfqStream);
const mockedAcceptQuote = acceptQuote as jest.MockedFunction<typeof acceptQuote>;

// currentTime is fixed at 14:00:00. Both RFQs below have a lastUpdated
// within the previous 30 seconds, so neither is "stale" — staleness is a
// separate concern from "tradeable" and shouldn't accidentally disable a
// quote that's supposed to be testing something else.
const mockNow = new Date('2026-06-21T14:00:00Z');

const mockRfqs: Rfq[] = [
  {
    id: 'rfq_1',
    currencyPair: 'EUR/USD',
    direction: 'Buy',
    notional: 1000000,
    expiry: '2026-12-31',
    status: 'Quoted',
    offer: 1.0850,
    bid: 1.0845,
    lastUpdated: '2026-06-21T13:59:55.000Z', // 5s old — fresh
    sequenceNumber: 1,
  },
  {
    id: 'rfq_2',
    currencyPair: 'GBP/USD',
    direction: 'Sell',
    notional: 2500000,
    expiry: '2026-06-15', // in the past relative to mockNow
    status: 'Expired',
    offer: 1.2550,
    bid: 1.2545,
    lastUpdated: '2026-06-21T13:59:40.000Z', // 20s old — fresh, but irrelevant since status is already Expired
    sequenceNumber: 1,
  },
];

describe('BlotterApp Integration Tests', () => {
  beforeEach(() => {
    mockedUseRfqStream.mockClear();
    mockedAcceptQuote.mockClear();
    mockedUseRfqStream.mockReturnValue({
      rfqs: mockRfqs,
      loading: false,
      error: null,
      currentTime: mockNow,
    });
  });

  afterEach(() => {
    jest.useRealTimers(); // clean up and restore standard system clock behavior after each test pass
  });

  test('1. RFQs render after loading, and 3. Accept button disabled state is correct', () => {
    render(<BlotterApp />);

    expect(screen.getByText('EUR/USD', { selector: 'td' })).toBeInTheDocument();
    expect(screen.getByText('GBP/USD', { selector: 'td' })).toBeInTheDocument();

    const buttons = screen.getAllByRole('button', { name: /Accept/i });
    expect(buttons[0]).not.toBeDisabled(); // EUR/USD: Quoted, priced, not expired, not stale
    expect(buttons[1]).toBeDisabled();     // GBP/USD: Expired
  });

  test('2. "Actionable only" filter cleanly isolates active quotes', () => {
    render(<BlotterApp />);

    const checkbox = screen.getByLabelText(/Actionable Quotes Only/i);
    fireEvent.click(checkbox);

    expect(screen.getByText('EUR/USD', { selector: 'td' })).toBeInTheDocument();
    expect(screen.queryByText('GBP/USD', { selector: 'td' })).not.toBeInTheDocument();
  });

  test('4. Accepting a tradeable quote opens the confirmation modal', async () => {
    render(<BlotterApp />);

    const acceptButtons = screen.getAllByRole('button', { name: /Accept/i });
    fireEvent.click(acceptButtons[0]);

    expect(await screen.findByText('Confirm Trade Execution')).toBeInTheDocument();
  });

  test('5. Confirming a trade calls acceptQuote and shows a success notification', async () => {
    mockedAcceptQuote.mockResolvedValue({
      success: true,
      rfqId: 'rfq_1',
      status: 'Accepted'
    });
    render(<BlotterApp />);

    fireEvent.click(screen.getAllByRole('button', { name: /Accept/i })[0]);
    fireEvent.click(await screen.findByRole('button', { name: /Confirm Trade/i }));

    await waitFor(() => expect(mockedAcceptQuote).toHaveBeenCalledWith('rfq_1'));
    expect(
      await screen.findByText(/Successfully executed trade for EUR\/USD/i)
    ).toBeInTheDocument();

    // Note: this proves the UI calls acceptQuote and shows success feedback.
    // The row's status badge flipping to "Accepted" is driven by the live
    // stream inside useRfqStream (mocked away here) — see
    // useRfqStream.test.ts for the test that proves that reactive update.
  });

  test('7. Sorting by currency pair changes row order', () => {
    render(<BlotterApp />);

    const rowsBefore = screen.getAllByRole('row').slice(1); // skip header row
    expect(rowsBefore[0]).toHaveTextContent('EUR/USD');

    fireEvent.change(screen.getByLabelText(/sort by/i), {
      target: { value: 'currencyPair' },
    });

    const rowsAfter = screen.getAllByRole('row').slice(1);
    expect(rowsAfter[0]).toHaveTextContent('GBP/USD'); // desc order: G before E
  });
});

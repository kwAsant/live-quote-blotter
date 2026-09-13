# Graduate Frontend Engineer — Technical Task

## Live FX Options Quote Blotter

**Timebox:** ~1 working day  
**AI tools:** Allowed — include `AI_USAGE.md` (required)

---

## Overview

Build a small **Live Quote Blotter** for a mock FX options trading platform.

We are **not** testing finance knowledge. Domain terms are explained below. We care about React, TypeScript, UI quality, async/event handling, testing, and engineering judgment.

You may use AI tools. You must **review, understand, and test** any generated code. Submit `AI_USAGE.md` describing:

- What you used AI for
- What you changed or rejected
- What you verified manually

---

## Assessment criteria

We assess:

- **Correctness** — requirements work reliably, including edge cases you discover in the mock API
- **TypeScript quality** — clear types, safe handling of optional/nullable values
- **UI quality and usability** — readable layout, sensible loading/error/empty/disabled states
- **Testing approach** — behavioural tests that prove real behaviour, not snapshot-only coverage
- **State management choices** — appropriate for the task size, with brief rationale in README
- **Accessibility awareness** — labels, keyboard-friendly modal, clear status messaging
- **Code organisation** — focused components/helpers, not one monolithic file
- **Engineering judgement** — trade-offs explained; avoids unnecessary complexity

A submission that implements all requirements with **clean, maintainable code** will score more highly than one that attempts many optional features with inconsistent quality.

---

## Domain context

An **RFQ** (request for quote) is a client asking the market for a price on an FX option.

Each RFQ has:

| Field | Example |
|---|---|
| Currency pair | EUR/USD |
| Direction | Buy or Sell |
| Notional | 1,000,000 |
| Expiry date | `YYYY-MM-DD` calendar date |
| Status | Open, Quoted, Accepted, Rejected, Expired |
| Best bid / offer | May be missing initially |
| Last updated | ISO timestamp |
| Sequence number | Increments on each quote update |

### Expiry (use this definition)

An RFQ is **expired** when its expiry date is **strictly before today's calendar date in UTC**.

- Expiry date is **inclusive**: an RFQ expiring **today** is **not** expired.
- Compare on date only (not time-of-day), e.g. parse `expiry` as `YYYY-MM-DD` and compare to today's UTC date.

This avoids timezone ambiguity in tests and review.

### Quotes traders care about

- **Tradeable quotes** — Traders should only be able to accept quotes that are genuinely tradeable. Disable accept when it would not make sense, and explain your definition in the README.
- **Freshness** — Prices older than **30 seconds** should be visually distinct so traders know the price may no longer be valid.
- **Live data** — The feed can change RFQs after the initial load. Run the app, watch the stream for a minute, then read `mock-api/README.md` and the source if anything surprises you.

---

## Your task

Build a React/TypeScript screen: **Live Quote Blotter**.

### Functional requirements

1. Load initial RFQs from the provided mock API (`fetchRfqs`).
2. Display RFQs in a table or card layout.
3. Show **loading**, **empty**, and **error** states.
4. Subscribe to **live quote updates** (`subscribeToQuoteUpdates`).
5. Filter by:
   - Currency pair
   - Status
   - "Actionable only" toggle (show only tradeable quotes per your definition)
6. **Sort** by:
   - Last updated
   - Currency pair
7. Highlight **stale** rows (older than 30 seconds since `lastUpdated`).
8. **Accept** workflow:
   - Button disabled when the quote is not tradeable
   - Confirmation modal before accept
   - Success or error feedback after `acceptQuote`
9. Responsive layout for smaller screens.
10. Basic accessibility: labels, button text, keyboard-friendly modal, status messaging.

### Live data

The mock API is **asynchronous** and **event-driven** — similar to a WebSocket or event bus in production. Treat it as a black box at first: build the happy path, run the app, observe the stream, then dig into the API docs and implementation when behaviour is unclear.

Document any non-obvious cases you handled (or deliberately ignored) and why in your README.

### Technical requirements

| Required | Notes |
|---|---|
| React + TypeScript | |
| Styling | Any approach is valid: plain CSS, CSS modules, SCSS, Stylus, Tailwind, styled-components, etc. |
| Jest + React Testing Library | Behavioural component/integration tests |
| Playwright | See minimum tests below |
| State management | Choose the **simplest approach you believe is appropriate** (local state, Context, Zustand, Redux Toolkit, etc.) and **explain your choice** in `README.md` |

### Pure helper unit test (required)

Extract at least one piece of **pure business logic** into a testable helper (separate from React components) and cover it with **dedicated unit tests** — not DOM tests.

We want to see reasoning about state transitions and data rules, not only rendering.

### Minimum tests

| # | Test |
|---|---|
| 1 | RFQs render after loading |
| 2 | "Actionable only" filter hides non-tradeable RFQs |
| 3 | Accept disabled for non-tradeable RFQs |
| 4 | Accepting a tradeable RFQ opens confirmation modal |
| 5 | Successful accept updates RFQ status |
| 6 | At least one **pure helper** unit test |
| 7 | Sorting works (last updated or currency pair) |
| 8 | **Playwright:** page loads **and** either a **filter interaction** works **or** the **accept workflow** completes successfully |

### Submission

- Git repo or zip
- `README.md` — setup, assumptions, state-management rationale, **behaviour & edge cases** (what you observed, what you handled and why), improvements with more time
- `AI_USAGE.md` — required

---

## Mock API

Copy the `mock-api/` folder into your project (or install as a local package).

```ts
import {
  fetchRfqs,
  subscribeToQuoteUpdates,
  acceptQuote,
  type Rfq,
  type QuoteUpdate,
} from './mock-api';
```

See `mock-api/README.md` for the API contract, configuration options, and test helpers.

### Types (summary)

```ts
export type RfqStatus = 'Open' | 'Quoted' | 'Accepted' | 'Rejected' | 'Expired';
export type Direction = 'Buy' | 'Sell';

export interface Rfq {
  id: string;
  currencyPair: string;
  direction: Direction;
  notional: number;
  expiry: string; // YYYY-MM-DD
  status: RfqStatus;
  bid?: number;
  offer?: number;
  lastUpdated?: string; // ISO-8601
  sequenceNumber: number;
}

export interface QuoteUpdate {
  rfqId: string;
  bid?: number;
  offer?: number;
  status?: RfqStatus;
  lastUpdated: string;
  sequenceNumber: number;
}
```

---

## What we assess (summary)

Correctness, code quality, UI judgment, TypeScript discipline, testing approach, trade-off communication, and honest AI usage.

We are not looking for perfection. We are looking for evidence you can work safely in a production UI codebase — including investigating unfamiliar APIs and deciding how to handle ambiguous real-time data.

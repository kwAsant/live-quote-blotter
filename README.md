# Real-Time FX Option Live Quote Blotter

A simulated real-time FX Option Request-For-Quote (RFQ) blotter built with **React, TypeScript, and Vite**.

The application models a trading-style interface where FX option RFQs are received, updated, filtered, sorted, and executed through a confirmation workflow. It includes simulated quote streaming, sequence-number handling, stale-price protection, asynchronous execution, and an execution audit log.

## Key Features

### Simulated Real-Time RFQ Stream

- Generates new RFQs and quote updates at configurable intervals.
- Models RFQ lifecycle events including creation, quoting, rejection, expiry, and acceptance.
- Uses per-RFQ sequence numbers to prevent stale or out-of-order updates from overwriting newer data.
- Simulates asynchronous market-data behaviour without requiring an external market-data service.

### Quote Blotter

- Trading-style dark interface for monitoring live RFQs.
- Displays:
  - Currency pair
  - Direction
  - Notional
  - Expiry
  - RFQ status
  - Execution price
  - Last update time
- Automatically reflects incoming quote updates.

### Tradeability & Stale-Price Protection

- Determines whether an RFQ can currently be executed.
- Prevents execution when quotes are expired, inactive, or stale.
- Applies the correct execution price based on trade direction:
  - **Buy:** offer price
  - **Sell:** bid price
- Clearly identifies inactive and stale quotes in the blotter.

### Filtering & Sorting

- Filter RFQs by currency pair.
- Filter RFQs by buy/sell direction.
- Filter for actionable quotes.
- Sort the blotter using multiple fields.

### Trade Execution Workflow

- Provides a confirmation modal before execution.
- Displays the RFQ details and execution price before confirmation.
- Simulates asynchronous server-side execution responses.
- Handles both successful and failed execution attempts.
- Prevents duplicate execution attempts while a request is in progress.

### Execution Audit Log

- Records trade execution attempts.
- Records successful and failed executions.
- Displays execution details separately from the live quote blotter.
- Provides a scrollable history for reviewing previous activity.

### Testing

- Unit tests for core RFQ and quote business logic.
- React Testing Library integration tests.
- Playwright end-to-end browser tests.
- Coverage reporting for the tested application logic.

---

## Architecture

The application separates the market-data simulation, domain logic, state management, and presentation layers.

```text
┌─────────────────────┐
│      Mock API       │
│                     │
│ RFQ generation      │
│ Quote updates       │
│ Execution responses │
└──────────┬──────────┘
           │
           │ RFQ / Quote Updates
           ▼
┌─────────────────────┐
│    useRfqStream     │
│                     │
│ Live RFQ state      │
│ Sequence handling   │
│ Update subscription │
└──────────┬──────────┘
           │
           │ Current RFQs
           ▼
┌─────────────────────┐
│    Quote Blotter    │
│                     │
│ Filtering           │
│ Sorting             │
│ Tradeability        │
│ Stale-price checks  │
└──────────┬──────────┘
           │
           │ Accept
           ▼
┌─────────────────────┐
│ Confirmation Modal  │
└──────────┬──────────┘
           │
           │ Execute
           ▼
┌─────────────────────┐
│    Mock Execution   │
│        API          │
└──────────┬──────────┘
           │
           │ Result
           ▼
┌─────────────────────┐
│     Audit Log       │
└─────────────────────┘
```

## RFQ Update Handling

Each RFQ maintains a monotonically increasing `sequenceNumber`.

When an update is received, the application compares the incoming sequence number with the current RFQ version.

```text
Incoming Update
      │
      ▼
Is sequence number newer?
      │
   ┌──┴──┐
   │     │
  Yes    No
   │     │
   ▼     ▼
Apply   Ignore
Update  Update
```

Older or duplicate updates are ignored, preventing stale market data from overwriting newer state.

This provides predictable update handling within the simulated streaming environment and mirrors an important consideration when consuming asynchronous market-data feeds.

---

## Tech Stack

### Frontend

- **React 18**
- **TypeScript**
- **Vite**
- **CSS3**

### Testing

- **Jest**
- **React Testing Library**
- **Playwright**

### Code Quality

- **ESLint**
- Strict TypeScript
- Typed API and domain models
- Automated testing

---

## Project Structure

```text
live-quote-blotter/
│
├── .github/
│   └── workflows/
│
├── mock-api/
│   ├── mock-api.ts
│   ├── mock-data.ts
│   └── types.ts
│
├── public/
│
├── src/
│   ├── components/
│   │   ├── BlotterApp/
│   │   ├── FilterSortBar/
│   │   └── QuoteBlotter/
│   │
│   ├── hooks/
│   │
│   ├── utils/
│   │
│   ├── App.tsx
│   ├── App.css
│   └── index.css
│
├── tests/
│
├── .gitignore
├── AI_USAGE.md
├── TASK-BRIEF.md
├── eslint.config.js
├── index.html
├── jest.config.cjs
├── package.json
├── playwright.config.ts
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── tsconfig.test.json
├── vite.config.ts
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js
- npm

### Installation

Clone the repository:

```bash
git clone https://github.com/kwAsant/live-quote-blotter.git
cd live-quote-blotter
```

Install the project dependencies:

```bash
npm install
```

### Start the Development Server

```bash
npm run dev
```

Vite will start the development server and provide the local URL in the terminal.

---

## Testing

### Unit and Integration Tests

Run the Jest test suite:

```bash
npm test
```

### Test Coverage

Run the tests with coverage reporting:

```bash
npm test -- --coverage
```

### End-to-End Tests

Run the Playwright browser tests:

```bash
npx playwright test
```

### Production Build

Build the application for production:

```bash
npm run build
```

---

## Design Considerations

The project focuses on several problems relevant to real-time financial interfaces.

### 1. Asynchronous Market Data

Market-data updates may arrive independently of the UI's current state. The application therefore treats incoming updates as events and uses sequence numbers to determine whether an update should be applied.

### 2. Separation of Domain Logic

RFQ rules such as expiry, tradeability, and stale-price checks are kept separate from presentation components.

This allows business rules to be tested independently of the UI.

### 3. Stale-Price Protection

A quote may become unsuitable for execution even when the RFQ itself remains active.

The application therefore checks both the RFQ state and the age of the latest quote before allowing execution.

### 4. Asynchronous Execution

Accepting a quote does not immediately assume success. The mock execution API introduces an asynchronous response and can simulate execution failures.

This allows the UI to handle realistic states such as:

```text
Ready → Executing → Accepted
                  └→ Failed
```

### 5. Auditability

Execution attempts are recorded in an audit log so that activity can be reviewed independently from the current state of the live blotter.

---

## Simulated Market Data

The application intentionally uses a mock API rather than a real financial market-data provider.

The mock API can simulate:

- Initial RFQ retrieval
- New RFQ arrivals
- Quote updates
- RFQ rejection
- RFQ expiry
- Execution success and failure
- Out-of-order or duplicate updates

This keeps the project self-contained while allowing real-time application behaviour to be demonstrated without external services or financial transactions.

**No real trades are executed and no real market data is consumed.**

---

## Repository

Source code and project history are available on GitHub:

**[github.com/kwAsant/live-quote-blotter](https://github.com/kwAsant/live-quote-blotter)**

---

## Project Focus

This project was developed to explore the engineering challenges involved in building a real-time trading-style interface, with particular emphasis on:

- Strong TypeScript typing
- Event-driven state updates
- Asynchronous data handling
- Defensive handling of stale data
- Separation of domain logic and presentation
- Testable business rules
- End-to-end UI testing
- Clear execution and audit workflows

## Next Steps

The core application workflow and business rules are currently covered by unit, integration, and end-to-end tests. Further testing would focus on edge cases and failure scenarios that are particularly relevant to a real-time trading interface.

### Planned Test Coverage

- **Out-of-Order Quote Updates**
  - Verify that a newer quote update is applied correctly.
  - Verify that older or duplicate updates cannot overwrite newer RFQ state.

- **RFQ Creation Events**
  - Verify that a newly created RFQ received from the simulated stream appears in the live blotter.
  - Verify that newly created RFQs are initialised with the correct status and sequence number.

- **Directional Execution Pricing**
  - Verify that a `Buy` RFQ uses the offer price for execution.
  - Verify that a `Sell` RFQ uses the bid price for execution.

- **Stale Quote Protection**
  - Verify that a stale quote cannot be executed through the UI.
  - Test the stale-price boundary around the configured maximum quote age.

- **Execution Failure Handling**
  - Simulate a failed `acceptQuote` response.
  - Verify that the UI displays an appropriate failure notification.
  - Verify that a failed execution does not incorrectly mark the RFQ as accepted.

- **Expired RFQ Protection**
  - Verify that an expired RFQ cannot be executed.
  - Verify that expiry remains enforced even when a quote has a valid price.

- **Audit Log**
  - Verify that successful executions create an audit entry.
  - Verify that failed execution attempts are also recorded correctly.
  - Verify that the audit log displays the expected RFQ, status, and execution details.

- **Additional End-to-End Scenarios**
  - Extend the Playwright suite beyond the successful execution path to cover failed execution, stale quotes, filtering, and RFQ lifecycle changes.

These tests would strengthen coverage of the application's defensive behaviour without adding tests solely for the purpose of increasing a coverage percentage.
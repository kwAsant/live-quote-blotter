# Real-Time FX Option Live Quote Blotter

A low-latency, deterministic FX Option Request-For-Quote (RFQ) blotter built with React, TypeScript, Vite, Jest, and Playwright. Designed for real-time trade execution monitoring, multi-criteria quote filtering, dynamic sorting, and stale-price protection.

---

## Key Features

- **Reactive Streaming Engine:** Subscribes to mock WebSocket quote updates with custom sequence-number deduplication.
- **Domain Business Logic:** Pure helper pipelines for evaluating quote tradeability, expiry status, and stale-price locks.
- **Interactive UI:** Dark-themed financial layout with custom filters (Currency, Direction, Actionable Only) and multi-field sorting.
- **Modal Workflow:** Asynchronous trade confirmation modal handling server-side execution notifications.
- **Multi-Layered Test Coverage:** 100% test coverage across pure domain logic, React Testing Library integration suites, and Playwright E2E browser flows.

---

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite, CSS3
- **Testing:** Jest, React Testing Library, Playwright
- **Code Quality:** ESLint (`recommendedTypeChecked`), Strict TypeScript

---

## Getting Started

### Installation
```bash
git clone [https://github.com/your-username/live-quote-blotter.git](https://github.com/your-username/live-quote-blotter.git)
cd live-quote-blotter
npm install
```
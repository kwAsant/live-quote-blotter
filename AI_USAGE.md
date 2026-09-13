# AI Usage Disclosure

AI tool(s) used: **Gemini**, **Claude**

## What I used AI for

- **Diagnosing a Jest/TypeScript config failure.** `npm test` initially failed with `Cannot find name 'describe'/'test'/'expect'`. After sharing the test file, source file, and terminal output, Gemini traced this to `@types/jest` not being installed and `ts-jest` having no `tsconfig` set in `jest.config.cjs` — it was falling back to the bare root `tsconfig.json` (no `compilerOptions` of its own) instead of either `tsconfig.app.json` or `tsconfig.node.json`. Gemini proposed a dedicated `tsconfig.test.json` (CommonJS, `esModuleInterop`, `jest`/`node` types) and a `jest.config.cjs` change pointing ts-jest's transform option at it.

- **Fixing real TypeScript type errors in the test file.** Once the Jest-global errors cleared, genuine `TS2345`/`TS2790` errors remained: `baseRfq` was an untyped object literal, so TypeScript widened `direction`/`status` to `string` and inferred `bid`/`offer` as always-present, which broke the `delete missingOfferRfq.offer` calls used to simulate a missing price. Gemini's fix was to annotate `baseRfq` (and the two mutated copies) explicitly as `Rfq`, which is reflected in the current `rfqDomainHelpers.test.ts`.

- **Diagnosing a failing test that turned out to be a real production bug.** Two tests still failed after the type fixes: `isTradeable` returned `true` when it should have returned `false` for a `Buy` order missing its `offer`. Gemini traced this to a single inverted ternary in `isTradeable` (`rfqDomainHelpers.ts`) that checked `bid` for `Buy` orders and `offer` for `Sell` orders — backwards from FX convention — and proposed the one-line fix now in the current file.

- **UI/CSS design and implementation.** Asked for help making the blotter UI look more like a professional trading terminal. Gemini proposed a dark-themed redesign (status badges, buy/sell direction indicators with arrows, monospaced numeric columns) and produced the full `App.css` stylesheet plus matching edits to `QuoteRow.tsx` (direction span markup) and `QuoteBlotterTable.tsx` (column group, shorter header labels).

- **Pre-submission code review.** Asked Gemini to review the codebase before submitting. It flagged: 
  - (1) confusing/inconsistent indentation in `useRfqStream`'s subscription `useEffect` (functionally correct, but recommended cleanup for readability — applied in the current file); 
  - (2) an un-cancelled `setTimeout` in `BlotterApp` that could call `setNotification` after the component unmounts — fixed with a `useRef`-tracked timer plus a cleanup effect, applied in the current `BlotterApp.tsx`; (3) the project's own `README.md` template recommending an ESLint upgrade to `tseslint.configs.recommendedTypeChecked` with `parserOptions`, which was not independently confirmed.

- **Explaining a lint error.** Hit `@typescript-eslint/no-misused-promises` on `onConfirm={handleConfirmTrade}` in `BlotterApp`, since `handleConfirmTrade` is `async` (`Promise<void>`) but `ConfirmationModal`'s `onConfirm` prop is typed as a plain `() => void`. Gemini/Claude recommended widening the prop type to `() => Promise<void>` rather than discarding the promise with the `void` operator.

- **Writing the component/integration test suite**. Asked Claude to write
the missing Jest + React Testing Library tests (requirements 1–5, 7) and
the useRfqStream hook test (requirement 5's reactive update path). Claude
identified two blocking issues before writing any test code: (1)
testEnvironment: 'node' in jest.config.cjs — RTL needs jsdom;
(2) no "jsx" option in tsconfig.test.json, so .tsx files wouldn't
compile under ts-jest. It also caught a fixture bug in an earlier draft
where lastUpdated was set 2 hours before currentTime, silently making
the "tradeable" RFQ stale and disabling the Accept button — contradicting
the test's own assertion. The fix was to make lastUpdated 5 seconds
before currentTime instead.

- **Reviewing `blotter.spec.ts`**. Asked Claude to assess the Playwright
spec. It flagged that `toHaveText('FX OPTION LIVE QUOTE BLOTTER')` would
fail because Playwright's toHaveText reads raw DOM textContent, which
ignores CSS text-transform: uppercase — the actual DOM text is
'FX Option Live Quote Blotter' as written in the JSX. The fix (adding
{ ignoreCase: true } to the assertion) was applied and verified. Claude
also noted the CSS-class-based locators (.app-header h2, .btn-primary)
couple the test to implementation rather than user-facing behavior, but
this was not changed since the test passes and the selectors are stable
enough for the brief's scope.

## What I changed or rejected

- [x] Applied the `baseRfq: Rfq` typing fix to the test file — confirmed in
      current `rfqDomainHelpers.test.ts`
- [x] Applied the `isTradeable` bid/offer fix — confirmed in current
      `rfqDomainHelpers.ts`
- [x] Applied the `useRfqStream` indentation/structure cleanup — confirmed
      in current `useRfqStream.ts`
- [x] Applied the `BlotterApp` notification-timer ref fix — confirmed in
      current `BlotterApp.tsx`
- [x] Applied the `App.css` / `QuoteRow.tsx` / `QuoteBlotterTable.tsx`
      redesign — confirmed in current files
- [x] Applied the `tsconfig.test.json` + `jest.config.cjs` fix
- [x] Applied the ESLint `recommendedTypeChecked` upgrade
- [x] Resolved `no-misused-promises` by widening `ConfirmationModal`'s
      `onConfirm` type.
- [x] Fixed lastUpdated fixture timestamps in BlotterApp.test.tsx so
the test's "tradeable" RFQ is not accidentally stale
- [x] Formatted and reviewed the generated `README.md` and `AI_USAGE.md` markdown files to ensure absolute parity with the project's completed execution architecture.

## What I verified manually

- Ran `npm test` after each fix and confirmed all tests pass.
- Ran `npx playwright test` and confirmed the e2e spec passes against the
running dev server.
- Ran `npm run dev` and manually exercised: filtering by currency/direction, the "Actionable Quotes Only" toggle, sorting, accepting a trade, and the expiry/staleness behaviour over time.
- Ran the lint script and confirmed no outstanding warnings remain.
- Visually reviewed the redesigned UI in the browser; happy with the appearance.
- Checked the logic of the AI, and tried to understand its motivations with each engineering step.
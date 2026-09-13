import { INITIAL_RFQS } from './mock-data';
import type {
	AcceptQuoteResponse,
	QuoteUpdate,
	QuoteUpdateCallback,
	Rfq,
	Unsubscribe,
} from './types';

export interface MockApiConfig {
	/** Artificial latency for fetchRfqs (ms). Default 600. */
	fetchDelayMs?: number;

	/** Probability [0–1] that fetchRfqs rejects. Default 0. */
	fetchFailureRate?: number;

	/** Interval between scheduled live updates (ms). Default 2000. Set 0 to disable auto stream. */
	updateIntervalMs?: number;

	/** Probability [0–1] that acceptQuote rejects. Default 0.1. */
	acceptFailureRate?: number;

	/** Probability [0–1] that a quoted RFQ gets rejected during simulation. */
	rejectionProbability?: number;

	/** RFQ ids that always fail accept (e.g. for deterministic tests). */
	acceptAlwaysFailIds?: string[];

	/** When true, fetchRfqs resolves with an empty array (empty-state tests). */
	fetchReturnsEmpty?: boolean;

	/** Probability [0–1] that a new RFQ is created on each simulation tick. */
	newRfqProbability?: number;

	/** Maximum number of RFQs held in the simulated blotter. */
	maxRfqs?: number;

	/** Probability [0–1] that an existing RFQ receives a new quote. */
	quoteUpdateProbability?: number;
}

const DEFAULT_CONFIG: Required<MockApiConfig> = {
	fetchDelayMs: 600,
	fetchFailureRate: 0,
	updateIntervalMs: 2000,
	acceptFailureRate: 0.1,
	rejectionProbability: 0.08,
	newRfqProbability: 0.35,
	maxRfqs: 8,
	quoteUpdateProbability: 0.75,
	acceptAlwaysFailIds: ['rfq-007'],
	fetchReturnsEmpty: false,
};

let config: Required<MockApiConfig> = { ...DEFAULT_CONFIG };

/** In-memory store mutated by live updates and accept actions. */
let rfqStore: Rfq[] = INITIAL_RFQS.map((r) => ({ ...r }));

/** Per-RFQ sequence counter for generating updates. */
const sequenceCounters = new Map<string, number>(
	INITIAL_RFQS.map((r) => [r.id, r.sequenceNumber]),
);

const subscribers = new Set<QuoteUpdateCallback>();
let updateTimer: ReturnType<typeof setInterval> | undefined;

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const cloneRfqs = (): Rfq[] => rfqStore.map((r) => ({ ...r }));

const nextSequence = (rfqId: string): number => {
	const current = sequenceCounters.get(rfqId) ?? 0;
	const next = current + 1;
	sequenceCounters.set(rfqId, next);
	return next;
};

const randomItem = <T,>(items: T[]): T =>
    items[Math.floor(Math.random() * items.length)];

const daysFromNow = (days: number): string => {
	const d = new Date();
	d.setUTCDate(d.getUTCDate() + days);
	return d.toISOString().slice(0, 10);
};

const CURRENCY_PAIRS = [
    'EUR/USD',
    'GBP/USD',
    'USD/JPY',
    'USD/CAD',
    'AUD/USD',
    'EUR/GBP',
];



const randomNotional = (): number => {
    const amounts = [
        500_000,
        750_000,
        1_000_000,
        1_500_000,
        2_000_000,
        2_500_000,
        3_000_000,
        4_000_000,
        5_000_000,
    ];

    return randomItem(amounts);
};

const createMockRfq = (): Rfq => {
    const id = `rfq-${String(Date.now())}`;

    const currencyPair = randomItem(CURRENCY_PAIRS);
    const direction: Rfq['direction'] =
        Math.random() < 0.5 ? 'Buy' : 'Sell';

    const sequenceNumber = 0;

    return {
        id,
        currencyPair,
        direction,
        notional: randomNotional(),
        expiry: daysFromNow(
            Math.floor(Math.random() * 30) + 1
        ),
        status: 'Open',
        sequenceNumber,
    };
};

const emit = (update: QuoteUpdate): void => {
	subscribers.forEach((cb) => {
		try {
			cb(update);
		} catch (err) {
			// eslint-disable-next-line no-console
			console.error('[mock-api] subscriber error', err);
		}
	});
};

const TERMINAL_STATUSES: Rfq['status'][] = ['Accepted', 'Rejected', 'Expired'];

const applyUpdateToStore = (update: QuoteUpdate): void => {
	const idx = rfqStore.findIndex((r) => r.id === update.rfqId);
	if (idx === -1) return;

	const current = rfqStore[idx];
	if (update.sequenceNumber <= current.sequenceNumber) {
		return;
	}

	// Terminal states are not overwritten by late stream messages (client should mirror this).
	const nextStatus =
		TERMINAL_STATUSES.includes(current.status) && update.status !== undefined
			? current.status
			: (update.status ?? current.status);

	rfqStore[idx] = {
		...current,
		bid: update.bid !== undefined ? update.bid : current.bid,
		offer: update.offer !== undefined ? update.offer : current.offer,
		status: nextStatus,
		lastUpdated: update.lastUpdated,
		sequenceNumber: update.sequenceNumber,
	};
};

const runNextScenario = (): void => {
	const scenario = UPDATE_SCENARIOS[scenarioIndex % UPDATE_SCENARIOS.length];
	scenarioIndex += 1;
	const result = scenario();
	const updates = Array.isArray(result) ? result : [result];
	updates.forEach((u) => {
		applyUpdateToStore(u);
		emit(u);
	});
};

const processRandomLifecycleEvent = (): void => {
    const candidates = rfqStore.filter(
        (rfq) =>
            rfq.status === 'Quoted' ||
            rfq.status === 'Open'
    );

    if (candidates.length === 0) {
        return;
    }

    const rfq = randomItem(candidates);

    if (rfq.status === 'Quoted' &&
        Math.random() < config.rejectionProbability) {

        const update: QuoteUpdate = {
            rfqId: rfq.id,
            status: 'Rejected',
            lastUpdated: new Date().toISOString(),
            sequenceNumber: nextSequence(rfq.id),
        };

        applyUpdateToStore(update);
        emit(update);

        return;
    }

    // Occasionally expire quotes whose expiry date has passed.
    if (rfq.expiry <= new Date().toISOString().slice(0, 10)) {
        const update: QuoteUpdate = {
            rfqId: rfq.id,
            status: 'Expired',
            lastUpdated: new Date().toISOString(),
            sequenceNumber: nextSequence(rfq.id),
        };

        applyUpdateToStore(update);
        emit(update);
    }
};

const createAndEmitRfq = (): void => {
	if (rfqStore.length >= config.maxRfqs) {
		return;
	}

	const rfq = createMockRfq();

	rfqStore.push(rfq);

	sequenceCounters.set(rfq.id, 0);

	const event: QuoteUpdate = {
		rfqId: rfq.id,
		rfq,
		status: 'Open',
		lastUpdated: new Date().toISOString(),
		sequenceNumber: 0,
	};

	emit(event);
};


/** Scripted update scenarios — includes out-of-order delivery. */
const UPDATE_SCENARIOS: Array<() => QuoteUpdate | QuoteUpdate[]> = [
	() => ({
		rfqId: 'rfq-001',
		bid: 0.118,
		offer: 0.122,
		status: 'Quoted',
		lastUpdated: new Date().toISOString(),
		sequenceNumber: nextSequence('rfq-001'),
	}),
	() => ({
		rfqId: 'rfq-003',
		offer: 0.099,
		status: 'Quoted',
		lastUpdated: new Date().toISOString(),
		sequenceNumber: nextSequence('rfq-003'),
	}),
	// Out-of-order pair: higher sequence arrives before lower
	() => {
		const rfqId = 'rfq-002';
		const seq12 = nextSequence('rfq-002');
		const seq11 = seq12 - 1;
		const t = new Date().toISOString();
		return [
			{
				rfqId,
				bid: 0.125,
				offer: 0.129,
				status: 'Quoted',
				lastUpdated: t,
				sequenceNumber: seq12,
			},
			{
				rfqId,
				bid: 0.1,
				offer: 0.2,
				status: 'Quoted',
				lastUpdated: t,
				sequenceNumber: seq11,
			},
		];
	},
	() => ({
		rfqId: 'rfq-005',
		bid: 0.103,
		offer: 0.107,
		status: 'Quoted',
		lastUpdated: new Date().toISOString(),
		sequenceNumber: nextSequence('rfq-005'),
	}),
	() => ({
		rfqId: 'rfq-007',
		bid: 0.088,
		offer: 0.092,
		status: 'Quoted',
		lastUpdated: new Date().toISOString(),
		sequenceNumber: nextSequence('rfq-007'),
	}),
	() => ({
		rfqId: 'rfq-002',
		bid: 0.124,
		offer: 0.128,
		status: 'Quoted',
		lastUpdated: new Date().toISOString(),
		sequenceNumber: nextSequence('rfq-002'),
	}),
	// Unknown RFQ — not in initial fetchRfqs() payload
	() => ({
		rfqId: 'rfq-999',
		bid: 0.051,
		offer: 0.054,
		status: 'Quoted',
		lastUpdated: new Date().toISOString(),
		sequenceNumber: 1,
	}),
	// Delayed quote after accept — if rfq-002 was accepted, should not regress to Quoted in UI
	() => ({
		rfqId: 'rfq-002',
		bid: 0.131,
		offer: 0.136,
		status: 'Quoted',
		lastUpdated: new Date().toISOString(),
		sequenceNumber: nextSequence('rfq-002'),
	}),
];

let scenarioIndex = 0;

const runSimulationTick = (): void => {
    // New RFQ arrives
    if (Math.random() < config.newRfqProbability) {
        createAndEmitRfq();
    }

    // Existing RFQ gets a new price
    if (Math.random() < config.quoteUpdateProbability) {
        updateRandomRfq();
    }

    // Occasionally transition an RFQ
    if (Math.random() < 0.15) {
        processRandomLifecycleEvent();
    }
};

const updateRandomRfq = (): void => {
    const candidates = rfqStore.filter(
        (rfq) =>
            rfq.status === 'Open' ||
            rfq.status === 'Quoted'
    );

    if (candidates.length === 0) {
        return;
    }

    const rfq = randomItem(candidates);

    const sequenceNumber = nextSequence(rfq.id);
    const now = new Date().toISOString();

    const basePrice = 0.08 + Math.random() * 0.06;
    const spread = 0.002 + Math.random() * 0.003;

    const bid = Number(basePrice.toFixed(4));
    const offer = Number(
        (basePrice + spread).toFixed(4)
    );

    const update: QuoteUpdate = {
        rfqId: rfq.id,
        bid,
        offer,
        status: 'Quoted',
        lastUpdated: now,
        sequenceNumber,
    };

    applyUpdateToStore(update);
    emit(update);
};

const startUpdateStream = (): void => {
	if (config.updateIntervalMs <= 0 || updateTimer) return;
	updateTimer = setInterval(
		runSimulationTick,
		config.updateIntervalMs
	);
};

const stopUpdateStream = (): void => {
	if (updateTimer) {
		clearInterval(updateTimer);
		updateTimer = undefined;
	}
};

/**
 * Fetch the current RFQ list (async).
 * May reject based on config.fetchFailureRate.
 */
export async function fetchRfqs(): Promise<Rfq[]> {
	await delay(config.fetchDelayMs);
	if (Math.random() < config.fetchFailureRate) {
		throw new Error('Failed to load RFQs. Please try again.');
	}
	if (config.fetchReturnsEmpty) {
		return [];
	}
	return cloneRfqs();
}

/**
 * Subscribe to live quote updates (event-driven).
 * Returns an unsubscribe function — call it on unmount.
 *
 * Updates may arrive out of order. Each update includes a per-RFQ sequenceNumber.
 */
export function subscribeToQuoteUpdates(callback: QuoteUpdateCallback): Unsubscribe {
	subscribers.add(callback);
	startUpdateStream();
	return () => {
		subscribers.delete(callback);
		if (subscribers.size === 0) {
			stopUpdateStream();
		}
	};
}

/**
 * Accept an actionable quote.
 * Resolves to success or structured failure.
 */
export async function acceptQuote(rfqId: string): Promise<AcceptQuoteResponse> {
	await delay(400 + Math.random() * 400);

	const rfq = rfqStore.find((r) => r.id === rfqId);
	if (!rfq) {
		return { success: false, rfqId, message: 'RFQ not found.' };
	}

	if (config.acceptAlwaysFailIds.includes(rfqId) || Math.random() < config.acceptFailureRate) {
		return {
			success: false,
			rfqId,
			message: 'Accept rejected by liquidity provider. Please refresh and try again.',
		};
	}

	const idx = rfqStore.findIndex((r) => r.id === rfqId);
	const acceptedAt = new Date().toISOString();
	const seq = nextSequence(rfqId);

	rfqStore[idx] = {
		...rfqStore[idx],
		status: 'Accepted',
		lastUpdated: acceptedAt,
		sequenceNumber: seq,
	};

	const update: QuoteUpdate = {
		rfqId,
		status: 'Accepted',
		lastUpdated: acceptedAt,
		sequenceNumber: seq,
	};

	emit(update);

	return { success: true, rfqId, status: 'Accepted' };
}

// ---------------------------------------------------------------------------
// Test / Storybook helpers (documented in README)
// ---------------------------------------------------------------------------

/** Reset store and subscribers — use in tests between cases. */
export function __resetMockApi(overrides?: MockApiConfig): void {
	stopUpdateStream();
	subscribers.clear();
	rfqStore = INITIAL_RFQS.map((r) => ({ ...r }));
	sequenceCounters.clear();
	INITIAL_RFQS.forEach((r) => sequenceCounters.set(r.id, r.sequenceNumber));
	scenarioIndex = 0;
	config = { ...DEFAULT_CONFIG, ...overrides };
}

/** Configure mock behaviour at runtime (tests, Storybook). */
export function __configureMockApi(overrides: MockApiConfig): void {
	config = { ...config, ...overrides };
	if (config.updateIntervalMs <= 0) {
		stopUpdateStream();
	} else if (subscribers.size > 0) {
		stopUpdateStream();
		startUpdateStream();
	}
}

/** Manually push an update (unit tests). */
export function __emitQuoteUpdate(update: QuoteUpdate): void {
	applyUpdateToStore(update);
	emit(update);
}

/** Read current store without fetch delay (assertions). */
export function __getRfqsSnapshot(): Rfq[] {
	return cloneRfqs();
}



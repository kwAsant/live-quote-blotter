import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRfqStream } from '../../hooks/useRfqStream';
import { FilterSortBar } from '../FilterSortBar/FilterSortBar';
import type {
    SortField,
    SortOrder,
} from '../FilterSortBar/FilterSortBar';
import { QuoteBlotterTable } from '../QuoteBlotter/QuoteBlotterTable';
import { ConfirmationModal } from '../ConfirmationModal/ConfirmationModal';
import { isTradeable } from '../../utils/rfqDomainHelpers';
import { acceptQuote } from '../../../mock-api/index';
import type { Rfq, RfqStatus } from '../../../mock-api/types';

export interface AuditLogEntry {
    id: string;
    timestamp: string;
    rfqId: string;
    pair: string;
    action: string;
    status: 'Success' | 'Failed';
}

type Notification = {
    message: string;
    type: 'success' | 'error';
};

export const BlotterApp: React.FC = () => {
    // -------------------------------------------------------------------------
    // LIGHT/DARK MODE
    // -------------------------------------------------------------------------
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');

    // -------------------------------------------------------------------------
    // RFQ STREAM
    // -------------------------------------------------------------------------

    const {
        rfqs: streamedRfqs,
        loading,
        error,
        currentTime,
    } = useRfqStream();

    /*
     * Instead of copying the entire streamed RFQ list into local state,
     * we only store temporary optimistic changes.
     *
     * Example:
     *
     * {
     *   "rfq-123": { status: "Accepted" }
     * }
     *
     * The actual RFQ data still comes from useRfqStream().
     */
    const [optimisticUpdates, setOptimisticUpdates] = useState<
        Record<string, Partial<Rfq>>
    >({});

    // -------------------------------------------------------------------------
    // FILTER & SORT STATE
    // -------------------------------------------------------------------------

    const [ccyPairFilter, setCcyPairFilter] =
        useState<string>('All');

    const [directionFilter, setDirectionFilter] =
        useState<'All' | 'Buy' | 'Sell'>('All');

    const [statusFilter, setStatusFilter] =
        useState<RfqStatus | 'All'>('All');

    const [showActionableOnly, setShowActionableOnly] =
        useState<boolean>(false);

    const [sortField, setSortField] =
        useState<SortField>('lastUpdated');

    const [sortOrder, setSortOrder] =
        useState<SortOrder>('desc');

    // -------------------------------------------------------------------------
    // TRADE EXECUTION STATE
    // -------------------------------------------------------------------------

    const [selectedRfq, setSelectedRfq] =
        useState<Rfq | null>(null);

    const [isExecuting, setIsExecuting] =
        useState<boolean>(false);

    const [notification, setNotification] =
        useState<Notification | null>(null);

    // -------------------------------------------------------------------------
    // AUDIT LOG
    // -------------------------------------------------------------------------

    const [auditLog, setAuditLog] =
        useState<AuditLogEntry[]>([]);

    const notificationTimerRef =
        useRef<ReturnType<typeof setTimeout> | null>(null);

    // -------------------------------------------------------------------------
    // CLEAN UP NOTIFICATION TIMER
    // -------------------------------------------------------------------------

    useEffect(() => {
        return () => {
            if (notificationTimerRef.current) {
                clearTimeout(notificationTimerRef.current);
            }
        };
    }, []);

    // -------------------------------------------------------------------------
    // MERGE STREAMED DATA WITH OPTIMISTIC UPDATES
    // -------------------------------------------------------------------------

    const optimisticRfqs = useMemo(() => {
        return streamedRfqs.map((rfq) => ({
            ...rfq,
            ...optimisticUpdates[rfq.id],
        }));
    }, [streamedRfqs, optimisticUpdates]);

    // -------------------------------------------------------------------------
    // FILTER + SORT
    // -------------------------------------------------------------------------

    const processedRfqs = useMemo(() => {
        let result = [...optimisticRfqs];

        // Currency pair
        if (ccyPairFilter !== 'All') {
            result = result.filter(
                (rfq) => rfq.currencyPair === ccyPairFilter
            );
        }

        // Direction
        if (directionFilter !== 'All') {
            result = result.filter(
                (rfq) => rfq.direction === directionFilter
            );
        }

        // Status
        if (statusFilter !== 'All') {
            result = result.filter(
                (rfq) => rfq.status === statusFilter
            );
        }

        // Actionable only
        if (showActionableOnly) {
            result = result.filter(
                (rfq) => isTradeable(rfq, currentTime)
            );
        }

        // Sort
        result.sort((a, b) => {
        let comparison: number;

            switch (sortField) {
                case 'lastUpdated': {
                    const timeA = a.lastUpdated
                        ? new Date(a.lastUpdated).getTime()
                        : 0;

                    const timeB = b.lastUpdated
                        ? new Date(b.lastUpdated).getTime()
                        : 0;

                    comparison = timeA - timeB;
                    break;
                }

                case 'notional':
                    comparison = a.notional - b.notional;
                    break;

                case 'currencyPair':
                    comparison = a.currencyPair.localeCompare(b.currencyPair);
                    break;

                default:
                    comparison = 0;
            }

            return sortOrder === 'asc'
                ? comparison
                : -comparison;
        });

        return result;
    }, [
        optimisticRfqs,
        ccyPairFilter,
        directionFilter,
        statusFilter,
        showActionableOnly,
        sortField,
        sortOrder,
        currentTime,
    ]);

    // -------------------------------------------------------------------------
    // SUMMARY STATISTICS
    // -------------------------------------------------------------------------

    const summary = useMemo(() => {
        const actionable = optimisticRfqs.filter((rfq) =>
            isTradeable(rfq, currentTime)
        ).length;

        const accepted = optimisticRfqs.filter(
            (rfq) => rfq.status === 'Accepted'
        ).length;

        const quoted = optimisticRfqs.filter(
            (rfq) => rfq.status === 'Quoted'
        ).length;

        return {
            total: optimisticRfqs.length,
            actionable,
            accepted,
            quoted,
        };
    }, [optimisticRfqs, currentTime]);

    // -------------------------------------------------------------------------
    // CLEAR FILTERS
    // -------------------------------------------------------------------------

    const hasActiveFilters =
        ccyPairFilter !== 'All' ||
        directionFilter !== 'All' ||
        statusFilter !== 'All' ||
        showActionableOnly;

    const clearFilters = () => {
        setCcyPairFilter('All');
        setDirectionFilter('All');
        setStatusFilter('All');
        setShowActionableOnly(false);
    };

    // -------------------------------------------------------------------------
    // NOTIFICATION HELPER
    // -------------------------------------------------------------------------

    const showNotification = (
        message: string,
        type: 'success' | 'error'
    ) => {
        setNotification({
            message,
            type,
        });

        if (notificationTimerRef.current) {
            clearTimeout(notificationTimerRef.current);
        }

        notificationTimerRef.current = setTimeout(() => {
            setNotification(null);
        }, 5000);
    };

    // -------------------------------------------------------------------------
    // AUDIT LOG HELPER
    // -------------------------------------------------------------------------

    const addAuditLogEntry = (
        rfq: Rfq,
        status: 'Success' | 'Failed'
    ) => {
        setAuditLog((previous) => [
            {
                id: crypto.randomUUID(),
                timestamp: new Date().toISOString(),
                rfqId: rfq.id,
                pair: rfq.currencyPair,
                action: 'Executed Accept',
                status,
            },
            ...previous,
        ]);
    };

    // -------------------------------------------------------------------------
    // TRADE EXECUTION
    // -------------------------------------------------------------------------

    const handleConfirmTrade = async () => {
        if (!selectedRfq) {
            return;
        }

        const targetRfq = selectedRfq;

        setIsExecuting(true);

        /*
         * Optimistically update the specific RFQ.
         *
         * The table will immediately show "Accepted" while the API request
         * is being processed.
         */
        setOptimisticUpdates((current) => ({
            ...current,
            [targetRfq.id]: {
                status: 'Accepted',
            },
        }));

        try {
            // Execute trade against the mock API
            await acceptQuote(targetRfq.id);

            // Record successful execution
            addAuditLogEntry(targetRfq, 'Success');

            showNotification(
                `Successfully executed trade for ${targetRfq.currencyPair}`,
                'success'
            );

            /*
             * We deliberately keep the optimistic update here.
             *
             * This prevents the row from briefly jumping back to "Quoted"
             * if the API succeeds before the next stream update arrives.
             */
        } catch (err) {
            /*
             * API failed.
             *
             * Remove our optimistic override so the table returns to
             * whatever state the stream says the RFQ is actually in.
             */
            setOptimisticUpdates((current) => {
                const next = { ...current };

                delete next[targetRfq.id];

                return next;
            });

            // Record failed execution
            addAuditLogEntry(targetRfq, 'Failed');

            showNotification(
                err instanceof Error
                    ? err.message
                    : 'Trade execution failed.',
                'error'
            );
        } finally {
            setIsExecuting(false);
            setSelectedRfq(null);
        }
    };

    // -------------------------------------------------------------------------
    // RENDER
    // -------------------------------------------------------------------------

    return (
        <div
            className="blotter-container"
            data-theme={theme}
        >

            {/* ================================================================
                HEADER
            ================================================================= */}

            <header className="blotter-header">
                <div>
                    <h1>FX Option Live Quote Blotter</h1>

                    <p>
                        Monitor and execute incoming FX option quotes
                    </p>
                </div>

                <div className="header-actions">

                    <div className="theme-switcher">
                        <button
                            type="button"
                            className={theme === 'light' ? 'active' : ''}
                            onClick={() => setTheme('light')}
                        >
                            Light
                        </button>

                        <button
                            type="button"
                            className={theme === 'dark' ? 'active' : ''}
                            onClick={() => setTheme('dark')}
                        >
                            Dark
                        </button>
                    </div>

                    <div
                        className={`live-status ${
                            error ? 'offline' : 'online'
                        }`}
                    >
                        <span className="live-status-dot" />
                        {error ? 'OFFLINE' : 'LIVE'}
                    </div>

                </div>
            </header>

            {/* ================================================================
                NOTIFICATION
            ================================================================= */}

            {notification && (
                <div
                    className={`notification-banner ${notification.type}`}
                    role="alert"
                >
                    <span className="notification-icon">
                        {notification.type === 'success'
                            ? '✓'
                            : '!'}
                    </span>

                    <span>{notification.message}</span>

                    <button
                        type="button"
                        className="notification-close"
                        onClick={() => setNotification(null)}
                        aria-label="Dismiss notification"
                    >
                        ×
                    </button>
                </div>
            )}

            {/* ================================================================
                SUMMARY
            ================================================================= */}

            <section className="summary-grid">
                <div className="summary-card">
                    <span className="summary-label">
                        Total Quotes
                    </span>

                    <strong className="summary-value">
                        {summary.total}
                    </strong>
                </div>

                <div className="summary-card">
                    <span className="summary-label">
                        Actionable
                    </span>

                    <strong className="summary-value">
                        {summary.actionable}
                    </strong>
                </div>

                <div className="summary-card">
                    <span className="summary-label">
                        Quoted
                    </span>

                    <strong className="summary-value">
                        {summary.quoted}
                    </strong>
                </div>

                <div className="summary-card">
                    <span className="summary-label">
                        Accepted
                    </span>

                    <strong className="summary-value">
                        {summary.accepted}
                    </strong>
                </div>
            </section>

            {/* ================================================================
                FILTERS
            ================================================================= */}

            <section className="filter-section">
                <div className="filter-section-header">
                    <div>
                        <h2>Filters</h2>

                        <span>
                            {processedRfqs.length} quotes shown
                        </span>
                    </div>

                    {hasActiveFilters && (
                        <button
                            type="button"
                            className="clear-filters-button"
                            onClick={clearFilters}
                        >
                            Clear filters
                        </button>
                    )}
                </div>

                <FilterSortBar
                    ccyPairFilter={ccyPairFilter}
                    directionFilter={directionFilter}
                    statusFilter={statusFilter}
                    showActionableOnly={showActionableOnly}
                    sortField={sortField}
                    sortOrder={sortOrder}
                    onCcyChange={setCcyPairFilter}
                    onDirectionChange={setDirectionFilter}
                    onStatusChange={setStatusFilter}
                    onActionableToggle={setShowActionableOnly}
                    onSortFieldChange={setSortField}
                    onSortOrderToggle={() =>
                        setSortOrder((previous) =>
                            previous === 'asc'
                                ? 'desc'
                                : 'asc'
                        )
                    }
                />
            </section>

            {/* ================================================================
                LIVE QUOTES
            ================================================================= */}

            <section className="quotes-section">
                <div className="quotes-section-header">
                    <div>
                        <h2>Live Quotes</h2>

                        <span>
                            {summary.actionable} actionable
                        </span>
                    </div>

                    {!loading && !error && (
                        <div className="stream-status">
                            <span className="stream-dot" />
                            Streaming
                        </div>
                    )}
                </div>

                <QuoteBlotterTable
                    rfqs={processedRfqs}
                    loading={loading}
                    error={error}
                    currentTime={currentTime}
                    onAcceptQuote={(rfq) =>
                        setSelectedRfq(rfq)
                    }
                />
            </section>

            {/* ================================================================
                AUDIT LOG
            ================================================================= */}

            <section className="audit-section">
                <div className="audit-section-header">
                    <div>
                        <h2>Execution History</h2>

                        <span>
                            {auditLog.length} events
                        </span>
                    </div>
                </div>

                {auditLog.length === 0 ? (
                    <div className="audit-empty">
                        <span>No trades executed yet.</span>
                    </div>
                ) : (
                    <div className="audit-table-wrapper">
                        <table className="audit-table">
                            <thead>
                                <tr>
                                    <th>Time</th>
                                    <th>RFQ</th>
                                    <th>Pair</th>
                                    <th>Action</th>
                                    <th>Status</th>
                                </tr>
                            </thead>

                            <tbody>
                                {auditLog.map((entry) => (
                                    <tr key={entry.id}>
                                        <td>
                                            {new Date(
                                                entry.timestamp
                                            ).toLocaleTimeString()}
                                        </td>

                                        <td>
                                            {entry.rfqId}
                                        </td>

                                        <td>
                                            {entry.pair}
                                        </td>

                                        <td>
                                            {entry.action}
                                        </td>

                                        <td>
                                            <span
                                                className={`audit-status ${
                                                    entry.status ===
                                                    'Success'
                                                        ? 'success'
                                                        : 'failed'
                                                }`}
                                            >
                                                {entry.status ===
                                                'Success'
                                                    ? '✓ Success'
                                                    : '✕ Failed'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {/* ================================================================
                CONFIRMATION MODAL
            ================================================================= */}

            {selectedRfq && (
                <ConfirmationModal
                    rfq={selectedRfq}
                    isOpen={selectedRfq !== null}
                    isExecuting={isExecuting}
                    onClose={() => {
                        if (!isExecuting) {
                            setSelectedRfq(null);
                        }
                    }}
                    onConfirm={handleConfirmTrade}
                />
            )}
        </div>
    );
};
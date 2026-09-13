import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useRfqStream } from '../../hooks/useRfqStream';
import { FilterSortBar } from '../FilterSortBar/FilterSortBar';
import type { SortField, SortOrder } from '../FilterSortBar/FilterSortBar';
import { QuoteBlotterTable } from '../QuoteBlotter/QuoteBlotterTable';
import { ConfirmationModal } from '../ConfirmationModal/ConfirmationModal';
import { isTradeable } from '../../utils/rfqDomainHelpers';
import { acceptQuote } from '../../../mock-api/index';
import type { Rfq, RfqStatus } from '../../../mock-api/types';

export const BlotterApp: React.FC = () => {
    const { rfqs, loading, error, currentTime } = useRfqStream();

    // Local Filter & Sort States
    const [ccyPairFilter, setCcyPairFilter] = useState<string>('All');
    const [directionFilter, setDirectionFilter] = useState<'All' | 'Buy' | 'Sell'>('All');
    const [statusFilter, setStatusFilter] = useState<RfqStatus | 'All'>('All');
    const [showActionableOnly, setShowActionableOnly] = useState<boolean>(false);
    const [sortField, setSortField] = useState<SortField>('lastUpdated');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

    // Trade Execution Workflow States
    const [selectedRfq, setSelectedRfq] = useState<Rfq | null>(null);
    const [isExecuting, setIsExecuting] = useState<boolean>(false);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const notificationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Cancel any pending notification timer on unmount
    useEffect(() => () => {
        if (notificationTimerRef.current) clearTimeout(notificationTimerRef.current);
    }, []);

    // Business Logic Array Pipelines (Memoized for high performance rendering templates)
    const processedRfqs = useMemo(() => {
        let result = [...rfqs];

        // 1. Apply UI Filter Chains
        if (ccyPairFilter !== 'All') {
        result = result.filter((r) => r.currencyPair === ccyPairFilter);
        }
        if (directionFilter !== 'All') {
        result = result.filter((r) => r.direction === directionFilter);
        }
        if (statusFilter !== 'All') {
        result = result.filter((r) => r.status === statusFilter);
        }
        if (showActionableOnly) {
        result = result.filter((r) => isTradeable(r, currentTime));
        }

        // 2. Apply Custom UI Sorting Logic
        result.sort((a, b) => {
        let comparison = 0;
        if (sortField === 'lastUpdated') {
            const timeA = a.lastUpdated ? new Date(a.lastUpdated).getTime() : 0;
            const timeB = b.lastUpdated ? new Date(b.lastUpdated).getTime() : 0;
            comparison = timeA - timeB;
        } else if (sortField === 'notional') {
            comparison = a.notional - b.notional;
        } else if (sortField === 'currencyPair') {
            comparison = a.currencyPair.localeCompare(b.currencyPair);
        }
        return sortOrder === 'asc' ? comparison : -comparison;
        });

        return result;
    }, [rfqs, ccyPairFilter, directionFilter, statusFilter, showActionableOnly, sortField, sortOrder, currentTime]);

    // Handle Asynchronous Server Executions
    const handleConfirmTrade = async () => {
        if (!selectedRfq) return;
        try {
        setIsExecuting(true);
        await acceptQuote(selectedRfq.id);
        setNotification({ message: `Successfully executed trade for ${selectedRfq.currencyPair}`, type: 'success' });
        setSelectedRfq(null);
        } catch (err) {
        setNotification({ message: err instanceof Error ? err.message : 'Trade execution failed.', type: 'error' });
        } finally {
        setIsExecuting(false);
        // Automatically clear alerts after a brief period, cancelling any previous timer first
        if (notificationTimerRef.current) clearTimeout(notificationTimerRef.current);
        notificationTimerRef.current = setTimeout(() => setNotification(null), 5000);
        }
    };

    return (
        <div className="blotter-container">
        {notification && (
            <div className={`notification-banner ${notification.type}`} role="alert">
            {notification.message}
            </div>
        )}

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
            onSortOrderToggle={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
        />

        <QuoteBlotterTable
            rfqs={processedRfqs}
            loading={loading}
            error={error}
            currentTime={currentTime}
            onAcceptQuote={(rfq) => setSelectedRfq(rfq)}
        />

        {selectedRfq && (
            <ConfirmationModal
            rfq={selectedRfq}
            isOpen={selectedRfq !== null}
            isExecuting={isExecuting}
            onClose={() => setSelectedRfq(null)}
            onConfirm={handleConfirmTrade}
            />
        )}
        </div>
    );
};
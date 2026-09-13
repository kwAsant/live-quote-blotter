import { useState, useEffect } from 'react';
import { fetchRfqs, subscribeToQuoteUpdates } from '../../mock-api';
import { useTimer } from './useTimer';
import type { Rfq, QuoteUpdate } from '../../mock-api/types';

export const useRfqStream = () => {
    const [rfqs, setRfqs] = useState<Rfq[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const currentTime = useTimer(1000);

    useEffect(() => {
        let isMounted = true;

        const loadInitialRfqs = async () => {
            try {
                setLoading(true);
                const initialData = await fetchRfqs();
                if (isMounted) {
                setRfqs(initialData);
                setError(null);
                }
            } catch (err) {
                if (isMounted) {
                setError(err instanceof Error ? err.message : 'Failed to retrieve initial RFQs');
                }
            } finally {
                if (isMounted) {
                setLoading(false);
                }
            }
        };

        void loadInitialRfqs();

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
    if (loading || error) return;

        const unsubscribe = subscribeToQuoteUpdates((update: QuoteUpdate) => {
            setRfqs((currentRfqs) => {
                const existingRfqIndex = currentRfqs.findIndex((item) => item.id === update.rfqId);
                if (existingRfqIndex === -1) {
                    if (update.rfq) {
                        return [update.rfq, ...currentRfqs];
                    }

                    return currentRfqs;
                }

                const existingRfq = currentRfqs[existingRfqIndex];
                if (update.sequenceNumber <= existingRfq.sequenceNumber) return currentRfqs;

                const updatedRfq: Rfq = {
                    ...existingRfq,
                    bid: update.bid ?? existingRfq.bid,
                    offer: update.offer ?? existingRfq.offer,
                    status: update.status ?? existingRfq.status,
                    lastUpdated: update.lastUpdated,
                    sequenceNumber: update.sequenceNumber,
                };

                const updated = [...currentRfqs];
                updated[existingRfqIndex] = updatedRfq;
                return updated;
            });
        });

        return () => unsubscribe();
    }, [loading, error]);
    
    return { rfqs, loading, error, currentTime };
};
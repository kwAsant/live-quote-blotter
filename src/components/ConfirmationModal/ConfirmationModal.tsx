import React, { useEffect, useRef } from 'react';
import type { Rfq } from '../../../mock-api/types';

interface ConfirmationModalProps {
    rfq: Rfq;
    isOpen: boolean;
    isExecuting: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    rfq,
    isOpen,
    isExecuting,
    onClose,
    onConfirm,
}) => {
    const closeButtonRef = useRef<HTMLButtonElement>(null);

    // Focus trap accessibility ring
    useEffect(() => {
        if (isOpen) {
        closeButtonRef.current?.focus();
        }
    }, [isOpen]);

    // Handle Escape key closure binding
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    if (!isOpen) return null;

    const executingPrice = rfq.direction === 'Buy' ? rfq.offer : rfq.bid;

    return (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-content">
            <h3 id="modal-title">Confirm Trade Execution</h3>
            <p>
            Are you sure you want to execute a <strong>{rfq.direction}</strong> order for{' '}
            <strong>{rfq.currencyPair}</strong>?
            </p>
            <div className="modal-details-box">
            <div>Notional: {rfq.notional.toLocaleString()}</div>
            <div>Price: {executingPrice?.toFixed(4) ?? '—'}</div>
            </div>

            <div className="modal-actions">
            <button 
                ref={closeButtonRef} 
                disabled={isExecuting} 
                onClick={onClose} 
                className="btn-secondary"
            >
                Cancel
            </button>
            <button 
                disabled={isExecuting} 
                onClick={() => { void onConfirm(); }} 
                className="btn-primary"
            >
                {isExecuting ? 'Executing...' : 'Confirm Trade'}
            </button>
            </div>
        </div>
        </div>
    );
};
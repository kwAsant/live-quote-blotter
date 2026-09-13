import React from 'react';
import { QuoteRow } from './QuoteRow';
import type { Rfq } from '../../../mock-api/types';

interface QuoteBlotterTableProps {
    rfqs: Rfq[];
    loading: boolean;
    error: string | null;
    currentTime: Date;
    onAcceptQuote: (rfq: Rfq) => void;
}

export const QuoteBlotterTable: React.FC<QuoteBlotterTableProps> = ({
    rfqs,
    loading,
    error,
    currentTime,
    onAcceptQuote,
}) => {
  if (loading) return <div role="status">Loading live market data...</div>;
  if (error) return <div role="alert">Error: {error}</div>;
  if (rfqs.length === 0) return <div>No active quotes.</div>;

  return (
    <div className="table-responsive-container">
        <table className="blotter-table">
            <colgroup>
                <col /><col /><col /><col /><col /><col /><col /><col />
            </colgroup>
            <thead>
            <tr>
                <th>Updated</th>
                <th>Pair</th>
                <th>Dir</th>
                <th>Notional</th>
                <th>Expiry (UTC)</th>
                <th>Status</th>
                <th>Exec Price</th>
                <th></th>
            </tr>
            </thead>
            <tbody>
            {rfqs.map((rfq) => (
                <QuoteRow 
                key={rfq.id} 
                rfq={rfq} 
                currentTime={currentTime} // <-- Pass it into the row
                onAcceptClick={onAcceptQuote} 
                />
            ))}
            </tbody>
        </table>
    </div>
    );
};
import React from 'react';
import { isRfqExpired, isPriceStale, isTradeable } from '../../utils/rfqDomainHelpers';
import type { Rfq } from '../../../mock-api/types';

interface QuoteRowProps {
    rfq: Rfq;
    currentTime: Date; // <-- Accept the unified clock ticker
    onAcceptClick: (rfq: Rfq) => void;
}

export const QuoteRow: React.FC<QuoteRowProps> = ({ rfq, currentTime, onAcceptClick }) => {
    
    // compute domain rules dynamically on every tick render pass
    const expired = isRfqExpired(rfq.expiry, currentTime);
    const stale = rfq.lastUpdated ? isPriceStale(rfq.lastUpdated, 30000, currentTime) : false;
    
    // override status field locally if time criteria has crossed threshold
    const currentStatus = expired ? 'Expired' : rfq.status;
    
    // determine "tradeability" using our updated context status
    const tradeable = isTradeable(rfq, currentTime) && !stale;
    const displayPrice = rfq.direction === 'Buy' ? rfq.offer : rfq.bid;

    return (
        <tr className={`rfq-row ${stale ? 'stale-row' : ''} ${!tradeable ? 'inactive-row' : ''}`}>
        <td>{rfq.lastUpdated ? new Date(rfq.lastUpdated).toLocaleTimeString() : 'Pending...'}</td>
        <td>{rfq.currencyPair}</td>
        <td>
            <span className={`direction-${rfq.direction.toLowerCase()}`}>
                {rfq.direction === 'Buy' ? '▲' : '▼'} {rfq.direction}
            </span>
        </td>
        <td>{rfq.notional.toLocaleString()}</td>
        <td>{rfq.expiry}</td>
        <td>
            <span className={`status-badge ${currentStatus.toLowerCase()}`}>
            {currentStatus} 
            </span>
        </td>
        <td>{displayPrice !== undefined ? displayPrice.toFixed(4) : '—'}</td>
        <td>
            <button disabled={!tradeable} onClick={() => onAcceptClick(rfq)}>
            Accept
            </button>
        </td>
        </tr>
    );
};
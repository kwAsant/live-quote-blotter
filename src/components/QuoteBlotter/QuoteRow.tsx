import React from 'react';
import {
    isRfqExpired,
    isPriceStale,
    isTradeable,
} from '../../utils/rfqDomainHelpers';

import type { Rfq } from '../../../mock-api/types';

interface QuoteRowProps {
    rfq: Rfq;
    currentTime: Date;
    onAcceptClick: (rfq: Rfq) => void;
}

export const QuoteRow: React.FC<QuoteRowProps> = ({
    rfq,
    currentTime,
    onAcceptClick,
}) => {
    const expired = isRfqExpired(
        rfq.expiry,
        currentTime
    );

    const stale = rfq.lastUpdated
        ? isPriceStale(
              rfq.lastUpdated,
              30000,
              currentTime
          )
        : false;

    const currentStatus = expired
        ? 'Expired'
        : rfq.status;

    const tradeable =
        isTradeable(rfq, currentTime) && !stale;

    const displayPrice =
        rfq.direction === 'Buy'
            ? rfq.offer
            : rfq.bid;

    const updatedTime = rfq.lastUpdated
        ? new Date(rfq.lastUpdated).toLocaleTimeString(
              [],
              {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
              }
          )
        : 'Pending...';

    return (
        <tr
            className={`
                rfq-row
                ${stale ? 'stale-row' : ''}
                ${!tradeable ? 'inactive-row' : ''}
            `}
        >
            <td className="quote-time">
                {updatedTime}
            </td>

            <td className="quote-pair">
                {rfq.currencyPair}
            </td>

            <td>
                <span
                    className={`direction-${rfq.direction.toLowerCase()}`}
                >
                    <span
                        className="direction-arrow"
                        aria-hidden="true"
                    >
                        {rfq.direction === 'Buy'
                            ? '▲'
                            : '▼'}
                    </span>

                    {rfq.direction}
                </span>
            </td>

            <td className="quote-notional">
                {rfq.notional.toLocaleString()}
            </td>

            <td className="quote-expiry">
                {rfq.expiry}
            </td>

            <td>
                <span
                    className={`status-badge ${currentStatus.toLowerCase()}`}
                >
                    <span className="status-indicator" />
                    {currentStatus}
                </span>
            </td>

            <td className="quote-price">
                {displayPrice !== undefined
                    ? displayPrice.toFixed(4)
                    : '—'}
            </td>

            <td className="quote-action">
                <button
                    type="button"
                    disabled={!tradeable}
                    onClick={() =>
                        onAcceptClick(rfq)
                    }
                >
                    Accept
                </button>
            </td>
        </tr>
    );
};
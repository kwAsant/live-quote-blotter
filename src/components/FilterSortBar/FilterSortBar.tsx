import React from 'react';
import type { RfqStatus } from '../../../mock-api/types'; 

export type SortField = 'lastUpdated' | 'notional' | 'currencyPair';
export type SortOrder = 'asc' | 'desc';

interface FilterSortBarProps {
    ccyPairFilter: string;
    directionFilter: 'All' | 'Buy' | 'Sell';
    statusFilter: RfqStatus | 'All';
    showActionableOnly: boolean;
    sortField: SortField;
    sortOrder: SortOrder;
    onCcyChange: (ccy: string) => void;
    onDirectionChange: (direction: 'All' | 'Buy' | 'Sell') => void;
    onStatusChange: (status: RfqStatus | 'All') => void; 
    onActionableToggle: (checked: boolean) => void;
    onSortFieldChange: (field: SortField) => void;
    onSortOrderToggle: () => void;
}

export const FilterSortBar: React.FC<FilterSortBarProps> = ({
    ccyPairFilter,
    directionFilter,
    statusFilter,        // ← 1. Destructured here
    showActionableOnly,
    sortField,
    sortOrder,
    onCcyChange,
    onDirectionChange,
    onStatusChange,      // ← 2. Destructured here
    onActionableToggle,
    onSortFieldChange,
    onSortOrderToggle,
}) => {
    return (
        <div className="filter-sort-bar">
        <div className="control-group">
            <label htmlFor="ccy-select">Currency Pair</label>
            <select id="ccy-select" value={ccyPairFilter} onChange={(e) => onCcyChange(e.target.value)}>
            <option value="All">All Pairs</option>
            <option value="EUR/USD">EUR/USD</option>
            <option value="GBP/USD">GBP/USD</option>
            <option value="USD/JPY">USD/JPY</option>
            </select>
        </div>

        <div className="control-group">
            <label>Direction</label>
            <div className="btn-toggle-group">
            {(['All', 'Buy', 'Sell'] as const).map((dir) => (
                <button
                key={dir}
                className={`toggle-btn ${directionFilter === dir ? 'active' : ''}`}
                onClick={() => onDirectionChange(dir)}
                >
                {dir}
                </button>
            ))}
            </div>
        </div>

        <div className="control-group checkbox-group">
            <label htmlFor="actionable-chk">
            <input
                id="actionable-chk"
                type="checkbox"
                checked={showActionableOnly}
                onChange={(e) => onActionableToggle(e.target.checked)}
            />
            Actionable Quotes Only
            </label>
        </div>

        {/* 3. Status select dropdown can now safely access the destructured props */}
        <div className="control-group">
            <label htmlFor="status-select">Status</label>
            <select id="status-select" value={statusFilter} onChange={(e) => onStatusChange(e.target.value as RfqStatus | 'All')}>
                <option value="All">All Statuses</option>
                <option value="Open">Open</option>
                <option value="Quoted">Quoted</option>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
                <option value="Expired">Expired</option>
            </select>
        </div>

        <div className="control-group">
            <label htmlFor="sort-select">Sort By</label>
            <select id="sort-select" value={sortField} onChange={(e) => onSortFieldChange(e.target.value as SortField)}>
            <option value="lastUpdated">Last Updated</option>
            <option value="notional">Notional</option>
            <option value="currencyPair">Currency Pair</option>
            </select>
            <button onClick={onSortOrderToggle} className="sort-order-btn" aria-label="Toggle sort order">
            {sortOrder === 'asc' ? '▲ Asc' : '▼ Desc'}
            </button>
        </div>
    </div>
  );
};
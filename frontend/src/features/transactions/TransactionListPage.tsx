import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTransactions } from '@/shared/hooks/useTransactions';
import { useNeighbours } from '@/shared/hooks/useNeighbours';
import { PageHeader } from '@/shared/components/PageHeader';
import { DataTable, type Column } from '@/shared/components/DataTable';
import { CurrencyDisplay } from '@/shared/components/CurrencyDisplay';
import type { TransactionListItem } from '@/shared/api/types';

function getTodayISO() {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

export function TransactionListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const todayFilter = searchParams.get('today') === 'true';
  const todayISO = getTodayISO();

  const [dateFrom, setDateFrom] = useState(todayFilter ? todayISO : '');
  const [dateTo, setDateTo] = useState(todayFilter ? todayISO : '');
  const [neighbourFilter, setNeighbourFilter] = useState<number | undefined>();

  const dateError = dateFrom && dateTo && dateFrom > dateTo
    ? '"From" date must be before "To" date'
    : '';

  const { transactions, loading } = useTransactions({
    dateFrom: todayFilter || dateError ? undefined : (dateFrom || undefined),
    dateTo: todayFilter || dateError ? undefined : (dateTo || undefined),
    neighbour: neighbourFilter,
    today: todayFilter || undefined,
  });
  const { neighbours } = useNeighbours();

  const columns: Column<TransactionListItem>[] = [
    {
      key: 'date',
      header: 'Date/Time',
      render: (tx) => new Date(tx.created_at).toLocaleString(),
    },
    { key: 'neighbour', header: 'Neighbour', render: (tx) => tx.neighbour_name },
    { key: 'total', header: 'Total', render: (tx) => <CurrencyDisplay amount={tx.total_amount} /> },
    { key: 'items', header: 'Items', render: (tx) => tx.item_count },
    { key: 'admin', header: 'Processed By', render: (tx) => tx.admin_username },
  ];

  return (
    <div>
      <PageHeader title="Transactions" />

      {todayFilter && (
        <div className="mb-4 flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 text-blue-800 px-3 py-1 text-sm font-medium">
            Today Only
            <button
              onClick={() => {
                searchParams.delete('today');
                setSearchParams(searchParams);
                setDateFrom('');
                setDateTo('');
              }}
              className="ml-1 text-blue-600 hover:text-blue-900"
              aria-label="Clear today filter"
              data-testid="clear-today-filter"
            >
              &times;
            </button>
          </span>
        </div>
      )}

      <div className="flex gap-4 mb-4 flex-wrap">
        <div>
          <label className="block text-xs text-gray-500 mb-1">From</label>
          <input
            type="date"
            value={dateFrom}
            max={dateTo || undefined}
            onChange={(e) => setDateFrom(e.target.value)}
            onClick={(e) => { try { (e.target as HTMLInputElement).showPicker(); } catch {} }}
            className="rounded-md border border-gray-300 px-3 py-2 text-base min-h-[44px]"
            data-testid="filter-date-from"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">To</label>
          <input
            type="date"
            value={dateTo}
            min={dateFrom || undefined}
            onChange={(e) => setDateTo(e.target.value)}
            onClick={(e) => { try { (e.target as HTMLInputElement).showPicker(); } catch {} }}
            className="rounded-md border border-gray-300 px-3 py-2 text-base min-h-[44px]"
            data-testid="filter-date-to"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Neighbour</label>
          <select
            value={neighbourFilter ?? ''}
            onChange={(e) => setNeighbourFilter(e.target.value ? Number(e.target.value) : undefined)}
            className="rounded-md border border-gray-300 px-3 py-2 text-base min-h-[44px]"
            data-testid="filter-neighbour"
          >
            <option value="">All Neighbours</option>
            {neighbours.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {dateError && (
        <p className="mb-4 text-sm text-red-600" role="alert" data-testid="date-error">
          {dateError}
        </p>
      )}

      <DataTable
        columns={columns}
        data={transactions}
        loading={loading}
        emptyMessage="No transactions found."
        keyExtractor={(tx) => tx.id}
        onRowClick={(tx) => navigate(`/transactions/${tx.id}`)}
      />
    </div>
  );
}

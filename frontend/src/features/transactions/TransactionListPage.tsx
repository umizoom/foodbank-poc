import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTransactions } from '@/shared/hooks/useTransactions';
import { useClients } from '@/shared/hooks/useClients';
import { PageHeader } from '@/shared/components/PageHeader';
import { DataTable, type Column } from '@/shared/components/DataTable';
import { CurrencyDisplay } from '@/shared/components/CurrencyDisplay';
import type { TransactionListItem } from '@/shared/api/types';

export function TransactionListPage() {
  const navigate = useNavigate();
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [clientFilter, setClientFilter] = useState<number | undefined>();

  const { transactions, loading } = useTransactions({
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    client: clientFilter,
  });
  const { clients } = useClients();

  const columns: Column<TransactionListItem>[] = [
    {
      key: 'date',
      header: 'Date/Time',
      render: (tx) => new Date(tx.created_at).toLocaleString(),
    },
    { key: 'client', header: 'Client', render: (tx) => tx.client_name },
    { key: 'total', header: 'Total', render: (tx) => <CurrencyDisplay amount={tx.total_amount} /> },
    { key: 'items', header: 'Items', render: (tx) => tx.item_count },
    { key: 'admin', header: 'Processed By', render: (tx) => tx.admin_username },
    {
      key: 'actions',
      header: '',
      render: (tx) => (
        <button
          onClick={() => navigate(`/transactions/${tx.id}`)}
          className="text-blue-600 hover:underline text-sm"
          data-testid={`view-transaction-${tx.id}`}
        >
          View
        </button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Transactions" />

      <div className="flex gap-4 mb-4 flex-wrap">
        <div>
          <label className="block text-xs text-gray-500 mb-1">From</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            data-testid="filter-date-from"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">To</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            data-testid="filter-date-to"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Client</label>
          <select
            value={clientFilter ?? ''}
            onChange={(e) => setClientFilter(e.target.value ? Number(e.target.value) : undefined)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            data-testid="filter-client"
          >
            <option value="">All Clients</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={transactions}
        loading={loading}
        emptyMessage="No transactions found."
        keyExtractor={(tx) => tx.id}
      />
    </div>
  );
}

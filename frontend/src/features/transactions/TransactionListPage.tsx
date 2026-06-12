import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTransactions } from '@/shared/hooks/useTransactions';
import { useNeighbours } from '@/shared/hooks/useNeighbours';
import { getPresetDates, type ReportPeriod } from '@/shared/hooks/useReport';
import { PageHeader } from '@/shared/components/PageHeader';
import { DataTable, type Column } from '@/shared/components/DataTable';
import { CurrencyDisplay } from '@/shared/components/CurrencyDisplay';
import { Button } from '@/shared/components/Button';
import type { TransactionListItem } from '@/shared/api/types';

const PRESETS: { label: string; value: Exclude<ReportPeriod, 'custom'> }[] = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
];

function getTodayISO() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

interface LastRanParams {
  dateFrom: string;
  dateTo: string;
  neighbour: number | undefined;
  today: boolean;
}

export function TransactionListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const todayFilter = searchParams.get('today') === 'true';
  const todayISO = getTodayISO();

  const [dateFrom, setDateFrom] = useState(todayFilter ? todayISO : '');
  const [dateTo, setDateTo] = useState(todayFilter ? todayISO : '');
  const [neighbourFilter, setNeighbourFilter] = useState<number | undefined>();
  const [activePreset, setActivePreset] = useState<ReportPeriod | null>(null);
  const [lastRanParams, setLastRanParams] = useState<LastRanParams | null>(null);

  const { transactions, loading, runTransactions } = useTransactions();
  const { neighbours } = useNeighbours();
  const autoRanRef = useRef(false);

  const handlePreset = (preset: Exclude<ReportPeriod, 'custom'>) => {
    const { startDate, endDate } = getPresetDates(preset);
    setDateFrom(startDate);
    setDateTo(endDate);
    setActivePreset(preset);
  };

  const handleDateChange = (field: 'from' | 'to', value: string) => {
    if (field === 'from') setDateFrom(value);
    else setDateTo(value);
    setActivePreset(null);
  };

  const dateError = dateFrom && dateTo && dateFrom > dateTo
    ? '"From" date must be before "To" date'
    : '';

  const hasRun = lastRanParams !== null;
  const isStale = hasRun && (
    dateFrom !== lastRanParams.dateFrom ||
    dateTo !== lastRanParams.dateTo ||
    neighbourFilter !== lastRanParams.neighbour ||
    todayFilter !== lastRanParams.today
  );

  const handleRun = () => {
    const params = {
      dateFrom: todayFilter ? undefined : (dateFrom || undefined),
      dateTo: todayFilter ? undefined : (dateTo || undefined),
      neighbour: neighbourFilter,
      today: todayFilter || undefined,
    };
    runTransactions(params);
    setLastRanParams({ dateFrom, dateTo, neighbour: neighbourFilter, today: todayFilter });
  };

  useEffect(() => {
    if (todayFilter && !autoRanRef.current) {
      autoRanRef.current = true;
      handleRun();
    }
  }, [todayFilter]);

  const canRun = (todayFilter || (dateFrom && dateTo)) && !dateError && !loading;

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
    {
      key: 'status',
      header: 'Status',
      render: (tx) => (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
          tx.status === 'undone'
            ? 'bg-red-100 text-red-800'
            : 'bg-green-100 text-green-800'
        }`}>
          {tx.status === 'undone' ? 'Undone' : 'Completed'}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0">
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

        <div className="flex items-end gap-4 mb-4 flex-wrap">
          <div className="flex gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.value}
                onClick={() => handlePreset(p.value)}
                className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                  activePreset === p.value
                    ? 'bg-blue-100 text-blue-800 border-blue-300'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
                data-testid={`period-${p.value}`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">From</label>
            <input
              type="date"
              value={dateFrom}
              max={dateTo || undefined}
              onChange={(e) => handleDateChange('from', e.target.value)}
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
              onChange={(e) => handleDateChange('to', e.target.value)}
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

          <Button
            onClick={handleRun}
            disabled={!canRun}
            data-testid="run-transactions-btn"
          >
            {loading ? 'Running...' : 'Run Transactions'}
          </Button>
        </div>

        {dateError && (
          <p className="mb-4 text-sm text-red-600" role="alert" data-testid="date-error">
            {dateError}
          </p>
        )}

        {isStale && (
          <div
            className="mb-4 rounded-md border border-yellow-300 bg-yellow-50 px-4 py-2 text-sm text-yellow-800"
            data-testid="stale-banner"
          >
            Filters have changed — click <strong>Run Transactions</strong> to update results.
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        <DataTable
          columns={columns}
          data={transactions}
          loading={loading}
          emptyMessage={hasRun ? 'No transactions found.' : 'Select a date range and click "Run Transactions" to view results.'}
          keyExtractor={(tx) => tx.id}
          onRowClick={(tx) => navigate(`/transactions/${tx.id}`)}
        />
      </div>
    </div>
  );
}

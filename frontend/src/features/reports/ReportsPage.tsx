import { useState } from 'react';
import { useReport, type ReportPeriod } from '@/shared/hooks/useReport';
import { PageHeader } from '@/shared/components/PageHeader';
import { DataTable, type Column } from '@/shared/components/DataTable';
import { CurrencyDisplay } from '@/shared/components/CurrencyDisplay';
import type { ReportItem } from '@/shared/api/types';

const PERIODS: { label: string; value: ReportPeriod }[] = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
];

export function ReportsPage() {
  const [period, setPeriod] = useState<ReportPeriod>('daily');
  const { report, loading } = useReport(period);

  const columns: Column<ReportItem>[] = [
    { key: 'item_name', header: 'Item', render: (row) => row.item_name },
    { key: 'category', header: 'Category', render: (row) => row.category_name },
    { key: 'qty_sold', header: 'Qty Sold', render: (row) => row.total_quantity_sold },
    {
      key: 'total_amount',
      header: 'Total Amount',
      render: (row) => <CurrencyDisplay amount={row.total_amount} />,
    },
    {
      key: 'current_stock',
      header: 'Current Stock',
      render: (row) => (row.current_stock !== null ? row.current_stock : '—'),
    },
  ];

  return (
    <div>
      <PageHeader title="Reports" />

      <div className="flex gap-2 mb-4">
        {PERIODS.map((p) => (
          <button
            key={p.value}
            onClick={() => setPeriod(p.value)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              period === p.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            data-testid={`period-${p.value}`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {report && (
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <p className="text-xs font-medium text-gray-500 uppercase">Period</p>
            <p className="mt-1 text-lg font-semibold text-gray-900">
              {report.period.start_date} to {report.period.end_date}
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <p className="text-xs font-medium text-gray-500 uppercase">Total Items Sold</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {report.totals.total_items_sold}
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <p className="text-xs font-medium text-gray-500 uppercase">Total Revenue</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              <CurrencyDisplay amount={String(report.totals.total_revenue)} />
            </p>
          </div>
        </div>
      )}

      <DataTable
        columns={columns}
        data={report?.items ?? []}
        loading={loading}
        emptyMessage="No items sold in this period."
        keyExtractor={(row) => row.item_id ?? row.item_name}
      />
    </div>
  );
}

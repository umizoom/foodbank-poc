import { useState, useMemo } from 'react';
import { useReport, getPresetDates, type ReportPeriod } from '@/shared/hooks/useReport';
import { PageHeader } from '@/shared/components/PageHeader';
import { DataTable, type Column } from '@/shared/components/DataTable';
import { CurrencyDisplay } from '@/shared/components/CurrencyDisplay';
import { Button } from '@/shared/components/Button';
import { downloadCsv } from '@/shared/utils/csv';
import type { ReportItem } from '@/shared/api/types';

const PRESETS: { label: string; value: Exclude<ReportPeriod, 'custom'> }[] = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
];

export function ReportsPage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activePreset, setActivePreset] = useState<ReportPeriod | null>(null);
  const [lastRanDates, setLastRanDates] = useState<{ start: string; end: string } | null>(null);
  const { report, loading, runReport } = useReport();

  const isStale = report && lastRanDates && (startDate !== lastRanDates.start || endDate !== lastRanDates.end);

  const handlePreset = (preset: Exclude<ReportPeriod, 'custom'>) => {
    const { startDate: s, endDate: e } = getPresetDates(preset);
    setStartDate(s);
    setEndDate(e);
    setActivePreset(preset);
  };

  const dateError = startDate && endDate && startDate > endDate
    ? '"From" date must be before "To" date'
    : '';

  const handleDateChange = (field: 'start' | 'end', value: string) => {
    if (field === 'start') setStartDate(value);
    else setEndDate(value);
    setActivePreset(null);
  };

  const handleRunReport = () => {
    runReport(startDate, endDate);
    setLastRanDates({ start: startDate, end: endDate });
  };

  const handleExportCsv = () => {
    if (!report || !lastRanDates) return;
    const headers = ['Item Name', 'Category', 'Qty Sold', 'Total Amount', 'Current Stock'];
    const rows = report.items.map((item) => [
      item.item_name,
      item.category_name,
      item.total_quantity_sold,
      item.total_amount,
      item.current_stock,
    ]);
    downloadCsv(`report_${lastRanDates.start}_${lastRanDates.end}.csv`, headers, rows);
  };

  const categoryTotals = useMemo(() => {
    if (!report) return [];
    const map: Record<string, { quantity: number; amount: number }> = {};
    for (const item of report.items) {
      const cat = item.category_name;
      if (!map[cat]) map[cat] = { quantity: 0, amount: 0 };
      map[cat].quantity += item.total_quantity_sold;
      map[cat].amount += parseFloat(item.total_amount);
    }
    return Object.entries(map)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.amount - a.amount);
  }, [report]);

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
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0">
        <PageHeader title="Reports" />

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
              value={startDate}
              max={endDate || undefined}
              onChange={(e) => handleDateChange('start', e.target.value)}
              onClick={(e) => { try { (e.target as HTMLInputElement).showPicker(); } catch {} }}
              className="rounded-md border border-gray-300 px-3 py-2 text-base min-h-[44px]"
              data-testid="filter-date-from"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">To</label>
            <input
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(e) => handleDateChange('end', e.target.value)}
              onClick={(e) => { try { (e.target as HTMLInputElement).showPicker(); } catch {} }}
              className="rounded-md border border-gray-300 px-3 py-2 text-base min-h-[44px]"
              data-testid="filter-date-to"
            />
          </div>

          <Button
            onClick={handleRunReport}
            disabled={!startDate || !endDate || !!dateError || loading}
            data-testid="run-report-btn"
          >
            {loading ? 'Running...' : 'Run Report'}
          </Button>

          <Button
            variant="secondary"
            onClick={handleExportCsv}
            disabled={!report}
            data-testid="export-csv-btn"
          >
            Export CSV
          </Button>
        </div>

        {dateError && (
          <p className="mb-4 text-sm text-red-600" role="alert" data-testid="date-error">
            {dateError}
          </p>
        )}

        {report && (
          <>
            {isStale && (
              <div
                className="mb-4 rounded-md border border-yellow-300 bg-yellow-50 px-4 py-2 text-sm text-yellow-800"
                data-testid="stale-banner"
              >
                Dates have changed — click <strong>Run Report</strong> to update results.
              </div>
            )}

            <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            {categoryTotals.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">By Category</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {categoryTotals.map((cat) => (
                    <div
                      key={cat.name}
                      className="bg-gray-50 border border-gray-200 rounded-md px-3 py-2"
                      data-testid={`category-${cat.name}`}
                    >
                      <p className="text-xs font-medium text-gray-500">{cat.name}</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {cat.quantity} items &mdash;{' '}
                        <CurrencyDisplay amount={cat.amount.toFixed(2)} />
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        <DataTable
          columns={columns}
          data={report?.items ?? []}
          loading={loading}
          emptyMessage={report ? 'No items sold in this period.' : 'Select a period and click "Run Report" to generate.'}
          keyExtractor={(row) => row.item_id ?? row.item_name}
        />
      </div>
    </div>
  );
}

import { useState, useCallback } from 'react';
import { api } from '@/shared/api/client';
import type { ItemsSoldReport } from '@/shared/api/types';

export type ReportPeriod = 'daily' | 'weekly' | 'monthly' | 'custom';

function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDateRange(period: Exclude<ReportPeriod, 'custom'>): { startDate: string; endDate: string } {
  const today = new Date();
  const endDate = toLocalDateString(today);
  const start = new Date(today);

  if (period === 'weekly') {
    start.setDate(start.getDate() - 6);
  } else if (period === 'monthly') {
    start.setDate(start.getDate() - 29);
  }

  const startDate = toLocalDateString(start);
  return { startDate, endDate };
}

export function getPresetDates(period: Exclude<ReportPeriod, 'custom'>) {
  return getDateRange(period);
}

interface UseReportReturn {
  report: ItemsSoldReport | null;
  loading: boolean;
  error: string | null;
  runReport: (startDate: string, endDate: string) => void;
}

export function useReport(): UseReportReturn {
  const [report, setReport] = useState<ItemsSoldReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runReport = useCallback((startDate: string, endDate: string) => {
    if (!startDate || !endDate) return;

    const url = `/api/reports/items-sold/?start_date=${startDate}&end_date=${endDate}`;

    setLoading(true);
    setError(null);
    api
      .get<ItemsSoldReport>(url)
      .then(setReport)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { report, loading, error, runReport };
}

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/shared/api/client';
import type { ItemsSoldReport } from '@/shared/api/types';

export type ReportPeriod = 'daily' | 'weekly' | 'monthly';

function getDateRange(period: ReportPeriod): { startDate: string; endDate: string } {
  const today = new Date();
  const endDate = today.toISOString().split('T')[0];
  const start = new Date(today);

  if (period === 'weekly') {
    start.setDate(start.getDate() - 6);
  } else if (period === 'monthly') {
    start.setDate(start.getDate() - 29);
  }

  const startDate = start.toISOString().split('T')[0];
  return { startDate, endDate };
}

export function useReport(period: ReportPeriod) {
  const [report, setReport] = useState<ItemsSoldReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = useCallback(() => {
    const { startDate, endDate } = getDateRange(period);
    const url = `/api/reports/items-sold/?start_date=${startDate}&end_date=${endDate}`;

    setLoading(true);
    setError(null);
    api
      .get<ItemsSoldReport>(url)
      .then(setReport)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [period]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  return { report, loading, error, refetch: fetchReport };
}

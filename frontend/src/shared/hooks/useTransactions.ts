import { useState, useCallback } from 'react';
import { api } from '@/shared/api/client';
import type { TransactionListItem } from '@/shared/api/types';

interface RunTransactionsParams {
  dateFrom?: string;
  dateTo?: string;
  neighbour?: number;
  onetime?: boolean;
  today?: boolean;
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<TransactionListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runTransactions = useCallback((params?: RunTransactionsParams) => {
    const query = new URLSearchParams();
    if (params?.dateFrom) query.set('date_from', params.dateFrom);
    if (params?.dateTo) query.set('date_to', params.dateTo);
    if (params?.neighbour) query.set('neighbour', String(params.neighbour));
    if (params?.onetime) query.set('onetime', 'true');
    if (params?.today) query.set('today', 'true');

    const queryString = query.toString();
    const url = `/api/transactions/${queryString ? `?${queryString}` : ''}`;

    setLoading(true);
    setError(null);
    api
      .get<TransactionListItem[]>(url)
      .then(setTransactions)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { transactions, loading, error, runTransactions };
}

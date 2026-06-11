import { useState, useEffect, useCallback } from 'react';
import { api } from '@/shared/api/client';
import type { TransactionListItem } from '@/shared/api/types';

interface UseTransactionsParams {
  dateFrom?: string;
  dateTo?: string;
  neighbour?: number;
  today?: boolean;
}

export function useTransactions(params?: UseTransactionsParams) {
  const [transactions, setTransactions] = useState<TransactionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(() => {
    const query = new URLSearchParams();
    if (params?.dateFrom) query.set('date_from', params.dateFrom);
    if (params?.dateTo) query.set('date_to', params.dateTo);
    if (params?.neighbour) query.set('neighbour', String(params.neighbour));
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
  }, [params?.dateFrom, params?.dateTo, params?.neighbour, params?.today]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return { transactions, loading, error, refetch: fetchTransactions };
}

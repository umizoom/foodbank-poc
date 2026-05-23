import { useState, useEffect, useCallback } from 'react';
import { api } from '@/shared/api/client';
import type { Item } from '@/shared/api/types';

interface UseItemsParams {
  search?: string;
  category?: number;
  lowStock?: boolean;
}

export function useItems(params?: UseItemsParams) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(() => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.category) query.set('category', String(params.category));
    if (params?.lowStock) query.set('low_stock', 'true');

    const queryString = query.toString();
    const url = `/api/items/${queryString ? `?${queryString}` : ''}`;

    setLoading(true);
    setError(null);
    api
      .get<Item[]>(url)
      .then(setItems)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [params?.search, params?.category, params?.lowStock]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return { items, loading, error, refetch: fetchItems };
}

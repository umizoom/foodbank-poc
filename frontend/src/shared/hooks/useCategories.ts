import { useState, useEffect, useCallback } from 'react';
import { api } from '@/shared/api/client';
import type { Category } from '@/shared/api/types';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(() => {
    setLoading(true);
    setError(null);
    api
      .get<Category[]>('/api/categories/')
      .then(setCategories)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { categories, loading, error, refetch: fetchCategories };
}

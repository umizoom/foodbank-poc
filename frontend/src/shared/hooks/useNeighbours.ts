import { useState, useEffect, useCallback } from 'react';
import { api } from '@/shared/api/client';
import type { Neighbour } from '@/shared/api/types';

interface UseNeighboursParams {
  search?: string;
}

export function useNeighbours(params?: UseNeighboursParams) {
  const [neighbours, setNeighbours] = useState<Neighbour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNeighbours = useCallback(() => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);

    const queryString = query.toString();
    const url = `/api/neighbours/${queryString ? `?${queryString}` : ''}`;

    setLoading(true);
    setError(null);
    api
      .get<Neighbour[]>(url)
      .then(setNeighbours)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [params?.search]);

  useEffect(() => {
    fetchNeighbours();
  }, [fetchNeighbours]);

  return { neighbours, loading, error, refetch: fetchNeighbours };
}

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/shared/api/client';
import type { Client } from '@/shared/api/types';

interface UseClientsParams {
  search?: string;
}

export function useClients(params?: UseClientsParams) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = useCallback(() => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);

    const queryString = query.toString();
    const url = `/api/clients/${queryString ? `?${queryString}` : ''}`;

    setLoading(true);
    setError(null);
    api
      .get<Client[]>(url)
      .then(setClients)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [params?.search]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  return { clients, loading, error, refetch: fetchClients };
}

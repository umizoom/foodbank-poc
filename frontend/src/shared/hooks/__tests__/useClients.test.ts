import { renderHook, waitFor } from '@testing-library/react';
import { useClients } from '../useClients';

describe('useClients', () => {
  it('fetches clients on mount', async () => {
    const { result } = renderHook(() => useClients());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.clients).toHaveLength(2);
    expect(result.current.clients[0].name).toBe('Maria Garcia');
    expect(result.current.error).toBeNull();
  });

  it('exposes refetch function', async () => {
    const { result } = renderHook(() => useClients());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(typeof result.current.refetch).toBe('function');
  });
});

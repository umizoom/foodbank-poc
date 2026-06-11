import { renderHook, waitFor } from '@testing-library/react';
import { useNeighbours } from '../useNeighbours';

describe('useNeighbours', () => {
  it('fetches neighbours on mount', async () => {
    const { result } = renderHook(() => useNeighbours());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.neighbours).toHaveLength(2);
    expect(result.current.neighbours[0].name).toBe('Maria Garcia');
    expect(result.current.error).toBeNull();
  });

  it('exposes refetch function', async () => {
    const { result } = renderHook(() => useNeighbours());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(typeof result.current.refetch).toBe('function');
  });
});

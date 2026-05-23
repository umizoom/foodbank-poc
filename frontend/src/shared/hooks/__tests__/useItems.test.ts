import { renderHook, waitFor } from '@testing-library/react';
import { useItems } from '../useItems';

describe('useItems', () => {
  it('fetches items on mount', async () => {
    const { result } = renderHook(() => useItems());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.items).toHaveLength(3);
    expect(result.current.items[0].name).toBe('Milk');
    expect(result.current.error).toBeNull();
  });

  it('filters items by low stock', async () => {
    const { result } = renderHook(() => useItems({ lowStock: true }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.items).toHaveLength(2);
    expect(result.current.items.every((i) => i.is_low_stock)).toBe(true);
  });

  it('exposes refetch function', async () => {
    const { result } = renderHook(() => useItems());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(typeof result.current.refetch).toBe('function');
  });
});

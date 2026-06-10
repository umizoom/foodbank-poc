import { renderHook, waitFor } from '@testing-library/react';
import { useReport } from '../useReport';

describe('useReport', () => {
  it('fetches report on mount with default period', async () => {
    const { result } = renderHook(() => useReport('daily'));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.report).not.toBeNull();
    expect(result.current.report!.items).toHaveLength(2);
    expect(result.current.report!.items[0].item_name).toBe('Milk');
    expect(result.current.error).toBeNull();
  });

  it('returns totals in report', async () => {
    const { result } = renderHook(() => useReport('daily'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.report!.totals.total_items_sold).toBe(8);
    expect(result.current.report!.totals.total_revenue).toBe('32.25');
  });

  it('exposes refetch function', async () => {
    const { result } = renderHook(() => useReport('weekly'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(typeof result.current.refetch).toBe('function');
  });
});

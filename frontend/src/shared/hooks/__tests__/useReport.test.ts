import { renderHook, waitFor, act } from '@testing-library/react';
import { useReport } from '../useReport';

describe('useReport', () => {
  it('does not fetch on mount', () => {
    const { result } = renderHook(() => useReport());

    expect(result.current.loading).toBe(false);
    expect(result.current.report).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('fetches report when runReport is called', async () => {
    const { result } = renderHook(() => useReport());

    act(() => {
      result.current.runReport('2026-06-01', '2026-06-10');
    });

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.report).not.toBeNull();
    expect(result.current.report!.items).toHaveLength(2);
    expect(result.current.report!.items[0].item_name).toBe('Milk');
  });

  it('returns totals in report', async () => {
    const { result } = renderHook(() => useReport());

    act(() => {
      result.current.runReport('2026-06-01', '2026-06-10');
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.report!.totals.total_items_sold).toBe(8);
    expect(result.current.report!.totals.total_revenue).toBe('32.25');
  });

  it('does not fetch when dates are empty', () => {
    const { result } = renderHook(() => useReport());

    act(() => {
      result.current.runReport('', '');
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.report).toBeNull();
  });
});

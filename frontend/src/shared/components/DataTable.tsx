import { useRef, useEffect, type ReactNode } from 'react';
import { SpinnerOverlay } from './SpinnerOverlay';

export interface Column<T> {
  key: string;
  header: string;
  render: (item: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  keyExtractor: (item: T) => string | number;
  onRowClick?: (item: T) => void;
  selectable?: boolean;
  selectedIds?: Set<string | number>;
  onSelectionChange?: (ids: Set<string | number>) => void;
}

export function DataTable<T>({
  columns,
  data,
  loading = false,
  emptyMessage = 'No data found.',
  keyExtractor,
  onRowClick,
  selectable = false,
  selectedIds,
  onSelectionChange,
}: DataTableProps<T>) {
  const selectAllRef = useRef<HTMLInputElement>(null);

  const allIds = data.map(keyExtractor);
  const allSelected = allIds.length > 0 && allIds.every((id) => selectedIds?.has(id));
  const someSelected = !allSelected && allIds.some((id) => selectedIds?.has(id));

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  const handleSelectAll = () => {
    if (!onSelectionChange) return;
    if (allSelected) {
      const next = new Set(selectedIds);
      allIds.forEach((id) => next.delete(id));
      onSelectionChange(next);
    } else {
      const next = new Set(selectedIds);
      allIds.forEach((id) => next.add(id));
      onSelectionChange(next);
    }
  };

  const handleSelectRow = (id: string | number) => {
    if (!onSelectionChange || !selectedIds) return;
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    onSelectionChange(next);
  };

  const totalColumns = selectable ? columns.length + 1 : columns.length;

  return (
    <SpinnerOverlay loading={loading}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200" data-testid="data-table">
          <thead className="bg-gray-50">
            <tr>
              {selectable && (
                <th className="px-6 py-3 w-10">
                  <input
                    ref={selectAllRef}
                    type="checkbox"
                    checked={allSelected}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    aria-label="Select all"
                    data-testid="select-all-checkbox"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.length === 0 && !loading ? (
              <tr>
                <td colSpan={totalColumns} className="px-6 py-8 text-center text-gray-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item) => {
                const id = keyExtractor(item);
                return (
                  <tr
                    key={id}
                    className={`hover:bg-gray-50 ${onRowClick ? 'cursor-pointer active:bg-gray-100' : ''}`}
                    onClick={onRowClick ? () => onRowClick(item) : undefined}
                    onKeyDown={onRowClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onRowClick(item); } } : undefined}
                    role={onRowClick ? 'link' : undefined}
                    tabIndex={onRowClick ? 0 : undefined}
                  >
                    {selectable && (
                      <td className="px-6 py-4 w-10">
                        <input
                          type="checkbox"
                          checked={selectedIds?.has(id) ?? false}
                          onChange={() => handleSelectRow(id)}
                          onClick={(e) => e.stopPropagation()}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          aria-label={`Select row ${id}`}
                          data-testid={`select-row-${id}`}
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td key={col.key} className={`px-6 py-4 whitespace-nowrap text-sm ${col.className || ''}`}>
                        {col.render(item)}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </SpinnerOverlay>
  );
}

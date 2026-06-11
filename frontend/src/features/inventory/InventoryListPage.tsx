import { useState, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useItems } from '@/shared/hooks/useItems';
import { useCategories } from '@/shared/hooks/useCategories';
import { PageHeader } from '@/shared/components/PageHeader';
import { DataTable, type Column } from '@/shared/components/DataTable';
import { SearchInput } from '@/shared/components/SearchInput';
import { Button } from '@/shared/components/Button';
import { ConfirmModal } from '@/shared/components/ConfirmModal';
import { CurrencyDisplay } from '@/shared/components/CurrencyDisplay';
import { LowStockIndicator } from './LowStockIndicator';
import { CategoryFilter } from './CategoryFilter';
import { StockUpdateModal } from './StockUpdateModal';
import { api } from '@/shared/api/client';
import { useNotification } from '@/shared/context/NotificationContext';
import type { Item } from '@/shared/api/types';

export function InventoryListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToast } = useNotification();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<number | undefined>();
  const lowStockFilter = searchParams.get('lowStock') === 'true';
  const { items, loading, refetch } = useItems({ search, category: categoryFilter, lowStock: lowStockFilter || undefined });
  const { categories } = useCategories();

  const [deleteTarget, setDeleteTarget] = useState<Item | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [stockTarget, setStockTarget] = useState<Item | null>(null);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/api/items/${deleteTarget.id}/`);
      addToast('success', `"${deleteTarget.name}" deleted`);
      refetch();
    } catch {
      addToast('error', 'Failed to delete item');
    } finally {
      setDeleteLoading(false);
      setDeleteTarget(null);
    }
  }, [deleteTarget, addToast, refetch]);

  const columns: Column<Item>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (item) => (
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900">{item.name}</span>
          <LowStockIndicator stockCount={item.stock_count} threshold={item.low_stock_threshold} />
        </div>
      ),
    },
    { key: 'category', header: 'Category', render: (item) => item.category_name },
    { key: 'cost', header: 'Cost', render: (item) => <CurrencyDisplay amount={item.cost} /> },
    { key: 'stock', header: 'Stock', render: (item) => item.stock_count },
    { key: 'threshold', header: 'Threshold', render: (item) => item.low_stock_threshold },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/inventory/${item.id}/edit`); }}
            className="text-blue-600 hover:underline text-sm"
            data-testid={`edit-item-${item.id}`}
          >
            Edit
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setStockTarget(item); }}
            className="text-green-600 hover:underline text-sm"
            data-testid={`stock-item-${item.id}`}
          >
            Stock
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setDeleteTarget(item); }}
            className="text-red-600 hover:underline text-sm"
            data-testid={`delete-item-${item.id}`}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0">
      <PageHeader
        title="Inventory"
        actions={
          <>
            <Link to="/inventory/categories">
              <Button variant="secondary" data-testid="manage-categories-button">Categories</Button>
            </Link>
            <Link to="/inventory/new">
              <Button data-testid="add-item-button">Add Item</Button>
            </Link>
          </>
        }
      />

      <div className="flex gap-4 mb-4">
        <div className="flex-1">
          <SearchInput value={search} onChange={setSearch} placeholder="Search items..." />
        </div>
        <CategoryFilter
          categories={categories}
          value={categoryFilter}
          onChange={setCategoryFilter}
        />
      </div>

      {lowStockFilter && (
        <div className="mb-4 flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 text-yellow-800 px-3 py-1 text-sm font-medium">
            Low Stock Only
            <button
              onClick={() => {
                searchParams.delete('lowStock');
                setSearchParams(searchParams);
              }}
              className="ml-1 text-yellow-600 hover:text-yellow-900"
              aria-label="Clear low stock filter"
              data-testid="clear-low-stock-filter"
            >
              &times;
            </button>
          </span>
        </div>
      )}
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
      <DataTable
        columns={columns}
        data={items}
        loading={loading}
        emptyMessage="No items in inventory. Add your first item to get started."
        keyExtractor={(item) => item.id}
        onRowClick={(item) => navigate(`/inventory/${item.id}/edit`)}
      />
      </div>

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Item"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {stockTarget && (
        <StockUpdateModal
          item={stockTarget}
          onClose={() => setStockTarget(null)}
          onSuccess={() => {
            setStockTarget(null);
            refetch();
          }}
        />
      )}
    </div>
  );
}

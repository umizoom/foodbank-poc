import { useState } from 'react';
import { useItems } from '@/shared/hooks/useItems';
import { useCategories } from '@/shared/hooks/useCategories';
import { SearchInput } from '@/shared/components/SearchInput';
import { CategoryFilter } from '@/features/inventory/CategoryFilter';
import { ItemCard } from './ItemCard';
import { SpinnerOverlay } from '@/shared/components/SpinnerOverlay';
import type { Cart } from '@/shared/api/types';

interface ItemBrowserProps {
  cart: Cart;
  onCartUpdate: () => void;
}

export function ItemBrowser({ cart, onCartUpdate }: ItemBrowserProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<number | undefined>();
  const { items, loading } = useItems({ search, category: categoryFilter });
  const { categories } = useCategories();

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Browse Items</h3>
      <div className="flex gap-3 mb-4">
        <div className="flex-1">
          <SearchInput value={search} onChange={setSearch} placeholder="Search items..." />
        </div>
        <CategoryFilter categories={categories} value={categoryFilter} onChange={setCategoryFilter} />
      </div>

      <SpinnerOverlay loading={loading}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto" data-testid="item-browser-grid">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} cartId={cart.id} onAdded={onCartUpdate} />
          ))}
          {items.length === 0 && !loading && (
            <p className="text-gray-500 text-sm col-span-2 text-center py-8">No items found.</p>
          )}
        </div>
      </SpinnerOverlay>
    </div>
  );
}

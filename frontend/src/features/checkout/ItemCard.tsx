import { useState } from 'react';
import { api } from '@/shared/api/client';
import { Button } from '@/shared/components/Button';
import { CurrencyDisplay } from '@/shared/components/CurrencyDisplay';
import { LowStockIndicator } from '@/features/inventory/LowStockIndicator';
import type { Item } from '@/shared/api/types';

interface ItemCardProps {
  item: Item;
  cartId: number;
  onAdded: () => void;
}

export function ItemCard({ item, cartId, onAdded }: ItemCardProps) {
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    setLoading(true);
    try {
      await api.post(`/api/carts/${cartId}/items/`, { item_id: item.id, quantity: 1 });
      onAdded();
    } catch {
      // Error handled silently — item may be out of stock
    } finally {
      setLoading(false);
    }
  };

  const outOfStock = item.stock_count === 0;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 flex items-center justify-between" data-testid={`item-card-${item.id}`}>
      <div>
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-gray-900">{item.name}</span>
          <LowStockIndicator stockCount={item.stock_count} threshold={item.low_stock_threshold} />
        </div>
        <div className="flex items-center gap-3 mt-1">
          <CurrencyDisplay amount={item.cost} className="text-sm text-gray-600" />
          <span className="text-xs text-gray-400">Stock: {item.stock_count}</span>
        </div>
      </div>
      <Button
        size="sm"
        onClick={handleAdd}
        disabled={outOfStock}
        loading={loading}
        data-testid={`add-to-cart-${item.id}`}
      >
        Add
      </Button>
    </div>
  );
}

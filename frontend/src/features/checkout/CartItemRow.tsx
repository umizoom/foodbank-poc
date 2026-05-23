import { useState } from 'react';
import { api } from '@/shared/api/client';
import { CurrencyDisplay } from '@/shared/components/CurrencyDisplay';
import type { CartItem } from '@/shared/api/types';

interface CartItemRowProps {
  cartItem: CartItem;
  cartId: number;
  onUpdate: () => void;
}

export function CartItemRow({ cartItem, cartId, onUpdate }: CartItemRowProps) {
  const [updating, setUpdating] = useState(false);

  const handleQuantityChange = async (newQty: number) => {
    if (newQty < 1) {
      await handleRemove();
      return;
    }
    setUpdating(true);
    try {
      await api.patch(`/api/carts/${cartId}/items/${cartItem.item}/`, { quantity: newQty });
      onUpdate();
    } catch {
      // Revert handled by refetch
    } finally {
      setUpdating(false);
    }
  };

  const handleRemove = async () => {
    setUpdating(true);
    try {
      await api.delete(`/api/carts/${cartId}/items/${cartItem.item}/`);
      onUpdate();
    } catch {
      // Error silently handled
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="flex items-center justify-between px-4 py-3" data-testid={`cart-item-${cartItem.item}`}>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{cartItem.item_name}</p>
        <p className="text-xs text-gray-500">
          <CurrencyDisplay amount={cartItem.item_cost} /> each
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleQuantityChange(cartItem.quantity - 1)}
            disabled={updating}
            className="w-7 h-7 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium disabled:opacity-50"
            data-testid={`qty-decrease-${cartItem.item}`}
          >
            -
          </button>
          <span className="w-8 text-center text-sm font-medium" data-testid={`qty-display-${cartItem.item}`}>
            {cartItem.quantity}
          </span>
          <button
            onClick={() => handleQuantityChange(cartItem.quantity + 1)}
            disabled={updating}
            className="w-7 h-7 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium disabled:opacity-50"
            data-testid={`qty-increase-${cartItem.item}`}
          >
            +
          </button>
        </div>

        <span className="w-20 text-right text-sm font-medium">
          <CurrencyDisplay amount={cartItem.line_total} />
        </span>

        <button
          onClick={handleRemove}
          disabled={updating}
          className="text-red-500 hover:text-red-700 text-sm disabled:opacity-50"
          data-testid={`remove-cart-item-${cartItem.item}`}
        >
          &times;
        </button>
      </div>
    </div>
  );
}

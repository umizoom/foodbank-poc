import { useState } from 'react';
import { api } from '@/shared/api/client';
import { ApiError, NetworkError } from '@/shared/api/errors';
import { Button } from '@/shared/components/Button';
import { ConfirmModal } from '@/shared/components/ConfirmModal';
import { AlertBanner } from '@/shared/components/AlertBanner';
import { useNotification } from '@/shared/context/NotificationContext';
import { CartItemRow } from './CartItemRow';
import { CartSummary } from './CartSummary';
import type { Cart, Transaction } from '@/shared/api/types';

interface CartPanelProps {
  cart: Cart;
  clientBalance: string;
  onCartUpdate: () => void;
  onCheckoutSuccess: (tx: Transaction) => void;
  onCancel: () => void;
}

export function CartPanel({ cart, clientBalance, onCartUpdate, onCheckoutSuccess, onCancel }: CartPanelProps) {
  const { addToast } = useNotification();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    setError(null);
    try {
      const tx = await api.post<Transaction>(`/api/carts/${cart.id}/checkout/`);
      addToast('success', 'Checkout completed successfully');
      onCheckoutSuccess(tx);
    } catch (err) {
      if (err instanceof ApiError && err.data?.error === 'Insufficient balance') {
        setError('Insufficient balance. Remove items and try again.');
      } else if (err instanceof NetworkError) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError('Checkout failed. Please try again.');
      }
    } finally {
      setCheckoutLoading(false);
      setShowConfirm(false);
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Cart</h3>

      {error && <AlertBanner type="error" message={error} onDismiss={() => setError(null)} />}

      {cart.items.length === 0 ? (
        <p className="text-gray-500 text-sm py-8 text-center bg-white rounded-lg border border-gray-200">
          Cart is empty. Browse items to add to the cart.
        </p>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-100 max-h-[40vh] overflow-y-auto" data-testid="cart-items-list">
            {cart.items.map((item) => (
              <CartItemRow
                key={item.id}
                cartItem={item}
                cartId={cart.id}
                onUpdate={onCartUpdate}
              />
            ))}
          </div>

          <CartSummary cartTotal={cart.total} clientBalance={clientBalance} />

          <div className="p-4 border-t border-gray-200 flex gap-3">
            <Button
              onClick={() => setShowConfirm(true)}
              loading={checkoutLoading}
              data-testid="process-checkout-button"
            >
              Process Checkout
            </Button>
            <Button
              variant="danger"
              onClick={() => setShowCancelConfirm(true)}
              data-testid="cancel-checkout-button"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      <ConfirmModal
        open={showConfirm}
        title="Confirm Checkout"
        message={`Complete checkout for ${cart.client_name}? Total: $${cart.total}`}
        confirmLabel="Complete Checkout"
        loading={checkoutLoading}
        onConfirm={handleCheckout}
        onCancel={() => setShowConfirm(false)}
      />

      <ConfirmModal
        open={showCancelConfirm}
        title="Cancel Checkout"
        message="Cancel this checkout? The cart will be cleared."
        confirmLabel="Yes, Cancel"
        variant="danger"
        onConfirm={onCancel}
        onCancel={() => setShowCancelConfirm(false)}
      />
    </div>
  );
}

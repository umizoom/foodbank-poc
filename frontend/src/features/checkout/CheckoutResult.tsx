import { Button } from '@/shared/components/Button';
import { CurrencyDisplay } from '@/shared/components/CurrencyDisplay';
import type { Transaction } from '@/shared/api/types';

interface CheckoutResultProps {
  transaction: Transaction | null;
  onNewCheckout: () => void;
}

export function CheckoutResult({ transaction, onNewCheckout }: CheckoutResultProps) {
  return (
    <div className="max-w-md mx-auto mt-12" data-testid="checkout-result">
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <div className="text-green-500 text-5xl mb-4">&#10003;</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Checkout Complete</h2>

        {transaction && (
          <div className="text-sm text-gray-600 mb-6 space-y-1">
            <p>Client: <strong>{transaction.client_name}</strong></p>
            <p>
              Total: <strong><CurrencyDisplay amount={transaction.total_amount} /></strong>
            </p>
            <p>Items: <strong>{transaction.items.length}</strong></p>
          </div>
        )}

        <Button onClick={onNewCheckout} data-testid="new-checkout-button">
          New Checkout
        </Button>
      </div>
    </div>
  );
}

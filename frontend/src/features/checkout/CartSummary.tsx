import { CurrencyDisplay } from '@/shared/components/CurrencyDisplay';

interface CartSummaryProps {
  cartTotal: string;
  neighbourBalance: string;
}

export function CartSummary({ cartTotal, neighbourBalance }: CartSummaryProps) {
  const total = parseFloat(cartTotal);
  const balance = parseFloat(neighbourBalance);
  const remaining = balance - total;
  const isOverBudget = remaining < 0;

  return (
    <div className="p-4 bg-gray-50 border-t border-gray-200" data-testid="cart-summary">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">Cart Total:</span>
        <span className="font-bold text-gray-900">
          <CurrencyDisplay amount={cartTotal} />
        </span>
      </div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">Neighbour Balance:</span>
        <span className="font-medium">
          <CurrencyDisplay amount={neighbourBalance} />
        </span>
      </div>
      <div className="flex justify-between text-sm border-t border-gray-200 pt-2 mt-2">
        <span className="text-gray-600">Remaining after checkout:</span>
        <span className={`font-bold ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
          <CurrencyDisplay amount={remaining.toFixed(2)} />
        </span>
      </div>
      {isOverBudget && (
        <p className="text-xs text-red-600 mt-2">Insufficient balance — remove items before checkout.</p>
      )}
    </div>
  );
}

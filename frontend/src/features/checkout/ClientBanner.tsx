import { CurrencyDisplay } from '@/shared/components/CurrencyDisplay';
import type { Client, Cart } from '@/shared/api/types';

interface ClientBannerProps {
  client: Client;
  cart: Cart;
}

export function ClientBanner({ client, cart }: ClientBannerProps) {
  const balance = parseFloat(client.balance);
  const cartTotal = parseFloat(cart.total);
  const remaining = balance - cartTotal;
  const isOverBudget = remaining < 0;

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between" data-testid="client-banner">
      <div>
        <span className="text-sm text-gray-500">Client:</span>
        <span className="ml-2 font-semibold text-gray-900">{client.name}</span>
      </div>
      <div className="flex items-center gap-6">
        <div>
          <span className="text-sm text-gray-500">Balance:</span>
          <span className="ml-1 font-medium">
            <CurrencyDisplay amount={client.balance} />
          </span>
        </div>
        <div>
          <span className="text-sm text-gray-500">Cart:</span>
          <span className="ml-1 font-medium">
            <CurrencyDisplay amount={cart.total} />
          </span>
        </div>
        <div>
          <span className="text-sm text-gray-500">Remaining:</span>
          <span className={`ml-1 font-bold ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
            <CurrencyDisplay amount={remaining.toFixed(2)} />
          </span>
        </div>
      </div>
    </div>
  );
}

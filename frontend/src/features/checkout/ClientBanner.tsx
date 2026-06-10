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
  const hasClientInfo = client.allergies.length > 0 || client.diaper_size || !client.catchment_area;

  return (
    <div className="bg-white rounded-lg shadow-sm" data-testid="client-banner">
      <div className="p-4 flex items-center justify-between">
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
      {hasClientInfo && (
        <div className="px-4 pb-3 border-t border-gray-100 pt-2 flex items-center gap-4 flex-wrap text-sm">
          {client.allergies.length > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-amber-600 font-medium">Allergies:</span>
              {client.allergies.map((a) => (
                <span key={a} className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-xs">
                  {a}
                </span>
              ))}
            </div>
          )}
          {client.diaper_size && (
            <div className="flex items-center gap-1">
              <span className="text-gray-500">Diaper Size:</span>
              <span className="font-medium">{client.diaper_size}</span>
            </div>
          )}
          {!client.catchment_area && (
            <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs font-medium">
              Out of catchment area
            </span>
          )}
        </div>
      )}
    </div>
  );
}

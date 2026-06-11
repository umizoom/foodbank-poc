import { CurrencyDisplay } from '@/shared/components/CurrencyDisplay';
import type { Neighbour, Cart } from '@/shared/api/types';

interface NeighbourBannerProps {
  neighbour: Neighbour;
  cart: Cart;
}

export function NeighbourBanner({ neighbour, cart }: NeighbourBannerProps) {
  const balance = parseFloat(neighbour.balance);
  const cartTotal = parseFloat(cart.total);
  const remaining = balance - cartTotal;
  const isOverBudget = remaining < 0;
  const hasNeighbourInfo = neighbour.allergies.length > 0 || neighbour.diaper_size || !neighbour.catchment_area;
  const hasNotes = neighbour.notes && neighbour.notes.trim().length > 0;

  return (
    <div className="bg-white rounded-lg shadow-sm" data-testid="neighbour-banner">
      <div className="p-4 flex items-center justify-between">
        <div>
          <span className="text-sm text-gray-500">Neighbour:</span>
          <span className="ml-2 font-semibold text-gray-900">{neighbour.name}</span>
        </div>
        <div className="flex items-center gap-6">
          <div>
            <span className="text-sm text-gray-500">Balance:</span>
            <span className="ml-1 font-medium">
              <CurrencyDisplay amount={neighbour.balance} />
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
      {hasNeighbourInfo && (
        <div className="px-4 pb-3 border-t border-gray-100 pt-2 flex items-center gap-4 flex-wrap text-sm">
          {neighbour.allergies.length > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-amber-600 font-medium">Allergies:</span>
              {neighbour.allergies.map((a) => (
                <span key={a} className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-xs">
                  {a}
                </span>
              ))}
            </div>
          )}
          {neighbour.diaper_size && (
            <div className="flex items-center gap-1">
              <span className="text-gray-500">Diaper Size:</span>
              <span className="font-medium">{neighbour.diaper_size}</span>
            </div>
          )}
          {!neighbour.catchment_area && (
            <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs font-medium">
              Out of catchment area
            </span>
          )}
        </div>
      )}
      {hasNotes && (
        <div className="px-4 pb-3 border-t border-gray-100 pt-2">
          <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-md px-3 py-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-blue-500 mt-0.5 shrink-0">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            <p className="text-sm text-blue-900 whitespace-pre-wrap max-h-20 overflow-y-auto" data-testid="neighbour-notes">
              {neighbour.notes}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

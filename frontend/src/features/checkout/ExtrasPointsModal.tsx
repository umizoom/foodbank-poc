import { useEffect, useState } from 'react';
import { api } from '@/shared/api/client';
import { Button } from '@/shared/components/Button';
import type { Item } from '@/shared/api/types';

interface ExtrasPointsModalProps {
  open: boolean;
  item: Item;
  cartId: number;
  onSuccess: () => void;
  onClose: () => void;
}

export function ExtrasPointsModal({ open, item, cartId, onSuccess, onClose }: ExtrasPointsModalProps) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const options = Array.from({ length: item.max_cost }, (_, i) => i + 1);

  const handleSelect = async (cost: number) => {
    setLoading(true);
    try {
      await api.post(`/api/carts/${cartId}/items/`, {
        item_id: item.id,
        quantity: 1,
        unit_cost_override: cost,
      });
      onSuccess();
    } catch {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="extras-modal-title"
      data-testid="extras-points-modal"
    >
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
        <h2 id="extras-modal-title" className="text-lg font-semibold text-gray-900 mb-1">
          Add Extras
        </h2>
        <p className="text-sm text-gray-600 mb-4">Select cost ($1-${item.max_cost})</p>
        <div className="grid grid-cols-5 gap-2 mb-4">
          {options.map((cost) => (
            <button
              key={cost}
              onClick={() => handleSelect(cost)}
              disabled={loading}
              className="h-14 rounded-lg bg-indigo-50 hover:bg-indigo-100 border-2 border-indigo-200 hover:border-indigo-400 text-indigo-700 text-lg font-bold disabled:opacity-50 transition-colors"
              data-testid={`extras-points-${cost}`}
            >
              ${cost}
            </button>
          ))}
        </div>
        <div className="flex justify-end">
          <Button variant="secondary" onClick={onClose} disabled={loading} data-testid="extras-modal-cancel">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

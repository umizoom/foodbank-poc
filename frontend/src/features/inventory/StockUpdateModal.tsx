import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { api } from '@/shared/api/client';
import { useNotification } from '@/shared/context/NotificationContext';
import { FormField } from '@/shared/components/FormField';
import { Button } from '@/shared/components/Button';
import { AlertBanner } from '@/shared/components/AlertBanner';
import type { Item } from '@/shared/api/types';

interface StockUpdateModalProps {
  item: Item;
  onClose: () => void;
  onSuccess: () => void;
}

interface StockFormData {
  operation: 'set' | 'add' | 'subtract';
  quantity: string;
}

export function StockUpdateModal({ item, onClose, onSuccess }: StockUpdateModalProps) {
  const { addToast } = useNotification();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<StockFormData>({
    defaultValues: { operation: 'add', quantity: '' },
  });

  const onSubmit = async (data: StockFormData) => {
    setLoading(true);
    setError(null);
    try {
      await api.patch(`/api/items/${item.id}/stock/`, {
        operation: data.operation,
        quantity: Number(data.quantity),
      });
      addToast('success', `Stock updated for "${item.name}"`);
      onSuccess();
    } catch {
      setError('Failed to update stock. Quantity may result in negative stock.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true" data-testid="stock-update-modal">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Update Stock</h2>
        <p className="text-sm text-gray-500 mb-4">{item.name} (current: {item.stock_count})</p>

        {error && <AlertBanner type="error" message={error} onDismiss={() => setError(null)} />}

        <form onSubmit={handleSubmit(onSubmit)}>
          <FormField label="Operation" required error={errors.operation?.message}>
            {(props) => (
              <select
                {...register('operation', { required: 'Select an operation' })}
                className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                data-testid="stock-operation-select"
                {...props}
              >
                <option value="add">Add</option>
                <option value="subtract">Subtract</option>
                <option value="set">Set to</option>
              </select>
            )}
          </FormField>

          <FormField label="Quantity" required error={errors.quantity?.message}>
            {(props) => (
              <input
                {...register('quantity', {
                  required: 'Quantity is required',
                  min: { value: 0, message: 'Quantity must be 0 or greater' },
                  validate: (v) => Number.isInteger(Number(v)) || 'Must be a whole number',
                })}
                type="number"
                min="0"
                className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                data-testid="stock-quantity-input"
                {...props}
              />
            )}
          </FormField>

          <div className="flex gap-3 mt-4">
            <Button type="submit" loading={loading} data-testid="stock-submit-button">Update</Button>
            <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { api } from '@/shared/api/client';
import { FormField } from '@/shared/components/FormField';
import { Button } from '@/shared/components/Button';
import { AlertBanner } from '@/shared/components/AlertBanner';
import type { Neighbour, Cart } from '@/shared/api/types';

interface OnetimeCheckoutFormProps {
  onNeighbourIdentified: (neighbour: Neighbour, cart: Cart) => void;
  onCancel: () => void;
}

interface OnetimeFormData {
  num_adults: number;
  num_children: number;
  balance: string;
}

export function OnetimeCheckoutForm({ onNeighbourIdentified, onCancel }: OnetimeCheckoutFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<OnetimeFormData>({
    defaultValues: { num_adults: 1, num_children: 0, balance: '' },
  });

  const onSubmit = async (data: OnetimeFormData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post<{ neighbour: Neighbour; cart: Cart }>(
        '/api/neighbours/onetime-checkout/',
        {
          num_adults: Number(data.num_adults),
          num_children: Number(data.num_children),
          balance: data.balance,
        }
      );
      onNeighbourIdentified(response.neighbour, response.cart);
    } catch {
      setError('Failed to start one-time checkout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12">
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-2 text-center">Courtesy Checkout</h2>
        <p className="text-sm text-gray-500 mb-6 text-center">One-time checkout — no registration required</p>

        {error && <AlertBanner type="error" message={error} onDismiss={() => setError(null)} />}

        <form onSubmit={handleSubmit(onSubmit)}>
          <FormField label="Number of Adults" required error={errors.num_adults?.message}>
            {(props) => (
              <input
                type="number"
                {...register('num_adults', {
                  required: 'Required',
                  min: { value: 1, message: 'At least 1' },
                  max: { value: 7, message: 'Maximum 7' },
                })}
                className="w-full rounded-md border border-gray-300 px-4 py-2 text-base focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                {...props}
              />
            )}
          </FormField>

          <FormField label="Number of Children" error={errors.num_children?.message}>
            {(props) => (
              <input
                type="number"
                {...register('num_children', {
                  min: { value: 0, message: 'Cannot be negative' },
                  max: { value: 7, message: 'Maximum 7' },
                })}
                className="w-full rounded-md border border-gray-300 px-4 py-2 text-base focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                {...props}
              />
            )}
          </FormField>

          <FormField label="Balance" required error={errors.balance?.message}>
            {(props) => (
              <input
                type="number"
                step="0.01"
                {...register('balance', {
                  required: 'Required',
                  min: { value: 0.01, message: 'Must be greater than 0' },
                })}
                className="w-full rounded-md border border-gray-300 px-4 py-2 text-base focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="0.00"
                {...props}
              />
            )}
          </FormField>

          <div className="flex gap-3 mt-4">
            <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
              Back
            </Button>
            <Button type="submit" loading={loading} className="flex-1">
              Start Checkout
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

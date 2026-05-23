import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { api } from '@/shared/api/client';
import { FormField } from '@/shared/components/FormField';
import { Button } from '@/shared/components/Button';
import { AlertBanner } from '@/shared/components/AlertBanner';
import { ApiError } from '@/shared/api/errors';
import type { Client, Cart } from '@/shared/api/types';

interface CardSimulatorProps {
  onClientIdentified: (client: Client, cart: Cart) => void;
}

interface CardFormData {
  card_id: string;
}

export function CardSimulator({ onClientIdentified }: CardSimulatorProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<CardFormData>();

  const onSubmit = async (data: CardFormData) => {
    setLoading(true);
    setError(null);
    try {
      const client = await api.get<Client>(`/api/clients/lookup/?card_id=${encodeURIComponent(data.card_id)}`);
      const cart = await api.post<Cart>('/api/carts/', { client: client.id });
      onClientIdentified(client, cart);
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) {
        setError('No client found with this card ID');
      } else {
        setError('Failed to identify client');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12">
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Simulate Card Tap</h2>
        <p className="text-sm text-gray-500 mb-6">Enter the client's card ID to begin checkout</p>

        {error && <AlertBanner type="error" message={error} onDismiss={() => setError(null)} />}

        <form onSubmit={handleSubmit(onSubmit)} data-testid="card-simulator-form">
          <FormField label="Card ID" required error={errors.card_id?.message}>
            {(props) => (
              <input
                {...register('card_id', { required: 'Please enter a card ID' })}
                className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Enter card ID..."
                data-testid="card-id-input"
                {...props}
              />
            )}
          </FormField>
          <Button type="submit" loading={loading} className="w-full" data-testid="simulate-card-button">
            Simulate Card Tap
          </Button>
        </form>
      </div>
    </div>
  );
}

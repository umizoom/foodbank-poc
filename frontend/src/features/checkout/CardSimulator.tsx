import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { api } from '@/shared/api/client';
import { FormField } from '@/shared/components/FormField';
import { Button } from '@/shared/components/Button';
import { AlertBanner } from '@/shared/components/AlertBanner';
import { QrScanner } from '@/shared/components/QrScanner';
import { ApiError, UnauthorizedError } from '@/shared/api/errors';
import type { Neighbour, Cart } from '@/shared/api/types';

interface CardSimulatorProps {
  onNeighbourIdentified: (neighbour: Neighbour, cart: Cart) => void;
}

interface CardFormData {
  card_id: string;
}

export function CardSimulator({ onNeighbourIdentified }: CardSimulatorProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<CardFormData>();

  const identify = async (cardId: string) => {
    setLoading(true);
    setError(null);
    try {
      const neighbour = await api.get<Neighbour>(`/api/neighbours/lookup/?card_id=${encodeURIComponent(cardId)}`);
      const cart = await api.post<Cart>('/api/carts/', { neighbour_id: neighbour.id });
      onNeighbourIdentified(neighbour, cart);
    } catch (e) {
      if (e instanceof UnauthorizedError) {
        setError('Session expired. Please log in again.');
      } else if (e instanceof ApiError && e.status === 403) {
        setError('Session expired. Please log in again.');
      } else if (e instanceof ApiError && e.status === 404) {
        setError('No neighbour found with this card ID');
      } else {
        setError('Failed to identify neighbour');
      }
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (data: CardFormData) => identify(data.card_id);

  return (
    <div className="max-w-md mx-auto mt-12">
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Simulate Card Tap</h2>
        <p className="text-sm text-gray-500 mb-6">Scan the neighbour's QR code or enter their card ID to begin checkout</p>

        {error && <AlertBanner type="error" message={error} onDismiss={() => setError(null)} />}

        <form onSubmit={handleSubmit(onSubmit)} data-testid="card-simulator-form">
          <FormField label="Card ID" required error={errors.card_id?.message}>
            {(props) => (
              <input
                {...register('card_id', { required: 'Please enter a card ID' })}
                className="w-full rounded-md border border-gray-300 px-4 py-2 text-base focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Enter card ID..."
                data-testid="card-id-input"
                {...props}
              />
            )}
          </FormField>
          <div className="flex flex-col gap-2">
            <Button type="submit" loading={loading} className="w-full" data-testid="simulate-card-button">
              Simulate Card Tap
            </Button>
            <Button
              variant="secondary"
              type="button"
              className="w-full"
              disabled={loading}
              onClick={() => setScannerOpen(true)}
              data-testid="scan-qr-button"
            >
              Scan QR
            </Button>
          </div>
        </form>
      </div>

      {scannerOpen && (
        <QrScanner
          onScan={(value) => {
            setScannerOpen(false);
            identify(value);
          }}
          onClose={() => setScannerOpen(false)}
        />
      )}
    </div>
  );
}

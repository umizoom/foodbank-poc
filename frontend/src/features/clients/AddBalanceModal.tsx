import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { api } from '@/shared/api/client';
import { useNotification } from '@/shared/context/NotificationContext';
import { FormField } from '@/shared/components/FormField';
import { Button } from '@/shared/components/Button';
import { AlertBanner } from '@/shared/components/AlertBanner';

interface AddBalanceModalProps {
  clientId: number;
  clientName: string;
  onClose: () => void;
  onSuccess: () => void;
}

interface BalanceFormData {
  amount: string;
}

export function AddBalanceModal({ clientId, clientName, onClose, onSuccess }: AddBalanceModalProps) {
  const { addToast } = useNotification();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<BalanceFormData>();

  const onSubmit = async (data: BalanceFormData) => {
    setLoading(true);
    setError(null);
    try {
      await api.post(`/api/clients/${clientId}/balance/`, { amount: data.amount });
      addToast('success', `Added $${data.amount} to ${clientName}'s balance`);
      onSuccess();
    } catch {
      setError('Failed to add balance. Amount may exceed maximum ($2,000.00).');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true" data-testid="add-balance-modal">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Add Balance</h2>
        <p className="text-sm text-gray-500 mb-4">Adding to: {clientName}</p>

        {error && <AlertBanner type="error" message={error} onDismiss={() => setError(null)} />}

        <form onSubmit={handleSubmit(onSubmit)}>
          <FormField label="Amount (CAD)" required error={errors.amount?.message}>
            {(props) => (
              <input
                {...register('amount', {
                  required: 'Amount is required',
                  pattern: { value: /^\d+(\.\d{1,2})?$/, message: 'Amount cannot exceed 2 decimal places' },
                  validate: {
                    positive: (v) => parseFloat(v) > 0 || 'Amount must be greater than zero',
                    max: (v) => parseFloat(v) <= 2000 || 'Amount cannot exceed $2,000.00',
                  },
                })}
                type="text"
                inputMode="decimal"
                placeholder="0.00"
                className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                data-testid="balance-amount-input"
                {...props}
              />
            )}
          </FormField>

          <div className="flex gap-3 mt-4">
            <Button type="submit" loading={loading} data-testid="balance-submit-button">Add Balance</Button>
            <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/shared/api/client';
import { useNotification } from '@/shared/context/NotificationContext';
import { PageHeader } from '@/shared/components/PageHeader';
import { FormField } from '@/shared/components/FormField';
import { Button } from '@/shared/components/Button';

export function ExtrasConfigPage() {
  const navigate = useNavigate();
  const { addToast } = useNotification();
  const [maxCost, setMaxCost] = useState('5');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    api.get<{ max_cost: number }>('/api/extras-config/').then((data) => {
      setMaxCost(String(data.max_cost));
    }).finally(() => setFetching(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = Number(maxCost);
    if (!Number.isInteger(value) || value < 1) return;

    setLoading(true);
    try {
      await api.patch('/api/extras-config/', { max_cost: value });
      addToast('success', `Extras range updated to $1-$${value}`);
      navigate('/inventory');
    } catch {
      addToast('error', 'Failed to update extras configuration');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return null;

  return (
    <div className="max-w-lg">
      <PageHeader title="Configure Extras" />

      <p className="text-sm text-gray-600 mb-6">
        Extras are miscellaneous donated items with a variable cost. Set the maximum dollar value a volunteer can assign during checkout.
      </p>

      <form onSubmit={handleSubmit} data-testid="extras-config-form">
        <FormField label="Maximum cost ($)" required>
          {(props) => (
            <input
              type="number"
              min="1"
              value={maxCost}
              onChange={(e) => setMaxCost(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-4 py-2 text-base focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              data-testid="extras-max-cost-input"
              {...props}
            />
          )}
        </FormField>

        <div className="flex gap-3 mt-6">
          <Button type="submit" loading={loading} data-testid="extras-config-submit">
            Save
          </Button>
          <Button variant="secondary" type="button" onClick={() => navigate('/inventory')} data-testid="extras-config-cancel">
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

import { useState } from 'react';
import { api } from '@/shared/api/client';
import { useNotification } from '@/shared/context/NotificationContext';
import { Button } from '@/shared/components/Button';
import { AlertBanner } from '@/shared/components/AlertBanner';
import { COMMON_ALLERGIES } from '@/shared/api/types';

type BulkAction = 'allergies' | 'catchment_area' | 'reset_balance' | 'num_adults' | 'num_children';

interface BulkEditModalProps {
  selectedIds: Set<number>;
  onClose: () => void;
  onSuccess: () => void;
}

const ACTION_OPTIONS: { value: BulkAction; label: string }[] = [
  { value: 'allergies', label: 'Allergies / Dietary Restrictions' },
  { value: 'catchment_area', label: 'Catchment Area' },
  { value: 'reset_balance', label: 'Reset Balance' },
  { value: 'num_adults', label: 'Number of Adults' },
  { value: 'num_children', label: 'Number of Children' },
];

export function BulkEditModal({ selectedIds, onClose, onSuccess }: BulkEditModalProps) {
  const { addToast } = useNotification();
  const [action, setAction] = useState<BulkAction | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [allergies, setAllergies] = useState<string[]>([]);
  const [customAllergy, setCustomAllergy] = useState('');
  const [catchmentArea, setCatchmentArea] = useState<boolean>(true);
  const [numAdults, setNumAdults] = useState<number>(1);
  const [numChildren, setNumChildren] = useState<number>(0);

  const getValueForAction = (): unknown => {
    switch (action) {
      case 'allergies': return allergies;
      case 'catchment_area': return catchmentArea;
      case 'num_adults': return numAdults;
      case 'num_children': return numChildren;
      case 'reset_balance': return null;
      default: return null;
    }
  };

  const handleSubmit = async () => {
    if (!action) return;
    setLoading(true);
    setError(null);
    try {
      const result = await api.post<{ updated_count: number }>('/api/neighbours/bulk-edit/', {
        ids: Array.from(selectedIds),
        action,
        value: getValueForAction(),
      });
      addToast('success', `Successfully updated ${result.updated_count} neighbours.`);
      onSuccess();
    } catch {
      setError('Failed to apply bulk edit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addCustomAllergy = () => {
    const val = customAllergy.trim();
    if (val && !allergies.includes(val)) {
      setAllergies([...allergies, val]);
    }
    setCustomAllergy('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      data-testid="bulk-edit-modal"
    >
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Bulk Edit ({selectedIds.size} neighbours selected)
        </h2>

        {error && <AlertBanner type="error" message={error} onDismiss={() => setError(null)} />}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
          <select
            value={action}
            onChange={(e) => setAction(e.target.value as BulkAction | '')}
            className="w-full rounded-md border border-gray-300 px-4 py-2 text-base focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            data-testid="bulk-edit-action-select"
          >
            <option value="">Select an action...</option>
            {ACTION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {action === 'allergies' && (
          <div data-testid="bulk-edit-allergies-field">
            <label className="block text-sm font-medium text-gray-700 mb-1">Allergies</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {COMMON_ALLERGIES.map((allergy) => (
                <button
                  key={allergy}
                  type="button"
                  onClick={() => {
                    if (allergies.includes(allergy)) {
                      setAllergies(allergies.filter((a) => a !== allergy));
                    } else {
                      setAllergies([...allergies, allergy]);
                    }
                  }}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                    allergies.includes(allergy)
                      ? 'bg-amber-100 border-amber-300 text-amber-800'
                      : 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {allergy}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={customAllergy}
                onChange={(e) => setCustomAllergy(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomAllergy(); } }}
                placeholder="Add custom allergy..."
                className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-base focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={addCustomAllergy}
                className="px-3 py-2 text-sm bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
              >
                Add
              </button>
            </div>
            {allergies.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {allergies.map((a) => (
                  <span key={a} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-800">
                    {a}
                    <button type="button" onClick={() => setAllergies(allergies.filter((x) => x !== a))} className="text-amber-600 hover:text-amber-900">&times;</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {action === 'catchment_area' && (
          <div data-testid="bulk-edit-catchment-field">
            <label className="block text-sm font-medium text-gray-700 mb-2">Catchment Area</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="catchment"
                  checked={catchmentArea === true}
                  onChange={() => setCatchmentArea(true)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">In Catchment</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="catchment"
                  checked={catchmentArea === false}
                  onChange={() => setCatchmentArea(false)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Out of Catchment</span>
              </label>
            </div>
          </div>
        )}

        {action === 'reset_balance' && (
          <div data-testid="bulk-edit-reset-balance-field">
            <p className="text-sm text-gray-600 bg-amber-50 border border-amber-200 rounded-md p-3">
              This will recalculate balances for the selected neighbours based on their current household size and catchment area. Existing balances will be overwritten.
            </p>
          </div>
        )}

        {action === 'num_adults' && (
          <div data-testid="bulk-edit-num-adults-field">
            <label className="block text-sm font-medium text-gray-700 mb-1">Number of Adults</label>
            <input
              type="number"
              min={1}
              max={7}
              value={numAdults}
              onChange={(e) => setNumAdults(Number(e.target.value))}
              className="w-full rounded-md border border-gray-300 px-4 py-2 text-base focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              data-testid="bulk-edit-num-adults-input"
            />
          </div>
        )}

        {action === 'num_children' && (
          <div data-testid="bulk-edit-num-children-field">
            <label className="block text-sm font-medium text-gray-700 mb-1">Number of Children</label>
            <input
              type="number"
              min={0}
              max={7}
              value={numChildren}
              onChange={(e) => setNumChildren(Number(e.target.value))}
              className="w-full rounded-md border border-gray-300 px-4 py-2 text-base focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              data-testid="bulk-edit-num-children-input"
            />
          </div>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            loading={loading}
            disabled={!action}
            data-testid="bulk-edit-apply-button"
          >
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
}

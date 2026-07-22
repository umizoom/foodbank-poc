import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { api } from '@/shared/api/client';
import { useFormApiError } from '@/shared/hooks/useFormApiError';
import { useNotification } from '@/shared/context/NotificationContext';
import { PageHeader } from '@/shared/components/PageHeader';
import { FormField } from '@/shared/components/FormField';
import { Button } from '@/shared/components/Button';
import { AlertBanner } from '@/shared/components/AlertBanner';
import { QrScanner } from '@/shared/components/QrScanner';
import type { Neighbour } from '@/shared/api/types';
import { COMMON_ALLERGIES } from '@/shared/api/types';

interface NeighbourFormData {
  name: string;
  card_id: string;
  num_adults: number;
  num_children: number;
  allergies: string[];
  diaper_size: string;
  catchment_area: boolean;
  notes: string;
}

export function NeighbourFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { addToast } = useNotification();
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const [customAllergy, setCustomAllergy] = useState('');
  const [scannerOpen, setScannerOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    setValue,
    control,
    formState: { errors },
  } = useForm<NeighbourFormData>({
    defaultValues: { allergies: [], catchment_area: true, diaper_size: '', notes: '', num_adults: 1, num_children: 0 },
  });

  const handleApiError = useFormApiError<NeighbourFormData>(setError);

  useEffect(() => {
    if (isEdit) {
      api.get<Neighbour>(`/api/neighbours/${id}/`).then((neighbour) => {
        reset({
          name: neighbour.name,
          card_id: neighbour.card_id ?? '',
          num_adults: neighbour.num_adults,
          num_children: neighbour.num_children,
          allergies: neighbour.allergies,
          diaper_size: neighbour.diaper_size,
          catchment_area: neighbour.catchment_area,
          notes: neighbour.notes,
        });
      });
    }
  }, [id, isEdit, reset]);

  const onSubmit = async (data: NeighbourFormData) => {
    setLoading(true);
    setGeneralError(null);

    try {
      if (isEdit) {
        await api.put(`/api/neighbours/${id}/`, data);
        addToast('success', `Neighbour "${data.name}" updated`);
        navigate(`/neighbours/${id}`);
      } else {
        await api.post('/api/neighbours/', data);
        addToast('success', `Neighbour "${data.name}" registered`);
        navigate('/neighbours');
      }
    } catch (e) {
      const msg = handleApiError(e);
      if (msg) {
        setGeneralError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg">
      <PageHeader title={isEdit ? 'Edit Neighbour' : 'Register Neighbour'} />

      {generalError && <AlertBanner type="error" message={generalError} onDismiss={() => setGeneralError(null)} />}

      <form onSubmit={handleSubmit(onSubmit)} data-testid="neighbour-form">
        <FormField label="Name" required error={errors.name?.message}>
          {(props) => (
            <input
              {...register('name', { required: 'Name is required', maxLength: { value: 200, message: 'Name must be under 200 characters' } })}
              className="w-full rounded-md border border-gray-300 px-4 py-2 text-base focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              data-testid="neighbour-name-input"
              {...props}
            />
          )}
        </FormField>

        <FormField label="Card ID" required error={errors.card_id?.message}>
          {(props) => (
            <div className="flex gap-2">
              <input
                {...register('card_id', { required: 'Card ID is required', maxLength: { value: 100, message: 'Card ID must be under 100 characters' } })}
                className="w-full rounded-md border border-gray-300 px-4 py-2 text-base focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Enter or scan a card ID..."
                data-testid="neighbour-card-input"
                {...props}
              />
              <Button
                variant="secondary"
                type="button"
                onClick={() => setScannerOpen(true)}
                data-testid="neighbour-scan-qr-button"
              >
                Scan QR
              </Button>
            </div>
          )}
        </FormField>

        {scannerOpen && (
          <QrScanner
            onScan={(value) => {
              setValue('card_id', value, { shouldValidate: true });
              setScannerOpen(false);
              addToast('success', 'QR code scanned');
            }}
            onClose={() => setScannerOpen(false)}
          />
        )}

        <hr className="my-6 border-gray-200" />
        <h3 className="text-md font-semibold text-gray-900 mb-4">Neighbour Information</h3>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Number of Adults" required error={errors.num_adults?.message}>
            {(props) => (
              <input
                type="number"
                {...register('num_adults', {
                  required: 'Number of adults is required',
                  valueAsNumber: true,
                  min: { value: 1, message: 'Must be at least 1' },
                  max: { value: 7, message: 'Cannot exceed 7' },
                })}
                min={1}
                max={7}
                className="w-full rounded-md border border-gray-300 px-4 py-2 text-base focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                data-testid="neighbour-adults-input"
                {...props}
              />
            )}
          </FormField>

          <FormField label="Number of Children" required error={errors.num_children?.message}>
            {(props) => (
              <input
                type="number"
                {...register('num_children', {
                  required: 'Number of children is required',
                  valueAsNumber: true,
                  min: { value: 0, message: 'Cannot be negative' },
                  max: { value: 7, message: 'Cannot exceed 7' },
                })}
                min={0}
                max={7}
                className="w-full rounded-md border border-gray-300 px-4 py-2 text-base focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                data-testid="neighbour-children-input"
                {...props}
              />
            )}
          </FormField>
        </div>

        <Controller
          name="allergies"
          control={control}
          render={({ field }) => (
            <FormField label="Allergies / Dietary Restrictions" error={errors.allergies?.message}>
              {() => (
                <div data-testid="allergies-field">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {COMMON_ALLERGIES.map((allergy) => (
                      <button
                        key={allergy}
                        type="button"
                        onClick={() => {
                          const current = field.value || [];
                          if (current.includes(allergy)) {
                            field.onChange(current.filter((a: string) => a !== allergy));
                          } else {
                            field.onChange([...current, allergy]);
                          }
                        }}
                        className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                          (field.value || []).includes(allergy)
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
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const val = customAllergy.trim();
                          if (val && !(field.value || []).includes(val)) {
                            field.onChange([...(field.value || []), val]);
                          }
                          setCustomAllergy('');
                        }
                      }}
                      placeholder="Add custom allergy..."
                      className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-base focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const val = customAllergy.trim();
                        if (val && !(field.value || []).includes(val)) {
                          field.onChange([...(field.value || []), val]);
                        }
                        setCustomAllergy('');
                      }}
                      className="px-3 py-2 text-sm bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                    >
                      Add
                    </button>
                  </div>
                  {(field.value || []).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(field.value || []).map((a: string) => (
                        <span key={a} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-800">
                          {a}
                          <button
                            type="button"
                            onClick={() => field.onChange((field.value || []).filter((x: string) => x !== a))}
                            className="text-amber-600 hover:text-amber-900"
                          >
                            &times;
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </FormField>
          )}
        />

        <FormField label="Diaper Size" error={errors.diaper_size?.message}>
          {(props) => (
            <input
              {...register('diaper_size')}
              placeholder="e.g. Size 3, Newborn, Pull-ups"
              className="w-full rounded-md border border-gray-300 px-4 py-2 text-base focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              data-testid="neighbour-diaper-input"
              {...props}
            />
          )}
        </FormField>

        <FormField label="Catchment Area">
          {(props) => (
            <label className="flex items-center gap-2 cursor-pointer" {...props}>
              <input
                type="checkbox"
                {...register('catchment_area')}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                data-testid="neighbour-catchment-input"
              />
              <span className="text-sm text-gray-700">Neighbour lives in catchment area</span>
            </label>
          )}
        </FormField>

        <FormField label="Notes" error={errors.notes?.message}>
          {(props) => (
            <textarea
              {...register('notes')}
              rows={3}
              placeholder="Additional notes about this neighbour..."
              className="w-full rounded-md border border-gray-300 px-4 py-2 text-base focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              data-testid="neighbour-notes-input"
              {...props}
            />
          )}
        </FormField>

        <div className="flex gap-3 mt-6">
          <Button type="submit" loading={loading} data-testid="neighbour-submit-button">
            {isEdit ? 'Save Changes' : 'Register'}
          </Button>
          <Button variant="secondary" type="button" onClick={() => navigate(isEdit ? `/neighbours/${id}` : '/neighbours')} data-testid="neighbour-cancel-button">
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

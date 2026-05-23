import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { api } from '@/shared/api/client';
import { useFormApiError } from '@/shared/hooks/useFormApiError';
import { useNotification } from '@/shared/context/NotificationContext';
import { PageHeader } from '@/shared/components/PageHeader';
import { FormField } from '@/shared/components/FormField';
import { Button } from '@/shared/components/Button';
import { AlertBanner } from '@/shared/components/AlertBanner';
import type { Client } from '@/shared/api/types';

interface ClientFormData {
  name: string;
  card_id: string;
}

export function ClientFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { addToast } = useNotification();
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ClientFormData>();

  const handleApiError = useFormApiError<ClientFormData>(setError);

  useEffect(() => {
    if (isEdit) {
      api.get<Client>(`/api/clients/${id}/`).then((client) => {
        reset({ name: client.name, card_id: client.card_id });
      });
    }
  }, [id, isEdit, reset]);

  const onSubmit = async (data: ClientFormData) => {
    setLoading(true);
    setGeneralError(null);

    try {
      if (isEdit) {
        await api.put(`/api/clients/${id}/`, data);
        addToast('success', `Client "${data.name}" updated`);
        navigate(`/clients/${id}`);
      } else {
        await api.post('/api/clients/', data);
        addToast('success', `Client "${data.name}" registered`);
        navigate('/clients');
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
      <PageHeader title={isEdit ? 'Edit Client' : 'Register Client'} />

      {generalError && <AlertBanner type="error" message={generalError} onDismiss={() => setGeneralError(null)} />}

      <form onSubmit={handleSubmit(onSubmit)} data-testid="client-form">
        <FormField label="Name" required error={errors.name?.message}>
          {(props) => (
            <input
              {...register('name', { required: 'Client name is required', maxLength: { value: 200, message: 'Name must be under 200 characters' } })}
              className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              data-testid="client-name-input"
              {...props}
            />
          )}
        </FormField>

        <FormField label="Card ID" required error={errors.card_id?.message}>
          {(props) => (
            <input
              {...register('card_id', { required: 'Card ID is required', maxLength: { value: 100, message: 'Card ID must be under 100 characters' } })}
              className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              data-testid="client-card-input"
              {...props}
            />
          )}
        </FormField>

        <div className="flex gap-3 mt-6">
          <Button type="submit" loading={loading} data-testid="client-submit-button">
            {isEdit ? 'Save Changes' : 'Register'}
          </Button>
          <Button variant="secondary" type="button" onClick={() => navigate(isEdit ? `/clients/${id}` : '/clients')} data-testid="client-cancel-button">
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

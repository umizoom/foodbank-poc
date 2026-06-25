import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { api } from '@/shared/api/client';
import { useCategories } from '@/shared/hooks/useCategories';
import { useFormApiError } from '@/shared/hooks/useFormApiError';
import { useNotification } from '@/shared/context/NotificationContext';
import { PageHeader } from '@/shared/components/PageHeader';
import { FormField } from '@/shared/components/FormField';
import { Button } from '@/shared/components/Button';
import { AlertBanner } from '@/shared/components/AlertBanner';
import type { Item } from '@/shared/api/types';

interface ItemFormData {
  name: string;
  category: string;
  cost: string;
  stock_count: string;
  low_stock_threshold: string;
  limit_per_checkout: string;
}

export function InventoryFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { addToast } = useNotification();
  const { categories } = useCategories();
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ItemFormData>({
    defaultValues: { low_stock_threshold: '10', limit_per_checkout: '' },
  });

  const handleApiError = useFormApiError<ItemFormData>(setError);

  useEffect(() => {
    if (isEdit) {
      api.get<Item>(`/api/items/${id}/`).then((item) => {
        reset({
          name: item.name,
          category: String(item.category),
          cost: item.cost,
          stock_count: String(item.stock_count),
          low_stock_threshold: String(item.low_stock_threshold),
          limit_per_checkout: item.limit_per_checkout ? String(item.limit_per_checkout) : '',
        });
      });
    }
  }, [id, isEdit, reset]);

  const onSubmit = async (data: ItemFormData) => {
    setLoading(true);
    setGeneralError(null);

    const payload = {
      name: data.name,
      category: Number(data.category),
      cost: data.cost,
      stock_count: Number(data.stock_count),
      low_stock_threshold: Number(data.low_stock_threshold),
      limit_per_checkout: data.limit_per_checkout ? Number(data.limit_per_checkout) : null,
    };

    try {
      if (isEdit) {
        await api.put(`/api/items/${id}/`, payload);
        addToast('success', `"${data.name}" updated`);
      } else {
        await api.post('/api/items/', payload);
        addToast('success', `"${data.name}" created`);
      }
      navigate('/inventory');
    } catch (e) {
      const msg = handleApiError(e);
      if (msg) setGeneralError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg">
      <PageHeader title={isEdit ? 'Edit Item' : 'Add Item'} />

      {generalError && <AlertBanner type="error" message={generalError} onDismiss={() => setGeneralError(null)} />}

      <form onSubmit={handleSubmit(onSubmit)} data-testid="item-form">
        <FormField label="Name" required error={errors.name?.message}>
          {(props) => (
            <input
              {...register('name', { required: 'Item name is required', maxLength: { value: 200, message: 'Name must be under 200 characters' } })}
              className="w-full rounded-md border border-gray-300 px-4 py-2 text-base focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              data-testid="item-name-input"
              {...props}
            />
          )}
        </FormField>

        <FormField label="Category" required error={errors.category?.message}>
          {(props) => (
            <select
              {...register('category', { required: 'Category is required' })}
              className="w-full rounded-md border border-gray-300 px-4 py-2 text-base focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              data-testid="item-category-select"
              {...props}
            >
              <option value="">Select category</option>
              {categories.filter((cat) => cat.name !== 'Extras').map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          )}
        </FormField>

        <FormField label="Cost (CAD)" required error={errors.cost?.message}>
          {(props) => (
            <input
              {...register('cost', {
                required: 'Cost is required',
                pattern: { value: /^\d+(\.\d{1,2})?$/, message: 'Cost must be a positive number with up to 2 decimal places' },
                validate: (v) => parseFloat(v) > 0 || 'Cost must be greater than zero',
              })}
              type="text"
              inputMode="decimal"
              className="w-full rounded-md border border-gray-300 px-4 py-2 text-base focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              data-testid="item-cost-input"
              {...props}
            />
          )}
        </FormField>

        {!isEdit && (
          <FormField label="Initial Stock" required error={errors.stock_count?.message}>
            {(props) => (
              <input
                {...register('stock_count', {
                  required: 'Stock count is required',
                  min: { value: 0, message: 'Stock must be 0 or greater' },
                  validate: (v) => Number.isInteger(Number(v)) || 'Stock must be a whole number',
                })}
                type="number"
                min="0"
                className="w-full rounded-md border border-gray-300 px-4 py-2 text-base focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                data-testid="item-stock-input"
                {...props}
              />
            )}
          </FormField>
        )}

        <FormField label="Low Stock Threshold" required error={errors.low_stock_threshold?.message}>
          {(props) => (
            <input
              {...register('low_stock_threshold', {
                required: 'Threshold is required',
                min: { value: 0, message: 'Threshold must be 0 or greater' },
                validate: (v) => Number.isInteger(Number(v)) || 'Threshold must be a whole number',
              })}
              type="number"
              min="0"
              className="w-full rounded-md border border-gray-300 px-4 py-2 text-base focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              data-testid="item-threshold-input"
              {...props}
            />
          )}
        </FormField>

        <FormField label="Limit Per Checkout" error={errors.limit_per_checkout?.message}>
          {(props) => (
            <input
              {...register('limit_per_checkout', {
                validate: (v) => {
                  if (!v) return true;
                  const n = Number(v);
                  if (!Number.isInteger(n) || n < 1) return 'Limit must be a whole number of at least 1';
                  return true;
                },
              })}
              type="number"
              min="1"
              placeholder="No limit"
              className="w-full rounded-md border border-gray-300 px-4 py-2 text-base focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              data-testid="item-limit-input"
              {...props}
            />
          )}
        </FormField>

        <div className="flex gap-3 mt-6">
          <Button type="submit" loading={loading} data-testid="item-submit-button">
            {isEdit ? 'Save Changes' : 'Create Item'}
          </Button>
          <Button variant="secondary" type="button" onClick={() => navigate('/inventory')} data-testid="item-cancel-button">
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

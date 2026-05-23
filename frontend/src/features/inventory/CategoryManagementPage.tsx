import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useCategories } from '@/shared/hooks/useCategories';
import { api } from '@/shared/api/client';
import { PageHeader } from '@/shared/components/PageHeader';
import { Button } from '@/shared/components/Button';
import { ConfirmModal } from '@/shared/components/ConfirmModal';
import { AlertBanner } from '@/shared/components/AlertBanner';
import { useNotification } from '@/shared/context/NotificationContext';
import type { Category } from '@/shared/api/types';

interface CategoryFormData {
  name: string;
}

export function CategoryManagementPage() {
  const { categories, loading, refetch } = useCategories();
  const { addToast } = useNotification();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CategoryFormData>();

  const onAdd = async (data: CategoryFormData) => {
    try {
      await api.post('/api/categories/', data);
      addToast('success', `Category "${data.name}" created`);
      reset();
      refetch();
    } catch {
      setError('Failed to create category');
    }
  };

  const onSaveEdit = async (id: number) => {
    try {
      await api.put(`/api/categories/${id}/`, { name: editName });
      addToast('success', 'Category renamed');
      setEditingId(null);
      refetch();
    } catch {
      setError('Failed to rename category');
    }
  };

  const onDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/api/categories/${deleteTarget.id}/`);
      addToast('success', `Category "${deleteTarget.name}" deleted`);
      refetch();
    } catch {
      setError('Cannot delete category with assigned items');
    } finally {
      setDeleteLoading(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div>
      <PageHeader title="Categories" />

      {error && <AlertBanner type="error" message={error} onDismiss={() => setError(null)} />}

      <form onSubmit={handleSubmit(onAdd)} className="flex gap-3 mb-6" data-testid="add-category-form">
        <input
          {...register('name', { required: 'Category name is required' })}
          placeholder="New category name"
          className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          data-testid="category-name-input"
        />
        <Button type="submit" data-testid="add-category-button">Add</Button>
        {errors.name && <p className="text-red-600 text-sm self-center">{errors.name.message}</p>}
      </form>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-500">Loading...</td></tr>
            ) : categories.length === 0 ? (
              <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-500">No categories yet.</td></tr>
            ) : (
              categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm">
                    {editingId === cat.id ? (
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="rounded-md border border-gray-300 px-2 py-1 text-sm"
                        data-testid={`edit-category-input-${cat.id}`}
                      />
                    ) : (
                      <span className="font-medium text-gray-900">{cat.name}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{cat.item_count ?? 0}</td>
                  <td className="px-6 py-4 text-sm">
                    {editingId === cat.id ? (
                      <div className="flex gap-2">
                        <button onClick={() => onSaveEdit(cat.id)} className="text-green-600 hover:underline">Save</button>
                        <button onClick={() => setEditingId(null)} className="text-gray-600 hover:underline">Cancel</button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setEditingId(cat.id); setEditName(cat.name); }}
                          className="text-blue-600 hover:underline"
                          data-testid={`rename-category-${cat.id}`}
                        >
                          Rename
                        </button>
                        <button
                          onClick={() => setDeleteTarget(cat)}
                          disabled={(cat.item_count ?? 0) > 0}
                          className={`${(cat.item_count ?? 0) > 0 ? 'text-gray-300 cursor-not-allowed' : 'text-red-600 hover:underline'}`}
                          data-testid={`delete-category-${cat.id}`}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Category"
        message={`Delete category "${deleteTarget?.name}"?`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleteLoading}
        onConfirm={onDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

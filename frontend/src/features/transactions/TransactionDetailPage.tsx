import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '@/shared/api/client';
import { PageHeader } from '@/shared/components/PageHeader';
import { CurrencyDisplay } from '@/shared/components/CurrencyDisplay';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import type { Transaction } from '@/shared/api/types';

export function TransactionDetailPage() {
  const { id } = useParams();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<Transaction>(`/api/transactions/${id}/`)
      .then(setTransaction)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading || !transaction) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={`Transaction #${transaction.id}`} />

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <dl className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <dt className="text-sm text-gray-500">Client</dt>
            <dd className="text-base font-medium text-gray-900">{transaction.client_name}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Date</dt>
            <dd className="text-base text-gray-900">
              {new Date(transaction.created_at).toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Processed By</dt>
            <dd className="text-base text-gray-900">{transaction.admin_username}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Total</dt>
            <dd className="text-base font-bold text-gray-900">
              <CurrencyDisplay amount={transaction.total_amount} />
            </dd>
          </div>
        </dl>
      </div>

      <h2 className="text-lg font-semibold text-gray-900 mb-3">Items</h2>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200" data-testid="transaction-items-table">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Cost</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Line Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {transaction.items.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.item_name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{item.quantity}</td>
                <td className="px-6 py-4 text-sm"><CurrencyDisplay amount={item.unit_cost} /></td>
                <td className="px-6 py-4 text-sm font-medium"><CurrencyDisplay amount={item.line_total} /></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50">
              <td colSpan={3} className="px-6 py-3 text-sm font-semibold text-gray-900 text-right">Total:</td>
              <td className="px-6 py-3 text-sm font-bold text-gray-900">
                <CurrencyDisplay amount={transaction.total_amount} />
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '@/shared/api/client';
import { PageHeader } from '@/shared/components/PageHeader';
import { Button } from '@/shared/components/Button';
import { CurrencyDisplay } from '@/shared/components/CurrencyDisplay';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { AddBalanceModal } from './AddBalanceModal';
import type { Client, TransactionListItem } from '@/shared/api/types';

export function ClientDetailPage() {
  const { id } = useParams();
  const [client, setClient] = useState<Client | null>(null);
  const [transactions, setTransactions] = useState<TransactionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(false);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      api.get<Client>(`/api/clients/${id}/`),
      api.get<TransactionListItem[]>(`/api/transactions/?client=${id}`),
    ])
      .then(([c, txs]) => {
        setClient(c);
        setTransactions(txs);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  if (loading || !client) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={`Client: ${client.name}`}
        actions={
          <>
            <Button variant="secondary" onClick={() => setShowBalance(true)} data-testid="add-balance-button">
              Add Balance
            </Button>
            <Link to={`/clients/${id}/edit`}>
              <Button variant="secondary" data-testid="edit-client-button">Edit</Button>
            </Link>
          </>
        }
      />

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <dt className="text-sm text-gray-500">Name</dt>
            <dd className="text-lg font-medium text-gray-900">{client.name}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Card ID</dt>
            <dd className="text-lg font-mono text-gray-900">{client.card_id}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Balance</dt>
            <dd className="text-lg font-bold text-green-700">
              <CurrencyDisplay amount={client.balance} />
            </dd>
          </div>
        </dl>
      </div>

      <h2 className="text-lg font-semibold text-gray-900 mb-3">Recent Transactions</h2>
      {transactions.length === 0 ? (
        <p className="text-gray-500 text-sm">No transactions for this client.</p>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(tx.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <CurrencyDisplay amount={tx.total_amount} />
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <Link to={`/transactions/${tx.id}`} className="text-blue-600 hover:underline">
                      {tx.item_count} items
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showBalance && (
        <AddBalanceModal
          clientId={client.id}
          clientName={client.name}
          onClose={() => setShowBalance(false)}
          onSuccess={() => {
            setShowBalance(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
}

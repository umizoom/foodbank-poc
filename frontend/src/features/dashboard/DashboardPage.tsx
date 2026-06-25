import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '@/shared/api/client';
import { PageHeader } from '@/shared/components/PageHeader';
import { CurrencyDisplay } from '@/shared/components/CurrencyDisplay';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import type { Item, Neighbour, TransactionListItem } from '@/shared/api/types';

interface DashboardStats {
  totalItems: number;
  lowStockItems: number;
  totalNeighbours: number;
  todayTransactions: number;
}

export function DashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<TransactionListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<Item[]>('/api/items/'),
      api.get<Item[]>('/api/items/?low_stock=true'),
      api.get<Neighbour[]>('/api/neighbours/'),
      api.get<TransactionListItem[]>('/api/transactions/?today=true'),
    ])
      .then(([items, lowStock, neighbours, transactions]) => {
        setStats({
          totalItems: items.length,
          lowStockItems: lowStock.length,
          totalNeighbours: neighbours.length,
          todayTransactions: transactions.length,
        });
        setRecentTransactions(transactions.slice(0, 5));
      })
      .catch(() => {
        setStats({ totalItems: 0, lowStockItems: 0, totalNeighbours: 0, todayTransactions: 0 });
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Dashboard" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Items" value={stats?.totalItems ?? 0} to="/inventory" />
        <StatCard label="Low Stock Items" value={stats?.lowStockItems ?? 0} variant="warning" to="/inventory?lowStock=true" />
        <StatCard label="Total Neighbours" value={stats?.totalNeighbours ?? 0} to="/neighbours" />
        <StatCard label="Today's Transactions" value={stats?.todayTransactions ?? 0} to="/transactions?today=true" />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Recent Transactions</h2>
        {recentTransactions.length === 0 ? (
          <p className="text-gray-500 text-sm">No transactions today.</p>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Neighbour</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/transactions/${tx.id}`)}>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(tx.created_at).toLocaleTimeString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {tx.neighbour_name}
                      {tx.is_onetime && (
                        <span className="ml-2 bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full text-xs font-medium">
                          Courtesy
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <CurrencyDisplay amount={tx.total_amount} />
                    </td>
                    <td className="px-6 py-4 text-sm text-blue-600">
                      {tx.item_count} items
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  variant,
  to,
}: {
  label: string;
  value: number;
  variant?: 'warning';
  to: string;
}) {
  return (
    <Link
      to={to}
      className="block bg-white rounded-lg shadow-sm p-6 hover:shadow-md hover:ring-2 hover:ring-blue-200 transition-shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
      data-testid={`stat-${label.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className={`text-3xl font-bold ${variant === 'warning' && value > 0 ? 'text-yellow-600' : 'text-gray-900'}`}>
        {value}
      </p>
    </Link>
  );
}

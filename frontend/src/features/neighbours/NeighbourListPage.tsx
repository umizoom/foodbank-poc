import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNeighbours } from '@/shared/hooks/useNeighbours';
import { useNotification } from '@/shared/context/NotificationContext';
import { PageHeader } from '@/shared/components/PageHeader';
import { DataTable, type Column } from '@/shared/components/DataTable';
import { SearchInput } from '@/shared/components/SearchInput';
import { Button } from '@/shared/components/Button';
import { ConfirmModal } from '@/shared/components/ConfirmModal';
import { CurrencyDisplay } from '@/shared/components/CurrencyDisplay';
import { api } from '@/shared/api/client';
import type { Neighbour } from '@/shared/api/types';

export function NeighbourListPage() {
  const navigate = useNavigate();
  const { addToast } = useNotification();
  const [search, setSearch] = useState('');
  const { neighbours, loading, refetch } = useNeighbours({ search });
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleResetBalances = async () => {
    setResetting(true);
    try {
      const result = await api.post<{ reset_count: number }>('/api/neighbours/reset-balances/');
      addToast('success', `Successfully reset balances for ${result.reset_count} neighbours.`);
      refetch();
    } catch {
      addToast('error', 'Failed to reset balances. Please try again.');
    } finally {
      setResetting(false);
      setShowResetModal(false);
    }
  };

  const columns: Column<Neighbour>[] = [
    { key: 'name', header: 'Name', render: (c) => <span className="font-medium text-gray-900">{c.name}</span> },
    { key: 'card_id', header: 'Card ID', render: (c) => <span className="font-mono text-gray-600">{c.card_id}</span> },
    { key: 'balance', header: 'Balance', render: (c) => <CurrencyDisplay amount={c.balance} /> },
    {
      key: 'actions',
      header: '',
      render: (c) => (
        <button
          onClick={(e) => { e.stopPropagation(); navigate(`/neighbours/${c.id}/edit`); }}
          className="text-blue-600 hover:underline text-sm"
          data-testid={`edit-neighbour-${c.id}`}
        >
          Edit
        </button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Neighbours"
        actions={
          <>
            <Button
              variant="danger"
              onClick={() => setShowResetModal(true)}
              data-testid="reset-balances-button"
            >
              Reset All Balances
            </Button>
            <Link to="/neighbours/new">
              <Button data-testid="register-neighbour-button">Register Neighbour</Button>
            </Link>
          </>
        }
      />

      <ConfirmModal
        open={showResetModal}
        title="Reset All Balances"
        message="This will recalculate all neighbour balances based on their current household size and catchment area. Any existing balances will be overwritten. This action cannot be undone."
        confirmLabel="Reset All"
        variant="danger"
        loading={resetting}
        onConfirm={handleResetBalances}
        onCancel={() => setShowResetModal(false)}
      />

      <div className="mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by name or card ID..." />
      </div>

      <DataTable
        columns={columns}
        data={neighbours}
        loading={loading}
        emptyMessage="No neighbours registered. Register a new neighbour."
        keyExtractor={(c) => c.id}
        onRowClick={(c) => navigate(`/neighbours/${c.id}`)}
      />
    </div>
  );
}

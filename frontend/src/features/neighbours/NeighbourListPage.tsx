import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNeighbours } from '@/shared/hooks/useNeighbours';
import { PageHeader } from '@/shared/components/PageHeader';
import { DataTable, type Column } from '@/shared/components/DataTable';
import { SearchInput } from '@/shared/components/SearchInput';
import { Button } from '@/shared/components/Button';
import { CurrencyDisplay } from '@/shared/components/CurrencyDisplay';
import type { Neighbour } from '@/shared/api/types';

export function NeighbourListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const { neighbours, loading } = useNeighbours({ search });

  const columns: Column<Neighbour>[] = [
    { key: 'name', header: 'Name', render: (c) => <span className="font-medium text-gray-900">{c.name}</span> },
    { key: 'card_id', header: 'Card ID', render: (c) => <span className="font-mono text-gray-600">{c.card_id}</span> },
    { key: 'balance', header: 'Balance', render: (c) => <CurrencyDisplay amount={c.balance} /> },
    {
      key: 'actions',
      header: 'Actions',
      render: (c) => (
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/neighbours/${c.id}`)}
            className="text-blue-600 hover:underline text-sm"
            data-testid={`view-neighbour-${c.id}`}
          >
            View
          </button>
          <button
            onClick={() => navigate(`/neighbours/${c.id}/edit`)}
            className="text-blue-600 hover:underline text-sm"
            data-testid={`edit-neighbour-${c.id}`}
          >
            Edit
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Neighbours"
        actions={
          <Link to="/neighbours/new">
            <Button data-testid="register-neighbour-button">Register Neighbour</Button>
          </Link>
        }
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
      />
    </div>
  );
}

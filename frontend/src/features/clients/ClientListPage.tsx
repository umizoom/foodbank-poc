import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useClients } from '@/shared/hooks/useClients';
import { PageHeader } from '@/shared/components/PageHeader';
import { DataTable, type Column } from '@/shared/components/DataTable';
import { SearchInput } from '@/shared/components/SearchInput';
import { Button } from '@/shared/components/Button';
import { CurrencyDisplay } from '@/shared/components/CurrencyDisplay';
import type { Client } from '@/shared/api/types';

export function ClientListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const { clients, loading } = useClients({ search });

  const columns: Column<Client>[] = [
    { key: 'name', header: 'Name', render: (c) => <span className="font-medium text-gray-900">{c.name}</span> },
    { key: 'card_id', header: 'Card ID', render: (c) => <span className="font-mono text-gray-600">{c.card_id}</span> },
    { key: 'balance', header: 'Balance', render: (c) => <CurrencyDisplay amount={c.balance} /> },
    {
      key: 'actions',
      header: 'Actions',
      render: (c) => (
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/clients/${c.id}`)}
            className="text-blue-600 hover:underline text-sm"
            data-testid={`view-client-${c.id}`}
          >
            View
          </button>
          <button
            onClick={() => navigate(`/clients/${c.id}/edit`)}
            className="text-blue-600 hover:underline text-sm"
            data-testid={`edit-client-${c.id}`}
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
        title="Clients"
        actions={
          <Link to="/clients/new">
            <Button data-testid="register-client-button">Register Client</Button>
          </Link>
        }
      />

      <div className="mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by name or card ID..." />
      </div>

      <DataTable
        columns={columns}
        data={clients}
        loading={loading}
        emptyMessage="No clients registered. Register a new client."
        keyExtractor={(c) => c.id}
      />
    </div>
  );
}

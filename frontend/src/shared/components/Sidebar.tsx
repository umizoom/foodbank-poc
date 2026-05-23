import { NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { api } from '@/shared/api/client';
import { Badge } from './Badge';
import type { Item } from '@/shared/api/types';

const navItems = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/inventory', label: 'Inventory', showBadge: true },
  { to: '/clients', label: 'Clients' },
  { to: '/checkout', label: 'Checkout' },
  { to: '/transactions', label: 'Transactions' },
];

export function Sidebar() {
  const [lowStockCount, setLowStockCount] = useState(0);

  useEffect(() => {
    api
      .get<Item[]>('/api/items/?low_stock=true')
      .then((items) => setLowStockCount(items.length))
      .catch(() => setLowStockCount(0));
  }, []);

  return (
    <aside className="w-64 bg-white shadow-sm border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900">Food Bank</h2>
        <p className="text-xs text-gray-500">Inventory System</p>
      </div>
      <nav className="flex-1 p-4 space-y-1" data-testid="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
            data-testid={`nav-${item.label.toLowerCase()}`}
          >
            <span>{item.label}</span>
            {item.showBadge && lowStockCount > 0 && (
              <Badge count={lowStockCount} variant="warning" />
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

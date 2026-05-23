import type { Category, Item, Client, Cart, TransactionListItem, Transaction } from '@/shared/api/types';

export const mockCategories: Category[] = [
  { id: 1, name: 'Dairy', item_count: 3 },
  { id: 2, name: 'Bakery', item_count: 2 },
  { id: 3, name: 'Produce', item_count: 1 },
];

export const mockItems: Item[] = [
  { id: 1, name: 'Milk', category: 1, category_name: 'Dairy', cost: '4.50', stock_count: 20, low_stock_threshold: 10, is_low_stock: false, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 2, name: 'Bread', category: 2, category_name: 'Bakery', cost: '3.25', stock_count: 5, low_stock_threshold: 10, is_low_stock: true, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 3, name: 'Eggs', category: 1, category_name: 'Dairy', cost: '5.99', stock_count: 0, low_stock_threshold: 10, is_low_stock: true, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
];

export const mockClients: Client[] = [
  { id: 1, name: 'Maria Garcia', card_id: 'CARD-001', balance: '50.00', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 2, name: 'John Smith', card_id: 'CARD-002', balance: '25.75', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
];

export const mockCart: Cart = {
  id: 1,
  client: 1,
  client_name: 'Maria Garcia',
  client_balance: '50.00',
  status: 'open',
  items: [
    { id: 1, item: 1, item_name: 'Milk', item_cost: '4.50', quantity: 2, line_total: '9.00' },
    { id: 2, item: 2, item_name: 'Bread', item_cost: '3.25', quantity: 1, line_total: '3.25' },
  ],
  total: '12.25',
  created_at: '2026-01-15T10:00:00Z',
};

export const mockTransactionList: TransactionListItem[] = [
  { id: 1, client_name: 'Maria Garcia', admin_username: 'admin', total_amount: '12.25', item_count: 3, created_at: '2026-01-15T10:30:00Z' },
  { id: 2, client_name: 'John Smith', admin_username: 'admin', total_amount: '8.50', item_count: 2, created_at: '2026-01-15T09:00:00Z' },
];

export const mockTransaction: Transaction = {
  id: 1,
  client: 1,
  client_name: 'Maria Garcia',
  admin_username: 'admin',
  total_amount: '12.25',
  items: [
    { id: 1, item_name: 'Milk', unit_cost: '4.50', quantity: 2, line_total: '9.00' },
    { id: 2, item_name: 'Bread', unit_cost: '3.25', quantity: 1, line_total: '3.25' },
  ],
  created_at: '2026-01-15T10:30:00Z',
};

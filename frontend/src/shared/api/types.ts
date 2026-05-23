export interface Category {
  id: number;
  name: string;
  item_count?: number;
}

export interface Item {
  id: number;
  name: string;
  category: number;
  category_name: string;
  cost: string;
  stock_count: number;
  low_stock_threshold: number;
  is_low_stock: boolean;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: number;
  name: string;
  card_id: string;
  balance: string;
  created_at: string;
  updated_at: string;
}

export interface BalanceLog {
  id: number;
  client: number;
  amount: string;
  admin_username: string;
  created_at: string;
}

export interface CartItem {
  id: number;
  item: number;
  item_name: string;
  item_cost: string;
  quantity: number;
  line_total: string;
}

export interface Cart {
  id: number;
  client: number;
  client_name: string;
  client_balance: string;
  status: 'open' | 'checked_out' | 'cancelled';
  items: CartItem[];
  total: string;
  created_at: string;
}

export interface TransactionItem {
  id: number;
  item_name: string;
  unit_cost: string;
  quantity: number;
  line_total: string;
}

export interface Transaction {
  id: number;
  client: number;
  client_name: string;
  admin_username: string;
  total_amount: string;
  items: TransactionItem[];
  created_at: string;
}

export interface TransactionListItem {
  id: number;
  client_name: string;
  admin_username: string;
  total_amount: string;
  item_count: number;
  created_at: string;
}

export interface SessionInfo {
  username: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface StockUpdatePayload {
  operation: 'set' | 'add' | 'subtract';
  quantity: number;
}

export interface BalanceAddPayload {
  amount: string;
}

export interface CartCreatePayload {
  client: number;
}

export interface CartItemAddPayload {
  item: number;
  quantity: number;
}

export interface CartItemUpdatePayload {
  quantity: number;
}

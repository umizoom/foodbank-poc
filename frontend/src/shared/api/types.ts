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

export interface Neighbour {
  id: number;
  name: string;
  card_id: string;
  balance: string;
  allergies: string[];
  diaper_size: string;
  catchment_area: boolean;
  notes: string;
  created_at: string;
  updated_at: string;
}

export const COMMON_ALLERGIES = ["Lactose free", "Gluten free"];

export interface BalanceLog {
  id: number;
  neighbour: number;
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
  neighbour: number;
  neighbour_name: string;
  neighbour_balance: string;
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
  neighbour: number;
  neighbour_name: string;
  admin_username: string;
  total_amount: string;
  items: TransactionItem[];
  created_at: string;
}

export interface TransactionListItem {
  id: number;
  neighbour_name: string;
  admin_username: string;
  total_amount: string;
  item_count: number;
  created_at: string;
}

export interface SessionInfo {
  user: {
    id: number;
    username: string;
  };
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
  neighbour_id: number;
}

export interface CartItemAddPayload {
  item_id: number;
  quantity: number;
}

export interface CartItemUpdatePayload {
  quantity: number;
}

export interface ReportItem {
  item_id: number | null;
  item_name: string;
  category_name: string;
  total_quantity_sold: number;
  total_amount: string;
  current_stock: number | null;
}

export interface ReportTotals {
  total_items_sold: number;
  total_revenue: string;
}

export interface ItemsSoldReport {
  period: { start_date: string; end_date: string };
  items: ReportItem[];
  totals: ReportTotals;
}

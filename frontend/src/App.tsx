import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/features/auth/AuthContext';
import { NotificationProvider } from '@/shared/context/NotificationContext';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { AppLayout } from '@/shared/components/AppLayout';
import { LoginPage } from '@/features/auth/LoginPage';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { InventoryListPage } from '@/features/inventory/InventoryListPage';
import { InventoryFormPage } from '@/features/inventory/InventoryFormPage';
import { CategoryManagementPage } from '@/features/inventory/CategoryManagementPage';
import { ClientListPage } from '@/features/clients/ClientListPage';
import { ClientFormPage } from '@/features/clients/ClientFormPage';
import { ClientDetailPage } from '@/features/clients/ClientDetailPage';
import { CheckoutPage } from '@/features/checkout/CheckoutPage';
import { TransactionListPage } from '@/features/transactions/TransactionListPage';
import { TransactionDetailPage } from '@/features/transactions/TransactionDetailPage';

export function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/inventory" element={<InventoryListPage />} />
                <Route path="/inventory/new" element={<InventoryFormPage />} />
                <Route path="/inventory/:id/edit" element={<InventoryFormPage />} />
                <Route path="/inventory/categories" element={<CategoryManagementPage />} />
                <Route path="/clients" element={<ClientListPage />} />
                <Route path="/clients/new" element={<ClientFormPage />} />
                <Route path="/clients/:id" element={<ClientDetailPage />} />
                <Route path="/clients/:id/edit" element={<ClientFormPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/transactions" element={<TransactionListPage />} />
                <Route path="/transactions/:id" element={<TransactionDetailPage />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
}

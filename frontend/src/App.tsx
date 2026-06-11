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
import { CategoryItemsPage } from '@/features/inventory/CategoryItemsPage';
import { NeighbourListPage } from '@/features/neighbours/NeighbourListPage';
import { NeighbourFormPage } from '@/features/neighbours/NeighbourFormPage';
import { NeighbourDetailPage } from '@/features/neighbours/NeighbourDetailPage';
import { CheckoutPage } from '@/features/checkout/CheckoutPage';
import { TransactionListPage } from '@/features/transactions/TransactionListPage';
import { TransactionDetailPage } from '@/features/transactions/TransactionDetailPage';
import { ReportsPage } from '@/features/reports/ReportsPage';

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
                <Route path="/inventory/categories/:categoryId" element={<CategoryItemsPage />} />
                <Route path="/neighbours" element={<NeighbourListPage />} />
                <Route path="/neighbours/new" element={<NeighbourFormPage />} />
                <Route path="/neighbours/:id" element={<NeighbourDetailPage />} />
                <Route path="/neighbours/:id/edit" element={<NeighbourFormPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/transactions" element={<TransactionListPage />} />
                <Route path="/transactions/:id" element={<TransactionDetailPage />} />
                <Route path="/reports" element={<ReportsPage />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
}

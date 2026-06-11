import { screen, waitFor } from '@testing-library/react';
import { Routes, Route } from 'react-router-dom';
import { renderWithProviders } from '@/test/utils/render';
import { CategoryItemsPage } from '../CategoryItemsPage';

function renderPage(categoryId: number) {
  return renderWithProviders(
    <Routes>
      <Route path="/inventory/categories/:categoryId" element={<CategoryItemsPage />} />
    </Routes>,
    { route: `/inventory/categories/${categoryId}` }
  );
}

describe('CategoryItemsPage', () => {
  it('renders the category name as page heading', async () => {
    renderPage(1);

    await waitFor(() => {
      expect(screen.getByText('Dairy')).toBeInTheDocument();
    });
  });

  it('displays only items belonging to the category', async () => {
    renderPage(1);

    await waitFor(() => {
      expect(screen.getByText('Milk')).toBeInTheDocument();
      expect(screen.getByText('Eggs')).toBeInTheDocument();
    });
    expect(screen.queryByText('Bread')).not.toBeInTheDocument();
  });

  it('shows low stock indicators for items below threshold', async () => {
    renderPage(1);

    await waitFor(() => {
      expect(screen.getByTestId('stock-critical')).toBeInTheDocument();
    });
  });

  it('has a back to categories link', async () => {
    renderPage(1);

    await waitFor(() => {
      expect(screen.getByTestId('back-to-categories')).toBeInTheDocument();
    });
  });

  it('renders edit, stock, and delete action buttons', async () => {
    renderPage(1);

    await waitFor(() => {
      expect(screen.getByTestId('edit-item-1')).toBeInTheDocument();
      expect(screen.getByTestId('stock-item-1')).toBeInTheDocument();
      expect(screen.getByTestId('delete-item-1')).toBeInTheDocument();
    });
  });

  it('shows not found message for invalid category', async () => {
    renderPage(999);

    await waitFor(() => {
      expect(screen.getByText('Category Not Found')).toBeInTheDocument();
    });
  });
});

import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/test/utils/render';
import { InventoryListPage } from '../InventoryListPage';

describe('InventoryListPage', () => {
  it('renders page title and action buttons', async () => {
    renderWithProviders(<InventoryListPage />);

    await waitFor(() => {
      expect(screen.getByText('Inventory')).toBeInTheDocument();
    });
    expect(screen.getByTestId('add-item-button')).toBeInTheDocument();
    expect(screen.getByTestId('manage-categories-button')).toBeInTheDocument();
  });

  it('displays items in the table', async () => {
    renderWithProviders(<InventoryListPage />);

    await waitFor(() => {
      expect(screen.getByText('Milk')).toBeInTheDocument();
      expect(screen.getByText('Bread')).toBeInTheDocument();
      expect(screen.getByText('Eggs')).toBeInTheDocument();
    });
  });

  it('shows low stock indicators for items below threshold', async () => {
    renderWithProviders(<InventoryListPage />);

    await waitFor(() => {
      expect(screen.getByTestId('stock-warning')).toBeInTheDocument();
      expect(screen.getByTestId('stock-critical')).toBeInTheDocument();
    });
  });

  it('renders search input', () => {
    renderWithProviders(<InventoryListPage />);
    expect(screen.getByTestId('search-input')).toBeInTheDocument();
  });

  it('renders category filter', () => {
    renderWithProviders(<InventoryListPage />);
    expect(screen.getByTestId('category-filter')).toBeInTheDocument();
  });
});

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils/render';
import { InventoryFormPage } from '../InventoryFormPage';

describe('InventoryFormPage', () => {
  it('renders form fields for creating an item', async () => {
    renderWithProviders(<InventoryFormPage />, { route: '/inventory/new' });

    await waitFor(() => {
      expect(screen.getByText('Add Item')).toBeInTheDocument();
    });
    expect(screen.getByTestId('item-name-input')).toBeInTheDocument();
    expect(screen.getByTestId('item-category-select')).toBeInTheDocument();
    expect(screen.getByTestId('item-cost-input')).toBeInTheDocument();
    expect(screen.getByTestId('item-stock-input')).toBeInTheDocument();
    expect(screen.getByTestId('item-threshold-input')).toBeInTheDocument();
  });

  it('shows validation errors on empty submit', async () => {
    const user = userEvent.setup();
    renderWithProviders(<InventoryFormPage />, { route: '/inventory/new' });

    await user.click(screen.getByTestId('item-submit-button'));

    await waitFor(() => {
      expect(screen.getByText('Item name is required')).toBeInTheDocument();
      expect(screen.getByText('Category is required')).toBeInTheDocument();
      expect(screen.getByText('Cost is required')).toBeInTheDocument();
    });
  });
});

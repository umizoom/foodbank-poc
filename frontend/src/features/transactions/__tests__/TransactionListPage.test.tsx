import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/test/utils/render';
import { TransactionListPage } from '../TransactionListPage';

describe('TransactionListPage', () => {
  it('renders page title', async () => {
    renderWithProviders(<TransactionListPage />);

    await waitFor(() => {
      expect(screen.getByText('Transactions')).toBeInTheDocument();
    });
  });

  it('displays transactions', async () => {
    renderWithProviders(<TransactionListPage />);

    await waitFor(() => {
      expect(screen.getByText('Maria Garcia')).toBeInTheDocument();
      expect(screen.getByText('John Smith')).toBeInTheDocument();
    });
  });

  it('renders filter controls', async () => {
    renderWithProviders(<TransactionListPage />);

    await waitFor(() => {
      expect(screen.getByTestId('filter-date-from')).toBeInTheDocument();
      expect(screen.getByTestId('filter-date-to')).toBeInTheDocument();
      expect(screen.getByTestId('filter-client')).toBeInTheDocument();
    });
  });
});

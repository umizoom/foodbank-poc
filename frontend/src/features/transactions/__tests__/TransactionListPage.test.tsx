import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
      expect(screen.getAllByText('Maria Garcia').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('John Smith').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('renders filter controls', async () => {
    renderWithProviders(<TransactionListPage />);

    await waitFor(() => {
      expect(screen.getByTestId('filter-date-from')).toBeInTheDocument();
      expect(screen.getByTestId('filter-date-to')).toBeInTheDocument();
      expect(screen.getByTestId('filter-neighbour')).toBeInTheDocument();
    });
  });

  it('shows today filter chip and populates dates when today param is in URL', async () => {
    renderWithProviders(<TransactionListPage />, { route: '/transactions?today=true' });

    await waitFor(() => {
      expect(screen.getByTestId('clear-today-filter')).toBeInTheDocument();
      expect(screen.getByText('Today Only')).toBeInTheDocument();
    });

    const dateFrom = screen.getByTestId('filter-date-from') as HTMLInputElement;
    const dateTo = screen.getByTestId('filter-date-to') as HTMLInputElement;
    expect(dateFrom.value).toBeTruthy();
    expect(dateTo.value).toBeTruthy();
    expect(dateFrom.value).toBe(dateTo.value);
  });

  it('clears today filter when clear button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TransactionListPage />, { route: '/transactions?today=true' });

    await waitFor(() => {
      expect(screen.getByTestId('clear-today-filter')).toBeInTheDocument();
    });

    await user.click(screen.getByTestId('clear-today-filter'));

    await waitFor(() => {
      expect(screen.queryByTestId('clear-today-filter')).not.toBeInTheDocument();
    });

    const dateFrom = screen.getByTestId('filter-date-from') as HTMLInputElement;
    const dateTo = screen.getByTestId('filter-date-to') as HTMLInputElement;
    expect(dateFrom.value).toBe('');
    expect(dateTo.value).toBe('');
  });
});

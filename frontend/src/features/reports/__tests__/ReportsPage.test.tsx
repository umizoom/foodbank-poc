import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils/render';
import { ReportsPage } from '../ReportsPage';

describe('ReportsPage', () => {
  it('renders page title', () => {
    renderWithProviders(<ReportsPage />);
    expect(screen.getByText('Reports')).toBeInTheDocument();
  });

  it('renders preset period buttons', () => {
    renderWithProviders(<ReportsPage />);

    expect(screen.getByTestId('period-daily')).toBeInTheDocument();
    expect(screen.getByTestId('period-weekly')).toBeInTheDocument();
    expect(screen.getByTestId('period-monthly')).toBeInTheDocument();
  });

  it('renders date inputs and Run Report button', () => {
    renderWithProviders(<ReportsPage />);

    expect(screen.getByTestId('filter-date-from')).toBeInTheDocument();
    expect(screen.getByTestId('filter-date-to')).toBeInTheDocument();
    expect(screen.getByTestId('run-report-btn')).toBeInTheDocument();
  });

  it('does not fetch report on page load', () => {
    renderWithProviders(<ReportsPage />);

    expect(screen.getByText('Select a period and click "Run Report" to generate.')).toBeInTheDocument();
  });

  it('pre-fills dates when preset button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ReportsPage />);

    await user.click(screen.getByTestId('period-daily'));

    const fromInput = screen.getByTestId('filter-date-from') as HTMLInputElement;
    const toInput = screen.getByTestId('filter-date-to') as HTMLInputElement;
    expect(fromInput.value).not.toBe('');
    expect(toInput.value).not.toBe('');
  });

  it('fetches report on Run Report click', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ReportsPage />);

    await user.click(screen.getByTestId('period-daily'));
    await user.click(screen.getByTestId('run-report-btn'));

    await waitFor(() => {
      expect(screen.getByText('Milk')).toBeInTheDocument();
      expect(screen.getByText('Bread')).toBeInTheDocument();
    });
  });

  it('shows summary cards after report runs', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ReportsPage />);

    await user.click(screen.getByTestId('period-daily'));
    await user.click(screen.getByTestId('run-report-btn'));

    await waitFor(() => {
      expect(screen.getByText('Total Items Sold')).toBeInTheDocument();
      expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    });
  });

  it('shows category breakdown after report runs', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ReportsPage />);

    await user.click(screen.getByTestId('period-daily'));
    await user.click(screen.getByTestId('run-report-btn'));

    await waitFor(() => {
      expect(screen.getByText('By Category')).toBeInTheDocument();
      expect(screen.getByTestId('category-Dairy')).toBeInTheDocument();
      expect(screen.getByTestId('category-Bakery')).toBeInTheDocument();
    });
  });

  it('Run Report button is disabled without dates', () => {
    renderWithProviders(<ReportsPage />);

    const btn = screen.getByTestId('run-report-btn');
    expect(btn).toBeDisabled();
  });

  it('shows stale data banner when dates change after running report', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ReportsPage />);

    await user.click(screen.getByTestId('period-daily'));
    await user.click(screen.getByTestId('run-report-btn'));

    await waitFor(() => {
      expect(screen.getByText('Milk')).toBeInTheDocument();
    });

    expect(screen.queryByTestId('stale-banner')).not.toBeInTheDocument();

    await user.click(screen.getByTestId('period-weekly'));

    expect(screen.getByTestId('stale-banner')).toBeInTheDocument();
  });
});

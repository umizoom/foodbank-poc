import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils/render';
import { ReportsPage } from '../ReportsPage';

describe('ReportsPage', () => {
  it('renders page title', async () => {
    renderWithProviders(<ReportsPage />);

    await waitFor(() => {
      expect(screen.getByText('Reports')).toBeInTheDocument();
    });
  });

  it('renders period toggle buttons', () => {
    renderWithProviders(<ReportsPage />);

    expect(screen.getByTestId('period-daily')).toBeInTheDocument();
    expect(screen.getByTestId('period-weekly')).toBeInTheDocument();
    expect(screen.getByTestId('period-monthly')).toBeInTheDocument();
  });

  it('displays report data in table', async () => {
    renderWithProviders(<ReportsPage />);

    await waitFor(() => {
      expect(screen.getByText('Milk')).toBeInTheDocument();
      expect(screen.getByText('Bread')).toBeInTheDocument();
    });
    expect(screen.getByText('Dairy')).toBeInTheDocument();
    expect(screen.getByText('Bakery')).toBeInTheDocument();
  });

  it('shows current stock per item', async () => {
    renderWithProviders(<ReportsPage />);

    await waitFor(() => {
      expect(screen.getByText('20')).toBeInTheDocument();
    });
  });

  it('daily button is active by default', () => {
    renderWithProviders(<ReportsPage />);

    const dailyBtn = screen.getByTestId('period-daily');
    expect(dailyBtn.className).toContain('bg-blue-600');
  });

  it('switches active period on click', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ReportsPage />);

    const weeklyBtn = screen.getByTestId('period-weekly');
    await user.click(weeklyBtn);

    expect(weeklyBtn.className).toContain('bg-blue-600');
    expect(screen.getByTestId('period-daily').className).not.toContain('bg-blue-600');
  });

  it('displays summary totals', async () => {
    renderWithProviders(<ReportsPage />);

    await waitFor(() => {
      expect(screen.getByText('Total Items Sold')).toBeInTheDocument();
      expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    });
  });
});

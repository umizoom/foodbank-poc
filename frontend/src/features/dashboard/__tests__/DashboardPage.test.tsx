import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/test/utils/render';
import { DashboardPage } from '../DashboardPage';

describe('DashboardPage', () => {
  it('renders all stat cards', async () => {
    renderWithProviders(<DashboardPage />);
    await waitFor(() => {
      expect(screen.getByTestId('stat-total-items')).toBeInTheDocument();
      expect(screen.getByTestId('stat-low-stock-items')).toBeInTheDocument();
      expect(screen.getByTestId('stat-total-neighbours')).toBeInTheDocument();
      expect(screen.getByTestId("stat-today's-transactions")).toBeInTheDocument();
    });
  });

  it('stat cards are links with correct hrefs', async () => {
    renderWithProviders(<DashboardPage />);
    await waitFor(() => {
      expect(screen.getByTestId('stat-total-items')).toHaveAttribute('href', '/inventory');
    });
    expect(screen.getByTestId('stat-low-stock-items')).toHaveAttribute('href', '/inventory?lowStock=true');
    expect(screen.getByTestId('stat-total-neighbours')).toHaveAttribute('href', '/neighbours');
    expect(screen.getByTestId("stat-today's-transactions")).toHaveAttribute('href', '/transactions?today=true');
  });

  it('displays stat values after loading', async () => {
    renderWithProviders(<DashboardPage />);
    await waitFor(() => {
      expect(screen.getByTestId('stat-total-items')).toHaveTextContent('3');
    });
    expect(screen.getByTestId('stat-total-neighbours')).toHaveTextContent('2');
  });
});

import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/test/utils/render';
import { ClientListPage } from '../ClientListPage';

describe('ClientListPage', () => {
  it('renders page title and register button', async () => {
    renderWithProviders(<ClientListPage />);

    await waitFor(() => {
      expect(screen.getByText('Clients')).toBeInTheDocument();
    });
    expect(screen.getByTestId('register-client-button')).toBeInTheDocument();
  });

  it('displays clients in the table', async () => {
    renderWithProviders(<ClientListPage />);

    await waitFor(() => {
      expect(screen.getByText('Maria Garcia')).toBeInTheDocument();
      expect(screen.getByText('John Smith')).toBeInTheDocument();
    });
  });

  it('shows card IDs', async () => {
    renderWithProviders(<ClientListPage />);

    await waitFor(() => {
      expect(screen.getByText('CARD-001')).toBeInTheDocument();
      expect(screen.getByText('CARD-002')).toBeInTheDocument();
    });
  });

  it('renders search input', () => {
    renderWithProviders(<ClientListPage />);
    expect(screen.getByTestId('search-input')).toBeInTheDocument();
  });
});

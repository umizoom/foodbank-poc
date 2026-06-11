import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/test/utils/render';
import { NeighbourListPage } from '../NeighbourListPage';

describe('NeighbourListPage', () => {
  it('renders page title and register button', async () => {
    renderWithProviders(<NeighbourListPage />);

    await waitFor(() => {
      expect(screen.getByText('Neighbours')).toBeInTheDocument();
    });
    expect(screen.getByTestId('register-neighbour-button')).toBeInTheDocument();
  });

  it('displays neighbours in the table', async () => {
    renderWithProviders(<NeighbourListPage />);

    await waitFor(() => {
      expect(screen.getByText('Maria Garcia')).toBeInTheDocument();
      expect(screen.getByText('John Smith')).toBeInTheDocument();
    });
  });

  it('shows card IDs', async () => {
    renderWithProviders(<NeighbourListPage />);

    await waitFor(() => {
      expect(screen.getByText('CARD-001')).toBeInTheDocument();
      expect(screen.getByText('CARD-002')).toBeInTheDocument();
    });
  });

  it('renders search input', () => {
    renderWithProviders(<NeighbourListPage />);
    expect(screen.getByTestId('search-input')).toBeInTheDocument();
  });
});

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils/render';
import { NeighbourListPage } from '../NeighbourListPage';
import { ToastContainer } from '@/shared/components/ToastContainer';

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

  it('renders the reset all balances button', async () => {
    renderWithProviders(<NeighbourListPage />);

    await waitFor(() => {
      expect(screen.getByTestId('reset-balances-button')).toBeInTheDocument();
    });
  });

  it('shows confirmation modal when reset button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<NeighbourListPage />);

    await waitFor(() => {
      expect(screen.getByTestId('reset-balances-button')).toBeInTheDocument();
    });

    await user.click(screen.getByTestId('reset-balances-button'));

    expect(screen.getByTestId('confirm-modal')).toBeInTheDocument();
    expect(screen.getByText(/recalculate all neighbour balances/)).toBeInTheDocument();
    expect(screen.getByTestId('confirm-modal-confirm')).toBeInTheDocument();
  });

  it('closes modal on cancel', async () => {
    const user = userEvent.setup();
    renderWithProviders(<NeighbourListPage />);

    await waitFor(() => {
      expect(screen.getByTestId('reset-balances-button')).toBeInTheDocument();
    });

    await user.click(screen.getByTestId('reset-balances-button'));
    expect(screen.getByTestId('confirm-modal')).toBeInTheDocument();

    await user.click(screen.getByTestId('confirm-modal-cancel'));
    expect(screen.queryByTestId('confirm-modal')).not.toBeInTheDocument();
  });

  it('calls the reset endpoint and shows success toast on confirm', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <>
        <NeighbourListPage />
        <ToastContainer />
      </>
    );

    await waitFor(() => {
      expect(screen.getByTestId('reset-balances-button')).toBeInTheDocument();
    });

    await user.click(screen.getByTestId('reset-balances-button'));
    await user.click(screen.getByTestId('confirm-modal-confirm'));

    await waitFor(() => {
      expect(screen.getByText(/Successfully reset balances for 2 neighbours/)).toBeInTheDocument();
    });
  });
});

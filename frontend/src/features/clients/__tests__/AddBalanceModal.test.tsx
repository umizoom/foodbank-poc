import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificationProvider } from '@/shared/context/NotificationContext';
import { AddBalanceModal } from '../AddBalanceModal';

function renderModal(props = {}) {
  const defaultProps = {
    clientId: 1,
    clientName: 'Maria Garcia',
    onClose: vi.fn(),
    onSuccess: vi.fn(),
    ...props,
  };
  return render(
    <NotificationProvider>
      <AddBalanceModal {...defaultProps} />
    </NotificationProvider>,
  );
}

describe('AddBalanceModal', () => {
  it('renders modal with client name', () => {
    renderModal();
    expect(screen.getByText('Add Balance')).toBeInTheDocument();
    expect(screen.getByText('Adding to: Maria Garcia')).toBeInTheDocument();
  });

  it('validates amount is required', async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByTestId('balance-submit-button'));

    await waitFor(() => {
      expect(screen.getByText('Amount is required')).toBeInTheDocument();
    });
  });

  it('validates amount cannot exceed $2000', async () => {
    const user = userEvent.setup();
    renderModal();

    await user.type(screen.getByTestId('balance-amount-input'), '2500');
    await user.click(screen.getByTestId('balance-submit-button'));

    await waitFor(() => {
      expect(screen.getByText('Amount cannot exceed $2,000.00')).toBeInTheDocument();
    });
  });

  it('validates amount must be positive', async () => {
    const user = userEvent.setup();
    renderModal();

    await user.type(screen.getByTestId('balance-amount-input'), '0');
    await user.click(screen.getByTestId('balance-submit-button'));

    await waitFor(() => {
      expect(screen.getByText('Amount must be greater than zero')).toBeInTheDocument();
    });
  });
});

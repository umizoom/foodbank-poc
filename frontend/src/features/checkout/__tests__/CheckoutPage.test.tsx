import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils/render';
import { CheckoutPage } from '../CheckoutPage';

describe('CheckoutPage', () => {
  it('renders in identify phase initially', async () => {
    renderWithProviders(<CheckoutPage />);

    await waitFor(() => {
      expect(screen.getByText('Checkout')).toBeInTheDocument();
      expect(screen.getByText('Simulate Card Tap')).toBeInTheDocument();
    });
  });

  it('shows card ID input', async () => {
    renderWithProviders(<CheckoutPage />);

    await waitFor(() => {
      expect(screen.getByTestId('card-id-input')).toBeInTheDocument();
    });
  });

  it('shows error for unrecognized card', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CheckoutPage />);

    await waitFor(() => {
      expect(screen.getByTestId('card-id-input')).toBeInTheDocument();
    });

    await user.type(screen.getByTestId('card-id-input'), 'UNKNOWN-CARD');
    await user.click(screen.getByTestId('simulate-card-button'));

    await waitFor(() => {
      expect(screen.getByText('No client found with this card ID')).toBeInTheDocument();
    });
  });

  it('transitions to cart phase after valid card scan', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CheckoutPage />);

    await waitFor(() => {
      expect(screen.getByTestId('card-id-input')).toBeInTheDocument();
    });

    await user.type(screen.getByTestId('card-id-input'), 'CARD-001');
    await user.click(screen.getByTestId('simulate-card-button'));

    await waitFor(() => {
      expect(screen.getByTestId('client-banner')).toBeInTheDocument();
      expect(screen.getByText('Maria Garcia')).toBeInTheDocument();
    });
  });
});

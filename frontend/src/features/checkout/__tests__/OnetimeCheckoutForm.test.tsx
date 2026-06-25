import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils/render';
import { OnetimeCheckoutForm } from '../OnetimeCheckoutForm';

describe('OnetimeCheckoutForm', () => {
  const mockOnIdentified = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    mockOnIdentified.mockClear();
    mockOnCancel.mockClear();
  });

  it('renders form fields', () => {
    renderWithProviders(
      <OnetimeCheckoutForm onNeighbourIdentified={mockOnIdentified} onCancel={mockOnCancel} />
    );

    expect(screen.getByText('Courtesy Checkout')).toBeInTheDocument();
    expect(screen.getByLabelText(/Number of Adults/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Number of Children/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Balance/i)).toBeInTheDocument();
  });

  it('submits form and calls onNeighbourIdentified', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <OnetimeCheckoutForm onNeighbourIdentified={mockOnIdentified} onCancel={mockOnCancel} />
    );

    const adultsInput = screen.getByLabelText(/Number of Adults/i);
    const balanceInput = screen.getByLabelText(/Balance/i);

    await user.clear(adultsInput);
    await user.type(adultsInput, '2');
    await user.type(balanceInput, '30');
    await user.click(screen.getByRole('button', { name: /Start Checkout/i }));

    await waitFor(() => {
      expect(mockOnIdentified).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Courtesy Checkout #1',
          is_onetime: true,
        }),
        expect.objectContaining({
          neighbour_name: 'Courtesy Checkout #1',
        })
      );
    });
  });

  it('calls onCancel when Back is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <OnetimeCheckoutForm onNeighbourIdentified={mockOnIdentified} onCancel={mockOnCancel} />
    );

    await user.click(screen.getByRole('button', { name: /Back/i }));
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('shows validation error when balance is empty', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <OnetimeCheckoutForm onNeighbourIdentified={mockOnIdentified} onCancel={mockOnCancel} />
    );

    await user.click(screen.getByRole('button', { name: /Start Checkout/i }));

    await waitFor(() => {
      expect(screen.getByText('Required')).toBeInTheDocument();
    });
    expect(mockOnIdentified).not.toHaveBeenCalled();
  });
});

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils/render';
import { BulkEditModal } from '../BulkEditModal';
import { ToastContainer } from '@/shared/components/ToastContainer';

describe('BulkEditModal', () => {
  const defaultProps = {
    selectedIds: new Set([1, 2]) as Set<number>,
    onClose: vi.fn(),
    onSuccess: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders action dropdown with all options', () => {
    renderWithProviders(<BulkEditModal {...defaultProps} />);

    expect(screen.getByTestId('bulk-edit-action-select')).toBeInTheDocument();
    expect(screen.getByText('Allergies / Dietary Restrictions')).toBeInTheDocument();
    expect(screen.getByText('Catchment Area')).toBeInTheDocument();
    expect(screen.getByText('Reset Balance')).toBeInTheDocument();
    expect(screen.getByText('Number of Adults')).toBeInTheDocument();
    expect(screen.getByText('Number of Children')).toBeInTheDocument();
  });

  it('shows allergies picker when allergies action selected', async () => {
    const user = userEvent.setup();
    renderWithProviders(<BulkEditModal {...defaultProps} />);

    await user.selectOptions(screen.getByTestId('bulk-edit-action-select'), 'allergies');

    expect(screen.getByTestId('bulk-edit-allergies-field')).toBeInTheDocument();
    expect(screen.getByText('Lactose free')).toBeInTheDocument();
    expect(screen.getByText('Gluten free')).toBeInTheDocument();
  });

  it('shows number input for num_adults action', async () => {
    const user = userEvent.setup();
    renderWithProviders(<BulkEditModal {...defaultProps} />);

    await user.selectOptions(screen.getByTestId('bulk-edit-action-select'), 'num_adults');

    expect(screen.getByTestId('bulk-edit-num-adults-field')).toBeInTheDocument();
    expect(screen.getByTestId('bulk-edit-num-adults-input')).toBeInTheDocument();
  });

  it('shows catchment radio buttons for catchment_area action', async () => {
    const user = userEvent.setup();
    renderWithProviders(<BulkEditModal {...defaultProps} />);

    await user.selectOptions(screen.getByTestId('bulk-edit-action-select'), 'catchment_area');

    expect(screen.getByTestId('bulk-edit-catchment-field')).toBeInTheDocument();
    expect(screen.getByText('In Catchment')).toBeInTheDocument();
    expect(screen.getByText('Out of Catchment')).toBeInTheDocument();
  });

  it('shows warning text for reset_balance action', async () => {
    const user = userEvent.setup();
    renderWithProviders(<BulkEditModal {...defaultProps} />);

    await user.selectOptions(screen.getByTestId('bulk-edit-action-select'), 'reset_balance');

    expect(screen.getByTestId('bulk-edit-reset-balance-field')).toBeInTheDocument();
    expect(screen.getByText(/recalculate balances/)).toBeInTheDocument();
  });

  it('submits correct payload and shows success toast', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <>
        <BulkEditModal {...defaultProps} />
        <ToastContainer />
      </>
    );

    await user.selectOptions(screen.getByTestId('bulk-edit-action-select'), 'catchment_area');
    await user.click(screen.getByTestId('bulk-edit-apply-button'));

    await waitFor(() => {
      expect(screen.getByText(/Successfully updated 2 neighbours/)).toBeInTheDocument();
    });
    expect(defaultProps.onSuccess).toHaveBeenCalled();
  });

  it('cancel button calls onClose', async () => {
    const user = userEvent.setup();
    renderWithProviders(<BulkEditModal {...defaultProps} />);

    await user.click(screen.getByText('Cancel'));

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('displays selected count in title', () => {
    renderWithProviders(<BulkEditModal {...defaultProps} />);
    expect(screen.getByText('Bulk Edit (2 neighbours selected)')).toBeInTheDocument();
  });
});

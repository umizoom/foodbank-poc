import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect } from 'vitest';
import { renderWithProviders } from '@/test/utils/render';
import { CardSimulator } from '../CardSimulator';

// Stub the camera scanner so tests can drive a scan without a real camera.
vi.mock('@/shared/components/QrScanner', () => ({
  QrScanner: ({ onScan }: { onScan: (v: string) => void }) => (
    <button data-testid="mock-scan-trigger" onClick={() => onScan('CARD-001')}>
      emit scan
    </button>
  ),
}));

describe('CardSimulator', () => {
  it('identifies a neighbour from a scanned QR code', async () => {
    const user = userEvent.setup();
    const onIdentified = vi.fn();
    renderWithProviders(<CardSimulator onNeighbourIdentified={onIdentified} />);

    await user.click(screen.getByTestId('scan-qr-button'));
    await user.click(screen.getByTestId('mock-scan-trigger'));

    await waitFor(() => expect(onIdentified).toHaveBeenCalled());
    const [neighbour, cart] = onIdentified.mock.calls[0];
    expect(neighbour.card_id).toBe('CARD-001');
    expect(cart).toBeDefined();
  });

  it('still supports manual card entry', async () => {
    const user = userEvent.setup();
    const onIdentified = vi.fn();
    renderWithProviders(<CardSimulator onNeighbourIdentified={onIdentified} />);

    await user.type(screen.getByTestId('card-id-input'), 'CARD-001');
    await user.click(screen.getByTestId('simulate-card-button'));

    await waitFor(() => expect(onIdentified).toHaveBeenCalled());
  });

  it('shows an error for an unrecognized scanned card', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CardSimulator onNeighbourIdentified={vi.fn()} />);

    await user.type(screen.getByTestId('card-id-input'), 'UNKNOWN-CARD');
    await user.click(screen.getByTestId('simulate-card-button'));

    await waitFor(() =>
      expect(screen.getByText('No neighbour found with this card ID')).toBeInTheDocument(),
    );
  });
});

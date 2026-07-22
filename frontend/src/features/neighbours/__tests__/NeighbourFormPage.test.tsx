import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { vi, describe, it, expect } from 'vitest';
import { renderWithProviders } from '@/test/utils/render';
import { server } from '@/test/mocks/server';
import { NeighbourFormPage } from '../NeighbourFormPage';

// Stub the camera scanner so tests can drive a scan without a real camera.
vi.mock('@/shared/components/QrScanner', () => ({
  QrScanner: ({ onScan }: { onScan: (v: string) => void }) => (
    <button data-testid="mock-scan-trigger" onClick={() => onScan('QR-CARD-999')}>
      emit scan
    </button>
  ),
}));

describe('NeighbourFormPage QR scanning', () => {
  it('populates the card ID field from a scanned QR code and submits it', async () => {
    const user = userEvent.setup();

    let postedCardId: unknown = null;
    server.use(
      http.post('*/api/neighbours/', async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        postedCardId = body.card_id;
        return HttpResponse.json({ id: 99, ...body }, { status: 201 });
      }),
    );

    renderWithProviders(<NeighbourFormPage />, { route: '/neighbours/new' });

    await user.click(screen.getByTestId('neighbour-scan-qr-button'));
    await user.click(screen.getByTestId('mock-scan-trigger'));

    await waitFor(() =>
      expect(screen.getByTestId('neighbour-card-input')).toHaveValue('QR-CARD-999'),
    );

    await user.type(screen.getByTestId('neighbour-name-input'), 'Jane Doe');
    await user.click(screen.getByTestId('neighbour-submit-button'));

    await waitFor(() => expect(postedCardId).toBe('QR-CARD-999'));
  });
});

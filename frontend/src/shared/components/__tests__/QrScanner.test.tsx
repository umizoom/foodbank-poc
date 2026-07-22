import { render, screen, waitFor } from '@testing-library/react';
import { vi, beforeEach, afterEach, describe, it, expect } from 'vitest';
import { QrScanner } from '../QrScanner';

const { mockDecodeFromStream, mockControlsStop } = vi.hoisted(() => ({
  mockDecodeFromStream: vi.fn(),
  mockControlsStop: vi.fn(),
}));

vi.mock('@zxing/browser', () => ({
  BrowserQRCodeReader: class {
    decodeFromStream = mockDecodeFromStream;
  },
}));

const trackStop = vi.fn();

function makeStream(): MediaStream {
  const tracks = [{ stop: trackStop }];
  return {
    getTracks: () => tracks,
    getVideoTracks: () => tracks,
  } as unknown as MediaStream;
}

function setMediaDevices(value: unknown) {
  Object.defineProperty(navigator, 'mediaDevices', { value, configurable: true });
}

describe('QrScanner', () => {
  beforeEach(() => {
    mockDecodeFromStream.mockReset();
    mockControlsStop.mockReset();
    trackStop.mockReset();
    setMediaDevices({ getUserMedia: vi.fn().mockResolvedValue(makeStream()) });
  });

  afterEach(() => {
    setMediaDevices(undefined);
  });

  it('calls onScan with the decoded text and stops the stream', async () => {
    mockDecodeFromStream.mockImplementation((_stream, _video, cb) => {
      cb({ getText: () => 'SCANNED-123' });
      return Promise.resolve({ stop: mockControlsStop });
    });
    const onScan = vi.fn();

    render(<QrScanner onScan={onScan} onClose={() => {}} />);

    await waitFor(() => expect(onScan).toHaveBeenCalledWith('SCANNED-123'));
    expect(mockControlsStop).toHaveBeenCalled();
  });

  it('shows a friendly error when the camera context is insecure', () => {
    setMediaDevices(undefined);
    const onError = vi.fn();

    render(<QrScanner onScan={() => {}} onClose={() => {}} onError={onError} />);

    expect(screen.getByText(/secure \(HTTPS\) connection/i)).toBeInTheDocument();
    expect(onError).toHaveBeenCalled();
    expect(mockDecodeFromStream).not.toHaveBeenCalled();
  });

  it('shows a permission-denied error when the camera is blocked', async () => {
    setMediaDevices({
      getUserMedia: vi.fn().mockRejectedValue(new DOMException('denied', 'NotAllowedError')),
    });

    render(<QrScanner onScan={() => {}} onClose={() => {}} />);

    await waitFor(() =>
      expect(screen.getByText(/permission denied/i)).toBeInTheDocument(),
    );
  });

  it('stops the camera stream on unmount', async () => {
    mockDecodeFromStream.mockResolvedValue({ stop: mockControlsStop });

    const { unmount } = render(<QrScanner onScan={() => {}} onClose={() => {}} />);
    await waitFor(() => expect(mockDecodeFromStream).toHaveBeenCalled());

    unmount();
    expect(mockControlsStop).toHaveBeenCalled();
    expect(trackStop).toHaveBeenCalled();
  });
});

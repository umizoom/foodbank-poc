import type { ReactNode } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface SpinnerOverlayProps {
  loading: boolean;
  children: ReactNode;
}

export function SpinnerOverlay({ loading, children }: SpinnerOverlayProps) {
  return (
    <div className="relative">
      {children}
      {loading && (
        <div className="absolute inset-0 bg-white/60 flex items-center justify-center pointer-events-none">
          <LoadingSpinner size="lg" />
        </div>
      )}
    </div>
  );
}

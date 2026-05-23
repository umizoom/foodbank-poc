import { render, type RenderOptions } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '@/features/auth/AuthContext';
import { NotificationProvider } from '@/shared/context/NotificationContext';
import type { ReactElement } from 'react';

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  route?: string;
}

export function renderWithProviders(ui: ReactElement, options: CustomRenderOptions = {}) {
  const { route = '/', ...renderOptions } = options;

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <AuthProvider>
        <NotificationProvider>
          <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
        </NotificationProvider>
      </AuthProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';

function TestConsumer() {
  const { state } = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(state.loading)}</span>
      <span data-testid="authenticated">{String(state.isAuthenticated)}</span>
      <span data-testid="username">{state.user?.username ?? 'none'}</span>
    </div>
  );
}

describe('AuthContext', () => {
  it('checks session on mount and sets authenticated state', async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    expect(screen.getByTestId('loading')).toHaveTextContent('true');

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
      expect(screen.getByTestId('username')).toHaveTextContent('admin');
    });
  });
});

import { useAuth } from '@/features/auth/AuthContext';
import { Button } from './Button';

export function TopBar() {
  const { state, logout } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <div />
      <div className="flex items-center gap-4">
        {state.user && (
          <span className="text-sm text-gray-600">
            Logged in as <strong>{state.user.username}</strong>
          </span>
        )}
        <Button
          variant="secondary"
          size="sm"
          onClick={logout}
          data-testid="logout-button"
        >
          Log Out
        </Button>
      </div>
    </header>
  );
}

import { useAuth } from '@/features/auth/AuthContext';
import { Button } from './Button';

interface TopBarProps {
  onMenuToggle: () => void;
}

export function TopBar({ onMenuToggle }: TopBarProps) {
  const { state, logout } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <button
        className="md:hidden p-2 -ml-2 text-gray-600 hover:text-gray-900"
        onClick={onMenuToggle}
        aria-label="Toggle menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <div className="hidden md:block" />
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

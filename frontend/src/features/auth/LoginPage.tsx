import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { LoginForm } from './LoginForm';
import { AlertBanner } from '@/shared/components/AlertBanner';

export function LoginPage() {
  const { state } = useAuth();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  if (state.isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-6">Food Bank Inventory</h1>
        {state.sessionExpired && (
          <AlertBanner type="warning" message="Your session has expired. Please log in again." />
        )}
        <LoginForm />
      </div>
    </div>
  );
}

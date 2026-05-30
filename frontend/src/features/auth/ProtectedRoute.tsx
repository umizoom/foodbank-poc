import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';

export function ProtectedRoute() {
  const { state } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!state.loading && !state.isAuthenticated) {
      navigate('/login', { state: { from: location }, replace: true });
    }
  }, [state.loading, state.isAuthenticated, navigate, location]);

  if (state.loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!state.isAuthenticated) {
    return null;
  }

  return <Outlet />;
}

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from './AuthContext';
import { FormField } from '@/shared/components/FormField';
import { Button } from '@/shared/components/Button';
import { AlertBanner } from '@/shared/components/AlertBanner';
import { ApiError } from '@/shared/api/errors';

interface LoginFormData {
  username: string;
  password: string;
}

export function LoginForm() {
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    setLoading(true);
    try {
      await login(data);
    } catch (e) {
      if (e instanceof ApiError) {
        const errors = e.data?.non_field_errors as string[] | undefined;
        const detail = e.data?.detail as string[] | undefined;
        const error = e.data?.error as string | undefined;
        setError(errors?.[0] || detail?.[0] || error || 'Invalid Credentials');
      } else {
        setError('Unable to connect to server');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} data-testid="login-form">
      {error && <AlertBanner type="error" message={error} onDismiss={() => setError(null)} />}

      <FormField label="Username" required error={errors.username?.message}>
        {(props) => (
          <input
            {...register('username', { required: 'Username is required' })}
            type="text"
            className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            data-testid="login-username-input"
            {...props}
          />
        )}
      </FormField>

      <FormField label="Password" required error={errors.password?.message}>
        {(props) => (
          <div className="relative">
            <input
              {...register('password', { required: 'Password is required' })}
              type={showPassword ? 'text' : 'password'}
              className="w-full rounded-md border border-gray-300 px-4 py-2 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              data-testid="login-password-input"
              {...props}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
              data-testid="toggle-password-visibility"
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        )}
      </FormField>

      <Button type="submit" loading={loading} className="w-full mt-2" data-testid="login-submit-button">
        Log In
      </Button>
    </form>
  );
}

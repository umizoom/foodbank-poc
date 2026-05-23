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
        const msg = e.data?.non_field_errors?.[0] || e.data?.detail?.[0] || 'Invalid credentials';
        setError(msg);
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
          <input
            {...register('password', { required: 'Password is required' })}
            type="password"
            className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            data-testid="login-password-input"
            {...props}
          />
        )}
      </FormField>

      <Button type="submit" loading={loading} className="w-full mt-2" data-testid="login-submit-button">
        Log In
      </Button>
    </form>
  );
}

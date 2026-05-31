import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils/render';
import { LoginForm } from '../LoginForm';

describe('LoginForm', () => {
  it('renders username and password fields', () => {
    renderWithProviders(<LoginForm />);
    expect(screen.getByTestId('login-username-input')).toBeInTheDocument();
    expect(screen.getByTestId('login-password-input')).toBeInTheDocument();
    expect(screen.getByTestId('login-submit-button')).toBeInTheDocument();
  });

  it('shows validation errors when fields are empty', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginForm />);

    await user.click(screen.getByTestId('login-submit-button'));

    await waitFor(() => {
      expect(screen.getByText('Username is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });
  });

  it('submits form with valid credentials', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginForm />);

    await user.type(screen.getByTestId('login-username-input'), 'admin');
    await user.type(screen.getByTestId('login-password-input'), 'password');
    await user.click(screen.getByTestId('login-submit-button'));

    await waitFor(() => {
      expect(screen.queryByText('Invalid Credentials')).not.toBeInTheDocument();
    });
  });

  it('shows error message on Invalid Credentials', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginForm />);

    await user.type(screen.getByTestId('login-username-input'), 'admin');
    await user.type(screen.getByTestId('login-password-input'), 'wrong');
    await user.click(screen.getByTestId('login-submit-button'));

    await waitFor(() => {
      expect(screen.getByText('Invalid Credentials')).toBeInTheDocument();
    });
  });
});

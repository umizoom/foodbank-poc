import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchInput } from '../SearchInput';

describe('SearchInput', () => {
  it('renders with placeholder', () => {
    render(<SearchInput value="" onChange={vi.fn()} placeholder="Search..." />);
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });

  it('calls onChange after debounce delay', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SearchInput value="" onChange={onChange} />);

    await user.type(screen.getByTestId('search-input'), 'milk');

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith('milk');
    }, { timeout: 500 });
  });

  it('shows clear button when value is not empty', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SearchInput value="" onChange={onChange} />);

    await user.type(screen.getByTestId('search-input'), 'test');
    expect(screen.getByTestId('search-clear-button')).toBeInTheDocument();
  });

  it('clears input when clear button is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SearchInput value="test" onChange={onChange} />);

    await user.click(screen.getByTestId('search-clear-button'));
    expect(onChange).toHaveBeenCalledWith('');
  });
});

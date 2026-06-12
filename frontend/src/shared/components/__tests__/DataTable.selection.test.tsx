import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataTable, type Column } from '../DataTable';

interface TestItem {
  id: number;
  name: string;
}

const items: TestItem[] = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
  { id: 3, name: 'Charlie' },
];

const columns: Column<TestItem>[] = [
  { key: 'name', header: 'Name', render: (item) => item.name },
];

describe('DataTable selection', () => {
  it('does not render checkboxes when selectable is false', () => {
    render(
      <DataTable columns={columns} data={items} keyExtractor={(i) => i.id} />
    );
    expect(screen.queryByTestId('select-all-checkbox')).not.toBeInTheDocument();
    expect(screen.queryByTestId('select-row-1')).not.toBeInTheDocument();
  });

  it('renders checkboxes when selectable is true', () => {
    render(
      <DataTable
        columns={columns}
        data={items}
        keyExtractor={(i) => i.id}
        selectable
        selectedIds={new Set()}
        onSelectionChange={() => {}}
      />
    );
    expect(screen.getByTestId('select-all-checkbox')).toBeInTheDocument();
    expect(screen.getByTestId('select-row-1')).toBeInTheDocument();
    expect(screen.getByTestId('select-row-2')).toBeInTheDocument();
    expect(screen.getByTestId('select-row-3')).toBeInTheDocument();
  });

  it('clicking row checkbox calls onSelectionChange with updated set', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <DataTable
        columns={columns}
        data={items}
        keyExtractor={(i) => i.id}
        selectable
        selectedIds={new Set()}
        onSelectionChange={onChange}
      />
    );

    await user.click(screen.getByTestId('select-row-2'));
    expect(onChange).toHaveBeenCalledWith(new Set([2]));
  });

  it('select all checkbox selects all items', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <DataTable
        columns={columns}
        data={items}
        keyExtractor={(i) => i.id}
        selectable
        selectedIds={new Set()}
        onSelectionChange={onChange}
      />
    );

    await user.click(screen.getByTestId('select-all-checkbox'));
    expect(onChange).toHaveBeenCalledWith(new Set([1, 2, 3]));
  });

  it('select all checkbox deselects all when all are selected', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <DataTable
        columns={columns}
        data={items}
        keyExtractor={(i) => i.id}
        selectable
        selectedIds={new Set([1, 2, 3])}
        onSelectionChange={onChange}
      />
    );

    await user.click(screen.getByTestId('select-all-checkbox'));
    expect(onChange).toHaveBeenCalledWith(new Set());
  });

  it('checkbox click does not trigger onRowClick', async () => {
    const user = userEvent.setup();
    const onRowClick = vi.fn();
    const onChange = vi.fn();

    render(
      <DataTable
        columns={columns}
        data={items}
        keyExtractor={(i) => i.id}
        onRowClick={onRowClick}
        selectable
        selectedIds={new Set()}
        onSelectionChange={onChange}
      />
    );

    await user.click(screen.getByTestId('select-row-1'));
    expect(onChange).toHaveBeenCalled();
    expect(onRowClick).not.toHaveBeenCalled();
  });
});

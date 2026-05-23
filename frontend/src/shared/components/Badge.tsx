interface BadgeProps {
  count: number;
  variant?: 'warning' | 'danger' | 'default';
}

const variantClasses = {
  warning: 'bg-yellow-500 text-white',
  danger: 'bg-red-500 text-white',
  default: 'bg-gray-500 text-white',
};

export function Badge({ count, variant = 'default' }: BadgeProps) {
  if (count === 0) return null;

  return (
    <span
      className={`inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 text-xs font-medium rounded-full ${variantClasses[variant]}`}
      data-testid="badge"
    >
      {count}
    </span>
  );
}

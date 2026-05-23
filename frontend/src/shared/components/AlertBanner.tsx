interface AlertBannerProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onDismiss?: () => void;
}

const typeClasses = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
};

export function AlertBanner({ type, message, onDismiss }: AlertBannerProps) {
  return (
    <div
      className={`border rounded-md p-4 mb-4 flex items-center justify-between ${typeClasses[type]}`}
      role="alert"
      data-testid="alert-banner"
    >
      <p className="text-sm">{message}</p>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="ml-4 text-current opacity-70 hover:opacity-100"
          aria-label="Dismiss"
          data-testid="alert-dismiss"
        >
          &times;
        </button>
      )}
    </div>
  );
}

import { useNotification } from '@/shared/context/NotificationContext';

const typeClasses = {
  success: 'bg-green-600',
  error: 'bg-red-600',
  warning: 'bg-yellow-500',
  info: 'bg-blue-600',
};

export function ToastContainer() {
  const { toasts, dismissToast } = useNotification();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-80" data-testid="toast-container">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${typeClasses[toast.type]} text-white px-4 py-3 rounded-md shadow-lg flex items-center justify-between animate-[slideIn_0.2s_ease-out]`}
          role="status"
        >
          <p className="text-sm">{toast.message}</p>
          <button
            onClick={() => dismissToast(toast.id)}
            className="ml-3 text-white/80 hover:text-white"
            aria-label="Dismiss"
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  );
}

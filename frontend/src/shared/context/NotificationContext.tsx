import { createContext, useContext, useReducer, useCallback, type ReactNode } from 'react';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  createdAt: number;
}

type NotificationAction =
  | { type: 'ADD'; payload: Toast }
  | { type: 'DISMISS'; payload: string };

function notificationReducer(state: Toast[], action: NotificationAction): Toast[] {
  switch (action.type) {
    case 'ADD':
      return [action.payload, ...state].slice(0, 3);
    case 'DISMISS':
      return state.filter((t) => t.id !== action.payload);
  }
}

interface NotificationContextValue {
  toasts: Toast[];
  addToast: (type: Toast['type'], message: string) => void;
  dismissToast: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [toasts, dispatch] = useReducer(notificationReducer, []);

  const addToast = useCallback((type: Toast['type'], message: string) => {
    const id = crypto.randomUUID();
    dispatch({ type: 'ADD', payload: { id, type, message, createdAt: Date.now() } });

    const timeout = type === 'success' ? 5000 : 8000;
    setTimeout(() => {
      dispatch({ type: 'DISMISS', payload: id });
    }, timeout);
  }, []);

  const dismissToast = useCallback((id: string) => {
    dispatch({ type: 'DISMISS', payload: id });
  }, []);

  return (
    <NotificationContext.Provider value={{ toasts, addToast, dismissToast }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification(): NotificationContextValue {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}

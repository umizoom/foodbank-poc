import { useCallback } from 'react';
import type { UseFormSetError, FieldValues, Path } from 'react-hook-form';
import { ApiError } from '@/shared/api/errors';

export function useFormApiError<T extends FieldValues>(setError: UseFormSetError<T>) {
  return useCallback(
    (error: unknown): string | null => {
      if (error instanceof ApiError && error.status === 400) {
        let generalError: string | null = null;
        Object.entries(error.data).forEach(([field, value]) => {
          const message = Array.isArray(value) ? value[0] : value;
          if (field === 'non_field_errors' || field === 'detail') {
            generalError = String(message);
          } else {
            setError(field as Path<T>, { message: String(message) });
          }
        });
        return generalError;
      }
      return null;
    },
    [setError],
  );
}

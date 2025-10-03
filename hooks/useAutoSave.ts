import { useEffect, useRef, useState } from 'react';
import { draftStorage } from '@/lib/storage';

interface UseAutoSaveOptions<T> {
  data: T;
  formId: string;
  delay?: number; // milliseconds
  enabled?: boolean;
  onSave?: (data: T) => void;
  onError?: (error: Error) => void;
}

interface UseAutoSaveReturn {
  isSaving: boolean;
  lastSaved: Date | null;
  error: Error | null;
  saveNow: () => void;
}

/**
 * Hook for auto-saving form data to localStorage
 *
 * @param options - Configuration options
 * @returns Auto-save state and controls
 *
 * @example
 * const { lastSaved, saveNow } = useAutoSave({
 *   data: formData,
 *   formId: 'maintenance-form',
 *   delay: 30000, // 30 seconds
 * });
 */
export function useAutoSave<T>({
  data,
  formId,
  delay = 30000, // Default: 30 seconds
  enabled = true,
  onSave,
  onError,
}: UseAutoSaveOptions<T>): UseAutoSaveReturn {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastDataRef = useRef<string>('');

  // Manual save function
  const saveNow = () => {
    if (!enabled) return;

    try {
      setIsSaving(true);
      setError(null);

      const success = draftStorage.saveDraft(formId, data);

      if (success) {
        const now = new Date();
        setLastSaved(now);
        lastDataRef.current = JSON.stringify(data);
        onSave?.(data);
      } else {
        throw new Error('Failed to save draft');
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      onError?.(error);
      console.error('Auto-save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-save effect
  useEffect(() => {
    if (!enabled) return;

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Check if data has changed
    const currentData = JSON.stringify(data);
    const hasChanged = currentData !== lastDataRef.current;

    if (!hasChanged) return;

    // Set up new timeout
    timeoutRef.current = setTimeout(() => {
      saveNow();
    }, delay);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, delay, enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load last saved time on mount
  useEffect(() => {
    const draft = draftStorage.getDraft(formId);
    if (draft) {
      setLastSaved(new Date(draft.savedAt));
      lastDataRef.current = JSON.stringify(draft.data);
    }
  }, [formId]);

  return {
    isSaving,
    lastSaved,
    error,
    saveNow,
  };
}

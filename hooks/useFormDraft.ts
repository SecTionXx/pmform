import { useEffect, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { draftStorage } from '@/lib/storage';

interface UseFormDraftOptions<T> {
  formId: string;
  form: UseFormReturn<T>;
  onDraftLoaded?: (data: T) => void;
}

interface UseFormDraftReturn {
  hasDraft: boolean;
  draftAge: number | null; // milliseconds
  loadDraft: () => void;
  clearDraft: () => void;
  isLoading: boolean;
}

/**
 * Hook for managing form drafts (loading and clearing)
 *
 * @param options - Configuration options
 * @returns Draft state and controls
 *
 * @example
 * const { hasDraft, loadDraft, clearDraft } = useFormDraft({
 *   formId: 'maintenance-form',
 *   form: formMethods,
 * });
 */
export function useFormDraft<T>({
  formId,
  form,
  onDraftLoaded,
}: UseFormDraftOptions<T>): UseFormDraftReturn {
  const [hasDraft, setHasDraft] = useState(false);
  const [draftAge, setDraftAge] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check for existing draft on mount
  useEffect(() => {
    const checkDraft = () => {
      const exists = draftStorage.hasDraft(formId);
      setHasDraft(exists);

      if (exists) {
        const age = draftStorage.getDraftAge(formId);
        setDraftAge(age);
      }
    };

    checkDraft();
  }, [formId]);

  // Load draft into form
  const loadDraft = () => {
    try {
      setIsLoading(true);

      const draft = draftStorage.getDraft<T>(formId);

      if (!draft) {
        console.warn('No draft found to load');
        setHasDraft(false);
        return;
      }

      // Reset form with draft data
      form.reset(draft.data as any);

      // Call callback
      onDraftLoaded?.(draft.data);

      console.log('Draft loaded successfully');
    } catch (error) {
      console.error('Error loading draft:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear draft from storage
  const clearDraft = () => {
    try {
      const success = draftStorage.removeDraft(formId);

      if (success) {
        setHasDraft(false);
        setDraftAge(null);
        console.log('Draft cleared successfully');
      }
    } catch (error) {
      console.error('Error clearing draft:', error);
    }
  };

  return {
    hasDraft,
    draftAge,
    loadDraft,
    clearDraft,
    isLoading,
  };
}

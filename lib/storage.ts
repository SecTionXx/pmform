/**
 * LocalStorage wrapper utility with error handling and TypeScript support
 */

const STORAGE_PREFIX = 'pmform_';

export const storage = {
  /**
   * Save data to localStorage
   */
  set: <T>(key: string, value: T): boolean => {
    try {
      const prefixedKey = STORAGE_PREFIX + key;
      const serialized = JSON.stringify(value);
      localStorage.setItem(prefixedKey, serialized);
      return true;
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      return false;
    }
  },

  /**
   * Get data from localStorage
   */
  get: <T>(key: string): T | null => {
    try {
      const prefixedKey = STORAGE_PREFIX + key;
      const item = localStorage.getItem(prefixedKey);
      if (!item) return null;
      return JSON.parse(item) as T;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  },

  /**
   * Remove data from localStorage
   */
  remove: (key: string): boolean => {
    try {
      const prefixedKey = STORAGE_PREFIX + key;
      localStorage.removeItem(prefixedKey);
      return true;
    } catch (error) {
      console.error('Error removing from localStorage:', error);
      return false;
    }
  },

  /**
   * Clear all app data from localStorage
   */
  clear: (): boolean => {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(STORAGE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  },

  /**
   * Check if localStorage is available
   */
  isAvailable: (): boolean => {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Get all keys with our prefix
   */
  getAllKeys: (): string[] => {
    try {
      const keys = Object.keys(localStorage);
      return keys
        .filter((key) => key.startsWith(STORAGE_PREFIX))
        .map((key) => key.replace(STORAGE_PREFIX, ''));
    } catch (error) {
      console.error('Error getting keys from localStorage:', error);
      return [];
    }
  },
};

/**
 * Draft-specific storage functions
 */
export const draftStorage = {
  /**
   * Save form draft
   */
  saveDraft: <T>(formId: string, data: T): boolean => {
    const draft = {
      data,
      savedAt: new Date().toISOString(),
    };
    return storage.set(`draft_${formId}`, draft);
  },

  /**
   * Get form draft
   */
  getDraft: <T>(formId: string): { data: T; savedAt: string } | null => {
    return storage.get<{ data: T; savedAt: string }>(`draft_${formId}`);
  },

  /**
   * Remove form draft
   */
  removeDraft: (formId: string): boolean => {
    return storage.remove(`draft_${formId}`);
  },

  /**
   * Get all draft IDs
   */
  getAllDrafts: (): string[] => {
    const keys = storage.getAllKeys();
    return keys
      .filter((key) => key.startsWith('draft_'))
      .map((key) => key.replace('draft_', ''));
  },

  /**
   * Check if draft exists
   */
  hasDraft: (formId: string): boolean => {
    return storage.get(`draft_${formId}`) !== null;
  },

  /**
   * Get draft age in milliseconds
   */
  getDraftAge: (formId: string): number | null => {
    const draft = draftStorage.getDraft(formId);
    if (!draft) return null;

    const savedAt = new Date(draft.savedAt);
    const now = new Date();
    return now.getTime() - savedAt.getTime();
  },
};

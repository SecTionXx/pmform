/**
 * Offline queue for storing and syncing form submissions
 * Uses localStorage for persistence
 */

import { storage } from './storage';

export interface QueuedSubmission {
  /**
   * Unique ID for this submission
   */
  id: string;

  /**
   * Form data to submit
   */
  data: any;

  /**
   * Timestamp when queued
   */
  queuedAt: string;

  /**
   * Number of retry attempts
   */
  retries: number;

  /**
   * Status of the submission
   */
  status: 'pending' | 'syncing' | 'failed' | 'completed';

  /**
   * Error message if failed
   */
  error?: string;

  /**
   * Last attempt timestamp
   */
  lastAttempt?: string;
}

const QUEUE_KEY = 'offline_queue';

/**
 * Get all queued submissions
 */
export function getQueue(): QueuedSubmission[] {
  const queue = storage.get<QueuedSubmission[]>(QUEUE_KEY);
  return queue || [];
}

/**
 * Add a submission to the queue
 *
 * @param data - Form data to queue
 * @returns Submission ID
 */
export function addToQueue(data: any): string {
  const queue = getQueue();

  const submission: QueuedSubmission = {
    id: generateId(),
    data,
    queuedAt: new Date().toISOString(),
    retries: 0,
    status: 'pending',
  };

  queue.push(submission);
  storage.set(QUEUE_KEY, queue);

  console.log('Added submission to offline queue:', submission.id);

  return submission.id;
}

/**
 * Remove a submission from the queue
 *
 * @param id - Submission ID
 */
export function removeFromQueue(id: string): boolean {
  const queue = getQueue();
  const filteredQueue = queue.filter(item => item.id !== id);

  if (filteredQueue.length === queue.length) {
    return false; // Not found
  }

  storage.set(QUEUE_KEY, filteredQueue);
  console.log('Removed submission from queue:', id);

  return true;
}

/**
 * Update a submission in the queue
 *
 * @param id - Submission ID
 * @param updates - Partial updates to apply
 */
export function updateQueueItem(
  id: string,
  updates: Partial<QueuedSubmission>
): boolean {
  const queue = getQueue();
  const index = queue.findIndex(item => item.id === id);

  if (index === -1) {
    return false;
  }

  queue[index] = {
    ...queue[index],
    ...updates,
  };

  storage.set(QUEUE_KEY, queue);

  return true;
}

/**
 * Get pending submissions (not completed)
 */
export function getPendingSubmissions(): QueuedSubmission[] {
  return getQueue().filter(item => item.status === 'pending' || item.status === 'failed');
}

/**
 * Clear all completed submissions from queue
 */
export function clearCompletedSubmissions(): number {
  const queue = getQueue();
  const pendingQueue = queue.filter(item => item.status !== 'completed');
  const clearedCount = queue.length - pendingQueue.length;

  storage.set(QUEUE_KEY, pendingQueue);

  if (clearedCount > 0) {
    console.log(`Cleared ${clearedCount} completed submissions from queue`);
  }

  return clearedCount;
}

/**
 * Clear the entire queue
 */
export function clearQueue(): void {
  storage.remove(QUEUE_KEY);
  console.log('Cleared offline queue');
}

/**
 * Sync all pending submissions
 *
 * @param onProgress - Callback for progress updates
 * @returns Results of sync operation
 */
export async function syncQueue(
  onProgress?: (current: number, total: number, submission: QueuedSubmission) => void
): Promise<{
  successful: number;
  failed: number;
  total: number;
}> {
  const pending = getPendingSubmissions();
  const total = pending.length;
  let successful = 0;
  let failed = 0;

  if (total === 0) {
    console.log('No pending submissions to sync');
    return { successful: 0, failed: 0, total: 0 };
  }

  console.log(`Starting sync of ${total} pending submissions`);

  for (let i = 0; i < pending.length; i++) {
    const submission = pending[i];

    // Update status to syncing
    updateQueueItem(submission.id, {
      status: 'syncing',
      lastAttempt: new Date().toISOString(),
    });

    // Call progress callback
    onProgress?.(i + 1, total, submission);

    try {
      // Submit to API
      const response = await fetch('/api/submit-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submission.data),
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const result = await response.json();

      // Mark as completed
      updateQueueItem(submission.id, {
        status: 'completed',
        error: undefined,
      });

      successful++;
      console.log('Successfully synced submission:', submission.id, result);
    } catch (error) {
      // Mark as failed, increment retry count
      const newRetries = submission.retries + 1;
      const maxRetries = 3;

      updateQueueItem(submission.id, {
        status: newRetries >= maxRetries ? 'failed' : 'pending',
        retries: newRetries,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      failed++;
      console.error('Failed to sync submission:', submission.id, error);
    }

    // Add small delay between requests to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Clean up completed submissions
  clearCompletedSubmissions();

  console.log(`Sync completed: ${successful} successful, ${failed} failed out of ${total}`);

  return { successful, failed, total };
}

/**
 * Get queue statistics
 */
export function getQueueStats(): {
  total: number;
  pending: number;
  syncing: number;
  failed: number;
  completed: number;
} {
  const queue = getQueue();

  return {
    total: queue.length,
    pending: queue.filter(item => item.status === 'pending').length,
    syncing: queue.filter(item => item.status === 'syncing').length,
    failed: queue.filter(item => item.status === 'failed').length,
    completed: queue.filter(item => item.status === 'completed').length,
  };
}

/**
 * Generate unique ID for submissions
 */
function generateId(): string {
  return `submission_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Check if there are any pending submissions
 */
export function hasPendingSubmissions(): boolean {
  return getPendingSubmissions().length > 0;
}

/**
 * Get the oldest pending submission
 */
export function getOldestPendingSubmission(): QueuedSubmission | null {
  const pending = getPendingSubmissions();

  if (pending.length === 0) {
    return null;
  }

  return pending.reduce((oldest, current) => {
    return new Date(current.queuedAt) < new Date(oldest.queuedAt) ? current : oldest;
  });
}

/**
 * Retry failed submissions
 */
export function retryFailedSubmissions(): void {
  const queue = getQueue();
  const updated = queue.map(item => {
    if (item.status === 'failed') {
      return {
        ...item,
        status: 'pending' as const,
        error: undefined,
      };
    }
    return item;
  });

  storage.set(QUEUE_KEY, updated);
  console.log('Reset failed submissions to pending');
}

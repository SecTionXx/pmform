'use client';

import { useOffline } from '@/hooks/useOffline';
import { useEffect, useState } from 'react';
import { getQueueStats, hasPendingSubmissions, syncQueue } from '@/lib/offlineQueue';

export function OfflineIndicator() {
  const { isOffline, isOnline } = useOffline();
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Update pending count periodically
  useEffect(() => {
    const updatePendingCount = () => {
      const stats = getQueueStats();
      setPendingCount(stats.pending + stats.failed);
    };

    updatePendingCount();

    // Update every 5 seconds
    const intervalId = setInterval(updatePendingCount, 5000);

    return () => clearInterval(intervalId);
  }, []);

  // Auto-sync when coming back online
  useEffect(() => {
    const attemptSync = async () => {
      if (isOnline && hasPendingSubmissions() && !isSyncing) {
        console.log('Network restored, attempting to sync pending submissions...');
        setIsSyncing(true);

        try {
          const result = await syncQueue();

          if (result.successful > 0) {
            showNotification(
              `ส่งข้อมูลสำเร็จ ${result.successful} รายการ${
                result.failed > 0 ? `, ล้มเหลว ${result.failed} รายการ` : ''
              }`
            );
          } else if (result.failed > 0) {
            showNotification(`ไม่สามารถส่งข้อมูลได้ ${result.failed} รายการ`);
          }

          // Update pending count
          const stats = getQueueStats();
          setPendingCount(stats.pending + stats.failed);
        } catch (error) {
          console.error('Sync error:', error);
        } finally {
          setIsSyncing(false);
        }
      }
    };

    // Delay sync slightly to ensure connection is stable
    const timeoutId = setTimeout(attemptSync, 2000);

    return () => clearTimeout(timeoutId);
  }, [isOnline, isSyncing]);

  const showNotification = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  // Don't show anything if online and no pending submissions
  if (isOnline && pendingCount === 0) {
    return null;
  }

  return (
    <>
      {/* Offline Banner */}
      {isOffline && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white py-3 px-4 shadow-lg z-50 print:hidden">
          <div className="container max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Offline Icon */}
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
                />
              </svg>

              <div>
                <div className="font-semibold">คุณกำลังออฟไลน์</div>
                <div className="text-sm">
                  ข้อมูลจะถูกบันทึกในเครื่องและส่งอัตโนมัติเมื่อกลับมาออนไลน์
                  {pendingCount > 0 && ` (${pendingCount} รายการรอส่ง)`}
                </div>
              </div>
            </div>

            {/* Pulse indicator */}
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      )}

      {/* Syncing Banner */}
      {isOnline && isSyncing && (
        <div className="fixed top-0 left-0 right-0 bg-blue-500 text-white py-3 px-4 shadow-lg z-50 print:hidden">
          <div className="container max-w-4xl mx-auto flex items-center gap-3">
            {/* Syncing Icon */}
            <svg
              className="w-6 h-6 animate-spin"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>

            <div>
              <div className="font-semibold">กำลังส่งข้อมูล...</div>
              <div className="text-sm">กำลังส่งข้อมูลที่รออยู่ไปยังเซิร์ฟเวอร์</div>
            </div>
          </div>
        </div>
      )}

      {/* Pending Items Indicator (when online but have pending) */}
      {isOnline && !isSyncing && pendingCount > 0 && (
        <div className="fixed top-0 left-0 right-0 bg-orange-500 text-white py-3 px-4 shadow-lg z-50 print:hidden">
          <div className="container max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Warning Icon */}
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>

              <div>
                <div className="font-semibold">มีข้อมูลรอส่ง</div>
                <div className="text-sm">
                  มี {pendingCount} รายการที่ยังไม่ได้ส่ง กดเพื่อลองส่งอีกครั้ง
                </div>
              </div>
            </div>

            <button
              onClick={async () => {
                setIsSyncing(true);
                try {
                  const result = await syncQueue();
                  if (result.successful > 0) {
                    showNotification(`ส่งข้อมูลสำเร็จ ${result.successful} รายการ`);
                  }
                  const stats = getQueueStats();
                  setPendingCount(stats.pending + stats.failed);
                } catch (error) {
                  showNotification('ไม่สามารถส่งข้อมูลได้');
                } finally {
                  setIsSyncing(false);
                }
              }}
              className="px-4 py-2 bg-white text-orange-500 font-medium rounded hover:bg-gray-100 transition-colors"
            >
              ส่งอีกครั้ง
            </button>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white py-3 px-6 rounded-lg shadow-lg z-50 print:hidden animate-fade-in">
          <div className="flex items-center gap-3">
            {/* Success Icon */}
            <svg
              className="w-5 h-5 text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </>
  );
}

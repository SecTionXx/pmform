'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { formSchema, FormValues } from '@/lib/formSchema';
import { FormHeader } from '@/components/FormHeader';
import { PreOperationSection } from '@/components/FormSections/PreOperationSection';
import { PostOperationSection } from '@/components/FormSections/PostOperationSection';
import { SignatureSection } from '@/components/FormSections/SignatureSection';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useFormDraft } from '@/hooks/useFormDraft';
import { draftStorage } from '@/lib/storage';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const FORM_ID = 'maintenance-form';

export default function Home() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showDraftPrompt, setShowDraftPrompt] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    getValues,
    watch,
  } = form;

  // Draft management
  const { hasDraft, loadDraft, clearDraft, draftAge } = useFormDraft({
    formId: FORM_ID,
    form,
    onDraftLoaded: () => {
      setShowDraftPrompt(false);
    },
  });

  // Auto-save
  const formData = watch();
  const { lastSaved, isSaving } = useAutoSave({
    data: formData,
    formId: FORM_ID,
    delay: 30000, // Auto-save every 30 seconds
    enabled: !isSubmitting,
  });

  // Check for existing draft on mount
  useEffect(() => {
    if (hasDraft) {
      setShowDraftPrompt(true);
    }
  }, [hasDraft]);

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch('/api/submit-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      }

      // Clear draft after successful submission
      clearDraft();

      // Redirect to success page
      router.push('/success');
    } catch (error) {
      console.error('Submit error:', error);
      setSubmitError(error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    // Import PDF generator dynamically to reduce initial bundle size
    const { generatePDF } = await import('@/lib/pdfGenerator');
    const formData = getValues();
    generatePDF(formData);
  };

  // Format last saved time
  const formatLastSaved = (date: Date | null): string => {
    if (!date) return '';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'เมื่อสักครู่';
    if (minutes === 1) return '1 นาทีที่แล้ว';
    if (minutes < 60) return `${minutes} นาทีที่แล้ว`;

    const hours = Math.floor(minutes / 60);
    if (hours === 1) return '1 ชั่วโมงที่แล้ว';
    return `${hours} ชั่วโมงที่แล้ว`;
  };

  return (
    <main className="min-h-screen py-8 px-4">
      {/* Draft prompt dialog */}
      {showDraftPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              พบแบบฟอร์มที่บันทึกไว้
            </h3>
            <p className="text-gray-600 mb-4">
              คุณมีแบบฟอร์มที่บันทึกไว้ก่อนหน้านี้ ต้องการโหลดข้อมูลหรือไม่?
            </p>
            {draftAge && (
              <p className="text-sm text-gray-500 mb-4">
                บันทึกเมื่อ: {Math.floor(draftAge / 60000)} นาทีที่แล้ว
              </p>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={loadDraft}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
              >
                โหลดข้อมูล
              </button>
              <button
                type="button"
                onClick={() => {
                  clearDraft();
                  setShowDraftPrompt(false);
                }}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded transition-colors"
              >
                เริ่มใหม่
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container max-w-4xl mx-auto bg-white border-2 border-black p-8">
        <FormHeader />

        {/* Auto-save indicator */}
        {lastSaved && (
          <div className="mb-4 flex items-center justify-end gap-2 text-sm text-gray-600 print:hidden">
            {isSaving ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>กำลังบันทึก...</span>
              </>
            ) : (
              <>
                <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>บันทึกแบบร่างอัตโนมัติ: {formatLastSaved(lastSaved)}</span>
              </>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <ErrorBoundary>
            <PreOperationSection register={register} errors={errors} />
          </ErrorBoundary>

          <ErrorBoundary>
            <PostOperationSection register={register} control={control} errors={errors} />
          </ErrorBoundary>

          <ErrorBoundary>
            <SignatureSection />
          </ErrorBoundary>

          {submitError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {submitError}
            </div>
          )}

          <div className="flex gap-4 justify-center flex-wrap print:hidden">
            <button
              type="button"
              onClick={handlePrint}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors"
            >
              พิมพ์แบบฟอร์ม
            </button>

            <button
              type="button"
              onClick={handleDownloadPDF}
              className="px-6 py-3 bg-secondary text-white rounded-lg hover:bg-opacity-90 transition-colors"
            >
              ดาวน์โหลด PDF
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { formSchema, FormValues } from '@/lib/formSchema';
import { FormHeader } from '@/components/FormHeader';
import { PreOperationSection } from '@/components/FormSections/PreOperationSection';
import { PostOperationSection } from '@/components/FormSections/PostOperationSection';
import { SignatureSection } from '@/components/FormSections/SignatureSection';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
  });

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

  return (
    <main className="min-h-screen py-8 px-4">
      <div className="container max-w-4xl mx-auto bg-white border-2 border-black p-8">
        <FormHeader />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <PreOperationSection register={register} errors={errors} />
          <PostOperationSection register={register} control={control} errors={errors} />
          <SignatureSection />

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

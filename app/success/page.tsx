'use client';

import Link from 'next/link';

export default function SuccessPage() {
  return (
    <main className="min-h-screen py-8 px-4 flex items-center justify-center">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <svg
            className="mx-auto h-16 w-16 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          บันทึกข้อมูลสำเร็จ
        </h1>

        <p className="text-gray-600 mb-8">
          ข้อมูลแบบฟอร์มการตรวจสอบและล้างเครื่องปรับอากาศได้ถูกบันทึกเรียบร้อยแล้ว
        </p>

        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors"
          >
            กรอกแบบฟอร์มใหม่
          </Link>
        </div>
      </div>
    </main>
  );
}

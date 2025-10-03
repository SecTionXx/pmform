import React from 'react';

export const SignatureSection: React.FC = () => {
  return (
    <div className="mt-8 pt-6 border-t-2 border-gray-200">
      <div className="text-center">
        <div className="inline-block">
          <div className="w-80 border-t border-gray-800 pt-2 mt-16">
            <p className="text-gray-700">ชื่อ-นามสกุล ผู้เข้าดำเนินการ (ตัวบรรจง)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

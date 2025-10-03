import React from 'react';

export const FormHeader: React.FC = () => {
  return (
    <div className="text-center mb-8 pb-6 border-b-4 border-primary">
      <h1 className="text-primary text-2xl font-bold mb-2">
        แบบฟอร์มการตรวจสอบการเข้าล้างเครื่องปรับอากาศ
      </h1>
      <h2 className="text-gray-600 text-lg font-normal">
        ภายในห้อง ATM/CDM ธนาคารไทยพาณิชย์ จำกัด (มหาชน)
      </h2>
    </div>
  );
};

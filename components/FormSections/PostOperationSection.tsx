'use client';

import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { FormValues } from '@/lib/formSchema';
import { TextInput } from '../FormFields/TextInput';
import { TextArea } from '../FormFields/TextArea';
import { WORK_PROCEDURES, TEMPERATURE_SETTING, MAINTENANCE_INTERVAL } from '@/utils/constants';

interface PostOperationSectionProps {
  register: UseFormRegister<FormValues>;
  errors: FieldErrors<FormValues>;
}

export const PostOperationSection: React.FC<PostOperationSectionProps> = ({
  register,
  errors,
}) => {
  return (
    <div className="form-section-bordered">
      <div className="yellow-section-header mb-4">
        บันทึกข้อมูล หลังดำเนินการ
      </div>

      {/* Work Procedures */}
      <div className="border border-black p-4 mb-6">
        <h4 className="font-bold mb-3"># รายละเอียดการทำงาน</h4>
        <div className="space-y-2">
          {WORK_PROCEDURES.map((procedure, index) => (
            <div key={index} className="flex items-start gap-3">
              <input type="checkbox" className="mt-1" />
              <span className="leading-relaxed">{procedure}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Refrigerant Measurements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block mb-2 font-normal">แรงดันน้ำยาแอร์ปกติ:</label>
          <TextInput
            name="refrigerant_pressure"
            register={register}
            error={errors.refrigerant_pressure}
            placeholder="กรอกแรงดัน"
          />
        </div>
        <div>
          <label className="block mb-2 font-normal">เติมน้ำยาแอร์:</label>
          <TextInput
            name="refrigerant_added"
            register={register}
            error={errors.refrigerant_added}
            placeholder="กรอกปริมาณที่เติม"
          />
        </div>
      </div>

      {/* Temperature Setting Info */}
      <div className="bg-blue-50 p-3 rounded text-sm text-gray-700 mb-6">
        {TEMPERATURE_SETTING}
      </div>

      {/* Repair Work Detail */}
      <div className="mb-6">
        <label className="block mb-2 font-normal">รายละเอียดของการซ่อมแซม:</label>
        <TextArea
          name="repair_work_detail"
          register={register}
          error={errors.repair_work_detail}
          placeholder="ระบุรายละเอียด (ถ้ามี)..."
          rows={4}
        />
      </div>

      {/* Suggestions */}
      <div className="mb-6">
        <label className="block mb-2 font-normal">ข้อเสนอแนะ / อื่น ๆ:</label>
        <TextArea
          name="suggestions"
          register={register}
          error={errors.suggestions}
          placeholder="ระบุข้อเสนอแนะ (ถ้ามี)..."
          rows={4}
        />
      </div>

      {/* Next Maintenance */}
      <div className="mb-4">
        <label className="block mb-3 font-normal">
          กำหนดการเข้าล้างแอร์ครั้งต่อไป ({MAINTENANCE_INTERVAL}):
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 text-sm">เดือน:</label>
            <TextInput
              name="next_month"
              register={register}
              error={errors.next_month}
              placeholder="กรอกเดือน"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm">ปี:</label>
            <TextInput
              name="next_year"
              register={register}
              error={errors.next_year}
              placeholder="กรอกปี (พ.ศ.)"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

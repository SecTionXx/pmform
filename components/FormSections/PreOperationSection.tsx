'use client';

import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { FormValues } from '@/lib/formSchema';
import { TextInput } from '../FormFields/TextInput';
import { TextArea } from '../FormFields/TextArea';
import { RadioGroup } from '../FormFields/RadioGroup';
import {
  AC_BRANDS,
  BTU_SIZES,
  STATUS_OPTIONS,
  TIMER_STATUS_OPTIONS,
  ELECTRIC_STATUS_OPTIONS,
  METER_OPTIONS,
  BANK_APPROVAL_OPTIONS,
  TIMER_INFO,
  ELECTRICAL_STANDARDS,
} from '@/utils/constants';

interface PreOperationSectionProps {
  register: UseFormRegister<FormValues>;
  errors: FieldErrors<FormValues>;
}

export const PreOperationSection: React.FC<PreOperationSectionProps> = ({
  register,
  errors,
}) => {
  return (
    <div className="form-section-bordered">
      <div className="yellow-section-header mb-4">
        บันทึกข้อมูล ก่อนดำเนินการ (CHECK LIST)
      </div>

      {/* Date and Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="flex items-start gap-3">
          <label className="font-bold text-gray-700 min-w-[60px] pt-2">วันที่:</label>
          <TextInput
            name="date"
            type="date"
            register={register}
            error={errors.date}
          />
        </div>
        <div className="flex items-start gap-3">
          <label className="font-bold text-gray-700 min-w-[60px] pt-2">เวลา:</label>
          <TextInput
            name="time"
            type="time"
            register={register}
            error={errors.time}
          />
        </div>
      </div>

      {/* Question 1: Location */}
      <div className="mb-6">
        <div className="flex items-start gap-3">
          <span className="font-bold text-gray-700 min-w-[30px]">1.</span>
          <div className="flex-1">
            <label className="block mb-2 font-normal">ชื่อสถานที่ติดตั้งเครื่อง ATM/CDM</label>
            <TextInput
              name="location"
              register={register}
              error={errors.location}
              placeholder="กรอกชื่อสถานที่"
            />
          </div>
        </div>
      </div>

      {/* Question 2: Machine Number */}
      <div className="mb-6">
        <div className="flex items-start gap-3">
          <span className="font-bold text-gray-700 min-w-[30px]">2.</span>
          <div className="flex-1">
            <label className="block mb-2 font-normal">หมายเลขเครื่อง ATM/CDM (เป็นตัวเลข 4 หลัก)</label>
            <TextInput
              name="machine_number"
              register={register}
              error={errors.machine_number}
              placeholder="กรอกหมายเลข 4 หลัก"
              maxLength={4}
              className="max-w-xs"
            />
          </div>
        </div>
      </div>

      {/* Question 3: AC Brand */}
      <div className="mb-6">
        <div className="flex items-start gap-3">
          <span className="font-bold text-gray-700 min-w-[30px]">3.</span>
          <div className="flex-1">
            <label className="block mb-2 font-normal">เครื่องปรับอากาศยี่ห้อ</label>
            <RadioGroup
              name="ac_brand"
              register={register}
              error={errors.ac_brand}
              options={AC_BRANDS}
              hasOtherOption={true}
              otherFieldName="brand_other_text"
            />
            {errors.brand_other_text && (
              <p className="mt-1 text-sm text-red-600">{errors.brand_other_text.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Question 4: BTU */}
      <div className="mb-6">
        <div className="flex items-start gap-3">
          <span className="font-bold text-gray-700 min-w-[30px]">4.</span>
          <div className="flex-1">
            <label className="block mb-2 font-normal">ขนาด BTU</label>
            <RadioGroup
              name="btu"
              register={register}
              error={errors.btu}
              options={BTU_SIZES}
              hasOtherOption={true}
              otherFieldName="btu_other_text"
            />
            {errors.btu_other_text && (
              <p className="mt-1 text-sm text-red-600">{errors.btu_other_text.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Question 5: AC Status */}
      <div className="mb-6">
        <div className="flex items-start gap-3">
          <span className="font-bold text-gray-700 min-w-[30px]">5.</span>
          <div className="flex-1">
            <label className="block mb-2 font-normal">การทำงานของแอร์</label>
            <RadioGroup
              name="ac_status"
              register={register}
              error={errors.ac_status}
              options={STATUS_OPTIONS}
            />
            <div className="mt-2">
              <TextArea
                name="ac_status_detail"
                register={register}
                error={errors.ac_status_detail}
                placeholder="โปรดระบุรายละเอียด (กรณีไม่ปกติ)"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Question 6: Timer Status */}
      <div className="mb-6">
        <div className="flex items-start gap-3">
          <span className="font-bold text-gray-700 min-w-[30px]">6.</span>
          <div className="flex-1">
            <label className="block mb-2 font-normal">การทำงานของ TIMER แอร์</label>
            <RadioGroup
              name="timer_status"
              register={register}
              error={errors.timer_status}
              options={TIMER_STATUS_OPTIONS}
            />
            <div className="mt-2 bg-blue-50 p-3 rounded text-sm text-gray-700">
              {TIMER_INFO}
            </div>
            <div className="mt-2">
              <TextArea
                name="timer_status_detail"
                register={register}
                error={errors.timer_status_detail}
                placeholder="โปรดระบุรายละเอียด (กรณีไม่ปกติ)"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Question 7: Electrical System */}
      <div className="mb-6">
        <div className="flex items-start gap-3">
          <span className="font-bold text-gray-700 min-w-[30px]">7.</span>
          <div className="flex-1">
            <label className="block mb-2 font-normal">ตรวจวัดระบบไฟฟ้าในห้อง</label>
            <RadioGroup
              name="electric_status"
              register={register}
              error={errors.electric_status}
              options={ELECTRIC_STATUS_OPTIONS}
            />
            <div className="mt-2 bg-blue-50 p-3 rounded text-sm text-gray-700">
              มาตรฐานธนาคาร: L+N = {ELECTRICAL_STANDARDS.LN}, L+G = {ELECTRICAL_STANDARDS.LG},
              G+N = {ELECTRICAL_STANDARDS.GN}, G = {ELECTRICAL_STANDARDS.G}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <TextInput
                name="ln_voltage"
                register={register}
                error={errors.ln_voltage}
                placeholder="L+N = _____ V"
              />
              <TextInput
                name="lg_voltage"
                register={register}
                error={errors.lg_voltage}
                placeholder="L+G = _____ V"
              />
              <TextInput
                name="gn_voltage"
                register={register}
                error={errors.gn_voltage}
                placeholder="G+N = _____ V"
              />
              <TextInput
                name="g_ohm"
                register={register}
                error={errors.g_ohm}
                placeholder="G = _____ โอห์ม"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Question 8: Meter */}
      <div className="mb-6">
        <div className="flex items-start gap-3">
          <span className="font-bold text-gray-700 min-w-[30px]">8.</span>
          <div className="flex-1">
            <label className="block mb-2 font-normal">จดเลขที่ของมิเตอร์ไฟฟ้าที่ใช้กับห้อง ATM/CDM</label>
            <RadioGroup
              name="meter"
              register={register}
              error={errors.meter}
              options={METER_OPTIONS}
              hasOtherOption={true}
              otherFieldName="meter_number"
            />
            {errors.meter_number && (
              <p className="mt-1 text-sm text-red-600">{errors.meter_number.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Question 9: Repair Details */}
      <div className="mb-6">
        <div className="flex items-start gap-3">
          <span className="font-bold text-gray-700 min-w-[30px]">9.</span>
          <div className="flex-1">
            <label className="block mb-2 font-normal">
              กรณีเครื่องปรับอากาศเสีย (ให้ระบุรายละเอียดที่จะต้องซ่อมแซมพร้อมกับประเมินราคาค่าใช้จ่าย)
            </label>
            <TextArea
              name="repair_details"
              register={register}
              error={errors.repair_details}
              placeholder="ระบุรายละเอียด..."
              rows={4}
            />
            <div className="mt-3">
              <label className="block mb-2 font-normal">ยังไม่สามารถดำเนินการได้ เนื่องจาก:</label>
              <TextArea
                name="cannot_proceed"
                register={register}
                error={errors.cannot_proceed}
                placeholder="ระบุเหตุผล..."
                rows={3}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bank Approval */}
      <div className="mt-6 p-4 bg-white rounded">
        <h4 className="font-bold mb-3">ความเห็นของธนาคาร:</h4>
        <RadioGroup
          name="bank_approval"
          register={register}
          error={errors.bank_approval}
          options={BANK_APPROVAL_OPTIONS}
          hasOtherOption={true}
          otherFieldName="not_approved_reason"
        />
        {errors.not_approved_reason && (
          <p className="mt-1 text-sm text-red-600">{errors.not_approved_reason.message}</p>
        )}
      </div>
    </div>
  );
};

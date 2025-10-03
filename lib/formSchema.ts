import { z } from 'zod';

export const formSchema = z.object({
  // Basic Information
  date: z.string().min(1, 'กรุณาเลือกวันที่'),
  time: z.string().min(1, 'กรุณาเลือกเวลา'),
  location: z.string().min(1, 'กรุณากรอกชื่อสถานที่'),
  machine_number: z.string()
    .min(4, 'หมายเลขเครื่องต้องเป็น 4 หลัก')
    .max(4, 'หมายเลขเครื่องต้องเป็น 4 หลัก')
    .regex(/^\d{4}$/, 'กรุณากรอกตัวเลข 4 หลัก'),

  // AC Information
  ac_brand: z.enum(['daikin', 'carrier', 'other'], {
    message: 'กรุณาเลือกยี่ห้อเครื่องปรับอากาศ',
  }),
  brand_other_text: z.string().optional(),
  btu: z.enum(['9000', '12000', 'other'], {
    message: 'กรุณาเลือกขนาด BTU',
  }),
  btu_other_text: z.string().optional(),

  // Status Checks
  ac_status: z.enum(['normal', 'abnormal'], {
    message: 'กรุณาเลือกสถานะการทำงานของแอร์',
  }),
  ac_status_detail: z.string().optional(),
  timer_status: z.enum(['normal', 'abnormal'], {
    message: 'กรุณาเลือกสถานะการทำงานของ TIMER',
  }),
  timer_status_detail: z.string().optional(),

  // Electrical Measurements
  electric_status: z.enum(['normal', 'abnormal'], {
    message: 'กรุณาเลือกสถานะระบบไฟฟ้า',
  }),
  ln_voltage: z.string().min(1, 'กรุณากรอกค่า L+N'),
  lg_voltage: z.string().min(1, 'กรุณากรอกค่า L+G'),
  gn_voltage: z.string().min(1, 'กรุณากรอกค่า G+N'),
  g_ohm: z.string().min(1, 'กรุณากรอกค่า G'),

  // Meter Information
  meter: z.enum(['has', 'none', 'location', 'not_requested'], {
    message: 'กรุณาเลือกประเภทมิเตอร์ไฟฟ้า',
  }),
  meter_number: z.string().optional(),

  // Repair Information
  repair_details: z.string().optional(),
  cannot_proceed: z.string().optional(),

  // Bank Approval
  bank_approval: z.enum(['approved', 'not_approved'], {
    message: 'กรุณาเลือกความเห็นของธนาคาร',
  }),
  not_approved_reason: z.string().optional(),

  // Post-Operation
  work_procedures: z.object({
    step1: z.boolean(),
    step2: z.boolean(),
    step3: z.boolean(),
    step4: z.boolean(),
    step5: z.boolean(),
    step6: z.boolean(),
  }).optional(),
  refrigerant_pressure: z.string().min(1, 'กรุณากรอกแรงดันน้ำยาแอร์'),
  refrigerant_added: z.string().min(1, 'กรุณากรอกปริมาณน้ำยาที่เติม'),
  repair_work_detail: z.string().optional(),
  suggestions: z.string().optional(),

  // Next Maintenance
  next_month: z.string().min(1, 'กรุณากรอกเดือนที่เข้าล้างครั้งต่อไป'),
  next_year: z.string().min(1, 'กรุณากรอกปีที่เข้าล้างครั้งต่อไป'),
})
.refine((data) => {
  // If AC brand is "other", require brand_other_text
  if (data.ac_brand === 'other' && !data.brand_other_text) {
    return false;
  }
  return true;
}, {
  message: 'กรุณาระบุยี่ห้อเครื่องปรับอากาศ',
  path: ['brand_other_text'],
})
.refine((data) => {
  // If BTU is "other", require btu_other_text
  if (data.btu === 'other' && !data.btu_other_text) {
    return false;
  }
  return true;
}, {
  message: 'กรุณาระบุขนาด BTU',
  path: ['btu_other_text'],
})
.refine((data) => {
  // If AC status is abnormal, require detail
  if (data.ac_status === 'abnormal' && !data.ac_status_detail) {
    return false;
  }
  return true;
}, {
  message: 'กรุณาระบุรายละเอียดความผิดปกติ',
  path: ['ac_status_detail'],
})
.refine((data) => {
  // If timer status is abnormal, require detail
  if (data.timer_status === 'abnormal' && !data.timer_status_detail) {
    return false;
  }
  return true;
}, {
  message: 'กรุณาระบุรายละเอียดความผิดปกติ',
  path: ['timer_status_detail'],
})
.refine((data) => {
  // If meter is "has", require meter_number
  if (data.meter === 'has' && !data.meter_number) {
    return false;
  }
  return true;
}, {
  message: 'กรุณาระบุหมายเลขมิเตอร์',
  path: ['meter_number'],
})
.refine((data) => {
  // If bank approval is not approved, require reason
  if (data.bank_approval === 'not_approved' && !data.not_approved_reason) {
    return false;
  }
  return true;
}, {
  message: 'กรุณาระบุเหตุผลที่ไม่อนุมัติ',
  path: ['not_approved_reason'],
});

export type FormValues = z.infer<typeof formSchema>;

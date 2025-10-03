export const AC_BRANDS = [
  { value: 'daikin', label: 'DAIKIN' },
  { value: 'carrier', label: 'CARRIER' },
  { value: 'other', label: 'อื่น ๆ' },
] as const;

export const BTU_SIZES = [
  { value: '9000', label: '9,000 BTU' },
  { value: '12000', label: '12,000 BTU' },
  { value: 'other', label: 'อื่น ๆ' },
] as const;

export const STATUS_OPTIONS = [
  { value: 'normal', label: 'ทำงานปกติ' },
  { value: 'abnormal', label: 'ไม่ปกติ' },
] as const;

export const TIMER_STATUS_OPTIONS = [
  { value: 'normal', label: 'ทำงานปกติ' },
  { value: 'abnormal', label: 'ไม่ปกติ' },
] as const;

export const ELECTRIC_STATUS_OPTIONS = [
  { value: 'normal', label: 'ปกติ' },
  { value: 'abnormal', label: 'ไม่ปกติ' },
] as const;

export const METER_OPTIONS = [
  { value: 'has', label: 'มี (ระบุหมายเลข)' },
  { value: 'none', label: 'ไม่มี' },
  { value: 'location', label: 'ใช้ไฟฟ้าของสถานที่' },
  { value: 'not_requested', label: 'ไม่ได้ขอมิเตอร์ใหม่' },
] as const;

export const BANK_APPROVAL_OPTIONS = [
  { value: 'approved', label: 'อนุมัติให้ดำเนินการ' },
  { value: 'not_approved', label: 'ไม่อนุมัติ เนื่องจาก' },
] as const;

export const WORK_PROCEDURES = [
  'ก่อนการล้างแอร์ ใช้ผ้าพลาสติกคลุมด้านหลังของเครื่อง ATM/CDM (ให้เปิดใช้งานได้) และอุปกรณ์ไฟฟ้าทั้งหมด',
  'ถอดหน้ากากแอร์ และแผ่นกรองอากาศล้าง',
  'ฉีดน้ำล้าง ชุดคอยล์เย็น, ท่อน้ำทิ้งและถาดรองน้ำ',
  'ฉีดน้ำล้างชุดคอยล์ร้อน',
  'เป่าลมแห้ง ประกอบเข้าที่เดิม',
  'เก็บผ้าพลาสติกคลุมอุปกรณ์ต่าง ๆ ออกให้เรียบร้อย และเปิดแอร์ให้ทำงานตามปกติ',
] as const;

export const ELECTRICAL_STANDARDS = {
  LN: '220V',
  LG: '220V',
  GN: '0.4V',
  G: '5 โอห์ม',
} as const;

export const TIMER_INFO = 'ปกติให้ตั้งเปิดแอร์เวลา 8.00 น. และตั้งปิดแอร์เวลา 18.00 น.';

export const TEMPERATURE_SETTING = 'ตั้งอุณหภูมิไว้ที่ 25 องศา, ตั้ง TIMER เปิดแอร์เวลา 8.00 น. ปิดแอร์เวลา 18.00 น.';

export const MAINTENANCE_INTERVAL = 'ล้างแอร์ 6 เดือนต่อครั้ง';

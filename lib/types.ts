export interface FormData {
  // Basic Information
  date: string;
  time: string;
  location: string;
  machine_number: string;

  // AC Information
  ac_brand: 'daikin' | 'carrier' | 'other';
  brand_other_text?: string;
  btu: '9000' | '12000' | 'other';
  btu_other_text?: string;

  // Status Checks
  ac_status: 'normal' | 'abnormal';
  ac_status_detail?: string;
  timer_status: 'normal' | 'abnormal';
  timer_status_detail?: string;

  // Electrical Measurements
  electric_status: 'normal' | 'abnormal';
  ln_voltage: string;
  lg_voltage: string;
  gn_voltage: string;
  g_ohm: string;

  // Meter Information
  meter: 'has' | 'none' | 'location' | 'not_requested';
  meter_number?: string;

  // Repair Information
  repair_details?: string;
  cannot_proceed?: string;

  // Bank Approval
  bank_approval: 'approved' | 'not_approved';
  not_approved_reason?: string;

  // Post-Operation
  refrigerant_pressure: string;
  refrigerant_added: string;
  repair_work_detail?: string;
  suggestions?: string;

  // Next Maintenance
  next_month: string;
  next_year: string;
}

export interface GoogleSheetsRow extends FormData {
  submission_id: string;
  timestamp: string;
}

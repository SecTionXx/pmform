import { formSchema, FormValues } from '@/lib/formSchema';

describe('formSchema validation', () => {
  const validFormData: FormValues = {
    date: '2024-01-15',
    time: '14:30',
    location: 'Test Location',
    machine_number: '1234',
    ac_brand: 'daikin',
    brand_other_text: '',
    btu: '9000',
    btu_other_text: '',
    ac_status: 'normal',
    ac_status_detail: '',
    timer_status: 'normal',
    timer_status_detail: '',
    electric_status: 'normal',
    ln_voltage: '220',
    lg_voltage: '220',
    gn_voltage: '0',
    g_ohm: '5',
    meter: 'has',
    meter_number: '123456',
    repair_details: '',
    cannot_proceed: '',
    bank_approval: 'approved',
    not_approved_reason: '',
    refrigerant_pressure: '65',
    refrigerant_added: '0.5',
    repair_work_detail: '',
    suggestions: '',
    next_month: '2',
    next_year: '2024',
  };

  describe('Required fields validation', () => {
    test('should validate all required fields are present', () => {
      const result = formSchema.safeParse(validFormData);
      expect(result.success).toBe(true);
    });

    test('should fail when date is missing', () => {
      const invalidData = { ...validFormData, date: '' };
      const result = formSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('กรุณาเลือกวันที่');
      }
    });

    test('should fail when time is missing', () => {
      const invalidData = { ...validFormData, time: '' };
      const result = formSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('กรุณาเลือกเวลา');
      }
    });

    test('should fail when location is missing', () => {
      const invalidData = { ...validFormData, location: '' };
      const result = formSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('กรุณากรอกชื่อสถานที่');
      }
    });
  });

  describe('Machine number validation', () => {
    test('should accept 4-digit machine number', () => {
      const result = formSchema.safeParse(validFormData);
      expect(result.success).toBe(true);
    });

    test('should fail when machine number is less than 4 digits', () => {
      const invalidData = { ...validFormData, machine_number: '123' };
      const result = formSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('หมายเลขเครื่องต้องเป็น 4 หลัก');
      }
    });

    test('should fail when machine number is more than 4 digits', () => {
      const invalidData = { ...validFormData, machine_number: '12345' };
      const result = formSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('หมายเลขเครื่องต้องเป็น 4 หลัก');
      }
    });

    test('should fail when machine number contains non-numeric characters', () => {
      const invalidData = { ...validFormData, machine_number: 'abcd' };
      const result = formSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('กรุณากรอกตัวเลข 4 หลัก');
      }
    });
  });

  describe('AC brand conditional validation', () => {
    test('should accept daikin without other text', () => {
      const data = { ...validFormData, ac_brand: 'daikin' as const, brand_other_text: '' };
      const result = formSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    test('should accept carrier without other text', () => {
      const data = { ...validFormData, ac_brand: 'carrier' as const, brand_other_text: '' };
      const result = formSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    test('should fail when ac_brand is "other" but brand_other_text is empty', () => {
      const invalidData = { ...validFormData, ac_brand: 'other' as const, brand_other_text: '' };
      const result = formSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('กรุณาระบุยี่ห้อเครื่องปรับอากาศ');
        expect(result.error.issues[0].path).toContain('brand_other_text');
      }
    });

    test('should pass when ac_brand is "other" and brand_other_text is provided', () => {
      const validData = { ...validFormData, ac_brand: 'other' as const, brand_other_text: 'Mitsubishi' };
      const result = formSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('BTU conditional validation', () => {
    test('should accept standard BTU values without other text', () => {
      const data = { ...validFormData, btu: '12000' as const, btu_other_text: '' };
      const result = formSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    test('should fail when btu is "other" but btu_other_text is empty', () => {
      const invalidData = { ...validFormData, btu: 'other' as const, btu_other_text: '' };
      const result = formSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('กรุณาระบุขนาด BTU');
        expect(result.error.issues[0].path).toContain('btu_other_text');
      }
    });

    test('should pass when btu is "other" and btu_other_text is provided', () => {
      const validData = { ...validFormData, btu: 'other' as const, btu_other_text: '18000' };
      const result = formSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('AC status conditional validation', () => {
    test('should accept normal status without detail', () => {
      const data = { ...validFormData, ac_status: 'normal' as const, ac_status_detail: '' };
      const result = formSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    test('should fail when ac_status is "abnormal" but detail is empty', () => {
      const invalidData = { ...validFormData, ac_status: 'abnormal' as const, ac_status_detail: '' };
      const result = formSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('กรุณาระบุรายละเอียดความผิดปกติ');
        expect(result.error.issues[0].path).toContain('ac_status_detail');
      }
    });

    test('should pass when ac_status is "abnormal" and detail is provided', () => {
      const validData = { ...validFormData, ac_status: 'abnormal' as const, ac_status_detail: 'Not cooling properly' };
      const result = formSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('Timer status conditional validation', () => {
    test('should accept normal timer status without detail', () => {
      const data = { ...validFormData, timer_status: 'normal' as const, timer_status_detail: '' };
      const result = formSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    test('should fail when timer_status is "abnormal" but detail is empty', () => {
      const invalidData = { ...validFormData, timer_status: 'abnormal' as const, timer_status_detail: '' };
      const result = formSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('กรุณาระบุรายละเอียดความผิดปกติ');
        expect(result.error.issues[0].path).toContain('timer_status_detail');
      }
    });

    test('should pass when timer_status is "abnormal" and detail is provided', () => {
      const validData = { ...validFormData, timer_status: 'abnormal' as const, timer_status_detail: 'Timer not working' };
      const result = formSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('Electrical measurements validation', () => {
    test('should require all voltage measurements', () => {
      const result = formSchema.safeParse(validFormData);
      expect(result.success).toBe(true);
    });

    test('should fail when ln_voltage is missing', () => {
      const invalidData = { ...validFormData, ln_voltage: '' };
      const result = formSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('กรุณากรอกค่า L+N');
      }
    });

    test('should fail when lg_voltage is missing', () => {
      const invalidData = { ...validFormData, lg_voltage: '' };
      const result = formSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('กรุณากรอกค่า L+G');
      }
    });

    test('should fail when gn_voltage is missing', () => {
      const invalidData = { ...validFormData, gn_voltage: '' };
      const result = formSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('กรุณากรอกค่า G+N');
      }
    });

    test('should fail when g_ohm is missing', () => {
      const invalidData = { ...validFormData, g_ohm: '' };
      const result = formSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('กรุณากรอกค่า G');
      }
    });
  });

  describe('Meter conditional validation', () => {
    test('should accept meter "has" with meter_number', () => {
      const data = { ...validFormData, meter: 'has' as const, meter_number: '123456' };
      const result = formSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    test('should accept meter "none" without meter_number', () => {
      const data = { ...validFormData, meter: 'none' as const, meter_number: '' };
      const result = formSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    test('should fail when meter is "has" but meter_number is empty', () => {
      const invalidData = { ...validFormData, meter: 'has' as const, meter_number: '' };
      const result = formSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('กรุณาระบุหมายเลขมิเตอร์');
        expect(result.error.issues[0].path).toContain('meter_number');
      }
    });
  });

  describe('Bank approval conditional validation', () => {
    test('should accept approved without reason', () => {
      const data = { ...validFormData, bank_approval: 'approved' as const, not_approved_reason: '' };
      const result = formSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    test('should fail when bank_approval is "not_approved" but reason is empty', () => {
      const invalidData = { ...validFormData, bank_approval: 'not_approved' as const, not_approved_reason: '' };
      const result = formSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('กรุณาระบุเหตุผลที่ไม่อนุมัติ');
        expect(result.error.issues[0].path).toContain('not_approved_reason');
      }
    });

    test('should pass when bank_approval is "not_approved" and reason is provided', () => {
      const validData = { ...validFormData, bank_approval: 'not_approved' as const, not_approved_reason: 'Budget constraints' };
      const result = formSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('Post-operation validation', () => {
    test('should require refrigerant_pressure', () => {
      const invalidData = { ...validFormData, refrigerant_pressure: '' };
      const result = formSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('กรุณากรอกแรงดันน้ำยาแอร์');
      }
    });

    test('should require refrigerant_added', () => {
      const invalidData = { ...validFormData, refrigerant_added: '' };
      const result = formSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('กรุณากรอกปริมาณน้ำยาที่เติม');
      }
    });
  });

  describe('Next maintenance validation', () => {
    test('should require next_month', () => {
      const invalidData = { ...validFormData, next_month: '' };
      const result = formSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('กรุณากรอกเดือนที่เข้าล้างครั้งต่อไป');
      }
    });

    test('should require next_year', () => {
      const invalidData = { ...validFormData, next_year: '' };
      const result = formSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('กรุณากรอกปีที่เข้าล้างครั้งต่อไป');
      }
    });
  });
});

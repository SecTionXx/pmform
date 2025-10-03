import { google } from 'googleapis';
import { FormValues } from './formSchema';

export async function appendToGoogleSheet(formData: FormValues) {
  try {
    // Initialize Google Sheets API
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
    const sheetName = process.env.GOOGLE_SHEET_NAME || 'Sheet1';

    // Generate submission ID and timestamp
    const submissionId = `ATM-${Date.now()}`;
    const timestamp = new Date().toISOString();

    // Map form data to values
    const brandText = formData.ac_brand === 'daikin' ? 'DAIKIN' :
                      formData.ac_brand === 'carrier' ? 'CARRIER' :
                      (formData.brand_other_text || 'อื่นๆ');

    const btuText = formData.btu === '9000' ? '9,000 BTU' :
                    formData.btu === '12000' ? '12,000 BTU' :
                    (formData.btu_other_text || 'อื่นๆ');

    const acStatusText = formData.ac_status === 'normal' ? 'ทำงานปกติ' : 'ไม่ปกติ';
    const timerStatusText = formData.timer_status === 'normal' ? 'ทำงานปกติ' : 'ไม่ปกติ';
    const electricStatusText = formData.electric_status === 'normal' ? 'ปกติ' : 'ไม่ปกติ';

    let meterText = '';
    switch (formData.meter) {
      case 'has':
        meterText = formData.meter_number ? `มี (${formData.meter_number})` : 'มี';
        break;
      case 'none':
        meterText = 'ไม่มี';
        break;
      case 'location':
        meterText = 'ใช้ไฟฟ้าของสถานที่';
        break;
      case 'not_requested':
        meterText = 'ไม่ได้ขอมิเตอร์ใหม่';
        break;
    }

    const bankApprovalText = formData.bank_approval === 'approved' ? 'อนุมัติให้ดำเนินการ' : 'ไม่อนุมัติ';

    // Prepare row data
    const values = [
      [
        submissionId,
        timestamp,
        formData.date,
        formData.time,
        formData.location,
        formData.machine_number,
        brandText,
        btuText,
        acStatusText,
        formData.ac_status_detail || '',
        timerStatusText,
        formData.timer_status_detail || '',
        electricStatusText,
        formData.ln_voltage,
        formData.lg_voltage,
        formData.gn_voltage,
        formData.g_ohm,
        meterText,
        formData.repair_details || '',
        formData.cannot_proceed || '',
        bankApprovalText,
        formData.not_approved_reason || '',
        formData.refrigerant_pressure,
        formData.refrigerant_added,
        formData.repair_work_detail || '',
        formData.suggestions || '',
        formData.next_month,
        formData.next_year,
      ],
    ];

    // Append to sheet
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A:AB`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values,
      },
    });

    return {
      success: true,
      submissionId,
      updatedRange: response.data.updates?.updatedRange,
    };
  } catch (error) {
    console.error('Google Sheets API Error:', error);
    throw new Error('Failed to save data to Google Sheets');
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { formSchema } from '@/lib/formSchema';
import { appendToGoogleSheet } from '@/lib/googleSheets';
import { sanitizeFormData } from '@/lib/sanitize';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Sanitize input data (XSS prevention)
    const { sanitized, warnings } = sanitizeFormData(body);

    // Log warnings if suspicious content detected
    if (warnings.length > 0) {
      console.warn('Input sanitization warnings:', warnings);
    }

    // Validate form data with Zod
    const validatedData = formSchema.parse(sanitized);

    // Save to Google Sheets
    const result = await appendToGoogleSheet(validatedData);

    return NextResponse.json({
      success: true,
      submissionId: result.submissionId,
      message: 'บันทึกข้อมูลสำเร็จ',
    });
  } catch (error: any) {
    console.error('Submit form error:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        {
          success: false,
          message: 'ข้อมูลไม่ถูกต้อง',
          errors: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล',
      },
      { status: 500 }
    );
  }
}

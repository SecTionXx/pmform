import { NextRequest, NextResponse } from 'next/server';
import { formSchema } from '@/lib/formSchema';
import { appendToGoogleSheet } from '@/lib/googleSheets';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate form data
    const validatedData = formSchema.parse(body);

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

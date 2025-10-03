import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { FormValues } from './formSchema';

export async function generatePDF(data: FormValues) {
  try {
    // Get the form container element
    const formElement = document.querySelector('.container') as HTMLElement;

    if (!formElement) {
      throw new Error('Form element not found');
    }

    // Temporarily hide buttons for PDF
    const buttons = formElement.querySelectorAll('button');
    buttons.forEach(btn => (btn as HTMLElement).style.display = 'none');

    // Convert HTML to canvas with Thai font support
    const canvas = await html2canvas(formElement, {
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: formElement.scrollWidth,
      height: formElement.scrollHeight,
      windowWidth: formElement.scrollWidth,
      windowHeight: formElement.scrollHeight,
    } as any);

    // Show buttons again
    buttons.forEach(btn => (btn as HTMLElement).style.display = '');

    // Create PDF from canvas
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

    // Save the PDF
    const filename = `ATM_CDM_Form_${data.machine_number || 'new'}_${new Date().getTime()}.pdf`;
    pdf.save(filename);
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('เกิดข้อผิดพลาดในการสร้าง PDF กรุณาลองใหม่อีกครั้ง');
  }
}

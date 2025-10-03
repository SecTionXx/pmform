# แบบฟอร์มตรวจสอบและล้างแอร์ห้อง ATM/CDM

Web application สำหรับบันทึกข้อมูลการตรวจสอบและล้างเครื่องปรับอากาศภายในห้อง ATM/CDM ธนาคารไทยพาณิชย์

## 🚀 Features

- ✅ แบบฟอร์มออนไลน์สำหรับบันทึกข้อมูลการตรวจสอบและล้างแอร์
- ✅ บันทึกข้อมูลลง Google Sheets อัตโนมัติ
- ✅ ดาวน์โหลด PDF พร้อมรองรับภาษาไทย
- ✅ พิมพ์แบบฟอร์มได้โดยตรง
- ✅ การตรวจสอบข้อมูลแบบ Real-time
- ✅ Responsive Design รองรับทุกอุปกรณ์

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS
- **Form**: React Hook Form + Zod validation
- **PDF**: jsPDF
- **Database**: Google Sheets API
- **Deployment**: Vercel

## 📋 Prerequisites

ก่อนเริ่มต้น คุณต้องมี:

1. Node.js 18+ ติดตั้งบนเครื่อง
2. Google Cloud Project พร้อม Service Account
3. Google Sheet สำหรับเก็บข้อมูล
4. Vercel Account (สำหรับ deployment)

## 🔧 Setup

### 1. Clone และติดตั้ง Dependencies

```bash
# Clone repository (ถ้ามี)
git clone <your-repo-url>
cd pmform

# ติดตั้ง dependencies
npm install
```

### 2. ตั้งค่า Google Cloud & Google Sheets

#### สร้าง Google Cloud Project และ Service Account:

1. ไปที่ [Google Cloud Console](https://console.cloud.google.com)
2. สร้าง Project ใหม่ (หรือเลือก Project ที่มีอยู่)
3. เปิดใช้งาน **Google Sheets API**:
   - ไปที่ "APIs & Services" > "Library"
   - ค้นหา "Google Sheets API"
   - คลิก "Enable"

4. สร้าง Service Account:
   - ไปที่ "IAM & Admin" > "Service Accounts"
   - คลิก "Create Service Account"
   - ตั้งชื่อ เช่น "form-submission-service"
   - คลิก "Create and Continue"
   - ข้ามขั้นตอน "Grant this service account access"
   - คลิก "Done"

5. สร้าง Key สำหรับ Service Account:
   - คลิกที่ Service Account ที่สร้างไว้
   - ไปที่แท็บ "Keys"
   - คลิก "Add Key" > "Create new key"
   - เลือก "JSON"
   - ดาวน์โหลดไฟล์ JSON

#### สร้าง Google Sheet:

1. สร้าง Google Sheet ใหม่
2. เพิ่มชื่อคอลัมน์แถวแรกดังนี้:

```
Submission ID | Timestamp | Date | Time | Location | Machine No | AC Brand | BTU | AC Status | AC Status Detail | Timer Status | Timer Detail | Electric Status | L+N Voltage | L+G Voltage | G+N Voltage | G Ohm | Meter | Repair Details | Cannot Proceed | Bank Approval | Not Approved Reason | Refrigerant Pressure | Refrigerant Added | Repair Work Detail | Suggestions | Next Month | Next Year
```

3. แชร์ Sheet กับ Service Account:
   - คลิก "Share"
   - วาง email ของ Service Account (จากไฟล์ JSON: `client_email`)
   - ให้สิทธิ์ "Editor"
   - คลิก "Send"

4. คัดลอก Spreadsheet ID:
   - จาก URL: `https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit`

### 3. ตั้งค่า Environment Variables

สร้างไฟล์ `.env.local`:

```bash
cp .env.example .env.local
```

แก้ไขไฟล์ `.env.local` และใส่ค่าจากไฟล์ JSON ที่ดาวน์โหลด:

```env
# จาก Service Account JSON
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEETS_CLIENT_EMAIL="your-service-account@project-id.iam.gserviceaccount.com"

# จาก Google Sheet URL
GOOGLE_SPREADSHEET_ID="your_spreadsheet_id"

# ชื่อ Sheet (ค่าเริ่มต้นคือ Sheet1)
GOOGLE_SHEET_NAME="Sheet1"
```

**⚠️ หมายเหตุ**:
- `GOOGLE_SHEETS_PRIVATE_KEY` ต้องมี `\\n` ใน private key
- อย่า commit ไฟล์ `.env.local` ขึ้น Git

### 4. รันโปรเจค

```bash
# Development mode
npm run dev
```

เปิดเบราว์เซอร์ที่ [http://localhost:3000](http://localhost:3000)

## 🚀 Deployment to Vercel

### 1. Push โค้ดไปยัง GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 2. Deploy ผ่าน Vercel

1. ไปที่ [Vercel Dashboard](https://vercel.com)
2. คลิก "Add New Project"
3. Import GitHub repository
4. ตั้งค่า Environment Variables:
   - ไปที่ "Environment Variables"
   - เพิ่มตัวแปรทั้งหมดจาก `.env.local`
   - **สำคัญ**: ต้องเพิ่มให้ครบทุก environment
5. คลิก "Deploy"

### 3. หลัง Deploy สำเร็จ

- Vercel จะสร้าง URL ให้: `https://your-project.vercel.app`
- ทุกครั้งที่ push โค้ดใหม่ ระบบจะ deploy อัตโนมัติ

## 📁 Project Structure

```
pmform/
├── app/
│   ├── api/
│   │   └── submit-form/        # API endpoint สำหรับบันทึกข้อมูล
│   ├── success/                # Success page
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Main form page
├── components/
│   ├── FormFields/             # Reusable form components
│   ├── FormSections/           # Form sections
│   └── FormHeader.tsx          # Header component
├── lib/
│   ├── formSchema.ts           # Zod validation schema
│   ├── googleSheets.ts         # Google Sheets client
│   ├── pdfGenerator.ts         # PDF generation
│   └── types.ts                # TypeScript types
├── utils/
│   └── constants.ts            # Form constants
└── public/
    └── fonts/                  # Thai fonts for PDF
```

## 🧪 Testing

### Manual Testing Checklist:

- [ ] กรอกข้อมูลครบถ้วนและ submit
- [ ] ตรวจสอบข้อมูลใน Google Sheet
- [ ] ทดสอบ validation (กรอกข้อมูลไม่ครบ)
- [ ] ทดสอบดาวน์โหลด PDF
- [ ] ทดสอบพิมพ์แบบฟอร์ม
- [ ] ทดสอบบนมือถือ
- [ ] ทดสอบบน browser ต่างๆ (Chrome, Firefox, Safari)

## 🔒 Security Notes

- **ห้าม** commit ไฟล์ `.env.local` ขึ้น Git
- **ห้าม** เปิดเผย Service Account credentials
- ตั้งค่า `.gitignore` ให้ ignore `.env*.local`
- ใช้ Environment Variables ใน Vercel สำหรับ production

## 📝 Form Fields

แบบฟอร์มประกอบด้วย:

### ก่อนดำเนินการ:
1. วันที่และเวลา
2. ชื่อสถานที่ติดตั้ง ATM/CDM
3. หมายเลขเครื่อง (4 หลัก)
4. ยี่ห้อเครื่องปรับอากาศ
5. ขนาด BTU
6. สถานะการทำงานของแอร์
7. สถานะ TIMER
8. ระบบไฟฟ้า (L+N, L+G, G+N, G)
9. มิเตอร์ไฟฟ้า
10. รายละเอียดการซ่อม (ถ้ามี)
11. ความเห็นธนาคาร

### หลังดำเนินการ:
1. แรงดันน้ำยาแอร์
2. ปริมาณน้ำยาที่เติม
3. รายละเอียดการซ่อม
4. ข้อเสนอแนะ
5. กำหนดการล้างครั้งต่อไป

## 🐛 Troubleshooting

### ปัญหา: Google Sheets API Error

**แก้ไข**:
- ตรวจสอบว่าแชร์ Sheet กับ Service Account แล้ว
- ตรวจสอบว่า Environment Variables ถูกต้อง
- ตรวจสอบว่าเปิดใช้ Google Sheets API แล้ว

### ปัญหา: PDF ไม่แสดงภาษาไทย

**แก้ไข**:
- ตรวจสอบว่า font Base64 ถูกต้อง
- ลองใช้ Google Fonts แทน

### ปัญหา: Form Validation ไม่ทำงาน

**แก้ไข**:
- ตรวจสอบ Zod schema ใน `lib/formSchema.ts`
- ดู Console สำหรับ error messages

## 📞 Support

หากมีปัญหาหรือข้อสงสัย:
1. ตรวจสอบ Console ของเบราว์เซอร์
2. ตรวจสอบ Vercel Logs
3. ตรวจสอบ Environment Variables

## 📄 License

This project is private and proprietary.

## 🙏 Credits

- ธนาคารไทยพาณิชย์ จำกัด (มหาชน)
- Form design based on original ATM/CDM maintenance form

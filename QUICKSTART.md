# 🚀 Quick Start Guide

## การเริ่มต้นใช้งานอย่างรวดเร็ว

### 1. ติดตั้ง Dependencies
```bash
npm install
```

### 2. ตั้งค่า Environment Variables
สร้างไฟล์ `.env.local`:
```bash
cp .env.example .env.local
```

แก้ไขและใส่ค่าต่อไปนี้:
- `GOOGLE_SHEETS_PRIVATE_KEY` - จาก Service Account JSON
- `GOOGLE_SHEETS_CLIENT_EMAIL` - จาก Service Account JSON
- `GOOGLE_SPREADSHEET_ID` - จาก URL ของ Google Sheet
- `GOOGLE_SHEET_NAME` - ชื่อ Sheet (ค่าเริ่มต้น: Sheet1)

### 3. รันโปรเจค
```bash
npm run dev
```

เปิดเบราว์เซอร์ที่ http://localhost:3000

### 4. Build สำหรับ Production
```bash
npm run build
npm start
```

## 📂 โครงสร้างโปรเจค

```
pmform/
├── app/              # Next.js App Router
├── components/       # React Components
├── lib/             # Utilities & Logic
├── utils/           # Constants
└── public/          # Static files
```

## ⚙️ คำสั่งที่ใช้บ่อย

```bash
# Development
npm run dev

# Build
npm run build

# Production
npm start

# Lint
npm run lint
```

## 🔧 การแก้ปัญหาเบื้องต้น

### Build ไม่ผ่าน
1. ลบ `.next` folder: `rm -rf .next`
2. ลบ `node_modules`: `rm -rf node_modules`
3. ติดตั้งใหม่: `npm install`
4. Build ใหม่: `npm run build`

### Google Sheets ไม่บันทึก
1. ตรวจสอบ Environment Variables
2. ตรวจสอบว่าแชร์ Sheet กับ Service Account แล้ว
3. ดู Console ใน Browser (F12)

### PDF ไม่ดาวน์โหลด
1. ตรวจสอบ Browser Console
2. ลองใช้ Browser อื่น
3. ตรวจสอบ font configuration

## 📚 เอกสารเพิ่มเติม

- [README.md](README.md) - คู่มือหลัก
- [SETUP_GUIDE.md](SETUP_GUIDE.md) - คู่มือการติดตั้งแบบละเอียด
- [Next.js Docs](https://nextjs.org/docs)
- [Vercel Deployment](https://vercel.com/docs)

## 🆘 ต้องการความช่วยเหลือ?

1. อ่าน [README.md](README.md) Troubleshooting section
2. อ่าน [SETUP_GUIDE.md](SETUP_GUIDE.md) FAQ section
3. ตรวจสอบ Logs ใน Vercel Dashboard
4. ตรวจสอบ Browser Console (F12)

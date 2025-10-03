# คู่มือการติดตั้งและใช้งาน

## 📋 สารบัญ
1. [การติดตั้งเบื้องต้น](#1-การติดตั้งเบื้องต้น)
2. [การตั้งค่า Google Cloud](#2-การตั้งค่า-google-cloud)
3. [การตั้งค่า Google Sheets](#3-การตั้งค่า-google-sheets)
4. [การตั้งค่าโปรเจค](#4-การตั้งค่าโปรเจค)
5. [การ Deploy ขึ้น Vercel](#5-การ-deploy-ขึ้น-vercel)

---

## 1. การติดตั้งเบื้องต้น

### ความต้องการของระบบ
- Node.js 18 ขึ้นไป
- npm หรือ yarn
- Git
- บัญชี Google
- บัญชี Vercel (ฟรี)

### ตรวจสอบ Node.js
```bash
node --version  # ต้องเป็น v18 ขึ้นไป
npm --version
```

### ติดตั้ง Dependencies
```bash
cd pmform
npm install
```

---

## 2. การตั้งค่า Google Cloud

### ขั้นตอนที่ 1: สร้าง Project
1. เข้า [Google Cloud Console](https://console.cloud.google.com)
2. คลิก "Select a project" > "New Project"
3. ตั้งชื่อ project เช่น "ATM-Form-App"
4. คลิก "Create"

### ขั้นตอนที่ 2: เปิดใช้งาน Google Sheets API
1. ไปที่เมนู "APIs & Services" > "Library"
2. ค้นหา "Google Sheets API"
3. คลิก "Google Sheets API"
4. คลิกปุ่ม "Enable"

### ขั้นตอนที่ 3: สร้าง Service Account
1. ไปที่ "IAM & Admin" > "Service Accounts"
2. คลิก "+ CREATE SERVICE ACCOUNT"
3. กรอกข้อมูล:
   - Service account name: `form-submission-service`
   - Service account ID: `form-submission-service` (auto-fill)
4. คลิก "CREATE AND CONTINUE"
5. ข้าม Grant this service account access (คลิก "CONTINUE")
6. ข้าม Grant users access (คลิก "DONE")

### ขั้นตอนที่ 4: สร้าง JSON Key
1. ในหน้า Service Accounts คลิกที่ Service Account ที่สร้าง
2. ไปที่แท็บ "KEYS"
3. คลิก "ADD KEY" > "Create new key"
4. เลือก "JSON"
5. คลิก "CREATE"
6. ไฟล์ JSON จะถูกดาวน์โหลดอัตโนมัติ

### ขั้นตอนที่ 5: เก็บข้อมูลจาก JSON
เปิดไฟล์ JSON ที่ดาวน์โหลด จะมีข้อมูลดังนี้:
```json
{
  "type": "service_account",
  "project_id": "xxx",
  "private_key_id": "xxx",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "form-submission-service@xxx.iam.gserviceaccount.com",
  ...
}
```

เก็บค่าเหล่านี้:
- `private_key` - สำหรับ `GOOGLE_SHEETS_PRIVATE_KEY`
- `client_email` - สำหรับ `GOOGLE_SHEETS_CLIENT_EMAIL`

---

## 3. การตั้งค่า Google Sheets

### ขั้นตอนที่ 1: สร้าง Spreadsheet
1. เข้า [Google Sheets](https://sheets.google.com)
2. สร้าง Spreadsheet ใหม่
3. ตั้งชื่อ เช่น "ATM Maintenance Records"

### ขั้นตอนที่ 2: ตั้งค่า Column Headers
ในแถวที่ 1 ให้ใส่หัวคอลัมน์ดังนี้:

| A | B | C | D | E | F | G | H | I | J |
|---|---|---|---|---|---|---|---|---|---|
| Submission ID | Timestamp | Date | Time | Location | Machine No | AC Brand | BTU | AC Status | AC Status Detail |

| K | L | M | N | O | P | Q | R | S | T |
|---|---|---|---|---|---|---|---|---|---|
| Timer Status | Timer Detail | Electric Status | L+N Voltage | L+G Voltage | G+N Voltage | G Ohm | Meter | Repair Details | Cannot Proceed |

| U | V | W | X | Y | Z | AA | AB |
|---|---|---|---|---|---|---|---|
| Bank Approval | Not Approved Reason | Refrigerant Pressure | Refrigerant Added | Repair Work Detail | Suggestions | Next Month | Next Year |

### ขั้นตอนที่ 3: แชร์กับ Service Account
1. คลิกปุ่ม "Share" (มุมขวาบน)
2. วาง email ของ Service Account จากไฟล์ JSON (`client_email`)
   - ตัวอย่าง: `form-submission-service@atm-form-app.iam.gserviceaccount.com`
3. เลือก "Editor" permissions
4. **ยกเลิกการติ๊ก** "Notify people"
5. คลิก "Share"

### ขั้นตอนที่ 4: คัดลอก Spreadsheet ID
จาก URL ของ Google Sheet:
```
https://docs.google.com/spreadsheets/d/1abc123xyz456def789/edit
                                        ^^^^^^^^^^^^^^^^^^^
                                        นี่คือ Spreadsheet ID
```

---

## 4. การตั้งค่าโปรเจค

### ขั้นตอนที่ 1: สร้างไฟล์ Environment Variables
```bash
cp .env.example .env.local
```

### ขั้นตอนที่ 2: แก้ไขไฟล์ .env.local
เปิดไฟล์ `.env.local` และใส่ค่าดังนี้:

```env
# จาก Service Account JSON: private_key
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBg...(เนื้อหายาวมาก)...ABC123\n-----END PRIVATE KEY-----\n"

# จาก Service Account JSON: client_email
GOOGLE_SHEETS_CLIENT_EMAIL="form-submission-service@atm-form-app.iam.gserviceaccount.com"

# จาก Google Sheet URL
GOOGLE_SPREADSHEET_ID="1abc123xyz456def789"

# ชื่อ Sheet (ถ้าไม่เปลี่ยนให้ใช้ Sheet1)
GOOGLE_SHEET_NAME="Sheet1"
```

**⚠️ สำคัญมาก:**
- `GOOGLE_SHEETS_PRIVATE_KEY` ต้องมี `\n` (backslash n) ในตัว
- อย่าลืมใส่เครื่องหมาย `"` ครอบ
- ใส่ค่าทั้งหมด รวมถึง `-----BEGIN PRIVATE KEY-----` และ `-----END PRIVATE KEY-----`

### ขั้นตอนที่ 3: ทดสอบรันโปรเจค
```bash
npm run dev
```

เปิดเบราว์เซอร์ไปที่ http://localhost:3000

### ขั้นตอนที่ 4: ทดสอบกรอกฟอร์ม
1. กรอกข้อมูลในฟอร์มให้ครบถ้วน
2. คลิก "บันทึกข้อมูล"
3. ตรวจสอบใน Google Sheet ว่ามีข้อมูลเพิ่มขึ้นหรือไม่

---

## 5. การ Deploy ขึ้น Vercel

### ขั้นตอนที่ 1: Push โค้ดขึ้น GitHub

```bash
# Initialize Git (ถ้ายังไม่ได้ทำ)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: ATM Form Application"

# สร้าง repository บน GitHub แล้ว add remote
git remote add origin https://github.com/your-username/pmform.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### ขั้นตอนที่ 2: สมัคร/Login Vercel
1. ไปที่ [Vercel.com](https://vercel.com)
2. สมัครหรือ Login ด้วย GitHub account

### ขั้นตอนที่ 3: Import Project
1. คลิก "Add New..." > "Project"
2. เลือก GitHub repository ที่ push ไว้
3. คลิก "Import"

### ขั้นตอนที่ 4: Configure Project
1. **Framework Preset**: Next.js (ตรวจจับอัตโนมัติ)
2. **Root Directory**: `./` (ค่าเริ่มต้น)
3. **Build Command**: `npm run build` (ค่าเริ่มต้น)
4. **Output Directory**: `.next` (ค่าเริ่มต้น)

### ขั้นตอนที่ 5: เพิ่ม Environment Variables
ใน Vercel Dashboard:
1. ไปที่ส่วน "Environment Variables"
2. เพิ่มตัวแปรทั้ง 4 ตัว:

**ตัวแปรที่ 1:**
- Key: `GOOGLE_SHEETS_PRIVATE_KEY`
- Value: (วาง private key ทั้งหมดจาก .env.local)
- ติ๊กทั้ง 3 checkbox: Production, Preview, Development

**ตัวแปรที่ 2:**
- Key: `GOOGLE_SHEETS_CLIENT_EMAIL`
- Value: (วาง client email จาก .env.local)
- ติ๊กทั้ง 3 checkbox

**ตัวแปรที่ 3:**
- Key: `GOOGLE_SPREADSHEET_ID`
- Value: (วาง spreadsheet ID จาก .env.local)
- ติ๊กทั้ง 3 checkbox

**ตัวแปรที่ 4:**
- Key: `GOOGLE_SHEET_NAME`
- Value: `Sheet1`
- ติ๊กทั้ง 3 checkbox

### ขั้นตอนที่ 6: Deploy
1. คลิกปุ่ม "Deploy"
2. รอ build ประมาณ 1-2 นาที
3. เมื่อ deploy สำเร็จ Vercel จะแสดง URL

### ขั้นตอนที่ 7: ทดสอบ Production
1. เปิด URL ที่ได้รับ (เช่น `https://pmform.vercel.app`)
2. กรอกฟอร์มทดสอบ
3. ตรวจสอบข้อมูลใน Google Sheet

---

## 🎉 เสร็จสิ้น!

ระบบพร้อมใช้งานแล้ว ทุกครั้งที่คุณ push โค้ดใหม่ขึ้น GitHub:
- Vercel จะ deploy อัตโนมัติ
- ได้ Preview URL สำหรับทดสอบก่อน
- ถ้าผ่าน จะอัพเดท Production URL

---

## 🔧 คำแนะนำเพิ่มเติม

### Custom Domain (ถ้าต้องการ)
1. ใน Vercel Dashboard > Settings > Domains
2. เพิ่ม domain ของคุณ
3. ตั้งค่า DNS ตามที่ Vercel แนะนำ

### Monitoring & Logs
- ดู Logs: Vercel Dashboard > Deployments > [เลือก deployment] > Function Logs
- ดู Analytics: Vercel Dashboard > Analytics

### Security Best Practices
1. ห้าม commit `.env.local` ขึ้น Git
2. Rotate Service Account keys ทุก 90 วัน
3. ใช้ Google Sheet แยกสำหรับ production/test
4. ตรวจสอบ access logs ใน Google Sheet เป็นประจำ

---

## ❓ FAQ

**Q: ทำไม PDF ไม่แสดงภาษาไทย?**
A: ตรวจสอบว่า font base64 ถูกต้อง และลองใช้ Google Fonts

**Q: Submit แล้วไม่มีข้อมูลใน Sheet?**
A:
1. ตรวจสอบว่าแชร์ Sheet กับ Service Account แล้ว
2. ตรวจสอบ Environment Variables
3. ดู Vercel Function Logs

**Q: ต้องการเปลี่ยนรูปแบบฟอร์ม?**
A: แก้ไขไฟล์ใน `components/FormSections/`

**Q: ต้องการเพิ่มฟิลด์ใหม่?**
A:
1. แก้ไข `lib/formSchema.ts` (เพิ่ม field + validation)
2. แก้ไข `lib/types.ts` (เพิ่ม type)
3. แก้ไข form components
4. แก้ไข `lib/googleSheets.ts` (เพิ่มคอลัมน์)
5. เพิ่มคอลัมน์ใน Google Sheet

---

## 📞 ติดต่อ/สนับสนุน

หากพบปัญหา:
1. ตรวจสอบ Console ของ Browser (F12)
2. ตรวจสอบ Vercel Function Logs
3. ตรวจสอบ Environment Variables
4. ดู README.md สำหรับ troubleshooting

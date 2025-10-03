# คู่มือการตั้งค่าการพิมพ์แบบฟอร์ม

## การปรับปรุงที่ทำ

### 1. Print CSS Styles (globals.css)
เพิ่ม comprehensive print styles เพื่อแก้ปัญหาหน้าขาดและการแสดงผลที่ไม่สมบูรณ์

**คุณสมบัติหลัก:**
- ✅ กำหนดขนาดหน้ากระดาษเป็น A4 พร้อม margin 1cm
- ✅ ป้องกันการตัดหน้าในจุดที่ไม่เหมาะสม (page-break-inside: avoid)
- ✅ ปรับขนาดตัวอักษรเป็น 11pt สำหรับพิมพ์
- ✅ ซ่อน interactive elements (ปุ่ม, indicators)
- ✅ รักษาสีพื้นหลังของ headers (yellow section headers)
- ✅ ปรับ spacing และ margins ให้เหมาะกับการพิมพ์
- ✅ Orphans และ widows control เพื่อป้องกันบรรทัดเดี่ยว

### 2. Tailwind Utilities
เพิ่ม utility classes สำหรับควบคุม page breaks:
- `page-break-before` - ขึ้นหน้าใหม่ก่อน element
- `page-break-after` - ขึ้นหน้าใหม่หลัง element
- `page-break-inside-avoid` - ป้องกันการตัดหน้าข้าม element
- `page-break-inside-auto` - อนุญาตให้ตัดหน้าได้

### 3. Component Updates
- เพิ่ม `signature-section` class ใน SignatureSection component

## วิธีใช้งาน

### การพิมพ์ผ่านเบราว์เซอร์

1. **กรอกข้อมูลในฟอร์มให้ครบถ้วน**

2. **คลิกปุ่ม "พิมพ์แบบฟอร์ม"** หรือกด `Ctrl+P` (Windows) / `Cmd+P` (Mac)

3. **ตั้งค่าการพิมพ์:**
   - **ขนาดกระดาษ:** A4
   - **Orientation:** Portrait (แนวตั้ง)
   - **Margins:** Default หรือ Minimum
   - **Scale:** 100% (อย่าใช้ "Fit to page")
   - **Background graphics:** ✅ เปิด (เพื่อให้เห็นสีเหลืองของ headers)

4. **Browser-specific settings:**

   **Chrome/Edge:**
   - More settings → Background graphics: ✅ เปิด
   - Margins: Default หรือ Minimum
   - Scale: 100%

   **Firefox:**
   - Print backgrounds: ✅ เปิด
   - Scale: 100%

   **Safari:**
   - Print backgrounds: ✅ เปิด

### การพิมพ์เป็น PDF

1. เลือก Destination/Printer เป็น "Save as PDF" หรือ "Microsoft Print to PDF"
2. ตั้งค่าเหมือนการพิมพ์ปกติ
3. คลิก "Save" และเลือกตำแหน่งที่จะบันทึกไฟล์

## การแก้ปัญหา

### ปัญหา: หน้าขาดหรือข้อมูลตกหล่น
**วิธีแก้:**
1. ตรวจสอบว่า Scale ตั้งเป็น 100%
2. ตรวจสอบว่า Margins ไม่ได้ตั้งเป็น "None"
3. ลองเปลี่ยน Margins เป็น "Minimum" หรือ "Default"

### ปัญหา: สีพื้นหลังไม่แสดง
**วิธีแก้:**
1. เปิด "Background graphics" หรือ "Print backgrounds" ในการตั้งค่าการพิมพ์
2. ใน Chrome: More settings → Background graphics ✅

### ปัญหา: ตัวอักษรเล็กเกินไป
**วิธีแก้:**
1. ตรวจสอบว่า Scale ตั้งเป็น 100%
2. ไม่ควรใช้ "Shrink to fit" หรือ "Fit to page"

### ปัญหา: Section ถูกตัดครึ่งระหว่างหน้า
**วิธีแก้:**
1. Print styles มี `page-break-inside: avoid` อยู่แล้ว
2. ถ้ายังมีปัญหา ให้ลองเพิ่ม class `page-break-inside-avoid` ใน component ที่ต้องการ

### ปัญหา: เนื้อหายาวเกินหน้า
**วิธีแก้:**
1. ลด font size ใน print styles (แก้ไขใน `globals.css`)
2. ปรับ padding/margins ให้เล็กลง
3. พิจารณาแบ่งเนื้อหาออกเป็นหลายหน้า

## การปรับแต่งเพิ่มเติม

### เพิ่ม Page Break Manual
ถ้าต้องการบังคับให้ขึ้นหน้าใหม่ที่จุดใดจุดหนึ่ง:

```tsx
<div className="page-break-before">
  {/* เนื้อหาที่ต้องการให้เริ่มหน้าใหม่ */}
</div>
```

### ป้องกัน Element ถูกตัด
ถ้าต้องการป้องกัน element ถูกตัดระหว่างหน้า:

```tsx
<div className="page-break-inside-avoid">
  {/* เนื้อหาที่ต้องการให้อยู่ในหน้าเดียวกัน */}
</div>
```

### ปรับ Font Size สำหรับพิมพ์
แก้ไขใน `app/globals.css`:

```css
@media print {
  body {
    font-size: 10pt; /* ลดขนาดจาก 11pt */
  }
}
```

### ปรับ Page Margins
แก้ไขใน `app/globals.css`:

```css
@media print {
  @page {
    size: A4;
    margin: 0.5cm; /* ลดจาก 1cm */
  }
}
```

## Best Practices

1. **ทดสอบการพิมพ์บ่อยๆ** ขณะพัฒนา โดยใช้ Print Preview
2. **ใช้ Print Preview** ก่อนพิมพ์จริงเสมอ
3. **ตรวจสอบทุกหน้า** ว่าข้อมูลครบถ้วน
4. **เก็บ PDF** เป็น backup ก่อนพิมพ์กระดาษ
5. **ทดสอบในหลาย browsers** (Chrome, Firefox, Edge, Safari)

## Technical Details

### Classes ที่มีผลกับการพิมพ์

| Class | Description |
|-------|-------------|
| `print:hidden` | ซ่อน element เมื่อพิมพ์ |
| `signature-section` | Section ลายเซ็น (ป้องกันตัด) |
| `form-section-bordered` | Section มีขอบ (ป้องกันตัด) |
| `yellow-section-header` | Header สีเหลือง (รักษาสี) |
| `page-break-before` | ขึ้นหน้าใหม่ก่อน |
| `page-break-after` | ขึ้นหน้าใหม่หลัง |
| `page-break-inside-avoid` | ป้องกันตัดหน้า |

### Print Media Query
ทุก styles ที่อยู่ใน `@media print { }` จะมีผลเฉพาะเวลาพิมพ์เท่านั้น

### Browser Compatibility
- ✅ Chrome/Edge: รองรับครบทุกฟีเจอร์
- ✅ Firefox: รองรับครบทุกฟีเจอร์
- ✅ Safari: รองรับครบทุกฟีเจอร์
- ⚠️ IE11: รองรับบางส่วน (ไม่แนะนำ)

## การทดสอบ

### Checklist สำหรับการทดสอบการพิมพ์

- [ ] ทุก section แสดงผลครบถ้วน
- [ ] ไม่มี section ถูกตัดครึ่งระหว่างหน้า
- [ ] สีพื้นหลังของ headers แสดงถูกต้อง
- [ ] ขนาดตัวอักษรอ่านง่าย
- [ ] ปุ่มและ indicators ถูกซ่อน
- [ ] Checkbox และ input fields แสดงชัดเจน
- [ ] ลายเซ็นอยู่ในตำแหน่งที่เหมาะสม
- [ ] ข้อมูลครบทุกช่อง
- [ ] จำนวนหน้าเหมาะสม (ไม่มากหรือน้อยเกินไป)

### Test Environments
ทดสอบใน:
- Windows: Chrome, Edge, Firefox
- macOS: Safari, Chrome, Firefox
- Print Preview Mode
- Save as PDF
- Physical Printer (ถ้าเป็นไปได้)

## Support

หากพบปัญหาการพิมพ์ที่ไม่สามารถแก้ไขได้:
1. ตรวจสอบเวอร์ชันของ browser
2. ลองใช้ browser อื่น
3. ตรวจสอบการตั้งค่าเครื่องพิมพ์
4. ติดต่อทีมพัฒนาเพื่อรายงานปัญหา

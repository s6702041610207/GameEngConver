# ห้องสมุดต้องมนตร์ (Vocabulary Escape Room)

เกมทบทวนคำศัพท์ภาษาอังกฤษ รูปแบบ Escape Room 3 ห้อง — ทำเป็นเว็บเพจไฟล์เดียว (`index.html`)
เล่นได้ทันทีในเบราว์เซอร์ ไม่ต้องติดตั้งอะไรเพิ่ม บันทึกผลผู้เล่นและกระดานอันดับผ่าน
Google Sheets (ผ่าน Google Apps Script)

## โครงสร้างไฟล์

```
vocabulary-escape-room/
├── index.html          ← ตัวเกมทั้งหมด (HTML + CSS + JS ในไฟล์เดียว)
├── backend/
│   └── Code.gs          ← โค้ด Google Apps Script (วางใน Apps Script editor ของ Google Sheet)
└── README.md            ← เอกสารนี้
```

> หมายเหตุ: `backend/Code.gs` ไม่ได้ถูกรันจาก repo นี้โดยตรง แต่ต้องคัดลอกไปวางใน
> Google Apps Script ที่ผูกกับ Google Sheet ของผู้ใช้เอง (ดูวิธีตั้งค่าด้านล่าง)

## วิธีเล่น / รันเกม

เปิดไฟล์ `index.html` ในเบราว์เซอร์ได้โดยตรง หรือดูลิงก์ที่ deploy แล้วด้านล่าง

## วิธีตั้งค่า Google Sheets (ระบบบันทึกข้อมูล)

1. สร้าง Google Sheet เปล่า 1 ไฟล์ → คัดลอก Sheet ID จาก URL (ระหว่าง `/d/` กับ `/edit`)
2. เปิด Extensions > Apps Script → วางโค้ดจาก `backend/Code.gs`
3. แก้ `SHEET_ID` ในโค้ดให้เป็น ID ของคุณ
4. Deploy > New deployment > Web app > Execute as: Me > Who has access: Anyone
5. คัดลอก Web app URL (ลงท้ายด้วย `/exec`) มาวางแทนค่า `GAS_URL` ในไฟล์ `index.html`

ระบบจะสร้างชีต **Records** (ผลจบเกมของทุกคน สำหรับ Dashboard) และ **Progress**
(ความคืบหน้าระหว่างเล่น สำหรับเล่นต่อ) ให้อัตโนมัติ

## วิธีนำไปโฮสต์เป็นลิงก์จริง (สำหรับส่งงาน)

**ตัวเลือก A — GitHub Pages (แนะนำ เพราะได้ทั้งลิงก์และ source code ในที่เดียว)**
1. สร้าง repository ใหม่บน GitHub แล้วอัปโหลดไฟล์ทั้งหมดในโฟลเดอร์นี้ขึ้นไป
2. ไปที่ Settings > Pages > Source: เลือก branch `main` โฟลเดอร์ `/root` > Save
3. รอสักครู่ จะได้ลิงก์รูปแบบ `https://<username>.github.io/<repo-name>/`

**ตัวเลือก B — Netlify Drop (เร็วที่สุด ไม่ต้องมีบัญชี GitHub)**
1. เข้า https://app.netlify.com/drop
2. ลากทั้งโฟลเดอร์ (หรือไฟล์ `index.html`) ไปวาง
3. ได้ลิงก์ใช้งานทันที

## สรุปการตอบข้อกำหนดของงาน (สำหรับอาจารย์ตรวจ)

| ข้อกำหนด | อยู่ตรงไหนในโค้ด |
|---|---|
| หน้าเริ่มต้น (ชื่อเกม/คำอธิบาย/ปุ่มเริ่ม/ปุ่มวิธีเล่น) | `#screen-start` |
| หน้าลงทะเบียนผู้เล่น | `#screen-register` |
| หน้าแนะนำวิธีเล่น | `#screen-howto` |
| หน้าเล่นเกม (3 ด่าน, คำถาม ≥10 ข้อ, 2 ระดับความยาก, คะแนน/ความก้าวหน้า, feedback, ปุ่มเล่นต่อ/เริ่มใหม่/กลับหน้าหลัก) | `#screen-game`, `ROOMS_META`, ฟังก์ชัน `renderQuestion`, `answerQuestion` |
| หน้าสรุปผล | `#screen-summary`, ฟังก์ชัน `finishGame` |
| กลไกเกม: คะแนน/ด่าน/ความก้าวหน้า/เหรียญ/เวลา/ปลดล็อก/ชีวิต | ดูรายละเอียดในโค้ด `Game` object ทั้งหมด (ครบทั้ง 7 กลไก) |
| คลังคำถาม ≥15 ข้อ, สุ่มใช้ ≥10 ข้อ, ≥2 รูปแบบคำถาม | `QUESTION_BANK` (18 ข้อ, 3 รูปแบบ: mc/fill/tf) |
| ระบบบันทึกข้อมูลผู้เรียนลง Google Sheets | `backend/Code.gs` + ฟังก์ชัน `gasGet`/`gasPost` ใน `index.html` |
| การบันทึกความคืบหน้า + เล่นต่อได้ | `saveProgress`, `resumeProgress`, ชีต Progress |
| Dashboard (จำนวนผู้เล่น/คะแนนเฉลี่ย/สูงสุด-ต่ำสุด/อันดับ/เวลา) | `#screen-dashboard`, ฟังก์ชัน `openDashboard` |
| UI: อ่านง่าย, มือถือรองรับ, ปุ่มขนาดเหมาะสม, ไม่มีโฆษณา | CSS ทั้งหมด (mobile-first, max-width 480px) |

## เทคโนโลยีที่ใช้

- HTML5 / CSS3 / Vanilla JavaScript (ไม่มี framework ภายนอก)
- Google Apps Script + Google Sheets (ฐานข้อมูล)
- Web Audio API (เสียงประกอบสังเคราะห์ ไม่ใช้ไฟล์เสียงภายนอก)
- ฟอนต์จาก Google Fonts (Cinzel, Sarabun, JetBrains Mono)

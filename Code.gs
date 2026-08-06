
const SHEET_ID = '1SG3ZXcqY8lxPjPfn9_fRbkRr2wIsR0v9nimGL6qxFCY';
const RECORDS_SHEET = 'Records';
const PROGRESS_SHEET = 'Progress';

const RECORDS_HEADERS = [
  'Timestamp','StudentID','Name','Nickname','Class',
  'StartedAt','EndedAt','TotalScore','MaxScore',
  'CorrectCount','WrongCount','TimeUsedSec','SessionDurationSec',
  'RoomsPassed','Badge','Status'
];
const PROGRESS_HEADERS = ['StudentID','Name','Class','Nickname','DataJSON','UpdatedAt'];

/* ---------- entry points ---------- */

function doGet(e) {
  try {
    const action = e && e.parameter ? e.parameter.action : undefined;
    if (action === 'getProgress') return getProgress(e.parameter.studentId);
    if (action === 'getDashboard') return getDashboard();
    // DEBUG: ถ้ามาถึงตรงนี้ แปลว่า action ไม่ตรงกับที่คาดไว้ — ส่ง e กลับมาดูเพื่อวินิจฉัย
    return jsonResponse({
      error: 'unknown action: ' + action,
      debug_parameter: e ? e.parameter : null,
      debug_queryString: e ? e.queryString : null,
    });
  } catch (err) {
    return jsonResponse({ error: String(err) });
  }
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;
    const payload = body.payload;
    if (action === 'saveRecord') return saveRecord(payload);
    if (action === 'saveProgress') return saveProgress(payload);
    if (action === 'deleteProgress') return deleteProgress(payload.studentId);
    return jsonResponse({ error: 'unknown action: ' + action });
  } catch (err) {
    return jsonResponse({ error: String(err) });
  }
}

/* ---------- sheet helpers ---------- */

function getSheet_(name) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    const headers = (name === RECORDS_SHEET) ? RECORDS_HEADERS : PROGRESS_HEADERS;
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function findRowByStudentId_(sheet, studentId) {
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(studentId)) return i + 1; // 1-based sheet row
  }
  return -1;
}

/* ---------- records (final results / leaderboard) ---------- */

function saveRecord(r) {
  const sheet = getSheet_(RECORDS_SHEET);
  sheet.appendRow([
    new Date(),
    r.studentId, r.name, r.nickname, r.cls,
    r.startedAt, r.endedAt,
    r.totalScore, r.maxScore,
    r.correctCount, r.wrongCount,
    r.timeUsedSec, r.sessionDurationSec,
    r.roomsPassed, r.badge, r.status,
  ]);
  return jsonResponse({ ok: true });
}

function getDashboard() {
  const sheet = getSheet_(RECORDS_SHEET);
  const data = sheet.getDataRange().getValues();
  const records = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[1]) continue; // skip empty rows
    records.push({
      studentId: row[1], name: row[2], nickname: row[3], cls: row[4],
      startedAt: row[5], endedAt: row[6],
      totalScore: Number(row[7]), maxScore: Number(row[8]),
      correctCount: Number(row[9]), wrongCount: Number(row[10]),
      timeUsedSec: Number(row[11]), sessionDurationSec: Number(row[12]),
      roomsPassed: Number(row[13]), badge: row[14], status: row[15],
    });
  }
  return jsonResponse({ records: records });
}

/* ---------- progress (resume mid-game) ---------- */

function saveProgress(p) {
  const sheet = getSheet_(PROGRESS_SHEET);
  const rowIndex = findRowByStudentId_(sheet, p.studentId);
  const row = [p.studentId, p.name, p.cls, p.nickname, JSON.stringify(p.data), new Date()];
  if (rowIndex === -1) {
    sheet.appendRow(row);
  } else {
    sheet.getRange(rowIndex, 1, 1, row.length).setValues([row]);
  }
  return jsonResponse({ ok: true });
}

function getProgress(studentId) {
  const sheet = getSheet_(PROGRESS_SHEET);
  const rowIndex = findRowByStudentId_(sheet, studentId);
  if (rowIndex === -1) return jsonResponse({ found: false });
  const row = sheet.getRange(rowIndex, 1, 1, PROGRESS_HEADERS.length).getValues()[0];
  return jsonResponse({ found: true, data: JSON.parse(row[4]) });
}

function deleteProgress(studentId) {
  const sheet = getSheet_(PROGRESS_SHEET);
  const rowIndex = findRowByStudentId_(sheet, studentId);
  if (rowIndex !== -1) sheet.deleteRow(rowIndex);
  return jsonResponse({ ok: true });
}

/* ---------- utils ---------- */

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

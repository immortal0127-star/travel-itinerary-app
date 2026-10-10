const SYNC_TOKEN = "nagoya2026";
const SPREADSHEET_ID = "1XFkXiq-Jm8alP-T1puDpl9RJHF86__4b-E6V4oNC7wI";

const SHEET_NAMES = {
  shopping: "Shopping",
  memos: "Memos"
};

function doGet(e) {
  const params = e && e.parameter ? e.parameter : {};
  const body = params.payload ? JSON.parse(params.payload) : {};
  return handleRequest({
    action: params.action || body.action || "read",
    token: params.token || body.token,
    shoppingItems: body.shoppingItems || [],
    familyMemos: body.familyMemos || []
  });
}

function doPost(e) {
  const body = e && e.postData && e.postData.contents
    ? JSON.parse(e.postData.contents)
    : {};
  return handleRequest(body);
}

function handleRequest(body) {
  try {
    if (body.token !== SYNC_TOKEN) {
      return jsonOutput({ ok: false, error: "同步碼錯誤" });
    }

    ensureSheets();

    if (body.action === "write") {
      writeShoppingItems(body.shoppingItems || []);
      writeFamilyMemos(body.familyMemos || []);
    }

    return jsonOutput({
      ok: true,
      shoppingItems: readShoppingItems(),
      familyMemos: readFamilyMemos(),
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    return jsonOutput({
      ok: false,
      error: error && error.message ? error.message : "同步失敗"
    });
  }
}

function jsonOutput(value) {
  return ContentService
    .createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSpreadsheet() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function ensureSheets() {
  const spreadsheet = getSpreadsheet();
  const shoppingSheet = getOrCreateSheet(spreadsheet, SHEET_NAMES.shopping);
  const memoSheet = getOrCreateSheet(spreadsheet, SHEET_NAMES.memos);

  setHeaders(shoppingSheet, ["id", "name", "category", "memo", "updatedAt"]);
  setHeaders(memoSheet, ["id", "title", "text", "updatedAt"]);
}

function getOrCreateSheet(spreadsheet, name) {
  return spreadsheet.getSheetByName(name) || spreadsheet.insertSheet(name);
}

function setHeaders(sheet, headers) {
  const current = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  const needsHeader = headers.some((header, index) => current[index] !== header);
  if (!needsHeader) return;

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
  sheet.setFrozenRows(1);
}

function readShoppingItems() {
  const sheet = getSpreadsheet().getSheetByName(SHEET_NAMES.shopping);
  const rows = readRows(sheet, 5);
  return rows.map((row) => ({
    id: row[0],
    name: row[1],
    category: row[2],
    memo: row[3]
  })).filter((item) => item.id && item.name);
}

function readFamilyMemos() {
  const sheet = getSpreadsheet().getSheetByName(SHEET_NAMES.memos);
  const rows = readRows(sheet, 4);
  return rows.map((row) => ({
    id: row[0],
    title: row[1],
    text: row[2]
  })).filter((memo) => memo.id && memo.title);
}

function readRows(sheet, columnCount) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  return sheet.getRange(2, 1, lastRow - 1, columnCount).getValues();
}

function writeShoppingItems(items) {
  const sheet = getSpreadsheet().getSheetByName(SHEET_NAMES.shopping);
  replaceRows(sheet, 5, items.map((item) => [
    cleanText(item.id),
    cleanText(item.name),
    cleanText(item.category || "購物"),
    cleanText(item.memo || "尚未填寫備註"),
    new Date().toISOString()
  ]));
}

function writeFamilyMemos(memos) {
  const sheet = getSpreadsheet().getSheetByName(SHEET_NAMES.memos);
  replaceRows(sheet, 4, memos.map((memo) => [
    cleanText(memo.id),
    cleanText(memo.title),
    cleanText(memo.text || "尚未填寫內容"),
    new Date().toISOString()
  ]));
}

function replaceRows(sheet, columnCount, rows) {
  const lastRow = Math.max(sheet.getLastRow(), 2);
  sheet.getRange(2, 1, lastRow - 1, columnCount).clearContent();
  if (rows.length === 0) return;
  sheet.getRange(2, 1, rows.length, columnCount).setValues(rows);
}

function cleanText(value) {
  return String(value || "").trim().slice(0, 500);
}

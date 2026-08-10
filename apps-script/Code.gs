// Mindful Canvas Feedback — Google Apps Script Web App
// Deploy: Extensions → Apps Script → Deploy → Web app → Anyone can access

const SHEET_ID = "1OXYMvbh9Kn-jNdf7Sgid8wGgxbXTnDAtPQk748NLZ2I";
const SHEET_NAME = "Sheet1";

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);

    // Header row check — write headers if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["時間", "模式", "留言", "裝置"]);
    }

    sheet.appendRow([
      data.time || new Date().toISOString(),
      data.mode || "",
      data.comment || "",
      data.device || "",
    ]);

    return ContentService.createTextOutput(
      JSON.stringify({ status: "ok" })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: "error", message: err.message })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  // Optional: read feedback via GET
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
  const rows = sheet.getDataRange().getValues();
  const headers = rows.shift();
  const data = rows.map((row) => {
    const obj = {};
    headers.forEach((h, i) => (obj[h] = row[i]));
    return obj;
  });
  return ContentService.createTextOutput(
    JSON.stringify(data)
  ).setMimeType(ContentService.MimeType.JSON);
}

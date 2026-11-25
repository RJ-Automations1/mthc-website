/**
 * JEBI Shop Orders — Google Apps Script for the "JEBI Shop Orders" sheet.
 *
 * Setup (one time):
 *  1. Open the sheet → Extensions → Apps Script. Delete what's there, paste this file.
 *  2. Change SECRET below to a long random password. Save.
 *  3. Deploy → New deployment → type "Web app".
 *       Execute as: Me      Who has access: Anyone
 *     Click Deploy, approve access, and copy the Web app URL.
 *  4. On Render (jebi service → Environment) add:
 *       JEBI_ORDER_SHEET_URL    = the Web app URL
 *       JEBI_ORDER_SHEET_SECRET = the same SECRET as below
 *
 * The site then adds a row for every order and updates the Status column when
 * an order is marked paid / fulfilled / cancelled on /shop/inventory.
 */

const SECRET = 'CHANGE-ME-to-a-long-random-password';

const HEADERS = ['Order #', 'Date', 'Type', 'Status', 'Item', 'Tier', 'Style', 'Color', 'Size', 'Qty', 'Total', 'Name', 'Email', 'Phone',
  'Street', 'Apt/Unit', 'City', 'State', 'ZIP', 'Access code'];
const STATUS_COL = 4; // column D

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const body = JSON.parse(e.postData.contents);
    if (body.secret !== SECRET) return reply({ ok: false, error: 'bad secret' });
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);

    if (body.type === 'order' && Array.isArray(body.row)) {
      const r = sheet.getLastRow() + 1;
      // Phone and ZIP as text so leading zeros survive
      sheet.getRange(r, 14).setNumberFormat('@');
      sheet.getRange(r, 19).setNumberFormat('@');
      sheet.getRange(r, 1, 1, body.row.length).setValues([body.row]);
      return reply({ ok: true });
    }
    if (body.type === 'status' && body.ref) {
      const refs = sheet.getRange(1, 1, sheet.getLastRow(), 1).getValues();
      for (let i = refs.length - 1; i >= 1; i--) {
        if (String(refs[i][0]) === String(body.ref)) {
          sheet.getRange(i + 1, STATUS_COL).setValue(String(body.status));
          return reply({ ok: true });
        }
      }
      return reply({ ok: true, note: 'order not in sheet' });
    }
    return reply({ ok: false, error: 'unknown request' });
  } finally {
    lock.releaseLock();
  }
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

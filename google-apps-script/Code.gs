const DRIVE_FOLDER_ID = '1sefFDfQAqQgk743mk_s-0f4O8Hdx6uT1';
const SPREADSHEET_ID = '1E3xnRHnwisbVZBXJAYtcCMFVDsvhw9_jZXcfqdrSQSc';
const MENU_HEADERS = ['id', 'name', 'category', 'groups', 'description', 'recipe', 'image'];
const SCHEDULE_HEADERS = ['date', 'picks', 'updated'];

// Jalankan sekali dari editor Apps Script. Ini menyiapkan tab di spreadsheet pilihan pengguna.
function setup() {
  const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const menus = getOrCreateSheet_(ss, 'Menus', MENU_HEADERS);
  const schedules = getOrCreateSheet_(ss, 'Schedules', SCHEDULE_HEADERS);
  Logger.log('Spreadsheet: ' + ss.getUrl());
  Logger.log('Folder gambar: ' + folder.getName());
  return ss.getUrl();
}

function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || 'data';
  if (action === 'image') return output_(readImage_(e.parameter.id), e);
  if (action !== 'data') return output_({ ok: true, message: 'Dapur Minggu API siap.' }, e);
  return output_(readData_(), e);
}

// Serve image bytes through this Web App so browsers do not depend on Drive's
// legacy uc?export=view URLs, which are no longer reliable for embedded images.
function readImage_(id) {
  if (!id || !/^[A-Za-z0-9_-]+$/.test(id)) return { ok: false, id: id || '', error: 'Invalid image ID.' };
  try {
    const file = DriveApp.getFileById(id);
    const parents = file.getParents();
    let belongsToImageFolder = false;
    while (parents.hasNext()) {
      if (parents.next().getId() === DRIVE_FOLDER_ID) belongsToImageFolder = true;
    }
    if (!belongsToImageFolder) return { ok: false, id: id, error: 'Image is outside the RANNU folder.' };
    const blob = file.getBlob();
    const mimeType = blob.getContentType() || '';
    const bytes = blob.getBytes();
    if (!mimeType.startsWith('image/') || bytes.length > 5 * 1024 * 1024) {
      return { ok: false, id: id, error: 'Unsupported image.' };
    }
    return { ok: true, id: id, mimeType: mimeType, base64: Utilities.base64Encode(bytes) };
  } catch (err) {
    return { ok: false, id: id, error: 'Image could not be read.' };
  }
}

function doPost(e) {
  try {
    const payload = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (!Array.isArray(payload.menus)) throw new Error('Data menu tidak valid.');
    writeData_(payload);
    return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) })).setMimeType(ContentService.MimeType.JSON);
  }
}

function readData_() {
  const ss = openSpreadsheet_();
  const menuRows = rowsAsObjects_(ss.getSheetByName('Menus'), MENU_HEADERS);
  const scheduleRows = rowsAsObjects_(ss.getSheetByName('Schedules'), SCHEDULE_HEADERS);
  const menus = menuRows.map(row => ({
    id: String(row.id), name: String(row.name), category: String(row.category),
    groups: parseJson_(row.groups, []), description: String(row.description || ''),
    recipe: String(row.recipe || ''), image: String(row.image || '')
  }));
  const schedules = {};
  scheduleRows.forEach(row => {
    schedules[String(row.date)] = { picks: parseJson_(row.picks, {}), updated: String(row.updated || '') };
  });
  return { menus: menus, schedules: schedules };
}

function writeData_(payload) {
  const ss = openSpreadsheet_();
  const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
  const menus = payload.menus.map(menu => {
    const image = saveImage_(menu, folder);
    return [menu.id || '', menu.name || '', menu.category || '', JSON.stringify(menu.groups || []),
      menu.description || '', menu.recipe || '', image || ''];
  });
  const scheduleRows = Object.keys(payload.schedules || {}).sort().map(date => {
    const item = payload.schedules[date] || {};
    return [date, JSON.stringify(item.picks || {}), item.updated || ''];
  });
  replaceRows_(ss.getSheetByName('Menus'), MENU_HEADERS, menus);
  replaceRows_(ss.getSheetByName('Schedules'), SCHEDULE_HEADERS, scheduleRows);
}

function saveImage_(menu, folder) {
  const source = String(menu.image || '');
  const match = source.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) return source;
  const name = 'dapur-' + String(menu.id || Utilities.getUuid()).replace(/[^a-zA-Z0-9_-]/g, '_');
  const oldFiles = folder.getFilesByName(name);
  while (oldFiles.hasNext()) oldFiles.next().setTrashed(true);
  const bytes = Utilities.base64Decode(match[2]);
  const blob = Utilities.newBlob(bytes, match[1], name + extension_(match[1]));
  const file = folder.createFile(blob);
  return 'https://drive.google.com/uc?export=view&id=' + file.getId();
}

function extension_(mime) {
  if (mime === 'image/webp') return '.webp';
  if (mime === 'image/png') return '.png';
  if (mime === 'image/gif') return '.gif';
  return '.jpg';
}

function openSpreadsheet_() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function getOrCreateSheet_(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  if (sheet.getLastRow() === 0) sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  return sheet;
}

function replaceRows_(sheet, headers, rows) {
  sheet.clearContents();
  const values = [headers].concat(rows);
  sheet.getRange(1, 1, values.length, headers.length).setValues(values);
  sheet.setFrozenRows(1);
}

function rowsAsObjects_(sheet, headers) {
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  return values.slice(1).filter(row => row.some(cell => cell !== '')).map(row => {
    const obj = {};
    headers.forEach((key, index) => obj[key] = row[index]);
    return obj;
  });
}

function parseJson_(value, fallback) {
  try { return JSON.parse(String(value || '')); } catch (err) { return fallback; }
}

function output_(data, e) {
  const callback = e && e.parameter && e.parameter.callback;
  if (callback) {
    if (!/^[A-Za-z_$][\w.$]*$/.test(callback)) throw new Error('Callback tidak valid.');
    return ContentService.createTextOutput(callback + '(' + JSON.stringify(data) + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

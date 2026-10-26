/**
 * INVITÉ Studio — contact form receiver (Google Apps Script web app).
 *
 * OPTIONAL. Use this only if your current script fails the test in README.md
 * ("Contact form: Google Apps Script"), or to replace it with this version.
 * Paste it into the SAME Apps Script project (Extensions → Apps Script from your
 * sheet), save, then Deploy → Manage deployments → edit the existing deployment
 * → Version: New version → Deploy. Editing the existing deployment keeps the
 * /exec URL the website already uses.
 *
 * What it does
 *  - Accepts the website's request (JSON sent as text/plain) and also normal
 *    form posts, with the field names: name|fullName, email, company,
 *    category|projectType, description|message, budget, timeline, notes, kind,
 *    website (honeypot).
 *  - Requires a name, a valid email and a description or message.
 *  - Appends one row to the "Inquiries" tab, in this column order:
 *    Full Name | Email Address | Company or Brand | Project Type |
 *    Project Description | Estimated Budget | Project Timeline |
 *    Additional Notes | Submission Date & Time
 *  - Emails a notification to the address in the Script Property NOTIFY_EMAIL
 *    (Project Settings → Script Properties). Nothing is assumed: without it the
 *    row is still saved and the response says emailSent:false.
 *  - Answers with JSON: {"success":true,"emailSent":true} or
 *    {"success":false,"error":"…"}.
 *
 * Deployment settings: Execute as "Me", Who has access "Anyone".
 * The script must be bound to the spreadsheet, or set the Script Property
 * SHEET_ID to the spreadsheet's ID.
 */

var SHEET_NAME = 'Inquiries';
var LIMITS = { name: 120, email: 200, company: 160, projectType: 80, description: 5000, budget: 60, timeline: 60, notes: 3000 };
var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function doPost(e) {
  try {
    var input = parseInput_(e);

    // Honeypot: bots fill the hidden "website" field. Answer as if all went well, store nothing.
    if (clean_(input.website, 200)) return json_({ success: true, emailSent: false });

    var isProject = String(input.kind || '').toLowerCase() === 'project';
    var data = {
      name: clean_(input.name || input.fullName, LIMITS.name),
      email: clean_(input.email, LIMITS.email),
      company: clean_(input.company, LIMITS.company),
      projectType: clean_(input.category || input.projectType, LIMITS.projectType) || (isProject ? '' : 'General Inquiry'),
      description: clean_(input.description || input.message, LIMITS.description),
      budget: clean_(input.budget, LIMITS.budget),
      timeline: clean_(input.timeline, LIMITS.timeline),
      notes: clean_(input.notes, LIMITS.notes)
    };

    if (!data.name) return json_({ success: false, error: 'Name is required.' });
    if (!EMAIL_RE.test(data.email)) return json_({ success: false, error: 'A valid email address is required.' });
    if (!data.description) return json_({ success: false, error: 'A description or message is required.' });

    var stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
    var row = [data.name, data.email, data.company, data.projectType, data.description, data.budget, data.timeline, data.notes, stamp].map(safeCell_);

    var lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      var sheet = sheet_();
      if (!sheet) return json_({ success: false, error: 'The "' + SHEET_NAME + '" sheet was not found.' });
      sheet.appendRow(row);
    } finally {
      lock.releaseLock();
    }

    return json_({ success: true, emailSent: notify_(data, stamp) });
  } catch (err) {
    console.error(err);
    return json_({ success: false, error: 'The enquiry could not be saved. Please try again.' });
  }
}

/* Opening the /exec URL in a browser shows this: a quick check that the web app is public. */
function doGet() {
  return json_({ success: false, error: 'This endpoint accepts POST requests from the INVITÉ contact form.' });
}

function parseInput_(e) {
  var out = {};
  var params = (e && e.parameter) || {};
  Object.keys(params).forEach(function (k) { out[k] = params[k]; });
  var body = e && e.postData && e.postData.contents;
  if (body) {
    try {
      var parsed = JSON.parse(body);
      if (parsed && typeof parsed === 'object') Object.keys(parsed).forEach(function (k) { out[k] = parsed[k]; });
    } catch (ignore) { /* a normal form post: already in e.parameter */ }
  }
  return out;
}

function sheet_() {
  var id = PropertiesService.getScriptProperties().getProperty('SHEET_ID');
  var book = id ? SpreadsheetApp.openById(id) : SpreadsheetApp.getActiveSpreadsheet();
  return book ? book.getSheetByName(SHEET_NAME) : null;
}

function notify_(d, stamp) {
  var to = PropertiesService.getScriptProperties().getProperty('NOTIFY_EMAIL');
  if (!to) return false;
  try {
    var lines = [
      'Name: ' + d.name, 'Email: ' + d.email, 'Company or brand: ' + (d.company || '—'), 'Project type: ' + (d.projectType || '—'),
      'Budget: ' + (d.budget || '—'), 'Timeline: ' + (d.timeline || '—'), '', d.description, '', d.notes ? 'Notes: ' + d.notes : '', 'Received: ' + stamp
    ];
    MailApp.sendEmail({
      to: to,
      replyTo: d.email,
      subject: 'New INVITÉ enquiry · ' + (d.projectType || 'Website') + ' · ' + d.name,
      body: lines.join('\n')
    });
    return true;
  } catch (err) {
    console.error('Notification email failed: ' + err);
    return false;
  }
}

function clean_(v, max) {
  return String(v == null ? '' : v).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max);
}

/* A cell that starts with = + - or @ would run as a formula in Sheets; keep it as text. */
function safeCell_(v) {
  return typeof v === 'string' && /^[=+\-@]/.test(v) ? "'" + v : v;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

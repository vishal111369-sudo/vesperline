// Shared helpers for the form endpoints.
// Needs these environment variables in Vercel (Project > Settings > Environment Variables):
//   RESEND_API_KEY  - from resend.com, after verifying the vesperline.io domain
//   MAIL_FROM       - optional, defaults to "Vesperline <info@vesperline.io>"
//   TEAM_EMAIL      - optional, defaults to info@vesperline.io (where leads arrive)
//   SHEET_WEBHOOK_URL - optional, a Google Apps Script web app URL that appends each lead to a Google Sheet

const FROM = process.env.MAIL_FROM || 'Vesperline <info@vesperline.io>';
const TEAM = process.env.TEAM_EMAIL || 'info@vesperline.io';

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function validEmail(e) {
  return typeof e === 'string' && e.length < 200 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
}

async function send({ to, subject, html, replyTo }) {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('RESEND_API_KEY is not set');
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM, to: [to], subject, html, reply_to: replyTo })
  });
  if (!r.ok) throw new Error('Email provider returned ' + r.status + ': ' + (await r.text()));
}

async function toSheet(row) {
  const url = process.env.SHEET_WEBHOOK_URL;
  if (!url) return;
  try {
    await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(row) });
  } catch (e) { console.error('Sheet webhook failed', e); }
}

function table(rows) {
  return '<table style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">' +
    rows.map(([k, v]) => `<tr><td style="padding:6px 12px 6px 0;color:#5b6b90;vertical-align:top">${esc(k)}</td><td style="padding:6px 0;color:#0a1633">${esc(v)}</td></tr>`).join('') +
    '</table>';
}

function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  try { return JSON.parse(req.body || '{}'); } catch (e) { return {}; }
}

module.exports = { send, toSheet, table, esc, validEmail, readBody, TEAM };

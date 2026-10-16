const { send, toSheet, table, esc, validEmail, readBody, TEAM } = require('./_mail');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST' });
  const b = readBody(req);
  if (b.website) return res.status(200).json({ ok: true }); // spam trap
  if (!validEmail(b.email)) return res.status(400).json({ error: 'A valid email is required' });

  const r = b.result || {};
  const s = b.setup || {};
  const list = v => Array.isArray(v) ? v.join(', ') : (v || '');
  const when = new Date().toISOString();

  const setupRows = [
    ['Platform', s.platform], ['CRM', s.crm], ['Support desk', s.support],
    ['Channels', list(s.channels)], ['Messaging providers', [list(s.providers), s.providersOther].filter(Boolean).join(', ')],
    ['Market', s.market], ['Licence', s.licence], ['Gamification', s.gamification],
    ['Reporting', [list(s.reporting), s.reportingOther].filter(Boolean).join(', ')],
    ['Brands', s.brands], ['Active customers per month', s.customers], ['Team size', s.team], ['Priority, next 90 days', s.priority]
  ];
  const areas = r.areas || {};
  const answers = (b.answers || []).map(a => [`${a.area}: ${a.question}`, `${a.answer} (${a.points}/3)`]);

  const teamHtml = `<h2 style="font-family:Arial,sans-serif">New Operations Scorecard</h2>` +
    table([['Email', b.email], ['Name', b.name], ['Company', b.company], ['Submitted', when], ['Time taken', b.seconds ? b.seconds + ' seconds' : ''],
      ['Level', `${r.level} of 5, ${r.levelName}`], ['Total score', `${r.total} of 30`],
      ['Run', areas.Run + '%'], ['Connect', areas.Connect + '%'], ['Automate', areas.Automate + '%'], ['Measure', areas.Measure + '%'],
      ['Weakest area', r.weakest], ['Top fixes', list(r.fixes)]]) +
    `<h3 style="font-family:Arial,sans-serif">Their setup</h3>` + table(setupRows) +
    `<h3 style="font-family:Arial,sans-serif">Answers</h3>` + table(answers) +
    `<p style="font-family:Arial,sans-serif;color:#5b6b90">Promise made on the site: free detailed report within 5 working days.</p>`;

  const first = b.name ? esc(b.name) : 'there';
  const leadHtml = `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#0a1633;max-width:560px">
    <p>Hi ${first},</p>
    <p>Thank you for completing the Vesperline Operations Scorecard. Your operation is at <b>level ${esc(r.level)} of 5, ${esc(r.levelName)}</b>.</p>
    <p>Your area scores: Run ${esc(areas.Run)}%, Connect ${esc(areas.Connect)}%, Automate ${esc(areas.Automate)}%, Measure ${esc(areas.Measure)}%.</p>
    <p><b>Your free detailed report will arrive within 5 working days.</b> It will cover your biggest gaps, what to fix first, and how to measure the result.</p>
    <p>If you would like to walk through it together, reply to this email and we will find 30 minutes.</p>
    <p>The Vesperline team<br><a href="https://vesperline.io">vesperline.io</a></p></div>`;

  try {
    await send({ to: TEAM, subject: `Scorecard: level ${r.level} from ${b.company || b.email}`, html: teamHtml, replyTo: b.email });
    await send({ to: b.email, subject: 'Your Operations Scorecard, and your free report', html: leadHtml, replyTo: TEAM });
    await toSheet({ type: 'scorecard', when, email: b.email, name: b.name, company: b.company, level: r.level, total: r.total, ...areas, weakest: r.weakest,
      ...Object.fromEntries(setupRows), answers: (b.answers || []).map(a => a.points).join(',') });
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Could not send' });
  }
};

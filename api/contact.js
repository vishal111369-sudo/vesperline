const { send, toSheet, table, validEmail, readBody, TEAM } = require('./_mail');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST' });
  const b = readBody(req);
  if (b.website) return res.status(200).json({ ok: true }); // spam trap
  if (!validEmail(b.email)) return res.status(400).json({ error: 'A valid email is required' });
  const topic = b.topic || 'contact';
  const when = new Date().toISOString();
  try {
    await send({
      to: TEAM,
      subject: `Website ${topic}: ${b.company || b.name || b.email}`,
      html: '<h2 style="font-family:Arial,sans-serif">New website message</h2>' +
        table([['Topic', topic], ['Name', b.name], ['Email', b.email], ['Company', b.company], ['Role', b.role], ['Message', b.message], ['Submitted', when]]),
      replyTo: b.email
    });
    await toSheet({ type: topic, when, name: b.name, email: b.email, company: b.company, role: b.role, message: b.message });
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Could not send' });
  }
};

const express = require('express');
const router = express.Router();
const { verifyTransport, sendMail } = require('../config/mailer');

/**
 * GET /api/mail/test
 * - returns SMTP verification status
 * - query params:
 *    send=true  -> attempt to send a test email
 *    to=...     -> (optional) recipient email; defaults to ADMIN_EMAIL or MAIL_FROM
 *    confirm=yes -> required when NODE_ENV=production to actually send
 */
router.get('/test', async (req, res) => {
  const { send, to, confirm } = req.query;

  const verify = await verifyTransport();

  const response = { verify };

  const shouldSend = send === 'true' || send === '1';

  // in production require explicit confirm=yes
  if (shouldSend) {
    if (process.env.NODE_ENV === 'production' && confirm !== 'yes') {
      response.send = { ok: false, reason: 'confirm-required-in-production' };
      return res.json(response);
    }

    const recipient = to || process.env.ADMIN_EMAIL || process.env.MAIL_FROM || process.env.SMTP_USER;
    try {
      const result = await sendMail({
        to: recipient,
        subject: 'Test email from Shushruta',
        text: 'This is a test email from your Shushruta application.',
        html: '<p>This is a <strong>test</strong> email from your Shushruta application.</p>'
      });
      response.send = result;
    } catch (err) {
      response.send = { ok: false, error: err };
    }
  }

  res.json(response);
});

module.exports = router;

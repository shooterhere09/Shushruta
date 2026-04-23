const nodemailer = require("nodemailer");

// Reads SMTP configuration from environment variables:
// - SMTP_HOST, SMTP_PORT, SMTP_SECURE (true/false), SMTP_USER, SMTP_PASS
// - ADMIN_EMAIL (fallback recipient when product owner/hospital not available)

const getTransport = () => {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const secure = process.env.SMTP_SECURE === "true"; // boolean
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port || !user || !pass) {
    // If no SMTP configured, return null and callers can fallback to logging
    return null;
  }

  return nodemailer.createTransport({
    host,
    port: Number(port),
    secure,
    auth: { user, pass },
  });
};

/**
 * sendMail - helper to send an email. If SMTP not configured, it will log the message
 * (useful for development).
 * @param {Object} opts
 *  - to: string | string[]
 *  - subject: string
 *  - text: string
 *  - html?: string
 */
const sendMail = async (opts) => {
  const transporter = getTransport();
  const from = process.env.MAIL_FROM || process.env.SMTP_USER || "no-reply@example.com";
  
  // Format the from field to show only "Shushruta"
  const fromName = "Shushruta";
  const fromEmail = process.env.SMTP_USER || "no-reply@example.com";
  const formattedFrom = `"${fromName}" <${fromEmail}>`;

  const mailOptions = {
    from: formattedFrom,
    to: opts.to,
    subject: opts.subject,
    text: opts.text,
    html: opts.html,
  };

  if (!transporter) {
    console.log("[mailer] SMTP not configured — skipping sending email. Mail payload:", mailOptions);
    return { ok: false, info: "SMTP not configured" };
  }

  try {
    const info = await transporter.sendMail(mailOptions);
    return { ok: true, info };
  } catch (err) {
    console.error("[mailer] sendMail error", err);
    return { ok: false, error: err };
  }
};

const verifyTransport = async () => {
  const transporter = getTransport();
  if (!transporter) return { ok: false, info: "SMTP not configured" };
  try {
    // nodemailer transporter.verify checks connection configuration
    await transporter.verify();
    return { ok: true, info: "SMTP verified" };
  } catch (err) {
    return { ok: false, error: err };
  }
};

module.exports = { sendMail, getTransport, verifyTransport };

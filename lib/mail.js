import { config } from '../config.js';

/**
 * Sends the "new enquiry" notification. Returns true only when delivery was accepted.
 *  A) SMTP  -> set SMTP_* in .env and run `npm i nodemailer`
 *  B) Webhook -> set CONTACT_ENDPOINT (POST {name,email,phone,company,msg} -> {"success":true})
 */
export async function notifyTeam({ fields, subject, text }) {
  if (config.smtp.host) {
    try {
      const nodemailer = (await import('nodemailer')).default;
      const transport = nodemailer.createTransport({
        host: config.smtp.host,
        port: config.smtp.port,
        secure: config.smtp.port === 465,
        auth: config.smtp.user ? { user: config.smtp.user, pass: config.smtp.pass } : undefined,
      });
      await transport.sendMail({ from: config.notifyFrom, to: config.notifyTo, replyTo: fields.email, subject, text });
      return true;
    } catch (e) {
      console.error('SMTP notification failed:', e.message);
      return false;
    }
  }
  if (config.contactEndpoint) {
    try {
      const r = await fetch(config.contactEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: fields.name, email: fields.email, phone: fields.phone, company: fields.company, msg: text }),
        signal: AbortSignal.timeout(12000),
      });
      const data = await r.json();
      return r.ok && data.success === true;
    } catch {
      return false;
    }
  }
  return false;
}

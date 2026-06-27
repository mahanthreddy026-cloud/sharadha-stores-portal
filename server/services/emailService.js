const nodemailer = require('nodemailer');

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.ethereal.email';
const SMTP_PORT = process.env.SMTP_PORT || '587';
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

let transporter = null;

function getTransporter() {
  if (!transporter) {
    if (SMTP_USER && SMTP_PASS) {
      transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: parseInt(SMTP_PORT, 10),
        secure: parseInt(SMTP_PORT, 10) === 465,
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS
        }
      });
    } else {
      // Mock mailer for testing and zero-friction execution
      transporter = {
        sendMail: async (options) => {
          console.log('\n--- [EMAIL DISPATCH SIMULATOR] ---');
          console.log(`From: "Sharadha Stores" <no-reply@sharadhastores.com>`);
          console.log(`To: ${options.to}`);
          console.log(`Subject: ${options.subject}`);
          console.log(`Body (Plain): ${options.text || '(HTML Content)'}`);
          if (options.attachments) {
            console.log(`Attachments: ${options.attachments.map(a => a.filename).join(', ')}`);
          }
          console.log('------------------------------------\n');
          return { messageId: `simulation-id-${Date.now()}` };
        }
      };
    }
  }
  return transporter;
}

async function sendEmail({ to, subject, text, html, attachments }) {
  try {
    const mailer = getTransporter();
    const info = await mailer.sendMail({
      from: `"Sharadha Stores Bulk Portal" <${SMTP_USER || 'no-reply@sharadhastores.com'}>`,
      to,
      subject,
      text,
      html,
      attachments
    });
    return info;
  } catch (error) {
    console.error('Nodemailer Send Mail Error:', error);
    // Don't let email errors break checkout or admin workflow execution
    return { simulated: true, messageId: `error-fallback-id-${Date.now()}` };
  }
}

module.exports = {
  sendEmail
};

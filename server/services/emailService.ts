import nodemailer from 'nodemailer';

export function isEmailConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST?.trim() &&
      process.env.SMTP_USER?.trim() &&
      process.env.SMTP_PASS?.trim()
  );
}

function isDevPreviewEnabled(): boolean {
  const flag = (process.env.SMTP_DEV_PREVIEW ?? 'true').trim().toLowerCase();
  return flag === '' || flag === 'true' || flag === '1' || flag === 'yes';
}

function escapeHtml(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function buildOtpEmail(to: string, name: string, code: string, ttlMinutes: number) {
  return {
    from:
      process.env.SMTP_FROM?.trim() ||
      'Repo2Folio <no-reply@repo2folio.app>',
    to,
    subject: `Your Repo2Folio reset code: ${code}`,
    text: [
      `Hi ${name},`,
      '',
      'We received a request to reset your Repo2Folio password.',
      '',
      `Your verification code is: ${code}`,
      '',
      `This code is valid for ${ttlMinutes} minutes.`,
      'If you did not request a password reset, you can safely ignore this email.',
    ].join('\n'),
    html: `
      <div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;color:#0F172A;">
        <h2 style="margin:0 0 16px;">Reset your password</h2>
        <p>Hi ${escapeHtml(name)},</p>
        <p>We received a request to reset your Repo2Folio password. Use the verification code below to choose a new password.</p>
        <div style="margin:24px 0;text-align:center;">
          <div style="display:inline-block;background:#F1F5F9;border:1px solid #E2E8F0;border-radius:12px;padding:20px 32px;">
            <div style="font-size:12px;color:#64748B;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;">Verification code</div>
            <div style="font-family:'Courier New',monospace;font-size:36px;font-weight:bold;letter-spacing:8px;color:#0F172A;">${escapeHtml(code)}</div>
          </div>
        </div>
        <p style="font-size:12px;color:#475569;">This code is valid for <strong>${ttlMinutes} minutes</strong> and can be used only once.</p>
        <p style="font-size:12px;color:#475569;">If you did not request a password reset, you can safely ignore this email — your current password keeps working.</p>
      </div>
    `,
  };
}

export type PasswordResetEmailResult = 'sent' | 'dev-preview' | 'dev-logged';

interface DevPreviewAccount {
  user: string;
  pass: string;
  smtpHost: string;
  smtpPort: number;
}

let cachedPreviewAccount: DevPreviewAccount | null = null;

async function getEtherealAccount(): Promise<DevPreviewAccount | null> {
  if (cachedPreviewAccount) return cachedPreviewAccount;
  try {
    const testAccount = await nodemailer.createTestAccount();
    cachedPreviewAccount = {
      user: testAccount.user,
      pass: testAccount.pass,
      smtpHost: testAccount.smtp.host,
      smtpPort: testAccount.smtp.port,
    };
    return cachedPreviewAccount;
  } catch (err) {
    console.warn(
      `[password-reset] Could not reach Ethereal Email (offline?). ` +
        `Falling back to console-only logging. Error: ${
          err instanceof Error ? err.message : String(err)
        }`
    );
    return null;
  }
}

export async function sendPasswordResetOtpEmail(
  to: string,
  name: string,
  code: string,
  ttlMinutes: number
): Promise<PasswordResetEmailResult> {
  if (isEmailConfigured()) {
    const port = Number(process.env.SMTP_PORT || 587);
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST!.trim(),
      port,
      secure: port === 465,
      auth: {
        user: process.env.SMTP_USER!.trim(),
        pass: process.env.SMTP_PASS!.trim(),
      },
    });
    await transporter.sendMail(buildOtpEmail(to, name, code, ttlMinutes));
    return 'sent';
  }

  if (isDevPreviewEnabled()) {
    const account = await getEtherealAccount();
    if (account) {
      const transporter = nodemailer.createTransport({
        host: account.smtpHost,
        port: account.smtpPort,
        secure: false,
        auth: { user: account.user, pass: account.pass },
      });
      const info = await transporter.sendMail(
        buildOtpEmail(to, name, code, ttlMinutes)
      );
      console.log(
        `[password-reset] Dev preview OTP email sent to ${to} via Ethereal SMTP.\n` +
          `  Code: ${code} (valid ${ttlMinutes}m)\n` +
          `  Preview URL: ${nodemailer.getTestMessageUrl(info)}`
      );
      return 'dev-preview';
    }
  }

  console.log(
    `[password-reset] SMTP not configured. OTP for ${to} (valid ${ttlMinutes}m): ${code}`
  );
  return 'dev-logged';
}

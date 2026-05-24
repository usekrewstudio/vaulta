import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendOtpEmail(to: string, name: string, otp: string): Promise<void> {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: 'Verify your Vaulta account',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #1D9E75;">Welcome to Vaulta, ${name}!</h2>
        <p>Use the code below to verify your email address. It expires in ${process.env.OTP_EXPIRES_MINUTES ?? 10} minutes.</p>
        <div style="background:#E1F5EE; border-radius:12px; padding:24px; text-align:center; margin:24px 0;">
          <span style="font-size:36px; font-weight:700; letter-spacing:12px; color:#085041;">${otp}</span>
        </div>
        <p style="color:#888; font-size:13px;">If you didn't create a Vaulta account, you can safely ignore this email.</p>
      </div>
    `,
  });
}

export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: 'Your Vaulta account is ready',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #1D9E75;">You're in, ${name}! 🌱</h2>
        <p>Your account is verified. Start building your portfolio today.</p>
        <a href="${process.env.FRONTEND_URL}/dashboard" style="display:inline-block;background:#1D9E75;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:500;margin-top:16px;">Go to Dashboard</a>
      </div>
    `,
  });
}

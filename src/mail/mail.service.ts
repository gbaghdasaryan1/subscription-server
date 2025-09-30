import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { config } from 'dotenv';
config();

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  async sendPasswordReset(email: string, token: string) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    await this.transporter.sendMail({
      from: `"Support" <${process.env.SMTP_FROM}>`,
      to: email,
      subject: 'Password Reset',
      text: `Click here to reset your password: ${resetUrl}`,
      html: `<p>Click here to reset your password: <a href="${resetUrl}">${resetUrl}</a></p>`,
    });
  }

  async sendVerificationCode(email: string, code: string) {
    await this.transporter.sendMail({
      from: `"Support" <${process.env.SMTP_FROM}>`,
      to: email,
      subject: 'Password Reset',
      html: `<p>Your verification code is ${code}`,
    });
  }
}

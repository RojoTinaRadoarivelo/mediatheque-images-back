import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';

@Injectable()
export class SMTPUtil {
  private gmailTransporter: nodemailer.Transporter;
  private smtpTransporter: nodemailer.Transporter;
  private readonly mailhogTransporter: nodemailer.Transporter;

  clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
  clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');
  refreshToken = this.configService.get<string>('GOOGLE_REFRESH_TOKEN');
  redirectUri = this.configService.get<string>('GOOGLE_REDIRECT_URI');
  userEmail = this.configService.get<string>('GOOGLE_EMAIL');

  oAuth2Client = new google.auth.OAuth2(this.clientId, this.clientSecret, this.redirectUri);

  constructor(private readonly configService: ConfigService) {
    this.oAuth2Client.setCredentials({ refresh_token: this.refreshToken });

    this.mailhogTransporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST') || 'localhost',
      port: Number(this.configService.get<string>('SMTP_PORT')) || 1025,
      secure: false,
      tls: {
        rejectUnauthorized: true,
      },
    });
  }

  private async createGmailTransporter(): Promise<nodemailer.Transporter> {
    const tokenResult = await this.oAuth2Client.getAccessToken();
    const accessToken = tokenResult?.token;

    if (!accessToken) {
      throw new Error('No access token available');
    }

    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: this.userEmail,
        clientId: this.clientId,
        clientSecret: this.clientSecret,
        refreshToken: this.refreshToken,
        accessToken,
      },
      tls: {
        rejectUnauthorized: true,
      },
    });
  }

  private createSmtpTransporter(): nodemailer.Transporter {
    const host = this.configService.get<string>('SMTP_HOST') || 'localhost';
    const port = Number(this.configService.get<string>('SMTP_PORT')) || 1025;
    const user = this.configService.get<string>('SMTP_LOGIN') || '';
    const pass = this.configService.get<string>('SMTP_PASS') || '';
    const secure =
      this.configService.get<string>('SMTP_SECURE') === 'true' ||
      this.configService.get<string>('SMTP_SECURE') === '1';

    const auth = user && pass ? { user, pass } : undefined;

    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth,
      tls: {
        rejectUnauthorized: true,
      },
    });
  }

  async sendMail(mailOptions: nodemailer.SendMailOptions): Promise<void> {
    try {
      if (!this.gmailTransporter) {
        this.gmailTransporter = await this.createGmailTransporter();
      }
      await this.gmailTransporter.sendMail(mailOptions);
      console.log('Email sent with Gmail');
      return;
    } catch (err) {
      const e = err as any;
      console.error('Gmail error details:', {
        message: e?.message,
        code: e?.code,
        response: e?.response,
        responseCode: e?.responseCode,
        stack: e?.stack,
      });
      console.warn('Gmail failed, fallback to SMTP');
    }

    try {
      if (!this.smtpTransporter) {
        this.smtpTransporter = this.createSmtpTransporter();
      }
      await this.smtpTransporter.sendMail(mailOptions);
      console.log('Email sent with SMTP');
      return;
    } catch (smtpError) {
      const e = smtpError as any;
      console.error('SMTP error details:', {
        message: e?.message,
        code: e?.code,
        response: e?.response,
        responseCode: e?.responseCode,
        stack: e?.stack,
      });
      console.warn('SMTP failed, fallback to MailHog');
    }

    try {
      await this.mailhogTransporter.sendMail(mailOptions);
      console.log('Email sent with MailHog');
    } catch (mailhogError) {
      console.error('MailHog failed:', mailhogError.message);
      throw mailhogError;
    }
  }

  async sendMailGmailOnly(mailOptions: nodemailer.SendMailOptions): Promise<void> {
    if (!this.gmailTransporter) {
      this.gmailTransporter = await this.createGmailTransporter();
    }
    await this.gmailTransporter.sendMail(mailOptions);
    console.log('Email sent with Gmail (no fallback)');
  }

  CreateMail(
    to: string,
    subject: string,
    html: string,
  ): {
    from: string;
    to: string;
    subject: string;
    html: string;
  } {
    const from = this.configService.get<string>('GOOGLE_EMAIL') || '';
    return {
      from,
      to,
      subject,
      html,
    };
  }
}

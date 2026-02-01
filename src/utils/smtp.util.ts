import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';

@Injectable()
export class SMTPUtil {
  private gmailTransporter: nodemailer.Transporter;
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

  async sendMail(mailOptions): Promise<void> {
    try {
      if (!this.gmailTransporter) {
        this.gmailTransporter = await this.createGmailTransporter();
      }
      await this.gmailTransporter.sendMail(mailOptions);
      console.log('✅ Email envoyé avec Gmail');
    } catch (err) {
      console.warn('⚠️ Gmail a échoué, fallback vers MailHog');
      try {
        await this.mailhogTransporter.sendMail(mailOptions);
        console.log('✅ Email envoyé avec MailHog');
      } catch (mailhogError) {
        console.error('❌ MailHog a aussi échoué :', mailhogError.message);
        throw mailhogError;
      }
    }
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

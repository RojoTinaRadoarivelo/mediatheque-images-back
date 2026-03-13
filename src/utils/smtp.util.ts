import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
// Gmail OAuth2 disabled (Proton Mail used via SMTP)
// import { google } from 'googleapis';

@Injectable()
export class SMTPUtil {
  // Gmail OAuth2 disabled (Proton Mail used via SMTP)
  // private gmailTransporter: nodemailer.Transporter;
  private brevoTransporter: nodemailer.Transporter;
  private smtpTransporter: nodemailer.Transporter;
  private readonly mailhogTransporter: nodemailer.Transporter;

  // Gmail OAuth2 config (disabled)
  // clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
  // clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');
  // refreshToken = this.configService.get<string>('GOOGLE_REFRESH_TOKEN');
  // redirectUri = this.configService.get<string>('GOOGLE_REDIRECT_URI');
  // userEmail = this.configService.get<string>('GOOGLE_EMAIL');

  // Gmail OAuth2 client (disabled)
  // oAuth2Client = new google.auth.OAuth2(this.clientId, this.clientSecret, this.redirectUri);

  constructor(private readonly configService: ConfigService) {
    // Gmail OAuth2 credentials disabled
    // this.oAuth2Client.setCredentials({ refresh_token: this.refreshToken });

    this.mailhogTransporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAILHOG_HOST') || 'localhost',
      port: Number(this.configService.get<string>('MAILHOG_PORT')) || 1025,
      secure: false,
      tls: {
        rejectUnauthorized: true,
      },
    });
  }

  // Gmail OAuth2 disabled
  // private async createGmailTransporter(): Promise<nodemailer.Transporter> { ... }
  // like
  //  nodemailer.createTransport({
  //    service: 'gmail',
  //    auth: {
  //      type: 'OAuth2',
  //      user: this.userEmail,
  //      clientId: this.clientId,
  //      clientSecret: this.clientSecret,
  //      refreshToken: this.refreshToken,
  //      accessToken,
  //    },
  //    tls: {
  //      rejectUnauthorized: true,
  //    },
  //  })
  // private isGmailConfigured(): boolean { ... }

  private getProvider(): 'smtp' | 'mailhog' | 'fallback' {
    const provider = (this.configService.get<string>('SMTP_PROVIDER') || 'fallback').toLowerCase();
    if (provider === 'smtp' || provider === 'mailhog') {
      return provider;
    }
    return 'fallback';
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

  private createBrevoTransporter(): nodemailer.Transporter {
    const host = this.configService.get<string>('BREVO_SMTP_HOST') || 'smtp-relay.brevo.com';
    const port = Number(this.configService.get<string>('BREVO_SMTP_PORT')) || 587;
    const user = this.configService.get<string>('BREVO_SMTP_LOGIN') || '';
    const pass = this.configService.get<string>('BREVO_SMTP_PASS') || '';
    const secure =
      this.configService.get<string>('BREVO_SMTP_SECURE') === 'true' ||
      this.configService.get<string>('BREVO_SMTP_SECURE') === '1';

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
    const provider = this.getProvider();
    if (provider === 'smtp') {
      await this.sendMailSmtpOnly(mailOptions);
      return;
    }
    if (provider === 'mailhog') {
      await this.sendMailMailhogOnly(mailOptions);
      return;
    }

    // Gmail OAuth2 disabled: fallback goes directly to Brevo, then Resend (SMTP), then MailHog

    try {
      if (!this.brevoTransporter) {
        this.brevoTransporter = this.createBrevoTransporter();
      }
      // Override from address for Brevo
      const brevoMailOptions = {
        ...mailOptions,
        from: this.configService.get<string>('BREVO_SMTP_FROM') || mailOptions.from,
      };
      await this.brevoTransporter.sendMail(brevoMailOptions);
      console.log('Email sent with Brevo');
      return;
    } catch (brevoError) {
      const e = brevoError as any;
      console.error('Brevo error details:', {
        message: e?.message,
        code: e?.code,
      });
      console.warn('Brevo failed, fallback to Resend (SMTP)');
    }

    try {
      if (!this.smtpTransporter) {
        this.smtpTransporter = this.createSmtpTransporter();
      }
      await this.smtpTransporter.sendMail(mailOptions);
      console.log('Email sent with Resend (SMTP)');
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

  async sendMailSmtpOnly(mailOptions: nodemailer.SendMailOptions): Promise<void> {
    if (!this.smtpTransporter) {
      this.smtpTransporter = this.createSmtpTransporter();
    }
    await this.smtpTransporter.sendMail(mailOptions);
    console.log('Email sent with SMTP (no fallback)');
  }

  async sendMailMailhogOnly(mailOptions: nodemailer.SendMailOptions): Promise<void> {
    await this.mailhogTransporter.sendMail(mailOptions);
    console.log('Email sent with MailHog (no fallback)');
  }

  // Gmail OAuth2 disabled
  // async sendMailGmailOnly(mailOptions: nodemailer.SendMailOptions): Promise<void> { ... }

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
    const from =
      this.configService.get<string>('SMTP_FROM') ||
      // this.configService.get<string>('GOOGLE_EMAIL') ||
      '';
    return {
      from,
      to,
      subject,
      html,
    };
  }
}

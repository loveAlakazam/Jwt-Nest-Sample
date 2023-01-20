import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, UseFilters } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpExceptionFilter } from '../error/http-exception.filter';

@UseFilters(new HttpExceptionFilter())
@Injectable()
export class EmailService {
  constructor(
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService,
  ) {}

  async sendHello(): Promise<boolean> {
    await this.mailerService
      .sendMail({
        to: 'dmsrkd1216@gmail.com',
        from: 'noreply@gmail.com',
        subject: 'Hello',
        text: 'hello World',
        html: `<b>Hello World</b>`,
      })
      .then((result) => {
        console.log(result);
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });
    return true;
  }
}

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
        to: 'ekk12mv2@gmail.com',
        from: 'noreply@gmail.com',
        subject: 'Hello test',
        text: 'hello World!!!',
        html: `<b>hello~~~</b>`,
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

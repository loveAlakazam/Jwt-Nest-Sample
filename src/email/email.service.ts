import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, UseFilters } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpExceptionFilter } from '../error/http-exception.filter';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { ReceiveEmailRequestDto } from './dto/receive-email-request.dto';

@UseFilters(new HttpExceptionFilter())
@Injectable()
export class EmailService {
  constructor(
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async sendHello(requestDto: ReceiveEmailRequestDto) {
    try {
      await this.mailerService
        .sendMail({
          to: requestDto.email,
          from: 'noreply@gmail.com',
          subject: 'Hello test',
          text: 'hello World!!!',
          html: `<b>${requestDto.content} hello~~~</b>`,
        })
        .then((result) => {
          return true;
        })
        .catch((error) => {
          console.error(error);
          throw error;
        });
      return true;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  @OnEvent('mail_greeting_newbie', { async: true })
  public async handleMailGreetingNewbie() {
    // 가입자에게 이메일 전송한다.
    return;
  }
}

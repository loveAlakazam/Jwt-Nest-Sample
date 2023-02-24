import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger, UseFilters } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpExceptionFilter } from '../error/http-exception.filter';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { SendEmailByNodemailerRequestDto } from './dto/send-email-by-nodemailer-request.dto';
import { SendEmailBySesRequestDto } from './dto/send-email-by-ses-request.dto';
import { UserGeneratedEvent } from 'src/events/user-generated.event';
import { EmailTemplate } from './emailTemplate/email-template';
import { AppService } from 'src/app.service';

@UseFilters(new HttpExceptionFilter())
@Injectable()
export class EmailService {
  private readonly logger = new Logger(AppService.name);
  private sesClient: SESClient;

  constructor(
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.sesClient = new SESClient({
      region: 'ap-northeast-2',
      credentials: {
        accessKeyId: this.configService.get('AWS_SES_ACCESS_ID'),
        secretAccessKey: this.configService.get('AWS_SES_ACCESS_SECRET'),
      },
    });
  }

  // AWS SES로 메일 전송하기
  async sendMailBySES(requestDto: SendEmailBySesRequestDto) {
    try {
      const command = new SendEmailCommand({
        // 받는사람
        Destination: {
          CcAddresses: [],
          ToAddresses: [requestDto.email],
        },
        // 메일 메시지
        Message: {
          // 메일 제목
          Subject: {
            Charset: 'UTF-8',
            Data: requestDto.subject,
          },
          // 메일 본문
          Body: {
            Text: {
              Charset: 'UTF-8',
              Data: requestDto.mailBody,
            },
          },
        },
        Source: 'busybe@yopmail.com',
        ReplyToAddresses: [],
      });
      await this.sesClient.send(command);
    } catch (error) {
      throw error;
    }
  }

  //gmail계정으로  Nodemailer로 메일 전송하기
  async sendMailByNodemailer(requestDto: SendEmailByNodemailerRequestDto) {
    try {
      return await this.mailerService.sendMail({
        to: requestDto.email,
        from: 'noreply@gmail.com',
        subject: requestDto.title,
        text: `${requestDto.content}`,
        html: `${requestDto.content}`,
      });
    } catch (error) {
      throw error;
    }
  }

  async sendHello(requestDto: SendEmailByNodemailerRequestDto) {
    try {
      await this.mailerService
        .sendMail({
          to: requestDto.email,
          // from: 'noreply@gmail.com',
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
      throw error;
    }
  }

  @OnEvent('user.generated', { async: true })
  public async welcomeUserGenerated(requestDto: UserGeneratedEvent) {
    // 가입자에게 이메일 전송한다.
    const { title, content } = EmailTemplate.GREET_NEWBIE(requestDto.name);

    await this.sendMailBySES({
      email: requestDto.email,
      subject: title,
      mailBody: content,
    });

    this.logger.log(`Send mail to new user (${requestDto.email})`);
  }
}

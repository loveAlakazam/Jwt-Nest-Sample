import { Injectable, Logger, UseFilters } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TwilioService } from 'nestjs-twilio';
import { SendSMSRequestDto } from './dto/send-sms-request.dto';
import { AppService } from '../app.service';
import { HttpExceptionFilter } from '../error/http-exception.filter';

@UseFilters(new HttpExceptionFilter())
@Injectable()
export class SmsService {
  constructor(
    private readonly configService: ConfigService,
    private readonly twilioService: TwilioService,
  ) {}

  private readonly logger = new Logger(AppService.name);

  async sendSMS(requestDto: SendSMSRequestDto) {
    try {
      return await this.twilioService.client.messages.create({
        from: requestDto.sender,
        to: requestDto.receiver,
        body: requestDto.content,
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

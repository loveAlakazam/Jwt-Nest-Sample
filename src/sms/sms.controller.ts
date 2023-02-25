import { Controller, HttpCode, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { SmsService } from './sms.service';
import { ApiOperation } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

@Controller('sms')
export class SmsController {
  constructor(
    private readonly smsService: SmsService,
    private readonly configService: ConfigService,
  ) {}

  @ApiOperation({
    summary: 'SMS 전송',
  })
  @HttpCode(201)
  @Post()
  async sendSMS(@Req() req: Request, @Res() res: Response) {
    const { content, receiver } = req.body;

    if (content && receiver) {
      await this.smsService.sendSMS({
        content: content,
        receiver: receiver,
        sender: '+12764966967',
      });

      return res.status(201).json({ message: 'sms 전송 성공' });
    }

    return res
      .status(400)
      .json({ message: 'sms내용과 수신자중 하나가 누락되었습니다.' });
  }
}

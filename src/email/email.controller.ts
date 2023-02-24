import { Request, Response } from 'express';
import { Controller, Get, HttpCode, Post, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('email')
@Controller('email')
export class EmailController {
  constructor(
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  @ApiOperation({
    summary: '메일전송 테스트',
  })
  @HttpCode(201)
  @Post('test')
  async testEmail(@Req() req: Request, @Res() res: Response) {
    // await this.emailService.sendMailByNodemailer({
    //   title: '테스트 이메일 제목',
    //   content: '이메일전송',
    //   ...req.body,
    // });

    await this.emailService.sendMailBySES({
      subject: 'aws 테스트 이메일 전송',
      mailBody: '이메일 전송완료했습니다.',
      ...req.body,
    });
    return res.status(201).json({ message: '이메일 전송 완료' });
  }

  @ApiOperation({
    summary: '이메일 인증번호 인증',
  })
  @Post('auth')
  async authenticateByEmail() {
    return;
  }

  @ApiOperation({
    summary: '이메일 비밀번호 변경',
  })
  @Post('password')
  async updatePasswordByEmail() {
    return;
  }
}

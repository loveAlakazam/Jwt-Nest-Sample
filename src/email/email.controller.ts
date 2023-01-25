import { Controller, Get, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';
import { ApiOperation } from '@nestjs/swagger';

@Controller('email')
export class EmailController {
  constructor(
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  @ApiOperation({
    summary: '메일전송 테스트',
  })
  @Get('test')
  async testEmail() {
    return await this.emailService.sendHello();
  }

  @ApiOperation({
    summary: '이메일 인증번호 인증',
  })
  @Post('auth')
  async authenticateByEmail() {
    return;
  }
}

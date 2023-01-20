import { Controller } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';

@Controller()
export class EmailController {
  constructor(
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}
}

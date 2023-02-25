import { Module } from '@nestjs/common';
import { SmsService } from './sms.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TwilioModule } from 'nestjs-twilio';
import { SmsController } from './sms.controller';

@Module({
  imports: [
    ConfigModule,
    TwilioModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        accountSid: configService.get('TWILIOW_ACCOUNT_SID'),
        authToken: configService.get('TWILIOW_AUTH_TOKEN'),
      }),
    }),
  ],
  controllers: [SmsController],
  providers: [SmsService],
  exports: [SmsService, TwilioModule],
})
export class SmsModule {}

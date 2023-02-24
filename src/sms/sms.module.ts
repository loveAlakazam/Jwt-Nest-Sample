import { Module } from '@nestjs/common';
import { SmsService } from './sms.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TwilioModule } from 'nestjs-twilio';

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
  providers: [SmsService],
  exports: [SmsService],
})
export class SmsModule {}

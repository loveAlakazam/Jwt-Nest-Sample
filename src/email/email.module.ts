import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

import { EmailController } from './email.controller';
import { EmailService } from './email.service';

@Module({
  imports: [
    ConfigModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('MAILER_HOST'),
          port: 587, // Single Connection
          secure: false, // Use TLS
          auth: {
            user: configService.get<string>('MAILER_USER'),
            pass: configService.get<string>('MAILER_PWD'),
          },
        },
        defaults: {
          from: '"No-Reply" <no-reply@localhost>',
        },
        preview: false, // true로 하면 메일 전송을 요청할때마다 보낸 내용을 브라우저에서 확인할 수 있다.
        template: {
          dir: __dirname + '/templates',
          adapter: new HandlebarsAdapter(), // Handlebars 이메일 내용 포맷을 담당하는 객체를 넣는다.
          options: {
            strict: true,
          },
        },
      }),
    }),
  ],
  controllers: [EmailController],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}

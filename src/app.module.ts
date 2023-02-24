import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppService } from './app.service';
import { MysqlConfigModule } from './mysql/mysql.config.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MysqlConfigService } from './mysql/mysql.config.service';
import { HttpExceptionFilter } from './error/http-exception.filter';
import { EmailModule } from './email/email.module';
import * as Joi from 'joi';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { CacheModule } from './redis/cache.module';
import { RedisConfigService } from './redis/redis.config.service';
import { SmsModule } from './sms/sms.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
      validationSchema: Joi.object({
        SERVER_PORT: Joi.number().default(3000).required(),
        NODE_ENV: Joi.string().required(),
        /* MYSQL */
        MYSQL_HOST: Joi.string().required(),
        MYSQL_PORT: Joi.number().required(),
        MYSQL_USERNAME: Joi.string().required(),
        MYSQL_PASSWORD: Joi.string().required(),
        MYSQL_DATABASE: Joi.string().required(),
        /* JWT */
        JWT_ACCESS_TOKEN_SECRET: Joi.string().required(),
        JWT_ACCESS_EXPIRATION_TIME: Joi.string().required(),
        JWT_REFRESH_TOKEN_SECRET: Joi.string().required(),
        JWT_REFRESH_EXPIRATION_TIME: Joi.string().required(),

        /** Redis */
        REDIS_HOST: Joi.string().required(),
        REDIS_PORT: Joi.number().required(),

        /**Node-Mailer-google */
        MAILER_HOST: Joi.string(),
        MAILER_USER: Joi.string(),
        MAILER_PWD: Joi.string(),

        /** AWS-SES */
        AWS_SES_REGION: Joi.string().required(),
        AWS_SES_ACCESS_ID: Joi.string().required(),
        AWS_SES_ACCESS_SECRET: Joi.string().required(),

        /**Twillow -SMS API */
        TWILIOW_ACCOUNT_SID: Joi.string().required(),
        TWILIOW_AUTH_TOKEN: Joi.string().required(),
        TWILIOW_PHONE_NUMBER: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRootAsync({
      imports: [MysqlConfigModule],
      useClass: MysqlConfigService,
    }),
    AuthModule,
    UsersModule,
    EmailModule,
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      useClass: RedisConfigService,
      inject: [ConfigService],
    }),
    CacheModule,
    SmsModule,
  ],
  controllers: [],
  providers: [
    AppService,
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
})
export class AppModule {}
